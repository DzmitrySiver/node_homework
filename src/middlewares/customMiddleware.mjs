export default function customMiddleware (req, res, next) {
  req.parsedCookiesfield = req.cookies
  req.parsedQuery = req.params
  next()
}
