const stripe = require("../utils/stripe");

const createStripeUser = async (req, res, next) => {
  const { email } = req.body.input;
  if (!email) {
    return res.status(400).json({
      message: "Invalid email",
    });
  }
  const userId = req.body.session_variables["x-hasura-user-id"];
  const { authorization } = req.headers;
  const headers = { authorization };
  try {
    const { id } = await createUser(email);

    const variables = { userId, stripeId: id };
    const response = await makeRequest(
      UPDATE_USER_STRIPE_ID,
      variables,
      headers
    );

    const { errors } = await response.json();
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }
    return res.status(200).json({ id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};
