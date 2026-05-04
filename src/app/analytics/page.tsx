"use client";

import { useState, useEffect } from "react";
import { BarChart3, RefreshCw, TrendingUp, Eye, Globe, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GA4Report {
  sessions: number;
  pageviews: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number }>;
  fetchedAt: string;
}

const COLORS = ["#2563eb", "#8b5cf6", "#16a34a", "#ea580c", "#64748b", "#06b6d4", "#f59e0b", "#ec4899"];

export default function AnalyticsPage() {
  const [report, setReport] = useState<GA4Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/app/api/google/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setReport(d);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Analytics
          </h1>
          <p className="text-muted-foreground">
            Google Analytics 4 · Últimos 30 días
            {report?.fetchedAt && (
              <span className="ml-2 text-xs">
                (actualizado {new Date(report.fetchedAt).toLocaleString("es-CO")})
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
          {error.includes("GA4") && (
            <div className="mt-1 text-xs">
              Configura <code>GA4_PROPERTY_ID</code> y <code>GA4_CREDENTIALS</code> en tus variables de entorno.
            </div>
          )}
        </div>
      )}

      {loading && !report ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : report ? (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sesiones</p>
                    <p className="text-2xl font-bold">{report.sessions.toLocaleString("es-CO")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pageviews</p>
                    <p className="text-2xl font-bold">{report.pageviews.toLocaleString("es-CO")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Páginas más visitadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.topPages} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="page" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, "Vistas"]} />
                    <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                      {report.topPages.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Fuentes de tráfico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.trafficSources} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="source" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, "Sesiones"]} />
                    <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
                      {report.trafficSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
