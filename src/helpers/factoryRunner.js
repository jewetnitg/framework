/**
 * @author rik
 */
import _ from 'lodash';

function factoryRunner(factory, src, dst = src, extendObj) {
  _.each(src, (obj, name) => {
    obj.name = obj.name || name;

    if (extendObj) {
      _.extend(obj, extendObj);
    }

    dst[obj.name] = factory(obj);
  });
}

export default factoryRunner;