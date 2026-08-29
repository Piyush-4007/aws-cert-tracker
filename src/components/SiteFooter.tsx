export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="meta">Disclaimer</p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted">
          A personal study tracker, put together to the best of my knowledge. The checklist is my own
          reading of the published exam guides — it is not official, not affiliated with or endorsed
          by Amazon Web Services, and it may be incomplete or out of date. AWS changes exam guides
          without warning, so always check the current official guide before you book. Nothing here
          is a guarantee of passing, and I am not responsible for how anyone uses it.
        </p>
      </div>
    </footer>
  );
}
