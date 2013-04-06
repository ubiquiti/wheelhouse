WORK IN PROGRESS
================

wheelhouse
=======================

![flatiron wheelhouse](http://upload.wikimedia.org/wikipedia/commons/thumb/8/85/SS_'Ewell'_about_to_pass_under_London_Bridge.jpg/270px-SS_'Ewell'_about_to_pass_under_London_Bridge.jpg)

A wheelhouse is a control center for a flatiron boat.

Wheelhouse is a collection of packages that are built on top of the excellent flatiron collection of packages. It's just a bit more opinionated and a bit less you-start-with nothing.

### Things you should like
* Backbone, on the client and the server
* Handlebars
* CouchDB
* Grunt
* The Thames.

## Usage
```js
var flatiron = require('flatiron')
  , app = flatiron.app
app.start(8999)
```

After using the plugin, `Backbone.sync` is overridden to use CouchDB on the server.

## tests

### The grunt way
You must have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed: `sudo npm i -g grunt-cli`
`npm test`

### The Mocha way
`mocha test/specs -ui bdd`
