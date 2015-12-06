import _ from 'lodash';

import implementation from '../constants/implementation';
import communicator from '../singletons/communicator';

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

  FrontendRouter.policyExecutor = communicator.policyExecutor;
  //noinspection JSPotentiallyInvalidConstructorUsage
  FrontendRouter.policyExecutor.requestFactory.prototype.session = session;

  const opts = _.extend({}, options.config.router, {
    success(route, data) {
      console.log('success', route, data);

      // for render-server
      // @todo see if we need this, maybe we can combine _onAppReady and _onRouterReady and just use window.callPhantom
      if (window._onRouterReady) {
        window._onRouterReady();
        delete window._onRouterReady;
      } else {
        if (currentView) {
          currentView.hide();
        }

        currentView = ensureViewForRoute(views, route);

        currentView.render(data);
      }
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
    // dont specify policies, they are already registered by setting FrontendRouter.policyExecutor
    policies: {},
    controllers: implementation.api.controllers
  });


  return FrontendRouter(opts);
}

function ensureViewForRoute(views, route) {
  const viewName = route.view;

  if (!views[viewName]) {
    const viewOptions = implementation.api.views[viewName];

    // for render server, if this is true, the rendered element is already on the page
    if (window._preRendered) {
      let el = null;

      if (viewOptions.$holder) {
        el = viewOptions.$holder[0];
      } else {
        el = $(`${viewOptions.holder} > ${viewOptions.tag}`);
      }

      viewOptions.el = el;
    }

    viewOptions.name = viewOptions.name || viewName;

    views[viewName] = View(viewOptions);
  }

  return views[viewName];
}

export default Router;