import riot from 'riot';
import ReactDOM from 'react-dom';
import react from 'react';
import jquery from 'jquery';

const defaultImplementation = {
  adapters: {
    // @todo rename to connection
    communicator: {},
    view: {}
  },
  api: {
    middleware: {
      data: {},
      security: {}
    },
    models: {},
    requests: {},
    routes: {},
    services: {},
    staticViews: {},
    views: {}
  },
  config: {
    app: {
      defaultLocale: 'en-GB'
    },
    bootstrap() {
      return Promise.resolve();
    },
    env: {},
    locales: {
      'en-GB': {
        words: {}
      }
    },
    mobile: {},
    models: {
      idAttribute: 'id',
      createdOnAttribute: 'createdAt',
      updatedOnAttribute: 'updatedAt'
    },
    router: {},
    routes: {},
    servers: {},
    staticViews: {},
    views: {}
  },
  libraries: {
    jquery,
    react,
    riot,
    'react-dom': ReactDOM
  }
};

export default defaultImplementation;