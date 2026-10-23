"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, fill, ctxFrom, isVisible, labelFor, type Field, formatMoneyInput } from "@/lib/schema";
import { Avatar } from "./Avatar";

type Values = Record<string, string>;

interface Props {
  region: string;
  token?: string; // present when resuming
  initial?: Values; // values loaded from the server when resuming
}

const LS_KEY = "bvf-application-draft";
const PREVIEW_KEY = "Headshot Preview"; // local-only data URL, never sent to the server

export function ApplicationForm({ region, token: initialToken, initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(() => initial || {});
  const [token, setToken] = useState<string | undefined>(initialToken);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (initial) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { token?: string; values?: Values };
        if (d.values) setValues(d.values);
        if (d.token && !token) setToken(d.token);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ token, values }));
    } catch {
      /* ignore */
    }
  }, [token, values]);

  const section = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;
  const ctx = useMemo(() => ctxFrom(values), [values]);
  const avatarSrc = values["Headshot"] || values[PREVIEW_KEY];

  const save = useCallback(
    async (status?: "Submitted") => {
      setSaving("saving");
      try {
        const payload: Values = { ...values };
        delete payload[PREVIEW_KEY];
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, region, values: payload, status }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { token: string; resumeUrl: string };
        setToken(data.token);
        setResumeLink(data.resumeUrl);
        setSaving("saved");
        dirty.current = false;
        return data;
      } catch (e) {
        console.error(e);
        setSaving("error");
        throw e;
      }
    },
    [token, region, values],
  );

  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => {
      save().catch(() => {});
    }, 2500);
    return () => clearTimeout(t);
  }, [values, save]);

  function set(key: string, v: string) {
    dirty.current = true;
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    // Local preview immediately (downscaled so it fits in localStorage).
    const dataUrl = await downscale(file, 320);
    setValues((prev) => ({ ...prev, [PREVIEW_KEY]: dataUrl }));
    // Try to upload for the reviewers; silently keep the preview if uploads aren't configured.
    try {
      const fd = new FormData();
      fd.append("file", await dataUrlToFile(dataUrl, file.name));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = (await res.json()) as { url: string };
        set("Headshot", url);
      }
    } catch {
      /* preview only */
    }
  }

  function validate(fields: Field[]): boolean {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.key] || "").trim();
      if (f.type === "image" || !isVisible(f, values)) continue;
      if (f.required && !v) next[f.key] = "Required";
      else if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) next[f.key] = "Enter a valid email address";
      else if (f.type === "url" && v && !/^https?:\/\//i.test(v) && !/^[\w.-]+\.[a-z]{2,}/i.test(v)) next[f.key] = "Enter a valid link";
      else if (f.type === "money" && v && !/^\d+$/.test(v)) next[f.key] = "Enter a dollar amount, numbers only";
      else if (f.maxLength && v.length > f.maxLength) next[f.key] = `Keep this under ${f.maxLength} characters`;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`f-${Object.keys(next)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function validateSilently(fields: Field[]): boolean {
    return fields.every((f) => {
      if (f.type === "image" || !isVisible(f, values)) return true;
      const v = (values[f.key] || "").trim();
      if (f.required && !v) return false;
      if (f.maxLength && v.length > f.maxLength) return false;
      return true;
    });
  }

  async function next() {
    if (!validate(section.fields)) return;
    try {
      await save();
    } catch {
      /* local draft is kept */
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    for (let i = 0; i < SECTIONS.length; i++) {
      if (!validateSilently(SECTIONS[i].fields)) {
        setStep(i);
        setTimeout(() => validate(SECTIONS[i].fields), 0);
        return;
      }
    }
    setSubmitting(true);
    try {
      await save("Submitted");
      localStorage.removeItem(LS_KEY);
      router.push(`/apply/thanks?first=${encodeURIComponent(ctx.first)}&company=${encodeURIComponent(ctx.company)}`);
    } catch {
      setSubmitting(false);
    }
  }

  const savingLabel = saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : saving === "error" ? "Could not save — your draft is kept in this browser" : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Identity strip: who this application is for, once we know. */}
      <div className="identity">
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Avatar src={avatarSrc} name={values["Name"]} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {values["Name"] || "Your application"}
            </div>
            <div className="small muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {[values["Company"], region].filter(Boolean).join(" · ")}
              {!values["Company"] && (
                <>
                  {" "}
                  <a href="/#apply">Change region</a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="steps-labeled" aria-label={`Step ${step + 1} of ${SECTIONS.length}`}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i < step ? "done" : i === step ? "on" : ""}
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="bar" />
              <span className="lbl">{fill(s.short, ctx)}</span>
            </button>
          ))}
        </div>
      </div>

      {step > 0 && resumeLink && (
        <div className="notice" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
          <span>Your draft is saved in this browser. To finish from another device, keep your private link.</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              await navigator.clipboard.writeText(resumeLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}

      <div className="panel">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: 30, lineHeight: 1.15 }}>{fill(section.title, ctx)}</h2>
          {section.intro && <p className="body">{fill(section.intro, ctx)}</p>}
        </div>

        {section.fields.filter((f) => isVisible(f, values)).map((f) =>
          f.type === "image" ? (
            <PhotoField key={f.key} field={f} src={avatarSrc} name={values["Name"]} onPick={onPhoto} onClear={() => setValues((p) => ({ ...p, Headshot: "", [PREVIEW_KEY]: "" }))} />
          ) : (
            <FieldInput key={f.key} field={f} ctx={ctx} values={values} value={values[f.key] || ""} onChange={(v) => set(f.key, v)} error={errors[f.key]} />
          ),
        )}

        <div className="form-footer">
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => { setStep((s) => s - 1); window.scrollTo({ top: 0 }); }}>
                Back
              </button>
            )}
            {!isLast ? (
              <button type="button" className="btn btn-ink" onClick={next}>
                {step === 0 ? "Continue" : `Next: ${fill(SECTIONS[step + 1].short, ctx)}`}
              </button>
            ) : (
              <button type="button" className="btn btn-ink" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            )}
          </div>
          <span className="saving">{savingLabel}</span>
        </div>
      </div>
    </div>
  );
}

function PhotoField({ field, src, name, onPick, onClear }: { field: Field; src?: string; name?: string; onPick: (f: File | null) => void; onClear: () => void }) {
  const id = `f-${field.key}`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {field.label} <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar src={src} name={name} size={64} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            {src ? "Change photo" : "Upload a photo"}
            <input id={id} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPick(e.target.files?.[0] || null)} />
          </label>
          {src && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>Remove</button>
          )}
        </div>
      </div>
      {field.help && <span className="help">{field.help}</span>}
    </div>
  );
}

function FieldInput({ field, ctx, values, value, onChange, error }: { field: Field; ctx: { first: string; company: string }; values: Values; value: string; onChange: (v: string) => void; error?: string }) {
  const id = `f-${field.key}`;
  const chosen = labelFor(field, values);
  const labelText = fill(chosen.label, ctx);
  const help = chosen.help ? fill(chosen.help, ctx) : undefined;
  const label = (
    <>
      {labelText}
      {field.required ? <span style={{ color: "var(--accent)" }}> *</span> : <span className="muted" style={{ fontWeight: 400 }}> (optional)</span>}
    </>
  );

  if (field.type === "radio" && field.options) {
    return (
      <fieldset className="field" id={id}>
        <legend>{label}</legend>
        <div className="choices" style={{ gridTemplateColumns: `repeat(${Math.min(field.options.length, 3)}, minmax(0, 1fr))` }}>
          {field.options.map((o) => (
            <label key={o} className={`choice ${value === o ? "on" : ""}`}>
              <input type="radio" name={field.key} value={o} checked={value === o} onChange={() => onChange(o)} />
              {o}
            </label>
          ))}
        </div>
        {help && <span className="help">{help}</span>}
        {error && <span className="error">{error}</span>}
      </fieldset>
    );
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {field.type === "textarea" ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={4} />
      ) : field.type === "money" ? (
        <div className="money">
          <span className="money-prefix">$</span>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            value={formatMoneyInput(value)}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder={field.placeholder}
          />
        </div>
      ) : (
        <input
          id={id}
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          inputMode={field.type === "url" ? "url" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength ? field.maxLength + 40 : undefined}
        />
      )}
      {(help || field.maxLength) && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <span className="help">{help}</span>
          {field.maxLength && (
            <span className="counter" style={{ flex: "0 0 auto", color: value.length > field.maxLength ? "#b42318" : undefined }}>
              {value.length} / {field.maxLength}
            </span>
          )}
        </div>
      )}
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// Resize an image file to a square-ish JPEG data URL so previews stay small.
function downscale(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = max;
      canvas.height = max;
      canvas.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, max, max);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}
