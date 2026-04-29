import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trofeos — StudyHub" };

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

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

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.25rem" }}>
      {/* PS Style Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #003087 0%, #001a4d 100%)", 
        borderRadius: "var(--radius-xl)", 
        padding: "2.5rem", 
        marginBottom: "3rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative background circle */}
        <div style={{ 
          position: "absolute", 
          right: "-50px", 
          top: "-50px", 
          width: "250px", 
          height: "250px", 
          borderRadius: "50%", 
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none"
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              background: "white", 
              display: "grid", 
              placeItems: "center", 
              fontSize: "2.5rem",
              boxShadow: "0 0 20px rgba(255,255,255,0.3)"
            }}>
              🏆
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "white", marginBottom: "0.25rem" }}>Trofeos</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>{session.user.name}</p>
            </div>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "white" }}>{progressPercent}%</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>Progreso Total</div>
          </div>
        </div>

        <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ 
            height: "100%", 
            width: `${progressPercent}%`, 
            background: "linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)",
            boxShadow: "0 0 10px #00d2ff"
          }} />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", backdropFilter: "blur(10px)" }}>
            ← Volver
          </Link>
        </div>
      </div>

      {/* Trophy List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {allBadges.length === 0 && (
          <div className="solid-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>
            Aún no se han definido trofeos en el sistema.
          </div>
        )}
        {allBadges.map((badge, index) => {
          const isEarned = !!earnedMap[badge.id];
          // Simple logic to determine "tier" color if not in DB
          const isPlatinum = index === 0 && allBadges.length > 5; // First one is platinum? 
          
          return (
            <div 
              key={badge.id} 
              className="solid-card animate-fade-in" 
              style={{ 
                padding: "1rem 1.5rem", 
                display: "grid", 
                gridTemplateColumns: "auto 1fr auto", 
                alignItems: "center", 
                gap: "1.5rem",
                opacity: isEarned ? 1 : 0.4,
                filter: isEarned ? "none" : "grayscale(1)",
                transition: "all 0.3s ease",
                background: isEarned ? "var(--bg-card)" : "rgba(255,255,255,0.02)",
                border: isEarned ? "1px solid var(--border-default)" : "1px solid rgba(255,255,255,0.05)",
                transform: isEarned ? "scale(1.01)" : "scale(1)",
                boxShadow: isEarned ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
              }}
            >
              {/* Icon Container */}
              <div style={{ 
                width: "60px", 
                height: "60px", 
                background: isEarned ? "rgba(34, 211, 238, 0.1)" : "rgba(255,255,255,0.05)", 
                borderRadius: "12px", 
                display: "grid", 
                placeItems: "center", 
                fontSize: "2rem",
                border: isEarned ? "1px solid rgba(34, 211, 238, 0.3)" : "1px solid transparent"
              }}>
                {badge.icon}
              </div>

              {/* Content */}
              <div>
                <h3 style={{ 
                  fontSize: "1.125rem", 
                  fontWeight: "800", 
                  marginBottom: "0.25rem",
                  color: isEarned ? "var(--text-primary)" : "var(--text-tertiary)"
                }}>
                  {badge.name}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "500px" }}>
                  {badge.description}
                </p>
              </div>

              {/* Status */}
              <div style={{ textAlign: "right" }}>
                {isEarned ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <div className="badge badge-success" style={{ fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>DESBLOQUEADO</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600" }}>
                      {new Date(earnedMap[badge.id]).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <div className="badge" style={{ background: "rgba(255,255,255,0.1)", color: "var(--text-tertiary)", fontSize: "0.625rem", padding: "0.2rem 0.5rem" }}>BLOQUEADO</div>
                    <div style={{ fontSize: "1rem", opacity: 0.3 }}>🔒</div>
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
