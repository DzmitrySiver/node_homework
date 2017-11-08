const http = require('http');
const fs = require('fs');

http.createServer()
    .on('request', (req, res) => {
    let fileName = 'index.html';
    let message = 'Hello World';
    let article = 'lorem ipsum dolor sit amet';
    let template;
    let status = 500;
    try {
        let text = fs.readFileSync(fileName).toString();
        template = render(text, { message, article });
        status = 200;
    } catch(e){}

    res.writeHead(status, {
        'Content-Type': 'text/html'
    });

    if(template){
        res.end(template);
    } else {
        res.end('error occured');
    }
})
.listen(3000);

function render (text, data) {
    for (let key in data) {
        let value = data[key];
        let regexp = new RegExp(`{${key}}`, 'g');
        text = text.replace(regexp, value);
    }

    return text;
}