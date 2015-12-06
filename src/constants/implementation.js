/**
 * @author rik
 */

/**
 * Singleton that contains the constructed implementation of the framework
 *
 * @name implementation
 * @type Object
 */
const implementation = {
  api: {
    models: {},
    controllers: {},
    views: {},
    requests: {},
    services: {}
  },
  components: {
    adapters: {}
  },
  config: {
    app: {},
    connections: {},
    models: {},
    router: {},
    views: {},
    routes: {}
  }
};

export default implementation;