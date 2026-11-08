# Estimación de Recursos de Servidor (Hardware: CPU, RAM y ROM)

**Proyecto:** El Rincón del Mate (v0.1)  
**Propósito:** Especificar los requisitos mínimos y recomendados de hardware para desplegar el Frontend y el Backend por separado y en conjunto.

---

## 1. El Frontend (Angular 19 SPA)

### Características Técnicas
* El frontend es una **Single Page Application (SPA)** con renderizado en el cliente (**CSR**).
* No requiere un servidor Node.js activo en producción. Una vez compilado con `ng build`, produce archivos estáticos puros (HTML, JS, CSS y SVG).
* Quien realmente consume la CPU y la RAM para dibujar la página es el **navegador del cliente** (su teléfono o computadora), no el servidor.

### Requerimientos para Servir el Frontend (ej. con Nginx o Caddy)
| Recurso | Mínimo Absoluto | Recomendado | Explicación |
| :--- | :--- | :--- | :--- |
| **CPU** | 0.25 vCPU (compartido) | 0.5 - 1 vCPU | Nginx solo despacha archivos estáticos; casi no usa procesador. |
| **RAM** | 64 MB - 128 MB | 256 MB - 512 MB | El consumo en memoria de un servidor de estáticos es insignificante. |
| **ROM (Disco)** | 500 MB | 2 GB - 5 GB | La carpeta compilada `dist/` pesa menos de 30 MB. El resto es para el sistema operativo. |

> [!TIP]
> **Mejor Práctica de la Industria:** No gastes en un servidor para el Frontend. Alójalo en servicios CDN gratuitos o de costo ultra bajo como **Vercel**, **Netlify**, **Cloudflare Pages** o **Firebase Hosting**. Obtendrás velocidad mundial, SSL automático y 0 consumo de CPU/RAM de tu bolsillo.

---

## 2. El Backend (Node.js + Express + Prisma + PDFKit)

### Características Técnicas
* Es un proceso persistente en ejecución (Node.js daemon / PM2).
* Realiza tareas computacionales: encriptación JWT, consultas SQL vía Prisma Client, generación dinámica de PDFs (PDFKit), subida de comprobantes multipart (Multer) y envío de correos SMTP (Nodemailer).

### Requerimientos de Producción para el Backend
| Recurso | Mínimo Absoluto | Recomendado | Explicación |
| :--- | :--- | :--- | :--- |
| **CPU** | 0.5 vCPU (1 vCPU compartida) | 1 - 2 vCPUs dedicadas/compartidas | Para responder peticiones concurrentes y generar PDFs rápidamente. |
| **RAM** | 512 MB (con 1 GB Swap) | 1 GB - 2 GB de RAM libre | Node.js + motor de Prisma consumen ~150-250 MB en reposo; los picos de PDFs requieren holgura. |
| **ROM (Disco)** | 5 GB SSD | 10 GB - 20 GB SSD | Node.js runtime, `node_modules`, código compilado y logs del sistema. |

> [!NOTE]
> Como la base de datos PostgreSQL y las imágenes están en **Supabase**, tu servidor backend se ahorra entre 1 GB y 2 GB de RAM adicionales que requeriría alojar una base de datos localmente.

---

## 3. Escenario: Despliegue Conjunto en un solo Servidor VPS (Fullstack)

Si decides contratar una máquina virtual (VPS en Hetzner, DigitalOcean, Linode o AWS Lightsail) para alojar ambos proyectos juntos con Nginx como proxy inverso:

### A. Perfil Mínimo Viable (Para pruebas o tienda con tráfico inicial bajo)
* **CPU:** 1 vCPU.
* **RAM:** 1 GB de RAM (con 1 GB de memoria Swap configurada en Linux).
* **Almacenamiento (ROM):** 20 GB SSD.
* **Costo estimado de mercado:** ~$4 a $6 USD / mes.

### B. Perfil Recomendado (Para producción comercial fluida)
* **CPU:** 2 vCPUs.
* **RAM:** 2 GB de RAM.
* **Almacenamiento (ROM):** 40 GB a 50 GB SSD.
* **Costo estimado de mercado:** ~$10 a $12 USD / mes.
* **Capacidad:** Puede soportar miles de visitas al día y decenas de pedidos concurrentes sin despeinarse.

---

## 4. Diferencia Crítica: Tiempo de Compilación (Build) vs. Tiempo de Ejecución (Runtime)

* **En ejecución (Runtime):** El backend necesita ~200-300 MB de RAM y el frontend casi 0 MB.
* **En compilación (`ng build` o `npm run build`):** Compilar Angular y Prisma requiere temporalmente entre **1.5 GB y 2 GB de RAM**.
* **Solución para servidores pequeños:** Compilar siempre en tu máquina local o mediante GitHub Actions (CI/CD) y solo transferir los archivos finales al servidor.

