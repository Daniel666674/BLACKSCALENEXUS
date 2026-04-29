// Handoff Center — pass leads to sales + register new leads
function HandoffCenter() {
  const mkt = useMarketing();
  const [newLead, setNewLead] = React.useState({ name: "", company: "", email: "", phone: "", source: "website", tier: 2, brevo_cadence: "Cold Welcome", marketing_notes: "", industry: "" });

  const readyContacts = mkt.contacts.filter(c => (c.ready_for_sales || c.engagement_status === "hot") && !c.passed_to_sales_at);
  const passedContacts = mkt.contacts.filter(c => c.passed_to_sales_at).sort((a, b) => b.passed_to_sales_at - a.passed_to_sales_at);

  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--mkt-border)", background: "var(--mkt-bg)", color: "var(--mkt-text)", fontSize: 13, outline: "none" };
  const labelStyle = { fontSize: 11, fontWeight: 500, color: "var(--mkt-text-muted)", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" };

  const TierBadge = ({ tier }) => {
    const colors = { 1: { bg: "var(--mkt-accent)", text: "#0a0a0a" }, 2: { bg: "rgba(255,255,255,0.1)", text: "var(--mkt-text-muted)" }, 3: { bg: "rgba(255,255,255,0.04)", text: "rgba(255,255,255,0.3)" } };
    const c = colors[tier] || colors[3];
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: c.bg, color: c.text }}>T{tier}</span>;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLead.name.trim()) return;
    mkt.addContact(newLead);
    setNewLead({ name: "", company: "", email: "", phone: "", source: "website", tier: 2, brevo_cadence: "Cold Welcome", marketing_notes: "", industry: "" });
  };

  const cadences = [...new Set(mkt.contacts.map(c => c.brevo_cadence))];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Left: Ready to pass */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          Listos para pasar a ventas
          <span style={{ fontSize: 12, fontWeight: 600, padding: "1px 8px", borderRadius: 10, background: "var(--mkt-accent)", color: "#0a0a0a" }}>{readyContacts.length}</span>
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {readyContacts.length === 0 ? (
            <div className="mkt-card" style={{ padding: 24, borderRadius: 12, textAlign: "center", color: "var(--mkt-text-muted)", fontSize: 13 }}>
              No hay leads listos para pasar
            </div>
          ) : readyContacts.map(c => (
            <div key={c.id} className="mkt-card" style={{ padding: 14, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <TierBadge tier={c.tier} />
                </div>
                <div style={{ fontSize: 11, color: "var(--mkt-text-muted)" }}>{c.company}</div>
                <div style={{ fontSize: 10, color: "var(--mkt-text-muted)", marginTop: 2 }}>
                  {c.brevo_cadence} · {formatRelative(c.lastActivity)}
                </div>
              </div>
              <button onClick={() => mkt.passToSales(c.id)}
                style={{
                  padding: "8px 14px", borderRadius: 8, border: "none",
                  background: "var(--mkt-accent)", color: "#0a0a0a", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>
                Enviar a pipeline →
              </button>
            </div>
          ))}
        </div>

        {/* Recently passed */}
        {passedContacts.length > 0 && (
          <>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--mkt-text-muted)" }}>Enviados recientemente</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {passedContacts.slice(0, 5).map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
                  <span style={{ fontSize: 12, color: "#22c55e" }}>✓</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{c.name} — {c.company}</span>
                  <span style={{ fontSize: 10, color: "var(--mkt-text-muted)" }}>{formatRelative(c.passed_to_sales_at)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Register new lead */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Registrar nuevo lead</h3>
        <div className="mkt-card" style={{ padding: 20, borderRadius: 12 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label style={labelStyle}>Nombre *</label><input required style={fieldStyle} value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={labelStyle}>Empresa</label><input style={fieldStyle} value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} /></div>
              <div><label style={labelStyle}>Industria</label><input style={fieldStyle} value={newLead.industry} onChange={e => setNewLead({ ...newLead, industry: e.target.value })} placeholder="Ej: Tecnología" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={labelStyle}>Email</label><input type="email" style={fieldStyle} value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} /></div>
              <div><label style={labelStyle}>Teléfono</label><input style={fieldStyle} value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div><label style={labelStyle}>Fuente</label>
                <select style={{ ...fieldStyle, appearance: "none" }} value={newLead.source} onChange={e => setNewLead({ ...newLead, source: e.target.value })}>
                  {MKT_SOURCES.map(s => <option key={s} value={s}>{MKT_SOURCE_LABELS[s]}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Tier</label>
                <select style={{ ...fieldStyle, appearance: "none" }} value={newLead.tier} onChange={e => setNewLead({ ...newLead, tier: parseInt(e.target.value) })}>
                  <option value={1}>Tier 1</option><option value={2}>Tier 2</option><option value={3}>Tier 3</option>
                </select>
              </div>
              <div><label style={labelStyle}>Cadencia Brevo</label>
                <select style={{ ...fieldStyle, appearance: "none" }} value={newLead.brevo_cadence} onChange={e => setNewLead({ ...newLead, brevo_cadence: e.target.value })}>
                  {cadences.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Notas</label><textarea style={{ ...fieldStyle, height: 60, resize: "vertical" }} value={newLead.marketing_notes} onChange={e => setNewLead({ ...newLead, marketing_notes: e.target.value })} /></div>
            <button type="submit" style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--mkt-accent)", color: "#0a0a0a", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              Registrar Lead
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HandoffCenter });
