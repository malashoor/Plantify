const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.window = undefined;
  }

  async setup() {
    await super.setup();
    if (this.global.window === undefined) {
      this.global.window = this.dom.window;
    }
  }
}

module.exports = CustomEnvironment; 