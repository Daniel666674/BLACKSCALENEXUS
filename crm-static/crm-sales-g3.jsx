// Sales GROUP 3 — Account Management
// ClientsScreen · RenewalsScreen (drag-and-drop kanban) · DeliverablesScreen

// ── Seed data ─────────────────────────────────────────────────────────────────

// Clients and deliverables are derived from real CRM won deals — no seed data
const CLIENTS_SEED = [];
const DELIVERABLES_SEED = [];

// Map a won CRM deal to a client card object
function dealToClient(deal, stages, contacts) {
  const contact = contacts.find(c => c.id === deal.contactId) || {};
  return {
    id: deal.id,
    dealId: deal.id,
    name: contact.name || "—",
    company: contact.company || deal.title || "—",
    contractValue: deal.value || 0,
    startDate: deal.createdAt || Date.now(),
    endDate: deal.expectedClose || (Date.now() + 365*86400000),
    healthScore: 7,
    renewalStage: "Saludable",
    openDeliverables: 0,
    lastInteraction: deal.updatedAt || deal.createdAt || Date.now(),
  };
}

const RENEWAL_STAGES = ["Saludable", "Check-in Pendiente", "Conversación de Renovación", "Renovado", "Expandido", "En Riesgo"];

const STATUS_COLORS = {
  "Pendiente": "#7a756e",
  "En progreso": "#f59e0b",
  "Entregado": "#22c55e",
  "Vencido": "#ef4444",
};

// ── CLIENTS SCREEN ────────────────────────────────────────────────────────────

