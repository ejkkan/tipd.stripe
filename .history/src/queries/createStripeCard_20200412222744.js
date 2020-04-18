const stripe = require("../utils/stripe");
const { hasuraRequest } = require("../utils/hasuraRequest");

const UPDATE_USER_STRIPE_ID = `
  mutation ($userId: Int!, $stripeId: String!) {
    update_users_by_pk(pk_columns: {id: $userId},  _set: {stripeId: $stripeId}) {
      id
      stripeId
    }
  }
`;

const createUser = async (email) => {
  return await stripe.customers
    .create({
      email,
    })
    .then((customer) => customer);
};

export const createStripeCard = async (req, res, next) => {
  const { token, stripeId } = req.body.input;
  const userId = req.body.session_variables["x-hasura-user-id"];
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const card = await createCard(stripeId, token);
    const variables = { stripeCardId: card.id };
    const response = await makeRequest(CREATE_CREDIT_CARD, variables, headers);

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
