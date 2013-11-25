
var config = require('./client-config')
var secure = require('./secure')
var log = console.log

log = function() {}

var when = require('when')
var lift = require('when/node/function').lift
var levelup = require('level')

var zmq = require('zmq')
var sub = zmq.socket('sub')

var request = lift(require('request'))

var db = levelup(process.env.HOME + '/.pushnot.sub.db')
var put = lift(db.put.bind(db))
var get = lift(db.get.bind(db))

sub.connect('tcp://' + config.server + ':' + config.zmq)
sub.subscribe('latest')

function api(path) {
  return request('http://' + config.server + ':' + config.http + path,
    { method: "POST", json: true })
    .spread(function(res, body) { return body })
}

function getLocalLatest() {
  return get('l-latest')
    .otherwise(function() {
      return api('/latest').then(function(result) { return result.latest })
        .tap(function(id) { put('l-latest', id) })
    })
    .otherwise(function() {
      return when('0')
        .tap(function(id) { put('l-latest', id) })
    })
}

var working = false

function gotLatest(info) {
  if (working) return
  working = true
  var serverLatest = info.latest
  getLocalLatest().then(function(localLatest) {
    console.log(localLatest, '-->', serverLatest)
    if (serverLatest > localLatest) {
      notifyFrom(localLatest, serverLatest)
        .then(function() { return put('l-latest', serverLatest) })
      log('new data')
    } else {
      log('already up to date')
    }
  })
  .ensure(function() {
    working = false
  })
  .otherwise(console.error)
}

var zephyros = new (require('node-zephyros'))()

function notifyFrom(localLatest, serverLatest) {
  return api('/after/' + localLatest)
    .then(function(data) {
      var api = zephyros.api().then()
      data.forEach(function(message) {
        var text
        if (message.key <= localLatest) return
        if (message.key > serverLatest) return
        try {
          var result = secure.decrypt(message.value)
          text = '[' + result.app + '] ' + result.text
        } catch (e) {
          text = 'Unable to decrypt message ' + message.key
        }
        api = api.alert({ message: text, duration: 5 })
      })
    })
}

api('/latest')
  .then(gotLatest)
  .otherwise(console.error)

sub.on('message', function(msg) {
  when(msg)
    .then(function(data) { return data.toString('utf-8').substr(7) })
    .then(JSON.parse)
    .then(gotLatest)
  .otherwise(console.error)
})











