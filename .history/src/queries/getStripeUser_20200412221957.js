const stripe = require("../utils/stripe");

export const getStripeUser = async (req, res, next) => {
  const { stripeId } = req.body.input;
  try {
    const user = await stripe.customers
      .retrieve(stripeId)
      .then((customer) => customer);

    if (!user) {
      return res.status(400).json({
        message: "Could not find stripe user",
      });
    }
    return res.status(200).json({ id: user.id, email: user.email });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
