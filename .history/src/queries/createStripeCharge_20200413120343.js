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
  const { amount, source } = req.body.input;
  const currency = "sek";
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const description = "Tipd services";

    // const variables = { stripeCardId: card.id };
    const response = await hasuraRequest(GET_USER_CREDIT_CARDS, null, headers);

    const { data, errors } = await response.json();
    const customer = "cus_H5N8hYggSEiqHi";
    // const card = await createCharge(amount, currency, description, source);
    const primaryCard = data.credit_card.find((card) => card.is_primary);
    console.log("primaryCard", primaryCard);
    const charge = await createCharge(
      amount,
      currency,
      description,
      customer
      //primaryCard.externalReferenceId
    );
    console.log("charge", charge);
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
