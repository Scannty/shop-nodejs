const bcrypt = require('bcrypt')
const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isLoggedIn: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body
    let user
    User.findByEmail(email)
        .then(userInfo => {
            if (!userInfo) {
                res.redirect('/login')
                throw new Error('No such user exists')
            }
            user = userInfo
            return bcrypt.compare(password, user.password)
        })
        .then(passwordMatch => {
            if (!passwordMatch) {
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
        isLoggedIn: req.session.isLoggedIn
    })
}

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    User.findByEmail(email)
        .then(user => {
            if (user) {
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