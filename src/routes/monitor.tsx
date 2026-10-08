import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { MotionCard, RiskPanel, TrendChart, VitalCard } from "@/components/widgets";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/monitor")({
  head: () => ({
    meta: [
      { title: "Live Monitor — ElderCare AI Demo" },
      { name: "description", content: "Live heart rate, SpO2, body temperature and motion streams from virtual sensors." },
      { property: "og:title", content: "Live Monitor — ElderCare AI Demo" },
      { property: "og:description", content: "Watch simulated wearable readings update in real time." },
    ],
  }),
  component: Monitor,
});

function Monitor() {
  const s = useSim();
  const recent = s.history.slice(-45);
  return (
    <AppShell title="Live Monitor" subtitle="Readings stream from the virtual wearable every 2 seconds.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <VitalCard k="hr" /><VitalCard k="spo2" /><VitalCard k="temp" /><MotionCard />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="panel p-5 xl:col-span-2">
          <h3 className="mb-3 font-semibold">Heart rate · last 90 s</h3>
          <TrendChart data={recent} k="hr" height={260} />
        </div>
        <RiskPanel detailed />
      </div>
    </AppShell>
  );
}
