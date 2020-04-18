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

const createCharge = async (amount, currency, description, source) => {
  return await stripe.charges
    .create({
      amount,
      currency,
      description,
      source,
    })
    .then((charge) => charge);
};

export const createStripeCharge = async (req, res, next) => {
  const { amount, source } = req.body.input;
  const userId = req.body.session_variables["x-hasura-user-id"];
  const currency = "sek";
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const description = "Tipd services";

    // const variables = { stripeCardId: card.id };
    const response = await hasuraRequest(GET_USER_CREDIT_CARDS, headers);

    const { data, errors } = await response.json();
    console.log("data", data.credit_card);
    // const card = await createCharge(amount, currency, description, source);

    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }
    return res.status(200).json({ id: "data.insert_credit_card_one.id" });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
