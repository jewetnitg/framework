import _ from 'lodash';
import $ from 'jquery';

// factories
import Model from 'frontend-model';
import Translator from 'frontend-translator';
import Router from 'frontend-router';

import Service from '../factories/Service';
import FactoryFactory from '../factories/Factory';

// singletons
import communicator from '../singletons/communicator';

//helpers
import isMobile from '../constants/isMobile';
import session from '../constants/session';

// constants
import defaultImplementation from '../constants/defaultImplementation/index';
import implementation from '../constants/implementation';

// @todo implement view adapters
function implement(options = {}, dst = {}) {
  return getOptionsFromServer(options)
    .then((serverData) => {
      const factory = FactoryFactory({
        defaults: defaultImplementation,
        factories: [
          // expose values as passed in
          ['config', function (config) {
            implementation.config = config;
          }],
          ['api', function (api) {
            implementation.api = api;
          }],
          // set up translator
          ['config.app.defaultLocale', 'config.locales', function (defaultLocale, locales) {
            implementation.translator = Translator({
              defaultLocale,
              locales
            });
          }],
          // set up communicator adapters
          ['adapters.communicator', function (adapters) {
            _.each(adapters, (adapter, adapterName) => {
              adapter.name = adapter.name || adapterName;
              implementation.adapters.communicator[adapter.name] = communicator.Adapter(adapter);
            });
          }],
          // set up communicator connections
          ['config.connections', 'api.connections', function (connectionsConfig, connectionsApi) {
            mergeImplementations(connectionsApi, connectionsConfig);
            _.each(connectionsConfig, (connection, connectionName) => {
              connection.name = connection.name || connectionName;
              implementation.config.connections[connection.name] = communicator.Connection(connection);
            });
          }],
          // set up communicator requests
          ['api.middleware.security', 'api.requests', 'libraries.sails.io', 'libraries.socket.io-client', function (securityMiddleware, requests, sailsIoClient, socketIoClient) {
            if (sailsIoClient) {
              communicator.adapters.SAILS_IO.sailsIoClient = sailsIoClient;
            }

            if (socketIoClient) {
              communicator.adapters.SAILS_IO.socketIoClient = socketIoClient;
            }
            communicator.middlewareRunner.security.add(securityMiddleware);
            _.each(requests, (request, requestName) => {
              request.name = request.name || requestName;
              implementation.api.requests[request.name] = communicator.Request(request);
            });
          }],
          // set up models
          ['api.models', 'config.models.defaultConnection', 'config.app.defaultConnection', function (models, modelDefaultConnection, appDefaultConnection) {
            const defaultConnection = modelDefaultConnection || appDefaultConnection;
            _.each(models, (model, modelName) => {
              model.name = model.name || modelName;
              model.connection = model.connection || defaultConnection;
              implementation.api.models[model.name] = Model(model);
            });
          }],
          // set up services
          ['api.services', function (services) {
            _.each(services, (service, serviceName) => {
              service.name = service.name || serviceName;
              implementation.api.services[service.name] = Service(service);
            });
          }],
          // set up router
          // @todo refactor arguments
          ['config.router', 'config.routes', 'api.routes', 'libraries.riot', 'libraries.react', 'libraries.react-dom', 'api.middleware', 'api.views', 'api.staticViews', 'config.views', 'config.staticViews', 'adapters.view', function (routerConfig, routesConfig, routesApi, riot, React, ReactDOM, middleware, views, staticViews, viewConfig, staticViewConfig, adapters) {

            mergeImplementations(routesApi, routesConfig, 'route');

            _.extend(routerConfig, {
              routes: routesConfig,
              staticViews,
              staticViewConfig,
              viewConfig,
              views,
              middleware,
              session
            });

            if (riot) {
              Router.View.adapters.riot.riot = riot;
            }

            if (React) {
              //noinspection JSPrimitiveTypeWrapperUsage
              Router.View.adapters.react.React = React;
            }

            if (ReactDOM) {
              //noinspection JSPrimitiveTypeWrapperUsage
              Router.View.adapters.react.ReactDOM = ReactDOM;
            }

            _.each(adapters, (adapter, name) => {
              adapter.name = adapter.name || name;
              Router.View.Adapter(adapter);
            });

            implementation.router = new Router(routerConfig);
          }]
        ]
      });

      _.merge(options, serverData);

      applyDevice(options);
      applyEnv(options);

      factory(options);

      communicator.defaultConnection = implementation.config.app.defaultConnection;
      implementation.communicator = communicator;

      _.extend(dst, implementation);
      dst.options = implementation;

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