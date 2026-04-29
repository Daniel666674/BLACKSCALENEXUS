// Engagement Board — Kanban with drag & drop by engagement temperature
function EngagementBoard() {
  const mkt = useMarketing();
  const [draggedContact, setDraggedContact] = React.useState(null);
  const [dragOverCol, setDragOverCol] = React.useState(null);
  const [filterTier, setFilterTier] = React.useState("");
  const [filterCadence, setFilterCadence] = React.useState("");
  const [filterSource, setFilterSource] = React.useState("");
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const columns = [
    { id: "hot", label: "HOT", icon: "🔥", tint: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.15)" },
    { id: "warm", label: "WARM", icon: "👀", tint: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.15)" },
    { id: "cold", label: "COLD", icon: "💤", tint: "rgba(100,116,139,0.04)", borderColor: "rgba(100,116,139,0.15)" },
    { id: "dead", label: "DEAD", icon: "⛔", tint: "rgba(239,68,68,0.02)", borderColor: "rgba(100,116,139,0.1)" },
  ];

  const filtered = mkt.contacts.filter(c => {
    if (filterTier && c.tier !== parseInt(filterTier)) return false;
    if (filterCadence && c.brevo_cadence !== filterCadence) return false;
    if (filterSource && c.source !== filterSource) return false;
    return true;
  });

  const cadences = [...new Set(mkt.contacts.map(c => c.brevo_cadence))];

  const handleDragStart = (e, contact) => { setDraggedContact(contact); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, colId) => { e.preventDefault(); setDragOverCol(colId); };
  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (draggedContact && draggedContact.engagement_status !== colId) mkt.updateEngagement(draggedContact.id, colId);
    setDraggedContact(null); setDragOverCol(null);
  };

  const TierBadge = ({ tier }) => {
    const colors = { 1: { bg: "var(--mkt-accent)", text: "#0a0a0a" }, 2: { bg: "rgba(255,255,255,0.1)", text: "var(--mkt-text-muted)" }, 3: { bg: "rgba(255,255,255,0.04)", text: "rgba(255,255,255,0.3)" } };
    const c = colors[tier] || colors[3];
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: c.bg, color: c.text }}>T{tier}</span>;
  };

  const selectStyle = { padding: "6px 28px 6px 10px", borderRadius: 6, border: "1px solid var(--mkt-border)", background: "var(--mkt-surface)", color: "var(--mkt-text)", fontSize: 12, outline: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select style={selectStyle} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
          <option value="">Todos los Tiers</option>
          <option value="1">Tier 1</option><option value="2">Tier 2</option><option value="3">Tier 3</option>
        </select>
        <select style={selectStyle} value={filterCadence} onChange={e => setFilterCadence(e.target.value)}>
          <option value="">Todas las cadencias</option>
          {cadences.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={selectStyle} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">Todas las fuentes</option>
          {MKT_SOURCES.map(s => <option key={s} value={s}>{MKT_SOURCE_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {columns.map(col => {
          const colContacts = filtered.filter(c => c.engagement_status === col.id);
          const isOver = dragOverCol === col.id;
          return (
            <div key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              style={{
                flex: 1, minWidth: 240, display: "flex", flexDirection: "column", borderRadius: 12,
                background: isOver ? `${col.tint}` : "var(--mkt-surface)",
                border: `1px solid ${isOver ? "var(--mkt-accent)" : col.borderColor}`,
                transition: "all 0.2s",
              }}>
              {/* Header */}
              <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${col.borderColor}`, background: col.tint, borderRadius: "12px 12px 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{col.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>{col.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "var(--mkt-text-muted)", background: "var(--mkt-bg)",
                    padding: "1px 8px", borderRadius: 10, marginLeft: "auto",
                    opacity: animated ? 1 : 0, transition: "opacity 0.5s",
                  }}>{colContacts.length}</span>
                </div>
              </div>

              {/* Cards */}
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 120, flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 260px)" }}>
                {colContacts.map((contact, i) => {
                  const isDragging = draggedContact?.id === contact.id;
                  return (
                    <div key={contact.id} draggable onDragStart={e => handleDragStart(e, contact)}
                      onDragEnd={() => { setDraggedContact(null); setDragOverCol(null); }}
                      className="mkt-card mkt-engagement-card"
                      style={{
                        padding: 12, borderRadius: 8, cursor: "grab", opacity: isDragging ? 0.4 : 1,
                        transition: "all 0.15s", animationDelay: `${i * 50}ms`,
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{contact.name}</div>
                          <div style={{ fontSize: 11, color: "var(--mkt-text-muted)" }}>{contact.company}</div>
                        </div>
                        <TierBadge tier={contact.tier} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--mkt-accent)", marginBottom: 6, opacity: 0.8 }}>{contact.brevo_cadence}</div>
                      {/* Score bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--mkt-bg)", overflow: "hidden" }}>
                          <div style={{ width: `${contact.score}%`, height: "100%", borderRadius: 2, background: contact.score >= 70 ? "#22c55e" : contact.score >= 40 ? "#f59e0b" : "var(--mkt-text-muted)", transition: "width 0.8s ease" }} />
                        </div>
                        <span style={{ fontSize: 10, color: "var(--mkt-text-muted)" }}>{contact.score}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--mkt-text-muted)" }}>{formatRelative(contact.lastActivity)}</span>
                        {(col.id === "hot" || col.id === "warm") && !contact.passed_to_sales_at && (
                          <button onClick={(e) => { e.stopPropagation(); mkt.passToSales(contact.id); }}
                            style={{
                              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                              border: "1px solid var(--mkt-accent)", background: "transparent",
                              color: "var(--mkt-accent)", cursor: "pointer", transition: "all 0.15s",
                            }} className="mkt-pass-btn">
                            Pasar a ventas →
                          </button>
                        )}
                        {contact.passed_to_sales_at && (
                          <span style={{ fontSize: 10, color: "#22c55e" }}>✓ Enviado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {colContacts.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--mkt-text-muted)", opacity: 0.4 }}>
                    Arrastra aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { EngagementBoard });
