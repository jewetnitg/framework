/**
 * @author rik
 */
import Model from 'frontend-model';

const ModelController = {

  get collection() {
    return this.model && Model.models[this.model];
  },

  list(req) {
    const _model = Model.models[req.route.model];

    return _model.fetch()
      .then(() => {
        _model.listenTo('change', () => {
          req.sync({
            collection: _model.data
          });
        });

        req.destruct = () => {
          // stop listeners etc.
        };

        return {
          collection: _model.data
        };
      });
  },

  details(req) {
    const _model = Model.models[req.route.model];
    const id = req.param('id') || req.param(_model.idKey);

    return _model.fetch(id)
      .then((model) => {
        _model.listenTo(model, 'change', () => {
          req.sync({
            model: _model.byId[id]
          });
        });

        req.destruct = () => {
          // stop listeners etc.
        };

        return {
          model
        }
      });
  }

};

export default ModelController;