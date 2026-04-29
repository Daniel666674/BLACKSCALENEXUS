// Segment Health Tracker + Lead Source Attribution
function SegmentHealth() {
  const mkt = useMarketing();

  const buildSegment = (label, contacts) => {
    const total = contacts.length;
    const engaged = contacts.filter(c => c.engagement_status === "hot" || c.engagement_status === "warm").length;
    const dead = contacts.filter(c => c.engagement_status === "dead").length;
    const unengaged = total - engaged - dead;
    const engagementRate = total > 0 ? Math.round((engaged / total) * 100) : 0;
    const withDeals = contacts.filter(c => c.passed_to_sales_at).length;
    const conversionRate = total > 0 ? Math.round((withDeals / total) * 100) : 0;

    let action = "Monitorear";
    if (engagementRate < 15) action = "Revisar copy";
    else if (conversionRate === 0 && engagementRate > 30) action = "Revisar handoff";
    else if (engagementRate > 40) action = "Escalar";

    return { label, total, engaged, unengaged, dead, engagementRate, conversionRate, withDeals, action };
  };

  const byIndustry = MKT_INDUSTRIES.map(ind => buildSegment(ind, mkt.contacts.filter(c => c.industry === ind))).filter(s => s.total > 0);
  const byTier = MKT_TIERS.map(t => buildSegment(`Tier ${t}`, mkt.contacts.filter(c => c.tier === t)));
  const bySource = MKT_SOURCES.map(s => buildSegment(MKT_SOURCE_LABELS[s], mkt.contacts.filter(c => c.source === s))).filter(s => s.total > 0);

  const actionColors = { "Escalar": "#22c55e", "Monitorear": "var(--mkt-text-muted)", "Revisar copy": "#ef4444", "Revisar handoff": "#f59e0b" };

  const SegmentGroup = ({ title, segments }) => (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--mkt-accent)" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map(seg => (
          <div key={seg.label} className="mkt-card" style={{ padding: 16, borderRadius: 10, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 120, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{seg.label}</div>
              <div style={{ fontSize: 11, color: "var(--mkt-text-muted)" }}>{seg.total} contactos</div>
            </div>

            {/* Health bar */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden" }}>
                {seg.engaged > 0 && <div style={{ width: `${(seg.engaged / seg.total) * 100}%`, background: "#22c55e", transition: "width 0.6s" }} />}
                {seg.unengaged > 0 && <div style={{ width: `${(seg.unengaged / seg.total) * 100}%`, background: "rgba(255,255,255,0.08)", transition: "width 0.6s" }} />}
                {seg.dead > 0 && <div style={{ width: `${(seg.dead / seg.total) * 100}%`, background: "rgba(239,68,68,0.3)", transition: "width 0.6s" }} />}
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--mkt-text-muted)" }}>
                <span><span style={{ color: "#22c55e" }}>●</span> {seg.engaged} engaged</span>
                <span><span style={{ color: "rgba(255,255,255,0.3)" }}>●</span> {seg.unengaged} sin engage</span>
                <span><span style={{ color: "#ef4444" }}>●</span> {seg.dead} dead</span>
              </div>
            </div>

            <div style={{ textAlign: "center", width: 70 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{seg.engagementRate}%</div>
              <div style={{ fontSize: 10, color: "var(--mkt-text-muted)" }}>Engagement</div>
            </div>

            <div style={{ textAlign: "center", width: 70 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{seg.conversionRate}%</div>
              <div style={{ fontSize: 10, color: "var(--mkt-text-muted)" }}>Conversión</div>
            </div>

            <span style={{
              fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
              background: `${actionColors[seg.action]}15`, color: actionColors[seg.action],
              border: `1px solid ${actionColors[seg.action]}30`,
            }}>{seg.action}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <SegmentGroup title="Por Industria" segments={byIndustry} />
      <SegmentGroup title="Por Tier" segments={byTier} />
      <SegmentGroup title="Por Fuente de Lead" segments={bySource} />
    </div>
  );
}

// Lead Source Attribution
function AttributionDashboard() {
  const mkt = useMarketing();

  const sources = MKT_SOURCES.map(src => {
    const contacts = mkt.contacts.filter(c => c.source === src);
    const total = contacts.length;
    const hot = contacts.filter(c => c.engagement_status === "hot").length;
    const deals = contacts.filter(c => c.passed_to_sales_at).length;
    const engaged = contacts.filter(c => c.engagement_status === "hot" || c.engagement_status === "warm").length;
    // Simulated pipeline value based on tier
    const pipelineValue = contacts.reduce((sum, c) => sum + (c.tier === 1 ? 25000000 : c.tier === 2 ? 12000000 : 5000000) * (c.passed_to_sales_at ? 1 : 0), 0);
    const conversionRate = total > 0 ? Math.round((deals / total) * 100) : 0;
    return { src, label: MKT_SOURCE_LABELS[src], total, hot, deals, engaged, pipelineValue, conversionRate };
  }).filter(s => s.total > 0).sort((a, b) => b.conversionRate - a.conversionRate);

  const bestSource = sources[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Ranked list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((s, i) => {
          const isBest = s.src === bestSource?.src;
          return (
            <div key={s.src} className="mkt-card" style={{
              padding: 18, borderRadius: 12, display: "flex", alignItems: "center", gap: 16,
              border: isBest ? "1px solid var(--mkt-accent)" : undefined,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isBest ? "var(--mkt-accent)" : "var(--mkt-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: isBest ? "#0a0a0a" : "var(--mkt-text-muted)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>

              <div style={{ width: 120, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                  {isBest && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "var(--mkt-accent)", color: "#0a0a0a" }}>MEJOR</span>}
                </div>
              </div>

              {/* Funnel */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                {[
                  { label: "Total", value: s.total, color: "var(--mkt-text-muted)" },
                  { label: "Engaged", value: s.engaged, color: "#f59e0b" },
                  { label: "Hot", value: s.hot, color: "#ef4444" },
                  { label: "Deals", value: s.deals, color: "#22c55e" },
                ].map((step, j) => (
                  <React.Fragment key={step.label}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: step.color }}>{step.value}</div>
                      <div style={{ fontSize: 9, color: "var(--mkt-text-muted)" }}>{step.label}</div>
                    </div>
                    {j < 3 && <svg width="16" height="10" viewBox="0 0 16 10" style={{ opacity: 0.2, flexShrink: 0 }}><path d="M1 5h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ textAlign: "right", width: 120 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--mkt-accent)" }}>{mktFormatCOP(s.pipelineValue)}</div>
                <div style={{ fontSize: 11, color: "var(--mkt-text-muted)" }}>{s.conversionRate}% conversión</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SegmentHealth, AttributionDashboard });
