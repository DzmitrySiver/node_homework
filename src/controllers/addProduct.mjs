import Models from '../models'

export default function addProduct (req, res) {
  const product = req.body

  if (product) {
    Models.addProduct(product)
    res.status(200)
  } else {
    res.status(400)
      .json({message: 'Bad request'})
  }
}
