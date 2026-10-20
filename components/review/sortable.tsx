"use client";

import { useMemo, useState } from "react";

export type Dir = "asc" | "desc";

// Small helper for sortable table headers. Click a header to sort; click
// again to flip. Nulls always sort to the bottom.
export function useSort<T>(rows: T[], initialKey: string, initialDir: Dir, get: (row: T, key: string) => string | number | null) {
  const [key, setKey] = useState(initialKey);
  const [dir, setDir] = useState<Dir>(initialDir);

  const sorted = useMemo(() => {
    const out = [...rows].sort((a, b) => {
      const va = get(a, key);
      const vb = get(b, key);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), undefined, { sensitivity: "base" });
      return dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, key, dir, get]);

  function toggle(k: string, defaultDir: Dir = "asc") {
    if (k === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setKey(k);
      setDir(defaultDir);
    }
  }

  return { sorted, key, dir, toggle };
}

export function Th({ id, label, sortKey, dir, onSort, numeric = false, style }: { id: string; label: string; sortKey: string; dir: Dir; onSort: (k: string, d?: Dir) => void; numeric?: boolean; style?: React.CSSProperties }) {
  const active = sortKey === id;
  return (
    <th style={style} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="th-btn" onClick={() => onSort(id, numeric ? "desc" : "asc")}>
        {label}
        <span className="th-arrow" aria-hidden="true">{active ? (dir === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}
