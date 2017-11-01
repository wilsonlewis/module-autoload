#!/usr/bin/env node
'use strict'

var fs = require('fs')
var posix = require('path').posix
var modulesPath = posix.resolve(process.cwd(), 'node_modules')

var modules = fs.readdirSync(modulesPath)
var packages = []

function install(path) {
  if (!fs.existsSync(path)) {
    return
  }

  var config = require(path)

  if (config.autoload) {
    packages.push(config)
  }
}

function each(arr, callback) {
  for (var index in arr) {
    callback(arr[index], index, arr)
  }
}

install(posix.resolve(process.cwd(), 'package.json'))

for (var index in modules) {
  install(posix.resolve(modulesPath, modules[index], 'package.json'))
}

var loaderName =
  'autoload-' +
  Math.random()
    .toString()
    .slice(2)

var loaderPath = '.' + posix.sep + loaderName + '.js'

fs.writeFileSync(
  posix.resolve(modulesPath, 'module-autoload', 'installed.json'),
  JSON.stringify(packages, null, '\t')
)

var aliases = []

each(packages, function(config) {
  each(config.autoload.alias || {}, function(path, alias) {
    aliases.push(
      '  "' +
        alias +
        '": "' +
        posix.resolve(modulesPath, config.name, path) +
        '"'
    )
  })
})

fs.writeFileSync(
  posix.resolve(modulesPath, 'module-autoload', 'aliases.js'),
  'module.exports = {\n' + aliases.join(',\n') + '\n};'
)

var files = ''

each(packages, function(config) {
  each(config.autoload.files || {}, function(file) {
    files +=
      'require("' + posix.resolve(modulesPath, config.name, file) + '");\n'
  })
})

fs.writeFileSync(
  posix.resolve(modulesPath, 'module-autoload', 'files.js'),
  files
)
