import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, AlertTriangle, BellRing, Cpu, HeartPulse, History, LayoutDashboard, Info } from "lucide-react";
import { useSim, fmtTime, fmtDur, PATIENT } from "@/lib/sim";
import { DemoControls } from "@/components/widgets";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitor", label: "Live Monitor", icon: Activity },
  { to: "/history", label: "Health History", icon: History },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/hardware", label: "Virtual Hardware", icon: Cpu },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const sim = useSim();
  const activeAlerts = sim.alert ? 1 : 0;
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy text-navy-foreground lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><HeartPulse className="size-5" /></div>
          <div>
            <div className="font-display text-lg font-semibold">ElderCare AI</div>
            <div className="text-xs opacity-70">Caregiver dashboard</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-80 transition hover:bg-navy-muted hover:opacity-100"
              activeProps={{ className: "bg-navy-muted !opacity-100 font-semibold" }}>
              <Icon className="size-4" /> {label}
              {to === "/alerts" && activeAlerts > 0 && <span className="ml-auto rounded-full bg-destructive px-2 text-xs text-destructive-foreground">{activeAlerts}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto m-4 rounded-xl bg-navy-muted p-4 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <span className={`size-2 rounded-full live-dot ${sim.running ? "bg-success text-success" : "bg-warning text-warning"}`} />
            {sim.running ? "Virtual Hardware Online" : "Simulation Paused"}
          </div>
          <div className="mt-1 opacity-70">Simulation Mode · no physical device required</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <HeartPulse className="size-5 text-primary" /><span className="font-display font-semibold">ElderCare AI</span>
            </div>
            <StatusPill label="Connection" value={sim.running ? "Connected" : "Paused"} tone={sim.running ? "ok" : "warn"} />
            <StatusPill label="Mode" value="Simulation" tone="info" />
            <Stat label="Uptime" value={sim.startedAt && sim.now ? fmtDur(sim.now - sim.startedAt) : "—"} />
            <Stat label="Last sync" value={fmtTime(sim.lastSync)} />
            <StatusPill label="Caregiver" value={sim.alert ? (sim.alert.ack ? "Responding" : "Notified") : "Standby"} tone={sim.alert ? (sim.alert.ack ? "warn" : "bad") : "ok"} />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} activeOptions={{ exact: true }} className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground"
                activeProps={{ className: "bg-primary !text-primary-foreground" }}>{label}</Link>
            ))}
          </nav>
        </header>

        {sim.alert && (
          <div className="emergency-glow mx-4 mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-destructive px-5 py-4 text-destructive-foreground md:mx-8">
            <AlertTriangle className="size-6 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-display font-semibold">{sim.alert.type === "fall" ? "FALL DETECTED" : "SOS EMERGENCY"} — {PATIENT.name}</div>
              <div className="text-sm opacity-90">Since {fmtTime(sim.alert.since)} · {sim.alert.ack ? "Caregiver acknowledged and responding" : "Caregiver notified via push & SMS"}</div>
            </div>
            {!sim.alert.ack && <Button variant="secondary" size="sm" onClick={sim.acknowledge}>Acknowledge</Button>}
            <Button variant="outline" size="sm" className="border-destructive-foreground/40 bg-transparent text-destructive-foreground hover:bg-destructive-foreground/10 hover:text-destructive-foreground" onClick={sim.recover}>Recover / Clear</Button>
          </div>
        )}

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <DemoControls />
          <div className="mt-6">{children}</div>
        </main>

        <footer className="flex items-start gap-2 border-t bg-card px-4 py-3 text-xs text-muted-foreground md:px-8">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Simulation mode — readings are generated for demonstration and are not medical measurements.
        </footer>
      </div>
    </div>
  );
}

const TONES = { ok: "bg-success", warn: "bg-warning", bad: "bg-destructive", info: "bg-primary" };
function StatusPill({ label, value, tone }: { label: string; value: string; tone: keyof typeof TONES }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 font-medium">
        <span className={`size-2 rounded-full ${TONES[tone]}`} />{value}
      </span>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="text-sm"><span className="text-muted-foreground">{label}</span> <span className="font-mono font-medium">{value}</span></div>;
}
