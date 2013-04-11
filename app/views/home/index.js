'use strict';
// var _ = require('lodash')
require('templates/home')
require('helpers/eachKeys')

module.exports = A.Views['home/index'] = A.View.extend({
  template: A.Templates['home/index']
  , el: A.$container
  , events: {}
  , initialize: function(){}
})
