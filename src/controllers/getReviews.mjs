import Models from '../models'

export default function getReviews (req, res) {
  const id = req.params.id
  console.log(id)
  const product = Models.getProductById(id)

  if (product === undefined) {
    res.status(404)
      .json({message: `Product with id ${id} not found`})
  } else {
    res.json(product.reviews)
  }
}
