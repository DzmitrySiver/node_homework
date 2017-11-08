import express from 'express'
import controller from '../controllers'
import { checkToken } from './auth'
const router = express.Router()

router.get('/', (controller.start))

router.get('/products/:id', checkToken, controller.getProductById)

router.get('/products', checkToken, controller.getProducts)

router.get('/products/:id/reviews', checkToken, controller.getReviews)

router.post('/products', checkToken, controller.addProduct)

router.get('/users', checkToken, controller.getUsers)

export default router
