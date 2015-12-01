/**
 * @author rik
 */
import ensureFunctionReturnsAPromise from './ensureFunctionReturnsAPromise';
import implementation from '../singletons/implementation';

function ensureController(controller) {
  switch (typeof controller) {
    case 'string':
      return ensureControllerFromPath(controller);
      break;
    case 'function':
      return ensureFunctionReturnsAPromise(controller);
      break;
    default:
      return () => {
        return Promise.resolve({});
      };
  }
}


function ensureControllerFromPath(path) {
  const [controllerName, controllerMethodName] = path.split('.');
  const controller = implementation.api.controllers[controllerName];

  if (controller) {
    const controllerMethod = controller[controllerMethodName];

    if (controllerMethod) {
      return ensureFunctionReturnsAPromise(controllerMethod.bind(controller));
    } else {
      throw new Error(`Method '${controllerMethodName}' doesn't exist on Controller '${controllerName}'.`);
    }
  } else {
    throw new Error(`Controller '${controllerName}' doesn't exist.`);
  }
}

export default ensureController;