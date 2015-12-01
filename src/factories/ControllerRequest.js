/**
 * @author rik
 */
import _ from 'lodash';
import ControllerRequestValidator from '../validators/ControllerRequest';

/**
 * @class ControllerRequest
 * @param options {Object}
 * @property route {Route} frontend-router Route instance,
 * @property {Object} [params={}] Object containing the parameters received from the routes splats
 * @property sync {Function} The sync method serves to be called from inside a {@link Controller} when data has changed.
 */
function ControllerRequest(options = {}) {
  ControllerRequestValidator.construct(options);

  const props = {
    params: {
      value: options.params || {}
    },
    route: {
      value: options.route
    },
    view: {
      value: options.view
    }
  };

  return Object.create(ControllerRequest.prototype, props);
}

ControllerRequest.prototype = {

  /**
   *
   * @param data {Object}
   */
  sync(data = {}) {
    if (this.view) {
      this.view.sync(data);
    }
  },


  /**
   * Gets a parameter by key.
   *
   * @method param
   * @memberof ControllerRequest
   * @instance
   *
   * @param key {String|Number} The key of the param
   *
   * @returns {*}
   * @todo decide if we want to allow a (deep) path like foo.bar
   */
  param(key) {
    return this.params[key];
  }

};

export default ControllerRequest;