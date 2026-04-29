// Campaign Performance Wall
function CampaignWall() {
  const mkt = useMarketing();
  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState(null);
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const rateColor = (rate, thresholds) => {
    if (rate >= thresholds[0]) return "#22c55e";
    if (rate >= thresholds[1]) return "#f59e0b";
    return "#ef4444";
  };

  const StatusBadge = ({ status }) => {
    const cfg = { active: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Activa" }, paused: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Pausada" }, completed: { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", label: "Completada" } };
    const c = cfg[status] || cfg.active;
    return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>;
  };

  const AnimatedNum = ({ value, suffix = "" }) => {
    const [display, setDisplay] = React.useState(0);
    React.useEffect(() => {
      if (!animated) return;
      let start = 0; const end = value; const duration = 800; const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(start + (end - start) * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      tick();
    }, [animated, value]);
    return <>{display}{suffix}</>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 13, color: "var(--mkt-text-muted)" }}>{mkt.campaigns.length} campañas registradas</p>
        <button onClick={() => setShowForm(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--mkt-accent)", color: "#0a0a0a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nueva Campaña</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {mkt.campaigns.map((camp, i) => (
          <div key={camp.id} className="mkt-card mkt-campaign-card"
            style={{ padding: 18, borderRadius: 12, cursor: "pointer", transition: "all 0.2s", animationDelay: `${i * 60}ms` }}
            onClick={() => setExpandedId(expandedId === camp.id ? null : camp.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{camp.name}</div>
                <div style={{ fontSize: 11, color: "var(--mkt-text-muted)" }}>{camp.targetSegment}</div>
              </div>
              <StatusBadge status={camp.status} />
            </div>

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Open Rate", value: camp.openRate, thresholds: [30, 15] },
                { label: "Click Rate", value: camp.clickRate, thresholds: [10, 5] },
                { label: "Reply Rate", value: camp.replyRate, thresholds: [5, 2] },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 10, color: "var(--mkt-text-muted)", marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: rateColor(m.value, m.thresholds) }}>
                    <AnimatedNum value={m.value} suffix="%" />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--mkt-text-muted)", paddingTop: 10, borderTop: "1px solid var(--mkt-border)" }}>
              <span>{camp.totalContacts} contactos</span>
              <span style={{ color: camp.conversions > 0 ? "var(--mkt-accent)" : "var(--mkt-text-muted)", fontWeight: 600 }}>
                {camp.conversions} al pipeline
              </span>
              {camp.lastSent && <span>{formatRelative(camp.lastSent)}</span>}
            </div>

            {/* Expanded timeline */}
            {expandedId === camp.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--mkt-border)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Timeline de actividad</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { date: "Hace 2 días", text: `Batch enviado a ${Math.round(camp.totalContacts * 0.3)} contactos` },
                    { date: "Hace 5 días", text: `${Math.round(camp.totalContacts * camp.openRate / 100)} aperturas registradas` },
                    { date: "Hace 7 días", text: `Campaña ${camp.status === "active" ? "activada" : camp.status === "paused" ? "pausada" : "completada"}` },
                    { date: formatRelative(camp.startDate), text: "Campaña creada" },
                  ].map((ev, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--mkt-accent)", marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <span style={{ color: "var(--mkt-text-muted)" }}>{ev.date}</span>
                        <span style={{ marginLeft: 8 }}>{ev.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Campaign Modal */}
      {showForm && <CampaignFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function CampaignFormModal({ onClose }) {
  const mkt = useMarketing();
  const [form, setForm] = React.useState({ name: "", status: "active", startDate: new Date().toISOString().split("T")[0], targetSegment: "", cadenceType: "outreach", totalContacts: 0 });
  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--mkt-border)", background: "var(--mkt-bg)", color: "var(--mkt-text)", fontSize: 13, outline: "none" };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    mkt.addCampaign({ ...form, startDate: new Date(form.startDate).getTime(), totalContacts: parseInt(form.totalContacts) || 0 });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "relative", width: 440, background: "var(--mkt-surface)", borderRadius: 16, border: "1px solid var(--mkt-border)", padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nueva Campaña</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input required style={fieldStyle} placeholder="Nombre de la campaña" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input type="date" style={fieldStyle} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <select style={{ ...fieldStyle, appearance: "none" }} value={form.cadenceType} onChange={e => setForm({ ...form, cadenceType: e.target.value })}>
              <option value="outreach">Outreach</option><option value="nurturing">Nurturing</option><option value="onboarding">Onboarding</option>
              <option value="event">Evento</option><option value="welcome">Welcome</option><option value="reengagement">Re-engagement</option>
            </select>
          </div>
          <input style={fieldStyle} placeholder="Segmento objetivo" value={form.targetSegment} onChange={e => setForm({ ...form, targetSegment: e.target.value })} />
          <input type="number" style={fieldStyle} placeholder="Total contactos" value={form.totalContacts} onChange={e => setForm({ ...form, totalContacts: e.target.value })} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--mkt-border)", background: "transparent", color: "var(--mkt-text)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--mkt-accent)", color: "#0a0a0a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { CampaignWall, CampaignFormModal });
