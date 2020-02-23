'use strict'

var fs = require('fs')
var path = require('path')

function fixture (name, type) {
  var file = path.join(__dirname, 'fixtures', name + '-' + type + '.js')
  var sourceFile = path.join(__dirname, 'src', name + '.js')
  var content = null
  var sourceContent = null

  return {
    name: name,
    type: type,
    file: file,
    sourceFile: sourceFile,
    require: function () {
      return require(file)
    },
    contentSync: function () {
      if (!content) {
        content = fs.readFileSync(file, 'utf8')
      }
      return content
    },
    sourceContentSync: function () {
      if (!sourceContent) {
        sourceContent = fs.readFileSync(sourceFile, 'utf8')
      }
      return sourceContent
    }
  }
}

exports.inline = function (name) {
  return fixture(name, 'inline')
}

exports.mapFile = function (name) {
  return fixture(name, 'map-file')
}

exports.none = function (name) {
  return fixture(name, 'none')
}
