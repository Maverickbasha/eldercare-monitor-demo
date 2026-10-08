import { Activity, AlertTriangle, ArrowRight, Brain, Cloud, Cpu, Gauge, HeartPulse, LayoutDashboard, Pause, Play, RotateCcw, Siren, Thermometer, User, Watch, Droplets, Bell, CheckCircle2, Info } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { useSim, fmtTime, PATIENT, CAREGIVER, type SimEvent, type Sample } from "@/lib/sim";

export function DemoControls() {
  const s = useSim();
  return (
    <div className="panel flex flex-wrap items-center gap-2 p-3">
      <span className="mr-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo controls</span>
      <Button size="sm" variant={s.mode === "normal" && !s.alert ? "default" : "outline"} onClick={s.normal}><Activity /> Normal Monitoring</Button>
      <Button size="sm" variant="outline" onClick={s.triggerFall}><AlertTriangle /> Trigger Fall</Button>
      <Button size="sm" variant="destructive" onClick={s.triggerSos}><Siren /> Trigger SOS / Emergency</Button>
      <Button size="sm" variant="outline" onClick={s.recover}><RotateCcw /> Recover / Clear Alert</Button>
      <Button size="sm" variant="secondary" onClick={s.togglePause} className="ml-auto">{s.running ? <><Pause /> Pause Simulation</> : <><Play /> Resume Simulation</>}</Button>
    </div>
  );
}

type VitalKey = "hr" | "spo2" | "temp";
const VITAL = {
  hr: { label: "Heart Rate", unit: "bpm", icon: HeartPulse, color: "var(--color-chart-1)", digits: 0, sensor: "MAX30102", ok: (v: number) => v >= 50 && v <= 100 },
  spo2: { label: "SpO2", unit: "%", icon: Droplets, color: "var(--color-chart-2)", digits: 1, sensor: "MAX30102", ok: (v: number) => v >= 95 },
  temp: { label: "Body Temperature", unit: "°C", icon: Thermometer, color: "var(--color-chart-3)", digits: 1, sensor: "Temperature sensor", ok: (v: number) => v <= 37.5 },
};

