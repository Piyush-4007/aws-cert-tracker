"use client";

import { useRef, useState } from "react";
import { SyncLine } from "@/components/AccountMenu";
import { allItemIds, certifications, postExamIds, roadmap } from "@/lib/roadmap";
import { exportState, importState, resetAll } from "@/lib/store";
import { signInWithGoogle } from "@/lib/sync";
import { tally, useProgress } from "@/lib/useProgress";
import { useSync } from "@/lib/useSync";

type Notice = { tone: "ok" | "bad"; text: string } | null;

export default function DataPage() {
  const state = useProgress();
  const sync = useSync();
  const [notice, setNotice] = useState<Notice>(null);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const study = tally(allItemIds, state.checked);
  const post = tally(postExamIds, state.checked);

  const download = () => {
    const payload = { ...exportState(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `aws-cert-progress-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice({ tone: "ok", text: `Exported ${study.done} ticked items.` });
  };

  const onFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const before = study.done;
      importState(parsed);
      const after = tally(allItemIds, exportState().checked).done;
      setNotice({
        tone: "ok",
        text: `Imported ${file.name} — ${after} items ticked (was ${before}).`,
      });
    } catch {
      setNotice({ tone: "bad", text: "That file isn't valid progress JSON. Nothing changed." });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-16">
      <div className="rise">
        <p className="meta">Backup</p>
        <h1 className="serif mt-4 text-[2rem] font-medium sm:text-[2.5rem]">Progress data</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          {sync.status === "disabled"
            ? "Everything lives in this browser's localStorage. Clearing site data wipes it, so export a copy now and then — the file imports back into any browser."
            : sync.user
              ? "Your progress is saved to your account, so it follows you to any device you sign in on. This browser keeps a local copy too, which is what makes ticking instant and keeps the page usable offline."
              : "Right now progress lives only in this browser. Sign in and it will be saved to your account instead, so you can pick up where you left off on your phone or another laptop."}
        </p>
      </div>

      {notice ? (
        <p
          role="status"
          className={`mt-8 rounded-md border px-4 py-3 text-[13.5px] ${
            notice.tone === "ok"
              ? "border-line bg-raised text-muted"
              : "border-warn/30 bg-warn-soft text-warn"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      {/* ----------------------------------------------------------- account */}
      {sync.status !== "disabled" ? (
        <section className="mt-10 rounded-xl border border-line bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="serif text-[1.15rem] font-medium">Account</h2>
              {sync.user ? (
                <>
                  <p className="mt-1.5 truncate text-[14px] text-muted">
                    Signed in as {sync.user.email ?? sync.user.name}
                  </p>
                  <div className="mt-2">
                    <SyncLine status={sync.status} pending={sync.pending} error={sync.error} />
                  </div>
                </>
              ) : (
                <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-muted">
                  Not signed in. Anything you have already ticked in this browser will be carried
                  up to your account the first time you sign in — nothing is lost.
                </p>
              )}
            </div>
            {!sync.user ? (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="rounded-md bg-ink px-4 py-2 text-[13.5px] text-canvas transition-transform active:scale-[0.98]"
              >
                Sign in with Google
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ status */}
      <section className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        <Cell label="Study items" value={`${study.done} / ${study.total}`} />
        <Cell label="Post-exam" value={`${post.done} / ${post.total}`} />
        <Cell label="Exam dates set" value={String(Object.keys(state.examDates).length)} />
        <Cell
          label="Last saved"
          value={state.savedAt ? new Date(state.savedAt).toLocaleDateString() : "—"}
        />
      </section>

      {/* ------------------------------------------------------------ export */}
      <Row
        title="Export"
        body="Downloads a JSON file with every tick, your planned exam dates and the sort preference."
      >
        <button
          type="button"
          onClick={download}
          className="rounded-md bg-ink px-4 py-2 text-[13.5px] text-canvas transition-transform active:scale-[0.98]"
        >
          Download JSON
        </button>
      </Row>

      {/* ------------------------------------------------------------ import */}
      <Row
        title="Import"
        body="Replaces current progress with the file's. Items whose text still exists keep their tick, even if the roadmap moved them."
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
          className="block w-full text-[13px] text-muted file:mr-3 file:rounded-md file:border file:border-line file:bg-surface file:px-3 file:py-2 file:text-[13.5px] file:text-ink hover:file:border-line-strong"
          aria-label="Import progress JSON"
        />
      </Row>

      {/* ------------------------------------------------------------- reset */}
      <Row
        title="Reset"
        body={`Unchecks all ${study.total} study items, clears the post-exam checklists and removes every planned exam date.`}
      >
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[13.5px] text-warn">This cannot be undone. Export first?</p>
            <button
              ref={confirmRef}
              type="button"
              onClick={() => {
                resetAll();
                setConfirming(false);
                setNotice({ tone: "ok", text: "Progress reset." });
              }}
              className="rounded-md border border-warn/40 bg-warn-soft px-3.5 py-2 text-[13.5px] text-warn transition-transform active:scale-[0.98]"
            >
              Yes, erase everything
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md border border-line px-3.5 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirming(true);
              window.setTimeout(() => confirmRef.current?.focus(), 0);
            }}
            className="rounded-md border border-line px-4 py-2 text-[13.5px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Reset progress
          </button>
        )}
      </Row>

      <p className="mt-14 text-[12.5px] leading-relaxed text-faint">
        {roadmap.totals.items} study items across {certifications.length} certifications, plus{" "}
        {roadmap.postExamChecklist.items.length} post-exam steps tracked per certification.
      </p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-5">
      <p className="meta">{label}</p>
      <p className="serif mt-1.5 text-[1.25rem] tabular-nums leading-none">{value}</p>
    </div>
  );
}

function Row({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-8">
      <h2 className="serif text-[1.15rem] font-medium">{title}</h2>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">{body}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
