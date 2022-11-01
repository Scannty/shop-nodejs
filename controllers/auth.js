const bcrypt = require('bcrypt')
const User = require('../models/user')
const { validationResult } = require('express-validator/check')

exports.getLogin = (req, res, next) => {
    let errorMessage = req.flash('error')
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0]
    } else {
        errorMessage = null
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body
    let user
    User.findByEmail(email)
        .then(userInfo => {
            if (!userInfo) {
                req.flash('error', 'Invalid email or password.')
                res.redirect('/login')
                throw new Error('No such user exists')
            }
            user = userInfo
            return bcrypt.compare(password, user.password)
        })
        .then(passwordMatch => {
            if (!passwordMatch) {
                req.flash('error', 'Invalid email or password.')
                res.redirect('/login')
                throw new Error('Password is incorrect')
            }
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.save(err => {
                if (err) throw new Error(err)
                res.redirect('/')
            })
        })
        .catch(err => console.log(err))
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: null,
        oldEmail: ''
    })
}

exports.postSignup = (req, res, next) => {
    const { email, password } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            oldEmail: email
        })
    }
    User.findByEmail(email)
        .then(user => {
            if (user) {
                req.flash('error', 'Account already exists.')
                res.redirect('/signup')
                throw new Error('Account already exists')
            }
            return bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {
            const newUser = new User(email, hashedPassword, { items: [] }, null)
            return newUser.save()
        })
        .then(() => {
            res.redirect('/')
        })
        .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err)
            return
        }
        res.redirect('/')
    })
}