module.exports = function(grunt){
  'use strict';
  var path = require('path')
    , fs = require('fs')
    , folderMount = function folderMount(connect, point) {
      return connect.static(path.resolve(point))
    }
    , gitMasterBranch = 'master'

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    , config: grunt.file.readJSON('config/development.json')
    , meta: {
      version: '<%= pkg.version %>'
      , banner: '/*! <%= pkg.name %> - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n'
    }
    , jshint: {
      all: [
        'Gruntfile.js'
        , 'index.js'
        , 'app/**/*.js'
        , 'testServer/**/*.js'
        , '<%= watch.clientJs.files %>'
        , '!<%= handlebars.compile.files[0].dest %>/**'
      ]
      , options: {
        jshintrc: '.jshintrc'
      }
    }
    , less: {
      dev: {
        options: {
          dumpLineNumbers: 'all'
        }
        , files: {
          'assets/css/main.css': 'assets/less/main.less'
        }
      }
      , production: {
        options: {
          dumpLineNumbers: false
          , compress: true
        }
        , files: '<%= less.dev.files %>'
      }
    }
    , browserify2: {
      dev: {
        entry: './assets/js/main.js'
        , debug: true
        , compile: './assets/_js/main.js'
        , expose: {
          files: [
          {
            cwd: './assets/js/'
            , src: ['**/*.js']
          }
          , {
            cwd: './app/collections/'
            , src: ['**/*.js']
          }
          , {
            cwd: './app/controllers/'
            , src: ['**/*.js']
          }
          , {
            cwd: './app/models/'
            , src: ['**/*.js']
          }
          , {
            cwd: './app/views/'
            , src: ['**/*.js', '!**/_*.js']
            , expand: true
            , rename: function(dest, src){
              console.log(dest, src)
            }
          }
        ]}
        , beforeHook: function(bundle){
          var shim = require('browserify-shim')

          // make files nicer to require
          // anything in the JS dir
          // grunt.file.recurse('./assets/js/', function(abspath){
          //   if (/\.js$/.test(abspath)) bundle.require(require.resolve(path.join(__dirname, abspath)), {expose: abspath.replace('assets/js/', '').replace('.js', '').replace('_', '')})
          // })
          // templates can be accessed via `templates/**`
          grunt.file.recurse('./assets/_js/templates/', function(abspath){
            if (/\.js$/.test(abspath)) bundle.require(require.resolve(path.join(__dirname, abspath)), {expose: abspath.replace('assets/_js/', '').replace('.js', '')})
          })
          // controllers can be fetched via `controllers/**`
          // also, collections and models
          grunt.util._.each(['collections', 'controllers', 'models'], function(dir){
            grunt.file.recurse('./app/' + dir, function(abspath){
              if (abspath.indexOf('api/') === -1 && /\.js$/.test(abspath)) bundle.require(require.resolve(path.join(__dirname, abspath)), {expose: abspath.replace('app/', '').replace('.js', '')})
            })
          })
          // views
          // remove underscores from the front, so that partials are nicer to require
          grunt.file.recurse('./app/views/', function(abspath){
            if (/\.js$/.test(abspath)) bundle.require(require.resolve(path.join(__dirname, abspath)), {expose: abspath.replace('app/', '').replace('.js', '').replace('/_', '/')})
          })
          // handlebars helpers built into wheelhouse-handlebars fetched via `helpers/**`
          grunt.file.recurse('./node_modules/wheelhouse-handlebars/lib/helpers/', function(abspath){
            if (/\.js$/.test(abspath)) bundle.require(require.resolve(path.join(__dirname, abspath)), {expose: abspath.replace('node_modules/wheelhouse-handlebars/lib/', '').replace('.js', '')})
          })

          // we need to shim some libraries to get things playing nicely
          shim(bundle, {
            // jquery isn't commonJS compatible at all
            jquery: {path: './assets/components/jquery/jquery.js', exports: '$'}
            , handlebars: {path: './assets/components/handlebars/handlebars.runtime.js', exports: 'Handlebars'}
          })
            // make up for using bower instead of npm
            // replace underscore with lodash
            .require(require.resolve('./assets/components/lodash/dist/lodash.js'), {expose: 'underscore'})
            .require(require.resolve('./assets/components/jquery/jquery.js'), {expose: 'jquery'})
            .require(require.resolve('./assets/components/handlebars/handlebars.runtime.js'), {expose: 'handlebars'})
        }
      }
    }
    , uglify: {
      production: {
        options: {
          report: 'min'
        }
        , files: {
          'assets/_js/main.js': 'assets/_js/main.js'
        }
      }
    }
    , bump: {
      patch: {
        options: {
          part: 'patch'
        }
        , src: [
          'package.json'
          , 'component.json'
        ]
      }
      , minor: {
        options: {
          part: 'minor'
        }
        , src: '<%= bump.patch.src %>'
      }
      , major: {
        options: {
          part: 'major'
        }
        , src: '<%= bump.patch.src %>'
      }
    }
    , watch: {
      options: {
        livereload: true
      }
      , less: {
        files: ['assets/less/**/*.less']
        , tasks: ['less:dev']
      }
      , serverJs: {
        files: ['index.js', 'app/**/*.js']
        , tasks: ['jshint', 'browserify2']
      }
      , clientJs: {
        files: '<%= config.assets.js %>/**/*.js'
        , tasks: ['jshint', 'browserify2']
      }
      , handlebars: {
        files: ['<%= handlebars.compile.files[0].cwd %><%= handlebars.compile.files[0].src[0] %>', 'app/handlebars/*.js']
        , tasks: ['clean:handlebars', 'handlebars', 'browserify2']
      }
      , testServer: {
        files: '<%= simplemocha.all.src %>'
        , tasks: ['simplemocha']
      }
      , testClient: {
        files: ['testClient/**/*.js']
        , tasks: ['mocha']
      }
    }
    , connect: {
      docs: {
        options: {
          port: '<%= config.port + 1 %>'
          , base: './assets/components/bootstrap/docs/_site'
          // , keepalive: true
          , middleware: function(connect, options){
            return [
              // serve .html files
              function(req, res, next){
                if (req.url === '/' || /\.(css|js|ico)$/.test(req.url)) {
                  next()
                }
                else if (fs.existsSync(path.join(__dirname, '/assets/components/bootstrap/docs/_site/', req.url))) {
                  next()
                }
                else if (fs.existsSync(path.join(__dirname, '/assets/components/bootstrap/docs/_site/', req.url) + '.html')) {
                  req.url = req.url + '.html'
                  next()
                }
                else if (fs.existsSync(path.join(__dirname, '/assets/components/bootstrap/docs/_site/', req.url, '/index.html'))) {
                  req.url = path.join(req.url, '/index.html')
                  next()
                }
              }
              , connect.static(options.base)
              , connect.directory(options.base)
            ]
          }
        }
      }
      , test: {
        options: {
          port: '<%= config.port + 2 %>'
          // , keepalive: true
          , middleware: function(connect) {
            return [
              folderMount(connect, '.')
              , function(req, res) {
                var Handlebars = require('handlebars')
                  , request = require('request')
                  , specs = []
                  , template

                // TODO: match changed files against specs so that we're sure to only run necessary tests
                // console.log(grunt.regarde.changed)

                // proxy through calls to the api controller so that the test server can get data
                if (req.url.indexOf('/api') > -1) {
                  request('http://localhost:<%= config.port %>' + req.url, function(err, result, body) {
                    if (err) throw err

                    res.end(body)
                  })
                }
                // hardcoded route for the test runner
                else if (req.url === '/js-tests') {
                  grunt.file.recurse('./testClient/specs', function(abspath){
                    if (/\.js$/.test(abspath)) specs.push(abspath)
                  })

                  template = Handlebars.compile(grunt.file.read('testClient/test.hbs'))
                  res.end(template({specs: specs}))
                }
              }
            ]
          }
        }
      }
    }
    , shell: {
      quitLivereload: {
        command: 'pid=$(ps -fe | grep -i \'livereload\' | awk \'{print $2}\'); if [[ -n $pid ]]; then kill $pid; else echo "LiveReload not running"; fi'
      }
      , killallNode: {
        command: 'ps -fe | grep -i \'node\' | grep -v $$ | awk \'{print $2}\' | kill'
      }
      , bootstrapDocs: {
        command: 'command -v jekyll >/dev/null 2>&1 || { echo >&2 "You need to install jekyll"; }; jekyll'
        , options: {
          execOptions: {
            cwd: './assets/components/bootstrap/docs/'
          }
          , stderr: false
          , failOnError: false
        }
      }
      , npmPublish: {
        command: 'npm publish'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
      , npmTest: {
        command: 'npm test'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
      , npmShrinkwrap: {
        command: 'npm shrinkwrap'
        , options: {
          failOnError: true
        }
      }
      , gitRequireCleanTree: {
        command: 'function require_clean_work_tree(){\n' +
          ' # Update the index\n' +
          '    git update-index -q --ignore-submodules --refresh\n' +
          '    err=0\n' +

          ' # Disallow unstaged changes in the working tree\n' +
          '    if ! git diff-files --quiet --ignore-submodules --\n' +
          '    then\n' +
          '        echo >&2 "cannot $1: you have unstaged changes."\n' +
          '        git diff-files --name-status -r --ignore-submodules -- >&2\n' +
          '        err=1\n' +
          '    fi\n' +

          ' # Disallow uncommitted changes in the index\n' +
          '    if ! git diff-index --cached --quiet HEAD --ignore-submodules --\n' +
          '    then\n' +
          '        echo >&2 "cannot $1: your index contains uncommitted changes."\n' +
          '        git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2\n' +
          '        err=1\n' +
          '    fi\n' +

          '    if [ $err = 1 ]\n' +
          '    then\n' +
          '        echo >&2 "Please commit or stash them."\n' +
          '        exit 1\n' +
          '    fi\n' +
          '} \n require_clean_work_tree'
        , options: {
          failOnError: true
        }
      }
      , gitCheckoutMaster: {
        command: 'if [ "`git branch | grep \'\\*\' | sed \'s/^\\* //\'`" != \'' + gitMasterBranch + '\' ]; then git checkout ' + gitMasterBranch + '; fi;'
        , options: {
          failOnError: true
        }
      }
      , gitSyncMaster: {
        command: 'git pull origin ' + gitMasterBranch + ' && git push origin ' + gitMasterBranch
        , options: {
          failOnError: true
        }
      }
      , gitTag: {
        command: 'git tag v<%= grunt.file.readJSON("package.json").version %>'
        , options: {
          failOnError: true
        }
      }
      , gitCommitDeployFiles: {
        command: 'git commit --amend -i package.json npm-shrinkwrap.json component.json --reuse-message HEAD'
        , options: {
          failOnError: true
        }
      }
      , gitPush: {
        command: 'git push origin ' + gitMasterBranch + ' --tags'
        , options: {
          failOnError: true
        }
      }
    }
    , mocha: {
      all: {
        options: {
          run: true
          , urls: ['http://localhost:<%= connect.test.options.port %>/js-tests']
        }
      }
    }
    , simplemocha: {
      options: {
        timeout: 2000
        , ignoreLeaks: true
        // , globals: ['chai']
        , ui: 'bdd'
        // , reporter: 'min'
      }
      , all: {
        src: ['testServer/**/*.js', '!testServer/fixtures/**']
      }
    }
    // this task is failing it's tests right now & not working https://github.com/gruntjs/grunt-contrib-imagemin
    , imagemin: {
      production: {
        options: {
          optimizationLevel: 4
          , progressive: false
        }
        , files: {
          'assets/imgRaw/testing.jpg': 'assets/img/testing.jpg'
        }
      }
    }
    , handlebars: {
      compile: {
        options: {
          node: true
          , namespace: 'A.Templates'
          , partialRegex: /^__/
          , processAST: function(ast) {
            ast.statements.forEach(function(statement, i) {
              if (statement.type === 'partial') {
                ast.statements[i] = {type: 'content', string: ''}
              }
            })
            return ast
          }
          , processName: function(filename){
            return filename
              .replace(grunt.template.process('<%= handlebars.compile.files[0].cwd %>'), '')
              .replace(/\.hbs$/, '')
              .replace('/_', '/')
          }
          // , processPartialName: function(filename){
          //   var fileParts = filename.split('/')
          //     , file = fileParts.pop()
          //       .substr(1)
          //       .replace(/\.hbs$/, '')

          //   fileParts.push(file)

          //   return fileParts
          //     .join('/')
          //     .replace(grunt.template.process('<%= handlebars.compile.files[0].cwd %>'), '')
          // }
        }
        , files: [
          {
            expand: true
            , cwd: grunt.file.readJSON('config/development.json').paths.templates + '/'
            , src: ['**/*.hbs']
            , dest: grunt.file.readJSON('config/development.json').renders.templates + '/'
            , ext: '.js'
            // merge partials into main files
            , rename: function(dest, src){
              var newDest = dest
                , fileParts = src.split('/')
                , filePartsLength = fileParts.length
                , file = fileParts[filePartsLength - 1]
                , ext = grunt.template.process('<%= handlebars.compile.files[0].ext %>')

              // if the file starts with a '_', it's a partial
              // if the file is index.js, should be named for it's parent directory
              // if the file
              if (file[0] === '_' || file === ('index' + ext)) {
                // the file itself is a partial, merge it
                fileParts.pop()
                // if the partial is in an subdirectory named 'index' merge it in with the other index templates
                if (fileParts[filePartsLength - 2] === 'index') fileParts.pop()
                newDest += fileParts.join('/') + ext
              }
              else newDest += fileParts.join('/')

              return newDest
            }
          }
        ]
      }
    }
    , clean: {
      handlebars: ['<%= handlebars.compile.files[0].dest %>']
      , css: ['css']
    }
  })

  grunt.loadNpmTasks('grunt-contrib-handlebars')
  grunt.loadNpmTasks('grunt-contrib-imagemin')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-simple-mocha')
  grunt.loadNpmTasks('grunt-browserify2')
  grunt.loadNpmTasks('grunt-notify')
  grunt.loadNpmTasks('grunt-bumpx')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-mocha')

  // watch events
  ;(function(){
    var changedFiles = {}
      , onChange = grunt.util._.debounce(function() {
      grunt.config(['jshint', 'single'], Object.keys(changedFiles))
      changedFiles = {}
    }, 100)
    grunt.event.on('watch', function(action, filepath) {
      if (/\.js$/.test(filepath)) changedFiles[filepath] = action
      onChange()
    })
  })()

  // setup the tasks
  grunt.registerTask('help', 'Show help', ['default'])
  grunt.registerTask('default', 'Show help', function(){
    var log = grunt.log
      , left = 20
      , right = 60

    log.subhead('Avaliable commands:')
    log.writeln()
    log.writeln(
      log.table([left,right]
      , ['code'.green, 'Watch task. Run this every time you start working.']
    ))
    log.writeln(
      log.table([left,right]
      , ['test'.green, 'Run the tests by themselves.']
    ))
    log.writeln(
      log.table([left,right]
      , ['deploy'.green, 'Deploy to production.']
    ))
  })
  grunt.registerTask('install', ['shell:install'])
  grunt.registerTask('code', [
    'shell:quitLivereload'
    , 'less:dev'
    , 'jshint'
    , 'handlebars'
    , 'browserify2'
    , 'connect:test'
    , 'shell:bootstrapDocs'
    , 'connect:docs'
    , 'watch'
  ])
  grunt.registerTask('test', ['simplemocha', 'connect:test', 'mocha'])
  grunt.registerTask('predeploy', [
    'shell:gitRequireCleanTree'
    , 'shell:gitCheckoutMaster'
    , 'shell:gitRequireCleanTree'
    , 'jshint'
    , 'clean:handlebars'
    , 'clean:css'
    // , 'shell:gitSyncMaster'
    , 'less:production'
    , 'handlebars'
    , 'browserify2'
    , 'uglify'
    , 'shell:killallNode' // necessary to kill the watch tasks which are using ports we need to test
    // , 'connect:test'
    // , 'mocha'
    , 'simplemocha'
    , 'bump:' + (grunt.option('version') || 'patch')
    // , 'shell:npmShrinkwrap'
    , 'shell:gitCommitDeployFiles'
    , 'shell:gitTag'
    // , 'shell:gitPush'
  ])
  grunt.registerTask('postdeploy', ['browserify2', 'less:dev'])
  grunt.registerTask('docs', ['shell:bootstrapDocs', 'connect:docs'])
  // grunt.registerTask('publish', ['shell:gitRequireCleanTree', 'jshint', 'shell:npmTest', 'bump:patch', 'shell:gitCommitPackage', 'shell:gitTag', 'shell:gitPush', 'shell:npmPublish'])
}
