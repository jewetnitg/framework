/**
 * @author rik
 */
import _ from 'lodash';

function FactoryFactory(opts) {
  opts.defaults = opts.defaults || {};
  opts.factories = opts.factories || [];

  return function factory(options) {
    options = _.merge({}, opts.defaults, options);
    _.each(opts.factories, (factory) => {
      const argumentCount = factory.length - 1;
      const _factory = factory[argumentCount];
      const argumentPaths = argumentCount ? factory.slice(0, argumentCount) : [];
      const args = _.map(argumentPaths, (path) => {
        return _.get(options, path);
      });
      _factory.apply(null, args)
    });
  }
}

export default FactoryFactory;