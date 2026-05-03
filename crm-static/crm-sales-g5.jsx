// Sales GROUP 5 — Internal Reporting
// RevenueScreen · ActivityMetricsScreen · PipelineHealthScreen

// ── Seed data ─────────────────────────────────────────────────────────────────

// Revenue data is computed from real CRM won deals — no hardcoded historical data
const MONTHLY_REVENUE = []; // kept for shape compatibility; populated at runtime
const WEEK_LABELS = ["Semana -3", "Semana -2", "Semana -1", "Esta semana"];

// ── REVENUE SCREEN ────────────────────────────────────────────────────────────

function RevenueScreen() {
  const crm = useCRM();
  const now = Date.now();
  const PALETTE = ["var(--crm-accent)", "#551C25", "#3b82f6", "#a855f7", "#22c55e", "#7a756e"];

  const wonDeals = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);
  const activeDeals = crm.deals.filter(d => {
    const s = crm.stages.find(x => x.id === d.stageId);
    return s && !s.isWon && !s.isLost;
  });
  const winRate = crm.deals.length > 0 ? wonDeals.length / crm.deals.length : 0;
  const weightedPipeline = activeDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);
  const projected90d = Math.round(weightedPipeline * 3 * (winRate || 0.3));

  // MRR from won deals grouped by calendar month (last 6 months)
  const monthLabels = [];
  const monthData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("es-CO", { month: "short" });
    const ms = d.getMonth(), yr = d.getFullYear();
    const rev = wonDeals.filter(deal => {
      const cd = new Date(deal.createdAt || 0);
      return cd.getMonth() === ms && cd.getFullYear() === yr;
    }).reduce((s, deal) => s + (deal.value || 0), 0);
    monthLabels.push(label);
    monthData.push(rev);
  }
  const monthlyTarget = wonDeals.length > 0
    ? Math.round(wonDeals.reduce((s, d) => s + (d.value || 0), 0) / Math.max(1, wonDeals.length) * 3)
    : 0;

  const W = 500, H_CHART = 160, PAD = 24;
  const maxVal = Math.max(...monthData, monthlyTarget || 1, 1);
  const segW = monthData.length > 0 ? W / monthData.length : W;
  const bw = segW * 0.5;

  // Client concentration from won deals
  const wonByContact = {};
  wonDeals.forEach(d => {
    const contact = crm.contacts.find(c => c.id === d.contactId);
    const key = contact?.company || contact?.name || d.title || "—";
    wonByContact[key] = (wonByContact[key] || 0) + (d.value || 0);
  });
  const totalRev = Object.values(wonByContact).reduce((s, v) => s + v, 0);
  const concEntries = Object.entries(wonByContact).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const othersRev = totalRev - concEntries.reduce((s, [, v]) => s + v, 0);
  const concentration = concEntries.map(([label, value], i) => ({ label, value, color: PALETTE[i] }));
  if (othersRev > 0) concentration.push({ label: "Otros", value: othersRev, color: "#7a756e" });
  const topPct = concentration.length > 0 ? Math.round((concentration[0].value / totalRev) * 100) : 0;
  const concentrated = topPct > 40;

  return (
    <div>
      <SectionHeader title="Revenue Dashboard" subtitle="MRR, targets y concentración de clientes · en COP" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Pipeline activo" value={formatCRM(activeDeals.reduce((s,d) => s+(d.value||0), 0))} accent="var(--crm-accent)" />
        <StatCard label="Deals ganados" value={wonDeals.length} />
        <StatCard label="Win rate" value={`${Math.round(winRate * 100)}%`} accent={winRate >= 0.4 ? "#22c55e" : "#f59e0b"} />
        <StatCard label="Proyección 90d" value={formatCRM(projected90d)} sub="pipeline ponderado × 3" accent="#3b82f6" />
      </div>

      <div className="crm-card" style={{ borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Revenue por mes (deals ganados)</div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--crm-text-muted)", marginBottom: 12 }}>
          <span><span style={{ color: "var(--crm-accent)" }}>■</span> Valor deals ganados</span>
        </div>
        {monthData.every(v => v === 0)
          ? <div style={{ textAlign: "center", padding: "32px 0", color: "var(--crm-text-muted)", fontSize: 13 }}>Sin deals ganados registrados aún</div>
          : <svg width="100%" height={H_CHART + PAD} viewBox={`0 0 ${W} ${H_CHART + PAD}`} preserveAspectRatio="none">
              {monthData.map((val, i) => {
                const bh = Math.max(3, (val / maxVal) * H_CHART);
                const x = i * segW + (segW - bw) / 2;
                const y = H_CHART - bh;
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={bw} height={bh} rx={4} fill="var(--crm-accent)" opacity={0.85} />
                    <text x={x + bw / 2} y={H_CHART + 14} textAnchor="middle" fontSize={9} fill="var(--crm-text-muted)" fontFamily="Poppins,sans-serif">{monthLabels[i]}</text>
                  </g>
                );
              })}
            </svg>
        }
      </div>

      <div className="crm-card" style={{ borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Concentración de clientes</div>
          {concentrated && concentration.length > 0 && (
            <div style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 600 }}>
              ⚠ {concentration[0].label} representa {topPct}% del revenue
            </div>
          )}
        </div>
        {concentration.length === 0
          ? <div style={{ textAlign: "center", padding: "24px 0", color: "var(--crm-text-muted)", fontSize: 13 }}>Sin deals ganados para calcular concentración</div>
          : <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <SVGDonut data={concentration} size={110} thick={22} />
              <div style={{ flex: 1 }}>
                {concentration.map((c, i) => {
                  const pct = Math.round((c.value / totalRev) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                          <span>{c.label}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: i === 0 && concentrated ? "#ef4444" : "var(--crm-text)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: c.color, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        }
      </div>
    </div>
  );
}

// ── ACTIVITY METRICS SCREEN ───────────────────────────────────────────────────

function ActivityMetricsScreen() {
  const crm = useCRM();

  const thisWeek = crm.activities.filter(a => a.completedAt && (Date.now() - a.completedAt) < 7*86400000);
  const prevWeek = crm.activities.filter(a => a.completedAt && (Date.now() - a.completedAt) >= 7*86400000 && (Date.now() - a.completedAt) < 14*86400000);

  const weekBucket = (weeksAgo) => {
    const start = now - (weeksAgo + 1) * 7 * 86400000;
    const end   = now - weeksAgo * 7 * 86400000;
    return crm.activities.filter(a => a.completedAt && a.completedAt >= start && a.completedAt < end);
  };
  const w3 = weekBucket(3), w2 = weekBucket(2), w1 = weekBucket(1), w0 = weekBucket(0);

  const countType = (acts, type) => type === "all" ? acts.length : acts.filter(a => a.type === type).length;

  const metrics = [
    { label: "Llamadas",   type: "call",   icon: "📞", weeks: [countType(w3,"call"),   countType(w2,"call"),   countType(w1,"call"),   countType(w0,"call")],   color: "#3b82f6" },
    { label: "Emails",     type: "email",  icon: "✉️", weeks: [countType(w3,"email"),  countType(w2,"email"),  countType(w1,"email"),  countType(w0,"email")],  color: "var(--crm-accent)" },
    { label: "Reuniones",  type: "meeting",icon: "👥", weeks: [countType(w3,"meeting"),countType(w2,"meeting"),countType(w1,"meeting"),countType(w0,"meeting")], color: "#22c55e" },
    { label: "Seguimientos",type:"follow_up",icon:"⏰", weeks: [countType(w3,"follow_up"),countType(w2,"follow_up"),countType(w1,"follow_up"),countType(w0,"follow_up")], color: "#a855f7" },
  ];

  const thisWeekTotal = metrics.reduce((s, m) => s + m.weeks[3], 0);
  const prevWeekTotal = metrics.reduce((s, m) => s + m.weeks[2], 0);
  const productivity = prevWeekTotal > 0 ? Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;

  return (
    <div>
      <SectionHeader title="Métricas de Actividad" subtitle="Contadores semanales · últimas 4 semanas" />

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Actividades esta semana" value={thisWeekTotal} />
        <StatCard label="Semana anterior" value={prevWeekTotal} />
        <StatCard label="Score de productividad"
          value={`${productivity > 0 ? "+" : ""}${productivity}%`}
          sub={productivity > 0 ? "↑ Mejor que la semana pasada" : productivity < 0 ? "↓ Menor que la semana pasada" : "= Sin cambio"}
          accent={productivity > 0 ? "#22c55e" : productivity < 0 ? "#ef4444" : "var(--crm-text-muted)"} />
      </div>

      {/* Metric cards with sparklines */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
        {metrics.map(m => {
          const current = m.weeks[3];
          const prev = m.weeks[2];
          const delta = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;
          return (
            <div key={m.type} className="crm-card" style={{ borderRadius: 10, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginBottom: 4 }}>{m.label} esta semana</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{current}</div>
                <div style={{ fontSize: 11, color: delta >= 0 ? "#22c55e" : "#ef4444", marginTop: 2 }}>
                  {delta > 0 ? `+${delta}%` : `${delta}%`} vs sem. ant.
                </div>
              </div>
              <Sparkline values={m.weeks} color={m.color} width={80} height={36} />
            </div>
          );
        })}
      </div>

      {/* Weekly table */}
      <div className="crm-card" style={{ borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Detalle por semana</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--crm-border)" }}>
              <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 11, color: "var(--crm-text-muted)", fontWeight: 500 }}>Actividad</th>
              {WEEK_LABELS.map(l => (
                <th key={l} style={{ padding: "6px 12px", textAlign: "right", fontSize: 11, color: l === "Esta semana" ? "var(--crm-accent)" : "var(--crm-text-muted)", fontWeight: l === "Esta semana" ? 700 : 500 }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.type} className="crm-table-row" style={{ borderBottom: "1px solid var(--crm-border)" }}>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{m.icon} {m.label}</td>
                {m.weeks.map((w, i) => (
                  <td key={i} style={{ padding: "10px 12px", textAlign: "right", fontSize: 13, fontWeight: i === 3 ? 700 : 400, color: i === 3 ? m.color : "var(--crm-text)" }}>{w}</td>
                ))}
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid var(--crm-border)" }}>
              <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "var(--crm-text-muted)" }}>TOTAL</td>
              {[0,1,2,3].map(i => {
                const t = metrics.reduce((s, m) => s + m.weeks[i], 0);
                return <td key={i} style={{ padding: "10px 12px", textAlign: "right", fontSize: 13, fontWeight: 700, color: i === 3 ? "var(--crm-accent)" : "var(--crm-text)" }}>{t}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PIPELINE HEALTH SCREEN ────────────────────────────────────────────────────

function PipelineHealthScreen() {
  const crm = useCRM();

  const activeDeals = crm.deals.filter(d => {
    const s = crm.stages.find(x => x.id === d.stageId);
    return s && !s.isWon && !s.isLost;
  });

  // 1. Coverage ratio: weighted pipeline / monthly target (avg won deal value × 3)
  const wonDealsH = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);
  const healthMonthlyTarget = wonDealsH.length > 0
    ? Math.round(wonDealsH.reduce((s, d) => s + (d.value || 0), 0) / Math.max(1, wonDealsH.length) * 3)
    : 1;
  const weightedPipeline = activeDeals.reduce((s, d) => s + (d.value||0) * ((d.probability||0) / 100), 0);
  const coverageRatio = Math.min(2, weightedPipeline / healthMonthlyTarget);
  const coverageScore = Math.round(coverageRatio * 30); // max 30 pts

  // 2. Avg days per stage (lower is better, relative)
  const avgDays = activeDeals.length
    ? activeDeals.reduce((s, d) => s + Math.floor((Date.now() - d.createdAt) / 86400000), 0) / activeDeals.length
    : 0;
  const stageScore = avgDays < 10 ? 25 : avgDays < 20 ? 18 : avgDays < 30 ? 10 : 5;

  // 3. Stalled deals: no activity > 14d
  const stalledCount = activeDeals.filter(d => {
    const acts = crm.activities.filter(a => a.dealId === d.id && a.completedAt);
    const lastAct = acts.sort((a, b) => b.completedAt - a.completedAt)[0];
    return !lastAct || (Date.now() - lastAct.completedAt) > 14*86400000;
  }).length;
  const stalledScore = stalledCount === 0 ? 25 : stalledCount <= 1 ? 20 : stalledCount <= 2 ? 12 : 5;

  // 4. Single-contact deals
  const singleContactDeals = activeDeals.filter(d => {
    const contactDeals = crm.deals.filter(x => x.contactId === d.contactId);
    return contactDeals.length <= 1;
  }).length;
  const singleScore = activeDeals.length === 0 ? 20 : Math.round(20 * (1 - singleContactDeals / activeDeals.length));

  const totalScore = Math.min(100, coverageScore + stageScore + stalledScore + singleScore);

  const scoreColor = totalScore >= 70 ? "#22c55e" : totalScore >= 40 ? "#f59e0b" : "#ef4444";
  const scoreLabel = totalScore >= 70 ? "Pipeline Saludable" : totalScore >= 40 ? "Atención Requerida" : "Pipeline en Riesgo";

  const factors = [
    { label: "Coverage ratio (pipeline ponderado vs meta)", score: coverageScore, max: 30, detail: `${formatCRM(weightedPipeline)} ponderado vs ${formatCRM(healthMonthlyTarget)} meta`, tip: coverageRatio < 1 ? "Pipeline insuficiente para alcanzar meta del mes" : "Cobertura buena" },
    { label: "Velocidad promedio por etapa", score: stageScore, max: 25, detail: `${avgDays.toFixed(1)} días promedio en etapa`, tip: avgDays > 20 ? "Deals moviéndose lento — revisar bloqueos" : "Buen ritmo de avance" },
    { label: "Deals estancados (>14d sin actividad)", score: stalledScore, max: 25, detail: `${stalledCount} deal${stalledCount !== 1 ? "s" : ""} estancado${stalledCount !== 1 ? "s" : ""}`, tip: stalledCount > 0 ? `Registrar actividad en ${stalledCount} deal${stalledCount !== 1 ? "s" : ""}` : "Todos los deals tienen actividad reciente" },
    { label: "Concentración de contactos", score: singleScore, max: 20, detail: `${singleContactDeals} deal${singleContactDeals !== 1 ? "s" : ""} con contacto único`, tip: "Busca múltiples contactos por empresa para reducir riesgo" },
  ];

  // Gauge arc
  const gaugeAngle = (totalScore / 100) * 180;
  const rad = (deg) => deg * Math.PI / 180;
  const gx = (angle) => 100 + 80 * Math.cos(rad(180 - angle));
  const gy = (angle) => 100 - 80 * Math.sin(rad(180 - angle));

  return (
    <div>
      <SectionHeader title="Pipeline Health Score" subtitle="Salud del pipeline 0–100 · actualizado en tiempo real" />

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        {/* Gauge */}
        <div className="crm-card" style={{ borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width={200} height={120} viewBox="0 0 200 110">
            {/* Background arc */}
            <path d={`M 20,100 A 80,80 0 0,1 180,100`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={16} strokeLinecap="round" />
            {/* Colored arc */}
            {totalScore > 0 && (
              <path d={`M 20,100 A 80,80 0 0,1 ${gx(gaugeAngle)},${gy(gaugeAngle)}`}
                fill="none" stroke={scoreColor} strokeWidth={16} strokeLinecap="round" opacity={0.9} />
            )}
            {/* Needle dot */}
            <circle cx={gx(gaugeAngle)} cy={gy(gaugeAngle)} r={6} fill={scoreColor} />
            {/* Score text */}
            <text x={100} y={90} textAnchor="middle" fontSize={36} fontWeight={800} fill={scoreColor} fontFamily="Poppins,sans-serif">{totalScore}</text>
            <text x={100} y={108} textAnchor="middle" fontSize={9} fill="var(--crm-text-muted)" fontFamily="Poppins,sans-serif">de 100</text>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor, marginTop: 4, textAlign: "center" }}>{scoreLabel}</div>
          <div style={{ fontSize: 12, color: "var(--crm-text-muted)", marginTop: 6, textAlign: "center" }}>{activeDeals.length} deal{activeDeals.length !== 1 ? "s" : ""} activo{activeDeals.length !== 1 ? "s" : ""} · {formatCRM(activeDeals.reduce((s,d) => s+d.value,0))} en pipeline</div>
        </div>

        {/* Breakdown */}
        <div className="crm-card" style={{ borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Desglose por factor</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {factors.map((f, i) => {
              const pct = (f.score / f.max) * 100;
              const fColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 2 }}>{f.detail}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: fColor }}>{f.score}<span style={{ fontSize: 11, color: "var(--crm-text-muted)", fontWeight: 400 }}>/{f.max}</span></div>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.07)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: fColor, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 4 }}>{f.tip}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RevenueScreen, ActivityMetricsScreen, PipelineHealthScreen });
