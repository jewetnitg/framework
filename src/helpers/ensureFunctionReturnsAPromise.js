/**
 * @author rik
 */
function ensureFunctionReturnsAPromise(fn) {
  return (...args) => {
    return Promise.resolve()
      .then(() => {
        return fn.apply(null, args);
      });
  };
}

export default ensureFunctionReturnsAPromise;