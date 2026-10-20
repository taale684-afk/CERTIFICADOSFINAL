# PoliSeguimiento — Incremento 1

Consulta del estado y la ubicación de una solicitud de certificado especial del Politécnico Grancolombiano, mediante su número de radicado.

## Alcance de este incremento

- Tres pantallas navegables: **1. Buscar**, **2. Estado actual** y **3. Historial de movimientos**, con botones para moverse entre ellas (no se puede entrar a la 2 o la 3 sin haber hecho antes una consulta válida).
- Buscar una solicitud por número de radicado (formato `POL-AAAA-NNNN`).
- Ver el área actual y el estado (`pendiente`, `en revision` o `trasladada`) de esa solicitud.
- Ver el historial de movimientos entre áreas (fecha y acción realizada en cada etapa), en su propia pantalla.
- Ver los días hábiles transcurridos desde la radicación frente a los días hábiles esperados, con una **alerta visible** cuando el tiempo esperado se supera (por ejemplo, se esperan 8 días hábiles y la solicitud lleva 10). El cálculo excluye sábados, domingos **y los festivos oficiales de Colombia en 2026**.
- Manejar los casos de radicado inválido y radicado no encontrado.
- **Reenvío de documento para una modificación especial**: cuando una solicitud está en estado `pendiente`, la pantalla de Estado actual muestra un formulario para reenviar el documento corregido (nombre de archivo). Esto agrega un movimiento al historial y cambia el estado a `en revision`. Si la solicitud no está `pendiente` (por ejemplo, `trasladada`), el sistema rechaza el reenvío con un mensaje explicando por qué.

Quedan **fuera de alcance** en este incremento: el detalle del pendiente, el aviso de traslado entre áreas como pantalla independiente, y la integración con los sistemas reales de la institución (se usan datos de prueba en `data/solicitudes.json`). La validación de estos estados y áreas con Registro Académico, y la prueba con al menos dos usuarios sobre este prototipo navegable, quedan documentadas como próximos pasos en el plan de la iteración.

### Nota sobre los datos de ejemplo y la fecha actual

