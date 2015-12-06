import _ from 'lodash';
import Model from 'frontend-model';

/**
 * @class Controller
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property model {String} Reference to a name of a model, if specified and valid, this.controller will contain the model instance.
 *
 */
function Controller(options = {}) {
  const controller = Object.create(Controller.prototype);

  _.extend(controller, options);

  // bind the context for all methods provided
  _.bindAll(controller, _.methods(options));

  return controller;
}

Controller.prototype = {

  get collection() {
    return this.model && Model.models[this.model];
  },

  /**
   * Returns a list of all models, if a (valid) model is defined, if not, throws an Error.
   * Returns the models on the collection property on the resolved object.
   *
   * @method list
   * @memberof Controller
   * @instance
   *
   * @param req {ControllerRequest}
   *
   * @returns {Promise<Object>}
   */
  list(req) {
    if (this.collection) {
      return this.collection.fetch()
        .then(() => {
          const listener = this.collection.listenTo('change', () => {
            req.sync({
              collection: this.collection.data
            });
          });

          req.destruct = listener.stop.bind(listener);

          return {
            collection: this.collection.data
          };
        });
    } else {
      throw new Error(`Can't execute Controller#list, Controller has no (valid) model.`);
    }
  },

  /**
   * Returns a single model, if a (valid) model is defined, if not, throws an Error.
   * Returns the model on the model property on the resolved object.
   *
   * @param req {ControllerRequest}
   *
   * @returns {Promise<Object>}
   */
  details(req) {
    if (this.collection) {
      const id = req.param('id') || req.param(this.collection.idKey);

      return this.collection.fetch(id)
        .then((model) => {
          const listener = this.collection.listenTo(model, 'change', () => {
            req.sync(model);
          });

          req.destruct = listener.stop.bind(listener);

          return {
            model
          }
        });
    } else {
      throw new Error(`Can't execute Controller#list, Controller has no (valid) model.`);
    }
  }

};

export default Controller;