"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, type Field } from "@/lib/schema";

type Values = Record<string, string>;

interface Props {
  region: string;
  token?: string; // present when resuming
  initial?: Values; // values loaded from the server when resuming
}

const LS_KEY = "bvf-application-draft";

export function ApplicationForm({ region, token: initialToken, initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(() => initial || {});
  const [token, setToken] = useState<string | undefined>(initialToken);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const dirty = useRef(false);

  // Restore a local draft if we are not resuming from the server.
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

  // Mirror to localStorage on every change.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ token, values }));
    } catch {
      /* ignore */
    }
  }, [token, values]);

  const section = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;

  const save = useCallback(
    async (status?: "Submitted") => {
      setSaving("saving");
      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, region, values, status }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { token: string; resumeUrl: string; emailed: boolean };
        setToken(data.token);
        if (!data.emailed) setResumeLink(data.resumeUrl);
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

  // Debounced background save while typing.
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

  function validate(fields: Field[]): boolean {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.key] || "").trim();
      if (f.required && !v) next[f.key] = "Required";
      else if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) next[f.key] = "Enter a valid email address";
      else if (f.type === "url" && v && !/^https?:\/\//i.test(v) && !/^[\w.-]+\.[a-z]{2,}/i.test(v)) next[f.key] = "Enter a valid link";
      else if (f.maxLength && v.length > f.maxLength) next[f.key] = `Keep this under ${f.maxLength} characters`;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      const first = document.getElementById(`f-${Object.keys(next)[0]}`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  async function next() {
    if (!validate(section.fields)) return;
    try {
      await save();
    } catch {
      /* continue anyway; local draft is kept */
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    // Validate every section, jump to the first one with a problem.
    for (let i = 0; i < SECTIONS.length; i++) {
      const ok = validateSilently(SECTIONS[i].fields);
      if (!ok) {
        setStep(i);
        validate(SECTIONS[i].fields);
        return;
      }
    }
    setSubmitting(true);
    try {
      await save("Submitted");
      localStorage.removeItem(LS_KEY);
      router.push("/apply/thanks");
    } catch {
      setSubmitting(false);
    }
  }

  function validateSilently(fields: Field[]): boolean {
    return fields.every((f) => {
      const v = (values[f.key] || "").trim();
      if (f.required && !v) return false;
      if (f.maxLength && v.length > f.maxLength) return false;
      return true;
    });
  }

  const savingLabel = useMemo(() => {
    if (saving === "saving") return "Saving…";
    if (saving === "saved") return "Saved";
    if (saving === "error") return "Could not save — your draft is kept in this browser";
    return "";
  }, [saving]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div className="steps" style={{ flex: 1, maxWidth: 320 }} aria-label={`Step ${step + 1} of ${SECTIONS.length}`}>
          {SECTIONS.map((s, i) => (
            <span key={s.id} className={i <= step ? "on" : ""} />
          ))}
        </div>
        <span className="small muted">
          Step {step + 1} of {SECTIONS.length} · {section.title}
        </span>
      </div>

      {resumeLink && (
        <div className="notice">
          Your draft is saved. To return to it later from any device, keep this link:{" "}
          <a href={resumeLink}>{resumeLink}</a>
        </div>
      )}

      <div className="panel">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 style={{ fontSize: 28 }}>{section.title}</h2>
          {section.intro && <p className="body">{section.intro}</p>}
          {step === 0 && (
            <p className="small muted">
              Region: {region}. {" "}
              <a href="/#apply">Change</a>
            </p>
          )}
        </div>

        {section.fields.map((f) => (
          <FieldInput key={f.key} field={f} value={values[f.key] || ""} onChange={(v) => set(f.key, v)} error={errors[f.key]} />
        ))}

        <div className="form-footer">
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            {!isLast ? (
              <button type="button" className="btn btn-ink" onClick={next}>
                Continue
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

function FieldInput({ field, value, onChange, error }: { field: Field; value: string; onChange: (v: string) => void; error?: string }) {
  const id = `f-${field.key}`;
  const label = (
    <>
      {field.label}
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
        {field.help && <span className="help">{field.help}</span>}
        {error && <span className="error">{error}</span>}
      </fieldset>
    );
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {field.type === "textarea" ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={4} />
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
      {field.maxLength && (
        <span className="counter" style={{ color: value.length > field.maxLength ? "#b42318" : undefined }}>
          {value.length} / {field.maxLength}
        </span>
      )}
      {field.help && <span className="help">{field.help}</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
