/**
 * @author rik
 */
import _ from 'lodash';
import $ from 'jquery';
import riot from 'riot/riot+compiler';

import ViewValidator from '../validators/View';
/**
 * @class View
 *
 * @param options {Object}
 *
 * @property name {String} Name of the View
 * @property holder {String} jQuery selector, refers to the element this view should be appended to
 * @property tag {String} Refers to a riot tag
 */
function View(options = {}) {
  ViewValidator.construct(options);

  const props = {
    tag: {
      value: options.tag
    },
    holder: {
      value: options.holder
    }
  };

  return Object.create(View.prototype, props);
}

/**
 * Riot object the View uses, this should be used to run compiles, mounts etc.
 * @name riot
 * @memberof View
 * @static
 * @type {Object}
 */
View.riot = riot;

View.prototype = {

  /**
   *
   * @returns {HTMLElement|null}
   */
  get el() {
    return this.tagInstance ? this.tagInstance.root : null;
  },

  /**
   *
   * @returns {jQuery|HTMLElement|null}
   */
  get $el() {
    return this.el ? $(this.el) : null;
  },

  /**
   *
   * @returns {jQuery|HTMLElement}
   */
  get $holder() {
    return $(this.holder || this.$holder);
  },

  /**
   *
   */
  hide() {
    this.$el.hide();
  },

  /**
   *
   */
  show() {
    this.$el.show();
  },

  /**
   * Renders the riot tag to the DOM (into the $holder)
   *
   * @method render
   * @memberof View
   * @instance
   *
   * @param data {Object} Data to be made available to the riot tag
   */
  render(data = {}) {
    if (!this.tagInstance) {
      const $el = $(emptyTag(this.tag));
      $el.appendTo(this.$holder);
      this.tagInstance = riot.mount($el[0], this.tag, data)[0];
    } else {
      this.sync(data);
      this.show();
    }
  },

  /**
   * Syncs data to the riot tag
   *
   * @method sync
   * @memberof View
   * @instance
   *
   * @param data {Object} Data for the riot tag, will be extended with the current data
   */
  sync(data = {}) {
    this.tagInstance.update(data);
  },

  /**
   *
   */
  remove() {
    // @todo what do we do with the keepTheParent parameter
    this.tagInstance.unmount();
    this.$el.remove();
  }

};

function emptyTag(tagName) {
  return `<${tagName}></${tagName}>`;
}

export default View;