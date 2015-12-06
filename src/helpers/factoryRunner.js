/**
 * @author rik
 */
import _ from 'lodash';

function factoryRunner(factory, src, dst = src, defaultsObj) {
  _.each(src, (obj, name) => {
    obj.name = obj.name || name;

    if (defaultsObj) {
      _.defaults(obj, defaultsObj);
    }

    dst[obj.name] = factory(obj);
  });
}

export default factoryRunner;