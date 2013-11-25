
var secure = require('../secure')
var expect = require('chai').expect

describe('secure', function() {
  
  it('should be able to encrypt and decrypt objects', function() {
    var data = {
          hello: 1,
          world: [ "this", "is", { "a": "string" } ],
          poweredBy: "https://github.com/Obvious/ursa",
          message: "The encryption library works successfully, I hope."
        }
    var what = secure.encrypt(data)
    var result = secure.decrypt(what)
    expect(result).to.deep.equal(data)
  })


})
