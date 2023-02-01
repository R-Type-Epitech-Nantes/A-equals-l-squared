'use strict'

const express = require('express')
const passport = require('passport')
const database = require('./database_init')
const bodyParser = require('body-parser')
const session = require('express-session')
const auth = require('./passport/local')
const auth_token = require('./passport/token')
const auth_google = require('./passport/google')
const auth_facebook = require('./passport/facebook')
const utils = require('./utils')
const gmail = require('./services/gmail/reactions/send_email')
const jwt = require('jwt-simple')
const { hash } = require('./utils')
require('dotenv').config({ path: '../database.env' })

const discord = require('./services/discord/init').client
const onMessage = require('./services/discord/actions/on_message')
const onVoiceChannel = require('./services/discord/actions/on_join_voice_channel')
const onReactionAdd = require('./services/discord/actions/on_reaction_add')
const onMemberJoining = require('./services/discord/actions/on_member_joining')
const getVoiceChannels = require('./services/discord/getters/voice_channels')
const getTextChannels = require('./services/discord/getters/text_channels')
const getAvailableGuilds = require('./services/discord/getters/available_guilds')

const app = express()

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  done(null, { id: id })
})

app.use(bodyParser.json())
app.use(session({ secret: 'SECRET' }))
app.use(passport.initialize())
app.use(passport.session())

const PORT = 8080
const HOST = '0.0.0.0'

/**
 * A basic function to demonstrate the test framework.
 * @param {*} number A basic number
 * @returns The passed number
 */
function test_example (number) {
  return number
}

/**
 * Set the header protocol to authorize Web connection
 */
app.use(function (req, res, next) {
  // Allow access request from any computers
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE,PATCH')
  res.header('Access-Control-Allow-Credentials', true)
  if ('OPTIONS' == req.method) {
    res.sendStatus(200)
  } else {
    next()
  }
})

/**
 * Welcoming path
 */
app.get('/', (req, res) => {
  res.send('Hello World')
})

/**
 * Required subject path, send some usefully data about service
 */
app.get('/about.json', async (req, res) => {
  try {
    const about = {}
    about.client = { host: req.ip }
    about.server = {
      current_time: Date.now(),
      services: []
    }
    about.server.services.push(
      await database.prisma.Service.findMany({
        select: {
          name: true,
          description: true,
          isEnable: true,
          Actions: {
            select: {
              name: true,
              description: true,
              isEnable: true
            }
          },
          Reactions: {
            select: {
              name: true,
              description: true,
              isEnable: true
            }
          }
        }
      })
    )
    res.json(about)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

/**
 * Post request to signup a new user in the database.
 * body.username -> User name
 * body.email -> User mail
 * body.password -> User password
 * An e-mail is now send to the user.
 */
app.post('/api/signup', (req, res, next) => {
  passport.authenticate('signup', { session: false }, (err, user, info) => {
    if (err) throw new Error(err)
    if (user == false) return res.json(info)
    const token = utils.generateToken(user.id)
    gmail
      .sendEmail(
        user.email,
        'Email Verification',
        'Thank you for you registration to our service !\nPlease go to the following link to confirm your mail : http://localhost:8080/api/mail/verification?token=' +
          token
      )
      .catch(_error => {
        return res.status(401).send('Invalid e-mail address.')
      })
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Account created.',
        user,
        token
      },
      statusCode: res.statusCode
    })
  })(req, res, next)
})

/**
 * Post request to login to the website.
 * body.email -> User mail
 * body.password -> User password
 */
app.post('/api/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) throw new Error(err)
    if (user == false) return res.json(info)
    const token = utils.generateToken(user.id)
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Welcome back.',
        user,
        token
      },
      statusCode: res.statusCode
    })
  })(req, res, next)
})

/**
 * Get request use to verify e-mail address with a token
 * Link sent by e-mail
 */
app.get('/api/mail/verification', async (req, res) => {
  const token = req.query.token
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET)
    const user = await database.prisma.User.findUnique({
      where: {
        id: decoded.id
      }
    })
    await database.prisma.User.update({
      where: {
        id: decoded.id
      },
      data: {
        mailVerification: true
      }
    })
    res.send(
      'Email now successfully verified !\nYou can go back to login page.'
    )
  } catch (err) {
    console.error(err.message)
    res.status(401).send('No matching user found.')
  }
})

/**
 * Get request to confirm a custom action.
 * Link sent by e-mail
 * Delete -> Remove the user credentials from the database
 * ResetPassword -> Reset the current user password and set it to 'password'
 */
app.get('/api/mail/customVerification', async (req, res) => {
  const token = req.query.token
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET)
    const user = await database.prisma.User.findUnique({
      where: {
        id: decoded.id
      }
    })
    const processType = user.confirmProcess
    await database.prisma.User.update({
      where: {
        id: decoded.id
      },
      data: {
        confirmProcess: ''
      }
    })
    if (processType == 'Delete') {
      await database.prisma.User.delete({
        where: {
          id: decoded.id
        }
      })
    }
    if (processType == 'ResetPassword') {
      await database.prisma.User.update({
        where: {
          id: decoded.id
        },
        data: {
          password: await hash('password')
        }
      })
    }
    res.send('Operation ' + processType + ' authorized and executed.')
  } catch (err) {
    console.error(err.message)
    res.status(401).send('No matching user found.')
  }
})

/**
 * Get request to delete an account
 * Send a confirmation e-mail before deleting.
 * Need to be authenticated with a token.
 */
