import _ from 'lodash';
import events from 'events';

import View from 'frontend-view';
import Router from 'frontend-router';

import session from '../constants/session';
import eventsMixin from '../mixins/eventsMixin';

import implement from '../helpers/implement';

import implementation from '../constants/implementation';

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
function Application(options = {}) {
  const props = {
    session: {
      value: session
    }
  };

  const app = window.app = Object.create(Application.prototype, props);

  _.extend(app, eventsMixin());

  startApplication(app, options);

  return app;
}

Application.prototype = {

  get models() {
    return this.api && this.api.models;
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
    return (this.connection && this.connection.server) || (this.communicator.servers[this.config.app.defaultConnection]);
  },

  /**
   * Connects a Connection using the frontend-communicator module.
   * Please refer to the frontend-communicator module to read more on this.
   *
   * @method connect
   * @memberof Application
   * @instance
   *
   * @param {String} [connection=defaultConnection specified in config/app.js] - The name of the Connection to connect
   *
   * @returns {Promise<Object>} A promise that resolves with a frontend-communicator Connection instance with the provided name
   */
  connect(connection = this.config.app.defaultConnection) {
    return this.communicator.connect(connection);
  },

  /**
   * Executes one or more policies, see the frontend-policies documentation for more info.
   *
   * @method policy
   * @memberof Application
   * @instance
   *
   * @param policies {String|Array<String>} The policies to execute
   * @param {Object} [data={}] - Data/params for the policy 'request'
   *
   * @returns {Promise} A promise that resolves if all policies pass and rejects if one or more don't
   */
  policy(policies = [], data = {}) {
    return this.router.policy(policies, data);
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
    return this.translator.translate(wordPath, data);
  },

  /**
   * Sets the current locale.
   *
   * @method setLocale
   * @memberof Application
   * @instance
   *
   * @param {String} [locale=defaultLocale specified in config/app.js] - The locale to set
   *
   */
  setLocale(locale = this.config.app.defaultLocale) {
    return this.translator.setLocale(locale);
  }

};

function startApplication(app, options) {
  return implement(options, app)
    .then(() => {
      return app.connect();
    })
    .then((connection) => {
      app.connection = connection;
      return app.config.bootstrap();
    })
    .then(() => {
      app.trigger('ready');
      // for render-server
      if (window._onAppReady) {
        window._onAppReady();
        delete window._onAppReady;
      }
    });
}

export default Application;