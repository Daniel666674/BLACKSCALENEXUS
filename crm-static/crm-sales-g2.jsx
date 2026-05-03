// Sales GROUP 2 — Prospecting Engine
// ICPScorerScreen · SequencesScreen · RadarScreen

// ── Seed data ─────────────────────────────────────────────────────────────────

const RADAR_SEED = []; // Contacts are added manually via the UI — no fake data

const ICP_INDUSTRIES = ["Tecnología", "Inmobiliaria", "Consultoría", "Salud", "Marketing", "Finanzas", "E-commerce", "Logística", "Educación", "Construcción"];
const ICP_GEOGRAPHIES = ["Colombia", "México", "Latinoamérica", "Global"];

// ── ICP SCORER ────────────────────────────────────────────────────────────────

function ICPScorerScreen() {
  const crm = useCRM();
  const [criteria, setCriteria] = React.useState({
    industry: "Tecnología",
    companySizeMin: 5,
    companySizeMax: 200,
    role: "CEO, Director, Gerente",
    geography: "Colombia",
    budgetSignal: "ha preguntado precios",
  });
  const [scoreFilter, setScoreFilter] = React.useState([0, 100]);

  const setCrit = (key, val) => setCriteria(prev => ({ ...prev, [key]: val }));

  function scoreContact(c) {
    let score = 0;
    // Industry match
    const nameLC = (c.company || "").toLowerCase();
    if (criteria.industry === "Tecnología" && (nameLC.includes("tech") || nameLC.includes("digital") || nameLC.includes("startup"))) score += 25;
    else if (criteria.industry === "Inmobiliaria" && nameLC.includes("inmob")) score += 25;
    else if (criteria.industry === "Salud" && (nameLC.includes("dental") || nameLC.includes("salud") || nameLC.includes("med"))) score += 25;
    else if (criteria.industry === "Marketing" && (nameLC.includes("agencia") || nameLC.includes("market") || nameLC.includes("creativ"))) score += 25;
    else score += 5;
    // Temperature/engagement
    if (c.temperature === "hot") score += 30;
    else if (c.temperature === "warm") score += 15;
    // Score
    if (c.score >= 70) score += 25;
    else if (c.score >= 40) score += 12;
    // Source quality
    if (["evento", "referido"].includes(c.source)) score += 15;
    else if (c.source === "website") score += 10;
    else score += 3;
    // Notes budget signal
    if (criteria.budgetSignal && c.notes && c.notes.toLowerCase().includes(criteria.budgetSignal.split(" ")[0].toLowerCase())) score += 5;
    return Math.min(100, score);
  }

  const scored = crm.contacts
    .map(c => ({ ...c, icpScore: scoreContact(c) }))
    .sort((a, b) => b.icpScore - a.icpScore)
    .filter(c => c.icpScore >= scoreFilter[0] && c.icpScore <= scoreFilter[1]);

  const scoreColor = s => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";
  const scoreLabel = s => s >= 70 ? "Alto ICP" : s >= 40 ? "Medio" : "Bajo ICP";

  return (
    <div>
      <SectionHeader title="ICP Scorer" subtitle="Define criterios y puntúa cada contacto por ajuste al perfil ideal" />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Criteria panel */}
        <div className="crm-card" style={{ borderRadius: 10, padding: 18, height: "fit-content" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Criterios ICP</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Industria objetivo</label>
            <select value={criteria.industry} onChange={e => setCrit("industry", e.target.value)}
              style={{ width: "100%", padding: "8px 28px 8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }}>
              {ICP_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Tamaño empresa (empleados)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" value={criteria.companySizeMin} onChange={e => setCrit("companySizeMin", +e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} placeholder="Min" />
              <input type="number" value={criteria.companySizeMax} onChange={e => setCrit("companySizeMax", +e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} placeholder="Max" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Rol / Seniority</label>
            <input value={criteria.role} onChange={e => setCrit("role", e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Geografía</label>
            <select value={criteria.geography} onChange={e => setCrit("geography", e.target.value)}
              style={{ width: "100%", padding: "8px 28px 8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }}>
              {ICP_GEOGRAPHIES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Señal de presupuesto</label>
            <input value={criteria.budgetSignal} onChange={e => setCrit("budgetSignal", e.target.value)}
              placeholder="ej. pidió precios, tiene presupuesto"
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Filtrar por score: ≥{scoreFilter[0]}</label>
            <input type="range" min={0} max={100} step={10} value={scoreFilter[0]}
              onChange={e => setScoreFilter([+e.target.value, 100])}
              style={{ width: "100%", accentColor: "var(--crm-accent)" }} />
          </div>
        </div>

        {/* Ranked contacts */}
        <div>
          <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginBottom: 12 }}>{scored.length} contacto{scored.length !== 1 ? "s" : ""} · ordenados por ICP fit</div>
          {!scored.length && <EmptyState icon="🎯" message="Ningún contacto supera el score mínimo con estos criterios" />}
          {scored.map(c => (
            <div key={c.id} className="crm-card" style={{ borderRadius: 10, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--crm-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--crm-accent-text)", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{c.company} · {c.source}</div>
              </div>
              {/* Score bar */}
              <div style={{ width: 140 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "var(--crm-text-muted)" }}>ICP Fit</span>
                  <span style={{ fontWeight: 700, color: scoreColor(c.icpScore) }}>{c.icpScore}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ width: `${c.icpScore}%`, height: "100%", borderRadius: 3, background: scoreColor(c.icpScore), transition: "width 0.4s" }} />
                </div>
              </div>
              <Badge text={scoreLabel(c.icpScore)} color={scoreColor(c.icpScore)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SEQUENCES (follow-up queue) ───────────────────────────────────────────────

function SequencesScreen() {
  const crm = useCRM();
  const [tierFilter, setTierFilter] = React.useState("Todos");
  const [nextActions, setNextActions] = React.useState({});
  const [logged, setLogged] = React.useState({});

  const rows = crm.contacts.map(c => {
    const acts = crm.activities.filter(a => a.contactId === c.id && a.completedAt).sort((a, b) => b.completedAt - a.completedAt);
    const lastAct = acts[0];
    const daysSince = lastAct ? Math.floor((Date.now() - lastAct.completedAt) / 86400000) : 99;
    // Assign tier by temperature as proxy
    const tier = c.temperature === "hot" ? 1 : c.temperature === "warm" ? 2 : 3;
    let urgency = "upcoming", urgencyColor = "var(--crm-text-muted)";
    if (daysSince > 7) { urgency = "overdue"; urgencyColor = "#ef4444"; }
    else if (daysSince >= 3) { urgency = "due-today"; urgencyColor = "#f59e0b"; }
    return { ...c, tier, daysSince, urgency, urgencyColor, lastContact: lastAct?.completedAt || c.createdAt };
  }).sort((a, b) => b.daysSince - a.daysSince);

  const filtered = tierFilter === "Todos" ? rows : rows.filter(r => String(r.tier) === tierFilter);

  const logInteraction = (contactId) => {
    crm.addActivity({ type: "follow_up", description: nextActions[contactId] || "Interacción registrada", contactId, completedAt: Date.now() });
    setLogged(prev => ({ ...prev, [contactId]: true }));
    setTimeout(() => setLogged(prev => ({ ...prev, [contactId]: false })), 2000);
  };

  const urgencyLabel = { overdue: "Vencido", "due-today": "Pendiente", upcoming: "Al día" };

  return (
    <div>
      <SectionHeader title="Secuencias de Seguimiento" subtitle="Cola diaria de follow-ups ordenada por urgencia" />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--crm-text-muted)" }}>Filtrar por tier:</span>
        {["Todos", "1", "2", "3"].map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid var(--crm-border)", fontSize: 12, fontWeight: tierFilter === t ? 600 : 400, cursor: "pointer", background: tierFilter === t ? "var(--crm-accent)" : "transparent", color: tierFilter === t ? "var(--crm-accent-text)" : "var(--crm-text-muted)" }}>
            {t === "Todos" ? "Todos" : `Tier ${t}`}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, fontSize: 12, color: "var(--crm-text-muted)" }}>
          <span><span style={{ color: "#ef4444" }}>●</span> Vencido (&gt;7d)</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Pendiente (3-7d)</span>
          <span><span style={{ color: "var(--crm-text-muted)" }}>●</span> Al día</span>
        </div>
      </div>

      {!filtered.length && <EmptyState icon="✅" message="No hay contactos para mostrar con este filtro" />}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(c => (
          <div key={c.id} className="crm-card" style={{ borderRadius: 10, padding: 14, borderLeft: `3px solid ${c.urgencyColor}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${c.urgencyColor}18`, display: "flex", alignItems: "center", justifyContent: "center", color: c.urgencyColor, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{c.company}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "rgba(209,156,21,0.1)", color: "var(--crm-accent)" }}>T{c.tier}</span>
            </div>
            <div style={{ textAlign: "right", minWidth: 80 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.urgencyColor }}>{c.daysSince === 99 ? "—" : `${c.daysSince}d`}</div>
              <div style={{ fontSize: 10, color: "var(--crm-text-muted)" }}>{urgencyLabel[c.urgency]}</div>
            </div>
            <input
              value={nextActions[c.id] || ""}
              onChange={e => setNextActions(prev => ({ ...prev, [c.id]: e.target.value }))}
              placeholder="Próxima acción..."
              style={{ flex: 2, minWidth: 160, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 12 }}
            />
            <button onClick={() => logInteraction(c.id)}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--crm-accent)", background: logged[c.id] ? "var(--crm-accent)" : "transparent", color: logged[c.id] ? "var(--crm-accent-text)" : "var(--crm-accent)", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
              {logged[c.id] ? "✓ Registrado" : "Registrar interacción"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RADAR ─────────────────────────────────────────────────────────────────────

function RadarScreen() {
  const [items, setItems] = React.useState(RADAR_SEED);
  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", company: "", tier: 2, reason: "", trigger: "", reengageDate: "" });

  const now = Date.now();
  const isAlertDate = ts => ts <= now + 86400000; // today or past

  const removeItem = id => setItems(prev => prev.filter(i => i.id !== id));
  const addItem = () => {
    if (!form.name) return;
    const ts = form.reengageDate ? new Date(form.reengageDate).getTime() : now + 30 * 86400000;
    setItems(prev => [{ ...form, id: `r${Date.now()}`, contactId: null, reengageDate: ts }, ...prev]);
    setForm({ name: "", company: "", tier: 2, reason: "", trigger: "", reengageDate: "" });
    setShowAdd(false);
  };

  const sorted = [...items].sort((a, b) => a.reengageDate - b.reengageDate);
  const overdueOrToday = sorted.filter(i => isAlertDate(i.reengageDate));
  const upcoming = sorted.filter(i => !isAlertDate(i.reengageDate));

  const ItemCard = ({ item }) => {
    const alert = isAlertDate(item.reengageDate);
    const daysUntilRe = Math.ceil((item.reengageDate - now) / 86400000);
    return (
      <div className="crm-card" style={{ borderRadius: 10, padding: 16, borderLeft: `3px solid ${alert ? "#ef4444" : "var(--crm-border)"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "rgba(209,156,21,0.1)", color: "var(--crm-accent)" }}>T{item.tier}</span>
              {alert && <Badge text={daysUntilRe <= 0 ? "⚡ Vencido" : "Hoy"} color="#ef4444" />}
            </div>
            <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginBottom: 10 }}>{item.company}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Razón no listo</div>
                <div style={{ fontSize: 12 }}>{item.reason}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Disparador</div>
                <div style={{ fontSize: 12 }}>{item.trigger}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
            <div style={{ fontSize: 10, color: "var(--crm-text-muted)", marginBottom: 4 }}>Re-enganchar</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: alert ? "#ef4444" : "var(--crm-text)" }}>{fDD(item.reengageDate)}</div>
            <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{daysUntilRe <= 0 ? `Hace ${Math.abs(daysUntilRe)}d` : `En ${daysUntilRe}d`}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => removeItem(item.id)}
            style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>
            Remover del radar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Radar — Watchlist</h2>
          <p style={{ fontSize: 13, color: "var(--crm-text-muted)", marginTop: 4 }}>Tier 1 no listos todavía · Alertas automáticas por fecha de re-enganche</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Agregar al radar
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 480, background: "var(--crm-surface)", border: "1px solid var(--crm-border)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Agregar al Radar</div>
            {[["nombre", "name", "Nombre del contacto"], ["empresa", "company", "Empresa"]].map(([, key, label]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
              </div>
            ))}
            {[["reason", "Razón por la que no está listo"], ["trigger", "Disparador para re-enganchar"]].map(([key, label]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Fecha de re-enganche</label>
              <input type="date" value={form.reengageDate} onChange={e => setForm(p => ({ ...p, reengageDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text-muted)", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={addItem}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts section */}
      {overdueOrToday.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            ⚡ Requieren atención hoy ({overdueOrToday.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {overdueOrToday.map(i => <ItemCard key={i.id} item={i} />)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        {upcoming.length > 0 && (
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Próximos ({upcoming.length})
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map(i => <ItemCard key={i.id} item={i} />)}
        </div>
        {!items.length && <EmptyState icon="📡" message="El radar está vacío. Agrega contactos Tier 1 que no estén listos todavía." />}
      </div>
    </div>
  );
}

Object.assign(window, { ICPScorerScreen, SequencesScreen, RadarScreen });
