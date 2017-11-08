import Models from '../models'
const products = Models.getProducts()

export default function getProducts (req, res) {
  res.json(products)
}
