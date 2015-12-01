/**
 * @author rik
 */
function allowIfIdIsEven(req) {
  return req.param('id') % 2 === 0 ? Promise.resolve() : Promise.reject();
}

export default allowIfIdIsEven;