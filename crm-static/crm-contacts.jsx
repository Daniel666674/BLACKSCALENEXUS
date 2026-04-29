// Contacts Screen + Contact Detail with Stage/Score/Next Steps tabs
function ContactsScreen({ onNavigate }) {
  const crm = useCRM();
  const [search, setSearch] = React.useState("");
  const [filterTemp, setFilterTemp] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);

  const filtered = crm.contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
    const matchTemp = !filterTemp || c.temperature === filterTemp;
    return matchSearch && matchTemp;
  });

  const TempBadge = ({ temp }) => {
    const cfg = { hot: { label: "Caliente", bg: "rgba(239,68,68,0.12)", color: "#ef4444" }, warm: { label: "Tibio", bg: "rgba(245,158,11,0.12)", color: "#f59e0b" }, cold: { label: "Frío", bg: "rgba(100,116,139,0.12)", color: "#94a3b8" } };
    const c = cfg[temp] || cfg.cold;
    return <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, email o empresa..."
            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-surface)", color: "var(--crm-text)", fontSize: 13, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ v: "", l: "Todos" }, { v: "hot", l: "Caliente" }, { v: "warm", l: "Tibio" }, { v: "cold", l: "Frío" }].map(f => (
            <button key={f.v} onClick={() => setFilterTemp(f.v)}
              style={{ padding: "7px 12px", borderRadius: 6, border: "1px solid var(--crm-border)", fontSize: 12, cursor: "pointer", background: filterTemp === f.v ? "var(--crm-accent)" : "var(--crm-surface)", color: filterTemp === f.v ? "var(--crm-accent-text)" : "var(--crm-text-muted)", fontWeight: filterTemp === f.v ? 600 : 400, transition: "all 0.15s" }}>
              {f.l}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Nuevo
        </button>
      </div>

      {/* Table */}
      <div className="crm-card" style={{ borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--crm-border)" }}>
              {["Nombre", "Empresa", "Fuente", "Temperatura", "Score", "Fecha"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => onNavigate("contact-detail", c.id)} className="crm-table-row" style={{ cursor: "pointer", borderBottom: "1px solid var(--crm-border)" }}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--crm-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--crm-accent-text)", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{c.email || "—"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: "var(--crm-text-muted)" }}>{c.company || "—"}</td>
                <td style={{ padding: "10px 14px", color: "var(--crm-text-muted)" }}>{SOURCE_LABELS_CRM[c.source] || c.source}</td>
                <td style={{ padding: "10px 14px" }}><TempBadge temp={c.temperature} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 48, height: 4, borderRadius: 2, background: "var(--crm-bg)", overflow: "hidden" }}>
                      <div style={{ width: `${c.score}%`, height: "100%", borderRadius: 2, background: c.score >= 70 ? "var(--crm-danger)" : c.score >= 40 ? "#f59e0b" : "var(--crm-text-muted)" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{c.score}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--crm-text-muted)" }}>{formatDateCRM(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "var(--crm-text-muted)", textAlign: "center" }}>{filtered.length} de {crm.contacts.length} contactos</p>

      {/* Add Contact Modal */}
      {showForm && <ContactFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

// Contact Form Modal
function ContactFormModal({ onClose, initialData }) {
  const crm = useCRM();
  const [form, setForm] = React.useState(initialData || { name: "", email: "", phone: "", company: "", source: "otro", temperature: "cold", notes: "" });
  const isEdit = !!initialData?.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (isEdit) {
      crm.updateContact(initialData.id, form);
    } else {
      crm.addContact({ ...form, score: form.temperature === "hot" ? 70 : form.temperature === "warm" ? 40 : 15 });
    }
    onClose();
  };

  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13, outline: "none" };
  const labelStyle = { fontSize: 12, fontWeight: 500, color: "var(--crm-text-muted)", marginBottom: 4, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "relative", width: 440, background: "var(--crm-surface)", borderRadius: 16, border: "1px solid var(--crm-border)", padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{isEdit ? "Editar Contacto" : "Nuevo Contacto"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={labelStyle}>Nombre *</label><input required style={fieldStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Email</label><input style={fieldStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label style={labelStyle}>Teléfono</label><input style={fieldStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Empresa</label><input style={fieldStyle} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Fuente</label>
              <select style={fieldStyle} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                {Object.entries(SOURCE_LABELS_CRM).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Temperatura</label>
              <select style={fieldStyle} value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })}>
                <option value="cold">Frío</option><option value="warm">Tibio</option><option value="hot">Caliente</option>
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Notas</label><textarea style={{ ...fieldStyle, height: 60, resize: "vertical" }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {isEdit ? "Guardar" : "Crear Contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contact Detail Screen with Stage / Score / Next Steps tabs
function ContactDetailScreen({ contactId, onNavigate }) {
  const crm = useCRM();
  const [activeTab, setActiveTab] = React.useState("stage");
  const [showEdit, setShowEdit] = React.useState(false);
  const [showActivity, setShowActivity] = React.useState(false);

  const contact = crm.contacts.find(c => c.id === contactId);
  if (!contact) return <div style={{ padding: 40, textAlign: "center", color: "var(--crm-text-muted)" }}>Contacto no encontrado</div>;

  const contactDeals = crm.deals.filter(d => d.contactId === contactId);
  const contactActivities = [...crm.activities.filter(a => a.contactId === contactId)].sort((a, b) => b.createdAt - a.createdAt);
  const nextSteps = crm.nextSteps[contactId] || [];

  const TempBadge = ({ temp }) => {
    const cfg = { hot: { label: "Caliente", bg: "rgba(239,68,68,0.12)", color: "#ef4444" }, warm: { label: "Tibio", bg: "rgba(245,158,11,0.12)", color: "#f59e0b" }, cold: { label: "Frío", bg: "rgba(100,116,139,0.12)", color: "#94a3b8" } };
    const c = cfg[temp] || cfg.cold;
    return <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>;
  };

  const tabs = [
    { id: "stage", label: "Stage" },
    { id: "score", label: "Score" },
    { id: "next-steps", label: "Next Steps" },
    { id: "activities", label: "Actividades" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNavigate("contacts")} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{contact.name}</h2>
            <TempBadge temp={contact.temperature} />
          </div>
          <div style={{ fontSize: 12, color: "var(--crm-text-muted)" }}>{contact.company} · {SOURCE_LABELS_CRM[contact.source] || contact.source}</div>
        </div>
        <button onClick={() => setShowEdit(true)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 12, cursor: "pointer" }}>Editar</button>
        <button onClick={() => { if (confirm("¿Eliminar contacto?")) { crm.deleteContact(contactId); onNavigate("contacts"); } }}
          style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "var(--crm-danger)", fontSize: 12, cursor: "pointer" }}>Eliminar</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Left: Contact info card */}
        <div className="crm-card" style={{ padding: 20, borderRadius: 12, alignSelf: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--crm-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--crm-accent-text)", fontSize: 18, fontWeight: 700 }}>
              {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            {contact.email && <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--crm-text-muted)" }}>✉</span> {contact.email}</div>}
            {contact.phone && <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--crm-text-muted)" }}>📞</span> {contact.phone}</div>}
            {contact.company && <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "var(--crm-text-muted)" }}>🏢</span> {contact.company}</div>}
            <div style={{ fontSize: 12, color: "var(--crm-text-muted)" }}>Creado {formatDateCRM(contact.createdAt)}</div>
            {contact.notes && <div style={{ fontSize: 12, color: "var(--crm-text-muted)", padding: "10px 0", borderTop: "1px solid var(--crm-border)" }}>{contact.notes}</div>}

            {/* Quick actions */}
            <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid var(--crm-border)" }}>
              {contact.phone && <a href={`https://wa.me/${contact.phone.replace(/[\s\-\(\)\+]/g, "")}`} target="_blank" style={{ flex: 1, padding: "7px 0", borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 11, fontWeight: 500, textAlign: "center", textDecoration: "none", border: "none", cursor: "pointer" }}>WhatsApp</a>}
              {contact.phone && <a href={`tel:${contact.phone}`} style={{ flex: 1, padding: "7px 0", borderRadius: 6, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 500, textAlign: "center", textDecoration: "none" }}>Llamar</a>}
              {contact.email && <a href={`mailto:${contact.email}`} style={{ flex: 1, padding: "7px 0", borderRadius: 6, background: "rgba(168,85,247,0.1)", color: "#a855f7", fontSize: 11, fontWeight: 500, textAlign: "center", textDecoration: "none" }}>Email</a>}
            </div>
          </div>
        </div>

        {/* Right: Tabbed content */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--crm-border)", marginBottom: 16 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px", fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400, cursor: "pointer",
                  background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === t.id ? "var(--crm-accent)" : "transparent"}`,
                  color: activeTab === t.id ? "var(--crm-text)" : "var(--crm-text-muted)", transition: "all 0.15s",
                }}>{t.label}</button>
            ))}
          </div>

          {/* Stage tab */}
          {activeTab === "stage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {contactDeals.length === 0 ? (
                <div className="crm-card" style={{ padding: 24, borderRadius: 12, textAlign: "center", color: "var(--crm-text-muted)" }}>Sin deals activos para este contacto</div>
              ) : contactDeals.map(deal => {
                const stage = crm.stages.find(s => s.id === deal.stageId);
                const stageIdx = crm.stages.filter(s => !s.isLost).findIndex(s => s.id === deal.stageId);
                const totalStages = crm.stages.filter(s => !s.isLost).length;
                return (
                  <div key={deal.id} className="crm-card" style={{ padding: 20, borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{deal.title}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--crm-accent)", marginTop: 4 }}>{formatCRM(deal.value)}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: `1px solid ${stage?.color}`, color: stage?.color }}>{stage?.name}</span>
                    </div>
                    {/* Stage progress */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                      {crm.stages.filter(s => !s.isLost).map((s, i) => (
                        <div key={s.id} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= stageIdx ? stage?.color : "var(--crm-bg)", transition: "background 0.3s" }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--crm-text-muted)" }}>
                      <span>Probabilidad: {deal.probability}%</span>
                      <span>Cierre: {formatDateCRM(deal.expectedClose)}</span>
                    </div>
                    {deal.notes && <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginTop: 8, padding: "8px 0", borderTop: "1px solid var(--crm-border)" }}>{deal.notes}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Score tab */}
          {activeTab === "score" && (
            <div className="crm-card" style={{ padding: 24, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${contact.score >= 70 ? "var(--crm-danger)" : contact.score >= 40 ? "#f59e0b" : "var(--crm-text-muted)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 32, fontWeight: 800 }}>{contact.score}</span>
                  <span style={{ fontSize: 10, color: "var(--crm-text-muted)" }}>/100</span>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Lead Score</div>
                  <div style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>
                    {contact.score >= 70 ? "Lead de alta prioridad — actuar ahora" : contact.score >= 40 ? "Lead tibio — necesita más nurturing" : "Lead frío — seguimiento a largo plazo"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Engagement", value: Math.min(100, contact.score + 10) },
                  { label: "Fit de producto", value: Math.min(100, contact.score - 5 > 0 ? contact.score - 5 : 20) },
                  { label: "Urgencia", value: contact.temperature === "hot" ? 90 : contact.temperature === "warm" ? 50 : 20 },
                  { label: "Presupuesto", value: Math.min(100, contact.score + 5) },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 110, fontSize: 12, color: "var(--crm-text-muted)" }}>{item.label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--crm-bg)", overflow: "hidden" }}>
                      <div style={{ width: `${item.value}%`, height: "100%", borderRadius: 3, background: item.value >= 70 ? "var(--crm-accent)" : item.value >= 40 ? "#f59e0b" : "var(--crm-text-muted)", transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--crm-text-muted)", width: 28, textAlign: "right" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps tab */}
          {activeTab === "next-steps" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nextSteps.length === 0 ? (
                <div className="crm-card" style={{ padding: 24, borderRadius: 12, textAlign: "center", color: "var(--crm-text-muted)" }}>Sin próximos pasos sugeridos</div>
              ) : nextSteps.map(ns => {
                const days = daysUntil(ns.dueDate);
                const priorityColor = { high: "var(--crm-danger)", medium: "#f59e0b", low: "var(--crm-text-muted)" };
                return (
                  <div key={ns.id} className="crm-card" style={{ padding: 16, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: priorityColor[ns.priority], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{ns.text}</div>
                      <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 2 }}>
                        {ns.priority === "high" ? "Alta" : ns.priority === "medium" ? "Media" : "Baja"} prioridad · {days <= 0 ? "Vencido" : `en ${days} días`}
                      </div>
                    </div>
                    <button onClick={() => {
                      crm.addActivity({ type: "follow_up", description: ns.text, contactId, dealId: contactDeals[0]?.id || null, scheduledAt: ns.dueDate, completedAt: null });
                    }} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text-muted)", fontSize: 11, cursor: "pointer" }}>
                      Agendar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Activities tab */}
          {activeTab === "activities" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setShowActivity(true)} style={{ alignSelf: "flex-start", padding: "7px 14px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>+ Registrar actividad</button>
              {contactActivities.map(a => (
                <div key={a.id} className="crm-card" style={{ padding: 14, borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--crm-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{ACTIVITY_ICONS[a.type]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: "var(--crm-bg)", color: "var(--crm-text-muted)" }}>{ACTIVITY_LABELS[a.type]}</span>
                      {!a.completedAt && a.scheduledAt && (
                        <button onClick={() => crm.completeActivity(a.id)} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, border: "1px solid #f59e0b", background: "transparent", color: "#f59e0b", cursor: "pointer" }}>Completar</button>
                      )}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>{a.description}</div>
                    <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 2 }}>{formatRelative(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && <ContactFormModal onClose={() => setShowEdit(false)} initialData={{ id: contact.id, name: contact.name, email: contact.email || "", phone: contact.phone || "", company: contact.company || "", source: contact.source, temperature: contact.temperature, notes: contact.notes || "" }} />}
      {showActivity && <ActivityFormModal contactId={contactId} dealId={contactDeals[0]?.id} onClose={() => setShowActivity(false)} />}
    </div>
  );
}

// Activity form modal
function ActivityFormModal({ contactId, dealId, onClose }) {
  const crm = useCRM();
  const [form, setForm] = React.useState({ type: "call", description: "", scheduledAt: "" });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    crm.addActivity({ ...form, contactId, dealId: dealId || null, scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).getTime() : null, completedAt: form.scheduledAt ? null : Date.now() });
    onClose();
  };
  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13, outline: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "relative", width: 400, background: "var(--crm-surface)", borderRadius: 16, border: "1px solid var(--crm-border)", padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Registrar Actividad</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <select style={fieldStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea style={{ ...fieldStyle, height: 80 }} placeholder="Descripción..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input type="datetime-local" style={fieldStyle} value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            <button type="submit" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { ContactsScreen, ContactDetailScreen, ContactFormModal, ActivityFormModal });
