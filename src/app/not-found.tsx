import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-32 sm:px-8">
      <p className="meta">404</p>
      <h1 className="serif mt-4 text-[2rem] font-medium">No such page.</h1>
      <p className="mt-4 text-[15px] text-muted">
        The tracker only has the four certifications from the roadmap.
      </p>
      <Link href="/" className="mt-8 inline-block text-[14px] text-accent underline underline-offset-4">
        Back to overview
      </Link>
    </div>
  );
}
