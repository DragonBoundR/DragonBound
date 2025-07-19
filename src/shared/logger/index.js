const colors = require("colors");

class Logger {
  constructor(context = "Application") {
    this.context = context;
  }

  static getLogger(context) {
    return new Logger(context);
  }

  _prefix() {
    return `[${this.context}]`;
  }

  log(...args) {
    console.log(this._prefix(), ...args);
  }

  error(...args) {
    console.error(colors.red(this._prefix()), ...args);
  }

  warn(...args) {
    console.warn(colors.yellow(this._prefix()), ...args);
  }

  debug(...args) {
    console.debug(colors.gray(this._prefix()), ...args);
  }

  verbose(...args) {
    console.trace(colors.magenta(this._prefix()), ...args);
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
