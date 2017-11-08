import fs from 'fs'
import path from 'path'
import util from 'util'

import parseCsv from 'csv-parse/lib/sync'
import fsWriteStreamAtomic from 'fs-write-stream-atomic'
import glob from 'glob'
import merge2 from 'merge2'
import pEvent from 'p-event'
import pTry from 'p-try'
import pump from 'pump'
import request from 'request'
import through2 from 'through2'
import winston from 'winston'
import yargs from 'yargs'

const pGlob = (pattern, options) => pEvent(new glob.Glob(pattern, options), 'end')
const pPump = util.promisify(pump)

const CLI_ENV_PREFIX = 'ST'
const CLI_CONFIG_FILE = 'streams.json'
const BUNDLE_EXTERNAL_CSS_URL = 'https://www.epam.com/etc/clientlibs/foundation/main.min.fc69c13add6eae57cd247a91c7e26a15.css'
const BUNDLE_CSS = 'bundle.css'
const ENCODING = 'utf8'

// logging

const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly'
]
const LOG_DEFAULT_LEVEL = 'error'

export const logger = winston.createLogger({
  level: LOG_DEFAULT_LEVEL,
  transports: [
    new winston.transports.Console()
  ]
})

// Stream transformers

function upperCase () {
  function write (chunk, enc, next) {
    const res = chunk.toString().toUpperCase()

    next(null, res)
  }

  return through2(write)
}

function csvToJson () {
  let buf = Buffer.alloc(0)

  function write (chunk, enc, next) {
    buf = Buffer.concat([buf, Buffer.from(chunk)])
    next()
  }

  function end (done) {
    const data = parseCsv(buf)
    const json = JSON.stringify(data)

    done(null, json)
  }

  return through2(write, end)
}

// Actions

// task 4
async function inputOutput (filePath) {
  logger.info(`inputOutput()`)

  const src = fs.createReadStream(filePath, {
    encoding: ENCODING
  })
  const dest = process.stdout

  return pPump(src, dest)
}

// task 5
async function transform () {
  logger.info(`transform()`)

  const src = process.stdin
  const dest = process.stdout

  return pPump(src, upperCase(), dest)
}

// task 6,7
function replaceExtension (filename, extname) {
  return filename.slice(0, filename.length - path.extname(filename).length) + extname
}

async function transformFile (filePath) {
  logger.info(`transformFile(%j)`, filePath)

  const destFilename = replaceExtension(filePath, '.json')

  logger.debug(`Reading CSV data from %j `, filePath)
  const src = fs.createReadStream(filePath)

  logger.debug(`Writing JSON data to %j`, destFilename)
  const dest = fsWriteStreamAtomic(destFilename)
  // const dest = process.stdout

  return pPump(src, csvToJson(), dest)
}

// task 8
function createReadableStream (asset) {
  return asset.startsWith('http') ? request.get(asset) : fs.createReadStream(asset)
}

function concatenateStreams (readables) {
  // FIXME: merge2 doesn't lift up errors to the result stream
  return readables.reduce((merged, stream) => merged.add(stream), merge2())
}

async function concatCss (pathname) {
  logger.info(`concatCss(%j)`, pathname)

  const assetsPattern = path.join(pathname, '*.css')
  const destFilename = path.join(pathname, BUNDLE_CSS)

  logger.debug(`Searching the %j for asset files`, assetsPattern)

  const assets = (await pGlob(assetsPattern))
    .filter((filename) => !filename.endsWith(BUNDLE_CSS))
    .sort()

  assets.push(BUNDLE_EXTERNAL_CSS_URL)

  logger.debug(`Assets to concatenate: %j`, assets)
  const src = concatenateStreams(assets.map(createReadableStream))

  logger.debug(`Writing assets to %j`, destFilename)
  const dest = fsWriteStreamAtomic(destFilename)

  return pPump(src, dest)
}

// CLI

export class Cli {
  constructor () {
    this.logger = logger
    this.argv = null
    this.command = null
  }

  start () {
    this.parseArguments()
    this.configureLogger()
    this.logger.info('The application has beeen started')
    this.runCommand()
  }

  parseArguments () {
    const argParser = yargs
      .usage('Usage $0 <command> [options]')
      .help('help')
      .alias('help', 'h')
      .version()
      .config('config', 'Path to config file', this.loadConfigFile.bind(this))
      .alias('config', 'c')
      .default('config', CLI_CONFIG_FILE)
      .env(CLI_ENV_PREFIX)
      .option('log-level', {
        describe: 'log level',
        type: 'string',
        choices: LOG_LEVELS,
        default: LOG_DEFAULT_LEVEL
      })
      .command({
        command: 'transform',
        description: 'converts data from the STDIN to upper-case on STDOUT',
        handler: this.useHandler((argv) => transform())
      })
      .command({
        command: 'io',
        description: 'pipes data from the file to STDOUT',
        builder: (yargs) => yargs
          .option('file', {
            alias: 'f',
            describe: 'filename',
            demandOption: true,
            requiresArg: true,
            type: 'string'
          }),
        handler: this.useHandler((argv) => inputOutput(argv.file))
      })
      .command({
        command: 'transform-file',
        description: 'converts CSV to JSON',
        builder: (yargs) => yargs
          .option('file', {
            alias: 'f',
            describe: 'filename',
            demandOption: true,
            requiresArg: true,
            type: 'string'
          }),
        handler: this.useHandler((argv) => transformFile(argv.file))
      })
      .command({
        command: 'concat-css',
        description: 'concatenates CSS files',
        builder: (yargs) => yargs
          .option('path', {
            alias: 'p',
            describe: 'path to assets directory',
            demandOption: true,
            requiresArg: true,
            type: 'string'
          }),
        handler: this.useHandler((argv) => concatCss(argv.path))
      })
      .demandCommand()

    this.argv = argParser.argv
  }

  configureLogger () {
    const consoleLogFormat = winston.format.combine(
      winston.format.colorize({
        all: true
      }),
      // interploate placeholders in the message
      winston.format.splat(),
      winston.format.printf((msg) => `${msg.level}: ${msg.message}`)
    )

    logger.configure({
      level: this.argv.logLevel,
      transports: [
        new winston.transports.Console({
          name: 'console',
          format: consoleLogFormat,
          handleExceptions: true,
          level: this.argv.logLevel
        })
      ]
    })
  }

  loadConfigFile (configPath) {
    try {
      return JSON.parse(fs.readFileSync(configPath, ENCODING))
    } catch (e) {
      return {}
    }
  }

  // defer the command handler execution
  useHandler (handler) {
    return (argv) => {
      this.command = () => handler(argv)
    }
  }

  async runCommand () {
    return pTry(this.command)
      .then(() => this.onExit())
      .catch((err) => this.onError(err))
  }

  onExit () {
    this.logger.info('OK')
    process.exit(0)
  }

  onError (err) {
    this.logger.error(err.toString())
    this.logger.info('Failed')
    process.exit(err.exitCode || 1)
  }
}
