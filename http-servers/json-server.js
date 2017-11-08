require('http')
.createServer()
.on('request', (req, res) => {
    const {url, method} = req;

    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    const product = {
        id: 1,
        name: 'Supreme T-Shirt',
        brand: 'Supreme',
        price: 99.99,
        options: [
            { color: 'blue'},
            { size: 'XL'}
        ]
    };

    res.end(JSON.stringify(product, null, 4));
})
.listen(3000);