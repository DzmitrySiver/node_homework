const http = require('http')

http.createServer((req, res) => {
  const headers = req.headers
  const fullUrl = 'http://' + headers.host + req.url

  let str = `<p>${req.method} ${fullUrl}</p>`
  for (let key in headers) {
    let value = headers[key]
    str += `<p>${key}: ${value}</p>`
  }

  str += `<p>${req.url}</p>`
  headers['Content-type'] = 'text/html'
  res.writeHead(200, headers)
  res.end(str)
  req.pipe(res)
}).listen(3000)
