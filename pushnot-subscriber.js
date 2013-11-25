
var config = require('./config')
var secure = require('./secure')
var api = require('./http-api')
var log = console.log
log = function() {}

var when = require('when')
var lift = require('when/node/function').lift

var levelup = require('level')

var zmq = require('zmq')
var sub

var db = levelup(process.env.HOME + '/.pushnot.sub.db')
var put = lift(db.put.bind(db))
var get = lift(db.get.bind(db))

// connect to zmq publisher, reconnecting every 30 seconds of inactivity
function connect() {
  var timeout = null
  establishTimeout()
  try {
    if (sub) {
      sub.close()
    }
    sub = zmq.socket('sub')
    sub.connect('tcp://' + config.server + ':' + config.zmq)
    sub.subscribe('latest')
    sub.on('message', function(msg) {
      clearTimeout(timeout)
      establishTimeout()
      when(msg)
        .then(function(data) { return data.toString('utf-8').substr(7) })
        .then(JSON.parse)
        .then(gotLatest)
      .otherwise(console.error)
    })
  } catch (e) {
    console.error(e)
  }
  function establishTimeout() {
    timeout = setTimeout(function() {
      console.log(new Date(), 'connection lost to server')
      connect()
    }, 30000)
  }
}

connect()

// get the latest notification id
function getLocalLatest() {
  return get('l-latest')
    .otherwise(function() {
      return api('/latest').then(function(result) { return result.latest })
        .tap(function(id) { put('l-latest', id) })
    })
}

var working = false
var processLatest = '0'

function gotLatest(info) {
  if (working) return
  working = true
  var serverLatest = info.latest
  getLocalLatest().then(function(localLatest) {
    console.log(localLatest, '-->', serverLatest)
    if (serverLatest > localLatest) {
      log('new data')
      return notifyFrom(localLatest, serverLatest)
        .then(function() { return put('l-latest', serverLatest) })
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
var growl = require('growl')

function notifyFrom(localLatest, serverLatest) {
  return api('/after/' + localLatest)
    .then(function(data) {
      var z = zephyros.api().then()
      data.forEach(function(message) {
        var text, app = 'unknown app', description = ''
        if (message.key < localLatest) return
        if (message.key > serverLatest) return
        if (message.key <= processLatest) return
        processLatest = message.key
        try {
          var result = secure.decrypt(message.value)
          description = result.text
          app = result.app
          text = '[' + app + '] ' + description
        } catch (e) {
          description = text = 'Unable to decrypt message ' + message.key
        }
        growl(description, { name: 'pushnot', title: app })
        z = z.alert({ message: text, duration: 5 })
      })
    })
}

api('/latest')
  .then(gotLatest)
  .otherwise(console.error)


