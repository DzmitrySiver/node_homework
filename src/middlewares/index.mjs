import cookieParserMiddleware from './cookieParser'
import jsonParserMiddleware from './jsonParser'
import customMiddleware from './customMiddleware'
import passportMiddleware from './passport'
import bodyParser from './bodyParser'

function middleware (app) {
  app.use(cookieParserMiddleware)
  app.use(jsonParserMiddleware)
  app.use(customMiddleware)
  passportMiddleware(app)
  bodyParser(app)
}

export default middleware
