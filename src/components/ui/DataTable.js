// DataTable — Tabla genérica reutilizable para admin (usuarios, pagos, reportes).
// Props: columns (array de {key, label, render}), data, emptyMessage, onRowClick.
// Responsive: scroll horizontal en mobile. Soporta render functions custom por columna.
"use client";

export default function DataTable({ 
  columns = [], 
  data = [], 
  actions = null,
  emptyMessage = "No se encontraron datos.",
  onRowClick = null
}) {
  return (
    <div className="solid-card" style={{ overflowX: "auto", padding: 0 }}>
      <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-default)" }}>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                style={{ 
                  padding: "1rem 1.25rem", 
                  textAlign: "left", 
                  fontSize: "0.75rem", 
                  fontWeight: 700, 
                  color: "var(--text-tertiary)", 
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick?.(row)}
                style={{ 
                  borderBottom: "1px solid var(--border-default)", 
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background 0.2s ease"
                }}
                className={onRowClick ? "table-row-hover" : ""}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} style={{ padding: "1rem 1.25rem", fontSize: "0.875rem" }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td style={{ padding: "0.75rem 1.25rem", textAlign: "right" }}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
