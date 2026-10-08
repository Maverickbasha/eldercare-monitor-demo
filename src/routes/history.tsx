import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { EventList, TrendChart } from "@/components/widgets";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Health History — ElderCare AI Demo" },
      { name: "description", content: "Trend charts and recent events from the simulated ElderCare AI health history." },
      { property: "og:title", content: "Health History — ElderCare AI Demo" },
      { property: "og:description", content: "Heart rate, SpO2, temperature and AI risk trends over time." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const s = useSim();
  const h = s.history;
  const avg = (k: "hr" | "spo2" | "temp") => (h.length ? h.reduce((a, x) => a + x[k], 0) / h.length : 0);
  const stats = [
    ["Avg heart rate", `${avg("hr").toFixed(0)} bpm`],
    ["Avg SpO2", `${avg("spo2").toFixed(1)} %`],
    ["Avg temperature", `${avg("temp").toFixed(1)} °C`],
    ["Samples stored", `${h.length}`],
  ];
  return (
    <AppShell title="Health History" subtitle="Readings stored in the simulated cloud database (last 6 minutes).">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v]) => <div key={l} className="panel p-5"><div className="text-sm text-muted-foreground">{l}</div><div className="mt-1 font-display text-2xl font-semibold">{v}</div></div>)}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5"><h3 className="mb-3 font-semibold">Heart rate (bpm)</h3><TrendChart data={h} k="hr" /></div>
        <div className="panel p-5"><h3 className="mb-3 font-semibold">SpO2 (%)</h3><TrendChart data={h} k="spo2" /></div>
        <div className="panel p-5"><h3 className="mb-3 font-semibold">Body temperature (°C)</h3><TrendChart data={h} k="temp" /></div>
        <div className="panel p-5"><h3 className="mb-3 font-semibold">AI risk score</h3><TrendChart data={h} k="risk" /></div>
      </div>
      <div className="panel mt-4 p-5"><h3 className="mb-4 font-semibold">Recent events</h3><EventList events={s.events} limit={15} /></div>
    </AppShell>
  );
}
