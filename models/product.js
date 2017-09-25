function Product(name) {
    this.name = name;
}

Product.prototype.info = function () {
    console.log("Product: " + this.name);
};

module.exports = Product;