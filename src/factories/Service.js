/**
 * @author rik
 */
import _ from 'lodash';
import Model from 'frontend-model';

function Service(options = {}) {
  const service = Object.create(Service.prototype);

  _.extend(service, options);

  // bind the context for all methods provided
  _.bindAll(service, _.methods(options));

  return service;
}

Service.prototype = {

  get collection() {
    return this.model && Model.models[this.model];
  }

};

export default Service;