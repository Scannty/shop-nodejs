const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const mongoSession = require('connect-mongodb-session')

const errorController = require('./controllers/error');
const { mongoConnect } = require('./util/database')
const User = require('./models/user')

const app = express();

const MongoDbStore = mongoSession(session)
const store = new MongoDbStore({
    uri: 'mongodb+srv://aleksa:vintor31@cluster0.yh5d1g4.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
}))

app.use((req, res, next) => {
    if (!req.session.isLoggedIn) return next()
    User.findById(req.session.user._id)
        .then(user => {
            req.user = new User(user.email, user.password, user.cart, user._id)
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(errorController.get404)

mongoConnect(() => {
    app.listen(3000)
})

