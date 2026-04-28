# StudyHub 🎓

StudyHub es una plataforma educativa de alto rendimiento diseñada para estudiantes pre-universitarios y universitarios. Ofrece un sistema avanzado de cuestionarios gamificados, gestión de suscripciones mediante comprobantes y una interfaz "OLED Dark" de última generación orientada a maximizar la retención y el enfoque.

## 🚀 Características Principales

### 1. Sistema Avanzado de Cuestionarios
*   **Aleatorización Dinámica:** Las preguntas y sus opciones de respuesta se mezclan aleatoriamente desde el servidor. Olvídate de memorizar "la opción B"; los estudiantes deben aprender el concepto real.
*   **Dominio por Área:** Seguimiento estadístico persistente del rendimiento del estudiante en cada materia (Fisiología, Anatomía, Matemáticas, etc.) calculado de forma automática al finalizar cada test.
*   **Herramientas de Estudio Integradas:**
    *   ⏱️ **Presión de Tiempo:** Un cronómetro estricto de 30 segundos por pregunta para simular la presión de un examen real.
    *   👁️ **Modo Enfoque (Zen):** Oculta todos los paneles laterales y distracciones para una inmersión total.
    *   🔀 **Mezclar Todo:** Genera un cuestionario rápido con preguntas variadas.
    *   💡 **Pistas y Justificaciones:** Explicaciones detalladas post-respuesta para reforzar el aprendizaje.

### 2. Panel de Control Administrativo (Admin)
Un panel completo que te da control absoluto sobre la plataforma:
*   **Gestión de Accesos (Careers):** Asigna y revoca a qué carreras específicas (ej. Medicina, Ingeniería) puede acceder cada usuario de forma individual.
*   **Gestión de Usuarios:** Suspende cuentas, otorga bonos rápidos de "+30 días" de suscripción, o promueve usuarios a administradores con un solo clic.
*   **Validación de Pagos:** Revisa los comprobantes de depósito subidos por los estudiantes y aprueba o rechaza sus suscripciones.
*   **Sincronización Automática de Contenido (Seed):** Carga masiva de preguntas desde archivos JSON locales directamente a la base de datos de PostgreSQL con un solo botón.

### 3. Seguridad y Suscripciones
*   **Validación en Tiempo Real:** El acceso a los cuestionarios está protegido por verificaciones de base de datos en tiempo real, superando las limitaciones de seguridad de los JWT cacheados.
*   **Sistema Anti-Piratería:** Modal obligatorio donde el usuario firma su acuerdo de no compartir ni difundir material bajo pena de baneo permanente.
*   **Autenticación con Google:** Inicio de sesión rápido y seguro para estudiantes (OAuth), y login seguro con credenciales para administradores.

### 4. Comunidad y Feedback
*   **Sugerencia de Preguntas:** Los estudiantes pueden aportar al banco de preguntas sugiriendo nuevas interrogantes, indicando la respuesta correcta, pistas y justificaciones, quedando a la espera de la revisión de un Admin.

### 5. Interfaz de Usuario "2026 OLED"
*   Diseño Premium Dark Mode con acentos Cyan y gradientes suaves.
*   Micro-animaciones, efectos `glassmorphism`, navegación fluida (`smooth scroll`) y adaptación total a dispositivos móviles.

---

## 🛠️ Stack Tecnológico

*   **Framework:** Next.js 15 (App Router)
*   **Base de Datos:** PostgreSQL
*   **ORM:** Prisma
*   **Autenticación:** Auth.js v5 (NextAuth)
*   **Almacenamiento (Archivos):** S3 / MinIO (para comprobantes de pago)
*   **Estilos:** Vanilla CSS moderno con variables CSS (`globals.css`)
*   **Despliegue:** Preparado nativamente para Coolify y entornos Docker (Nixpacks).

---

## ⚙️ Instalación y Despliegue Local

1. **Clonar el repositorio y entrar al directorio:**
   ```bash
   git clone <tu-repositorio>
   cd StudyHub
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno (`.env`):**
   Crea un archivo `.env` en la raíz con lo siguiente:
   ```env
   # Base de Datos
   DATABASE_URL="postgresql://usuario:password@localhost:5432/studyhub"

   # Auth.js (NextAuth)
   AUTH_SECRET="un_secreto_muy_seguro_generado_con_openssl"
   AUTH_GOOGLE_ID="tu_google_oauth_client_id"
   AUTH_GOOGLE_SECRET="tu_google_oauth_client_secret"

   # Almacenamiento S3 (Para comprobantes de pago)
   S3_ENDPOINT="https://tu-endpoint-s3.com"
   S3_REGION="us-east-1"
   S3_BUCKET="studyhub-bucket"
   S3_ACCESS_KEY="tu_access_key"
   S3_SECRET_KEY="tu_secret_key"
   ```

4. **Preparar la base de datos:**
   Sincroniza el esquema de Prisma con PostgreSQL.
   ```bash
   npx prisma db push
   ```

5. **Crear el primer administrador:**
   Ejecuta el script para crear la cuenta de administrador inicial (Credenciales).
   ```bash
   npm run db:admin
   ```

6. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

## 📦 Despliegue en Producción (Coolify)

El proyecto está diseñado para funcionar fluidamente en **Coolify** sin configuración excesiva.
1. Al crear el recurso en Coolify, selecciona **Nixpacks** como builder.
2. Asegúrate de configurar todas las **variables de entorno** en la pestaña de Environment de Coolify antes del primer despliegue.
3. El comando de compilación por defecto en el `package.json` ya incluye `npx prisma db push --accept-data-loss && next build`, lo que significa que **cada vez que hagas push, la base de datos se actualizará automáticamente** junto con el código.

---

## 📂 Estructura de Contenido para Sincronización Automática
Para cargar preguntas de forma masiva, colócalas en la carpeta `/data` siguiendo esta estructura:
```text
/data
  /Ingeniería
    matematicas.json
    fisica.json
  /Medicina
    anatomia.json
```
Luego, desde el Panel de Admin, presiona el botón **Sincronizar Preguntas** y la plataforma mapeará las carpetas como "Carreras" y los archivos como "Categorías", insertando todas las preguntas automáticamente.
