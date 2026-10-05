# Corrección de Error Angular: Parser Error (Pipe en Expresión de Acción)

## 1. Diagnóstico del Error
```text
NG5002: Parser Error: Cannot have a pipe in an action expression at column 30 in [downloadProof(zoomImageUrl | assetUrl)]
```

### ¿Por qué ocurre este error?
En Angular, los **Pipes** (como `| assetUrl`, `| date`, `| uppercase`) son funciones de transformación puramente visuales diseñadas para usarse en interpolaciones (`{{ variable | pipe }}`) o en enlaces de propiedades (`[prop]="variable | pipe"`).

La sintaxis del compilador de plantillas de Angular **prohíbe el uso de pipes dentro de expresiones de eventos o acciones** `(click)="..."`, porque el operador tubería (`|`) en una acción es interpretado como un operador binario no admitido en el parser de eventos.

---

## 2. Solución Propuesta

1. **En la Plantilla HTML ([admin-orders.component.html](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.html#L611)):**
   Cambiar:
   ```html
   <button (click)="downloadProof(zoomImageUrl | assetUrl)">
   ```
   Por:
   ```html
   <button (click)="downloadProof()">
   ```

2. **En el Controlador TypeScript ([admin-orders.component.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/admin-orders/admin-orders.component.ts#L135)):**
   Hacer que el método `downloadProof()` resuelva internamente la URL completa del asset utilizando la variable `this.zoomImageUrl` y la configuración de entorno (`environment.apiUrl`), abstrayendo esa lógica fuera de la plantilla HTML.

---

## 3. Glosario para Desarrolladores Juniors

- **Parser (Analizador Sintáctico):** Módulo del compilador que lee el código de las plantillas HTML de Angular carácter por carácter para verificar que cumpla las reglas gramaticales del framework.
- **Action Expression (Expresión de Acción / Event Binding):** Código que se ejecuta cuando ocurre un evento del usuario (por ejemplo, `(click)="ejecutarFuncion()"`).
- **Pipe (Tubería de Transformación):** Herramienta de Angular que toma un dato de entrada y lo transforma visualmente para la vista sin modificar el valor original en memoria.
