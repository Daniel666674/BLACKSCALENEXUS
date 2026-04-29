// ── BlackScale Nexus — BSSpinner ──────────────────────────────────────────────
// Reusable loader with the BlackScale "B" mark. Three sizes: sm · md · lg
// Used in 4 places only: button loading, card fetch, section overlay, inline row
// ─────────────────────────────────────────────────────────────────────────────

(function injectSpinnerStyles() {
  if (document.getElementById("bs-spinner-styles")) return;
  const style = document.createElement("style");
  style.id = "bs-spinner-styles";
  style.textContent = `
    /* ── Keyframes ──────────────────────────────────────────── */
    @keyframes bs-arc {
      0%   { stroke-dashoffset: var(--bs-full); transform: rotate(-90deg); }
      45%  { stroke-dashoffset: var(--bs-short); transform: rotate(120deg); }
      100% { stroke-dashoffset: var(--bs-full); transform: rotate(270deg); }
    }
    @keyframes bs-pulse-opacity {
      0%, 100% { opacity: 0.3; }
      50%       { opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .bs-arc-path { animation: bs-pulse-opacity 1.6s ease-in-out infinite !important; }
    }

    /* ── Arc path ───────────────────────────────────────────── */
    .bs-arc-path {
      fill: none;
      stroke: #C89B3C;
      stroke-linecap: round;
      animation: bs-arc 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      transform-origin: center;
      filter: drop-shadow(0 0 3px rgba(200,155,60,0.6));
    }

    /* ── Track (faint background ring) ─────────────────────── */
    .bs-track { fill: none; stroke: rgba(200,155,60,0.08); }

    /* ── B mark ─────────────────────────────────────────────── */
    .bs-b {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-weight: 700;
      fill: #C89B3C;
      dominant-baseline: central;
      text-anchor: middle;
      user-select: none;
    }

    /* ── Wrapper ─────────────────────────────────────────────── */
    .bs-spinner { display: inline-flex; flex-direction: column; align-items: center; gap: 10px; }
    .bs-spinner-label { font-size: 12px; color: #888; font-family: 'Inter', sans-serif; }

    /* ── Card skeleton ──────────────────────────────────────── */
    @keyframes bs-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .bs-skeleton {
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
      background-size: 400px 100%;
      animation: bs-shimmer 1.4s ease-in-out infinite;
    }

    /* ── Section overlay ─────────────────────────────────────── */
    .bs-section-overlay {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 16px; z-index: 10;
      background: rgba(13,13,13,0.7);
      border-radius: inherit;
      transition: opacity 300ms ease;
    }
    .bs-section-overlay.fade-out { opacity: 0; pointer-events: none; }
    .bs-section-grid {
      position: absolute; inset: 0; border-radius: inherit; overflow: hidden;
      background-image:
        linear-gradient(rgba(200,155,60,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(200,155,60,.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .bs-section-glow {
      position: absolute;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(200,155,60,.12) 0%, transparent 70%);
      pointer-events: none;
    }

    /* ── Button loading state ────────────────────────────────── */
    .bs-btn-loading {
      opacity: 0.7 !important;
      pointer-events: none !important;
      cursor: not-allowed !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
  `;
  document.head.appendChild(style);
})();

// ── Config per size ───────────────────────────────────────────────────────────

const BS_SIZES = {
  sm: { ring: 36, bSize: 12, r: 14, sw: 2.5 },
  md: { ring: 52, bSize: 18, r: 21, sw: 3   },
  lg: { ring: 72, bSize: 26, r: 29, sw: 3.5 },
};

// ── Core spinner SVG ──────────────────────────────────────────────────────────

