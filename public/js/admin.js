function deleteProduct(btn) {
    const productId = btn.parentNode.querySelector('[name=productId]').value
    fetch('/admin/delete-product/' + productId, { method: 'DELETE' })
        .then(() => btn.closest('article').remove())
        .catch(err => console.log(err))
}