import { useState, useEffect } from "react";

// ─── BRAND COLORS ───
const B = "#00b4ec";  // iad Blue
const C = "#ea584a";  // Coral
const D = "#007DAF";  // Dark Blue
const F = "'Montserrat', sans-serif";

// ─── ROOMS ───
const ROOMS = [
  {
    id: "training",
    name: "Training Room",
    sub: "Coworking & Training Space",
    desc: "Versatile space for team trainings, workshops, and collaborative coworking sessions with full AV equipment.",
    capacity: 20,
    approval: true,
    icon: "📚",
    col: B,
    features: ["Projector & Screen", "Whiteboard", "20 Seats", "High-Speed WiFi", "A/C"],
  },
  {
    id: "podcast",
    name: "Podcast Studio",
    sub: "Professional Recording Space",
    desc: "State-of-the-art studio for podcasts, interviews, video content, and professional media production.",
    capacity: 4,
    approval: false,
    icon: "🎙️",
    col: C,
    features: ["Pro Microphones", "Soundproofing", "Studio Lighting", "Recording Equipment"],
  },
  {
    id: "meeting",
    name: "Paris Meeting Room",
    sub: "Executive Meeting Space",
    desc: "Elegant meeting space inspired by Paris for client presentations, strategy sessions, and team meetings.",
    capacity: 8,
    approval: false,
    icon: "🗼",
    col: D,
    features: ['75" Display', "Video Conferencing", "Whiteboard", "8 Seats", "WiFi"],
  },
];

// ─── DEFAULT USERS ───
const ADMIN = {
  id: "admin-001",
  name: "Orlando Admin",
  email: "admin@iadorlando.com",
  password: "Admin@2024",
  role: "admin",
  joined: "Jan 1, 2024",
};
const TEST_AGENT = {
  id: "agent-001",
  name: "Alex Johnson",
  email: "alex.johnson@iadorlando.com",
  password: "Agent@2024",
  role: "agent",
  joined: "Jan 1, 2024",
};
const DEFAULT_USERS = [ADMIN, TEST_AGENT];

// ─── HELPERS ───
const gid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const fmtD = (d) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const fmtT = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const STATUS = {
  pending: { bg: "#fff8e1", c: "#e65100" },
  confirmed: { bg: "#e8f5e9", c: "#1b5e20" },
  rejected: { bg: "#ffebee", c: "#c62828" },
  cancelled: { bg: "#eceff1", c: "#546e7a" },
};

// ─── STORAGE HELPERS ───
const sGet = async (k) => {
  try {
    const r = await window.storage.get(k);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
};
const sSet = async (k, v) => {
  try {
    await window.storage.set(k, JSON.stringify(v));
  } catch {}
};

// ─── COMPONENTS ───

const Badge = ({ s }) => {
  const x = STATUS[s] || STATUS.pending;
  return (
    <span
      style={{
        background: x.bg,
        color: x.c,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "capitalize",
        display: "inline-block",
      }}
    >
      {s}
    </span>
  );
};

const Toast = ({ msg, type }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
      background: type === "err" ? C : D,
      color: "white",
      padding: "13px 22px",
      borderRadius: 10,
      fontFamily: F,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: "0 6px 24px rgba(0,0,0,.25)",
      maxWidth: 340,
    }}
  >
    {msg}
  </div>
);

// iad Logo SVG
function IadLogo({ white = false, h = 40 }) {
  const c = white ? "white" : B;
  return (
    <svg height={h} viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="10" r="10" fill={c} />
      <rect x="4" y="26" width="20" height="54" rx="4" fill={c} />
      <path
        d="M46 26 L46 80 M46 26 L78 80 M46 80 L78 26 L78 80"
        stroke={c}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="52" y="47" width="20" height="12" rx="6" fill={c} />
      <path d="M100 26 Q155 26 155 53 Q155 80 100 80 L90 80 L90 26 Z" fill={c} />
      <text
        x="0"
        y="115"
        fontFamily="Montserrat,sans-serif"
        fontWeight="700"
        fontSize="18"
        letterSpacing="2.5"
        fill={c}
      >
        REAL ESTATE
      </text>
    </svg>
  );
}

