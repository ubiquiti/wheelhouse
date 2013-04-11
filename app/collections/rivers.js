'use strict';
var Backbone = require('backbone')
  , model = require('../models/river')

module.exports = Backbone.Collection.extend({
  url: '/api/rivers'
  , model: model

})
