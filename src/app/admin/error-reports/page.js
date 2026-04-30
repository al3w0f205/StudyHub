import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reportes de Error — Admin" };

export default async function AdminErrorReportsPage() {
  try {
    const reports = await prisma.errorReport.findMany({
      include: {
        user: { select: { name: true, email: true } },
        question: { 
          include: { 
            category: { select: { name: true, career: { select: { name: true } } } } 
          } 
        }
      },
      orderBy: { createdAt: "desc" }
    });

  return (
    <div className="admin-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>🚩 Reportes de Error</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>Problemas reportados por los usuarios en las preguntas</p>
        </div>
        <Link href="/admin" className="btn btn-secondary">Volver</Link>
      </div>

      <div className="solid-card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-default)" }}>
              <th style={{ padding: "1rem" }}>Fecha</th>
              <th style={{ padding: "1rem" }}>Usuario</th>
              <th style={{ padding: "1rem" }}>Pregunta</th>
              <th style={{ padding: "1rem" }}>Materia / Carrera</th>
              <th style={{ padding: "1rem" }}>Motivo / Reporte</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>No hay reportes pendientes.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: "600" }}>{report.user.name || "Anon"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{report.user.email}</div>
                  </td>
                  <td style={{ padding: "1rem", maxWidth: "250px" }}>
                    <div style={{ 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      display: "-webkit-box", 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: "vertical" 
                    }}>
                      {report.question.text}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div>{report.question.category.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{report.question.category.career.name}</div>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--warning-400)", fontWeight: "500" }}>
                    {report.reason}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/questions/${report.questionId}`} className="btn btn-sm btn-secondary">Editar Pregunta</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    );
  } catch (error) {
    console.error("AdminErrorReports Error:", error);
    return (
      <div className="solid-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>⚠️ Error de Base de Datos</h2>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con la base de datos para cargar los reportes.
        </p>
        <Link href="/admin/error-reports" className="btn btn-primary">Reintentar</Link>
      </div>
    );
  }
}
