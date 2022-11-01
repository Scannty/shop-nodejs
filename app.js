const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const mongoSession = require('connect-mongodb-session')
const flash = require('connect-flash')
const multer = require('multer')

const errorController = require('./controllers/error');
const { mongoConnect } = require('./util/database')
const User = require('./models/user')

const app = express();

const MongoDbStore = mongoSession(session)
const store = new MongoDbStore({
    uri: 'mongodb+srv://aleksa:vintor31@cluster0.yh5d1g4.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions'
})

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, callback) => {
    if (
        file.mimetype === 'image/png'
        || file.mimetype === 'image/jpg'
        || file.mimetype === 'image/jpeg'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(flash())

app.use((req, res, next) => {
    if (!req.session.isLoggedIn) return next()
    User.findById(req.session.user._id)
        .then(user => {
            req.user = new User(user.email, user.password, user.cart, user._id)
            next()
        })
        .catch(err => console.log(err))
})

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn
    next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(errorController.get404)

mongoConnect(() => {
    app.listen(3000)
})

