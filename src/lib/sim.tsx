import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type Mode = "normal" | "fall" | "sos";
export type EventKind = "info" | "warning" | "critical" | "resolved";
export interface SimEvent { id: number; time: number; kind: EventKind; title: string; detail: string; source: string }
export interface Notice { id: number; time: number; channel: string; recipient: string; status: "Sent" | "Delivered" | "Acknowledged"; message: string }
export interface Sample { t: number; hr: number; spo2: number; temp: number; risk: number }
export interface Vitals { hr: number; spo2: number; temp: number; ax: number; ay: number; az: number; mag: number }
export interface ActiveAlert { type: "fall" | "sos"; since: number; ack: boolean }
export interface RiskFactor { label: string; points: number; active: boolean; detail: string }
export interface Risk { score: number; level: "Low" | "Moderate" | "High"; factors: RiskFactor[] }

interface SimState {
  running: boolean; mode: Mode; modeTicks: number; startedAt: number | null; now: number | null; lastSync: number | null;
  packets: number; vitals: Vitals; history: Sample[]; events: SimEvent[]; notices: Notice[]; alert: ActiveAlert | null;
}

export const PATIENT = { name: "Kamala Devi", age: 78, room: "Residence · Room 12", id: "EC-0412", wearable: "ElderCare Band #A7" };
export const CAREGIVER = { name: "Arjun (Primary caregiver)", phone: "+91 •••• ••42" };

const initialVitals: Vitals = { hr: 72, spo2: 98, temp: 36.6, ax: 0.02, ay: -0.01, az: 1, mag: 1 };

export function computeRisk(v: Vitals, alert: ActiveAlert | null): Risk {
  const factors: RiskFactor[] = [
    { label: "Heart rate outside 50–100 bpm", points: 20, active: v.hr > 100 || v.hr < 50, detail: `${Math.round(v.hr)} bpm` },
    { label: "Heart rate above 115 bpm", points: 10, active: v.hr > 115, detail: `${Math.round(v.hr)} bpm` },
    { label: "SpO2 below 95%", points: 15, active: v.spo2 < 95, detail: `${v.spo2.toFixed(1)}%` },
    { label: "SpO2 below 92%", points: 15, active: v.spo2 < 92, detail: `${v.spo2.toFixed(1)}%` },
    { label: "Body temperature above 37.5 °C", points: 10, active: v.temp > 37.5, detail: `${v.temp.toFixed(1)} °C` },
    { label: "Fall detected (MPU6050)", points: 40, active: alert?.type === "fall", detail: alert?.type === "fall" ? "Active" : "None" },
    { label: "SOS pressed on wearable", points: 45, active: alert?.type === "sos", detail: alert?.type === "sos" ? "Active" : "None" },
  ];
  const score = Math.min(100, 5 + factors.reduce((s, f) => s + (f.active ? f.points : 0), 0));
  return { score, level: score >= 60 ? "High" : score >= 30 ? "Moderate" : "Low", factors };
}

const jitter = (a: number) => (Math.random() - 0.5) * 2 * a;
const TARGETS: Record<Mode, { hr: number; spo2: number; temp: number }> = {
  normal: { hr: 72, spo2: 97.8, temp: 36.6 },
  fall: { hr: 106, spo2: 95.5, temp: 36.8 },
  sos: { hr: 121, spo2: 93.2, temp: 37.3 },
};

function step(v: Vitals, mode: Mode, ticks: number): Vitals {
  const t = TARGETS[mode];
  const hr = v.hr + (t.hr - v.hr) * 0.18 + jitter(1.6);
  const spo2 = Math.min(100, v.spo2 + (t.spo2 - v.spo2) * 0.15 + jitter(0.25));
  const temp = v.temp + (t.temp - v.temp) * 0.08 + jitter(0.03);
  let ax = jitter(0.06), ay = jitter(0.06), az = 1 + jitter(0.05);
  if (mode === "fall" && ticks < 2) { ax = 2.1 + jitter(0.3); ay = -1.8 + jitter(0.3); az = 1.6 + jitter(0.3); }
  else if (mode === "fall") { ax = 0.98 + jitter(0.03); ay = jitter(0.03); az = 0.05 + jitter(0.03); }
  else if (mode === "sos") { ax = jitter(0.25); ay = jitter(0.25); az = 1 + jitter(0.2); }
  return { hr, spo2, temp, ax, ay, az, mag: Math.sqrt(ax * ax + ay * ay + az * az) };
}

