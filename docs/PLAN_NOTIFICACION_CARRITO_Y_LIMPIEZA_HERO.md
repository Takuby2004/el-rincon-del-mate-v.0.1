# Plan de Implementación: Limpieza de Botones en Hero Banner y Notificación Flotante de Carrito

> **Estado**: ✅ Implementado y Verificado con éxito (Opción A + Notificación Push + Centrado de Imágenes y Suavizado de Degradado).  
> **Fecha**: 8 de Noviembre de 2026  
> **Proyecto**: El Rincón del Mate v0.1

---

## 1. Resumen Ejecutivo y Objetivos

Este documento detalla la planificación técnica para responder a los dos requerimientos solicitados por el usuario:
1. **Quitar botones en la sección principal ("La Experiencia Auténtica del Buen Mate")**:
   - Se evaluaron las dos capturas enviadas:
     - **Imagen 1**: Muestra toda la sección Hero, incluyendo los botones de acción (*"Explorar Catálogo"* y *"Ver Categorías"*) y los controles de carrusel en la esquina inferior derecha.
     - **Imagen 2**: Es un recorte ampliado exclusivo de los controles de navegación del carrusel: `[ — • • •  01 / 04 ]  ( < )  ( > )`.
   - Se define la estrategia para remover los controles seleccionados garantizando que el carrusel de mates siga transicionando de manera automática y fluida en segundo plano si el usuario lo desea.
2. **Notificación Flotante tipo Red Social (Push Notification / Mobile Banner)**:
   - Crear una notificación flotante estilo "push notification" de celular (como en iOS, Android, Instagram o TikTok) que aparezca en la parte superior central de la pantalla.
   - Mostrar el mensaje exacto: `"Producto '{nombre}' agregado con éxito"`.
   - Incorporar elementos visuales modernos: icono/badge de la aplicación (*"El Rincón del Mate • Ahora"*), miniatura visual del producto, animación de entrada deslizante suave desde arriba hacia abajo, y cierre automático con temporizador.

---

## 2. Análisis de Botones en el Hero Banner (`home.component.html`)

En la sección principal (`Hero Banner`), coexisten dos grupos de botones:

```
[ Hero Section ]
├── Título: "La Experiencia Auténtica del Buen Mate"
│
├── Grupo A (Botones CTA de Acción Directa):
│   ├── [ Explorar Catálogo -> ] (Líneas 87-91)
│   └── [ Ver Categorías ] (Líneas 93-96)
│
└── Grupo B (Controles de Navegación del Carrusel de Mates - Destacado en Imagen 2):
    ├── Indicador de puntos y contador [ — • • •  01 / 04 ] (Líneas 36-47)
    └── Botones de flecha anterior y siguiente [ ( < ) ( > ) ] (Líneas 51-62)
```

### Comportamiento tras la remoción:
- Si se remueve el **Grupo B** (Controles de carrusel): El componente `home.component.ts` ya cuenta con `startAutoSlide()` que cambia de mate automáticamente cada pocos segundos, por lo que el carrusel continuará funcionando visualmente de forma limpia y minimalista sin flechas ni números.
- Si se remueve el **Grupo A** (Botones de catálogo/categorías): El texto del título y la descripción quedarán más limpios y despejados, confiando la navegación al menú superior y a las imágenes interactivas recientemente implementadas.

---

## 3. Arquitectura de la Notificación Flotante de Carrito

