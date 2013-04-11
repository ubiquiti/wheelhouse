'use strict';
var Collection = require(process.cwd() + '/app/collections/rivers')
  , collection = new Collection()
  , _ = require('lodash')
  , app
  _.str = require('underscore.string')

module.exports = {
  get: function(id){
    var self = this

    collection.fetch({success: function(){
      var forJSON = id ? collection.get(decodeURIComponent(id)) : collection

      if (!forJSON) {
        self.res.writeHead(404, { 'Content-Type': 'application/json' })
        self.res.json({message: 'Not found.', code: 404})
      }

      self.res.json(collection.toJSON())
    }})
  }

  , post: function(){
    var self = this
      , json = _.extend({slug: _.str.slugify(this.req.body.name)}, this.req.body)

    collection.create(json, {
      error: function(model, res){
        app.log.error(res)
      }
      , success: function(model){
        self.res.json({_rev: model.get('_rev'), _id: model.id, slug: model.get('slug')})
      }
    })
  }

  , put: function(id){
    var self = this
      , json = _.extend(this.req.body, {slug: _.str.slugify(this.req.body.name)})

    collection.fetch({
      error: function(collection, res){
        app.log.error(res)
      }
      , success: function(){
        collection.get(decodeURIComponent(id)).save(json, {
          error: function(model, res){
            app.log.error(res)
          }
          , success: function(model){
            self.res.json({_rev: model.get('_rev'), slug: model.get('slug')})
          }
        })
      }
    })
  }

  , delete: function(id){
    var self = this

    collection.fetch({
      error: function(model, res){
        app.log.error(res)
      }
      , success: function(){
        collection.get(decodeURIComponent(id)).destroy({
          error: function(model, res){
            app.log.error(res)
          }
          , success: function(){
            self.res.end()
          }
        })
       }
    })
  }
}
