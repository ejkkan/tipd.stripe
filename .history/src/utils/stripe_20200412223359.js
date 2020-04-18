const stripe = require("stripe")(process.env.stripeKey);

module.exports = stripe;
