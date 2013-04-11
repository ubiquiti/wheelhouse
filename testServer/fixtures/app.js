/*global before, after */
'use strict';
var flatiron = require('flatiron')
  , app = flatiron.app
  , path = require('path')
  , _base = path.join(__dirname, '/../..')
  , dbPlugin = require('wheelhouse-couch')
  , _ = require('lodash')

app.config.file(path.join(_base, 'config/development.json'))
process.env.NODE_ENV = 'test'

require('chai').should()

app.use(flatiron.plugins.http, {})
app.use(dbPlugin, {
  name: app.config.get('database').name + '-test'
  , getId: function(model){
    return model.url().replace('/api/', '')
  }
  , getCollectionName: function(collection){
    return collection.url.replace('/api/', '')
  }
})
app._base = _base

module.exports = app

_.once(function(){
  before(function(done){
    var port = app.config.get('port') + 21
    if (!app.server) app.start(port, done)
    else done()
  })

  after(function(done){
    app.server.close()
    app = undefined
    done()
  })
})
