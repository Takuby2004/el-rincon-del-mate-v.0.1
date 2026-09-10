# Investigación de El Rincón del Mate para el desarrollo de su sistema

**Fecha de consulta:** 8 de septiembre de 2026.  
**Ámbito:** negocio asociado a `@rincon_delmate_tarija` en TikTok y `@rincon_delmate_bolivia` en Instagram.  
**Objetivo:** documentar información pública útil y convertirla en una base de análisis para desarrollar un sistema comercial.  
**Estado:** investigación de fuentes públicas; los requisitos propuestos todavía requieren validación con el negocio.

## 1. Resultado principal

La evidencia revisada permite orientar el proyecto hacia **la comercialización de mates y accesorios**, con catálogo de productos, atención comercial, pedidos y control de existencias. Las publicaciones muestran artículos físicos y consultas de compradores sobre sus características. Este es el dominio funcional que debería guiar el levantamiento inicial. [S04] [S05] [S09] [S10]

La propuesta de desarrollo es una **web comercial conectada con un panel de gestión**, capaz de presentar información completa de cada artículo y organizar su venta. Se recomienda priorizar tres resultados:

1. Que el cliente pueda conocer el producto, su precio validado, disponibilidad y condiciones de entrega.
2. Que el personal pueda registrar y seguir una solicitud hasta su entrega, incluyendo las ventas que se atiendan por otros canales.
3. Que la administración pueda controlar existencias, movimientos, pagos y datos comerciales sin mantener versiones contradictorias.

Estas son recomendaciones de análisis, no funcionalidades que se haya comprobado que el negocio ya utiliza. Tampoco se ha confirmado que actualmente carezca de un sistema interno.

## 2. Metodología, cobertura y calidad de la evidencia

### 2.1. Trabajo realizado

- Se buscaron los identificadores exactos proporcionados por el usuario y se contrastaron sus resultados públicos.
- Se leyó directamente la biografía pública de TikTok y se inspeccionó su imagen de perfil.
- Se contrastó la biografía de Instagram mediante su resultado indexado: el acceso directo al perfil solicitó iniciar sesión.
- Sí fue posible abrir individualmente diez publicaciones propias de Instagram, leer textos y comentarios visibles e inspeccionar imágenes o fotogramas disponibles.
- La muestra de publicaciones abarca del 3 de junio al 7 de septiembre de 2026. Se eligieron por accesibilidad y relevancia comercial; no constituye una muestra aleatoria ni el archivo completo de la cuenta.
- Se descartaron datos de comercios homónimos y de publicaciones recomendadas de otras cuentas.

### 2.2. Cómo interpretar las etiquetas

| Etiqueta | Significado | Uso en este documento |
|---|---|---|
| **Observado** | Información leída o vista directamente en una página pública. | Confirma lo que se publicó o mostró, sin auditar la operación real. |
| **Indexado** | Información recuperada del índice de búsqueda. | Puede estar desactualizada o carecer de contexto. |
| **Inferencia** | Interpretación razonada de la evidencia. | Orienta decisiones, pero no sustituye una entrevista. |
| **Propuesta** | Función o regla sugerida para el futuro sistema. | Requiere aprobación del responsable del negocio. |
| **Pendiente** | Dato sin evidencia suficiente o contradictorio. | Debe obtenerse antes de utilizarlo como dato operativo. |

Una afirmación comercial publicada, como la cobertura de envíos, confirma que el negocio la anuncia; no demuestra que cada destino esté disponible hoy ni permite conocer sus condiciones.

### 2.3. Límites concretos de acceso

TikTok permitió leer su cabecera y biografía, pero el listado de videos mostró un error incluso después de un intento de actualización. Por ello, **no se realizó un análisis del conjunto de videos de TikTok**. En Instagram se pudieron consultar publicaciones individuales, aunque el perfil completo no estuvo disponible sin inicio de sesión. No se accedió a mensajes privados, estadísticas internas, historias archivadas, pedidos, inventarios ni registros financieros.

Las vistas parciales de los videos no se tratan como transcripciones completas. Las descripciones automáticas de imágenes tampoco se utilizaron por sí solas para determinar materiales, modelos o características técnicas.

## 3. Identidad, presencia y contactos del negocio

### 3.1. Ficha comercial

| Dato | Hallazgo | Estado y fuente |
|---|---|---|
| Nombre comercial | El Rincón del Mate; TikTok incorpora Tarija al nombre mostrado. | Observado. [S02] |
| Instagram | `@rincon_delmate_bolivia`. | Cuenta indicada por el usuario y mencionada expresamente en TikTok. [S01] [S02] |
| TikTok | `@rincon_delmate_tarija`. | Perfil indicado por el usuario y consultado directamente. [S02] |
| Relación entre las dos cuentas | La biografía de TikTok remite al identificador de Instagram proporcionado. | Observado; vinculación sólida. [S02] |
| Ciudades anunciadas | Tarija y La Paz, Bolivia. | Biografías; publicación reciente vinculada a La Paz. [S01] [S02] [S12] |
| Cobertura anunciada | Envíos dentro de Bolivia a escala nacional. | Observado en TikTok y contenido de Instagram. [S02] [S04] |
| Dirección exacta y coordenadas | No verificadas en las fuentes consultadas. | Pendiente. |
| Horarios | No se obtuvo un horario verificable. | Pendiente. |
| Razón social, NIT y titular legal | No establecidos por esta investigación. | Pendiente. |
| Dominio web propio | No se identificó uno vinculado inequívocamente a ambas cuentas. | Pendiente; esto no demuestra que no exista. |
| Correo comercial | No verificado. | Pendiente. |

No se identificó evidencia suficiente para añadir una sucursal en Santa Cruz: su aparición como etiqueta geográfica en publicaciones no equivale a una dirección comercial.

### 3.2. Contactos publicados y discrepancia detectada

