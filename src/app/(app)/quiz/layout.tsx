import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import Script from "next/script";

export default async function QuizLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      <Script id="quiz-protection" strategy="afterInteractive">
        {`
          if (window.location.hostname !== 'localhost') {
            // Bloquear clic derecho
            document.addEventListener('contextmenu', e => e.preventDefault());
            
            // Bloquear atajos de teclado críticos
            document.addEventListener('keydown', e => {
              if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
                (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                (e.ctrlKey && e.keyCode === 83) || // Ctrl+S
                (e.ctrlKey && e.keyCode === 80) || // Ctrl+P
                (e.ctrlKey && e.keyCode === 67)    // Ctrl+C
              ) {
                e.preventDefault();
                return false;
              }
            });

            // Bloquear selección de texto
            document.onselectstart = () => false;
          }
        `}
      </Script>
      {children}
    </>
  );
}
