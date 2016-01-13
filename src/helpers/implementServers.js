import _ from 'lodash';
import {Server,security} from 'frontend-server';

function implementServers(implementation = {}) {
  const servers = {
    instances: {},
    servers: {},
    models: {}
  };

  const defaultServer = implementation.config.models.defaultServer || implementation.config.app.defaultServer;

  security.add(implementation.api.middleware);

  _.each(implementation.adapters.communicator, (adapterOptions, adapterName) => {
    adapterOptions.name = adapterOptions.name || adapterName;

    Server.Adapter(adapterOptions);
  });

  Server.defaults.libraries.sailsIo = implementation.libraries.sailsIo || Server.defaults.libraries.sailsIo;
  Server.defaults.libraries.socketIo = implementation.libraries.socketIo || Server.defaults.libraries.socketIo;

  _.each(implementation.config.servers, (serverOptions, serverName) => {
    serverOptions.name = serverOptions.name || serverName;
    servers.instances[serverOptions.name] = Server(serverOptions);
    servers.servers[serverOptions.name] = servers.instances[serverOptions.name].server;
  });

  _.each(implementation.api.models, (modelOptions, modelName) => {
    modelOptions.name = modelOptions.name || modelName;
    modelOptions.server = modelOptions.server || defaultServer;

    if (modelOptions.server && servers.instances[modelOptions.server]) {
      const model = servers.instances[modelOptions.server].add.model(modelOptions);
      servers.models[modelOptions.name] = model;
    }
  });

  _.each(implementation.api.requests, (requestOptions, requestName) => {
    requestOptions.name = requestOptions.name || requestName;

    if (requestOptions.server && servers.instances[requestOptions.server]) {
      servers.instances[requestOptions.server].add.method(requestOptions);
    }
  });

  return servers;
}

export default implementServers;