Los números siguientes se recogen porque el negocio los presenta públicamente como contactos de sucursal. No se enviaron mensajes ni se comprobó su funcionamiento.

| Sucursal | Número publicado | Dónde aparece | Tratamiento recomendado |
|---|---|---|---|
| Tarija | **69891494** | Biografía de TikTok, biografía indexada de Instagram y llamado de contacto en una publicación. [S01] [S02] [S08] | Coincidencia entre fuentes. Verificar canal habilitado antes de configurar botones de contacto. |
| La Paz | **64014507** | Biografía de TikTok observada directamente. [S02] | Conservar como contacto publicado, pendiente de ratificación. |
| La Paz | **65817300** | Biografía indexada de Instagram. [S01] | Conservar como dato en conflicto; no elegir silenciosamente entre ambos. |

La diferencia puede responder a un cambio de línea, contactos diferentes o desactualización del índice. No se pudo determinar cuál explicación es correcta. El sistema debería permitir administrar contactos por sucursal, indicar su finalidad y registrar la fecha de verificación.

No se da por confirmada la disponibilidad de WhatsApp únicamente porque se publique un número móvil.

### 3.3. Indicadores sociales disponibles

| Plataforma | Dato registrado | Calidad y alcance |
|---|---|---|
| TikTok | Aproximadamente **41,6 mil seguidores** y **1,1 millones de Me gusta** acumulados. | Cifras abreviadas observadas en el perfil al consultar. [S02] |
| Instagram | **1.610 seguidores** en el resultado indexado consultado. | Referencia del índice; no se pudo comprobar en vivo la cifra del perfil. [S01] |

Estas cifras son una fotografía temporal y tienen distinta calidad de actualización. No permiten estimar clientes activos, ingresos, conversión, tamaño del mercado ni rentabilidad. Para esos análisis hacen falta estadísticas de las cuentas y registros comerciales.

## 4. Oferta comercial y características relevantes

### 4.1. Categorías sustentadas por la muestra

La siguiente clasificación sirve para diseñar la estructura inicial del catálogo. Una publicación histórica no confirma existencias actuales ni constituye una ficha técnica.

| Familia | Evidencia disponible | Qué falta levantar para el sistema |
|---|---|---|
| **Mates** | Distintos recipientes y terminaciones presentados en publicaciones propias. [S05] [S11] | Nombre de cada modelo, material confirmado, capacidad, medidas, precio y código de producto. |
| **Mates tipo galleta** | Publicación identificada con esa denominación; el video anuncia disponibilidad en ambas ciudades. [S09] | Variantes comercializadas, acabado, dimensiones y existencia actual por ubicación. |
| **Mates con acabados cincelados** | Fotografía que destaca virolas decoradas y distintas terminaciones de color. [S05] | Diferenciar acabado, material y modelo; determinar qué combinaciones tienen precio o stock propios. |
| **Bombillones y bombillas** | Publicación dedicada a bombillones y fotografías de accesorios utilizados con los mates. [S03] [S07] | Denominación comercial, largo, material certificado por proveedor, filtro y compatibilidad. |
| **Yerbas** | En el mobiliario mostrado se distinguen envases Baldo y Canarias. [S07] | Confirmar venta, variedades, presentaciones, peso, lotes y vigencia del surtido. |
| **Mesitas materas** | Producto anunciado y mostrado en un video comercial; existe otra demostración de uso. [S04] [S06] | Medidas abierta y cerrada, peso, material, capacidad de carga, embalaje y costo logístico. |

Ver una marca en un envase no permite afirmar que el negocio sea distribuidor oficial. Tampoco permite determinar autenticidad, procedencia, exclusividad o stock actual.

### 4.2. Artículos y servicios que requieren confirmación adicional

| Posibilidad | Evidencia o indicio | Clasificación |
|---|---|---|
| Termos | Aparecen acompañando al mate en demostraciones. [S06] [S08] | Confirmar si se comercializan, qué modelos y bajo qué garantía. |
| Presentaciones para regalo o conjuntos | Se observa una caja decorada en una publicación; otra recibe una consulta por varias piezas. [S10] [S08] | Indicio de interés en conjuntos; composición, precio y reglas de venta pendientes. |
| Personalización | La decoración y los acabados ofrecen una oportunidad de producto. | No se verificó suficientemente un servicio propio de grabado a pedido. |
| Mochilas, estuches y sets de siete piezas | Aparecen en una página de Facebook de nombre parecido. [X01] | Excluidos del catálogo confirmado: vinculación con este negocio no comprobada. |

No se deben cargar productos de otras tiendas para completar artificialmente el catálogo. Los materiales específicos, como alpaca, bronce, calabaza o algarrobo, deben registrarse por artículo con información validada; no basta con deducirlos de la apariencia.

### 4.3. Estructura propuesta para una ficha de producto

| Grupo de datos | Campos propuestos |
|---|---|
| Identificación | Código interno, nombre, categoría, marca cuando corresponda, modelo y descripción. |
| Variantes | Color, material, acabado, tamaño o presentación; cada combinación vendible con un identificador propio. |
| Precio | Moneda, precio vigente, fecha de actualización y condiciones de una promoción, si existe. |
| Existencia | Sucursal, cantidad física, cantidad reservada y disponibilidad calculada. |
| Contenido visual | Fotografía principal, detalles, interior, escala de tamaño y video explicativo opcional. |
| Características | Medidas con unidades, capacidad o peso según el tipo de artículo. |
| Venta conjunta | Componentes incluidos y accesorios vendidos por separado, claramente diferenciados. |
| Entrega | Peso y dimensiones del paquete, fragilidad, retiro o envío habilitado y costo por confirmar. |
| Cuidado | Instrucciones aprobadas para el material y condiciones de garantía aplicables. |
| Control editorial | Estado borrador/publicado, responsable, fecha de revisión y fuente de los datos. |

El sistema debe distinguir **precio pendiente de confirmar**, **sin stock** y **producto retirado**. Un dato faltante nunca debería mostrarse como precio cero ni como disponibilidad garantizada.

