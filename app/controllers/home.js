'use strict';

module.exports = {
  index: function(){
    this.render(this, 'home/index', 'rivers', {
      data: function(collection){
        return {products: collection.toJSON()}
      }
    })
  }
}
