"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { MktSection } from "./mkt-types";
import { useMkt } from "./mkt-provider";

const NAV_ITEMS: { id: MktSection; label: string; path: string }[] = [
  { id: "engagement", label: "Engagement Board", path: "M13 10V3L4 14h7v7l9-11h-7z" },
  { id: "icp", label: "ICP Scorer", path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "campaigns", label: "Campañas", path: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "segments", label: "Segmentos", path: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" },
  { id: "attribution", label: "Atribución", path: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" },
  { id: "handoff", label: "Handoff Center", path: "M17 8l4 4m0 0l-4 4m4-4H3" },
];

interface MktSidebarProps {
  current: MktSection;
  onNavigate: (s: MktSection) => void;
}

function SvgIcon({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function MktSidebar({ current, onNavigate }: MktSidebarProps) {
  const { contacts, syncing, syncFromBrevo } = useMkt();
  const { data: session } = useSession();
  const readyCount = contacts.filter(c => c.readyForSales && !c.passedToSalesAt).length;
  const [syncMsg, setSyncMsg] = useState("");

  const handleSync = async () => {
    setSyncMsg("Sincronizando…");
    try {
      const result = await syncFromBrevo();
      setSyncMsg(`✓ ${result.synced} contactos sincronizados`);
    } catch {
      setSyncMsg("Error al sincronizar");
    }
    setTimeout(() => setSyncMsg(""), 4000);
  };

  const userName = session?.user?.name || "Usuario";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const userRole = (session?.user as { role?: string })?.role === "superadmin" ? "Admin" : "Marketing";

  return (
    <aside style={{
      width: 240, minHeight: "100vh", background: "var(--mkt-sidebar)",
      borderRight: "1px solid var(--mkt-border)", display: "flex",
      flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 20px",
        borderBottom: "1px solid var(--mkt-border)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--mkt-accent)", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#0a0a0a", fontWeight: 800, fontSize: 13,
        }}>M</div>
        <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.02em", color: "var(--mkt-text)" }}>
          BlackScale Nexus
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = current === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, border: "none", cursor: "pointer", width: "100%",
                textAlign: "left", fontSize: 13,
                fontWeight: isActive ? 600 : 400, transition: "all 0.15s",
                background: isActive ? "var(--mkt-nav-active-bg)" : "transparent",
                color: isActive ? "var(--mkt-nav-active-text)" : "var(--mkt-text-muted)",
                position: "relative",
              }}>
              <SvgIcon path={item.path} />
              {item.label}
              {item.id === "handoff" && readyCount > 0 && (
                <span style={{
                  position: "absolute", right: 12, minWidth: 18, height: 18, borderRadius: 9,
                  background: "var(--mkt-accent)", color: "#0a0a0a", fontSize: 10,
                  fontWeight: 700, display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0 4px",
                }}>{readyCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Brevo Sync */}
      <div style={{ padding: "8px 8px 0", borderTop: "1px solid var(--mkt-border)" }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
            width: "100%", borderRadius: 8, border: "1px solid var(--mkt-border)",
            background: "transparent", cursor: syncing ? "wait" : "pointer",
            color: syncing ? "var(--mkt-accent)" : "var(--mkt-text-muted)",
            fontSize: 12, textAlign: "left", transition: "color 0.15s",
          }}
        >
          <SvgIcon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={14} />
          {syncing ? "Sincronizando…" : "Sincronizar Brevo"}
        </button>
        {syncMsg && (
          <p style={{ fontSize: 10, color: "var(--mkt-accent)", padding: "4px 12px", margin: 0 }}>
            {syncMsg}
          </p>
        )}
      </div>

      {/* Switch to CRM */}
      <div style={{ padding: "8px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
            width: "100%", borderRadius: 8, border: "1px solid var(--mkt-border)",
            background: "transparent", color: "var(--mkt-text-muted)",
            fontSize: 12, cursor: "pointer", textAlign: "left",
          }}>
            <SvgIcon path="M10 19l-7-7m0 0l7-7m-7 7h18" size={14} />
            Ver Pipeline de Ventas
          </button>
        </Link>
      </div>

      {/* Profile */}
      <div style={{ padding: "12px 20px 16px", borderTop: "1px solid var(--mkt-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={userName}
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--mkt-accent)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#0a0a0a", fontWeight: 600, fontSize: 12,
            }}>{userInitials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--mkt-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </div>
            <div style={{ fontSize: 10, color: "var(--mkt-text-muted)" }}>{userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
