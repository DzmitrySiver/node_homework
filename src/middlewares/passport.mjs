import { users } from '../db'

import passport from 'passport'

import Strategy from 'passport-local'

passport.use(new Strategy(
  function (username, password, cb) {
    let user = users.find((_user) => {
      return username === _user.username
    })

    if (user && user.password === password) {
      return cb(null, user)
    } else {
      return cb(null, false)
    }
  })
)

passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function (id, cb) {
  findById(id, function (err, user) {
    if (err) { return cb(err) }
    cb(null, user)
  })
})

function findById (id, cb) {
  process.nextTick(function () {
    var idx = id - 1
    if (users[idx]) {
      cb(null, users[idx])
    } else {
      cb(new Error('User ' + id + ' does not exist'))
    }
  })
}

const passportMiddleware = function (app) {
  app.use(passport.initialize())
}

export default passportMiddleware
