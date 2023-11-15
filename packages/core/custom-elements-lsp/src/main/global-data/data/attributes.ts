import { GlobalAttrType } from '../global-data.types';

// Misc
export const GLOBAL_ATTR: { [x in string]: GlobalAttrType } = {
  accesskey: 'string',
  autocapitalize: 'string',
  autofocus: 'boolean',
  class: 'string',
  contenteditable: 'string',
  contextmenu: 'string',
  'data-*': 'wildcard',
  dir: 'string',
  draggable: 'string',
  enterkeyhint: 'string',
  exportparts: 'string',
  hidden: 'string', // string to allow you to set hidden="until-found"
  id: 'string',
  inert: 'boolean',
  inputmode: 'string',
  is: 'string',
  itemid: 'string',
  itemprop: 'string',
  itemref: 'string',
  itemscope: 'string',
  itemtype: 'string',
  lang: 'string',
  nonce: 'string',
  part: 'string',
  popover: 'string',
  slot: 'string',
  spellcheck: 'string',
  style: 'string',
  tabindex: 'string',
  title: 'string',
  translate: 'string',
  virtualkeyboardpolicy: 'string',
};