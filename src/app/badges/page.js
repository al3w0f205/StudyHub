import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis Logros — StudyHub" };

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

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div className="page-header" style={{ textAlign: "center", display: "block", marginBottom: "3rem" }}>
        <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏅 Mis Logros</h1>
        <p className="page-subtitle" style={{ fontSize: "1.125rem" }}>Desbloquea medallas completando desafíos y estudiando a diario</p>
        <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: "1.5rem", borderRadius: "var(--radius-full)" }}>
          ← Volver al Panel
        </Link>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {allBadges.map(badge => {
          const isEarned = !!earnedMap[badge.id];
          return (
            <div key={badge.id} className="solid-card" style={{ 
              padding: "1.5rem", 
              textAlign: "center",
              opacity: isEarned ? 1 : 0.5,
              filter: isEarned ? "none" : "grayscale(0.8)",
              transition: "all 0.3s ease",
              position: "relative",
              border: isEarned ? "1px solid var(--accent-400)" : "1px solid var(--border-default)",
              background: isEarned ? "var(--glass-bg)" : "var(--bg-card)"
            }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{badge.icon}</div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.5rem", color: isEarned ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                {badge.name}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {badge.description}
              </p>
              
              {isEarned ? (
                <div style={{ 
                  marginTop: "1rem", 
                  fontSize: "0.6875rem", 
                  fontWeight: "700", 
                  color: "var(--accent-400)",
                  textTransform: "uppercase"
                }}>
                  ¡Ganado el {new Date(earnedMap[badge.id]).toLocaleDateString()}!
                </div>
              ) : (
                <div style={{ 
                  marginTop: "1rem", 
                  fontSize: "0.6875rem", 
                  fontWeight: "600", 
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase"
                }}>
                  Bloqueado
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
