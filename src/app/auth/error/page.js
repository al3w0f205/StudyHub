import Link from "next/link";

export const metadata = {
  title: "Error de Autenticación",
};

export default async function AuthErrorPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  const errorMessages = {
    CredentialsSignin: "Credenciales inválidas. Verifica tu correo y contraseña.",
    OAuthSignin: "Error al iniciar sesión con el proveedor.",
    OAuthCallback: "Error en la respuesta del proveedor de autenticación.",
    OAuthCreateAccount: "No se pudo crear la cuenta con el proveedor.",
    EmailCreateAccount: "No se pudo crear la cuenta con ese correo.",
    Callback: "Error en el proceso de autenticación.",
    OAuthAccountNotLinked:
      "Este correo ya está registrado con otro método de inicio de sesión.",
    SessionRequired: "Debes iniciar sesión para acceder a esta página.",
    Default: "Ocurrió un error inesperado durante la autenticación.",
  };

  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div
      className="relative min-h-dvh flex items-center justify-center"
      style={{ background: "var(--gradient-hero)", padding: "1rem" }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-full)",
            background: "rgba(244, 63, 94, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "1.75rem",
          }}
        >
          ⚠️
        </div>

        <h1 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.75rem" }}>
          Error de Autenticación
        </h1>

        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.6" }}>
          {message}
        </p>

        <Link href="/auth/login" className="btn btn-primary btn-lg" style={{ width: "100%" }} id="error-retry-btn">
          Intentar de Nuevo
        </Link>

        <Link
          href="/"
          style={{
            display: "block",
            marginTop: "1rem",
            fontSize: "0.8125rem",
            color: "var(--text-tertiary)",
          }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
