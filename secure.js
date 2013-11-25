

var fs = require('fs')
var ursa = require('ursa')

var publicKey, privateKey

function split(buf) {
  var out = []
  var inc = 200
  for (var i = 0; i < buf.length; i += inc) {
    out.push(buf.slice(i, i + inc))
  }
  return out
}

function enc(buf) {
  var key = publicKey || (publicKey = ursa.createPublicKey(fs.readFileSync(process.env.HOME + '/.pushnot.pub')))
  return key.encrypt(buf).toString('base64')
}

function dec(stuff) {
  var key = privateKey || (privateKey = ursa.createPrivateKey(fs.readFileSync(process.env.HOME + '/.pushnot.pem')))
  return key.decrypt(new Buffer(stuff, 'base64'))
}

exports.encrypt = function(stuff) {
  var buf = new Buffer(JSON.stringify(stuff), 'utf-8')
  return split(buf).map(enc).join(':')
}

exports.decrypt = function(stuff) {
  return JSON.parse(Buffer.concat(stuff.split(':').map(dec)))
}