function BSSpinner({ size = "md", label }) {
  const s = BS_SIZES[size] || BS_SIZES.md;
  const cx = s.ring / 2, cy = s.ring / 2;
  const circ = +(2 * Math.PI * s.r).toFixed(2);
  const short = +(circ * 0.22).toFixed(2);
  const arcId = React.useId ? React.useId() : `bs-${Math.random().toString(36).slice(2)}`;

  return React.createElement("div", { className: "bs-spinner" },
    React.createElement("svg", {
      width: s.ring, height: s.ring,
      viewBox: `0 0 ${s.ring} ${s.ring}`,
      style: { overflow: "visible" },
    },
      // inline custom props for animation
      React.createElement("style", null,
        `#${CSS.escape(arcId)} { --bs-full: ${circ}; --bs-short: ${short}; stroke-dasharray: ${circ}; }`
      ),
      // track ring
      React.createElement("circle", {
        className: "bs-track",
        cx, cy, r: s.r,
        strokeWidth: s.sw,
      }),
      // animated arc
      React.createElement("circle", {
        id: arcId,
        className: "bs-arc-path",
        cx, cy, r: s.r,
        strokeWidth: s.sw,
      }),
      // B lettermark — centered, static
      React.createElement("text", {
        className: "bs-b",
        x: cx, y: cy,
        fontSize: s.bSize,
        style: { letterSpacing: "-0.02em" },
      }, "B")
    ),
    label && React.createElement("span", { className: "bs-spinner-label" }, label)
  );
}

// ── 1. BUTTON LOADING STATE ───────────────────────────────────────────────────
// Wrap any button: <BSButton onClick={asyncFn} label="Guardar deal" loadingLabel="Guardando...">

function BSButton({ onClick, label, loadingLabel, style: ext, className }) {
  const [loading, setLoading] = React.useState(false);
  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try { await onClick(); }
    finally { setLoading(false); }
  };
  return React.createElement("button", {
    onClick: handleClick,
    className: `${className || ""} ${loading ? "bs-btn-loading" : ""}`,
    style: ext,
    disabled: loading,
  },
    loading
      ? React.createElement(React.Fragment, null,
          React.createElement(BSSpinner, { size: "sm" }),
          loadingLabel || label
        )
      : label
  );
}

// ── 2. CARD FETCH STATE ───────────────────────────────────────────────────────
// Wrap card content: <BSCardLoader loading={bool} label="Cargando campañas de Brevo...">

function BSCardLoader({ loading, label, children, minHeight = 180 }) {
  if (!loading) return React.createElement(React.Fragment, null, children);
  return React.createElement("div", {
    style: { position: "relative", minHeight, display: "flex", flexDirection: "column", gap: 10 }
  },
    // skeleton blocks
    React.createElement("div", { className: "bs-skeleton", style: { height: 14, borderRadius: 6, width: "60%" } }),
    React.createElement("div", { className: "bs-skeleton", style: { height: 10, borderRadius: 6, width: "80%", marginTop: 4 } }),
    React.createElement("div", { className: "bs-skeleton", style: { height: 10, borderRadius: 6, width: "45%", marginTop: 4 } }),
    React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 } },
      React.createElement(BSSpinner, { size: "md", label: label || "Cargando datos…" })
    )
  );
}

// ── 3. SECTION OVERLAY ────────────────────────────────────────────────────────
// <BSSectionLoader loading={bool} label="Cargando Engagement Board…">…content…</BSSectionLoader>

function BSSectionLoader({ loading, label, children }) {
  const [visible, setVisible] = React.useState(loading);
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (!loading && visible) {
      setFading(true);
      const t = setTimeout(() => { setVisible(false); setFading(false); }, 320);
      return () => clearTimeout(t);
    }
    if (loading) setVisible(true);
  }, [loading]);

  return React.createElement("div", { style: { position: "relative" } },
    children,
    visible && React.createElement("div", {
      className: `bs-section-overlay${fading ? " fade-out" : ""}`,
    },
      React.createElement("div", { className: "bs-section-grid" }),
      React.createElement("div", { className: "bs-section-glow" }),
      React.createElement(BSSpinner, { size: "lg", label: label || "Cargando sección…" })
    )
  );
}

// ── 4. INLINE ROW SPINNER ─────────────────────────────────────────────────────
// <BSInlineSpinner /> — drop-in to replace any row-level action icon

function BSInlineSpinner() {
  return React.createElement(BSSpinner, { size: "sm" });
}

// ── Demo screen (shown in Ajustes / Integration pages if desired) ──────────────

