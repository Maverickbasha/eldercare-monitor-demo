# ElderCare Monitor Demo

Build a polished local-ready ElderCare AI demo web app based on the uploaded ElderCare_AI_Project_Review.pptx. The real project uses hardware, but this demo must simulate the hardware virtually in the background so no physical hardware is required.

Implement the deck's core scope: continuous health monitoring; live heart rate; SpO2; body temperature; real-time fall detection; emergency SOS; instant caregiver notifications; health history; AI-based risk prediction; real-time caregiver dashboard. Virtually represent ESP32, MAX30102, MPU6050, and temperature sensor. Simulate the end-to-end flow from elderly person/wearable through ESP32 and sensor collection to cloud/database, AI analysis, dashboard, and caregiver alert.

Make the app presentation-ready and robust:
- Local simulation only; no hardware, external APIs, backend, cloud, or internet dependency required for demo behavior.
- Realistic simulated values that update over time.
- Clear "Virtual Hardware Online / Simulation Mode" status.
- Working demo controls: Normal Monitoring, Trigger Fall, Trigger SOS/Emergency, Recover/Clear Alert, Pause/Resume Simulation.
- Fall/SOS events must propagate through virtual hardware state, risk state, alert panel, and caregiver notification timeline.
- Health history with trend charts and recent events.
- AI risk panel with transparent demo scoring/explanation. Do not claim medical diagnosis.
- Virtual hardware panel with component status and latest reading.
- Sidebar/top navigation: Dashboard, Live Monitor, Health History, Alerts, Virtual Hardware.
- Patient/resident card, uptime, last sync, connection state, caregiver status.
- Toast notifications and a strong but tasteful emergency state.
- Responsive, clean navy/blue healthcare aesthetic matching the PPT.
- No dead buttons, no console errors, reliable state transitions.
- Visible disclaimer: "Simulation mode — readings are generated for demonstration and are not medical measurements."
- Standard npm dev workflow and localhost-ready project.

Use the PPT as the source of truth for terminology and scope. Do not invent clinical capabilities beyond it. This is a virtual demonstration of the proposed system, not a replacement for actual hardware.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d512b9a-1cd1-4e15-b602-eb067e5ac7e7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
