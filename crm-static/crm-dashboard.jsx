// Dashboard Screen
function DashboardScreen({ onNavigate }) {
  const crm = useCRM();
  const activeDeals = crm.deals.filter(d => {
    const stage = crm.stages.find(s => s.id === d.stageId);
    return stage && !stage.isWon && !stage.isLost;
  });
  const wonDeals = crm.deals.filter(d => crm.stages.find(s => s.id === d.stageId)?.isWon);
  const hotLeads = crm.contacts.filter(c => c.temperature === "hot");
  const overdueActivities = crm.activities.filter(a => !a.completedAt && a.scheduledAt && a.scheduledAt < Date.now());
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0);
  const conversionRate = crm.deals.length > 0 ? Math.round((wonDeals.length / crm.deals.length) * 100) : 0;

  const pipelineData = crm.stages.filter(s => !s.isLost).map(stage => ({
    name: stage.name, color: stage.color,
    count: crm.deals.filter(d => d.stageId === stage.id).length,
    value: crm.deals.filter(d => d.stageId === stage.id).reduce((s, d) => s + d.value, 0),
  }));
  const maxCount = Math.max(...pipelineData.map(p => p.count), 1);

  const recentActivities = [...crm.activities].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  const kpis = [
    { label: "Total Contactos", value: crm.contacts.length, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", accent: "var(--crm-chart-1)" },
    { label: "Deals Activos", value: activeDeals.length, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", accent: "var(--crm-chart-2)" },
    { label: "Valor Pipeline", value: formatCRM(totalPipeline), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", accent: "var(--crm-chart-3)" },
    { label: "Leads Calientes", value: hotLeads.length, icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z", accent: "var(--crm-danger)" },
  ];

  const SvgIcon = ({ path, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Overdue banner */}
      {overdueActivities.length > 0 && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        }}>
          <span style={{ fontSize: 13, color: "var(--crm-danger)", fontWeight: 500 }}>
            ⚠ Tienes {overdueActivities.length} seguimiento{overdueActivities.length > 1 ? "s" : ""} vencido{overdueActivities.length > 1 ? "s" : ""}
          </span>
          <button onClick={() => onNavigate("activities")} style={{
            marginLeft: "auto", fontSize: 12, color: "var(--crm-danger)", background: "transparent",
            border: "none", cursor: "pointer", textDecoration: "underline",
          }}>Ver actividades</button>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="crm-card" style={{ padding: 20, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--crm-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${kpi.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.accent }}>
                <SvgIcon path={kpi.icon} size={16} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Pipeline chart */}
        <div className="crm-card" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Pipeline de Ventas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pipelineData.map(stage => (
              <div key={stage.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 90, fontSize: 12, color: "var(--crm-text-muted)", textAlign: "right", flexShrink: 0 }}>{stage.name}</span>
                <div style={{ flex: 1, height: 28, background: "var(--crm-bg)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: "100%", width: `${(stage.count / maxCount) * 100}%`, background: stage.color,
                    borderRadius: 6, transition: "width 0.6s ease", minWidth: stage.count > 0 ? 32 : 0,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                  }}>
                    {stage.count > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{stage.count}</span>}
                  </div>
                </div>
                <span style={{ width: 80, fontSize: 11, color: "var(--crm-text-muted)", flexShrink: 0 }}>{formatCRM(stage.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="crm-card" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Actividad Reciente</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivities.map(a => {
              const contact = crm.contacts.find(c => c.id === a.contactId);
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "var(--crm-bg)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13,
                  }}>{ACTIVITY_ICONS[a.type] || "📝"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.description}</div>
                    <div style={{ fontSize: 11, color: "var(--crm-text-muted)", marginTop: 2 }}>
                      {contact?.name} · {formatRelative(a.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hot leads + upcoming */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="crm-card" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Leads Calientes</h3>
          {hotLeads.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>Sin leads calientes</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {hotLeads.map(c => (
                <button key={c.id} onClick={() => onNavigate("contact-detail", c.id)}
                  className="crm-nav-item" style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 8, border: "none", background: "var(--crm-bg)", cursor: "pointer",
                    color: "var(--crm-text)", textAlign: "left", width: "100%",
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "var(--crm-accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--crm-accent-text)", fontSize: 11, fontWeight: 600,
                  }}>{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{c.company}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 48, height: 4, borderRadius: 2, background: "var(--crm-bg)", overflow: "hidden" }}>
                      <div style={{ width: `${c.score}%`, height: "100%", borderRadius: 2, background: "var(--crm-danger)" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{c.score}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="crm-card" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Próximos Cierres</h3>
          {activeDeals.sort((a, b) => (a.expectedClose || Infinity) - (b.expectedClose || Infinity)).slice(0, 4).map(d => {
            const contact = crm.contacts.find(c => c.id === d.contactId);
            const days = daysUntil(d.expectedClose);
            return (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--crm-border)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{contact?.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--crm-accent)" }}>{formatCRM(d.value)}</div>
                  <div style={{ fontSize: 11, color: days <= 3 ? "var(--crm-danger)" : "var(--crm-text-muted)" }}>
                    {days <= 0 ? "Vencido" : `${days}d`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
