const express = require('express')
const { check, body } = require('express-validator/check')

const authController = require('../controllers/auth')

const router = express.Router()

router.get('/login', authController.getLogin)

router.post('/login', authController.postLogin)

router.get('/signup', authController.getSignup)

router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Invalid email')
        .custom((value, { req }) => {
            if (value === 'test@test.com') {
                throw new Error('This email address is forbidden!')
            }
            return true
        }),
    body('password', 'Password must be 5 characters long and contain only text and numbers.')
        .isLength({ min: 5 })
        .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match.')
        }
        return true
    }),
    authController.postSignup
)

router.post('/logout', authController.postLogout)

module.exports = router