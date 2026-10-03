# 📋 Plan de Implementación: Función de Eliminación de Clientes en Panel Administrativo
**Proyecto:** El Rincón del Mate  
**Módulo:** Gestión de Clientes (`/admin/clientes`)  
**Documento:** `/docs/PLAN_ELIMINACION_CLIENTES_ADMIN.md`

---

## 🎯 1. Objetivos

1. **Botón de Eliminación en Interfaz:**
   * Ubicar el botón de acción "Eliminar" (icono de papelera) en la columna "Acciones", justo al lado del botón de WhatsApp.
   * Modal o diálogo de confirmación interactivo para prevenir eliminaciones accidentales.

2. **Manejo Seguro en Backend:**
   * Validar integridad referencial en `ClientService.deleteClient`:
     * Si el cliente tiene pedidos registrados en el historial de ventas, impedir la eliminación y mostrar un mensaje claro explicativo para proteger la contabilidad.
     * Si no tiene pedidos asociados, eliminar el registro de la base de datos de forma limpia.

3. **Feedback Visual:**
   * Notificación de éxito o alerta de restricción visible en el panel.
   * Recarga automática de la lista de clientes.

---

## 📖 2. Glosario Técnico (Para Desarrolladores Junior)

* **Integridad Referencial (*Foreign Key Constraint*):** Es una regla de las bases de datos relacionales (como PostgreSQL) que impide borrar un registro si otros registros importantes (como pedidos o facturas) dependen de él. Esto evita que queden "pedidos huérfanos" sin comprador asignado.
* **Confirmación de Acción Crítica (*Confirmation Modal*):** Es una ventana emergente que pregunta: *"¿Estás seguro de que deseas eliminar este cliente?"* antes de proceder, evitando clics involuntarios.
