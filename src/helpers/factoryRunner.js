/**
 * @author rik
 */
import _ from 'lodash';

function factoryRunner(factory, src, dst = src) {
  _.each(src, (obj, name) => {
    obj.name = obj.name || name;
    dst[obj.name] = factory(obj);
  });
}

export default factoryRunner;