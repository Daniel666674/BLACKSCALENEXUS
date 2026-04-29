// Sales GROUP 5 — Internal Reporting
// RevenueScreen · ActivityMetricsScreen · PipelineHealthScreen

// ── Seed data ─────────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { label: "Oct", value: 38000000, target: 60000000 },
  { label: "Nov", value: 55000000, target: 65000000 },
  { label: "Dic", value: 47000000, target: 70000000 },
  { label: "Ene", value: 72000000, target: 75000000 },
  { label: "Feb", value: 68000000, target: 80000000 },
  { label: "Mar", value: 91000000, target: 85000000 },
  { label: "Abr", value: 74000000, target: 90000000 },
];

const WEEK_LABELS = ["Semana -3", "Semana -2", "Semana -1", "Esta semana"];

const ACTIVITY_WEEKS = {
  calls:     [8, 6, 10, 12],
  emails:    [14, 18, 12, 20],
  meetings:  [3, 5, 4, 6],
  proposals: [1, 2, 3, 2],
};

// ── REVENUE SCREEN ────────────────────────────────────────────────────────────

function RevenueScreen() {
  const crm = useCRM();
  const now = Date.now();

  // Won deals from CRM
  const wonDeals = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);

  // Projected 90-day: pipeline value * win rate
  const activeDeals = crm.deals.filter(d => {
    const s = crm.stages.find(x => x.id === d.stageId);
    return s && !s.isWon && !s.isLost;
  });
  const winRate = crm.deals.length > 0 ? wonDeals.length / crm.deals.length : 0.3;
  const weightedPipeline = activeDeals.reduce((s, d) => s + d.value * (d.probability / 100), 0);
  const projected90d = Math.round(weightedPipeline + (MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].value * 3 * 0.9));

  // MRR bar chart data
  const barData = MONTHLY_REVENUE.map(m => ({
    label: m.label,
    value: m.value,
    color: m.value >= m.target ? "#22c55e" : "var(--crm-accent)",
  }));

  // Target line data
  const lineData = MONTHLY_REVENUE.map(m => ({ label: m.label, value: m.target, actual: m.value }));

  // Client concentration (clients from g3 seed)
  const totalRev = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].value;
  const concentration = [
    { label: "Agencia Creativa", value: 22000000, color: "var(--crm-accent)" },
    { label: "Martínez Cons.", value: 18000000, color: "#551C25" },
    { label: "TechStartup", value: 16000000, color: "#3b82f6" },
    { label: "Otros", value: 18000000, color: "#7a756e" },
  ];
  const topPct = Math.round((concentration[0].value / totalRev) * 100);
  const concentrated = topPct > 40;

  // Compute max for dual bar/line chart
  const W = 500, H_CHART = 160, PAD = 24;
  const maxVal = Math.max(...MONTHLY_REVENUE.map(m => Math.max(m.value, m.target)), 1);
  const segW = W / MONTHLY_REVENUE.length;
  const bw = segW * 0.5;

  return (
    <div>
      <SectionHeader title="Revenue Dashboard" subtitle="MRR, targets y concentración de clientes · en COP" />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="MRR este mes" value={formatCRM(MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].value)} accent="var(--crm-accent)" />
        <StatCard label="Target este mes" value={formatCRM(MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].target)} />
        <StatCard label="Win rate" value={`${Math.round(winRate * 100)}%`} accent={winRate >= 0.4 ? "#22c55e" : "#f59e0b"} />
        <StatCard label="Proyección 90d" value={formatCRM(projected90d)} sub="pipeline × win rate" accent="#3b82f6" />
      </div>

      {/* Dual chart: bars (actual) + dashed line (target) */}
      <div className="crm-card" style={{ borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Revenue vs Target</div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--crm-text-muted)", marginBottom: 12 }}>
          <span><span style={{ color: "var(--crm-accent)" }}>■</span> Revenue real</span>
          <span><span style={{ color: "#551C25" }}>- -</span> Target mensual</span>
        </div>
        <svg width="100%" height={H_CHART + PAD} viewBox={`0 0 ${W} ${H_CHART + PAD}`} preserveAspectRatio="none">
          {MONTHLY_REVENUE.map((m, i) => {
            const bh = Math.max(3, (m.value / maxVal) * H_CHART);
            const x = i * segW + (segW - bw) / 2;
            const y = H_CHART - bh;
            const col = m.value >= m.target ? "#22c55e" : "var(--crm-accent)";
            return (
              <g key={i}>
                <rect x={x} y={y} width={bw} height={bh} rx={3} fill={col} opacity={0.8} />
                <text x={x + bw / 2} y={H_CHART + 14} textAnchor="middle" fontSize={9} fill="var(--crm-text-muted)" fontFamily="Poppins,sans-serif">{m.label}</text>
              </g>
            );
          })}
          {/* Target dashed line */}
          {MONTHLY_REVENUE.map((m, i) => {
            if (i === 0) return null;
            const prev = MONTHLY_REVENUE[i - 1];
            const x1 = (i - 1) * segW + segW / 2, y1 = H_CHART - (prev.target / maxVal) * H_CHART;
            const x2 = i * segW + segW / 2, y2 = H_CHART - (m.target / maxVal) * H_CHART;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#551C25" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.8} />;
          })}
        </svg>
      </div>

      {/* Concentration */}
      <div className="crm-card" style={{ borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Concentración de clientes</div>
          {concentrated && (
            <div style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 600 }}>
              ⚠ {concentration[0].label} representa {topPct}% del revenue
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
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
      </div>
    </div>
  );
}

// ── ACTIVITY METRICS SCREEN ───────────────────────────────────────────────────

function ActivityMetricsScreen() {
  const crm = useCRM();

  const thisWeek = crm.activities.filter(a => a.completedAt && (Date.now() - a.completedAt) < 7*86400000);
  const prevWeek = crm.activities.filter(a => a.completedAt && (Date.now() - a.completedAt) >= 7*86400000 && (Date.now() - a.completedAt) < 14*86400000);

  const countType = (acts, type) => type === "all" ? acts.length : acts.filter(a => a.type === type).length;

  const metrics = [
    { label: "Llamadas", type: "call", icon: "📞", weeks: ACTIVITY_WEEKS.calls, color: "#3b82f6" },
    { label: "Emails", type: "email", icon: "✉️", weeks: ACTIVITY_WEEKS.emails, color: "var(--crm-accent)" },
    { label: "Reuniones", type: "meeting", icon: "👥", weeks: ACTIVITY_WEEKS.meetings, color: "#22c55e" },
    { label: "Propuestas", type: "proposal", icon: "📄", weeks: ACTIVITY_WEEKS.proposals, color: "#a855f7" },
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

  // 1. Coverage ratio: weighted pipeline / monthly target
  const weightedPipeline = activeDeals.reduce((s, d) => s + d.value * (d.probability / 100), 0);
  const coverageRatio = Math.min(2, weightedPipeline / 90000000);
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
    { label: "Coverage ratio (pipeline ponderado vs meta)", score: coverageScore, max: 30, detail: `${formatCRM(weightedPipeline)} ponderado vs ${formatCRM(90000000)} meta`, tip: coverageRatio < 1 ? "Pipeline insuficiente para alcanzar meta del mes" : "Cobertura buena" },
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