## 5. Muestra de publicaciones y necesidades observables

### 5.1. Registro de diez publicaciones propias

Las fechas son las mostradas por Instagram. La interfaz y los metadatos presentaron una diferencia de un día para el tutorial de julio, que se conserva explícita.

| Fuente | Fecha publicada | Contenido observado | Utilidad para el análisis |
|---|---|---|---|
| [S03] | 03/06/2026 | Presentación de un bombillón; comentario preguntando por precio. | Incluir precio o mecanismo claro de cotización. |
| [S04] | 23/06/2026 | Mesita matera; consultas por medidas, precio, interior y dirección. | Completar especificaciones, galería y ubicación. |
| [S05] | 09/07/2026 | Fotografía de mates con diferentes acabados cincelados. | Administrar variantes y fotografías detalladas. |
| [S06] | 09–10/07/2026 | Demostración de mesita en uso; consulta sobre disponibilidad. | Vincular tutoriales con el producto y su estado comercial. |
| [S07] | 17/07/2026 | Bombillones; estantería con productos y marcas visibles. La transcripción indexada menciona reposición hacia La Paz. | Evaluar inventario por ubicación y transferencias; validar el procedimiento interno. |
| [S08] | 17/07/2026 | Presentación de mate, llamado de contacto y consulta por varias piezas. | Aclarar qué se incluye y cómo solicitar un conjunto. |
| [S09] | 28/07/2026 | Mates galleta, anuncio de novedades y consulta por precio. | Gestionar novedades y mantener su disponibilidad actualizada. |
| [S10] | 28/07/2026 | Presentación comercial con caja decorada; consulta por ubicación en La Paz. | Información de sucursal accesible desde el producto. |
| [S11] | 02/08/2026 | Presentación visual de un mate con virola decorada. | Fotografías que permitan distinguir terminaciones. |
| [S12] | 07/09/2026 | Fotografía de uso del producto que alude a la sucursal de La Paz. | Señal reciente de actividad y material de comunicación de marca. |

### 5.2. Qué expresan los comentarios revisados

Las preguntas visibles se agrupan en cinco necesidades: **precio, características, contenido de la compra, disponibilidad y ubicación**. Se trata de indicios concretos para diseñar la experiencia de compra, no de una encuesta representativa. [S03] [S04] [S06] [S08] [S10]

No se reproduce la identidad de quienes comentan porque no es necesaria para definir el sistema. La ausencia de una respuesta en la vista consultada tampoco demuestra que el negocio no haya respondido por otro medio.

### 5.3. Diagnóstico de comunicación digital

**Observado:** la muestra combina exhibición del producto, detalles de acabado, novedades, demostraciones y fotografías de uso. Hay comunicación con referencias a ciudades bolivianas y llamados de contacto. [S05] [S06] [S08] [S09] [S12]

**Inferencia:** el contenido visual puede atraer interés, pero la información necesaria para decidir una compra queda repartida entre publicaciones y conversaciones. Una página estable por producto permitiría completar ese recorrido y seguir siendo útil después de una campaña.

**Propuesta:** cada publicación comercial futura podría remitir a la ficha correspondiente, con una referencia de campaña. El sitio debería poder mostrar fotos propias y enlaces sociales sin depender de que se cargue un muro de Instagram o TikTok para consultar productos.

## 6. Identidad visual y orientación de la experiencia

### 6.1. Rasgos observados

El avatar de TikTok muestra un emblema circular con un mate y bombilla al centro, el nombre distribuido alrededor y una combinación de fondo oscuro, tonos claros y detalles dorados o beige. No se tuvo acceso al archivo vectorial ni a un manual de marca. [S02]

La fotografía de acabados utiliza primeros planos y un entorno cálido para destacar la superficie del producto. La publicación de septiembre incorpora uso al aire libre. Estas observaciones sirven como referencias visuales, sin atribuirles una estrategia formal documentada. [S05] [S12]

### 6.2. Propuesta de dirección visual

| Elemento | Propuesta para el sistema |
|---|---|
| Paleta | Fondo claro cálido, texto oscuro y acentos discretos inspirados en el emblema. Extraer y validar los colores definitivos del archivo oficial. |
| Fotografía | Producto completo, detalle del acabado e imagen de uso; fondo consistente para comparar variantes. |
| Tipografía | Priorizar lectura de nombres, precios y medidas en móvil; no se identificó una fuente corporativa oficial. |
| Tono | Español cercano y claro, conservando vocabulario comercial como mate, bombillón y mesita matera. |
| Navegación | Acceso directo a productos, sucursales, condiciones de entrega y contacto. |
| Acciones | Mensajes específicos: consultar disponibilidad, solicitar pedido, ver medidas o elegir sucursal. |
| Confianza | Explicar contenido de la compra, precio validado, condiciones de pago, entrega y cambios. |

No se fijan códigos de color como si fueran oficiales ni se asume autorización para reutilizar imágenes de clientes. Antes de publicar el sitio deben solicitarse los archivos y permisos correspondientes.

## 7. Modelo comercial: evidencia e hipótesis

### 7.1. Lo que puede reconstruirse

La información pública permite observar promoción de artículos, contactos de sucursal y anuncios de envío. No permite reconstruir el proceso administrativo completo: se desconoce cómo registran solicitudes, descuentan existencias, concilian pagos o gestionan reclamos.

La reposición entre ubicaciones aparece en texto indexado asociado a una publicación propia, pero no se inspeccionaron remitos ni registros internos. Debe tratarse como **indicio operativo**, no como prueba de un procedimiento formal. [S07]

### 7.2. Segmentos de clientes a validar