export function VitalCard({ k }: { k: VitalKey }) {
  const s = useSim();
  const c = VITAL[k];
  const v = s.vitals[k];
  const ok = c.ok(v);
  const data = s.history.slice(-30);
  return (
    <div className={`panel p-5 ${ok ? "" : "border-destructive/60"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><c.icon className="size-4" style={{ color: c.color }} />{c.label}</div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{ok ? "In range" : "Out of range"}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold tabular-nums">{v.toFixed(c.digits)}</span>
        <span className="text-muted-foreground">{c.unit}</span>
      </div>
      <div className="mt-2 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs><linearGradient id={`g-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.color} stopOpacity={0.35} /><stop offset="100%" stopColor={c.color} stopOpacity={0} /></linearGradient></defs>
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Area type="monotone" dataKey={k} stroke={c.color} strokeWidth={2} fill={`url(#g-${k})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">Source: virtual {c.sensor}</div>
    </div>
  );
}

export function MotionCard() {
  const s = useSim();
  const { mag, ax, ay, az } = s.vitals;
  const status = s.alert?.type === "fall" ? "Fall detected" : mag > 1.3 ? "Movement" : "Stable";
  return (
    <div className={`panel p-5 ${s.alert?.type === "fall" ? "border-destructive/60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Gauge className="size-4 text-primary" />Fall Detection</div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status === "Fall detected" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>{status}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1"><span className="font-display text-4xl font-semibold tabular-nums">{mag.toFixed(2)}</span><span className="text-muted-foreground">g</span></div>
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
        {[["X", ax], ["Y", ay], ["Z", az]].map(([l, v]) => <div key={l as string} className="rounded-md bg-muted px-2 py-1.5">{l} {(v as number).toFixed(2)}</div>)}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Source: virtual MPU6050 · threshold 2.5 g impact</div>
    </div>
  );
}

export function PatientCard() {
  const s = useSim();
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-full bg-accent text-accent-foreground"><User className="size-7" /></div>
        <div>
          <div className="font-display text-lg font-semibold">{PATIENT.name}</div>
          <div className="text-sm text-muted-foreground">{PATIENT.age} yrs · {PATIENT.room}</div>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Resident ID</dt><dd className="font-mono">{PATIENT.id}</dd></div>
        <div><dt className="text-muted-foreground">Wearable</dt><dd>{PATIENT.wearable}</dd></div>
        <div><dt className="text-muted-foreground">Caregiver</dt><dd>{CAREGIVER.name}</dd></div>
        <div><dt className="text-muted-foreground">Status</dt><dd className={s.alert ? "font-semibold text-destructive" : "font-semibold text-success"}>{s.alert ? (s.alert.type === "fall" ? "Fall alert" : "SOS alert") : "Monitoring"}</dd></div>
      </dl>
    </div>
  );
}

export function RiskPanel({ detailed = false }: { detailed?: boolean }) {
  const { risk } = useSim();
  const tone = risk.level === "High" ? "text-destructive" : risk.level === "Moderate" ? "text-warning" : "text-success";
  const bar = risk.level === "High" ? "bg-destructive" : risk.level === "Moderate" ? "bg-warning" : "bg-success";
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Brain className="size-4 text-primary" />AI Risk Prediction</div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-4xl font-semibold tabular-nums">{risk.score}</span>
        <span className="text-muted-foreground">/ 100</span>
        <span className={`ml-auto font-semibold ${tone}`}>{risk.level} risk</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${bar} transition-all duration-700`} style={{ width: `${risk.score}%` }} /></div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {risk.factors.filter((f) => detailed || f.active).map((f) => (
          <li key={f.label} className="flex items-center justify-between gap-2">
            <span className={f.active ? "" : "text-muted-foreground"}>{f.active ? "●" : "○"} {f.label}</span>
            <span className="font-mono text-xs">{f.active ? `+${f.points}` : "0"}</span>
          </li>
        ))}
        {!detailed && !risk.factors.some((f) => f.active) && <li className="text-muted-foreground">No risk factors active. Baseline score 5.</li>}
      </ul>
      <p className="mt-4 flex gap-1.5 text-xs text-muted-foreground"><Info className="mt-0.5 size-3 shrink-0" />Transparent demo scoring: baseline 5 + points per active rule, capped at 100. Not a medical diagnosis.</p>
    </div>
  );
}

const KIND = {
  info: { cls: "bg-primary/15 text-primary", icon: Info },
  warning: { cls: "bg-warning/20 text-warning-foreground", icon: AlertTriangle },
  critical: { cls: "bg-destructive/15 text-destructive", icon: Siren },
  resolved: { cls: "bg-success/15 text-success", icon: CheckCircle2 },
};
export function EventList({ events, limit }: { events: SimEvent[]; limit?: number }) {
  const list = limit ? events.slice(0, limit) : events;
  if (!list.length) return <p className="text-sm text-muted-foreground">No events yet.</p>;
  return (
    <ol className="space-y-3">
      {list.map((e) => {
        const K = KIND[e.kind];
        return (
          <li key={e.id} className="flex gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${K.cls}`}><K.icon className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2"><span className="font-medium">{e.title}</span><span className="font-mono text-xs text-muted-foreground">{fmtTime(e.time)}</span></div>
              <div className="text-sm text-muted-foreground">{e.detail}</div>
              <div className="text-xs text-muted-foreground">Source: {e.source}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function NoticeTimeline({ limit }: { limit?: number }) {
  const { notices } = useSim();
  const list = limit ? notices.slice(0, limit) : notices;
  if (!list.length) return <p className="text-sm text-muted-foreground">No caregiver notifications sent. Trigger a Fall or SOS to see the flow.</p>;
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {list.map((n) => (
        <li key={n.id} className="relative">
          <span className={`absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-card ${n.status === "Acknowledged" ? "bg-success" : n.status === "Delivered" ? "bg-primary" : "bg-warning"}`} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Bell className="size-3.5 text-muted-foreground" /><span className="font-medium">{n.channel}</span><span className="text-muted-foreground">→ {n.recipient}</span>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{n.status}</span>
          </div>
          <div className="text-sm text-muted-foreground">{n.message}</div>
          <div className="font-mono text-xs text-muted-foreground">{fmtTime(n.time)}</div>
        </li>
      ))}
    </ol>
  );
}

