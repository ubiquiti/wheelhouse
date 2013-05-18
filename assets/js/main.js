'use strict';
(function(){
  var $ = window.$ = require('../components/jquery/jquery.js')
    // , Backbone = window.Backbone = require('backbone')
    , Router = require('./router.js')
    , _ = window._ = require('lodash')
    , FastClick = require('../components/fastclick/lib/fastclick')



  // patch lodash for underscore compatibility; needed for backbone-relational
  _.findWhere = _.first

  window.A = _.extend((window.A || {}), {
    View: require('./overrides/view.js')
    , Model: require('./overrides/model.js')
    , $container: $('#main')
  })

  window.A.Router = new Router({
    routesJSON: require('../../app/routes.json')
    , collections: 'collections/'
    , views: 'views/'
    , controllers: 'controllers/'
    , app: window.A
    , pushState: true
  })

  window.A.Router.on('route', function(router, route){
    console.log(route)
  })


  ;new FastClick(document.body)

})()

