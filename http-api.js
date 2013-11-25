
var lift = require('when/node/function').lift
var request = lift(require('request'))
var config = require('./config')
var hawk = require('hawk')

module.exports = function api(path, form) {
  return request('http://' + config.server + ':' + config.http + path,
    { method: "POST", json: true, form: form,
      hawk: { credentials: { key: config.key, id: 'pushnot', algorithm: 'sha256' } }
    })
    .spread(function(res, body) {
      if (res.statusCode != 200) throw new Error('Cannot authenticate!')
      return body
    })
}


