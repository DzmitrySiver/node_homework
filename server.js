/**
 * Created by Dzmitry_Siver on 2/8/2017.
 */

var config = require('./config');
var User = require('./models/user');
var Product = require('./models/product');

console.log('app name: ' + config.name);

var vasya = new User('Vasya');
vasya.hello();

var tesla = new Product('Tesla');
tesla.info();