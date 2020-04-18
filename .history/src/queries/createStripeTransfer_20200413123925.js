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

const createTransfer = async (amount, currency, destination) => {
  return await stripe.transfers
    .create({
      amount,
      currency,
      destination,
    })
    .then((charge) => charge);
};

export const createStripeTransfer = async (req, res, next) => {
  const { amount, stripeUser } = req.body.input;
  const currency = "sek";
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const description = "Tipd payment";
    const transfer = await createTransfer(amount, currency, stripeUser);
    console.log("transfer", transfer);
    return res.status(200).json({ id: transfer.id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
