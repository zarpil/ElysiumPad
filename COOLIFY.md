# 🚀 Guía de Despliegue en Coolify — ElysiumPad

Esta guía explica paso a paso cómo desplegar **ElysiumPad** en tu servidor con **Coolify** de forma automatizada y segura.

---

## ⚡ Método 1: Despliegue con Docker Compose (Recomendado)

Este método levanta automáticamente tanto la aplicación web (`Next.js Standalone`) como la base de datos (**PostgreSQL 16**) dentro de una red privada segura con persistencia de datos.

### Paso 1: Conectar el Repositorio en Coolify
1. En tu panel de Coolify, entra a tu **Proyecto** y **Entorno** (Environment).
2. Haz clic en **+ New Resource** > **Git Repository** (GitHub App o Git Público).
3. Selecciona tu repositorio: `zarpil/ElysiumPad` y la rama `master`.
4. Coolify detectará automáticamente el archivo `docker-compose.yml`.

### Paso 2: Configurar las Variables de Entorno en Coolify
En la pestaña **Environment Variables** de Coolify, introduce tus valores seguros:

| Variable | Valor de Ejemplo / Recomendado | Descripción |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Modo producción optimizado |
| `NEXT_PUBLIC_APP_URL` | `https://launcher.tudominio.com` | Tu dominio con HTTPS |
| `POSTGRES_USER` | `postgres` | Usuario de la base de datos |
| `POSTGRES_PASSWORD` | `una_clave_aleatoria_segura_aqui` | Contraseña de PostgreSQL |
| `POSTGRES_DB` | `elysiumpad` | Nombre de la base de datos |
| `JWT_SECRET` | *(genera 32 bytes con: `openssl rand -hex 32`)* | Clave para firmar sesiones y tokens |
| `INITIAL_ADMIN_EMAIL` | `admin@tudominio.com` | Correo del administrador inicial |
| `INITIAL_ADMIN_PASSWORD` | `TuContrasenaAdminSegura123!` | Contraseña inicial del SuperAdmin |

*(Opcionales para Cloudflare R2 / S3):*
* `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN`. *(Si se dejan vacíos, los archivos se guardan localmente en el volumen persistente de Coolify).*

### Paso 3: Asignar tu Dominio (FQDN)
1. En el servicio `elysiumpad-web`, en el campo **Domains / FQDN**, ingresa:
   ```
   https://launcher.tudominio.com
   ```
2. Coolify y Traefik generarán el certificado **SSL (HTTPS)** con Let's Encrypt automáticamente.

### Paso 4: Desplegar (Deploy)
1. Pulsa el botón **Deploy**.
2. Coolify compilará la imagen en modo **Standalone** (<200 MB).
3. El script de arranque (`docker-entrypoint.sh`) esperará a que PostgreSQL esté listo, sincronizará las tablas con `prisma db push` y creará la cuenta de Administrador automáticamente.
4. ¡Listo! Accede a `https://launcher.tudominio.com/login` e inicia sesión con tu usuario administrador.

---

## 🐘 Método 2: Despliegue con Base de Datos PostgreSQL Existente de Coolify

Si prefieres usar un recurso de PostgreSQL ya gestionado en Coolify:

1. En Coolify, crea la base de datos: **+ New Resource** > **Database** > **PostgreSQL**.
2. Copia la URL de conexión interna que te da Coolify (ejemplo: `postgresql://postgres:pass@postgresql:5432/elysiumpad?schema=public`).
3. Crea un nuevo recurso **Application** apuntando a tu repositorio `zarpil/ElysiumPad` con **Build Pack: Dockerfile**.
4. En **Environment Variables**, define:
   * `DATABASE_URL`: *(pega la URL de PostgreSQL copiada)*
   * `NEXT_PUBLIC_APP_URL`: `https://launcher.tudominio.com`
   * `JWT_SECRET`: *(clave segura de 32 caracteres)*
   * `INITIAL_ADMIN_EMAIL`: `admin@tudominio.com`
   * `INITIAL_ADMIN_PASSWORD`: `TuPasswordSeguro123!`
5. Despliega la aplicación.

---

## 🛠️ Comandos de Mantenimiento Útiles en Coolify

* **Ver Logs en Vivo**: Pestaña **Logs** en Coolify para monitorizar peticiones y descargas de launchers.
* **Terminal / Ejecutar Comandos**: Pestaña **Terminal** dentro de `elysiumpad-web`:
  ```bash
  # Ver estado de la base de datos
  npx prisma status
  
  # Forzar re-ejecución del seed si es necesario
  node prisma/seed.mjs
  ```
