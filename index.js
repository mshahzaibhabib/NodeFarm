// Core Module
const fs = require('fs');
const http = require('http');
const url = require('url');

// THIRD PARTY MODULES
// a function which will basically create slugs
const slugify = require('slugify');

// our Own Modules after the core modules
const replaceTemplate = require('./modules/replaceTemplate');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
// keep in mind that we can do the synchronous version because we are in the top
// level code which is executed once right at the begining when we load up these
// applications. so we could not do this inside of the "createServer" callback
// function because this one is called each time there is a request. and if we
// have one million requests at the same time then we would block the code one
// million times once for each request, which we don't want.
const dataObject = JSON.parse(data);

const slugs = dataObject.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
    // console.log(req.url);
    // parse is to basically parse the variabels out of the URL something like
    // ?id=0 because right now the re.url is all of this "localhost:8000/product?id=0"
    // and ofcourse we don't have any route for that
    // passed "true" inorder to parse query into an object where query string is this
    //  part "?id=0"
    // console.log(url.parse(req.url, true));

    // by using destructuring, with these exact property names, it will create 2 variables
    const { query, pathname } = url.parse(req.url, true);

    // Overview Page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        // used join because we want a one single string and not an array
        const cardsHtml = dataObject
            .map((el) => replaceTemplate(tempCard, el))
            .join('');
        const output = tempOverview.replace('{%PRODUCTS_CARDS%}', cardsHtml);
        res.end(output);

        // Product Page
    } else if (pathname === '/product') {
        // console.log(query);
        res.writeHead(200, { 'Content-type': 'text/html' });
        const product = dataObject[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
        // res.end('This is the PRODUCT');

        // API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(data);

        // Not Found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world',
        });
        res.end('<h1>This page can not be found!</h1>');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to request on port 8000');
});