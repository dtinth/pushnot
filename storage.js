
var levelup = require('level')
var generateID = require('./gen-id')
var lift = require('when/node/function').lift
var when = require('when')

var db = levelup(process.env.HOME + '/.pushnot.db')
var put = lift(db.put.bind(db))
var get = lift(db.get.bind(db))

exports.push = function(data) {
  var id = generateID()
  return put('d-' + id, data)
    .then(function() { return put('m-latest', id) })
    .then(function() { return id })
}

exports.latest = function() {
  return get('m-latest')
}

exports.get = function(id) {
  return get('d-' + id)
}

exports.after = function(id) {
  return when.promise(function(resolve, reject) {
    var stream = db.createReadStream({
      start:  'd-' + id,
      end:    'e'
    })
    var out = []
    stream.on('data', function(c) {
      out.push({ key: c.key.substr(2), value: c.value })
    })
    stream.on('end', function() {
      resolve(out)
    })
    stream.on('error', function(err) {
      reject(err)
    })
  })
}