| Hipótesis de segmento | Necesidad probable | Respuesta propuesta |
|---|---|---|
| Persona que compra su primer mate | Entender diferencias y qué accesorios necesita. | Guía breve, comparaciones y contenido incluido. |
| Consumidor habitual | Encontrar un modelo, acabado o yerba específicos. | Filtros y disponibilidad por variante. |
| Comprador de regalo | Elegir una presentación y asegurar una fecha de entrega. | Opciones de presentación y plazos explícitos. |
| Cliente local | Conocer dirección, horarios y posibilidad de retiro. | Ficha de sucursal y orientación de contacto. |
| Cliente de otro departamento | Conocer costo de envío y seguimiento. | Cotización logística y estado del pedido. |

Estos segmentos son hipótesis de diseño. No se investigaron edades, ingresos, género ni distribución real de compradores.

### 7.3. Evaluación comercial preliminar

| Dimensión | Interpretación para el proyecto |
|---|---|
| Fortalezas observables | Identidad visual reconocible, productos mostrados en uso y variedad de presentaciones en la muestra. |
| Oportunidad | Convertir interés social en consultas y pedidos estructurados, con información reutilizable. |
| Fricción detectada | Varias decisiones de compra requieren datos que los usuarios preguntan en comentarios. |
| Riesgo de información | Una publicación antigua puede seguir circulando aunque cambien contacto, precio o stock. |
| Riesgo operativo a validar | Posible duplicación de reservas o registros cuando intervienen distintos canales o ubicaciones. |
| Dato comercial faltante | No hay evidencia suficiente para estimar volumen de ventas, margen, rotación o retorno de inversión. |

Esta evaluación no es una auditoría de desempeño ni un estudio estadístico del mercado. No se atribuyen pérdidas, retrasos o fallas internas sin registros que los demuestren.

## 8. Alcance recomendado del sistema

Todo lo que sigue es **propuesta de desarrollo**. Las fuentes justifican necesidades; no prueban que el negocio haya aprobado estos requisitos.

### 8.1. Primera versión funcional

Se propone una aplicación web adaptable a móvil, con una parte pública y otra administrativa. La primera versión debe conectar el catálogo con la gestión real de solicitudes y existencias.

| Área | Alcance inicial propuesto | Resultado esperado |
|---|---|---|
| Catálogo | Productos, variantes, imágenes, precios y disponibilidad. | Reducir información ambigua antes de comprar. |
| Sucursales | Contactos verificados, ubicación, horarios y modalidades de atención. | Orientar al cliente hacia el punto adecuado. |
| Solicitudes y pedidos | Registro web y registro asistido de pedidos procedentes de otros canales. | Contar con una referencia única por operación. |
| Inventario | Existencias y movimientos por ubicación, reservas y ajustes justificados. | Evitar prometer unidades no disponibles. |
| Entregas | Retiro o envío, según modalidades autorizadas por el negocio. | Registrar destino, costo aprobado y estado. |
| Pagos | Método, importe, referencia, estado y responsable de verificación. | Distinguir solicitud, cobro y entrega. |
| Administración | Usuarios, permisos, contenido comercial y reportes básicos. | Mantener información y seguimiento operativo. |

Una tienda con cobro totalmente automático exige decisiones adicionales sobre medios de pago y logística. Mientras se resuelven, el sistema puede ofrecer una **solicitud de pedido con confirmación comercial**, que no prometa precio final ni fecha hasta validar lo necesario.

### 8.2. Funciones posteriores o condicionales

- Transferencias formales entre ubicaciones, si la entrevista confirma esa operación.
- Venta de conjuntos con descuento automático de sus componentes, si se confirman combos.
- Seguimiento de personalizaciones, únicamente si el servicio existe y se conoce su proceso.
- Control por lote y vencimiento para las yerbas que efectivamente se comercialicen.
- Compras a proveedores, costos y análisis de margen cuando haya datos confiables.
- Integraciones de mensajería, transporte, pagos y facturación una vez definidos sus proveedores y permisos.
- Programa de fidelidad o promociones después de establecer una base de ventas medible.

### 8.3. Funciones sin sustento para incluir por defecto

No hay evidencia para añadir cocina, comandas, reservas gastronómicas, atención de mesas o turnos de meseros. En el contexto revisado, **galleta es una denominación de mate** y **mesita matera es un producto físico**. No se deben transformar esos términos en módulos de alimentos o de reservas de mesas.

Tampoco se justifica iniciar con aplicaciones móviles nativas, inteligencia artificial para validar pagos o una arquitectura de microservicios sin conocer volumen y necesidades operativas.

## 9. Requisitos funcionales propuestos y trazabilidad

**Prioridades:** P0 = necesario para la primera versión propuesta; P1 = siguiente etapa; C = condicionado a validación. Cada criterio es una forma de comprobar el comportamiento esperado, no una prueba ya ejecutada.

