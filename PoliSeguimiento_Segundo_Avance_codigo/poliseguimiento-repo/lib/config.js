// lib/config.js
// Fecha de referencia del sistema. Por defecto es "hoy". Para demostraciones
// reproducibles puede fijarse con el argumento --fecha-demo=AAAA-MM-DD o con la
// variable de entorno FECHA_DEMO (el argumento tiene prioridad).
function obtenerFechaReferencia(argv = process.argv, env = process.env, ahora = new Date()) {
  const arg = argv.find((a) => a.startsWith("--fecha-demo="));
  const valor = arg ? arg.split("=")[1] : env.FECHA_DEMO;
  if (valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const fecha = new Date(valor + "T12:00:00");
    if (!Number.isNaN(fecha.getTime())) return { fecha, simulada: true };
  }
  return { fecha: ahora, simulada: false };
}

module.exports = { obtenerFechaReferencia };
