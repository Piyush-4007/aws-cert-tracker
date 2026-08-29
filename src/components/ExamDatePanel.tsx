"use client";

import { VOUCHER_EXPIRY } from "@/lib/roadmap";
import { daysBetween, formatDay, parseDay, useToday } from "@/lib/dates";
import { setExamDate } from "@/lib/store";
import { useProgress } from "@/lib/useProgress";
import type { Certification } from "@/lib/types";

export function ExamDatePanel({
  cert,
  remaining,
}: {
  cert: Certification;
  remaining: number;
}) {
  const { examDates } = useProgress();
  const today = useToday();
  const date = examDates[cert.id] ?? "";

  const daysLeft = today !== null && date ? daysBetween(today, parseDay(date)) : null;
  const tooLate = date ? parseDay(date) > parseDay(VOUCHER_EXPIRY) : false;
  const pace =
    daysLeft !== null && daysLeft > 0 ? (remaining / daysLeft).toFixed(1) : null;

  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-3 text-[13px] text-muted">
          <span className="meta">Planned exam date</span>
          <input
            type="date"
            value={date}
            max="2030-12-31"
            onChange={(e) => setExamDate(cert.id, e.target.value || null)}
            className="rounded-md border border-line bg-canvas px-2.5 py-1.5 font-mono text-[13px] text-ink focus:border-line-strong"
            aria-label={`Planned exam date for ${cert.code}`}
          />
        </label>

        {date ? (
          <button
            type="button"
            onClick={() => setExamDate(cert.id, null)}
            className="text-[12.5px] text-faint transition-colors hover:text-ink"
          >
            Clear
          </button>
        ) : null}

        {date && daysLeft !== null ? (
          <p className="text-[13px] text-muted">
            {daysLeft >= 0 ? (
              <>
                <span className="tabular-nums text-ink">{daysLeft}</span> days away
                {pace && remaining > 0 ? (
                  <>
                    {" · "}
                    <span className="tabular-nums text-ink">{pace}</span> items/day to be ready
                  </>
                ) : remaining === 0 ? (
                  " · checklist complete"
                ) : (
                  " · sitting it today"
                )}
              </>
            ) : (
              <>{Math.abs(daysLeft)} days ago</>
            )}
          </p>
        ) : null}
      </div>

      {tooLate ? (
        <p className="mt-3 rounded-md border border-warn/30 bg-warn-soft px-3 py-2 text-[13px] text-warn">
          {formatDay(date)} falls after the voucher expires on {formatDay(VOUCHER_EXPIRY)}. Vouchers
          cannot be extended — move this date earlier.
        </p>
      ) : null}
    </div>
  );
}
