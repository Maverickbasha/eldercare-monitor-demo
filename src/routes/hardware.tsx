import { createFileRoute } from "@tanstack/react-router";
import { Cpu } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Pipeline, useHardware } from "@/components/widgets";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Virtual Hardware — ElderCare AI Demo" },
      { name: "description", content: "Virtual ESP32, MAX30102, MPU6050 and temperature sensor status and latest readings." },
      { property: "og:title", content: "Virtual Hardware — ElderCare AI Demo" },
      { property: "og:description", content: "The wearable's hardware, simulated in software — no device required." },
    ],
  }),
  component: Hardware,
});

function Hardware() {
  const hw = useHardware();
  return (
    <AppShell title="Virtual Hardware" subtitle="Each component of the wearable is simulated in software in the background.">
      <div className="grid gap-4 md:grid-cols-2">
        {hw.map((c) => {
          const alert = c.status !== "Online" && c.status !== "Paused";
          return (
            <div key={c.name} className={`panel p-5 ${alert ? "border-destructive/60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-lg bg-accent text-accent-foreground"><Cpu className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.role}</div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${alert ? "bg-destructive/15 text-destructive" : c.status === "Paused" ? "bg-warning/20 text-warning-foreground" : "bg-success/15 text-success"}`}>{c.status}</span>
              </div>
              <div className="mt-4 rounded-lg bg-muted px-3 py-2 font-mono text-sm">{c.reading}</div>
              <dl className="mt-3 space-y-1 text-sm">
                {c.details.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd></div>)}
              </dl>
            </div>
          );
        })}
      </div>
      <div className="mt-4"><Pipeline /></div>
    </AppShell>
  );
}
