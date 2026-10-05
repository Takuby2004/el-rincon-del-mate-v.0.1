# Plan de Implementación: Barra de Búsqueda en la Sección "Categorías" del Panel Administrativo

## 1. Objetivo
Implementar una barra de búsqueda interactiva en la vista de **Gestión de Categorías** del Panel Administrativo (`admin-categories`), manteniendo la misma coherencia visual y estilo de diseño que la sección de "Clientes", pero **omitiendo los filtros secundarios** (sin desplegables de departamento, ciudad ni ordenamiento).

---

## 2. Componentes y Archivos a Modificar
- **HTML**: [`admin-categories.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-categories/admin-categories.component.html)
- **TypeScript**: [`admin-categories.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-categories/admin-categories.component.ts)
- **Documentación General**: [`README.md`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/README.md)

---

## 3. Detalle de los Cambios Propuestos

### A. Lógica en TypeScript (`admin-categories.component.ts`)
1. **Variable de estado reactiva**:
   ```typescript
   searchTerm = '';
   ```
2. **Getter computado `filteredCategories`**:
   - Filtra el listado de categorías evaluando si el término ingresado coincide (sin distinguir mayúsculas/minúsculas) con:
     - Nombre de la categoría (`name`)
     - Identificador de ruta legible (`slug`)
     - Descripción (`description`)
3. **Adaptación de la Paginación**:
   - `paginatedCategories` consumirá `this.filteredCategories` en lugar de `this.categories`.
   - Si la página actual excede el número máximo de páginas tras filtrar, se autoajusta a la última página válida.
4. **Función auxiliar para limpiar búsqueda**:
   ```typescript
   clearSearch() {
     this.searchTerm = '';
     this.currentPage = 1;
   }
   ```

### B. Interfaz Visual en HTML (`admin-categories.component.html`)
1. **Contenedor de Búsqueda**:
   - Tarjeta estilizada (`bg-white rounded-3xl border border-wood-200 shadow-sm p-4`) idéntica a la estética de clientes.
   - Input con icono de lupa FontAwesome (`fa-solid fa-magnifying-glass`).
   - Botón de limpieza rápida (`fa-solid fa-xmark` o `fa-solid fa-filter-circle-xmark`) visible cuando haya texto escrito.
2. **Estado Vacío (Empty State)**:
   - Mensaje amigable cuando la búsqueda no devuelva resultados coincidentes, con botón para restablecer la búsqueda.
3. **Conexión con el Paginador**:
   - El componente `<app-pagination>` recibirá `totalItems="filteredCategories.length"`.

---

## 4. Glosario Técnico para Desarrolladores Junior
- **Data Binding Bidireccional (`[(ngModel)]`)**: Mecanismo que sincroniza automáticamente lo que el usuario escribe en un campo de texto con una variable en el archivo de TypeScript y viceversa.
- **Getter Reactivo / Computado (`get filteredCategories()`)**: Propiedad especial en TypeScript/JavaScript que recalcula y entrega una lista filtrada automáticamente cada vez que se accede a ella o cambian sus variables dependientes.
- **Empty State (Estado Vacío)**: Vista o diseño pensado para informar al usuario que no hay datos que mostrar (por ejemplo, si buscó algo que no existe), evitando que la pantalla se vea rota o en blanco.
- **Paginación Dinámica**: Técnica para dividir un conjunto grande de elementos en páginas de tamaño fijo (por ejemplo, 5 categorías por página) para mantener la vista limpia y rápida.
