const stripe = require("../utils/stripe");
const { hasuraRequest } = require("../utils/hasuraRequest");

const CREATE_CREDIT_CARD = `
  mutation ($stripeCardId: String!) {
    insert_credit_card_one(object: {externalReferenceId: $stripeCardId}) {
      id
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

export const createStripeCard = async (req, res, next) => {
  const { token, stripeId } = req.body.input;
  const userId = req.body.session_variables["x-hasura-user-id"];
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const card = await createCard(stripeId, token);

    const variables = { stripeCardId: card.id };
    const response = await hasuraRequest(
      CREATE_CREDIT_CARD,
      variables,
      headers
    );

    const { data, errors } = await response.json();
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }
    return res.status(200).json({ card: data.insert_credit_card_one.id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