| ID | Requisito | Prioridad | Base | Criterio de aceptación propuesto |
|---|---|---|---|---|
| RF-01 | Administrar productos y categorías. | P0 | Oferta observada. | Un producto incompleto puede guardarse como borrador sin publicarse. |
| RF-02 | Administrar variantes vendibles. | P0 | Diferencias visuales de acabados. | Cambiar de variante muestra sus propios datos y existencia. |
| RF-03 | Publicar fichas completas y galería. | P0 | Consultas de características. | Cada ficha indica medidas pertinentes y qué incluye la compra. |
| RF-04 | Buscar y filtrar productos. | P0 | Propuesta de usabilidad. | Buscar por nombre o categoría devuelve variantes disponibles o su estado. |
| RF-05 | Gestionar sucursales y contactos. | P0 | Biografías y consultas locales. | Una modificación autorizada actualiza todos los puntos de contacto del sitio. |
| RF-06 | Registrar solicitudes de pedido. | P0 | Propuesta de conversión comercial. | La solicitud conserva artículos, cantidades, contacto y código único. |
| RF-07 | Registrar pedidos asistidos. | P0 | Hipótesis de atención por distintos canales. | El operador registra el origen sin exigir que el cliente repita el pedido web. |
| RF-08 | Confirmar precio y entrega. | P0 | Datos comerciales pendientes. | Un pedido no pasa a confirmado si carece de total y condiciones acordadas. |
| RF-09 | Reservar y liberar existencias. | P0 | Propuesta de integridad. | Dos pedidos no pueden reservar simultáneamente la última unidad. |
| RF-10 | Mantener movimientos de inventario. | P0 | Propuesta de control. | Toda entrada, salida o ajuste registra motivo, cantidad y responsable. |
| RF-11 | Gestionar el estado del pedido. | P0 | Propuesta operativa. | Cada cambio queda fechado y no se permiten transiciones inválidas. |
| RF-12 | Registrar y verificar pagos. | P0 | Necesidad del proceso de venta. | Se distinguen importes pendientes, confirmados y reembolsados. |
| RF-13 | Gestionar retiro o envío. | P0 | Cobertura anunciada. | La modalidad determina los datos obligatorios y el costo aprobado. |
| RF-14 | Consultar seguimiento del pedido. | P0 | Propuesta de atención. | Solo el cliente autorizado o personal habilitado accede a su información. |
| RF-15 | Administrar usuarios y permisos. | P0 | Propuesta de seguridad. | Cada operación verifica permisos también en el servidor. |
| RF-16 | Mantener historial de cambios. | P0 | Propuesta de trazabilidad. | Cambios de precio, stock, pago y contacto identifican al responsable. |
| RF-17 | Emitir reportes operativos básicos. | P0 | Propuesta de gestión. | Totales se pueden contrastar con los pedidos que los originaron. |
| RF-18 | Mostrar tutoriales asociados. | P1 | Demostraciones observadas. | Un producto admite contenido aprobado sin depender de reproducción externa. |
| RF-19 | Transferir stock entre ubicaciones. | C | Indicio de reposición. | La recepción debe confirmarse antes de aumentar la existencia del destino. |
| RF-20 | Vender combos con componentes. | C | Indicios de presentaciones conjuntas. | La disponibilidad y descuento de stock consideran cada componente. |
| RF-21 | Gestionar pedidos personalizados. | C | Oportunidad por validar. | Guardar especificación, aprobación del cliente, costo y plazo acordados. |
| RF-22 | Adjuntar comprobantes y configurar QR. | C | Alternativa de pago propuesta. | Adjuntar imagen deja el pago pendiente de revisión, sin marcarlo como cobrado. |
| RF-23 | Gestionar lotes de yerba. | C | Surtido por confirmar. | Un lote vencido o bloqueado no se asigna a una venta. |
| RF-24 | Registrar devoluciones. | P1 | Propuesta de posventa. | Se registra motivo, evaluación, reembolso y destino del artículo por separado. |
| RF-25 | Atribuir origen comercial. | P1 | Interés procedente de redes. | Diferenciar visita, consulta, pedido confirmado y venta para cada origen. |

Para validar la trazabilidad de los requisitos comerciales, usar la matriz de publicaciones de la sección 5. Los requisitos de control e integridad son aportes de diseño y no descripciones del sistema actual.

## 10. Procesos y reglas de negocio propuestos

### 10.1. Recorrido de compra

1. **Consultar:** el cliente elige un producto y variante, revisa características y solicita información o inicia un pedido.
2. **Definir entrega:** indica ciudad y modalidad habilitada. Si falta una tarifa, el pedido queda pendiente de cotización.
3. **Confirmar condiciones:** se valida disponibilidad, precio, costo de entrega y vigencia de la oferta. La reserva de stock tiene un plazo configurado.
4. **Registrar pago:** se aplica el método autorizado y se verifica el importe. El pedido y el pago conservan estados separados.
5. **Preparar y entregar:** el personal verifica artículos y registra retiro o despacho. Un envío despachado todavía no equivale a entrega al cliente.
6. **Cerrar o resolver incidencia:** se confirma entrega o se registra cancelación, devolución o reembolso con su motivo.

La duración de las reservas, el cobro de anticipo y las condiciones de cancelación deben ser decisiones explícitas del negocio.

### 10.2. Estados separados

| Registro | Estados iniciales sugeridos | Regla principal |
|---|---|---|
| Solicitud comercial | Nueva, en revisión, cotizada, aceptada, descartada. | Una solicitud no cuenta automáticamente como venta. |
| Pedido | Confirmado, en preparación, listo, despachado, entregado, cancelado. | Registrar quién realiza cada transición y qué condiciones exige. |
| Pago | Pendiente, en revisión, confirmado, rechazado, parcialmente reembolsado, reembolsado. | La confirmación exige evidencia y responsable autorizado. |
| Transferencia interna | Borrador, despachada, en tránsito, recibida, con diferencia. | Evitar contabilizar las mismas unidades simultáneamente en origen y destino. |

El tratamiento de pago parcial y retiro presencial debe ajustarse a la operación confirmada. La lógica de estados no debe ocultar excepciones reales ni permitir resolverlas borrando historial.

### 10.3. Inventario

- Llevar existencias por **variante y ubicación**, no solamente por nombre de producto.
- Definir disponibilidad como existencia vendible menos unidades reservadas. Artículos dañados o bloqueados deben quedar fuera de la existencia vendible.
- Guardar movimientos con fecha, motivo, responsable y referencia al pedido, compra, devolución o transferencia.
- Confirmar reservas y descuentos de forma atómica, de modo que operaciones concurrentes no produzcan cantidades negativas.
- Liberar una reserva una sola vez cuando expire o se cancele.
- Si una operación se reintenta por un problema de conexión, no debe crear otra venta ni descontar stock nuevamente.
- Conservar cantidades en tránsito separadas. La recepción confirma unidades efectivamente recibidas y registra diferencias.
- Si se venden combos armados a partir de artículos sueltos, reservar sus componentes. Si llegan prearmados del proveedor, definirlos como unidades independientes o registrar el ensamblaje: no utilizar ambos métodos simultáneamente para las mismas existencias.

