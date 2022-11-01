const session = require('express-session');
const fs = require('fs')
const path = require('path')
const stripe = require('stripe')('sk_test_51Lz2mZG3GsidWfzouA4E03xWPpwywVokGsESpQUmPEWsK7rlKV3WqxmJbNk6UUHxFhwf8aZvfrI9jPwEj4EzCdeT00ORIpWBAK')

const Product = require('../models/product');

const ITEMS_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems
  Product
    .getNumberOfProducts()
    .then(numOfProducts => {
      totalItems = numOfProducts
      return Product.fetchAll(page)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        nextPage: page + 1,
        prevPage: page - 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      })
    })
    .catch(err => console.log(err))
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params
  Product.findById(productId)
    .then(product => {
      console.log(product)
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => console.log(err))
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems
  Product
    .getNumberOfProducts()
    .then(numOfProducts => {
      totalItems = numOfProducts
      return Product.fetchAll(page)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        nextPage: page + 1,
        prevPage: page - 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => console.log(err))
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products,
      })
    })
    .catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
  const { productId } = req.body
  Product.findById(productId)
    .then(product => {
      console.log(product)
      req.user.addToCart(product)
      res.redirect('/cart');
    })
    .catch(err => console.log(err))
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body
  req.user.removeFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(err => console.log(err))
};

exports.getCheckout = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
      const totalSum = products.reduce((prev, curr) => +prev + +curr.price, 0)
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalSum
      })
    })
    .catch(err => console.log(err))
}

exports.postCheckout = (req, res, next) => {
  req.user
    .getCart()
    .then(async (products) => {
      try {
        console.log('Creating session...')
        const session = await stripe.checkout.sessions.create({
          line_items: products.map(product => {
            console.log(product)
            return {
              price_data: {
                currency: 'usd',
                unit_amount: product.price * 100,
                product_data: {
                  name: product.title,
                  description: product.description,
                }
              },
              quantity: product.quantity
            }
          }),
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
          cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
        })
        console.log('Session created...')
        res.redirect(session.url)
      } catch (err) {
        console.log(err)
      }
    })
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
        isLoggedIn: req.session.isLoggedIn
      })
    })
    .catch(err => console.log(err))
};

exports.postCreateOrder = (req, res, next) => {
  req.user.addOrder()
    .then(() => res.redirect('/orders'))
    .catch(err => console.log(err))
}

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params
  const invoiceName = 'invoice-' + orderId + '.pdf'
  const invoicePath = path.join('data', 'invoices', invoiceName)

  const file = fs.createReadStream(invoicePath)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
  file.pipe(res)
}
