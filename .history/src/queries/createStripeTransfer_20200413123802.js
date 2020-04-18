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

const createCharge = async (amount, currency, description, customer) => {
  return await stripe.transfers
    .create({
      amount: 400,
      currency: "usd",
      destination: "acct_1GXAlJD7NfFQcznV",
    })
    .then((charge) => charge);
};

export const createStripeTransfer = async (req, res, next) => {
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

    return res.status(200).json({ id: charge.id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
