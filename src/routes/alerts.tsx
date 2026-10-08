import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/shell";
import { EventList, NoticeTimeline, RiskPanel } from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { useSim, fmtTime, CAREGIVER } from "@/lib/sim";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — ElderCare AI Demo" },
      { name: "description", content: "Fall and SOS alerts with the instant caregiver notification timeline." },
      { property: "og:title", content: "Alerts — ElderCare AI Demo" },
      { property: "og:description", content: "See how emergencies reach the caregiver in the simulated system." },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const s = useSim();
  const alertEvents = s.events.filter((e) => e.kind !== "info");
  return (
    <AppShell title="Alerts" subtitle="Fall detection and SOS events, with instant caregiver notifications.">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className={`panel p-5 ${s.alert ? "border-destructive/60" : ""}`}>
          <h3 className="mb-3 font-semibold">Active alert</h3>
          {s.alert ? (
            <div>
              <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-5" /><span className="font-display text-xl font-semibold">{s.alert.type === "fall" ? "Fall detected" : "SOS emergency"}</span></div>
              <p className="mt-2 text-sm text-muted-foreground">Raised at {fmtTime(s.alert.since)}. {s.alert.ack ? `${CAREGIVER.name} is responding.` : "Awaiting caregiver acknowledgement."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={s.acknowledge} disabled={s.alert.ack}>{s.alert.ack ? "Acknowledged" : "Acknowledge"}</Button>
                <Button size="sm" variant="outline" onClick={s.recover}>Recover / Clear Alert</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-5" /><span className="font-medium">No active alerts</span></div>
          )}
        </div>
        <div className="panel p-5 xl:col-span-2"><h3 className="mb-4 font-semibold">Caregiver notification timeline</h3><NoticeTimeline /></div>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="panel p-5 xl:col-span-2"><h3 className="mb-4 font-semibold">Alert history</h3><EventList events={alertEvents} /></div>
        <RiskPanel detailed />
      </div>
    </AppShell>
  );
}
