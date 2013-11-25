#!/usr/bin/env node

require('./')(process.argv[2] + '')(process.argv.slice(3).join(' '))
