// =============================================================================
// StudyHub — UploadThing: Configuración de File Router
// =============================================================================
// Define las rutas de subida de archivos usando UploadThing.
//
// RUTAS DEFINIDAS:
//   receiptUploader → Subida de comprobante de pago (imagen, max 4MB, 1 archivo)
//
// SEGURIDAD:
//   - El middleware verifica autenticación antes de permitir la subida.
//   - El userId se adjunta como metadata para tracking.
//   - Si el usuario no está autenticado, se lanza error y se bloquea la subida.
// =============================================================================

import { createUploadthing } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Ruta para subir comprobante de pago (foto del recibo)
  receiptUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Verificar autenticación antes de la subida
      const session = await auth();
      if (!session) throw new Error("Unauthorized");

      // El userId se pasa como metadata al callback onUploadComplete
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Retornar datos al cliente para que pueda enviar el formulario de pago
      return { uploadedBy: metadata.userId, url: file.url };
    }),
};
