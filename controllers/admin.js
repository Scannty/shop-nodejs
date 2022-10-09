const mongodb = require('mongodb')
const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isLoggedIn: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body
  const product = new Product(title, price, description, imageUrl, null, req.user._id)
  product.save()
  res.redirect('/admin/products')
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const { productId } = req.params
  Product
    .findById(productId)
    .then(product => {
      if (!product) res.redirect('/')
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        isLoggedIn: req.session.isLoggedIn
      })
    })
    .catch(err => console.log(err))
};

exports.postEditProduct = (req, res, next) => {
  const { productId } = req.body
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedDescription = req.body.description
  const updatedImageUrl = req.body.imageUrl
  const updatedProduct = new Product(
    updatedTitle,
    updatedPrice,
    updatedDescription,
    updatedImageUrl,
    new mongodb.ObjectId(productId)
  )
  updatedProduct.save()
  res.redirect('/admin/products')
};

exports.getProducts = (req, res, next) => {
  console.log('Started')
  Product
    .findByUserId(req.user._id)
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body
  Product.deleteById(productId)
    .then(result => {
      console.log('Product DESTROYED')
      console.log(result)
      res.redirect('/admin/products')
    })
    .catch(err => console.log(err))
};
