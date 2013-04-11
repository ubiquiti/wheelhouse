'use strict';
var Backbone = require('backbone')
  , _ = require('lodash')


module.exports = Backbone.View.extend({
  views: {}
  , children: {}
  , _rendered: false
  , render: function(){
    var dataFn = this.options.data || this.data
      , data = typeof dataFn === 'function'
        ? dataFn.call(this, this.collection)
        : this.collection.toJSON()

    this.$el.html(this.template(data))
    this.delegateEvents(this.events)

    _.each(this.views, function(opts, name){
      var options = _.defaults(opts, {
        parent: this
        , collection: this.collection
      })
      if (options.el) options.el = this.$(options.el)

      this.children[name] = (new A.Views[name](options)).render()
    }, this)

    this._rendered = true
    return this
  }
})
