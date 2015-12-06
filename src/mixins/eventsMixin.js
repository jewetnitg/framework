/**
 * @author rik
 */
import events from 'events';

function eventsMixin() {
  const emitter = new events.EventEmitter();

  const mixin = {

    on(event, callback) {
      emitter.on(event, callback);
    },

    once(event, callback) {
      function cb(data) {
        mixin.off(event, cb);
        callback(data);
      }

      //noinspection JSUnusedAssignment
      mixin.on(event, cb);
    },

    trigger(event, data) {
      emitter.emit(event, data);
    },

    off(event, callback) {
      if (callback) {
        emitter.removeListener(event, callback);
      } else {
        emitter.removeAllListeners(event);
      }
    }

  };

  return mixin;
}

export default eventsMixin;