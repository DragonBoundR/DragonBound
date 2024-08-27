const config = require("./env");

const setupHttpServer = (app) => {
  const http = require("http").createServer();
  http.on("request", app);
  http.listen(config.PORT, function () {
    console.log("Server is running on port " + config.PORT);
  });
  return http;
};

module.exports = setupHttpServer;
