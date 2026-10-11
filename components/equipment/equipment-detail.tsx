import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleAlert, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type DetailMetric = { label: string; value: string; note?: string; tone?: "good" | "warning" | "critical" };
export type Property = { label: string; value: string };
export type EquipmentEvent = { id: string; title: string; description: string; time: string; kind?: "info" | "warning" | "service" };
export type ChildAsset = {
  id: string;
  name: string;
  href: string;
  status: string;
  statusTone: "good" | "warning" | "critical" | "info";
  description: string;
  metrics: { label: string; value: string }[];
};

const tones = {
  good: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  critical: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
};

export function DetailHeader({
  backHref,
  backLabel,
  eyebrow,
  parentHref,
  parentLabel,
  title,
  id,
  description,
  status,
  statusTone,
  location,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  parentHref?: string;
  parentLabel?: string;
  title: string;
  id: string;
  description: string;
  status: string;
  statusTone: keyof typeof tones;
  location: string;
}) {
  return (
    <header className="space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#16806c]">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to {backLabel}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16806c]">
            {parentHref && parentLabel && <><Link href={parentHref} className="hover:underline">{parentLabel}</Link><span className="px-1">/</span></>}
            {eyebrow}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">{title}</h1>
            <Badge className={tones[statusTone]}>{status}</Badge>
          </div>
          <p className="mt-2 font-mono text-sm text-slate-400">{id}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <Badge className="border-[#dce9e5] bg-white px-3 py-2 text-slate-600">{location}</Badge>
      </div>
    </header>
  );
}

export function DetailMetrics({ items }: { items: DetailMetric[] }) {
  return (
    <section aria-label="Key readings" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="gap-2 border-[#dce9e5] py-4">
          <CardContent className="space-y-2">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="text-2xl font-semibold tracking-tight text-[#17352f]">{item.value}</p>
            {item.note && <p className={`text-xs ${item.tone === "warning" ? "text-amber-700" : item.tone === "critical" ? "text-rose-700" : item.tone === "good" ? "text-emerald-700" : "text-slate-400"}`}>{item.note}</p>}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function DetailSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0 border-[#dce9e5] py-0">
      <CardHeader className="border-b border-[#edf3f0] py-4">
        <CardTitle className="text-base text-[#17352f]">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="py-5">{children}</CardContent>
    </Card>
  );
}

export function PropertyGrid({ items }: { items: Property[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.label}</dt>
          <dd className="mt-1 wrap-break-word text-sm font-medium text-[#17352f]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ChildAssetList({ title, description, items, emptyLabel }: { title: string; description: string; items: ChildAsset[]; emptyLabel: string }) {
  return (
    <DetailSection title={title} description={description}>
      {items.length ? (
        <div className="divide-y divide-[#edf3f0]">
          {items.map((item) => (
            <article key={item.id} className="grid gap-4 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={item.href} className="font-semibold text-[#17352f] hover:text-[#16806c]">{item.name}</Link>
                  <Badge className={tones[item.statusTone]}>{item.status}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-slate-400">{item.id}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {item.metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <p className="mt-1 text-xs font-medium text-[#17352f]">{metric.value}</p>
                  </div>
                ))}
                <Link href={item.href} aria-label={`View ${item.name} details`} className="self-center rounded-md p-2 text-[#16806c] hover:bg-[#e8f6f1]">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      )}
    </DetailSection>
  );
}

export function EventTimeline({ items }: { items: EquipmentEvent[] }) {
  return (
    <DetailSection title="Recent activity" description="Recent readings, service events, and equipment alerts.">
      <ol className="space-y-5">
        {items.map((item) => {
          const Icon = item.kind === "warning" ? CircleAlert : item.kind === "service" ? Wrench : CheckCircle2;
          const iconTone = item.kind === "warning" ? "text-amber-600" : item.kind === "service" ? "text-sky-600" : "text-emerald-600";
          return (
            <li key={item.id} className="flex gap-3">
              <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${iconTone}`} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-medium text-[#17352f]">{item.title}</p>
                  <time className="text-xs text-slate-400">{item.time}</time>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </DetailSection>
  );
}