function BSSpinnerDemo() {
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [cardLoading, setCardLoading] = React.useState(true);
  const [sectionLoading, setSectionLoading] = React.useState(false);
  const [rowLoading, setRowLoading] = React.useState({});

  React.useEffect(() => {
    const t = setTimeout(() => setCardLoading(false), 2400);
    return () => clearTimeout(t);
  }, []);

  const fakeAsync = () => new Promise(res => setTimeout(res, 2000));
  const triggerSection = () => {
    setSectionLoading(true);
    setTimeout(() => setSectionLoading(false), 3000);
  };
  const triggerRow = (id) => {
    setRowLoading(p => ({ ...p, [id]: true }));
    setTimeout(() => setRowLoading(p => ({ ...p, [id]: false })), 1800);
  };

  const cardStyle = { background: "var(--crm-surface,#161616)", border: "1px solid var(--crm-border,#2a2a2a)", borderRadius: 10, padding: 20 };
  const labelStyle = { fontSize: 11, color: "var(--crm-text-muted,#888)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 700 };
  const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" };

  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
    React.createElement("div", null,
      React.createElement("h2", { style: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 } }, "BlackScale Spinner"),
      React.createElement("p", { style: { fontSize: 13, color: "var(--crm-text-muted,#888)" } }, "Sistema de carga unificado — una sola animación, tres tamaños, cuatro usos")
    ),

    // ── Sizes showcase ──
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: labelStyle }, "Los tres tamaños"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 40 } },
        React.createElement(BSSpinner, { size: "sm", label: "sm · 36px" }),
        React.createElement(BSSpinner, { size: "md", label: "md · 52px" }),
        React.createElement(BSSpinner, { size: "lg", label: "lg · 72px" }),
      )
    ),

    // ── Button loading ──
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: labelStyle }, "1 · Estado de botón"),
      React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
        ...[
          ["Guardar deal",        "Guardando...",          "rgba(201,151,58,.12)", "var(--crm-accent,#C9973A)", "var(--crm-border,#2a2a2a)"],
          ["Sincronizar Brevo",   "Sincronizando...",      "rgba(139,26,46,.1)",   "#e8869a",                   "rgba(139,26,46,.4)"       ],
          ["Enviar a pipeline",   "Enviando a pipeline..","rgba(34,197,94,.08)",   "#22c55e",                   "rgba(34,197,94,.3)"       ],
        ].map(([lbl, loadLbl, bg, color, border], i) =>
          React.createElement(BSButton, {
            key: i,
            label: lbl,
            loadingLabel: loadLbl,
            onClick: fakeAsync,
            style: { padding: "9px 18px", borderRadius: 8, border: `1px solid ${border}`, background: bg, color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
          })
        )
      )
    ),

    // ── Card loader ──
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: labelStyle }, "2 · Card fetch (2.4s demo)"),
      React.createElement(BSCardLoader, { loading: cardLoading, label: "Cargando campañas de Brevo..." },
        React.createElement("div", { style: { fontSize: 13 } }, "Datos de campañas cargados correctamente ✓")
      ),
      !cardLoading && React.createElement("button", {
        onClick: () => setCardLoading(true),
        style: { marginTop: 12, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--crm-border,#2a2a2a)", background: "transparent", color: "var(--crm-text-muted,#888)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }
      }, "← Re-trigger")
    ),

    // ── Section overlay ──
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: labelStyle }, "3 · Section overlay (3s demo)"),
      React.createElement(BSSectionLoader, { loading: sectionLoading, label: "Cargando Engagement Board…" },
        React.createElement("div", { style: { padding: "24px 0", fontSize: 13, color: "var(--crm-text-muted,#888)" } }, "Contenido de la sección aquí — el overlay cubre esto durante la carga.")
      ),
      React.createElement("button", {
        onClick: triggerSection,
        style: { marginTop: 12, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--crm-border,#2a2a2a)", background: "transparent", color: "var(--crm-text-muted,#888)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }
      }, "Activar overlay")
    ),

    // ── Inline row ──
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: labelStyle }, "4 · Inline en filas"),
      ...["Constructora Ospina — mover a Negociación", "FinServ Colombia — marcar actividad completa", "LogiCarga Ltda — actualizar score de contacto"].map((text, i) =>
        React.createElement("div", { key: i, style: rowStyle },
          React.createElement("span", { style: { fontSize: 13 } }, text),
          rowLoading[i]
            ? React.createElement(BSInlineSpinner)
            : React.createElement("button", {
                onClick: () => triggerRow(i),
                style: { width: 28, height: 28, borderRadius: 6, border: "1px solid var(--crm-border,#2a2a2a)", background: "transparent", color: "var(--crm-text-muted,#888)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
              }, "→")
        )
      )
    )
  );
}

Object.assign(window, { BSSpinner, BSButton, BSCardLoader, BSSectionLoader, BSInlineSpinner, BSSpinnerDemo });
