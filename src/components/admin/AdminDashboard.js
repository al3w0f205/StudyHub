"use client";

import { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { 
  Users, CreditCard, HelpCircle, AlertTriangle, TrendingUp, 
  Activity, BookOpen, ChevronRight, RefreshCw 
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error loading stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <RefreshCw className="animate-spin" size={32} color="var(--primary-400)" />
      </div>
    );
  }

  if (!stats) return <div>Error al cargar estadísticas.</div>;

  const { summary, revenueHistory, userGrowth, activityHistory, failedRanking } = stats;

  return (
    <div className="animate-fade-in" style={{ display: "grid", gap: "1.5rem" }}>
      
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
        <StatCard 
          title="Usuarios Totales" 
          value={summary.totalUsers} 
          icon={<Users size={20} />} 
          color="var(--primary-400)"
          link="/admin/users"
        />
        <StatCard 
          title="Ingresos Totales" 
          value={`$${summary.revenue}`} 
          icon={<CreditCard size={20} />} 
          color="var(--success-400)"
          link="/admin/payments"
        />
        <StatCard 
          title="Pagos Pendientes" 
          value={summary.pendingPayments} 
          icon={<AlertTriangle size={20} />} 
          color={summary.pendingPayments > 0 ? "var(--warning-400)" : "var(--text-tertiary)"}
          link="/admin/payments"
        />
        <StatCard 
          title="Reportes de Error" 
          value={summary.errorReports} 
          icon={<HelpCircle size={20} />} 
          color={summary.errorReports > 0 ? "var(--danger-400)" : "var(--text-tertiary)"}
          link="/admin/error-reports"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        
        {/* Revenue Area Chart */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={18} color="var(--success-400)" /> Ingresos (Últimos 30 días)
            </h3>
          </div>
          <div style={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success-400)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success-400)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                  minTickGap={30}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--text-tertiary)", fontSize: "10px" }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--success-400)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Bar Chart */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} color="var(--accent-400)" /> Actividad (Últimos 7 días)
            </h3>
          </div>
          <div style={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--text-tertiary)", fontSize: "10px" }}
                />
                <Bar dataKey="count" fill="var(--accent-400)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Failed Ranking Radar Chart */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Materias Críticas (Más falladas)</h3>
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={failedRanking}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} />
                <PolarRadiusAxis hide />
                <Radar
                  name="Fallos"
                  dataKey="failures"
                  stroke="var(--danger-400)"
                  fill="var(--danger-400)"
                  fillOpacity={0.4}
                />
                <Tooltip 
                   contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "8px" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Accesos Rápidos</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <QuickLink href="/admin/careers" title="Gestionar Carreras" subtitle="Añade o edita carreras y módulos" icon={<BookOpen size={18} />} />
            <QuickLink href="/admin/questions" title="Banco de Preguntas" subtitle="Editor masivo de preguntas" icon={<HelpCircle size={18} />} />
            <QuickLink href="/admin/users" title="Usuarios y Permisos" subtitle="Gestionar acceso de estudiantes" icon={<Users size={18} />} />
          </div>
        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color, link }) {
  return (
    <Link href={link} className="solid-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", transition: "transform 0.2s", cursor: "pointer" }}>
      <div style={{ 
        width: "40px", height: "40px", borderRadius: "10px", 
        background: `${color}15`, color: color,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
        <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{value}</div>
      </div>
    </Link>
  );
}

function QuickLink({ href, title, subtitle, icon }) {
  return (
    <Link href={href} style={{ 
      display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", 
      background: "var(--bg-tertiary)", border: "1px solid var(--border-default)", 
      borderRadius: "var(--radius-md)", textDecoration: "none", color: "inherit",
      transition: "all 0.2s"
    }} className="quick-link-hover">
      <div style={{ color: "var(--primary-400)" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{title}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{subtitle}</div>
      </div>
      <ChevronRight size={16} color="var(--text-tertiary)" />
    </Link>
  );
}
