#!/usr/bin/env node

const loader = require('@std/esm')(module)

const streams = loader('./streams')
const cli = new streams.Cli()

module.exports = cli

if (!require.parents) {
  cli.start()
}
