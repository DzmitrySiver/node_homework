import { users, products } from '../db'

const Models = {
  getProducts () {
    return products
  },

  getProductById (id) {
    let product = products.find((elem, i) => elem.id === id)
    return product
  },

  getUsers () {
    return users
  },

  addProduct (product) {
    products.push(product)
  }
}

export default Models
