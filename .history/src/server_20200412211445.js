const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { Pool, Client } = require("pg");
const connectionString = process.env.db;
const pool = new Pool({
  connectionString:
    "postgres://weeqgnqe:lOGKSmQm4EmxABEjiMeSZBMITDIXMW9I@balarama.db.elephantsql.com:5432/weeqgnqe",
});

const app = express();

const PORT = process.env.PORT || 3000;

const CREATE_AD_MUTATION = `
  mutation ($title: String!, $description: String!, $type: ad_type_enum!) {
    insert_ads_one(object: {type: $type, title: $title, price: 110, description: $description}) {
        id
    }
  }
`;

const CREATE_IMAGE_MUTATION = `
  mutation ($images: [ad_images_insert_input!]!) {
    insert_ad_images(objects: $images) {  
      returning { id }
      }
  }
`;

const CREATE_LOCATION_MUTATION = `
  mutation ($locations: [locations_insert_input!!]!) {
    insert_ad_images(objects: $locations) {  
      returning { id }
      }
  }
`;

// mutation test {
//   insert_locations(objects: { adress: "Pyrolavägen 28", country: "SE", latitude: "18.123131", longitude: "52.153452", zip: "18160" }) {
//     returning {
//       id
//     }
//   }
// }

const makeRequest = async (mutation, variables, headers) =>
  await fetch("http://localhost:8080/v1/graphql", {
    headers,
    method: "POST",
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });

app.use(bodyParser.json());

const createAd = async (req, res, next) => {
  const {
    email,
    id
  } = req.body.input;


  const { authorization } = req.headers;
  const headers = { authorization };
  try {
    // insert into db
    console.log("sdfds", req.headers);

    // const ad_variables = { title, description, type };

    // execute the parent mutation in Hasura
    // const fetchResponse = await makeRequest(
    //   CREATE_AD_MUTATION,
    //   ad_variables,
    //   headers
    // );

    // const { data, errors } = await fetchResponse.json();
    // if (errors) {
    //   return res.status(400).json({
    //     message: errors.message,
    //   });
    // }



    // success
    return res.status(200).json({ title: "dsf" });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

app.post("/createAd", createAd);


app.listen(PORT);
