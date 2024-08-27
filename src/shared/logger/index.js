const log4js = require("./config");
const colors = require("colors");

class Logger {
  constructor(context = "Application") {
    this.defaultLogger = log4js.getLogger(context);
    this.customLogger = log4js.getLogger("custom");
    this.context = context;
  }

  static getLogger(context) {
    return new Logger(context);
  }

  log(...args) {
    this.defaultLogger.info(`[${this.context}]`, ...args);
  }

  error(...args) {
    this.defaultLogger.error(`[${this.context}]`, ...args);
  }

  warn(...args) {
    this.defaultLogger.warn(`[${this.context}]`, ...args);
  }

  debug(...args) {
    this.defaultLogger.debug(`[${this.context}]`, ...args);
  }

  verbose(...args) {
    this.defaultLogger.trace(`[${this.context}]`, ...args);
  }

  cyan(...args) {
    console.log(colors.cyan(...args));
  }

  white(...args) {
    console.log(...args);
  }

  green(...args) {
    console.log(colors.green(...args));
  }

  break() {
    console.log();
  }
  
  customColor(colorArray, ...args) {
    const coloredMessage = args
      .map((arg, index) => {
        const color = colors[colorArray[index % colorArray.length]];
        return color ? color(arg) : arg;
      })
      .join("");

    console.log(coloredMessage);
  }
}

module.exports = Logger;
