// lib/solicitudes.js
const { evaluarTiempo, formatoISO } = require("./tiempos");

// Regla esencial: el radicado debe seguir el formato POL-AAAA-NNNN
const RADICADO_REGEX = /^POL-\d{4}-\d{4}$/;

function esRadicadoValido(radicado) {
  return RADICADO_REGEX.test(radicado);
}

function buscarSolicitud(radicado, dataset, fechaReferencia = new Date()) {
  const normalizado = (radicado || "").toUpperCase();
  if (!esRadicadoValido(normalizado)) {
    return { ok: false, codigo: 400, error: "formato_invalido" };
  }
  const solicitud = dataset[normalizado];
  if (!solicitud) {
    return { ok: false, codigo: 404, error: "no_encontrada" };
  }

  const tiempo = evaluarTiempo(
    solicitud.fechaRadicacion,
    solicitud.diasHabilesEsperados,
    fechaReferencia
  );

  return { ok: true, codigo: 200, solicitud: { ...solicitud, tiempo } };
}

// Caso de uso: reenvío de documento para una modificación especial.
// Regla: solo se admite el reenvío cuando la solicitud está "pendiente" (es decir,
// cuando el área responsable está esperando algo del solicitante). Si está en
// cualquier otro estado (en revision, trasladada), se rechaza explicando por qué.
function reenviarDocumento(radicado, nombreArchivo, dataset, fechaReferencia = new Date()) {
  const normalizado = (radicado || "").toUpperCase();
  if (!esRadicadoValido(normalizado)) {
    return { ok: false, codigo: 400, error: "formato_invalido" };
  }
  const solicitud = dataset[normalizado];
  if (!solicitud) {
    return { ok: false, codigo: 404, error: "no_encontrada" };
  }
  if (!nombreArchivo || !nombreArchivo.trim()) {
    return { ok: false, codigo: 400, error: "archivo_requerido" };
  }
  if (solicitud.estado !== "pendiente") {
    return { ok: false, codigo: 409, error: "estado_no_permite_reenvio", estadoActual: solicitud.estado };
  }

  // Fecha local (no UTC): en Colombia, después de las 7 p. m. la fecha UTC ya es la del día siguiente.
  const fechaISO = formatoISO(fechaReferencia);
  solicitud.estado = "en revision";
  solicitud.historial.push({
    area: solicitud.areaActual,
    fecha: fechaISO,
    accion: `Documento reenviado (${nombreArchivo.trim()}) — en revisión`,
  });

  const tiempo = evaluarTiempo(solicitud.fechaRadicacion, solicitud.diasHabilesEsperados, fechaReferencia);
  return { ok: true, codigo: 200, solicitud: { ...solicitud, tiempo } };
}

module.exports = { esRadicadoValido, buscarSolicitud, reenviarDocumento, RADICADO_REGEX };
