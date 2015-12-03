/**
 * @author rik
 */
import index from './index';

const globalName = 'Framework';

if (typeof window.define == 'function' && window.define.amd) {
  window.define(globalName, function () {
    return index;
  });
} else {
  window[globalName] = index;
}

export default index;