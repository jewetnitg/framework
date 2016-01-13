function Service(options = {}) {
  const service = Object.create(Service.prototype);

  return Object.assign(service, options);
}

Service.prototype = {};

export default Service;