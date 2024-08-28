const path = require("path");
const mapperFiles = require("@shared/lib/mapperFiles");

module.exports = async () => {
  const baseDir = path.resolve(__dirname, "../..");

  const controllers = await mapperFiles(baseDir, ".controller.js");

  return controllers;
};
