import _ from 'lodash';

import implementation from '../singletons/implementation';
import session from '../constants/session';
import View from 'frontend-view';

import FrontendRouter from 'frontend-router';

/**
 * Please refer to the documentation of the frontend-router module for more information
 *
 * @class Router
 * @author Rik Hoffbauer
 *
 * @param options {Object} The framework implementation, ie. {config: {...}, api: {...}, ...}
 *
 * @returns {FrontendRouter} frontend-router instance
 *
 * @todo validate properties
 * @todo call staticViews
 */
function Router(options = {}) {
  const views = {};
  let currentView = null;

  //noinspection JSPotentiallyInvalidConstructorUsage
  FrontendRouter.policyExecutor.requestFactory.prototype.session = session;

  const opts = _.extend({}, options.config.router, {
    success(route, data) {
      if (currentView) {
        currentView.hide();
      }

      currentView = ensureViewForRoute(views, route);

      currentView.render(data);
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
    controllers: implementation.api.controllers
  });


  return FrontendRouter(opts);
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