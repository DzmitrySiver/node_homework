import express from 'express'
import router from './routes'
import middleware from './middlewares'
import authRouter from './routes/auth'

const app = express()

middleware(app)
app.use('/', router)
app.use('/', authRouter)

export default app
