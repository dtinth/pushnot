
var express = require('express')
var app = express()
var storage = require('./storage')
var zmq = require('zmq')
var pub = zmq.socket('pub')

pub.bindSync('tcp://0.0.0.0:60002')
app.use(express.urlencoded())

function notifyAll() {
  storage.latest().then(function(id) {
    pub.send('latest ' + JSON.stringify({ latest: id }))
  })
  .otherwise(console.error)
}

app.all('/latest', function(req, res, next) {
  storage.latest().then(function(id) {
    res.json({ latest: id })
  })
  .otherwise(next)
})

app.all('/after/:id', function(req, res, next) {
  storage.after(req.param('id')).then(function(data) {
    res.json(data)
  })
  .otherwise(next)
})

app.post('/notify', function(req, res, next) {
  storage.push(req.param('data')).then(function(id) {
    console.log(id, req.param('data'))
    notifyAll()
    pub.send('latest ' + JSON.stringify({ latest: id }))
    res.json('k')
  })
  .otherwise(console.error)
})

app.listen(60001)
setInterval(notifyAll, 15000)

