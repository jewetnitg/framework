/**
 * @author rik
 */
import factoryRunner from './factoryRunner';

function Factory(options) {
  if (options.before) {
    options.before(options.src, options.dst);
  }

  if (typeof options.factory === 'function') {
    factoryRunner(options.factory, options.src, options.dst, options.defaults, options.override);
  }

  if (options.after) {
    options.after(options.src, options.dst);
  }
}

export default Factory;