### 10.4. Precios, cobros y comprobantes

No se obtuvo una lista de precios actual verificable de la cuenta objetivo. Tampoco se confirmó el método de pago vigente. Por tanto, no se incorpora ningún precio de otro negocio ni se presenta el cobro por QR como una operación existente.

**Si se aprueba QR con revisión manual**, el sistema podría permitir que un administrador autorizado publique el QR comercial vigente y que el cliente adjunte una imagen asociada al pedido. El personal deberá verificar la recepción del dinero antes de cambiar el estado a confirmado. Subir una imagen no demuestra por sí solo la acreditación bancaria.

Reglas propuestas: total calculado en servidor, precio histórico conservado en cada línea del pedido, costo de envío explícito y registro de importes cobrados y reembolsados. Los comprobantes deben tener acceso restringido y política de conservación definida.

### 10.5. Envíos y posventa

La cobertura publicitada no permite establecer tarifa, transportista, tiempos, retiro en agencia o entrega a domicilio. Esos campos deben permanecer pendientes hasta que el negocio los proporcione. No se debe anunciar envío gratuito ni entrega inmediata sin respaldo.

La política de cambios debe definir cómo tratar diferencias de color, defectos, daños de transporte, productos usados y trabajos personalizados. Las obligaciones tributarias y de consumo deben validarse con los responsables correspondientes; este documento no determina el régimen legal del negocio.

## 11. Usuarios y permisos propuestos

Esta es una separación de responsabilidades del software, no un organigrama confirmado. Una misma persona podría cumplir varias funciones.

| Perfil | Facultades sugeridas | Restricciones principales |
|---|---|---|
| Visitante | Ver productos y sucursales, iniciar una consulta. | Sin acceso a clientes, comprobantes ni inventario administrativo. |
| Cliente | Consultar sus solicitudes y pedidos. | No acceder a operaciones de otras personas. |
| Atención comercial | Registrar solicitudes, cotizar y actualizar pedidos autorizados. | No alterar permisos ni aprobar ajustes fuera de su alcance. |
| Inventario y despacho | Preparar pedidos, registrar movimientos y entregas. | No modificar cobros o datos bancarios sin permiso específico. |
| Administración | Gestionar contenido, precios, contactos, usuarios y reportes. | Acciones relevantes con historial y controles de acceso. |

La autorización debe comprobarse para cada recurso y operación en el servidor, incluyendo el alcance de sucursal cuando corresponda. Ocultar botones no sustituye esas comprobaciones. Esta propuesta sigue las recomendaciones de control de acceso de OWASP. [T02]

## 12. Modelo de información y arquitectura de referencia

### 12.1. Entidades iniciales

| Entidad | Contenido esencial y relación |
|---|---|
| Sucursal | Nombre, dirección validada, horarios, contacto y modalidades de atención. |
| Contacto comercial | Número o canal, sucursal, finalidad, estado y fecha de verificación. |
| Producto y categoría | Información comercial común del artículo y su clasificación. |
| Variante | Unidad vendible con atributos y código único, vinculada a producto. |
| Recurso visual | Imagen o video vinculado al producto, autoría o permiso y orden de presentación. |
| Existencia | Variante, ubicación y cantidades vendibles, reservadas o bloqueadas. |
| Movimiento | Entrada o salida con causa, fecha y documento de referencia. |
| Reserva | Variante, cantidad, pedido relacionado y vencimiento. |
| Cliente y dirección | Datos mínimos necesarios para atención y entrega. |
| Solicitud y pedido | Origen, responsable, cliente, estado y condiciones acordadas. |
| Detalle de pedido | Variante, descripción histórica, cantidad, precio y descuentos acordados. |
| Pago y comprobante | Método, importe, estado, evidencia y validación autorizada. |
| Entrega | Modalidad, destino, costo, transportista o retiro y seguimiento. |
| Usuario, permiso y auditoría | Identidad del operador, acciones permitidas e historial relevante. |

Transferencias, componentes de combo, lotes y personalizaciones se añadirían cuando se confirme su alcance. Los registros de una venta deben conservarse aunque después se desactive el producto; retirar del catálogo no equivale a borrar el historial.

### 12.2. Arquitectura sugerida

Se propone separar la interfaz pública, el panel administrativo, la lógica de negocio, una base de datos transaccional y el almacenamiento de imágenes o comprobantes. El backend debe ser responsable de validar precios, permisos, disponibilidad y cambios de estado.

La tecnología concreta queda pendiente de las preferencias del proyecto, presupuesto, alojamiento y experiencia del equipo. Las redes investigadas no permiten identificar ni imponer un framework existente. Tampoco se han estimado usuarios simultáneos o carga operativa.

El futuro sistema debe poder funcionar con su propia información comercial aunque una red social no cargue. Las integraciones externas deben ser mejoras posteriores evaluadas según sus requisitos reales de acceso y mantenimiento.

## 13. Requisitos no funcionales y validación

| ID | Objetivo propuesto | Comprobación sugerida |
|---|---|---|
| RNF-01 | Uso cómodo en móvil. | Consultar variantes y completar una solicitud sin desplazamiento horizontal ni campos ocultos. |
| RNF-02 | Accesibilidad. | Navegación por teclado, foco visible, etiquetas de formularios y alternativas textuales útiles. |
| RNF-03 | Consistencia transaccional. | Dos intentos sobre la última unidad no producen sobreventa; un reintento no duplica operaciones. |
| RNF-04 | Control de acceso. | Un cliente no abre pedidos ajenos y un operador no cambia recursos fuera de sus permisos. |
| RNF-05 | Recuperación operativa. | Restaurar una copia de respaldo en un entorno separado y reconciliar los registros. |
| RNF-06 | Rendimiento. | Medir carga de fichas y formularios en dispositivos y conexiones representativos antes de fijar metas. |
| RNF-07 | Mantenimiento. | Editar precios, contenido y contactos desde administración sin cambiar el código del sitio. |
| RNF-08 | Manejo de errores. | Informar fallos sin perder el pedido y conservar referencias para investigar incidencias. |
| RNF-09 | Privacidad. | Recoger solo datos necesarios y definir acceso, conservación y eliminación según su finalidad. |

