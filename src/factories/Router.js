import _ from 'lodash';

import implementation from '../singletons/implementation';
import ensureController from '../helpers/ensureController';
import ControllerRequest from './ControllerRequest';
import View from './View';

import _Router from 'frontend-router';

/**
 * Please refer to the documentation of the frontend-router module for more information
 *
 * @author Rik Hoffbauer
 *
 * @param options {Object} The framework implementation, ie. {config: {...}, api: {...}, ...}
 * @returns {Object} frontend-router instance
 */
function Router(options = {}) {
  // @todo validate properties
  const views = {};
  let currentView = null;

  const opts = _.extend({}, options.config.router, {
    success(route, data) {
      if (currentView) {
        currentView.hide();
      }

      const view = currentView = ensureViewForRoute(views, route);

      view.render(data);
      console.log('success', route, data);
    },
    sync(route, data) {
      const view = ensureViewForRoute(views, route);
      view.sync(data);
      console.log('sync', route, data);
    },
    fail(route, data) {
      switch (data.reason) {
        case 'policy':
          console.log('policies failed for route', route, data);
          break;
        case 'controller':
          console.log('controller failed for route', route, data);
          break;
      }
    },
    routes: options.config.routes,
    policies: options.api.policies,
    controllers: options.api.controllers
  });

  return _Router(opts);
}

function ensureViewForRoute(views, route) {
  const viewName = route.view;

  if (!views[viewName]) {
    implementation.api.views[viewName].name = implementation.api.views[viewName].name || viewName;
    views[viewName] = View(implementation.api.views[viewName]);
  }

  return views[viewName];
}

export default Router;