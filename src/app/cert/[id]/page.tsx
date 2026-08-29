import { notFound } from "next/navigation";
import { CertView } from "@/components/CertView";
import { certById, certifications } from "@/lib/roadmap";

export function generateStaticParams() {
  return certifications.map((cert) => ({ id: cert.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = certById.get(id);
  return { title: cert ? `${cert.code} — ${cert.name}` : "Certification" };
}

export default async function CertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!certById.has(id)) notFound();
  return <CertView certId={id} />;
}