Para archivos subidos se propone limitar formatos y tamaño, validar el contenido además de la extensión, generar nombres internos seguros y restringir el acceso. Estas medidas se basan en la guía de cargas de archivos de OWASP; la protección debe combinar varias comprobaciones. [T01]

Antes del lanzamiento deben probarse especialmente: cambio de precio durante una solicitud, pedido repetido, última unidad concurrente, vencimiento de reserva, pago rechazado, diferencia de transferencia y devolución sin reingreso automático de un artículo dañado. Son casos de validación futura, no pruebas realizadas en esta investigación.

## 14. Indicadores para evaluar el sistema

No se fijan metas numéricas sin una línea de base. Primero se debe acordar qué evento representa una venta y cómo se contabilizan cancelaciones y devoluciones.

| Indicador | Definición propuesta |
|---|---|
| Conversión de consultas | Pedidos confirmados originados en consultas dividido entre consultas registradas del período. |
| Conversión del sitio | Pedidos confirmados atribuibles al sitio dividido entre sesiones medidas con un criterio consistente. |
| Tiempo de primera respuesta | Tiempo entre consulta registrada y primera respuesta del negocio. |
| Ticket promedio | Importe de ventas netas dividido entre pedidos considerados vendidos. Definir si incluye envío. |
| Cancelación por falta de stock | Pedidos cancelados por ese motivo dividido entre pedidos registrados. |
| Exactitud de inventario | Concordancia entre conteo físico y existencia registrada, evaluada por variante y ubicación. |
| Tiempo de entrega | Tiempo entre confirmación y entrega, separado de preparación y transporte. |
| Recompra | Clientes con otra compra dentro de una ventana acordada. |
| Origen de pedidos | Pedidos por canal declarado o referencia de campaña, distinguiendo atribución medida de estimada. |

No se deben presentar clics de contacto como ventas ni deducir ingresos a partir de seguidores.

## 15. Información que debe proporcionar el negocio

### 15.1. Antes de publicar datos comerciales

1. ¿Cuál es el contacto vigente de La Paz y qué función cumple cada número encontrado?
2. ¿Cuáles son las direcciones, referencias, horarios y ubicaciones de mapa autorizadas?
3. ¿Qué canales reciben pedidos efectivamente y cuáles se usan solo para promoción?
4. ¿Qué artículos, variantes y categorías se venden hoy? Solicitar listado y fotografías propias.
5. ¿Cuáles son los precios vigentes, moneda, descuentos y diferencias entre sucursales?
6. ¿Qué se incluye en cada compra y qué accesorios se cobran aparte?
7. ¿Qué medios de pago aceptan y quién puede confirmar un cobro?
8. ¿Qué destinos atienden, con qué transportistas, tarifas y plazos?
9. ¿Existe retiro presencial y qué condiciones tiene?
10. ¿Qué políticas de cambios, garantía y devoluciones deben comunicarse?

### 15.2. Antes de cerrar el alcance administrativo

11. ¿Usan actualmente cuadernos, hojas de cálculo, punto de venta u otro sistema?
12. ¿Cuántas personas trabajarán en el sistema y qué puede hacer cada una?
13. ¿Las ubicaciones comparten stock, precios y propiedad de los pedidos?
14. ¿Se transfieren productos entre ellas? ¿Quién despacha y quién confirma recepción?
15. ¿Cuándo se reserva mercadería y cuánto dura la reserva?
16. ¿Hay ventas con anticipo, pago parcial o contra entrega?
17. ¿Se comercializan combos? ¿Se arman con artículos sueltos o llegan prearmados?
18. ¿Existe personalización? ¿Qué materiales, límites, aprobación, costo y plazo requiere?
19. ¿Se venden yerbas regularmente y se controlan lotes o vencimientos?
20. ¿Cómo se registran costos, proveedores, compras, pérdidas y ajustes?
21. ¿Qué reportes necesitan y qué definición de venta utilizan?
22. ¿Qué requisitos de facturación debe cumplir el proyecto y quién los validará?

### 15.3. Para planificar implementación y medir resultados

23. ¿Cuál es el volumen de pedidos, artículos y movimientos en un período representativo?
24. ¿Qué proporción de pedidos proviene de cada canal y cuántos requieren envío?
25. ¿Quién mantendrá precios, imágenes, horarios y promociones?
26. ¿Existen logo vectorial, paleta, fotografías autorizadas y dominio propio?
27. ¿Qué presupuesto, fecha objetivo, dispositivos y conectividad tendrá el equipo?
28. ¿Quién administrará respaldo, soporte, alojamiento y recuperación de incidentes?

Documentos útiles: lista de productos, conteo inicial por ubicación, lista de precios fechada, pedidos reales anonimizados, ejemplo de envío, política de pagos y responsables. No hacen falta conversaciones privadas completas ni información personal ajena al proceso.

## 16. Plan de desarrollo recomendado

| Etapa | Trabajo | Condición para avanzar |
|---|---|---|
| A. Validación | Resolver contactos, catálogo vigente, pagos, envíos y responsabilidades. | Datos comerciales y reglas iniciales confirmados. |
| B. Diseño | Flujos de cliente y personal, fichas, variantes y modelo de información. | Revisar casos reales y acordar criterios de aceptación. |
| C. Primera versión | Implementar catálogo, sucursales, pedidos, inventario, cobros registrados y permisos. | Completar una venta de prueba y una cancelación sin inconsistencias. |
| D. Piloto | Usar una muestra real de productos y operaciones con el personal. | Reconciliar existencias y corregir fricciones encontradas. |
| E. Ampliación | Agregar funciones condicionales e integraciones priorizadas. | Justificación por necesidad comprobada y datos disponibles. |