app.get(
  '/api/user/deleteAccount',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (!req.user) return res.status(401).send('Invalid token')
    await database.prisma.User.update({
      where: {
        id: req.user.id
      },
      data: {
        confirmProcess: 'Delete'
      }
    })
    const token = utils.generateToken(req.user.id)
    gmail
      .sendEmail(
        req.user.email,
        'Confirm operation',
        'You asked to delete your account. Please confirm this operation by visiting this link : http://localhost:8080/api/mail/customVerification?token=' +
          token
      )
      .catch(_error => {
        return res.status(401).send('Invalid e-mail address.')
      })
    return res.json('Verification e-mail sended')
  }
)

/**
 * Post request to reset current password
 * Send a confirmation e-mail before reseting.
 * body.email -> User mail
 */
app.post('/api/user/resetPassword', async (req, res, next) => {
  const user = await database.prisma.User.findFirst({
    where: { email: req.body.email }
  })
  if (!user) return res.status(400).json('No user found.')
  if (!user.mailVerification)
    return res.status(401).json('Please verify your e-mail address.')
  await database.prisma.User.update({
    where: {
      id: user.id
    },
    data: {
      confirmProcess: 'ResetPassword'
    }
  })
  const token = utils.generateToken(user.id)
  gmail
    .sendEmail(
      user.email,
      'Confirm operation',
      'You asked to regenerate your password. It will be set to : password\nPlease confirm this operation by visiting this link : http://localhost:8080/api/mail/customVerification?token=' +
        token
    )
    .catch(_error => {
      return res.status(401).send('Invalid e-mail address.')
    })
  return res.json('Verification e-mail sent.')
})

/**
 * Post request to update user personal data.
 * body.username -> User name
 * body.email -> User mail
 * body.password -> User password
 * Road protected by token authentication
 * An new e-mail verification is sent when e-mail is updated.
 */
app.post(
  '/api/user/updateData',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    if (!req.user) return res.status(401).send('Invalid token')
    try {
      if (req.user.email != req.body.email) {
        const token = utils.generateToken(req.user.id)
        gmail
          .sendEmail(
            req.body.email,
            'Email Verification',
            'You have updated your e-mail, please go to the following link to confirm your new mail address : http://localhost:8080/api/mail/verification?token=' +
              token
          )
          .catch(_error => {
            return res.status(401).send('Invalid new e-mail address.')
          })
        await database.prisma.User.update({
          where: {
            id: req.user.id
          },
          data: {
            mailVerification: false
          }
        })
      }
      await database.prisma.User.update({
        where: {
          id: req.user.id
        },
        data: {
          username: req.body.username,
          email: req.body.email,
          password: await hash(req.body.password)
        }
      })
      return res.json('Your informations have been successfully updated.')
    } catch (err) {
      return res.status(400).json('Please pass a complete body.')
    }
  }
)

/**
 * Post request to login with google methods
 * body.id -> Google Id
 * body.email -> User Email
 * body.displayName -> User name
 */
app.post('/api/login/google', async (req, res, next) => {
  try {
    const user = await database.prisma.user.findUnique({
      where: { googleId: req.body.id }
    })
    if (user) {
      const token = utils.generateToken(user.id)
      return res.status(201).json({
        status: 'success',
        data: {
          user,
          token
        },
        statusCode: res.statusCode
      })
    }
    const oldUser = await database.prisma.user.findUnique({
      where: { email: req.body.email }
    })
    if (oldUser) {
      const newUser = await database.prisma.user.update({
        where: { email: req.body.email },
        data: { googleId: req.body.id }
      })
      const token = utils.generateToken(newUser.id)
      return res.status(201).json({
        status: 'success',
        data: {
          newUser,
          token
        },
        statusCode: res.statusCode
      })
    }
    const newUser = await database.prisma.user.create({
      data: {
        username: req.body.displayName,
        email: req.body.email,
        googleId: req.body.id,
        password: await hash(req.body.id),
        isAdmin: false,
        mailVerification: true
      }
    })
    const token = utils.generateToken(newUser.id)
    return res.status(201).json({
      status: 'success',
      data: {
        newUser,
        token
      },
      statusCode: res.statusCode
    })
  } catch (err) {
    console.error(err.message)
    return res.status(401).send('Google auth failed.')
  }
})

/**
 * Get request to login with facebook methods
 */
app.get(
  '/api/login/facebook',
  passport.authenticate('facebook', {
    scope: ['email']
  })
)

/**
 * Private request used by facebook after login operation
 */
app.get(
  '/api/login/facebookCallBack',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const user = req.user
    const token = utils.generateToken(user.id)
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Welcome back.',
        user,
        token
      },
      statusCode: res.statusCode
    })
  }
)

app.post('/api/services/discord/getVoiceChannels', async (req, res) => {
  const channels = await getVoiceChannels(req.body.id)
  return res.status(201).json({
    status: 'success',
    data: channels,
    statusCode: res.statusCode
  })
})

app.post('/api/services/discord/getTextChannels', async (req, res) => {
  const channels = await getTextChannels(req.body.id)
  return res.status(201).json({
    status: 'success',
    data: channels,
    statusCode: res.statusCode
  })
})

app.post('/api/services/discord/getAvailableGuilds', async (req, res) => {
  const guilds = await getAvailableGuilds()
  return res.status(201).json({
    status: 'success',
    data: guilds,
    statusCode: res.statusCode
  })
})

/**
 * Start the node.js server at PORT and HOST variable
 */
app.listen(PORT, HOST, () => {
  console.log(`Server running...`)
})

module.exports = {
  test_example
}