function TopBar({ user, onLogout, sub }) {
  return (
    <div
      style={{
        background: B,
        height: 64,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(0,180,236,.4)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        fontFamily: F,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <IadLogo white h={34} />
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.3)" }} />
        <div>
          <div style={{ color: "white", fontSize: 13, fontWeight: 800 }}>The Inspire Space</div>
          {sub && <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {user.role === "admin" && (
          <span
            style={{
              background: "rgba(255,255,255,.22)",
              color: "white",
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "1px",
            }}
          >
            ADMIN
          </span>
        )}
        <span style={{ color: "rgba(255,255,255,.85)", fontSize: 12, fontWeight: 600 }}>
          {user.name}
        </span>
        <button
          onClick={onLogout}
          style={{
            background: "rgba(255,255,255,.18)",
            color: "white",
            border: "1px solid rgba(255,255,255,.3)",
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: F,
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN ───
function Login({ users, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const go = (e) => {
    e.preventDefault();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() && u.password === pass
    );
    if (found) onLogin(found);
    else setErr("Incorrect email or password. Please try again.");
  };

  const fill = (type) => {
    if (type === "admin") {
      setEmail("admin@iadorlando.com");
      setPass("Admin@2024");
    } else {
      setEmail("alex.johnson@iadorlando.com");
      setPass("Agent@2024");
    }
    setErr("");
  };

  const inp = {
    width: "100%",
    padding: "12px 14px",
    border: "2px solid #eee",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: F,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(140deg, ${B}, ${D})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: F,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <IadLogo white h={52} />
          </div>
          <div
            style={{
              color: "rgba(255,255,255,.9)",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "3px",
              marginTop: 10,
            }}
          >
            THE INSPIRE SPACE
          </div>
          <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 3 }}>
            Orlando, Florida
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: "32px 28px",
            boxShadow: "0 20px 60px rgba(0,0,0,.22)",
          }}
        >
          <h2 style={{ margin: "0 0 4px", fontSize: 21, fontWeight: 900, color: "#111" }}>
            Welcome back
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>
            Sign in to book your workspace
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => fill("admin")}
              style={{
                flex: 1,
                padding: "8px",
                background: "#eaf8ff",
                color: D,
                border: `1px solid ${B}`,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: F,
              }}
            >
              🔐 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fill("agent")}
              style={{
                flex: 1,
                padding: "8px",
                background: "#fff0ef",
                color: C,
                border: `1px solid ${C}`,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: F,
              }}
            >
              👤 Agent Demo
            </button>
          </div>

          <form onSubmit={go}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 5,
                  fontFamily: F,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@iadorlando.com"
                required
                autoComplete="email"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = B)}
                onBlur={(e) => (e.target.style.borderColor = "#eee")}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 5,
                  fontFamily: F,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = B)}
                onBlur={(e) => (e.target.style.borderColor = "#eee")}
              />
            </div>
            {err && (
              <div
                style={{
                  background: "#fff0f0",
                  color: C,
                  border: "1px solid #ffd0cc",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {err}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px",
                background: B,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: F,
              }}
            >
              Sign In →
            </button>
          </form>

          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              background: "#f7fbff",
              borderRadius: 8,
              fontSize: 11,
              color: "#888",
              lineHeight: 1.9,
            }}
          >
            <strong style={{ color: "#555", display: "block", marginBottom: 2 }}>
              🔑 Test Credentials
            </strong>
            Admin: admin@iadorlando.com / Admin@2024
            <br />
            Agent: alex.johnson@iadorlando.com / Agent@2024
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING MODAL ───
function BookingModal({ room, defDate, defTime, onClose, onSubmit, bookings }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(defDate || today);
  const [t1, setT1] = useState(defTime || "09:00");
  const [t2, setT2] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [nb, setNb] = useState(1);
  const [err, setErr] = useState("");

  const slots = [];
  for (let h = 8; h <= 20; h++) slots.push(h.toString().padStart(2, "0") + ":00");

  const hasConflict = () =>
    bookings
      .filter(
        (b) =>
          b.roomId === room.id &&
          b.date === date &&
          b.status !== "rejected" &&
          b.status !== "cancelled"
      )
      .some((b) => t1 < b.endTime && t2 > b.startTime);

  const submit = () => {
    if (!purpose.trim()) { setErr("Please describe the purpose of your booking."); return; }
    if (t1 >= t2) { setErr("End time must be after start time."); return; }
    if (hasConflict()) { setErr("This slot conflicts with an existing booking. Please pick another time."); return; }
    onSubmit({ roomId: room.id, roomName: room.name, date, startTime: t1, endTime: t2, purpose, attendees: nb });
  };

  const ss = {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: F,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "100%",
          maxWidth: 500,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,.3)",
        }}
      >
        <div
          style={{
            background: room.col,
            padding: "20px 24px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 19, marginBottom: 2 }}>
              {room.icon} {room.name}
            </div>
            <div style={{ color: "rgba(255,255,255,.78)", fontSize: 12 }}>{room.sub}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {room.approval && (
              <span
                style={{
                  background: "rgba(255,255,255,.25)",
                  color: "white",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Approval Required
              </span>
            )}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,.2)",
                color: "white",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#777", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, fontFamily: F }}>Date</label>
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} style={ss} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#777", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, fontFamily: F }}>Attendees (max {room.capacity})</label>
              <input type="number" value={nb} min={1} max={room.capacity} onChange={(e) => setNb(Math.max(1, Math.min(room.capacity, parseInt(e.target.value) || 1)))} style={ss} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[["Start Time", t1, setT1], ["End Time", t2, setT2]].map(([lbl, val, set]) => (
              <div key={lbl}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#777", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, fontFamily: F }}>{lbl}</label>
                <select value={val} onChange={(e) => set(e.target.value)} style={ss}>
                  {slots.map((s) => (<option key={s} value={s}>{fmtT(s)}</option>))}
                </select>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#777", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, fontFamily: F }}>Purpose</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              placeholder="What will this space be used for?"
              style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e5e5", borderRadius: 8, fontSize: 14, fontFamily: F, resize: "vertical", boxSizing: "border-box", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = B)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
            />
          </div>

          {room.approval && (
            <div style={{ background: "#fffbec", border: "1px solid #ffe083", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#7a5500", lineHeight: 1.6 }}>
              <strong>⏳ Approval needed:</strong> Training Room requests are reviewed by admin within 24 hours.
            </div>
          )}

          {err && (
            <div style={{ background: "#fff0f0", color: C, border: "1px solid #ffd0cc", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14, fontWeight: 600 }}>
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>Cancel</button>
            <button onClick={submit} style={{ flex: 2, padding: "12px", background: room.col, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 800, fontFamily: F, cursor: "pointer" }}>
              {room.approval ? "Submit Request ✉" : "Confirm Booking ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AVAILABILITY CALENDAR ───
function AvailGrid({ bookings, onBook }) {
  const [wk, setWk] = useState(0);
  const [rm, setRm] = useState("training");
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const todayStr = new Date().toISOString().split("T")[0];

  const getWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + wk * 7);
    const mon = new Date(d);
    mon.setDate(d.getDate() - d.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(mon);
      x.setDate(mon.getDate() + i);
      return x;
    });
  };
  const days = getWeek();

  const isBusy = (d, h) => {
    const ds = d.toISOString().split("T")[0];
    const ts = h.toString().padStart(2, "0") + ":00";
    return bookings.some((b) => b.roomId === rm && b.date === ds && b.status !== "rejected" && b.status !== "cancelled" && b.startTime <= ts && b.endTime > ts);
  };

  const isPast = (d, h) => {
    const x = new Date(d);
    x.setHours(h, 0, 0, 0);
    return x < new Date();
  };

  const isToday = (d) => d.toISOString().split("T")[0] === todayStr;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {ROOMS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRm(r.id)}
            style={{ padding: "8px 16px", border: `2px solid ${rm === r.id ? B : "#ddd"}`, background: rm === r.id ? B : "white", color: rm === r.id ? "white" : "#555", borderRadius: 30, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", transition: "all .15s" }}
          >
            {r.icon} {r.name}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setWk((w) => w - 1)} style={{ padding: "7px 14px", border: "2px solid #e0e0e0", background: "white", borderRadius: 8, cursor: "pointer", fontFamily: F, fontSize: 12, fontWeight: 700 }}>← Prev</button>
        <span style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 13, color: "#222", minWidth: 200 }}>
          {days[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} —{" "}
          {days[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </span>
        <button onClick={() => setWk((w) => w + 1)} style={{ padding: "7px 14px", border: "2px solid #e0e0e0", background: "white", borderRadius: 8, cursor: "pointer", fontFamily: F, fontSize: 12, fontWeight: 700 }}>Next →</button>
        <button onClick={() => setWk(0)} style={{ padding: "7px 14px", border: `2px solid ${B}`, background: B, color: "white", borderRadius: 8, cursor: "pointer", fontFamily: F, fontSize: 12, fontWeight: 700 }}>Today</button>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e8e8e8" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "10px 10px", width: 58, fontSize: 10, fontWeight: 700, color: "#aaa", textAlign: "left", borderBottom: "2px solid #eee", fontFamily: F }}>TIME</th>
              {days.map((d, i) => (
                <th key={i} style={{ padding: "8px 4px", textAlign: "center", background: isToday(d) ? "#e6f8ff" : "#f5f5f5", borderBottom: "2px solid #eee" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: isToday(d) ? B : "#888", fontFamily: F }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: isToday(d) ? B : "#222", fontFamily: F }}>{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h}>
                <td style={{ padding: "2px 10px", fontSize: 9, fontWeight: 700, color: "#bbb", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap", fontFamily: F }}>{fmtT(h.toString().padStart(2, "0") + ":00")}</td>
                {days.map((d, i) => {
                  const busy = isBusy(d, h);
                  const past = isPast(d, h);
                  const ds = d.toISOString().split("T")[0];
                  const room = ROOMS.find((r) => r.id === rm);
                  return (
                    <td
                      key={i}
                      onClick={() => !busy && !past && onBook(room, ds, h.toString().padStart(2, "0") + ":00")}
                      style={{ padding: 2, borderBottom: "1px solid #f0f0f0", borderLeft: "1px solid #f0f0f0", cursor: busy || past ? "default" : "pointer" }}
                    >
                      <div style={{ height: 26, borderRadius: 4, background: past ? "#fafafa" : busy ? "#d0edff" : "#e8faf0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: past ? "#ddd" : busy ? B : "#27ae60", letterSpacing: ".3px" }}>
                        {!past && (busy ? "BOOKED" : "FREE")}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 18, fontSize: 11, color: "#999", fontFamily: F, fontWeight: 600 }}>
        <span>🟩 Free — click to book</span>
        <span>🟦 Booked</span>
      </div>
    </div>
  );
}

// ─── AGENT VIEW ───
function AgentView({ user, bookings, onBook, onCancel, onLogout, notify }) {
  const [tab, setTab] = useState("spaces");
  const [modal, setModal] = useState(null);
  const myBk = bookings.filter((b) => b.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const Tab = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{ padding: "16px 20px", border: "none", background: "none", fontFamily: F, fontSize: 13, fontWeight: 700, cursor: "pointer", borderBottom: `3px solid ${tab === id ? B : "transparent"}`, color: tab === id ? B : "#888", whiteSpace: "nowrap" }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3faff", fontFamily: F }}>
      <TopBar user={user} onLogout={onLogout} sub="Orlando, Florida" />
      <div style={{ background: "white", borderBottom: "2px solid #eee", padding: "0 24px", display: "flex", overflowX: "auto" }}>
        <Tab id="spaces" label="🏢 Spaces" />
        <Tab id="calendar" label="📅 Availability" />
        <Tab id="mine" label={"📋 My Bookings" + (myBk.length ? ` (${myBk.length})` : "")} />
      </div>

      <div style={{ padding: "28px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* SPACES */}
        {tab === "spaces" && (
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 900, color: "#111" }}>Book a Space</h2>
            <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>Reserve your workspace at The Inspire Space, Orlando</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
              {ROOMS.map((room) => (
                <div
                  key={room.id}
                  style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 3px 18px rgba(0,0,0,.07)", border: "1px solid #eee", transition: "all .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,0,0,.13)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 18px rgba(0,0,0,.07)"; }}
                >
                  <div style={{ background: room.col, padding: "22px 20px", color: "white", position: "relative" }}>
                    <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 8 }}>{room.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 2 }}>{room.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{room.sub}</div>
                    {room.approval && (
                      <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,.22)", padding: "3px 10px", borderRadius: 20, fontSize: 9, fontWeight: 800 }}>
                        APPROVAL REQ.
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: "#555", lineHeight: 1.6 }}>{room.desc}</p>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Features</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {room.features.map((f) => (
                          <span key={f} style={{ background: room.col === C ? "#fff0ef" : room.col === D ? "#eef3ff" : "#eaf8ff", color: room.col, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{f}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginBottom: 14 }}>👥 Up to {room.capacity} people</div>
                    <button
                      onClick={() => setModal({ room })}
                      style={{ width: "100%", padding: "12px", background: room.col, color: "white", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 800, fontFamily: F, cursor: "pointer" }}
                    >
                      Book this Space
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABILITY */}
        {tab === "calendar" && (
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 900, color: "#111" }}>Room Availability</h2>
            <p style={{ margin: "0 0 22px", color: "#888", fontSize: 13 }}>Click any free slot to start a booking.</p>
            <div style={{ background: "white", borderRadius: 14, padding: "24px", boxShadow: "0 3px 18px rgba(0,0,0,.06)" }}>
              <AvailGrid bookings={bookings} onBook={(room, date, time) => setModal({ room, defDate: date, defTime: time })} />
            </div>
          </div>
        )}

        {/* MY BOOKINGS */}
        {tab === "mine" && (
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 900, color: "#111" }}>My Bookings</h2>
            <p style={{ margin: "0 0 22px", color: "#888", fontSize: 13 }}>View and manage your reservations</p>
            {myBk.length === 0 ? (
              <div style={{ background: "white", borderRadius: 14, padding: "56px 24px", textAlign: "center", boxShadow: "0 3px 18px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📅</div>
                <div style={{ fontWeight: 800, color: "#444", fontSize: 16, marginBottom: 8 }}>No bookings yet</div>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 22 }}>Head to Spaces to make your first reservation</div>
                <button onClick={() => setTab("spaces")} style={{ background: B, color: "white", border: "none", padding: "12px 28px", borderRadius: 9, fontFamily: F, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Browse Spaces →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myBk.map((b) => (
                  <div key={b.id} style={{ background: "white", borderRadius: 12, padding: "17px 22px", boxShadow: "0 2px 10px rgba(0,0,0,.05)", border: "1px solid #eee", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, background: ROOMS.find((r) => r.id === b.roomId)?.col || B, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {ROOMS.find((r) => r.id === b.roomId)?.icon || "📅"}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#111", marginBottom: 3 }}>{b.roomName}</div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 1 }}>📅 {fmtD(b.date)} · {fmtT(b.startTime)} – {fmtT(b.endTime)}</div>
                      <div style={{ fontSize: 12, color: "#aaa" }}>👥 {b.attendees} · {b.purpose}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge s={b.status} />
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <button
                          onClick={() => onCancel(b.id)}
                          style={{ padding: "6px 14px", background: "#fff0f0", color: C, border: `1px solid ${C}`, borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <BookingModal
          room={modal.room}
          defDate={modal.defDate}
          defTime={modal.defTime}
          onClose={() => setModal(null)}
          bookings={bookings}
          onSubmit={(data) => { onBook(data); setModal(null); }}
        />
      )}
    </div>
  );
}

// ─── CREATE USER MODAL ───
function CreateUserModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim() || !pass) { setErr("All fields are required."); return; }
    if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    const ok = await onCreate({ name: name.trim(), email: email.trim().toLowerCase(), password: pass });
    if (!ok) setErr("An account with this email already exists.");
  };

  const inp = { width: "100%", padding: "11px 14px", border: "2px solid #eee", borderRadius: 8, fontSize: 14, fontFamily: F, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,.28)" }}>
        <div style={{ background: B, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>Create Agent Account</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", color: "white", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          {[["Full Name", name, setName, "Jane Smith", "text"], ["Email Address", email, setEmail, "agent@iadorlando.com", "email"], ["Password", pass, setPass, "Min. 6 characters", "password"]].map(([lbl, val, set, ph, type]) => (
            <div key={lbl} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, fontFamily: F }}>{lbl}</label>
              <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={inp} onFocus={(e) => (e.target.style.borderColor = B)} onBlur={(e) => (e.target.style.borderColor = "#eee")} />
            </div>
          ))}
          {err && <div style={{ background: "#fff0f0", color: C, border: "1px solid #ffd0cc", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14, fontWeight: 600 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>Cancel</button>
            <button onClick={submit} style={{ flex: 2, padding: "12px", background: B, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 800, fontFamily: F, cursor: "pointer" }}>Create Account ✓</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───
function AdminView({ user, users, bookings, onLogout, onApprove, onReject, onCreateUser, onDeleteUser }) {
  const [view, setView] = useState("overview");
  const [showCU, setShowCU] = useState(false);
  const pending = bookings.filter((b) => b.status === "pending").sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const all = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const agents = users.filter((u) => u.role !== "admin");

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "pending", label: "⏳ Pending" + (pending.length ? ` (${pending.length})` : "") },
    { id: "all", label: "📋 All Bookings" },
    { id: "agents", label: "👥 Manage Agents" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f3faff", fontFamily: F }}>
      <TopBar user={user} onLogout={onLogout} sub="Admin Panel · Orlando, Florida" />
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <div style={{ width: 218, background: "white", borderRight: "1px solid #eee", padding: "16px 0", flexShrink: 0 }}>
          <div style={{ padding: "8px 18px 10px", fontSize: 9, fontWeight: 800, color: "#ccc", textTransform: "uppercase", letterSpacing: "2px", fontFamily: F }}>Navigation</div>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              style={{ width: "100%", padding: "12px 20px", border: "none", textAlign: "left", fontFamily: F, fontSize: 13, fontWeight: 700, cursor: "pointer", background: view === t.id ? "#e8f8ff" : "transparent", color: view === t.id ? B : "#555", borderLeft: `3px solid ${view === t.id ? B : "transparent"}`, transition: "all .15s" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: "26px", overflowY: "auto" }}>
          {/* OVERVIEW */}
          {view === "overview" && (
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#111" }}>Dashboard</h2>
              <p style={{ margin: "0 0 22px", color: "#888", fontSize: 13 }}>The Inspire Space · Orlando, Florida</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 26 }}>
                {[{ l: "Total Bookings", v: bookings.length, c: B }, { l: "Pending", v: pending.length, c: C }, { l: "Confirmed", v: bookings.filter((b) => b.status === "confirmed").length, c: "#2e7d32" }, { l: "Active Agents", v: agents.length, c: D }].map((s, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 12, padding: "18px 16px", boxShadow: "0 2px 12px rgba(0,0,0,.06)", borderTop: `4px solid ${s.c}` }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: s.c, marginBottom: 4 }}>{s.v}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#999" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111" }}>Rooms at a Glance</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 26 }}>
                {ROOMS.map((room) => {
                  const rb = bookings.filter((b) => b.roomId === room.id);
                  const pct = bookings.length ? Math.round((rb.length / bookings.length) * 100) : 0;
                  return (
                    <div key={room.id} style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 22 }}>{room.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>{room.name}</div>
                          {room.approval && <span style={{ fontSize: 9, background: "#fff8e1", color: "#e65100", padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>APPROVAL REQ.</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: room.col }}>{rb.length}</div>
                      <div style={{ fontSize: 10, color: "#bbb", marginBottom: 8, fontWeight: 600 }}>bookings total</div>
                      <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: room.col, borderRadius: 2, transition: "width .4s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111" }}>Recent Bookings</h3>
              <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
                {all.slice(0, 5).map((b, i) => (
                  <div key={b.id} style={{ padding: "12px 18px", borderBottom: i < Math.min(all.length, 5) - 1 ? "1px solid #f0f0f0" : "none", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: ROOMS.find((r) => r.id === b.roomId)?.col || B, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                      {ROOMS.find((r) => r.id === b.roomId)?.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{b.roomName} <span style={{ fontWeight: 400, color: "#999", fontSize: 12 }}>by {b.userName}</span></div>
                      <div style={{ fontSize: 11, color: "#bbb" }}>{fmtD(b.date)} · {fmtT(b.startTime)}–{fmtT(b.endTime)}</div>
                    </div>
                    <Badge s={b.status} />
                  </div>
                ))}
                {all.length === 0 && <div style={{ padding: 36, textAlign: "center", color: "#ccc", fontSize: 13 }}>No bookings yet</div>}
              </div>
            </div>
          )}

          {/* PENDING */}
          {view === "pending" && (
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#111" }}>Pending Approvals</h2>
              <p style={{ margin: "0 0 22px", color: "#888", fontSize: 13 }}>Training Room requests awaiting your review</p>
              {pending.length === 0 ? (
                <div style={{ background: "white", borderRadius: 14, padding: "56px 24px", textAlign: "center", boxShadow: "0 3px 18px rgba(0,0,0,.06)" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                  <div style={{ fontWeight: 800, color: "#444", fontSize: 16 }}>All caught up!</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginTop: 8 }}>No pending requests at this time</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {pending.map((b) => (
                    <div key={b.id} style={{ background: "white", borderRadius: 12, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "2px solid #ffe082" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <span style={{ fontWeight: 900, fontSize: 16, color: "#111" }}>{b.roomName}</span>
                            <Badge s={b.status} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", fontSize: 13, color: "#555" }}>
                            <div>👤 <strong>{b.userName}</strong></div>
                            <div>📧 {b.userEmail}</div>
                            <div>📅 {fmtD(b.date)}</div>
                            <div>🕐 {fmtT(b.startTime)} – {fmtT(b.endTime)}</div>
                            <div>👥 {b.attendees} attendee{b.attendees !== 1 ? "s" : ""}</div>
                            <div style={{ color: "#888", fontSize: 12 }}>📝 {b.purpose}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button onClick={() => onReject(b.id)} style={{ padding: "10px 20px", background: "#fff0f0", color: C, border: `2px solid ${C}`, borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>Reject</button>
                          <button onClick={() => onApprove(b.id)} style={{ padding: "10px 20px", background: "#2e7d32", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>Approve ✓</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALL BOOKINGS */}
          {view === "all" && (
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#111" }}>All Bookings</h2>
              <p style={{ margin: "0 0 22px", color: "#888", fontSize: 13 }}>Full reservation history with all details</p>
              <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                  <thead>
                    <tr style={{ background: "#f6f6f6" }}>
                      {["Room", "Agent", "Date", "Time", "Pax", "Purpose", "Status"].map((h) => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 9, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "2px solid #eee", whiteSpace: "nowrap", fontFamily: F }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {all.map((b, i) => (
                      <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                        <td style={{ padding: "11px 14px", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{ROOMS.find((r) => r.id === b.roomId)?.icon} {b.roomName}</td>
                        <td style={{ padding: "11px 14px" }}><div style={{ fontWeight: 600, fontSize: 13 }}>{b.userName}</div><div style={{ fontSize: 11, color: "#bbb" }}>{b.userEmail}</div></td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>{fmtD(b.date)}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>{fmtT(b.startTime)}–{fmtT(b.endTime)}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, textAlign: "center", color: "#555" }}>{b.attendees}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: "#777", maxWidth: 140 }}>{b.purpose}</td>
                        <td style={{ padding: "11px 14px" }}><Badge s={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {all.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "#ccc", fontSize: 13 }}>No bookings yet</div>}
              </div>
            </div>
          )}

          {/* AGENTS */}
          {view === "agents" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#111" }}>Manage Agents</h2>
                  <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Create and manage team accounts</p>
                </div>
                <button onClick={() => setShowCU(true)} style={{ padding: "10px 22px", background: B, color: "white", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 800, fontFamily: F, cursor: "pointer" }}>+ New Agent</button>
              </div>
              {agents.length === 0 ? (
                <div style={{ background: "white", borderRadius: 14, padding: "56px 24px", textAlign: "center", boxShadow: "0 3px 18px rgba(0,0,0,.06)" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>👥</div>
                  <div style={{ fontWeight: 800, color: "#444", fontSize: 16, marginBottom: 8 }}>No agents yet</div>
                  <button onClick={() => setShowCU(true)} style={{ background: B, color: "white", border: "none", padding: "11px 28px", borderRadius: 9, fontFamily: F, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Create First Agent</button>
                </div>
              ) : (
                <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f6f6f6" }}>
                        {["Agent", "Email", "Bookings", ""].map((h) => (
                          <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 9, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "2px solid #eee", fontFamily: F }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((u, i) => (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: B, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{u.name.charAt(0).toUpperCase()}</div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                                {u.id === "agent-001" && <span style={{ fontSize: 9, background: "#e8f5e9", color: "#2e7d32", padding: "1px 7px", borderRadius: 10, fontWeight: 800 }}>TEST ACCOUNT</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 13, color: "#666" }}>{u.email}</td>
                          <td style={{ padding: "13px 16px", fontSize: 15, fontWeight: 900, color: B, textAlign: "center" }}>{bookings.filter((b) => b.userId === u.id).length}</td>
                          <td style={{ padding: "13px 16px" }}>
                            <button onClick={() => onDeleteUser(u.id)} style={{ padding: "6px 14px", background: "#fff0f0", color: C, border: `1px solid ${C}`, borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showCU && (
        <CreateUserModal
          onClose={() => setShowCU(false)}
          onCreate={async (data) => {
            const ok = await onCreateUser(data);
            if (ok) setShowCU(false);
            return ok;
          }}
        />
      )}
    </div>
  );
}

// ─── ROOT APP ───
export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Load persisted data
  useEffect(() => {
    (async () => {
      let su = await sGet("tis_users");
      let sb = await sGet("tis_bookings");
      if (!su || su.length === 0) {
        su = DEFAULT_USERS;
        await sSet("tis_users", su);
      } else {
        if (!su.find((u) => u.id === "admin-001")) su.unshift(ADMIN);
        if (!su.find((u) => u.id === "agent-001")) su.push(TEST_AGENT);
      }
      if (!sb) { sb = []; await sSet("tis_bookings", sb); }
      setUsers(su);
      setBookings(sb);
    })();
  }, []);

  const updateUsers = async (list) => { setUsers(list); await sSet("tis_users", list); };
  const updateBkgs = async (list) => { setBookings(list); await sSet("tis_bookings", list); };

  const handleBook = async (data) => {
    const nb = { id: gid(), ...data, userId: user.id, userName: user.name, userEmail: user.email, status: data.roomId === "training" ? "pending" : "confirmed", createdAt: new Date().toISOString() };
    await updateBkgs([...bookings, nb]);
    notify(data.roomId === "training" ? "Request submitted! Awaiting admin approval." : "Room booked successfully! ✓");
  };

  const handleApprove = async (id) => { await updateBkgs(bookings.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b))); notify("Booking approved! ✓"); };
  const handleReject = async (id) => { await updateBkgs(bookings.map((b) => (b.id === id ? { ...b, status: "rejected" } : b))); notify("Booking rejected.", "err"); };
  const handleCancel = async (id) => { await updateBkgs(bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))); notify("Booking cancelled."); };

  const handleCreateUser = async (data) => {
    if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      notify("Email already in use.", "err");
      return false;
    }
    const nu = { id: gid(), ...data, role: "agent", joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }) };
    await updateUsers([...users, nu]);
    notify(`Agent account created for ${data.name}! ✓`);
    return true;
  };

  const handleDeleteUser = async (id) => { await updateUsers(users.filter((u) => u.id !== id)); notify("Agent deleted."); };

  if (!user) return <Login users={users} onLogin={setUser} />;

  return (
    <div style={{ fontFamily: F }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {user.role === "admin" ? (
        <AdminView
          user={user} users={users} bookings={bookings}
          onLogout={() => setUser(null)}
          onApprove={handleApprove} onReject={handleReject}
          onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser}
        />
      ) : (
        <AgentView
          user={user} bookings={bookings}
          onLogout={() => setUser(null)}
          onBook={handleBook} onCancel={handleCancel} notify={notify}
        />
      )}
    </div>
  );
}
