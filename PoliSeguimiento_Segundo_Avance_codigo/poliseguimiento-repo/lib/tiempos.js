// lib/tiempos.js
// Calcula días hábiles transcurridos desde la radicación y determina si la
// solicitud superó el tiempo esperado de entrega (regla pedida por el docente:
// ej. se esperan 8 días hábiles y la solicitud lleva 10 -> debe alertar).

// Festivos oficiales de Colombia para 2026 (incluye el nuevo festivo de la Ley
// 2578 de 2026, Nuestra Señora del Rosario de Chiquinquirá, trasladado al
// lunes 13 de julio por la Ley Emiliani). Formato "AAAA-MM-DD".
// Nota: esta lista es válida únicamente para 2026; si el proyecto sigue
// vivo en 2027, debe actualizarse con el calendario de ese año.
const FESTIVOS_COLOMBIA_2026 = [
  "2026-01-01", // Año Nuevo
  "2026-01-12", // Reyes Magos
  "2026-03-23", // Día de San José
  "2026-04-02", // Jueves Santo
  "2026-04-03", // Viernes Santo
  "2026-05-01", // Día del Trabajo
  "2026-05-18", // Ascensión del Señor
  "2026-06-08", // Corpus Christi
  "2026-06-15", // Sagrado Corazón
  "2026-06-29", // San Pedro y San Pablo
  "2026-07-13", // Nuestra Señora del Rosario de Chiquinquirá (nuevo, Ley 2578 de 2026)
  "2026-07-20", // Día de la Independencia
  "2026-08-07", // Batalla de Boyacá
  "2026-08-17", // Asunción de la Virgen
  "2026-10-12", // Día de la Raza
  "2026-11-02", // Todos los Santos
  "2026-11-16", // Independencia de Cartagena
  "2026-12-08", // Inmaculada Concepción
  "2026-12-25", // Navidad
];

function formatoISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function esFestivoColombia(fecha) {
  return FESTIVOS_COLOMBIA_2026.includes(formatoISO(fecha));
}

function esDiaHabil(fecha) {
  const dia = fecha.getDay(); // 0 = domingo, 6 = sábado
  if (dia === 0 || dia === 6) return false;
  return !esFestivoColombia(fecha);
}

// Cuenta los días hábiles estrictamente posteriores a "inicio" y hasta "fin" (inclusive).
function diasHabilesEntre(inicio, fin) {
  let contador = 0;
  const cursor = new Date(inicio);
  cursor.setHours(0, 0, 0, 0);
  const limite = new Date(fin);
  limite.setHours(0, 0, 0, 0);

  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= limite) {
    if (esDiaHabil(cursor)) contador++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return contador;
}

// fechaRadicacion: string "AAAA-MM-DD"; fechaReferencia: Date (por defecto, hoy).
function evaluarTiempo(fechaRadicacion, diasHabilesEsperados, fechaReferencia = new Date()) {
  const inicio = new Date(fechaRadicacion + "T00:00:00");
  const diasHabilesTranscurridos = diasHabilesEntre(inicio, fechaReferencia);
  return {
    diasHabilesTranscurridos,
    diasHabilesEsperados,
    retrasada: diasHabilesTranscurridos > diasHabilesEsperados,
  };
}

module.exports = { esDiaHabil, diasHabilesEntre, evaluarTiempo, esFestivoColombia, formatoISO, FESTIVOS_COLOMBIA_2026 };