function ClientsScreen() {
  const crm = useCRM();
  const wonDeals = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);
  const [clients, setClients] = React.useState([]);
  const [editHealth, setEditHealth] = React.useState({});

  React.useEffect(() => {
    setClients(wonDeals.map(d => dealToClient(d, crm.stages, crm.contacts)));
  }, [crm.deals.length, crm.contacts.length]);

  const now = Date.now();

  const renewalColor = (ms) => {
    const days = Math.ceil((ms - now) / 86400000);
    if (days < 0) return "#ef4444";
    if (days < 30) return "#ef4444";
    if (days < 60) return "#f59e0b";
    return "#22c55e";
  };

  const updateHealth = (id, val) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, healthScore: val } : c));
    setEditHealth(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div>
      <SectionHeader title="Clientes Activos" subtitle="Contratos ganados · salud, renovación y entregables" />
      {!clients.length && <EmptyState icon="🤝" message="No hay clientes activos aún. Los deals marcados como Ganado aparecerán aquí." />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
        {clients.map(c => {
          const days = Math.ceil((c.endDate - now) / 86400000);
          const rColor = renewalColor(c.endDate);
          const healthColor = c.healthScore >= 7 ? "#22c55e" : c.healthScore >= 4 ? "#f59e0b" : "#ef4444";
          return (
            <div key={c.id} className="crm-card" style={{ borderRadius: 12, padding: 20 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.company}</div>
                  <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginTop: 2 }}>{c.name}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--crm-accent)" }}>{formatCRM(c.contractValue)}</div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {/* Renewal countdown */}
                <div style={{ padding: "10px 12px", borderRadius: 8, background: `${rColor}0e`, border: `1px solid ${rColor}22` }}>
                  <div style={{ fontSize: 10, color: rColor, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4 }}>Renovación</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: rColor }}>{days < 0 ? `Hace ${Math.abs(days)}d` : `${days}d`}</div>
                  <div style={{ fontSize: 10, color: "var(--crm-text-muted)" }}>{fDD(c.endDate)}</div>
                </div>

                {/* Health score */}
                <div style={{ padding: "10px 12px", borderRadius: 8, background: `${healthColor}0e`, border: `1px solid ${healthColor}22` }}>
                  <div style={{ fontSize: 10, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4 }}>Health Score</div>
                  {editHealth[c.id]
                    ? <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <input type="number" min={1} max={10} defaultValue={c.healthScore}
                        style={{ width: 48, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 14 }}
                        onKeyDown={e => { if (e.key === "Enter") updateHealth(c.id, +e.target.value); }}
                        onBlur={e => updateHealth(c.id, +e.target.value)}
                        autoFocus />
                      <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>/10</span>
                    </div>
                    : <div style={{ fontSize: 18, fontWeight: 700, color: healthColor, cursor: "pointer" }}
                      onClick={() => setEditHealth(prev => ({ ...prev, [c.id]: true }))}>
                      {c.healthScore}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--crm-text-muted)" }}>/10</span>
                      <span style={{ fontSize: 10, color: "var(--crm-text-muted)", marginLeft: 4 }}>✎</span>
                    </div>
                  }
                </div>
              </div>

              {/* Bottom row */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--crm-text-muted)" }}>
                <span>
                  <span style={{ fontWeight: 600, color: c.openDeliverables > 0 ? "#f59e0b" : "#22c55e" }}>{c.openDeliverables}</span> entregable{c.openDeliverables !== 1 ? "s" : ""} abierto{c.openDeliverables !== 1 ? "s" : ""}
                </span>
                <span>Último contacto: {formatRelative(c.lastInteraction)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RENEWALS KANBAN (HTML5 drag-and-drop) ────────────────────────────────────

function RenewalsScreen() {
  const crm = useCRM();
  const wonDeals = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);
  const [clients, setClients] = React.useState([]);
  const [dragId, setDragId] = React.useState(null);

  React.useEffect(() => {
    setClients(wonDeals.map(d => dealToClient(d, crm.stages, crm.contacts)));
  }, [crm.deals.length, crm.contacts.length]);
  const [dragOverStage, setDragOverStage] = React.useState(null);

  const stageClients = stage => clients.filter(c => c.renewalStage === stage);

  const handleDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, stage) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverStage(stage); };
  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (dragId) setClients(prev => prev.map(c => c.id === dragId ? { ...c, renewalStage: stage } : c));
    setDragId(null); setDragOverStage(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverStage(null); };

  const stageColor = s => ({
    "Saludable": "#22c55e", "Check-in Pendiente": "#f59e0b",
    "Conversación de Renovación": "#3b82f6", "Renovado": "#22c55e",
    "Expandido": "#a855f7", "En Riesgo": "#ef4444",
  }[s] || "var(--crm-text-muted)");

  const now = Date.now();

  return (
    <div>
      <SectionHeader title="Renovaciones" subtitle="Kanban de renovaciones · arrastra las tarjetas entre etapas" />
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
        {RENEWAL_STAGES.map(stage => {
          const items = stageClients(stage);
          const isOver = dragOverStage === stage;
          return (
            <div key={stage}
              onDragOver={e => handleDragOver(e, stage)}
              onDrop={e => handleDrop(e, stage)}
              style={{ minWidth: 220, maxWidth: 240, flexShrink: 0 }}>
              {/* Column header */}
              <div style={{ borderRadius: "10px 10px 0 0", padding: "10px 14px", borderBottom: `2px solid ${stageColor(stage)}`, background: `${stageColor(stage)}08`, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: stageColor(stage), textTransform: "uppercase", letterSpacing: "0.07em" }}>{stage}</div>
                <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginTop: 2 }}>{items.length} cliente{items.length !== 1 ? "s" : ""}</div>
              </div>

              {/* Drop zone */}
              <div style={{ minHeight: 120, padding: "4px 0", borderRadius: 8, background: isOver ? "rgba(209,156,21,0.04)" : "transparent", transition: "background 0.15s", border: isOver ? "1px dashed rgba(209,156,21,0.3)" : "1px dashed transparent" }}>
                {items.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 12px", fontSize: 12, color: "var(--crm-text-muted)", opacity: 0.5 }}>Arrastra aquí</div>
                )}
                {items.map(c => {
                  const days = Math.ceil((c.endDate - now) / 86400000);
                  const rColor = days < 30 ? "#ef4444" : days < 60 ? "#f59e0b" : "#22c55e";
                  return (
                    <div key={c.id}
                      draggable
                      onDragStart={e => handleDragStart(e, c.id)}
                      onDragEnd={handleDragEnd}
                      className="crm-card crm-deal-card"
                      style={{ borderRadius: 8, padding: 12, marginBottom: 8, cursor: "grab", opacity: dragId === c.id ? 0.4 : 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{c.company}</div>
                      <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginBottom: 8 }}>{formatCRM(c.contractValue)}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: rColor, fontWeight: 600 }}>{days < 0 ? "Vencido" : `${days}d`}</span>
                        <span style={{ fontSize: 11, color: c.healthScore >= 7 ? "#22c55e" : c.healthScore >= 4 ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>
                          ❤ {c.healthScore}/10
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DELIVERABLES SCREEN ───────────────────────────────────────────────────────

const STATUS_ORDER = ["Vencido", "En progreso", "Pendiente", "Entregado"];

function DeliverablesScreen() {
  const crm = useCRM();
  const wonDeals = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);
  const liveClients = wonDeals.map(d => dealToClient(d, crm.stages, crm.contacts));
  const [items, setItems] = React.useState([]);
  const [clientFilter, setClientFilter] = React.useState("Todos");
  const [ownerFilter, setOwnerFilter] = React.useState("Todos");
  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", clientId: "cl1", status: "Pendiente", dueDate: "", owner: "Daniel" });

  const clients = [...new Set(items.map(i => i.client))];
  const now = Date.now();

  const updateStatus = (id, status) => setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));

  const addDeliverable = () => {
    if (!form.title) return;
    const client = liveClients.find(c => c.id === form.clientId);
    setItems(prev => [{ ...form, id: `dv${Date.now()}`, client: client?.company || "Cliente" }, ...prev]);
    setForm({ title: "", clientId: "cl1", status: "Pendiente", dueDate: "", owner: "Daniel" });
    setShowAdd(false);
  };

  const filtered = items
    .filter(i => clientFilter === "Todos" || i.client === clientFilter)
    .filter(i => ownerFilter === "Todos" || i.owner === ownerFilter)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const overdue = filtered.filter(i => i.status === "Vencido").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Entregables</h2>
          <p style={{ fontSize: 13, color: "var(--crm-text-muted)", marginTop: 4 }}>
            Seguimiento por cliente · {overdue > 0 && <span style={{ color: "#ef4444", fontWeight: 600 }}>{overdue} vencido{overdue !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Nuevo entregable
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}
          style={{ padding: "7px 28px 7px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 12 }}>
          <option>Todos</option>
          {clients.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
          style={{ padding: "7px 28px 7px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 12 }}>
          <option>Todos</option>
          <option>Daniel</option>
          <option>Julian</option>
        </select>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 440, background: "var(--crm-surface)", border: "1px solid var(--crm-border)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Nuevo Entregable</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Título</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Cliente</label>
                <select value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                  style={{ width: "100%", padding: "8px 28px 8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }}>
                  {liveClients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Responsable</label>
                <select value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))}
                  style={{ width: "100%", padding: "8px 28px 8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }}>
                  <option>Daniel</option>
                  <option>Julian</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Fecha límite</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text-muted)", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={addDeliverable}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!filtered.length
        ? <EmptyState icon="📋" message="No hay entregables con este filtro" />
        : <div className="crm-card" style={{ borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--crm-border)" }}>
                {["Entregable", "Cliente", "Estado", "Fecha límite", "Responsable"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "var(--crm-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isOverdue = item.status === "Vencido";
                const dueDateTs = item.dueDate ? new Date(item.dueDate).getTime() : null;
                const daysLeft = dueDateTs ? Math.ceil((dueDateTs - now) / 86400000) : null;
                return (
                  <tr key={item.id} className="crm-table-row"
                    style={{ borderBottom: "1px solid var(--crm-border)", background: isOverdue ? "rgba(239,68,68,0.03)" : "transparent" }}>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: isOverdue ? 600 : 400 }}>{item.title}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--crm-text-muted)" }}>{item.client}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}
                        style={{ padding: "4px 24px 4px 8px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: `${STATUS_COLORS[item.status]}18`, color: STATUS_COLORS[item.status] }}>
                        {["Pendiente", "En progreso", "Entregado", "Vencido"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: isOverdue ? "#ef4444" : "var(--crm-text-muted)" }}>
                      {dueDateTs ? fDD(dueDateTs) : item.dueDate || "—"}
                      {daysLeft !== null && !isOverdue && daysLeft <= 3 && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: "#f59e0b" }}>({daysLeft}d)</span>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: item.owner === "Daniel" ? "rgba(209,156,21,0.1)" : "rgba(85,28,37,0.12)", color: item.owner === "Daniel" ? "var(--crm-accent)" : "#8a3040" }}>
                        {item.owner}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

Object.assign(window, {
  CLIENTS_SEED, DELIVERABLES_SEED,
  ClientsScreen, RenewalsScreen, DeliverablesScreen,
});
