import Models from '../models'
const users = Models.getUsers()

export default function getUsers (req, res) {
  res.json(users)
}
