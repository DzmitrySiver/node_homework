import bodyParser from 'body-parser'

export default function bodyParserMiddleware (app) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
}
