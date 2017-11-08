import express from 'express'
import { users } from '../db'
import jwt from 'jsonwebtoken'
import passport from 'passport'

const router = express.Router()

router.post('/standart-auth', function (req, res) {
  const username = req.body.username

  let user = users.find((_user) => {
    return username === _user.username
  })

  if (user && user.password === req.body.password) {
    let payload = { sub: user.id, isActive: user.isActive }
    let token = jwt.sign(payload, 'secret', {expiresIn: 1000000})
    const data = {
      code: 200,
      message: 'OK',
      data: {
        user: {
          email: '',
          username: ''
        }
      },
      token
    }
    res.json(data)
  } else {
    res.status(403).json({
      code: 404,
      message: 'Not Found'
    })
  }
})

router.post('/passport-auth', passport.authenticate('local'), function (req, res) {
  res.json(req.user)
})

export function checkToken (req, res, next) {
  const token = req.headers['x-access-token']

  if (token) {
    jwt.verify(token, 'secret', function (err, decoded) {
      if (err) {
        res.json({success: false, message: 'failed to authenticate token'})
      } else {
        next()
      }
    })
  } else {
    res.status(403).send({success: false, message: 'No token provided'})
  }
}

export default router
