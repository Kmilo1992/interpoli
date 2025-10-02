export const alertTypes = {
  disparos: [
    "Disparos en la zona",
    "Confrontación entre bandas o grupos criminales",
    "Disparos al aire con fines intimidatorios o festivos",
    "Uso de armas de fuego en actos delictivos (robos, amenazas, etc.)"
  ],
  propiedades: [
    "Robo a viviendas o comercios",
    "Allanamiento sin robo (intrusión ilegal)",
    "Daños materiales (puertas, ventanas, vehículos)"
  ],
  robo: [
    "Con arma blanca (cuchillos, navajas)",
    "Con arma de fuego (pistolas, revólveres, etc.)",
    "Con fuerza física o intimidación (sin armas)"
  ],
  vandalismo: [
    "Daño a propiedad privada (viviendas, autos, negocios)",
    "Grafitis no autorizados en muros o fachadas",
    "Destrucción de mobiliario (ventanas, puertas, cámaras)"
  ],
  violencia: [
    "Peleas callejeras entre individuos o grupos",
    "Agresiones físicas a transeúntes o comerciantes",
    "Amenazas o insultos violentos en espacios públicos"
  ],
  otro: ["Otro"]
};


// Opcional: arreglo para poblar selects con label legible
export const alertTypeOptions = Object.keys(alertTypes).map((key) => ({
  value: key,
  // etiqueta con primera letra mayúscula
  label: key.charAt(0).toUpperCase() + key.slice(1)
}));

// Helper para obtener descriptions dado un type
export function getDescriptionsForType(type) {
  return alertTypes[type] || [];
}