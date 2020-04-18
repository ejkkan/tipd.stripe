const fetch = require("node-fetch");

export const hasuraRequest = async (mutation, variables, headers) =>
  await fetch(process.env.hasuraUrl, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });
