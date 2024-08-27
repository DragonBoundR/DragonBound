require("module-alias/register");

const setupApp = require("./config/app");

const logStarted = require("@web/main/config/logStarted");

(async function () {
  await setupApp();
  logStarted();
  
})();
