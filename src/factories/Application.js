import _ from 'lodash';

import Model from 'frontend-model';
import View from 'frontend-view';
import Translator from 'frontend-translator';
import Controller from './Controller';
import Service from './Service';
import Router from './Router';

import defaultImplementation from '../constants/defaultImplementation';

import factoryRunner from '../helpers/factoryRunner';
import implementation from '../singletons/implementation';

import isMobile from '../constants/isMobile';

// frontend-communicator module, use the one used by the frontend-model module
// so we a single communicator instead of multiple
const communicator = Model.communicator;

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
  const opts = _.merge({}, defaultImplementation, options);

  if (options.libraries.riot) {
    View.riot = options.libraries.riot;
  }

  const constructedImplementation = implement(opts);

  const props = {
    api: {
      value: constructedImplementation.api
    },
    models: {
      value: constructedImplementation.api.models
    },
    config: {
      value: constructedImplementation.config
    },
    communicator: {
      value: constructedImplementation.communicator
    },
    translator: {
      value: constructedImplementation.translator
    },
    options: {
      value: opts
    }
  };

  const app = window.app = Object.create(Application.prototype, props);

  startApplication(app);

  return app;
}

Application.prototype = {

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
   * @todo implement
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
   * @todo implement
   *
   * @param {String} [locale=defaultLocale specified in config/app.js] - The locale to set
   *
   */
  setLocale(locale = this.config.app.defaultLocale) {
    return this.translator.setLocale(locale);
  }

};

function startApplication(app) {
  return app.connect()
    .then((connection) => {
      app.connection = connection;
      return Promise.resolve();
    })
    .then(app.config.bootstrap)
    .then(() => {
      app.router = implementation.router = Router(app.options);
    });
}

// @todo construct static views
function implement(options = {}) {
  applyDevice(options);
  applyEnv(options);

  implementCommunicator(options, implementation);
  implementModel(options, implementation);
  implementTranslator(options, implementation);
  implementStaticViews(options, implementation);
  implementRouter(options, implementation);
  implementFramework(options, implementation);

  implementation.config = options.config;
  implementation.api.views = options.api.views;

  return implementation;
}


function implementCommunicator(opts, dst) {
  factoryRunner(communicator.Adapter, opts.components.adapters, dst.components.adapters);
  factoryRunner(communicator.Connection, opts.config.connections, dst.config.connections);
  communicator.defaultConnection = opts.config.app.defaultConnection;

  factoryRunner(communicator.Request, opts.api.requests, dst.api.requests);

  dst.communicator = communicator;
}

function implementModel(opts, dst) {
  factoryRunner(Model, opts.api.models, dst.api.models);
}

function implementTranslator(opts, dst) {
  dst.translator = Translator({
    defaultLocale: opts.config.app.defaultLocale,
    locales: opts.config.locales
  });
}

function implementStaticViews(opts, dst) {
  factoryRunner(View, opts.api.staticViews, {}, {
    static: true
  });

  dst.api.staticViews = View.staticViews;
}

function implementRouter(opts, dst) {
  factoryRunner(Controller, opts.api.controllers, dst.api.controllers);
}

function implementFramework(opts, dst) {
  factoryRunner(Service, opts.api.services, dst.api.services);
}

function applyDevice(options) {
  if (isMobile) {
    _.merge(options, options.config.mobile || {});
  }
}

function applyEnv(options) {
  if (options.env) {
    const env = options.config.env[options.env];

    if (env) {
      _.merge(options, env);
    }
  }
}

export default Application;