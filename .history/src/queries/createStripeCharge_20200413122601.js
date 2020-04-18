const stripe = require("../utils/stripe");
const { hasuraRequest } = require("../utils/hasuraRequest");

const CREATE_CREDIT_CARD = `
  mutation ($stripeCardId: String!) {
    insert_credit_card_one(object: {externalReferenceId: $stripeCardId}) {
      id
    }
  }
`;

const GET_USER_CREDIT_CARDS = `
    query {
    credit_card {
        externalReferenceId
        is_primary
    }
    }
`;

const createCharge = async (amount, currency, description, payment_method) => {
  return await stripe.charges
    .create({
      amount,
      currency,
      description,
      customer,
    })
    .then((charge) => charge);
};

export const createStripeCharge = async (req, res, next) => {
  const { amount, stripeUser } = req.body.input;
  const currency = "sek";
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const description = "Tipd services";
    const charge = await createCharge(
      amount,
      currency,
      description,
      stripeUser
    );
    console.log("charge", charge);
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }
    return res.status(200).json({ id: charge.id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
