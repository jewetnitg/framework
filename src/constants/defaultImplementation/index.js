/**
 * @author rik
 */
import _ from 'lodash';

const files = require('./**/!(index).js', {
  mode: 'hash'
});

const defaultImplementation = {};

_.each(files, (file, path) => {
  let objPath = path.replace(/\/|\\/g, '.');

  _.set(defaultImplementation, objPath, file);
});

export default defaultImplementation;