import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Clasificación Global — StudyHub" };
export const dynamic = "force-dynamic";

function getDisplayName(user) {
  return user.name || user.email?.split("@")[0] || "Estudiante";
}

function getAvatarUrl(user) {
  return user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
}

export default async function LeaderboardPage() {
  const session = await auth();
  
  // Fetch users sorted by totalPoints
  const users = await prisma.user.findMany({
    where: {
      totalPoints: { gt: 0 }
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      totalPoints: true,
      streak: true,
      quizProgress: {
        select: { id: true }
      }
    },
    orderBy: {
      totalPoints: "desc"
    },
    take: 50
  });

  const rankings = users.map(u => ({
    id: u.id,
    name: getDisplayName(u),
    image: getAvatarUrl({ name: getDisplayName(u), image: u.image }),
    totalPoints: u.totalPoints,
    completedQuizzes: u.quizProgress.length,
    streak: u.streak
  }));
  
  // Get top 3
  const top3 = rankings.slice(0, 3);

  // Current user's rank
  const currentUserRank = rankings.findIndex(r => r.id === session?.user?.id) + 1;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.25rem" }}>
      
      {/* Header */}
      <div className="page-header" style={{ textAlign: "center", display: "block", marginBottom: "3rem" }}>
        <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏆 Salón de la Fama</h1>
        <p className="page-subtitle" style={{ fontSize: "1.125rem" }}>Los estudiantes con mayor rendimiento en StudyHub</p>
        <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: "1.5rem", borderRadius: "var(--radius-full)" }}>
          ← Volver al Panel
        </Link>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{ 
          display: "flex", 
          alignItems: "flex-end", 
          justifyContent: "center", 
          gap: "1rem", 
          marginBottom: "4rem",
          padding: "0 1rem"
        }}>
          {/* 2nd Place */}
          {top3[1] && (
            <div style={{ textAlign: "center", flex: 1, maxWidth: "150px" }}>
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <Image src={top3[1].image} alt="" width={70} height={70} style={{ borderRadius: "50%", border: "3px solid #C0C0C0", padding: "2px" }} />
                <div style={{ position: "absolute", bottom: -5, right: "50%", transform: "translateX(50%)", background: "#C0C0C0", color: "black", width: "24px", height: "24px", borderRadius: "50%", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
              </div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{top3[1].name}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>{top3[1].totalPoints.toLocaleString()} pts</div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div style={{ textAlign: "center", flex: 1, maxWidth: "180px", transform: "translateY(-20px)" }}>
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <Image src={top3[0].image} alt="" width={100} height={100} style={{ borderRadius: "50%", border: "4px solid var(--warning-400)", padding: "3px", boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)" }} />
                <div style={{ position: "absolute", top: -15, right: "50%", transform: "translateX(50%)", fontSize: "1.5rem" }}>👑</div>
                <div style={{ position: "absolute", bottom: -5, right: "50%", transform: "translateX(50%)", background: "var(--warning-400)", color: "black", width: "30px", height: "30px", borderRadius: "50%", fontSize: "0.875rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
              </div>
              <div style={{ fontWeight: "800", fontSize: "1rem", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{top3[0].name}</div>
              <div style={{ color: "var(--warning-400)", fontWeight: "700", fontSize: "0.875rem" }}>{top3[0].totalPoints.toLocaleString()} pts</div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div style={{ textAlign: "center", flex: 1, maxWidth: "150px" }}>
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <Image src={top3[2].image} alt="" width={60} height={60} style={{ borderRadius: "50%", border: "3px solid #CD7F32", padding: "2px" }} />
                <div style={{ position: "absolute", bottom: -5, right: "50%", transform: "translateX(50%)", background: "#CD7F32", color: "black", width: "22px", height: "22px", borderRadius: "50%", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
              </div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{top3[2].name}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>{top3[2].totalPoints.toLocaleString()} pts</div>
            </div>
          )}
        </div>
      )}

      {/* Rankings List */}
      <div className="solid-card" style={{ padding: "0" }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "700" }}>Clasificación General</h2>
          {currentUserRank > 0 && (
            <span style={{ fontSize: "0.875rem", color: "var(--accent-400)", fontWeight: "600" }}>Tu posición: #{currentUserRank}</span>
          )}
        </div>
        
        {rankings.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>Aún no hay puntuaciones registradas.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rankings.map((user, index) => (
              <div key={user.id} style={{ 
                padding: "1rem 1.25rem", 
                borderBottom: index === rankings.length - 1 ? "none" : "1px solid var(--border-default)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: user.id === session?.user?.id ? "rgba(99, 102, 241, 0.05)" : "transparent"
              }}>
                <div style={{ width: "24px", textAlign: "center", fontWeight: "700", color: index < 3 ? "var(--accent-400)" : "var(--text-tertiary)", fontSize: "0.875rem" }}>
                  {index + 1}
                </div>
                <Image src={user.image} alt="" width={36} height={36} style={{ borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "0.9375rem" }}>{user.name} {user.id === session?.user?.id && <span style={{ fontSize: "0.7rem", color: "var(--accent-400)" }}>(Tú)</span>}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{user.completedQuizzes} cuestionarios</span>
                    {user.streak > 0 && <span style={{ color: "var(--warning-400)", fontWeight: "600" }}>🔥 {user.streak}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "800", color: "var(--text-primary)" }}>{user.totalPoints.toLocaleString()}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Puntos</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
