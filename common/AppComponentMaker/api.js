import { getSession } from "next-auth/react";
import Cors from "cors";

// Load the AWS SDK for Node.js
import { DynamoDB } from "aws-sdk";
const REGION = "us-east-1"; //e.g. "us-east-1"
const TableName = "AsanaToolboxAppComponents";

// Create the DynamoDB service object
const ddb = new DynamoDB.DocumentClient({
  credentials: {
    accessKeyId: process.env.DDB_ACCESS_KEY,
    secretAccessKey: process.env.DDB_SECRET_KEY,
  },
  region: REGION,
});

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
async function applyCors(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async (req, res) => {
  let session;
  try {
    session = await getSession({ req });
  } catch (error) {
    console.log(error);
  }
  await applyCors(req, res, cors);
  const route = req.query.all;
  let user_gid = req?.query?.user;
  let workspace_gid = req?.query?.workspace;

  //routes:  hi, rule-form, rule-submit,rule-run, get form, form-submit,
  if (route.length > 1) {
    if (route[1] == "config") {
      if (session && session.user.gid && session.user.gid == user_gid) {
        if (req.method == "GET") {
          try {
            let item = await ddb
              .get({
                TableName: TableName,
                Key: {
                  userworkspace: user_gid + workspace_gid,
                },
              })
              .promise();
            res.json(item.Item || {});
          } catch (error) {
            console.log(error);
            res.status(500);
          }
          res.send;
          return;
        } else if (req.method == "POST") {
          console.log("post");
          console.log(req.body);
          let item = JSON.parse(req.body);

          item.userworkspace = user_gid + workspace_gid;

          console.log(item);
          try {
            ddb.put(
              {
                TableName: TableName,
                Item: item,
              },
              function (err, data) {
                if (err) console.log(err);
                else {
                  console.log("data");
                  console.log(data);
                  res.json(item);
                  res.send();
                }
              }
            );

            return;
          } catch (error) {
            console.log("error!");
            console.log(error);
            res.status(500).end();
          }
          return;
        }
      } else {
        res.status(400).end();
      }

      //
      // post config to ddb by user and auth
      // ddb config
      // user+workspace = primary key
      // user, workspace, widget, resources, default resource (attachment), form, rule form
      //
      //
    } else if (route[1] == "widget") {
      try {
        let item = await ddb
          .get({
            TableName: TableName,
            Key: {
              userworkspace: user_gid + workspace_gid,
            },
          })
          .promise();
        console.log(item.Item);
        res.json(item.Item?.config?.widget || {});
      } catch (error) {
        console.log(error);
        res.status(500);
      }
    } else if (route[1] == "auth") {
      res.status(200).send(`<!DOCTYPE html>)
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>You have successfully connected Asana to the app</title>
  </head>
  <body>
    Success!
    <script>
      window.opener.postMessage("success", "https://app.asana.com");
      window.close();
    </script>
  </body>
</html>`);
      return;
    } else if (route[1] == "rule-form") {
    } else if (route[1] == "rule-submit") {
    } else if (route[1] == "rule-run") {
    } else if (route[1] == "form") {
    } else if (route[1] == "form-submit") {
    } else if (route[1] == "attach") {
      res.json({
        resource_name: "Build the Thing",
        resource_url:
          "https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/widget",
      });
    } else {
      res.status(404);
      res.end();
      return;
    }
  }

  res.status(200);

  res.end();
  return;
};
