# Plan de Implementación: Modal Avanzado de Revisión de Comprobantes de Pago (Sección Pedidos)

## 1. Contexto y Diagnóstico
En la sección de **Gestión de Pedidos** (`admin-orders`), al hacer clic en la miniatura o botón de comprobante de pago, actualmente se muestra una imagen estática simple en pantalla completa sin controles ni información contextual del comprador ni del pedido.

### Necesidad:
Crear un **Modal Visor de Comprobantes Interactivo y Profesional** que proporcione:
1. **Controles de Imagen**: Zoom (acercar/alejar/restablecer), rotación (en caso de fotos tomadas en vertical u horizontal), descarga y apertura en pestaña independiente.
2. **Contexto del Pedido**: Cabecera con número de pedido, nombre y teléfono del cliente, monto total facturado en Bolivianos (Bs.) y estado actual del pago.
3. **Acciones Rápidas**: Posibilidad de aprobar o rechazar el pago directamente mientras se inspecciona el comprobante.
4. **Experiencia de Usuario (UX)**: Fondo con desenfoque (*backdrop-blur*), animaciones suaves, atajos de teclado (tecla ESC para cerrar) y soporte táctil/responsivo.

---

## 2. Archivos a Modificar

| Componente | Archivo | Modificación |
| :--- | :--- | :--- |
| **Plantilla Frontend** | [admin-orders.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.html) | Sustituir el visor simple por el nuevo componente modal de inspección enriquecida con barra de herramientas interactiva y cabecera contextual. |
| **Controlador Frontend** | [admin-orders.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.ts) | Agregar estado de control de zoom (`zoomLevel`), rotación (`rotation`), métodos de transformación de imagen y vinculación del pedido actual al abrir el comprobante. |
| **Estilos Frontend** | [admin-orders.component.css](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.css) | Añadir reglas de transición suave para la escala y rotación de la imagen. |
| **Documentación** | [README.md](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md) | Registrar la mejora del visor interactivo de comprobantes en el caso de uso **CU10**. |

---

## 3. Glosario para Desarrolladores Juniors

- **Modal / Diálogo Overlay**: Ventana emergente que aparece por encima de la interfaz principal bloqueando la interacción con el fondo para enfocar la atención del usuario en una tarea específica.
- **CSS Transform (Scale y Rotate)**: Propiedad de hojas de estilo que permite cambiar la escala (aumentar o reducir tamaño) y girar un elemento gráfico (por ejemplo, 90 grados) en tiempo real mediante aceleración por tarjeta gráfica (GPU).
- **Backdrop Blur**: Efecto visual moderno de *glassmorphism* que desenfoca el contenido de fondo detrás del modal, mejorando la legibilidad del elemento en primer plano.
- **Data Binding Bidireccional**: Conexión entre la variable del componente TypeScript y la vista HTML para que cualquier cambio en una se refleje instantáneamente en la otra.
