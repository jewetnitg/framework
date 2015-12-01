/**
 * @author rik
 */
const ControllerRequestValidator = {

  construct(options = {}) {
    if (!options.route) {
      throw new Error(`Can't construct ControllerRequest, route not provided`);
    }
  }

};

export default ControllerRequestValidator;