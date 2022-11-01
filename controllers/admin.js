const mongodb = require('mongodb')
const { validationResult } = require('express-validator')
const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: null,
    product: { title: '', imageUrl: '', price: '', description: '' }
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body
  const image = req.file
  if (!image) {
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: "Attached file is not an image.",
      product: { title, price, description }
    })
  }
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage,
      product: { title, price, description }
    })
    throw new Error(errorMessage)
  }
  const imageUrl = image.path
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
        errorMessage: null
      })
    })
    .catch(err => console.log(err))
};

exports.postEditProduct = (req, res, next) => {
  const { productId, imageUrl } = req.body
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedDescription = req.body.description
  const image = req.file

  let updatedImageUrl
  image ? updatedImageUrl = image.path : updatedImageUrl = imageUrl

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg
    res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: productId
      },
      errorMessage
    })
    throw new Error(errorMessage)
  }

  const updatedProduct = new Product(
    updatedTitle,
    updatedPrice,
    updatedDescription,
    updatedImageUrl,
    new mongodb.ObjectId(productId),
    new mongodb.ObjectId(req.user._id)
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
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err))
};

exports.deleteProduct = (req, res, next) => {
  const { productId } = req.params
  Product.deleteById(productId)
    .then(result => {
      console.log('Product DESTROYED')
      console.log(result)
      res.status(200).json({ message: 'Success!' })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ message: 'Error!' })
    })
};
