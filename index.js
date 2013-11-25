
var secure = require('./secure')
var api = require('./http-api')

module.exports = function Notifier(app) {
  return function notify(text, url) {
    var data = { app: app, text: text, url: url }
    return api('/notify', { data: secure.encrypt(data) })
  }
}


