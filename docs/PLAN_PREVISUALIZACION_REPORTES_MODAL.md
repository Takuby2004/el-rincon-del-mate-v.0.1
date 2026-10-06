# 👁️ Plan de Implementación: Modal de Previsualización Interactiva de Reportes

Este documento describe la arquitectura, diseño de interfaz y flujo técnico para incorporar un **Modal Visor de Previsualización** en la sección de Reportes de **El Rincón del Mate**.

---

## 1. 🎯 Justificación y Experiencia de Usuario (UX)

Actualmente, cuando el administrador pulsa "Descargar", el navegador descarga directamente el archivo a su disco duro sin permitirle ver si los datos del período seleccionado son los esperados.

### Beneficios de la Previsualización:
1. **Inspección Inmediata:** El administrador puede consultar cifras rápidas sin llenar su carpeta de "Descargas" de archivos PDF temporales.
2. **Validación Visual:** Permite verificar que las columnas horizontales, márgenes y saltos de página del PDF estén impecables antes de archivarlo o imprimirlo.
3. **Flujo Natural de Acción:** El modal incluye un botón prominente de "Descargar PDF" y "Abrir en Pestaña Completa", unificando previsualización y exportación.

---

## 2. 🏗️ Arquitectura Técnica

```
[ Usuario pulsa "Previsualizar" en la tarjeta ]
                    │
                    ▼
[ ApiService.downloadXReportPdf(selectedDays) ]
                    │
                    ▼
[ Blob Binario recibido en ReportsComponent ]
                    │
                    ▼
[ window.URL.createObjectURL(blob) ]
                    │
                    ▼
[ DomSanitizer.bypassSecurityTrustResourceUrl(blobUrl) ]
                    │
                    ▼
[ Modal con <iframe [src]="safePdfUrl"> a pantalla completa (85vh) ]
   ├── Cabecera con título, período y botón "Descargar PDF"
   ├── Visor PDF nativo interactivo (zoom, scroll, paginado)
   └── Botón de cierre y atajo de teclado (tecla ESC)
```

---

## 3. 🎨 Diseño de la Interfaz

### 3.1. Acciones en cada Tarjeta de Reporte
Cada una de las 4 tarjetas contará con dos botones elegantes:
* **Botón Secundario (Previsualizar):** Estilo claro con borde, icono `fa-eye` y texto *"Previsualizar"*.
* **Botón Primario (Descargar):** Estilo temático con icono `fa-download` y texto *"Descargar PDF"*.

### 3.2. Modal Visor de Alta Fidelidad
* Capa de fondo con desenfoque (`bg-darkness-950/80 backdrop-blur-sm z-[100]`).
* Ventana flotante amplia (`max-w-6xl w-full h-[88vh]`):
  * **Barra Superior:** Título del reporte, badge del período (ej. "Últimos 30 días"), botón "Abrir en Pestaña", botón "Descargar PDF" y botón de cierre (`fa-xmark`).
  * **Cuerpo del Visor:** Marco responsivo con el renderizado nativo del documento horizontal.

---

## 4. 🛠️ Archivos a Modificar

1. **`frontend/src/app/features/reports/reports.component.ts`**:
   - Inyección de `DomSanitizer` de Angular.
   - Variables de estado: `previewModalOpen`, `previewPdfUrl`, `rawPreviewBlob`, `previewTitle`, `loadingPreview`.
   - Métodos: `openPreview(type)`, `closePreview()`, `downloadFromPreview()`, `openInNewTab()`.
   - Limpieza de memoria: `URL.revokeObjectURL` al cerrar el modal para evitar fugas de memoria (*memory leaks*).

2. **`frontend/src/app/features/reports/reports.component.html`**:
   - Botón dual en cada tarjeta: "Previsualizar" + "Descargar".
   - Estructura del modal visor interactivo de PDF con diseño artesanal.

---

## 5. 📖 Glosario de Términos (Para Juniors)

1. **DomSanitizer & bypassSecurityTrustResourceUrl:** Mecanismo de seguridad de Angular que previene ataques de inyección de código (XSS). Cuando creamos una URL dinámica de un archivo en memoria (`blob:http...`), Angular por defecto la bloquea por precaución a menos que le digamos explícitamente: *"confío en este recurso, es un PDF seguro que generó mi propio backend"*.
2. **Object URL (`URL.createObjectURL`):** Una dirección web temporal creada en la memoria del navegador (algo como `blob:http://localhost:4200/a38f...`) que apunta directamente a los bytes del PDF en la memoria RAM, permitiendo mostrarlo en una etiqueta `<iframe>` sin guardarlo en disco.
3. **Fuga de Memoria (*Memory Leak*) & `URL.revokeObjectURL`:** Si creamos muchas URLs temporales en memoria y nunca las destruimos, la memoria RAM del navegador se va llenando poco a poco. `URL.revokeObjectURL` le avisa al navegador que ya terminamos de usar el documento para que libere esa memoria de inmediato.
4. **Iframe (`Inline Frame`):** Una ventana embebida dentro de una página web que puede cargar otro documento de forma independiente (en este caso, el motor visor de PDFs del navegador).
