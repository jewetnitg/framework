import _ from 'lodash';

import session from '../constants/session';
import eventsMixin from '../mixins/eventsMixin';

import implement from '../helpers/implement';

/**
 * @class Application
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property api {Object} Object containing the api (models, requests, controllers, services)
 * @property components {Object} Object containing the components (Adapters and ViewEngines)
 * @property config {Object} Object containing the configuration objects
 * @property env {String} String representing the runtime environment
 */
function Application() {
  const props = {
    session: {
      value: session
    }
  };

  const app = Object.create(Application.prototype, props);

  Object.assign(app, eventsMixin(), {
    started: false
  });

  return app;
}

//noinspection JSUnresolvedVariable
Application.prototype = {

  start(options = {}) {
    if (this.started) {
      return Promise.resolve();
    }

    return implement(options)
      .then((constructed) => {
        Object.assign(this, constructed);
        return this.serverInstance.connect();
      })
      .then(() => {
        //noinspection JSUnresolvedFunction
        return this.config.bootstrap();
      })
      .then(() => {
        this.router.start();

        this.trigger('ready');
      });
  },

  /**
   * The server property of the default connection. Please refer to the frontend-communicator module for more information.
   *
   * @name server
   * @memberof Application
   * @instance
   *
   * @type Object|undefined
   */
  get server() {
    //noinspection JSUnresolvedVariable
    return this.serverInstance.server;
  },

  get serverInstance() {
    //noinspection JSUnresolvedVariable
    return this.servers[this.config.app.defaultServer];
  },

  /**
   * Gets a translation in the current locale and fills it with data.
   *
   * @method translate
   * @memberof Application
   * @instance
   *
   * @param wordPath {String} Path to the word, 'general.yes' for example
   * @param data {Object} Object to fill the translation with
   *
   * @returns {String} The translation filled with data
   */
  translate(wordPath, data = {}) {
    //noinspection JSUnresolvedVariable
    return this.translator.translate(wordPath, data);
  },

  /**
   * Sets the current locale.
   *
   * @method setLocale
   * @memberof Application
   * @instance
   *
   * @param {String} [locale=defaultLocale specified in config/state.js] - The locale to set
   *
   */

  setLocale(locale = this.config.app.defaultLocale) {
    //noinspection JSUnresolvedVariable
    return this.translator.setLocale(locale);
  }

};

export default Application;