const fs = require("fs");
const path = require("path");

/**
 * Recorre recursivamente un directorio y renombra archivos .handlebars a .hbs
 * @param {string} dir - Ruta al directorio base
 */
function renameHandlebarsToHbs(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      renameHandlebarsToHbs(fullPath); // recursivo
    } else if (entry.isFile() && entry.name.endsWith(".handlebars")) {
      const newName = path.join(dir, entry.name.replace(/\.handlebars$/, ".hbs"));
      fs.renameSync(fullPath, newName);
      console.log(`Renombrado: ${fullPath} → ${newName}`);
    }
  });
}

// ✅ Cambia este path si tu estructura es diferente
const baseDir = path.join(__dirname, "src/web/views");

renameHandlebarsToHbs(baseDir);