### 3.1 Flujo Centralizado en `CartService`
En lugar de programar notificaciones repetidas en cada pantalla, la notificación se conectará directamente en [`frontend/src/app/core/services/cart.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/core/services/cart.service.ts) en el método `addItem(product, quantity)`.

De este modo:
- **Home**: Al hacer clic en "Agregar al carrito" en productos destacados.
- **Productos**: En el catálogo general.
- **Categorías**: Al comprar desde el listado por categoría.
- **Detalle de Producto**: Al agregar la cantidad elegida.

Cualquier adición disparará automáticamente la notificación flotante sin duplicar código ni generar inconsistencias.

```
+-----------------------------------------------------------+
| Usuario hace clic en "Agregar al Carrito"                 |
+-----------------------------+-----------------------------+
                              |
                              v
             CartService.addItem(product, quantity)
                              |
                              v
             ToastService.show({
               type: 'success',
               badge: 'El Rincón del Mate • Carrito',
               time: 'Ahora',
               title: '¡Agregado con éxito!',
               message: 'Producto "' + product.name + '" agregado con éxito',
               image: product.images[0] || product.imageUrl,
               duration: 3500
             })
                              |
                              v
+-----------------------------------------------------------+
| ToastContainerComponent (Flotante superior / Push Mobile)  |
| - Desliza suavemente desde arriba hacia abajo              |
| - Muestra ícono matero, badge "Ahora", foto y mensaje     |
| - Botón rápido "Ver Carrito" + Botón "X" de cierre        |
| - Se desvanece automáticamente a los 3.5 segundos         |
+-----------------------------------------------------------+
```

### 3.2 Diseño Visual: Estilo Notificación Push de Celular
La notificación adoptará las siguientes características:
1. **Posición**: Fija en la parte superior central de la pantalla (`top-4 left-1/2 -translate-x-1/2`), con un ancho adaptable tanto para pantallas móviles (`w-[92vw]`) como para computadoras de escritorio (`sm:w-[420px]`).
2. **Encabezado tipo Push de Red Social**:
   - Ícono matero con brillo suave.
   - Texto de la aplicación: `"El Rincón del Mate • Ahora"`.
   - Botón de cierre discreto `X`.
3. **Cuerpo del Mensaje**:
   - Miniatura redondeada del producto agregado (con imagen real o ilustración vectorial del mate).
   - Título con check verde esmeralda.
   - Mensaje destacado: `"Producto '{nombre}' agregado con éxito"`.
   - Botón de acceso directo en píldora `"Ver Carrito"`.
4. **Animación**:
   - `animate-push-slide-down`: Entrada fluida desde arriba con efecto de amortiguación (spring/bounce).
   - Salida suave al expirar el tiempo o al interactuar.

---

## 4. Archivos a Modificar (Tras Autorización)

1. [`frontend/src/app/core/services/toast.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/core/services/toast.service.ts):
   - Soporte para propiedades visuales: `image` (miniatura del producto) y `badge` (cabecera estilo push móvil).
2. [`frontend/src/app/core/services/cart.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/core/services/cart.service.ts):
   - Inyección de `ToastService`.
   - Llamada automática a la notificación push al ejecutar `addItem(product)`.
3. [`frontend/src/app/shared/components/toast-container/toast-container.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/shared/components/toast-container/toast-container.component.html):
   - Maquetación estilo "Push Notification / Mobile Card".
4. [`frontend/src/app/shared/components/toast-container/toast-container.component.css`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/shared/components/toast-container/toast-container.component.css):
   - Animación de entrada descendente suave (`pushSlideDown`).
5. [`frontend/src/app/features/home/home.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/home/home.component.html):
   - Remoción de los botones indicados por el usuario.

---

## 5. Preguntas de Precisión (Regla 5)

Para asegurar total exactitud con el diseño deseado:
1. **Botones a quitar en el Hero Banner**:
   - ¿Deseas quitar **únicamente los controles de flechas y puntitos del carrusel** (`[ — • • • 01 / 04 ] ( < ) ( > )`) que se aprecian en la segunda imagen ampliada?
   - ¿O prefieres quitar **también los botones dorados de acción** (*"Explorar Catálogo"* y *"Ver Categorías"*) que están justo debajo del texto principal?
   - ¿O ambos?
2. **Notificación Flotante**:
   - ¿Te parece bien que se muestre en la parte superior central de la pantalla (como las notificaciones de celular reales de Instagram/WhatsApp/iOS) e incluya la fotito del producto agregado y el acceso rápido a *"Ver Carrito"*?

