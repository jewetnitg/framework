import _ from 'lodash';

import getImplementationFromServer from './getImplementationFromServer';

import implementTranslator from './implementTranslator';
import implementRouter from './implementRouter';
import implementServers from './implementServers';

import Service from '../factories/Service';

import isMobile from '../constants/isMobile';
import defaultImplementation from '../constants/defaultImplementation';

function implementFramework(localImplementation = {}) {
  return getMergedImplementation(localImplementation)
    .then(implementation => {
      applyEnv(implementation);
      applyDevice(implementation);

      const servers = implementServers(implementation);
      const router = implementRouter(implementation);
      const translator = implementTranslator(implementation);
      const services = implementServices(implementation);

      return {
        servers: servers.instances,
        models: servers.models,
        config: implementation.config,
        services,
        translator,
        router
      }
    });
}

function getMergedImplementation(localImplementation = {}) {
  const baseImplementation = _.merge({}, defaultImplementation, localImplementation);
  if (localImplementation.config.app.descriptorUrl) {
    return getImplementationFromServer(localImplementation.config.app.descriptorUrl)
      .then((remoteImplementation = {}) => {
        // @todo allow precedence to be configurable (local vs remote)
        return _.merge(baseImplementation, remoteImplementation);
      });
  } else {
    return Promise.resolve(baseImplementation);
  }
}

function implementServices(implementation = {}) {
  const services = {};

  _.each(implementation.api.services, (serviceOptions, serviceName) => {
    serviceOptions.name = serviceOptions.name || serviceName;
    services[serviceOptions.name] = Service(serviceOptions);
  });

  return services;
}

// applies device specific implementation
function applyDevice(implementation) {
  if (isMobile) {
    _.merge(implementation, implementation.config.mobile || {});
  }
}

// applies environment specific implementation
function applyEnv(implementation) {
  if (implementation.env) {
    const env = implementation.config.env[implementation.env];

    if (env) {
      _.merge(implementation, env);
    }
  }
}

export default implementFramework;