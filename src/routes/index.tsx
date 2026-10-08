import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { EventList, MotionCard, NoticeTimeline, PatientCard, Pipeline, RiskPanel, VitalCard } from "@/components/widgets";
import { useSim } from "@/lib/sim";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ElderCare AI Demo" },
      { name: "description", content: "Real-time caregiver dashboard for the ElderCare AI wearable, running on simulated virtual hardware." },
      { property: "og:title", content: "Dashboard — ElderCare AI Demo" },
      { property: "og:description", content: "Live vitals, fall detection, SOS and AI risk prediction in simulation mode." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useSim();
  return (
    <AppShell title="Caregiver Dashboard" subtitle="Continuous health monitoring with real-time fall detection and emergency SOS.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <VitalCard k="hr" /><VitalCard k="spo2" /><VitalCard k="temp" /><MotionCard />
      </div>
      <div className="mt-4"><Pipeline /></div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <PatientCard />
        <RiskPanel />
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Caregiver notifications</h3><Link to="/alerts" className="text-sm text-primary">View all</Link></div>
          <NoticeTimeline limit={3} />
        </div>
      </div>
      <div className="panel mt-4 p-5">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Recent events</h3><Link to="/history" className="text-sm text-primary">Health history</Link></div>
        <EventList events={s.events} limit={5} />
      </div>
    </AppShell>
  );
}
