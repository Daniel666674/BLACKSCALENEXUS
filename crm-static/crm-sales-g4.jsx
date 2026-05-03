// Sales GROUP 4 — Proposals & Pricing
// ProposalsScreen · CalculatorScreen

// ── Seed data ─────────────────────────────────────────────────────────────────

const PROPOSALS_SEED_DATA = []; // Proposals are added manually — no fake data

const PROP_STAGES = ["Borrador", "Enviada", "Vista", "Aceptada", "Rechazada"];
const PROP_STAGE_COLOR = {
  "Borrador": "#7a756e", "Enviada": "#3b82f6", "Vista": "#f59e0b",
  "Aceptada": "#22c55e", "Rechazada": "#ef4444",
};

// ── PROPOSALS SCREEN ──────────────────────────────────────────────────────────

function ProposalsScreen() {
  const crm = useCRM();
  const [proposals, setProposals] = React.useState(PROPOSALS_SEED_DATA);
  const [dragId, setDragId] = React.useState(null);
  const [dragOverStage, setDragOverStage] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [form, setForm] = React.useState({ dealTitle: "", contact: "", value: "", notes: "" });

  const byStage = stage => proposals.filter(p => p.status === stage);
  const totalAccepted = proposals.filter(p => p.status === "Aceptada").reduce((s, p) => s + p.value, 0);

  const handleDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (dragId) setProposals(prev => prev.map(p => p.id === dragId ? { ...p, status: stage, sentDate: stage !== "Borrador" && !proposals.find(x => x.id === dragId).sentDate ? Date.now() : proposals.find(x => x.id === dragId).sentDate } : p));
    setDragId(null); setDragOverStage(null);
  };

  const addProposal = () => {
    if (!form.dealTitle || !form.contact) return;
    setProposals(prev => [{ ...form, id: `p${Date.now()}`, status: "Borrador", sentDate: null, value: parseInt(form.value.replace(/\D/g, "")) || 0 }, ...prev]);
    setForm({ dealTitle: "", contact: "", value: "", notes: "" });
    setShowNew(false);
  };

  const daysOpen = p => p.sentDate ? Math.floor((Date.now() - p.sentDate) / 86400000) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Propuestas</h2>
          <p style={{ fontSize: 13, color: "var(--crm-text-muted)", marginTop: 4 }}>
            {proposals.filter(p => p.status === "Aceptada").length} aceptadas · {formatCRM(totalAccepted)} en contratos firmados
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Nueva propuesta
        </button>
      </div>

      {/* New proposal modal */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 460, background: "var(--crm-surface)", border: "1px solid var(--crm-border)", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Nueva Propuesta</div>
            {[["dealTitle", "Nombre del deal / proyecto"], ["contact", "Contacto"]].map(([key, label]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Valor COP</label>
              <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                placeholder="ej. 25000000"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>Notas</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13, resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowNew(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "transparent", color: "var(--crm-text-muted)", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={addProposal}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Crear Propuesta</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
        {PROP_STAGES.map(stage => {
          const items = byStage(stage);
          const color = PROP_STAGE_COLOR[stage];
          const isOver = dragOverStage === stage;
          return (
            <div key={stage} style={{ minWidth: 220, flexShrink: 0 }}
              onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }}
              onDrop={e => handleDrop(e, stage)}>
              <div style={{ borderRadius: "10px 10px 0 0", padding: "10px 14px", borderBottom: `2px solid ${color}`, background: `${color}08`, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{stage}</div>
                <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginTop: 2 }}>{items.length} propuesta{items.length !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ minHeight: 100, padding: "4px 0", borderRadius: 8, background: isOver ? "rgba(209,156,21,0.04)" : "transparent", border: isOver ? "1px dashed rgba(209,156,21,0.25)" : "1px dashed transparent", transition: "all 0.15s" }}>
                {items.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 10px", fontSize: 11, color: "var(--crm-text-muted)", opacity: 0.4 }}>Arrastra aquí</div>
                )}
                {items.map(prop => {
                  const open = daysOpen(prop);
                  return (
                    <div key={prop.id} draggable
                      onDragStart={e => handleDragStart(e, prop.id)}
                      onDragEnd={() => { setDragId(null); setDragOverStage(null); }}
                      className="crm-card crm-deal-card"
                      style={{ borderRadius: 8, padding: 12, marginBottom: 8, cursor: "grab", opacity: dragId === prop.id ? 0.35 : 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{prop.dealTitle}</div>
                      <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginBottom: 8 }}>{prop.contact}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--crm-accent)", marginBottom: prop.notes ? 8 : 0 }}>{formatCRM(prop.value)}</div>
                      {prop.notes && <div style={{ fontSize: 11, color: "var(--crm-text-muted)", borderTop: "1px solid var(--crm-border)", paddingTop: 8, lineHeight: 1.4 }}>{prop.notes}</div>}
                      {open !== null && (
                        <div style={{ marginTop: 8, fontSize: 10, color: open > 14 ? "#ef4444" : "var(--crm-text-muted)" }}>
                          {open === 0 ? "Enviada hoy" : `${open}d abierta`}
                        </div>
                      )}
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

// ── CALCULATOR SCREEN ─────────────────────────────────────────────────────────

const USD_TO_COP = 4150; // exchange rate

const PACKAGES = [
  { id: "inicial", label: "Inicial", priceUSD: 750, description: "Setup básico, hasta 500 contactos, 1 pipeline" },
  { id: "intermedio", label: "Intermedio", priceUSD: 1650, description: "CRM completo, integraciones básicas, hasta 2K contactos" },
  { id: "avanzado", label: "Avanzado", priceUSD: 3000, description: "Enterprise, integraciones premium, contactos ilimitados" },
];

const SCOPE_ITEMS = [
  { id: "onboarding", label: "Onboarding y capacitación", price: 500000 },
  { id: "migration", label: "Migración de datos", price: 800000 },
  { id: "whatsapp", label: "Integración WhatsApp Business", price: 600000 },
  { id: "customreport", label: "Dashboard personalizado", price: 1200000 },
  { id: "automation", label: "Automatizaciones avanzadas", price: 900000 },
  { id: "brevo", label: "Setup Brevo + cadences", price: 700000 },
];

const PAYMENT_TERMS = [
  { id: "mensual", label: "Mensual", multiplier: 1.0, suffix: "/mes" },
  { id: "trimestral", label: "Trimestral (-5%)", multiplier: 0.95, suffix: "/trimestre" },
  { id: "anticipado", label: "Anticipado anual (-15%)", multiplier: 0.85, suffix: "/año" },
];

function CalculatorScreen() {
  const [pkg, setPkg] = React.useState("intermedio");
  const [scopeSel, setScopeSel] = React.useState([]);
  const [discount, setDiscount] = React.useState(0);
  const [paymentTerm, setPaymentTerm] = React.useState("mensual");
  const [customBase, setCustomBase] = React.useState("");

  const selectedPkg = PACKAGES.find(p => p.id === pkg);
  const term = PAYMENT_TERMS.find(t => t.id === paymentTerm);

  const baseCOP = (customBase ? parseInt(customBase.replace(/\D/g, "")) : 0) || Math.round(selectedPkg.priceUSD * USD_TO_COP);
  const scopeTotal = scopeSel.reduce((s, id) => s + (SCOPE_ITEMS.find(i => i.id === id)?.price || 0), 0);
  const subtotal = baseCOP + scopeTotal;
  const discountAmt = Math.round(subtotal * (discount / 100));
  const afterDiscount = subtotal - discountAmt;
  const final = Math.round(afterDiscount * term.multiplier);
  const margin = subtotal > 0 ? Math.round((final / subtotal) * 100) : 0;

  const toggleScope = id => setScopeSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div>
      <SectionHeader title="Calculadora de Precios" subtitle="Calcula el precio final con descuentos y términos de pago" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Package selector */}
          <div className="crm-card" style={{ borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Paquete base</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PACKAGES.map(p => (
                <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${pkg === p.id ? "var(--crm-accent)" : "var(--crm-border)"}`, background: pkg === p.id ? "rgba(209,156,21,0.06)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                  <input type="radio" name="pkg" value={p.id} checked={pkg === p.id} onChange={() => { setPkg(p.id); setCustomBase(""); }} style={{ accentColor: "var(--crm-accent)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 2 }}>{p.description}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--crm-accent)" }}>${p.priceUSD} USD</div>
                    <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{formatCRM(Math.round(p.priceUSD * USD_TO_COP))}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 11, color: "var(--crm-text-muted)", display: "block", marginBottom: 5 }}>O ingresa precio base manual (COP)</label>
              <input value={customBase} onChange={e => setCustomBase(e.target.value)} placeholder="ej. 12000000"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--crm-border)", background: "var(--crm-bg)", color: "var(--crm-text)", fontSize: 13 }} />
            </div>
          </div>

          {/* Scope items */}
          <div className="crm-card" style={{ borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Alcance adicional</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SCOPE_ITEMS.map(item => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, border: `1px solid ${scopeSel.includes(item.id) ? "var(--crm-accent)" : "var(--crm-border)"}`, background: scopeSel.includes(item.id) ? "rgba(209,156,21,0.05)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                  <input type="checkbox" checked={scopeSel.includes(item.id)} onChange={() => toggleScope(item.id)} style={{ accentColor: "var(--crm-accent)" }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--crm-accent)" }}>{formatCRM(item.price)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Discount + payment */}
          <div className="crm-card" style={{ borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Descuento y términos</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: "var(--crm-text-muted)" }}>Descuento comercial</span>
                <span style={{ fontWeight: 700, color: discount > 0 ? "#ef4444" : "var(--crm-text-muted)" }}>{discount}%</span>
              </div>
              <input type="range" min={0} max={50} step={5} value={discount} onChange={e => setDiscount(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--crm-accent)" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginBottom: 8 }}>Términos de pago</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PAYMENT_TERMS.map(t => (
                  <button key={t.id} onClick={() => setPaymentTerm(t.id)}
                    style={{ flex: 1, minWidth: 100, padding: "8px 10px", borderRadius: 8, border: `1px solid ${paymentTerm === t.id ? "var(--crm-accent)" : "var(--crm-border)"}`, background: paymentTerm === t.id ? "rgba(209,156,21,0.08)" : "transparent", color: paymentTerm === t.id ? "var(--crm-accent)" : "var(--crm-text-muted)", fontSize: 12, fontWeight: paymentTerm === t.id ? 600 : 400, cursor: "pointer" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="crm-card" style={{ borderRadius: 10, padding: 20, position: "sticky", top: 80 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Resumen de precios</div>

            {/* Line items */}
            {[
              ["Paquete base", formatCRM(baseCOP)],
              scopeTotal > 0 ? ["Alcance adicional", `+ ${formatCRM(scopeTotal)}`] : null,
              discount > 0 ? ["Descuento", `- ${formatCRM(discountAmt)}`] : null,
              term.multiplier !== 1 ? [`Ajuste ${term.label.split(" (")[0].toLowerCase()}`, term.multiplier < 1 ? `- ${formatCRM(Math.round(afterDiscount - final))}` : null] : null,
            ].filter(Boolean).map(([label, value], i) => value && (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--crm-text-muted)", marginBottom: 10 }}>
                <span>{label}</span>
                <span style={{ color: value.startsWith("-") ? "#ef4444" : "var(--crm-text)" }}>{value}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--crm-border)", paddingTop: 16, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Precio final{term.suffix}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--crm-accent)", letterSpacing: "-0.02em" }}>{formatCRM(final)}</div>
              <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginTop: 4 }}>{term.label.split(" (")[0]}</div>
            </div>

            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, background: margin >= 70 ? "rgba(34,197,94,0.08)" : margin >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${margin >= 70 ? "rgba(34,197,94,0.15)" : margin >= 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}` }}>
              <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginBottom: 4 }}>Margen neto estimado</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: margin >= 70 ? "#22c55e" : margin >= 50 ? "#f59e0b" : "#ef4444" }}>{margin}%</div>
            </div>

            <button style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 8, border: "none", background: "var(--crm-accent)", color: "var(--crm-accent-text)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              onClick={() => {
                const txt = `Propuesta BlackScale\n\nPaquete: ${selectedPkg.label}\nPrecio: ${formatCRM(final)}${term.suffix}\nDescuento: ${discount}%\nPago: ${term.label}`;
                navigator.clipboard?.writeText(txt).catch(() => {});
              }}>
              Copiar resumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProposalsScreen, CalculatorScreen });
