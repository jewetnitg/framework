import _ from 'lodash';

import implementation from '../constants/implementation';
import communicator from '../singletons/communicator';

import session from '../constants/session';
import View from 'frontend-view';

import FrontendRouter from 'frontend-router';

/**
 * Creates a frontend-router
 *
 * @class Router
 * @author Rik Hoffbauer
 *
 * @returns {FrontendRouter} frontend-router instance
 *
 * @todo validate properties
 * @todo call staticViews
 */
function Router() {
  FrontendRouter.policyExecutor = communicator.policyExecutor;
  //noinspection JSPotentiallyInvalidConstructorUsage
  FrontendRouter.policyExecutor.requestFactory.prototype.session = session;

  const opts = _.extend({
    views: {},
    policies: {},
    routes: implementation.config.routes,
    controllers: implementation.api.controllers
  }, implementation.config.router, Router.prototype);

  return FrontendRouter(opts);
}

Router.prototype = {

  success(route, data) {
    // for render-server
    if (this.currentView) {
      this.currentView.hide();
    }

    this.currentView = ensureViewForRoute(this.options.views, route);
    this.currentView.render(data);

    renderStaticViews(route.staticViews, data);

    // for render server
    if (window._onRouterReady) {
      window._onRouterReady();
      delete window._onRouterReady;
    }
  },

  sync(route, data) {
    const view = ensureViewForRoute(this.options.views, route);
    view.sync(data);
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
  }

};

function renderStaticViews(staticViews, data = {}) {
  _.each(View.staticViews, (view, name) => {
    if (staticViews && staticViews.indexOf(name) !== -1) {
      view.render(data);
    } else {
      view.hide();
    }
  });
}

function ensureViewForRoute(views, route) {
  const viewName = route.view;

  if (!views[viewName]) {
    const viewOptions = implementation.api.views[viewName];

    // for render server, if this is true, the rendered element is already on the page
    if (window._preRendered) {
      viewOptions.el = viewOptions.$holder
        ? $(`> ${viewOptions.tag}`, viewOptions.$holder)[0]
        : $(`${viewOptions.holder} > ${viewOptions.tag}`)[0];
    }

    viewOptions.name = viewOptions.name || viewName;

    if (viewOptions.static) {
      _.defaults(viewOptions, implementation.config.staticViews);
    } else {
      _.defaults(viewOptions, implementation.config.views);
    }

    views[viewName] = View(viewOptions);
  }

  return views[viewName];
}

export default Router;