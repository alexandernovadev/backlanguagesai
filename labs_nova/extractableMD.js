const fs = require("fs");
const path = require("path");

// Ruta de entrada y salida
const inputPath = path.join(__dirname, "./tableIrrvebs.md");
const outputPath = path.join(__dirname, "./tabla.json");

// Función para convertir la tabla MD a JSON
function mdTableToJson(mdTable) {
  const lines = mdTable.trim().split("\n");

  // Obtener encabezados
  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h);

  // Obtener filas de datos
  const rows = lines.slice(2).map((row) =>
    row
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell)
  );

  // Mapear filas a objetos, omitiendo el primer campo
  return rows.map((row) =>
    Object.fromEntries(
      headers
        .map((h, i) => (i !== 0 ? [h, row[i]] : null)) // Omitir el primer campo
        .filter((entry) => entry !== null) // Filtrar entradas nulas
    )
  );
}

// Leer el archivo MD y crear el JSON
fs.readFile(inputPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error al leer el archivo:", err);
    return;
  }

  const jsonResult = mdTableToJson(data);

  // Guardar el JSON
  fs.writeFile(outputPath, JSON.stringify(jsonResult, null, 2), (err) => {
    if (err) {
      console.error("Error al escribir el archivo JSON:", err);
      return;
    }
    console.info(`Archivo JSON creado: ${outputPath}`);
  });
});