No se establece presupuesto ni calendario como si estuvieran cotizados: faltan volumen, integraciones, infraestructura y equipo. Conviene estimarlos después de la etapa A.

### Reglas para reutilizar esta investigación al desarrollar

- Mantener los hechos, inferencias y propuestas diferenciados.
- Tratar como pendientes los datos no verificados; no completar direcciones, precios, políticas o materiales con valores inventados.
- Mantener las demostraciones técnicas y datos ficticios fuera del catálogo público real.
- Permitir desactivar productos y contactos sin destruir historial.
- Validar procesos con el personal antes de convertir hipótesis en reglas obligatorias.
- No importar requisitos de otro proyecto o de un negocio homónimo.

## 17. Fuentes y registro de consulta

**Fecha de acceso de todas las fuentes:** 08/09/2026. Los enlaces conservan referencias a publicaciones individuales para facilitar la comprobación posterior. El acceso público y el contenido pueden cambiar.

### 17.1. Fuentes primarias del negocio

| ID | Fuente | Forma de acceso y limitación |
|---|---|---|
| S01 | [Instagram: perfil de El Rincón del Mate][S01] | Biografía y cifra de seguidores obtenidas del índice de búsqueda. El perfil completo pidió inicio de sesión. |
| S02 | [TikTok: perfil de El Rincón del Mate Tarija][S02] | Biografía, métricas abreviadas y avatar observados directamente. Videos no disponibles en el listado. |
| S03 | [Instagram: bombillón, 3 de junio][S03] | Texto y comentario comercial leídos en la publicación. |
| S04 | [Instagram: mesitas materas, 23 de junio][S04] | Texto, comentarios y fotograma consultados directamente. |
| S05 | [Instagram: cincelados, 9 de julio][S05] | Texto y fotografía consultados directamente. |
| S06 | [Instagram: demostración de mesita matera, julio][S06] | Texto, comentario y fotograma. Metadatos del 9; interfaz del 10 de julio. |
| S07 | [Instagram: bombillones, 17 de julio][S07] | Texto y fotogramas directos; mención de reposición obtenida de transcripción indexada, con menor certeza. |
| S08 | [Instagram: presentación de mate y contacto, 17 de julio][S08] | Texto, comentario, fotograma y texto de contacto asociado a la imagen. |
| S09 | [Instagram: mates galleta, 28 de julio][S09] | Texto, comentarios y anuncio de disponibilidad visible en el video. |
| S10 | [Instagram: mates, 28 de julio][S10] | Texto, comentario de ubicación y fotograma de la presentación. |
| S11 | [Instagram: presentación de mate, 2 de agosto][S11] | Texto y fotograma observados directamente. |
| S12 | [Instagram: publicación desde La Paz, 7 de septiembre][S12] | Texto y fotografía observados directamente. |

### 17.2. Referencias técnicas utilizadas

| ID | Fuente | Uso |
|---|---|---|
| T01 | [OWASP: File Upload Cheat Sheet][T01] | Criterios de protección para imágenes y comprobantes subidos al sistema. |
| T02 | [OWASP: Authorization Cheat Sheet][T02] | Criterios de autorización y acceso a datos y operaciones. |

Estas referencias apoyan recomendaciones técnicas; no son fuentes sobre la operación actual del comercio.

### 17.3. Resultados excluidos o no atribuidos

| ID | Resultado | Motivo de exclusión |
|---|---|---|
| X01 | [Facebook: El Rincon del Mate Bolivia][X01] | Coincide en nombre y contexto regional, pero no se verificó relación con las dos cuentas del usuario. Sus referencias a Caraparí, Yacuiba, sets y precios no se trasladan al negocio investigado. |
| X02 | [Tienda elrincondelmate.shop][X02] | Identidad y contacto distintos, con número argentino; no se acreditó relación. |
| X03 | [El Rincón del Mate en Wix][X03] | Catálogo homónimo sin vinculación confirmada. Sus productos y precios no se usan como datos propios. |

Otros resultados de Instagram mezclaban fragmentos del negocio con publicaciones recomendadas de cuentas como Raíz de mi Tierra, Todo Mate Bolivia, Tereré Shop y Casa Termo. No se atribuyeron al comercio direcciones, precios, promociones ni servicios de esas publicaciones. Encontrar contenido relacionado no demuestra una alianza ni una relación societaria.

[S01]: https://www.instagram.com/rincon_delmate_bolivia/
[S02]: https://www.tiktok.com/@rincon_delmate_tarija?is_from_webapp=1&sender_device=pc
[S03]: https://www.instagram.com/rincon_delmate_bolivia/p/DZIfZj3q6XN/
[S04]: https://www.instagram.com/rincon_delmate_bolivia/reel/DZ7loh4xgwJ/
[S05]: https://www.instagram.com/rincon_delmate_bolivia/p/DamcjoXtAYn/
[S06]: https://www.instagram.com/rincon_delmate_bolivia/reel/DamaaCCNHD3/
[S07]: https://www.instagram.com/reel/Da54R-diaiv/
[S08]: https://www.instagram.com/rincon_delmate_bolivia/reel/Da54NZPCgsZ/
[S09]: https://www.instagram.com/rincon_delmate_bolivia/reel/DbV1Fv9RiCk/
[S10]: https://www.instagram.com/rincon_delmate_bolivia/reel/DbXRS-dNftO/
[S11]: https://www.instagram.com/rincon_delmate_bolivia/reel/DbkBXoONBiL/
[S12]: https://www.instagram.com/rincon_delmate_bolivia/p/Dc_gPXJKNW0/
[T01]: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
[T02]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
[X01]: https://www.facebook.com/ElRincondelMateBolivia/
[X02]: https://elrincondelmate.shop/
[X03]: https://elrincondelmate9.wixsite.com/el-rinc-n-del-mate
