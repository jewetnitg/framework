import _ from 'lodash';
import Router from 'frontend-router';
import {Server,security} from 'frontend-server';

function implementRouter(implementation = {}) {
  mergeImplementations(implementation.api.routes, implementation.config.routes, 'route');

  Object.assign(implementation.config.router, {
    routes: implementation.config.routes,
    views: implementation.api.views,
    staticViews: implementation.api.staticViews,
    middleware: implementation.api.middleware,
    viewConfig: implementation.config.views,
    staticViewConfig: implementation.config.staticViews,
    libraries: implementation.libraries,
    adapters: implementation.adapters.view,
    session: implementation.session
  });

  return Router(implementation.config.router);
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

export default implementRouter;