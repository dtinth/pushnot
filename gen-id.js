
var seq = 0

module.exports = function generateID() {
  var c = '' + new Date().getTime()
  var d = '' + (++seq % 1000)
  while (c.length < 15) c = '0' + c
  while (d.length < 3)  d = '0' + d
  return c + d
}
