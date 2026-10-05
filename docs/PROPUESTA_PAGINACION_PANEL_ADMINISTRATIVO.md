# Propuesta de Arquitectura: Paginador Reutilizable (5 elementos) para el Panel Administrativo

## 1. Evaluación y Diagnóstico

Implementar un paginador de **5 elementos por página** con **visibilidad condicional (`total > 5`)** es una **excelente decisión de diseño y experiencia de usuario (UX)** por las siguientes razones:

1. **Reducción del Scroll y Fatiga Visual**: Las tablas con muchas filas obligan al administrador a hacer scroll vertical continuo. Limitar a 5 filas por vista mantiene la tabla compacta y dentro del campo visual.
2. **Limpieza Visual (Cero Ruido)**: Si una sección solo tiene 2 o 3 registros (por ejemplo, pocas categorías o QR bancarios), mostrar un paginador desactivado (`[<] [1] [>]`) es innecesario. Al ocultarlo cuando `total <= 5`, la interfaz se ve limpia y adaptativa.
3. **Coherencia y Reutilización**: Creando un único componente standalone de paginación (`app-pagination`) en la carpeta `shared/`, todas las secciones administrativas compartirán el mismo diseño, animaciones y comportamiento.

---

## 2. Secciones del Panel Administrativo a Beneficiar

| Sección | Componente | Tipo de Datos | Beneficio |
| :--- | :--- | :--- | :--- |
| **Productos** | `admin-products` | Catálogo de mates, bombillas y termos | Navegación rápida combinada con filtros y búsqueda. |
| **Categorías** | `admin-categories` | Listado de categorías | Vista ordenada y compacta. |
| **Pedidos** | `admin-orders` | Pedidos y comprobantes bancarios | Verificación rápida sin perder de vista la cabecera. |
| **Clientes** | `admin-clients` | Lista de clientes registrados | Consulta rápida de datos y compras asociadas. |
| **Historial QR** | `payment-qr-config` | Historial de códigos QR bancarios | Navegación limpia de QRs activos y antiguos. |

---
## Nota: "Historial QR" todavía no cuenta con un paginador.


## 3. Arquitectura Técnica Propuesta

### A. Componente Compartido: `PaginationComponent` (`shared/components/pagination/`)
- **Inputs**:
  - `totalItems: number`: Cantidad total de elementos (tras aplicar filtros y búsquedas).
  - `pageSize: number = 5`: Cantidad de elementos por página.
  - `currentPage: number = 1`: Página actualmente seleccionada.
- **Outputs**:
  - `pageChange: EventEmitter<number>`: Emite la nueva página al hacer clic.
- **Lógica de Visibilidad**:
  - Si `totalItems <= pageSize` (≤ 5), el componente no renderiza nada (`@if (totalPages > 1)`).

### B. Cálculo en los Componentes
En cada tabla, los elementos visibles se calculan mediante un *slice* sobre la lista filtrada:
```typescript
get paginatedItems(): T[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.filteredItems.slice(startIndex, startIndex + this.pageSize);
}
```

---

## 4. Glosario para Desarrolladores Juniors

- **Paginación del Lado del Cliente (Client-Side Pagination):** Técnica donde todos los datos se descargan una sola vez y el navegador web se encarga de recortar y mostrar solo un grupo pequeño (5 filas) de forma instantánea.
- **Slice (Rebanada de Arreglo):** Método en JavaScript/TypeScript que extrae una porción de una lista sin modificar la lista original (ejemplo: del elemento 0 al 5).
- **Componente Reutilizable (Shared Component):** Pieza de código independiente creada una sola vez para ser usada en múltiples pantallas del sistema.
