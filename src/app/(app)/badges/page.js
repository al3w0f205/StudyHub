import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy, Shield, Zap, Star, Lock, CheckCircle, GraduationCap, ArrowLeft, Activity } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trofeos y Logros — StudyHub" };

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/badges");

  const allBadges = await prisma.badge.findMany({
    orderBy: { createdAt: "asc" }
  });

  const userBadges = await prisma.userBadge.findMany({
    where: { userId: session.user.id },
    select: { badgeId: true, earnedAt: true }
  });

  const earnedMap = {};
  userBadges.forEach(ub => {
    earnedMap[ub.badgeId] = ub.earnedAt;
  });

  const totalEarned = userBadges.length;
  const progressPercent = allBadges.length > 0 ? Math.round((totalEarned / allBadges.length) * 100) : 0;
  
  const generalBadges = allBadges.filter(b => !b.slug.startsWith('career_'));
  const careerBadges = allBadges.filter(b => b.slug.startsWith('career_'));

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.25rem" }}>
      
      {/* Header Premium */}
      <div style={{ 
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", 
        borderRadius: "var(--radius-xl)", 
        padding: "2.5rem", 
        marginBottom: "2.5rem",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Glow effect */}
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ 
              width: "84px", height: "84px", borderRadius: "20px", 
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              display: "grid", placeItems: "center", fontSize: "2.5rem",
              boxShadow: "0 0 30px rgba(0,0,0,0.3)"
            }}>
              🏆
            </div>
            <div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: "900", color: "white", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>Trofeos</h1>
              <p style={{ color: "var(--primary-300)", fontWeight: "600", fontSize: "0.9375rem" }}>{session.user.name}</p>
            </div>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2.75rem", fontWeight: "900", color: "white", lineHeight: 1 }}>{progressPercent}%</div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Progreso Total</div>
          </div>
        </div>

        <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden", marginTop: "2rem" }}>
          <div style={{ 
            height: "100%", 
            width: `${progressPercent}%`, 
            background: "linear-gradient(90deg, var(--primary-500) 0%, var(--accent-500) 100%)",
            boxShadow: "0 0 15px var(--primary-500)"
          }} />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <Link href="/quiz" className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
            <ArrowLeft size={16} /> Volver al Menú
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        <div className="solid-card" style={{ padding: "1.25rem", border: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Desbloqueados</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>{totalEarned}</div>
            </div>
            <CheckCircle size={28} color="var(--success-400)" opacity={0.5} />
          </div>
        </div>
        <div className="solid-card" style={{ padding: "1.25rem", border: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Pendientes</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>{allBadges.length - totalEarned}</div>
            </div>
            <Lock size={28} color="var(--text-tertiary)" opacity={0.3} />
          </div>
        </div>
      </div>

      {/* Badges Sections */}
      <div style={{ display: "grid", gap: "3rem" }}>
        
        {/* Section 1: General */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Zap size={20} color="var(--primary-400)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Logros Generales</h2>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {generalBadges.map(badge => <BadgeRow key={badge.id} badge={badge} earnedAt={earnedMap[badge.id]} />)}
          </div>
        </section>

        {/* Section 2: Careers */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <GraduationCap size={20} color="var(--accent-400)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Especialización por Carrera</h2>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {careerBadges.map(badge => <BadgeRow key={badge.id} badge={badge} earnedAt={earnedMap[badge.id]} />)}
          </div>
        </section>

      </div>
    </div>
  );
}

function BadgeRow({ badge, earnedAt }) {
  const isEarned = !!earnedAt;
  
  return (
    <div 
      className="solid-card animate-fade-in" 
      style={{ 
        padding: "1.25rem 1.5rem", 
        display: "grid", 
        gridTemplateColumns: "auto 1fr auto", 
        alignItems: "center", 
        gap: "1.5rem",
        opacity: isEarned ? 1 : 0.5,
        background: isEarned ? "rgba(255,255,255,0.02)" : "transparent",
        border: isEarned ? "1px solid var(--border-default)" : "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {isEarned && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "var(--primary-500)" }} />
      )}

      {/* Icon */}
      <div style={{ 
        width: "56px", 
        height: "56px", 
        background: isEarned ? "var(--bg-tertiary)" : "rgba(255,255,255,0.05)", 
        borderRadius: "14px", 
        display: "grid", 
        placeItems: "center", 
        fontSize: "1.75rem",
        boxShadow: isEarned ? "inset 0 0 10px rgba(99, 102, 241, 0.2)" : "none",
        border: isEarned ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent"
      }}>
        {isEarned ? badge.icon : "🔒"}
      </div>

      {/* Info */}
      <div>
        <h3 style={{ 
          fontSize: "1.0625rem", 
          fontWeight: "800", 
          marginBottom: "0.25rem",
          color: isEarned ? "var(--text-primary)" : "var(--text-tertiary)"
        }}>
          {badge.name}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "600px" }}>
          {badge.description}
        </p>
      </div>

      {/* Status Label */}
      <div style={{ textAlign: "right" }}>
        {isEarned ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
            <div style={{ fontSize: "0.625rem", fontWeight: 800, padding: "0.25rem 0.5rem", borderRadius: "4px", background: "var(--success-500)20", color: "var(--success-400)", border: "1px solid var(--success-500)30" }}>DESBLOQUEADO</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600", marginTop: "0.25rem" }}>
              {new Date(earnedAt).toLocaleDateString("es-ES", { day: 'numeric', month: 'short' })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.625rem", fontWeight: 800, padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "var(--text-tertiary)", border: "1px solid rgba(255,255,255,0.1)" }}>BLOQUEADO</div>
        )}
      </div>
    </div>
  );
}
