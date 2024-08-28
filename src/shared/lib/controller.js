class Controller {
  route = [];
  method = "post";
  handler = null;
  middlewares = [];

  constructor() {}

  static on(route, handler, middlewares = []) {
    const controller = new Controller();
    controller.route = Array.isArray(route) ? route : [route];
    controller.handler = handler;
    controller.middlewares = middlewares;
    return controller;
  }

  setMethod(method) {
    this.method = method;
    return this;
  }
}

module.exports = Controller;
