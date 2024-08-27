const express = require("express");
const path = require("path");

module.exports = (app) => {
  app.use(
    "/static",
    express.static(path.join(__dirname + "../../../../web/public_html/data"))
  );
};
