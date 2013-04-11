'use strict';
(function(){
  var $ = window.$ = require('../components/jquery/jquery.js')
    , Backbone = window.Backbone = require('backbone')
    , Router = require('./router.js')
    , _ = window._ = require('lodash')

  // patch lodash for underscore compatibility; needed for backbone-relational
  _.findWhere = _.first

  window.A = {
    Views: {}
    , Templates: {}
    , Collections: {}
    , Models: {}
    , Datas: {}
    , Renders: {}
    , Router: new Router({
      routesJSON: require('../../app/routes.json')
      // , collections: '../../app/collections/'
      // , views: '../../app/views/'
      // , controllers: '../../app/controllers/'
    })
    , View: require('./overrides/view.js')
    , Model: require('./overrides/model.js')
    , $container: $('#main')
    , init: function(){
      if (Backbone.history.start({pushState: true})) A.Router.started = true
    }
  }


  A.init()
})()

