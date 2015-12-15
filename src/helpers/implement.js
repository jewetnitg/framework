import Factory from '../helpers/Factory';
import _ from 'lodash';

// factories
import Model from 'frontend-model';
import View from 'frontend-view';
import Translator from 'frontend-translator';
import Router from 'frontend-router';

import Service from '../factories/Service';

// singletons
import communicator from '../singletons/communicator';

//helpers
import isMobile from '../constants/isMobile';

// constants
import defaultImplementation from '../constants/defaultImplementation/index';
import implementation from '../constants/implementation';

function implement(options = {}) {
  return getOptionsFromServer(options)
    .then((serverData) => {
      const opts = _.merge({}, defaultImplementation, options, serverData);

      applyDevice(opts);
      applyEnv(opts);

      if (opts.libraries.riot) {
        View.adapters.riot.riot = opts.libraries.riot;
        Router.View.adapters.riot.riot = opts.libraries.riot;
      }

      mergeImplementations(opts.api.routes, opts.config.routes, 'route');
      delete opts.api.routes;

      mergeImplementations(opts.api.connections, opts.config.connections);
      delete opts.api.connections;

      implementation.config = opts.config;

      // views dont have to be constructed at once, they are constructed when needed
      implementation.api.views = opts.api.views;
      implementation.api.middleware = opts.api.middleware;
      implementation.api.staticViews = opts.api.staticViews;
      implementation.translator = Translator({
        defaultLocale: opts.config.app.defaultLocale,
        locales: opts.config.locales
      });

      communicator.defaultConnection = implementation.config.app.defaultConnection;
      communicator.policyExecutor.add(opts.api.policies);
      implementation.communicator = communicator;

      // factories for all components of the implementation
      const factories = [
        // frontend-communicator
        {
          factory: communicator.Adapter,
          src: opts.components.adapters,
          dst: implementation.components.adapters
        },
        {
          factory: communicator.Connection,
          src: opts.config.connections,
          dst: implementation.config.connections
        },
        {
          factory: communicator.Request,
          src: opts.api.requests,
          dst: implementation.api.requests
        },
        // frontend-model
        {
          factory: Model,
          src: opts.api.models,
          dst: implementation.api.models,
          defaults: {
            connection: implementation.config.models.connection || implementation.config.app.defaultConnection
          }
        },
        // frntnd-framework
        {
          factory: Service,
          src: opts.api.services,
          dst: implementation.api.services
        }
      ];

      _.each(factories, Factory);

      return implementation;
    });
}

function mergeImplementations(src, dst, identifierAttribute = "name", overrideIdentity = false) {
  const mergeObj = {};
  _.each(src, (obj, identity) => {
    var _identity = obj[identifierAttribute];

    if (overrideIdentity) {
      _identity = identity;
    }

    dst[_identity] = obj;
  });

  _.merge(dst, mergeObj);
}

// applies device specific implementation
function applyDevice(options) {
  if (isMobile) {
    _.merge(options, options.config.mobile || {});
  }
}

// applies environment specific implementation
function applyEnv(options) {
  if (options.env) {
    const env = options.config.env[options.env];

    if (env) {
      _.merge(options, env);
    }
  }
}

// gets the implementation object from the server
function getOptionsFromServer(options) {
  if (options.config.app.descriptorUrl) {
    return new Promise(resolve => {
      $.get(options.config.app.descriptorUrl)
        .done(resolve)
        .fail(() => {
          resolve()
        });
    });
  } else {
    return Promise.resolve();
  }
}

export default implement;