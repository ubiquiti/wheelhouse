'use strict';
var path = require('path')
  // , _ = require('lodash')
  , flatiron = require('flatiron')
  , app = flatiron.app
  , pkg = require('../package.json')
  , handlebarsPlugin = require('wheelhouse-handlebars')
  , _base = path.resolve(__dirname, '../')
  , db = require('wheelhouse-couch')
  , routerPlugin = require('wheelhouse-router')

// add all relevant plugins
app.config.file(path.join(_base, 'config/' + app.env + '.json'))
app.use(flatiron.plugins.http, {})
app.use(handlebarsPlugin, {
  templates: path.join(_base, app.config.get('paths').templates)
})
app.use(db, {
  getId: function(model){
    return model.url().replace('/api/', '')
  }
  , getCollectionName: function(collection){
    return collection.url.replace('/api/', '')
  }
})
app.use(routerPlugin, {
  base: __dirname
  , mutualRoutes: 'routes.json'
  , serverRoutes: 'routesServer.json'
  , collections: 'collections'
  , controllers: 'controllers'
  , render: app.render
  , err404: 'err/404'
})


app.use(flatiron.plugins.static, {
  url: 'assets'
  , dir: path.join(_base, 'assets')
  , cache: app.env !== 'development'
})

app.start(app.config.get('port'), function(err) {
  if(err) throw err
  app.log.info('      name :', pkg.name);
  app.log.info('   version :', pkg.version);
  app.log.info('started at :', Date());
  app.log.info('   on port :', app.config.get('port'));
  app.log.info('   in mode :', app.env);
})

