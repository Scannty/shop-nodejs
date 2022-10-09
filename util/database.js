const { MongoClient } = require('mongodb')

let _db

function mongoConnect(connectFunc) {
    MongoClient
        .connect('mongodb+srv://aleksa:vintor31@cluster0.yh5d1g4.mongodb.net/?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected')
            _db = client.db()
            connectFunc()
        })
        .catch(err => console.log(err))
}

function getDb() {
    if (_db) return _db
    throw new Error('No database found!')
}

module.exports = {
    mongoConnect,
    getDb
}
