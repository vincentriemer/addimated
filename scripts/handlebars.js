const Handlebars = require("handlebars");
const util = require("handlebars-utils");

Handlebars.registerHelper("eq", function(a, b, options) {
  if (arguments.length === 2) {
    options = b;
    b = options.hash.compare;
  }
  return util.value(a === b, this, options);
});

module.exports = Handlebars;
