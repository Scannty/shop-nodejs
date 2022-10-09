const { getDb } = require('../util/database')
const mongodb = require('mongodb')

module.exports = class User {
    constructor(email, password, cart, _id) {
        this.email = email
        this.password = password
        this.cart = cart
        this._id = _id
    }

    save() {
        const db = getDb()
        db.collection('users').insertOne(this)
            .then(result => this._id = result.insertedId)
            .catch(err => console.log(err))
    }

    getCart() {
        console.log('Getting cart items...')
        const db = getDb()
        const ownedProductIds = this.cart.items.map(item => item.productId)
        return db.collection('products')
            .find({ _id: { $in: ownedProductIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(item =>
                            item.productId.toString() === product._id.toString()
                        ).quantity
                    }
                })
            })
    }

    addToCart(product) {
        console.log('Adding product to the cart...')
        const productIndex = this.cart.items
            .findIndex(item => item.productId.toString() === product._id.toString())
        let updatedItems = [...this.cart.items]
        if (productIndex >= 0) {
            updatedItems[productIndex].quantity++
        } else {
            console.log('Correct')
            updatedItems.push({
                productId: product._id,
                quantity: 1
            })
        }
        const updatedCart = { items: updatedItems }
        console.log(updatedCart)
        const db = getDb()
        db.collection('users').updateOne({
            _id: this._id
        }, { $set: { cart: updatedCart } })
    }

    removeFromCart(productId) {
        console.log('Removing product from the cart...')
        const updatedItems = this.cart.items.filter(item =>
            item.productId.toString() !== productId.toString()
        )
        const db = getDb()
        return db.collection('users')
            .updateOne({ _id: this._id }, {
                $set: { cart: { items: updatedItems } }
            })
    }

    getOrders() {
        console.log('Getting the orders...')
        const db = getDb()
        return db
            .collection('orders')
            .find({ 'user._id': this._id })
            .toArray()
    }

    addOrder() {
        console.log('Submitting an order...')
        const db = getDb()
        return this.getCart()
            .then(products => {
                db.collection('orders').insertOne({
                    items: products,
                    user: {
                        _id: this._id,
                        name: this.name
                    }
                })
                    .then(() => {
                        this.cart = { items: [] }
                        return db.collection('users').updateOne({
                            _id: this._id
                        }, { $set: { cart: this.cart } })
                    })
            })
    }

    static findById(userId) {
        const db = getDb()
        return db.collection('users').find({ _id: new mongodb.ObjectId(userId) }).next()
    }

    static findByEmail(email) {
        const db = getDb()
        return db.collection('users').find({ email: email }).next()
    }
}