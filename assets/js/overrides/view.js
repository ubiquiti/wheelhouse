'use strict';
var Backbone = require('backbone')
  , _ = require('lodash')


module.exports = Backbone.View.extend({
  views: {}
  , children: {}
  , _rendered: false
  // override default configure
  , _configure: function(options) {
    // 'parent' is added
    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events', 'parent']
    if (this.options) options = _.extend({}, _.result(this, 'options'), options)
    _.extend(this, _.pick(options, viewOptions))
    this.options = options
  }
  , render: function(){
    var data = this.model
      ? this.model.toJSON()
      : this.collection
        ? this.collection.toJSON()
        : {}

    this.$el.html(this.template(data))
    this.delegateEvents(this.events)

    this.renderViews()

    this._rendered = true
    return this
  }
  , renderViews: function(){
    _.each(this.views, function(opts, name){
      this.renderView(name)
    }, this)
  }
  , renderView: function(name, opts){
    var View = A.Views[name] = require('views/' + name)
      , options = _.defaults(opts || {}, this.views[name], {
        parent: this
        , collection: this.collection
        , model: this.model
      })
      , view

    if (options.el) options.el = this.$(options.el)

    view = this.children[name] = new View(options)
    return view.render()
  }
  , removeInner: function(){
    this.$el.html('')
    this.stopListening()
    return this
  }
  // TODO: abstract out the item view, the collection container, and the itemView options
  , addOne: function(model){
    var view
      , active = model.get('slug') === this.options.slug

    A.Views['wisps/resultsListItem'] = A.Views['wisps/resultsListItem'] || require('views/wisps/resultsListItem')

    view = new A.Views['wisps/resultsListItem']({model: model, collection: this.collection, parent: this, active: active})
    this.children.push(view)
    return view
  }
  , addAll: function(collection){
    var list = this.$('ul')
      , lis = document.createDocumentFragment()

    collection = collection || this.collection

    // unbind all the events from children
    _.each(this.children, function(child){
      child.stopListening()
    })
    // remove all the children
    this.children = []
    // render the children
    collection.each(function(model){
      lis.appendChild(this.addOne(model).render().el)
    }, this)
    // clear the HTML and add our fragment
    list.html('')[0].appendChild(lis)
  }

})
