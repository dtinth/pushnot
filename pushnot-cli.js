#!/usr/bin/env node

require('./')(process.argv[2] + '')(process.argv.slice(3).join(' ')).otherwise(function(error) {
  console.error(error)
  process.exit(1)
})
