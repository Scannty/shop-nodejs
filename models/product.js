const mongodb = require('mongodb')
const { getDb } = require('../util/database')

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    this._id = id
    this.userId = userId
  }

  save() {
    const db = getDb()
    if (this._id) {
      db.collection('products')
        .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this })
        .then(result => console.log(result))
        .catch(err => console.log(err))
    } else {
      db.collection('products').insertOne(this)
        .then(result => console.log(result))
        .catch(err => console.log(err))
    }
  }

  static fetchAll() {
    const db = getDb()
    return db.collection('products').find().toArray()
  }

  static findById(productId) {
    const db = getDb()
    return db.collection('products').find({ _id: new mongodb.ObjectId(productId) }).next()
  }

  static findByUserId(userId) {
    const db = getDb()
    return db.collection('products').find({ userId: new mongodb.ObjectId(userId) }).toArray()
  }

  static deleteById(productId) {
    const db = getDb()
    return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) })
  }
}

module.exports = Product
