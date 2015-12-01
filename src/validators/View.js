/**
 * @author rik
 */
import $ from 'jquery';
import views from '../singletons/views';

const ViewValidator = {

  construct(options = {}) {
    if (!options.name || typeof options.name !== 'string') {
      throw new Error(`Can't construct view, no name specified`);
    }

    if (views[options.name]) {
      throw new Error(`Can't construct view, view called '${options.name}' already exists`);
    }

    if (!options.tag || typeof options.tag !== 'string') {
      throw new Error(`Can't construct view, no tag specified`);
    }

    if (!(options.holder && typeof options.holder === 'string') && !(options.$holder && options.$holder.length)) {
      throw new Error(`Can't construct view, no holder specified`);
    }

    if (!(options.holder && $(options.holder).length) && !(options.$holder && options.$holder.length)) {
      throw new Error(`Can't construct view, holder not found in DOM`);
    }
  }

};

export default ViewValidator;