Los radicados de prueba corresponden a dos certificados reales publicados por el Politécnico Grancolombiano, con sus tiempos de entrega y costos 2026 oficiales (https://www.poli.edu.co/certificados):

| Radicado | Certificado | Tiempo de entrega publicado | Costo 2026 | Estado esperado |
|---|---|---|---|---|
| POL-2026-0417 | Copia Diploma de Grado | 8 días hábiles | $97.200 | Retrasada (radicada en agosto) |
| POL-2026-0512 | Certificado de Notas General - Firma Original | 2 a 5 días hábiles (máximo 5) | $93.400 | Retrasada (radicada en agosto) |
| POL-2026-0603 | Certificado de Notas por Periodo - Firma Original | 2 a 5 días hábiles (máximo 5) | $27.800 | Dentro del plazo |
| POL-2026-0701 | Certificado Fecha de Inicio y Terminación Materias | 2 a 5 días hábiles (máximo 5) | $13.700 | Dentro del plazo |
| POL-2026-0702 | Certificado ICETEX - Giro Adicional por Carga Académica | 2 a 5 días hábiles (máximo 5) | $13.700 | Dentro del plazo, trasladada |
| POL-2026-0703 | Certificado ICETEX - Giro Adicional por Doble Titulación | 2 a 5 días hábiles (máximo 5) | $13.700 | Retrasada (radicada en agosto) |
| POL-2026-0704 | Certificado de Intensidad Horaria Semanal, Inicio y Fin de Semestre | 2 a 5 días hábiles (máximo 5) | $13.700 | Dentro del plazo |
| POL-2026-0705 | Certificado de Otros Pagos | 2 a 5 días hábiles (máximo 5) | $13.700 | Dentro del plazo |
| POL-2026-0706 | Certificado de Contenidos Programáticos | 8 días hábiles (formato digital) | $59.100 | Dentro del plazo |
| POL-2026-0707 | Copia Acta de Grado | 8 días hábiles | $47.700 | Retrasada (radicada en agosto), trasladada |

### Modo demostración (fecha simulada)

El tiempo transcurrido se calcula contra la fecha real del día. Como los radicados de ejemplo tienen fechas fijas, con el paso de los días **todos terminan apareciendo como retrasados** y deja de verse el caso "dentro del plazo". Para demostrar ambos casos de forma reproducible, el proyecto incluye un modo demostración que fija la fecha de referencia en el **2 de octubre de 2026**:

```bash
npm run demo
```

En ese modo hay **4 solicitudes retrasadas** (`0417`, `0512`, `0703`, `0707`) y **6 dentro del plazo** (`0603`, `0701`, `0702`, `0704`, `0705`, `0706`), y la pantalla de estado muestra la leyenda "Fecha simulada para la demostración". Con `npm start` la fecha vuelve a ser la real. También puede usarse otra fecha: `node server.js --fecha-demo=AAAA-MM-DD` (o la variable de entorno `FECHA_DEMO`).

Con esto, el catálogo cubre los **10 certificados** publicados oficialmente por el Politécnico Grancolombiano (https://www.poli.edu.co/certificados), no solo una muestra.

Las fechas de radicación de POL-2026-0417 y POL-2026-0512 son fijas (agosto de 2026), por lo que aparecerán como **retrasadas** si las consultas después de esa fecha: eso es precisamente el comportamiento que la alerta debe mostrar. POL-2026-0603 se radicó pocos días hábiles antes de esta entrega, por lo que se mantendrá **dentro del plazo** durante los primeros días hábiles siguientes; pasado ese margen, también empezará a mostrarse como retrasada, ya que el cálculo siempre se hace contra la fecha real del día en que se ejecuta la aplicación. Para ver ambos comportamientos (con y sin alerta) de forma controlada y permanente, revisa las pruebas automatizadas (`npm test`), que fijan una fecha de referencia específica para cada escenario.

## Diseño visual

La interfaz usa un sistema de diseño propio (navy institucional + dorado, tipografía serif para títulos e IBM Plex Sans para el resto), definido en `public/css/styles.css`. Usa Google Fonts vía `@import`, por lo que necesita conexión a internet para verse con la tipografía completa; sin conexión, el navegador cae automáticamente a una fuente del sistema sin romper el diseño.

## Cómo ejecutar el proyecto

```bash
npm install
npm start
```

Luego abre `http://localhost:3000` en el navegador. Radicados de prueba disponibles: `POL-2026-0417` (pendiente, retrasada — prueba aquí el reenvío de documento), `POL-2026-0512` (trasladada, retrasada), `POL-2026-0603` (en revisión, dentro del plazo), y `POL-2026-0701` a `POL-2026-0707` (catálogo ampliado con los demás certificados reales).

### Endpoints disponibles

- `GET /api/solicitudes/:radicado` — consulta el estado, el historial y el tiempo de una solicitud.
- `POST /api/solicitudes/:radicado/reenvio` — reenvía un documento para resolver una modificación especial (body JSON: `{ "nombreArchivo": "..." }`). Solo funciona si la solicitud está en estado `pendiente`; **esto modifica `data/solicitudes.json` de forma permanente** (no hay base de datos todavía), así que conserva una copia del archivo original si quieres repetir la demostración varias veces.

## Cómo correr las pruebas

```bash
npm test
```

## Estructura del proyecto

```
poliseguimiento/
├── server.js                # Servidor Express y definición del endpoint
├── lib/solicitudes.js       # Lógica de negocio (validación y búsqueda)
├── lib/tiempos.js           # Días hábiles, festivos colombianos y alerta de retraso
├── lib/config.js            # Fecha de referencia (real o simulada para demostraciones)
├── data/solicitudes.json    # Datos de prueba (mock)
├── public/index.html        # Frontend del Incremento 1 (3 pantallas navegables)
├── public/css/styles.css    # Estilos, separados del HTML
├── test/solicitudes.test.js
└── package.json
```

## Equipo

Samuel Araque · Alejandro Taborda · John Cortes — Politécnico Grancolombiano, Práctica Aplicada de Sistemas.
