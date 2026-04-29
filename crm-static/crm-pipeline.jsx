// Pipeline Kanban Screen with drag & drop
function PipelineScreen() {
  const crm = useCRM();
  const [draggedDeal, setDraggedDeal] = React.useState(null);
  const [dragOverStage, setDragOverStage] = React.useState(null);

  const activeStages = crm.stages.filter(s => !s.isLost);

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", deal.id);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stageId !== stageId) {
      crm.moveDeal(draggedDeal.id, stageId);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const TempDot = ({ temp }) => {
    const colors = { hot: "var(--crm-danger)", warm: "#f59e0b", cold: "var(--crm-text-muted)" };
    return <div style={{ width: 6, height: 6, borderRadius: 3, background: colors[temp] || colors.cold }} />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 13, color: "var(--crm-text-muted)" }}>Arrastra los deals entre etapas</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--crm-text-muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><TempDot temp="hot" /> Caliente</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><TempDot temp="warm" /> Tibio</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><TempDot temp="cold" /> Frío</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {activeStages.map(stage => {
          const stageDeals = crm.deals.filter(d => d.stageId === stage.id);
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
          const isOver = dragOverStage === stage.id;

          return (
            <div key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={e => handleDrop(e, stage.id)}
              style={{
                minWidth: 260, width: 260, flexShrink: 0, display: "flex", flexDirection: "column",
                borderRadius: 12, background: isOver ? "var(--crm-drop-highlight)" : "var(--crm-surface)",
                border: `1px solid ${isOver ? "var(--crm-accent)" : "var(--crm-border)"}`,
                transition: "all 0.2s",
              }}
            >
              {/* Column header */}
              <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--crm-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: stage.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{stage.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "var(--crm-text-muted)", background: "var(--crm-bg)",
                    padding: "1px 6px", borderRadius: 10,
                  }}>{stageDeals.length}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--crm-text-muted)" }}>{formatCRM(stageValue)}</div>
              </div>

              {/* Cards */}
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 100, flex: 1 }}>
                {stageDeals.map(deal => {
                  const contact = crm.contacts.find(c => c.id === deal.contactId);
                  const isDragging = draggedDeal?.id === deal.id;

                  return (
                    <div key={deal.id}
                      draggable
                      onDragStart={e => handleDragStart(e, deal)}
                      onDragEnd={handleDragEnd}
                      className="crm-card crm-deal-card"
                      style={{
                        padding: 12, borderRadius: 8, cursor: "grab",
                        opacity: isDragging ? 0.4 : 1, transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, lineHeight: 1.3 }}>{deal.title}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--crm-accent)" }}>{formatCRM(deal.value)}</span>
                        <TempDot temp={contact?.temperature} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{contact?.name || "—"}</span>
                        <span style={{ fontSize: 11, color: "var(--crm-text-muted)" }}>{deal.probability}%</span>
                      </div>
                      {/* Probability bar */}
                      <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: "var(--crm-bg)", overflow: "hidden" }}>
                        <div style={{ width: `${deal.probability}%`, height: "100%", borderRadius: 2, background: stage.color, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
                {stageDeals.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--crm-text-muted)", opacity: 0.5 }}>
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

Object.assign(window, { PipelineScreen });
