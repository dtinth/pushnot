
var config = require('./config')
var secure = require('./secure')
var storage = require('./storage')


// express app
var express = require('express')
var app = express()
app.use(express.urlencoded())


// zmq server
var zmq = require('zmq')
var pub = zmq.socket('pub')
pub.bindSync('tcp://0.0.0.0:' + config.zmq)


// initialize the database
storage.latest().otherwise(function() {
  var welcomeMessage = { app: 'pushnot', text: 'Welcome to pushnot! :3' }
  return storage.push(secure.encrypt(welcomeMessage))
    .then(function() {
      console.log('Welcome to pushnot! :)')
    })
})
.otherwise(function() {
  console.error('!!!!! CANNOT INITIALIZE DATABASE !!!!!')
})


// notify all subscribers
function notifyAll() {
  storage.latest().then(function(id) {
    pub.send('latest ' + JSON.stringify({ latest: id }))
  })
  .otherwise(console.error)
}


// authenticate using hawk...
var hawk = require('hawk')

function getCredentials(id, callback) {
  callback(null, { key: config.key, user: 'pushnot', algorithm: 'sha256' })
}

app.use(function(req, res, next) {
  hawk.server.authenticate(req, getCredentials, { }, function(err) {
    if (err) {
      next(err)
    } else {
      next()
    }
  })
})


// return the latest notification message
app.all('/latest', function(req, res, next) {
  storage.latest().then(function(id) {
    res.json({ latest: id })
  })
  .otherwise(next)
})


// return notification messages after specified id
app.all('/after/:id', function(req, res, next) {
  storage.after(req.param('id')).then(function(data) {
    res.json(data)
  })
  .otherwise(next)
})


// send notification
app.post('/notify', function(req, res, next) {
  storage.push(req.param('data')).then(function(id) {
    console.log(id, req.param('data'))
    notifyAll()
    pub.send('latest ' + JSON.stringify({ latest: id }))
    res.json('k')
  })
  .otherwise(console.error)
})


app.listen(config.http)
setInterval(notifyAll, 15000)

