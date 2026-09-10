# Plan de Desarrollo: Enlaces Interactivos de Sucursales y Contacto (Topbar & Footer)

**Fecha**: 09 de Septiembre de 2026  
**Proyecto**: El Rincón del Mate v0.1  
**Módulo**: Frontend (`public-layout.component.ts`)

---

## 1. Diagnóstico del Problema
En el componente `PublicLayoutComponent`, los números de teléfono de las sucursales de Tarija (`69891494`) y La Paz (`64014507`) tanto en la barra superior (*Topbar*) como en las tarjetas del pie de página (*Footer*) estaban renderizados como elementos de texto estático (`<span>` y `<div>`). 
Al hacer clic sobre ellos, no desencadenaban ninguna acción ni abrían la aplicación de WhatsApp o llamada telefónica.

---

## 2. Glosario Técnico (Para Desarrolladores Junior)

| Término | Definición Simplificada |
| :--- | :--- |
| **Enlace Profundo (Deep Link / `wa.me`)** | Una URL especial de WhatsApp que al hacer clic en móvil o PC abre automáticamente el chat con un número y un mensaje precargado. |
| **Protocolo `tel:`** | Un estándar de enlace HTML que le indica al navegador o celular que abra la app de llamadas telefónicas. |
| **Atributo `target="_blank"`** | Instrucción HTML para que el enlace se abra en una nueva pestaña sin sacar al usuario de la tienda. |
| **Atributo `rel="noopener noreferrer"`** | Medida de seguridad que evita que la nueva pestaña tenga acceso al objeto `window.opener` de nuestra página. |
| **Micro-interacción Hover** | Efecto visual (cambio de color, ligero brillo o escala) que le indica claramente al usuario que un elemento es interactivo y clicable. |

---

## 3. Plan de Implementación

### Modificaciones en `PublicLayoutComponent`:
1. **Topbar (Barra Superior)**:
   - Convertir los textos de Tarija y La Paz en enlaces interactivos a WhatsApp (`https://wa.me/59169891494` y `https://wa.me/59164014507`) con mensaje precargado de saludo.
2. **Footer (Tarjetas de Sucursal)**:
   - Convertir la sección de WhatsApp de Tarija en un botón/enlace directo hacia su chat con mensaje de consulta.
   - Convertir la sección de WhatsApp de La Paz en un botón/enlace directo hacia su chat con mensaje de consulta.
   - Convertir las menciones de TikTok e Instagram dentro de cada tarjeta en enlaces clicables con `target="_blank"`.
   - Añadir transiciones de color y micro-animaciones al pasar el cursor (*hover*) para mejorar la experiencia de usuario.
