# 🔍 Diagnóstico Técnico: Error TS-992010 ('imports' is only valid on a component that is standalone)
**Proyecto:** El Rincón del Mate  
**Fecha:** Septiembre 2026  
**Documento:** `/docs/EXPLICACION_ERROR_STANDALONE_ESBUILD.md`

---

## 🛑 1. El Error Observado

En la terminal de `esbuild` / `ng serve`, aparece repetidamente el siguiente mensaje en varios componentes:
```text
X [ERROR] TS-992010: 'imports' is only valid on a component that is standalone.
Did you forget to add 'standalone: true' to this @Component?
```

---

## 🧐 2. ¿Por qué ocurre esto? (Causa Raíz)

Ocurre por una **desincronización entre el servidor de desarrollo que quedó en memoria y los archivos actualizados en el disco**:

1. **El servidor `ng serve` lleva más de 2 horas encendido:** Cuando se inició ese comando, cargó en la memoria RAM el compilador de **Angular 17**.
2. **El cambio introducido por Angular 19:** En Angular 19, el equipo de Google decidió que todos los componentes sean *Standalone por defecto*, por lo que el asistente de migración eliminó la línea `standalone: true` de los componentes para limpiar el código.
3. **El conflicto:** Como el servidor `ng serve` que está corriendo en la terminal sigue siendo el antiguo (Angular 17), este viejo compilador no sabe que en Angular 19 `standalone` es automático. Al ver `imports: [...]` sin la propiedad `standalone: true`, lanza el error de advertencia.

---

## 💡 3. ¿Cómo se soluciona?

Hay dos soluciones sencillas:

1. **Solución Principal (Reiniciar el Servidor de Desarrollo):**
   * Detener el proceso actual de `ng serve` en la terminal (presionando `Ctrl + C`).
   * Volver a ejecutar `ng serve` o `npm start`.
   * Al iniciar de nuevo, cargará el nuevo compilador de **Angular 19** que reconoce los componentes standalone por defecto y compilará sin ningún error.

2. **Solución Complementaria (Compatibilidad Explícita):**
   * Colocar explícitamente `standalone: true` en los decoradores `@Component`.

---

## 📖 4. Glosario Técnico (Para Desarrolladores Junior)

* **Memoria RAM vs. Disco Duro:** Cuando inicias un servidor con `ng serve`, este se carga en la memoria viva (RAM). Si actualizas librerías en el disco duro mientras el servidor está encendido, el servidor sigue usando las reglas viejas que tenía guardadas en la RAM hasta que lo apagas y lo vuelves a prender.
* **`standalone: true` (Componente Independiente):** Es una propiedad que le decía a Angular 17 que ese componente podía funcionar solo sin depender de un archivo `NgModule`. En Angular 19 ya es automático, pero Angular 17 lo exigía de forma obligatoria.
* **Watch Mode (Modo Vigilante de ng serve):** Es la función que detecta cuando guardas un archivo y recompila automáticamente. Sin embargo, no puede actualizar las librerías base del propio framework en caliente sin reiniciarse.
