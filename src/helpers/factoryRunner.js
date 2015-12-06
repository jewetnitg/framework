/**
 * @author rik
 */
import _ from 'lodash';

function factoryRunner(factory, src, dst = src, defaultsObj = {}, overridesObj = {}) {
  _.each(src, (obj, name) => {
    obj.name = obj.name || name;

    if (defaultsObj) {
      _.defaults(obj, defaultsObj);
    }

    if (overridesObj) {
      _.extend(obj, overridesObj);
    }

    dst[obj.name] = factory(obj);
  });
}

export default factoryRunner;