export function Pipeline() {
  const s = useSim();
  const alertOn = !!s.alert;
  const steps = [
    { icon: Watch, label: "Elderly person / Wearable", sub: s.alert?.type === "sos" ? "SOS pressed" : "Worn" },
    { icon: Activity, label: "Sensors", sub: "MAX30102 · MPU6050 · Temp" },
    { icon: Cpu, label: "ESP32", sub: `${s.packets} packets` },
    { icon: Cloud, label: "Cloud / Database", sub: `Synced ${fmtTime(s.lastSync)}` },
    { icon: Brain, label: "AI Analysis", sub: `Risk ${s.risk.score} · ${s.risk.level}` },
    { icon: LayoutDashboard, label: "Dashboard", sub: "Live" },
    { icon: Bell, label: "Caregiver Alert", sub: alertOn ? (s.alert!.ack ? "Acknowledged" : "Notified") : "Standby" },
  ];
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">End-to-end data flow</h3>
        <span className={`text-xs font-medium ${s.running ? "text-success" : "text-warning-foreground"}`}>{s.running ? "Streaming every 2 s" : "Paused"}</span>
      </div>
      <div className="flex flex-wrap items-stretch gap-2">
        {steps.map((st, i) => {
          const hot = alertOn && (i === 0 || i >= 1);
          const isLast = i === steps.length - 1;
          return (
            <div key={st.label} className="flex items-center gap-2">
              <div className={`w-36 rounded-lg border p-3 transition ${hot ? "border-destructive/50 bg-destructive/5" : "bg-muted/40"} ${isLast && alertOn ? "emergency-glow" : ""}`}>
                <st.icon className={`size-5 ${hot ? "text-destructive" : "text-primary"}`} />
                <div className="mt-2 text-sm font-medium leading-tight">{st.label}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{st.sub}</div>
              </div>
              {!isLast && <ArrowRight className={`size-4 shrink-0 ${s.running ? "text-primary" : "text-muted-foreground"}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendChart({ data, k, height = 220 }: { data: Sample[]; k: VitalKey | "risk"; height?: number }) {
  const meta = k === "risk" ? { label: "AI risk score", color: "var(--color-chart-4)", digits: 0 } : VITAL[k];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} minTickGap={40} />
          <YAxis domain={k === "risk" ? [0, 100] : ["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => Number(v).toFixed(k === "temp" ? 1 : 0)} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
          <Tooltip labelFormatter={(t) => fmtTime(Number(t))} formatter={(v) => [Number(v).toFixed(meta.digits), meta.label]} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
          <Line type="monotone" dataKey={k} stroke={meta.color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function useHardware() {
  const s = useSim();
  const st = !s.running ? "Paused" : "Online";
  return [
    { name: "ESP32", role: "Microcontroller · Wi-Fi uplink to cloud", status: s.alert?.type === "sos" ? "SOS relay" : st, reading: `${s.packets} packets sent · last ${fmtTime(s.lastSync)}`, details: [["Firmware", "v1.0-sim"], ["Wi-Fi RSSI", "-58 dBm (simulated)"], ["Sample interval", "2 s"]] },
    { name: "MAX30102", role: "Pulse oximeter · heart rate & SpO2", status: st, reading: `${Math.round(s.vitals.hr)} bpm · ${s.vitals.spo2.toFixed(1)}% SpO2`, details: [["Interface", "I²C (virtual)"], ["Heart rate", `${Math.round(s.vitals.hr)} bpm`], ["SpO2", `${s.vitals.spo2.toFixed(1)} %`]] },
    { name: "MPU6050", role: "Accelerometer + gyroscope · fall detection", status: s.alert?.type === "fall" ? "Fall event" : st, reading: `|a| = ${s.vitals.mag.toFixed(2)} g`, details: [["Interface", "I²C (virtual)"], ["Accel X/Y/Z", `${s.vitals.ax.toFixed(2)} / ${s.vitals.ay.toFixed(2)} / ${s.vitals.az.toFixed(2)} g`], ["Impact threshold", "2.5 g"]] },
    { name: "Temperature Sensor", role: "Body temperature", status: st, reading: `${s.vitals.temp.toFixed(1)} °C`, details: [["Interface", "Digital (virtual)"], ["Temperature", `${s.vitals.temp.toFixed(2)} °C`], ["Alert above", "37.5 °C"]] },
  ];
}
