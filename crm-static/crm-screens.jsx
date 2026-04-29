// Deals, Activities, Settings screens
function DealsScreen({ onNavigate }) {
  const crm = useCRM();
  const [showForm, setShowForm] = React.useState(false);

  const dealsByStage = crm.stages.filter(s => !s.isLost).map(s => ({
    stage: s,
    deals: crm.deals.filter(d => d.stageId === s.id),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>{crm.deals.length} deals en total</p>
        <button onClick={() => setShowForm(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nuevo Deal</button>
      </div>

      <div className="crm-card" style={{ borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--crm-border)" }}>
              {["Deal", "Contacto", "Etapa", "Valor", "Probabilidad", "Cierre"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crm.deals.map(d => {
              const contact = crm.contacts.find(c => c.id === d.contactId);
              const stage = crm.stages.find(s => s.id === d.stageId);
              return (
                <tr key={d.id} className="crm-table-row" style={{ borderBottom: "1px solid var(--crm-border)", cursor: "pointer" }}
                  onClick={() => contact && onNavigate("contact-detail", contact.id)}>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>{d.title}</td>
                  <td style={{ padding: "10px 14px", color: "var(--crm-text-muted)" }}>{contact?.name || "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, border: `1px solid ${stage?.color}`, color: stage?.color }}>{stage?.name}</span>
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--crm-accent)" }}>{formatCRM(d.value)}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--crm-bg)", overflow: "hidden" }}>
                        <div style={{ width: `${d.probability}%`, height: "100%", borderRadius: 2, background: stage?.color }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{d.probability}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--crm-text-muted)" }}>{formatDateCRM(d.expectedClose)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && <DealFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function DealFormModal({ onClose }) {
  const crm = useCRM();
  const [form, setForm] = React.useState({ title: "", value: "", contactId: crm.contacts[0]?.id || "", stageId: "s1", probability: 20, notes: "" });
  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13, outline: "none" };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    crm.addDeal({ ...form, value: parseInt(form.value) || 0, expectedClose: Date.now() + 30 * 86400000 });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "relative", width: 440, background: "var(--crm-surface)", borderRadius: 16, border: "1px solid var(--crm-border)", padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nuevo Deal</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input required style={fieldStyle} placeholder="Título del deal" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input style={fieldStyle} placeholder="Valor (centavos)" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            <select style={fieldStyle} value={form.stageId} onChange={e => setForm({ ...form, stageId: e.target.value })}>
              {crm.stages.filter(s => !s.isLost).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <select style={fieldStyle} value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
            {crm.contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Crear Deal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Activities Screen
function ActivitiesScreen() {
  const crm = useCRM();
  const [filter, setFilter] = React.useState("all");
  const sorted = [...crm.activities].sort((a, b) => b.createdAt - a.createdAt);
  const filtered = filter === "all" ? sorted : filter === "pending" ? sorted.filter(a => !a.completedAt && a.scheduledAt) : sorted.filter(a => a.type === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[{ v: "all", l: "Todas" }, { v: "pending", l: "Pendientes" }, { v: "call", l: "Llamadas" }, { v: "email", l: "Emails" }, { v: "meeting", l: "Reuniones" }, { v: "follow_up", l: "Seguimientos" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            style={{ padding: "7px 12px", borderRadius: 6, border: "1px solid var(--crm-border)", fontSize: 12, cursor: "pointer", background: filter === f.v ? "var(--crm-accent)" : "var(--crm-surface)", color: filter === f.v ? "var(--crm-accent-text)" : "var(--crm-text-muted)", fontWeight: filter === f.v ? 600 : 400 }}>
            {f.l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(a => {
          const contact = crm.contacts.find(c => c.id === a.contactId);
          const isOverdue = !a.completedAt && a.scheduledAt && a.scheduledAt < Date.now();
          return (
            <div key={a.id} className="crm-card" style={{ padding: 14, borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 12, borderLeft: isOverdue ? "3px solid var(--crm-danger)" : undefined }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--crm-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{ACTIVITY_ICONS[a.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: "var(--crm-bg)", color: "var(--crm-text-muted)" }}>{ACTIVITY_LABELS[a.type]}</span>
                  {contact && <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>· {contact.name}</span>}
                  {isOverdue && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "rgba(239,68,68,0.12)", color: "var(--crm-danger)" }}>Vencido</span>}
                  {a.completedAt && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>Completado</span>}
                </div>
                <div style={{ fontSize: 13 }}>{a.description}</div>
                <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 3 }}>{formatRelative(a.createdAt)}</div>
              </div>
              {!a.completedAt && a.scheduledAt && (
                <button onClick={() => crm.completeActivity(a.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text-muted)", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>Completar</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Settings Screen with Sheet connection
function SettingsScreen() {
  const crm = useCRM();
  const [sheetUrl, setSheetUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const handleConnect = async () => {
    if (!sheetUrl.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await crm.connectSheet(sheetUrl);
    setResult(res);
    setLoading(false);
  };

  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13, outline: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
      {/* Sheet connection */}
      <div className="crm-card" style={{ padding: 24, borderRadius: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Conectar Google Sheet</h3>
        <p style={{ fontSize: 12, color: "var(--crm-text-muted)", marginBottom: 16 }}>Importa contactos automáticamente desde una hoja de Google Sheets pública.</p>

        {crm.sheetConfig.isConnected && (
          <div style={{ padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 16, fontSize: 12, color: "#22c55e" }}>
            ✓ Conectada · Última sincronización: {formatRelative(crm.sheetConfig.lastSync)}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...fieldStyle, flex: 1 }} placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} />
          <button onClick={handleConnect} disabled={loading}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
            {loading ? "Conectando..." : "Conectar"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 12, fontSize: 12, color: result.success ? "#22c55e" : "var(--crm-danger)" }}>
            {result.success ? `✓ Se importaron ${result.count} contactos` : `✗ ${result.error}`}
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--crm-bg)", fontSize: 12, color: "var(--crm-text-muted)" }}>
          <strong>Formato requerido:</strong> La hoja debe tener columnas: nombre, email, telefono, empresa, fuente, temperatura, score, notas. La hoja debe ser pública (Compartir → "Cualquiera con el enlace").
        </div>
      </div>

      {/* General config */}
      <div className="crm-card" style={{ padding: 24, borderRadius: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Configuración General</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--crm-border)" }}>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>Moneda</div><div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>Moneda para mostrar valores</div></div>
            <span style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>COP ($)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--crm-border)" }}>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>Idioma</div><div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>Idioma de la interfaz</div></div>
            <span style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>Español</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--crm-border)" }}>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>Notificaciones</div><div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>Alertas para seguimientos vencidos</div></div>
            <span style={{ fontSize: 13, color: "#22c55e" }}>Activas</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>Clasificación IA</div><div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>Usar Claude para clasificar leads</div></div>
            <span style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>Reglas automáticas</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="crm-card" style={{ padding: 24, borderRadius: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Exportar Datos</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 13, cursor: "pointer" }}>Exportar Contactos (CSV)</button>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 13, cursor: "pointer" }}>Exportar Deals (CSV)</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DealsScreen, ActivitiesScreen, SettingsScreen, DealFormModal });
