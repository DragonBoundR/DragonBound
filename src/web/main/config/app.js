const express = require("express");
const setupMiddleware = require("./middleware");
const setupEngine = require("./engine");
const setupHttpServer = require("./httpServer");

const setupApp = async () => {
  const app = express();

  setupEngine(app);
  setupMiddleware(app);
  setupHttpServer(app);
};

module.exports = setupApp;
