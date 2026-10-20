// server.js
// API REST del Incremento 1: consulta de estado de una solicitud por radicado.
const express = require("express");
const path = require("path");
const fs = require("fs");
const { buscarSolicitud, reenviarDocumento } = require("./lib/solicitudes");
const { obtenerFechaReferencia } = require("./lib/config");
const { formatoISO } = require("./lib/tiempos");

const app = express();
const PORT = process.env.PORT || 3000;
const RUTA_DATOS = path.join(__dirname, "data", "solicitudes.json");
const { fecha: FECHA_REF, simulada: FECHA_SIMULADA } = obtenerFechaReferencia();

// Cada respuesta indica contra qué fecha se calculó el tiempo, para que una fecha simulada nunca pase desapercibida.
function conReferencia(solicitud) {
  solicitud.tiempo.fechaReferencia = formatoISO(FECHA_REF);
  solicitud.tiempo.simulada = FECHA_SIMULADA;
  return solicitud;
}

function cargarSolicitudes() {
  const raw = fs.readFileSync(RUTA_DATOS, "utf-8");
  return JSON.parse(raw);
}

// Nota de diseño: como los datos viven en un archivo JSON (no en una base de
// datos), el reenvío de documento se persiste reescribiendo ese archivo. Esto
// es suficiente para este incremento, pero no es seguro ante escrituras
// concurrentes; una base de datos real resolvería esa limitación.
function guardarSolicitudes(dataset) {
  fs.writeFileSync(RUTA_DATOS, JSON.stringify(dataset, null, 2), "utf-8");
}

// Sirve el frontend estático
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// GET /api/solicitudes/:radicado
app.get("/api/solicitudes/:radicado", (req, res) => {
  const dataset = cargarSolicitudes();
  const resultado = buscarSolicitud(req.params.radicado, dataset, FECHA_REF);

  if (!resultado.ok) {
    const mensajes = {
      formato_invalido: "El número de radicado debe tener el formato POL-AAAA-NNNN.",
      no_encontrada: "No encontramos una solicitud con ese número de radicado.",
    };
    return res.status(resultado.codigo).json({
      error: resultado.error,
      mensaje: mensajes[resultado.error],
    });
  }

  return res.status(200).json(conReferencia(resultado.solicitud));
});

// POST /api/solicitudes/:radicado/reenvio
// Caso de uso: reenviar un documento para resolver una modificación especial.
app.post("/api/solicitudes/:radicado/reenvio", (req, res) => {
  const dataset = cargarSolicitudes();
  const nombreArchivo = req.body && req.body.nombreArchivo;
  const resultado = reenviarDocumento(req.params.radicado, nombreArchivo, dataset, FECHA_REF);

  if (!resultado.ok) {
    const mensajes = {
      formato_invalido: "El número de radicado debe tener el formato POL-AAAA-NNNN.",
      no_encontrada: "No encontramos una solicitud con ese número de radicado.",
      archivo_requerido: "Debes indicar el nombre del archivo que vas a reenviar.",
      estado_no_permite_reenvio: `Esta solicitud está "${resultado.estadoActual}" y no admite reenvío de documentos en este momento.`,
    };
    return res.status(resultado.codigo).json({
      error: resultado.error,
      mensaje: mensajes[resultado.error],
    });
  }

  guardarSolicitudes(dataset);
  return res.status(200).json(conReferencia(resultado.solicitud));
});

app.listen(PORT, () => {
  console.log(`PoliSeguimiento API escuchando en http://localhost:${PORT}`);
  console.log(FECHA_SIMULADA ? `Modo demostración: fecha simulada ${formatoISO(FECHA_REF)}` : "Fecha de referencia: hoy");
});

