
var secure = require('./secure')
var lift = require('when/node/function').lift
var request = lift(require('request'))
var config = require('./client-config')

module.exports = function Notifier(app) {
  return function notify(text, url) {
    var data = { app: app, text: text, url: url }
    return request('http://' + config.server + ':' + config.http + '/notify',
      { method: "POST", form: { data: secure.encrypt(data) } })
  }
}


