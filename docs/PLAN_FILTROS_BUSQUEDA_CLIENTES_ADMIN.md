# 📋 Plan de Implementación: Barra de Búsqueda y Filtros en la Sección de Clientes
**Proyecto:** El Rincón del Mate (Panel Administrativo)  
**Módulo:** Gestión de Clientes (`/admin/clientes`)  
**Documento:** `/docs/PLAN_FILTROS_BUSQUEDA_CLIENTES_ADMIN.md`

---

## 🎯 1. Objetivos de la Funcionalidad

Mejorar la experiencia de administración de clientes dotando a la interfaz de:
1. **Barra de Búsqueda Inteligente:** Búsqueda reactiva por nombre, email, teléfono, CI/NIT o dirección.
2. **Filtro por Departamento de Bolivia:** Selector con los 9 departamentos oficiales y opción de "Todos".
3. **Filtro por Ciudad:** Entrada de texto para filtrar municipios específicos (e.g. Cercado, El Alto, Montero).
4. **Criterios de Ordenamiento Dinámico:**
   * Alfabético: A ➔ Z
   * Alfabético: Z ➔ A
   * Más pedidos realizados (Mayor a menor)
   * Menos pedidos realizados (Menor a mayor)
   * Registro más reciente (Por defecto)
5. **Tarjetas de Estadísticas Rápidas:**
   * Total de clientes en base de datos.
   * Clientes filtrados visibles.
   * Promedio/Total de compras generadas.
6. **Diseño Visual Premium:** Tabla limpia, badges de estado, estados vacíos (*empty states*) y botón de reseteo rápido de filtros.

---

## 🏗️ 2. Arquitectura de Componente

* **Archivo TS:** `frontend/src/app/features/admin-clients/admin-clients.component.ts`
  * Modelado reactivo con `searchTerm`, `selectedDepartment`, `cityFilter`, `sortBy`.
  * Función `filteredClients()` calculada mediante `computed()` / `getter` para filtrado instantáneo sin peticiones redundantes.
* **Archivo HTML:** `frontend/src/app/features/admin-clients/admin-clients.component.html`
  * Cabecera de búsqueda con icono FontAwesome.
  * Barra de herramientas de filtros con Tailwind CSS.
  * Tabla con formato de moneda, enlaces directos a WhatsApp y conteo de órdenes.

---

## 📖 3. Glosario Técnico (Para Desarrolladores Junior)

* **Filtrado en el Cliente (*Client-side Filtering*):** Es cuando el navegador descarga la lista de clientes una sola vez y realiza las búsquedas y ordenamientos en la memoria de la computadora del usuario de forma instantánea, sin saturar la base de datos con peticiones constantes.
* **`getter` / Propiedad Computada:** Es una función especial que se recalcula automáticamente cada vez que el usuario escribe una letra en el buscador o cambia una opción del filtro.
* **Empty State (Estado Vacío):** Es una pantalla o ilustración amigable que le explica al usuario que no se encontraron resultados con los filtros actuales y le ofrece un botón para "Limpiar Filtros".
