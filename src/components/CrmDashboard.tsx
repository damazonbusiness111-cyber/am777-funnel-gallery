"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Application = {
  Timestamp: string;
  Name: string;
  Email: string;
  Experience: string;
  "Learning Style": string;
  Goals: string;
  Direction: string;
};

type Tab = "applications" | "overview";

const EXPERIENCE_LABEL: Record<string, string> = {
  new: "New to AI",
  some: "Some experience",
  experienced: "Experienced",
};

const LEARNING_LABEL: Record<string, string> = {
  "self-paced": "Self-paced lessons",
  guided: "Guided cohort",
  "hands-on": "Hands-on projects",
  community: "Community discussion",
};

function tally(rows: Application[], key: keyof Application, labels: Record<string, string>) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row[key] || "unspecified";
    const label = labels[raw] || raw;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

export default function CrmDashboard() {
  const [tab, setTab] = useState<Tab>("applications");
  const [rows, setRows] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_INFRAMIND_FORM_ENDPOINT;
    const secret = process.env.NEXT_PUBLIC_INFRAMIND_FORM_SECRET;
    if (!endpoint) {
      setError("NEXT_PUBLIC_INFRAMIND_FORM_ENDPOINT is not set.");
      return;
    }
    const url = secret ? `${endpoint}?secret=${encodeURIComponent(secret)}` : endpoint;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Request failed");
        setRows(data.rows as Application[]);
      })
      .catch((err) => setError(String(err)));
  }, []);

  const sortedRows = useMemo(
    () => (rows ? [...rows].sort((a, b) => (a.Timestamp < b.Timestamp ? 1 : -1)) : []),
    [rows]
  );
  const experienceTally = useMemo(() => tally(sortedRows, "Experience", EXPERIENCE_LABEL), [sortedRows]);
  const learningTally = useMemo(
    () => tally(sortedRows, "Learning Style", LEARNING_LABEL),
    [sortedRows]
  );

  return (
    <section className="min-h-screen bg-midnight px-5 py-10 font-mono sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold-hi/70">Free AI Starter Program</p>
        <h1 className="mt-2 text-2xl font-bold text-ivory sm:text-3xl">InfraMind777 Applications</h1>

        <div className="mt-6 flex gap-2 border-b border-gold/20">
          {(["applications", "overview"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="relative px-4 py-2.5 text-xs uppercase tracking-[0.08em] text-parchment/60 transition-colors data-[active=true]:text-gold-hi"
              data-active={tab === t}
            >
              {t === "applications" ? "Applications" : "Overview"}
              {tab === t && (
                <motion.div
                  layoutId="crm-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-gold"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-gold/20 bg-deep-navy px-4 py-3 text-xs text-parchment/70">
            {error}
          </p>
        )}

        {!error && rows === null && (
          <p className="mt-6 text-xs text-parchment/50">Loading applications…</p>
        )}

        {!error && rows !== null && (
          <AnimatePresence mode="wait">
            {tab === "applications" ? (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-5"
              >
                {sortedRows.length === 0 ? (
                  <p className="text-xs text-parchment/50">No applications yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gold/20">
                    <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-gold/20 bg-deep-navy text-gold-hi/80">
                          {["Timestamp", "Name", "Email", "Experience", "Learning Style", "Goals", "Direction"].map(
                            (h) => (
                              <th key={h} className="px-3 py-2.5 font-normal uppercase tracking-[0.06em]">
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRows.map((row, i) => (
                          <tr key={i} className="border-b border-gold/10 text-parchment/80">
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-parchment/50">
                              {row.Timestamp ? new Date(row.Timestamp).toLocaleString() : ""}
                            </td>
                            <td className="px-3 py-2.5">{row.Name}</td>
                            <td className="px-3 py-2.5">{row.Email}</td>
                            <td className="px-3 py-2.5">{EXPERIENCE_LABEL[row.Experience] || row.Experience}</td>
                            <td className="px-3 py-2.5">
                              {LEARNING_LABEL[row["Learning Style"]] || row["Learning Style"]}
                            </td>
                            <td className="max-w-[16rem] px-3 py-2.5">{row.Goals}</td>
                            <td className="max-w-[16rem] px-3 py-2.5">{row.Direction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div className="rounded-xl border border-gold/20 bg-deep-navy p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-hi/70">Total applications</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-ivory">{sortedRows.length}</p>
                </div>

                <div className="rounded-xl border border-gold/20 bg-deep-navy p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-hi/70">By experience</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {experienceTally.length === 0 && <p className="text-xs text-parchment/40">No data yet</p>}
                    {experienceTally.map(([label, count]) => (
                      <BarRow key={label} label={label} count={count} max={sortedRows.length} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gold/20 bg-deep-navy p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-hi/70">By learning style</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {learningTally.length === 0 && <p className="text-xs text-parchment/40">No data yet</p>}
                    {learningTally.map(([label, count]) => (
                      <BarRow key={label} label={label} count={count} max={sortedRows.length} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-parchment/70">
        <span>{label}</span>
        <span className="tabular-nums text-parchment/50">{count}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gold/[0.14]">
        <motion.div
          className="h-full rounded-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
