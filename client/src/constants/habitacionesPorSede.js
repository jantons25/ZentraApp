// Inventario inicial replicado de la lista estática previa para no romper sedes ya en uso.
// Ajustar la lista real de cada sede aquí sin tocar el formulario.
export const HABITACIONES_POR_SEDE = {
  Plaza: [
    "101", "102", "103", "104", "105",
    "201", "202", "203", "204", "205", "206",
    "301", "302", "303", "304", "305", "306",
    "401", "402", "403", "404", "405", "406",
  ],
  Balta: [
    "101", "102", "103", "104", "105",
    "201", "202", "203", "204", "205", "206",
    "301", "302", "303", "304", "305", "306",
    "401", "402", "403", "404", "405", "406",
  ],
  SanJose: [
    "201", "202", "203", "204", "205", "206",
    "301", "302", "303", "304", "305", "306", "307", "308", "309",
    "401", "402", "403", "404", "405", "406", "407", "408", "409",
    "501", "502", "503", "504", "505", "506", "507", "508", "509",
  ],
};

export function getHabitacionesPorSede(sede) {
  const valor = sede ?? "";
  const claveEncontrada = Object.keys(HABITACIONES_POR_SEDE).find((clave) =>
    valor.includes(clave)
  );
  return claveEncontrada ? HABITACIONES_POR_SEDE[claveEncontrada] : [];
}
