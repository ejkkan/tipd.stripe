const stripe = require("../utils/stripe");

const createTransfer = async (amount, currency, destination_payment) => {
  return await stripe.transfers
    .create({
      amount,
      currency,
      destination_payment,
    })
    .then((charge) => charge);
};

export const createStripeTransfer = async (req, res, next) => {
  console.log("lol");
  const { amount, stripeUser } = req.body.input;
  const currency = "sek";
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    console.log("here", amount, currency, stripeUser);
    const description = "Tipd payment";
    const transfer = await createTransfer(amount, currency, stripeUser);
    console.log("transfer", transfer);
    return res.status(200).json({ transfer: "transfer.id" });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
