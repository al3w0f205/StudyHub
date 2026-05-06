import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/auth-guards";
import SeedButton from "./SeedButton";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Panel de Administración — StudyHub",
};
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="admin-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "800",
              letterSpacing: "-0.025em",
            }}
          >
            Bienvenido al Centro de Control 🚀
          </h1>
          <p style={{ color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
            Monitorea el crecimiento y desempeño de StudyHub en tiempo real.
          </p>
        </div>
        {/* @ts-ignore - SeedButton migration pending */}
        <SeedButton />
      </div>

      {/* @ts-ignore - AdminDashboard migration pending */}
      <AdminDashboard />
    </div>
  );
}