interface SimCtx extends SimState {
  risk: Risk;
  normal: () => void; triggerFall: () => void; triggerSos: () => void; recover: () => void; togglePause: () => void; acknowledge: () => void;
}
const Ctx = createContext<SimCtx | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const idRef = useRef(1);
  const nid = () => idRef.current++;
  const [s, setS] = useState<SimState>({
    running: true, mode: "normal", modeTicks: 0, startedAt: null, now: null, lastSync: null, packets: 0,
    vitals: initialVitals, history: [], events: [], notices: [], alert: null,
  });

  useEffect(() => {
    const start = Date.now();
    let v = initialVitals;
    const history: Sample[] = [];
    for (let i = 90; i > 0; i--) {
      v = step(v, "normal", 99);
      history.push({ t: start - i * 2000, hr: v.hr, spo2: v.spo2, temp: v.temp, risk: computeRisk(v, null).score });
    }
    setS((p) => ({
      ...p, startedAt: start, now: start, lastSync: start, vitals: v, history,
      events: [{ id: nid(), time: start, kind: "info", title: "Virtual hardware online", detail: "ESP32, MAX30102, MPU6050 and temperature sensor initialised in simulation mode.", source: "ESP32" }],
    }));
    const iv = setInterval(() => {
      setS((p) => {
        const now = Date.now();
        const notices = p.notices.map((n) => (n.status === "Sent" && now - n.time > 2000 ? { ...n, status: "Delivered" as const } : n));
        if (!p.running) return { ...p, now, notices };
        const vitals = step(p.vitals, p.mode, p.modeTicks);
        const sample = { t: now, hr: vitals.hr, spo2: vitals.spo2, temp: vitals.temp, risk: computeRisk(vitals, p.alert).score };
        return { ...p, now, notices, vitals, lastSync: now, packets: p.packets + 1, modeTicks: p.modeTicks + 1, history: [...p.history, sample].slice(-180) };
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const raise = useCallback((type: "fall" | "sos") => {
    setS((p) => {
      if (p.alert?.type === type && !p.alert.ack) return p;
      const now = Date.now();
      const isFall = type === "fall";
      const title = isFall ? "Fall detected" : "SOS emergency";
      const msg = isFall ? `Possible fall detected for ${PATIENT.name}. Impact spike followed by no movement.` : `${PATIENT.name} pressed the SOS button on the wearable.`;
      const events: SimEvent[] = [
        { id: nid(), time: now, kind: "critical", title, detail: isFall ? "MPU6050 reported an acceleration spike above 2.5 g, then a lying orientation." : "SOS button press received by ESP32.", source: isFall ? "MPU6050" : "ESP32" },
        { id: nid(), time: now, kind: "warning", title: "AI risk re-evaluated", detail: "Risk score raised by the event and current vitals.", source: "AI analysis" },
        ...p.events,
      ];
      const notices: Notice[] = [
        { id: nid(), time: now, channel: "Push notification", recipient: CAREGIVER.name, status: "Sent", message: msg },
        { id: nid(), time: now, channel: "SMS", recipient: CAREGIVER.phone, status: "Sent", message: `${title}: ${PATIENT.name}, ${PATIENT.room}.` },
        ...p.notices,
      ];
      return { ...p, running: true, mode: type, modeTicks: 0, alert: { type, since: now, ack: false }, events: events.slice(0, 100), notices: notices.slice(0, 100) };
    });
    toast.error(type === "fall" ? "Fall detected — caregiver notified" : "SOS emergency — caregiver notified", {
      description: `${PATIENT.name} · ${PATIENT.room}`,
    });
  }, []);

  const recover = useCallback(() => {
    setS((p) => {
      const now = Date.now();
      const events: SimEvent[] = [
        { id: nid(), time: now, kind: "resolved", title: p.alert ? "Alert cleared" : "Monitoring normal", detail: p.alert ? `${p.alert.type === "fall" ? "Fall" : "SOS"} alert resolved. Returning to normal monitoring.` : "No active alert. Continuing normal monitoring.", source: "Caregiver dashboard" },
        ...p.events,
      ];
      const notices = p.alert ? [{ id: nid(), time: now, channel: "Push notification", recipient: CAREGIVER.name, status: "Sent" as const, message: `Alert resolved for ${PATIENT.name}.` }, ...p.notices] : p.notices;
      return { ...p, running: true, mode: "normal", modeTicks: 0, alert: null, events: events.slice(0, 100), notices: notices.slice(0, 100) };
    });
    toast.success("Alert cleared", { description: "Back to normal monitoring." });
  }, []);

  const normal = useCallback(() => {
    let hadAlert = false;
    setS((p) => {
      hadAlert = !!p.alert;
      if (p.alert) return p;
      return { ...p, running: true, mode: "normal", modeTicks: 0 };
    });
    setTimeout(() => {
      if (hadAlert) toast.warning("Clear the active alert first", { description: "Use Recover / Clear Alert." });
      else toast("Normal monitoring", { description: "Simulated vitals within typical ranges." });
    }, 0);
  }, []);

  const togglePause = useCallback(() => {
    setS((p) => {
      const now = Date.now();
      const running = !p.running;
      setTimeout(() => toast(running ? "Simulation resumed" : "Simulation paused", { description: running ? "Virtual sensors streaming again." : "Readings frozen until resumed." }), 0);
      return { ...p, running, events: [{ id: nid(), time: now, kind: "info" as const, title: running ? "Simulation resumed" : "Simulation paused", detail: running ? "Virtual ESP32 resumed sending packets." : "Virtual ESP32 stopped sending packets.", source: "Demo controls" }, ...p.events].slice(0, 100) };
    });
  }, []);

  const acknowledge = useCallback(() => {
    setS((p) => {
      if (!p.alert || p.alert.ack) return p;
      const now = Date.now();
      return {
        ...p, alert: { ...p.alert, ack: true },
        notices: p.notices.map((n) => (n.time >= p.alert!.since ? { ...n, status: "Acknowledged" as const } : n)),
        events: [{ id: nid(), time: now, kind: "warning" as const, title: "Caregiver acknowledged", detail: `${CAREGIVER.name} acknowledged the alert and is responding.`, source: "Caregiver" }, ...p.events].slice(0, 100),
      };
    });
    toast.success("Caregiver acknowledged the alert");
  }, []);

  const risk = useMemo(() => computeRisk(s.vitals, s.alert), [s.vitals, s.alert]);
  const value: SimCtx = { ...s, risk, normal, triggerFall: () => raise("fall"), triggerSos: () => raise("sos"), recover, togglePause, acknowledge };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSim() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSim outside SimulationProvider");
  return c;
}

export const fmtTime = (t: number | null) => (t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—");
export const fmtDur = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
