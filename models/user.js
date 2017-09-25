function User(name) {
    this.name = name;
}

User.prototype.hello = function () {
    console.log("Hello " + this.name);
};

module.exports = User;