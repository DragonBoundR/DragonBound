const path = require("path");
const { readdirSync } = require("fs");

module.exports = async (baseDir, prefix) => {
  return new Promise((resolve, reject) => {
    const findControllers = (dir) => {
      const results = [];
      const list = readdirSync(dir);

      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = require("fs").statSync(filePath);

        if (stat && stat.isDirectory()) {
          results.push(...findControllers(filePath));
        } else if (file.endsWith(prefix)) {
          const controller = require(filePath);
          results.push(controller);
        }
      });

      return results;
    };

    try {
      const controllers = findControllers(baseDir);
      resolve(controllers);
    } catch (err) {
      reject(err);
    }
  });
};
