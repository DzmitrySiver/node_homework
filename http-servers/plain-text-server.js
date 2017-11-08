require('http')
    .createServer()
    .on('request', (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Hello world');
    })
    .listen(3000);