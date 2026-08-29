"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithGoogle, signOut } from "@/lib/sync";
import { useSync } from "@/lib/useSync";

export function AccountMenu() {
  const { status, user, pending, error } = useSync();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Builds without Supabase credentials stay purely local — show nothing.
  if (status === "disabled") return null;

  if (status === "loading" && !user) {
    return <span className="meta hidden sm:inline">…</span>;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-[13px] text-ink transition-colors hover:border-line-strong"
      >
        <GoogleMark />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const label = user.name ?? user.email ?? "Account";
  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md border border-line py-1 pl-1 pr-2 transition-colors hover:border-line-strong"
        title={label}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px] rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-raised text-[11px] text-muted">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[9rem] truncate text-[13px] text-muted sm:inline">
          {user.name ?? user.email}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-line bg-surface p-4"
        >
          <p className="truncate text-[13.5px] font-medium">{user.name ?? "Signed in"}</p>
          {user.email ? (
            <p className="mt-0.5 truncate text-[12.5px] text-muted">{user.email}</p>
          ) : null}

          <div className="mt-3 border-t border-line pt-3">
            <SyncLine status={status} pending={pending} error={error} />
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="mt-4 w-full rounded-md border border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Sign out
          </button>
          <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
            Signing out leaves this device&apos;s progress in place. Your account keeps its own copy.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function SyncLine({
  status,
  pending,
  error,
}: {
  status: string;
  pending: number;
  error: string | null;
}) {
  if (status === "error") {
    return (
      <p className="text-[12.5px] text-warn">
        Not saved{pending ? ` · ${pending} change${pending === 1 ? "" : "s"} waiting` : ""}.{" "}
        {error ?? "Will retry automatically."}
      </p>
    );
  }
  if (status === "saving" || pending > 0) {
    return <p className="text-[12.5px] text-muted">Saving…</p>;
  }
  if (status === "loading") {
    return <p className="text-[12.5px] text-muted">Loading your progress…</p>;
  }
  return <p className="text-[12.5px] text-muted">All changes saved to your account.</p>;
}

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
