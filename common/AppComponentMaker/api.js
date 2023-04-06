import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Cors from "cors";

// Load the AWS SDK for Node.js
import { DynamoDB } from "aws-sdk";
const REGION = "us-east-1"; //e.g. "us-east-1"
const TableName = "AsanaToolboxAppComponents";
console.log(authOptions);

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

const api = async (req, res) => {
  let session;
  try {
    session = await getServerSession(req, res, authOptions);
    console.log("session : ", session);
  } catch (error) {
    console.log("error : ", error);
  }

  await applyCors(req, res, cors);
  const route = req.query.all;
  let user_gid = req?.query?.user;
  let workspace_gid = req?.query?.workspace;

  let reqData = req.body?.data || {};
  console.log("reqdata");
  console.log(reqData);
  if (!user_gid) {
    user_gid = reqData?.user;
  }
  if (!workspace_gid) {
    workspace_gid = reqData?.workspace;
  }

  [user_gid, workspace_gid] = [String(user_gid), String(workspace_gid)];

  //routes:  hi, rule-form, rule-submit,rule-run, get form, form-submit,
  if (route.length > 1) {
    if (route[1] == "config") {
      let userworkspaceid = user_gid + workspace_gid;
      console.log(userworkspaceid);
      if (session && session.user.gid && session.user.gid == user_gid) {
        if (req.method == "GET") {
          try {
            let item = await ddb
              .get({
                TableName: TableName,
                Key: {
                  userworkspace: userworkspaceid,
                },
              })
              .promise();
            console.log(item.Item);
            res.json(item.Item || {});
          } catch (error) {
            console.log(error);
            res.status(500).send();
          }
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
                }
              }
            );
          } catch (error) {
            console.log("error!");
            console.log(error);
            res.status(500).send();
          }
        }
      } else {
        res.status(400);
        res.send();
      }

      //
      // post config to ddb by user and auth
      // ddb config
      // user+workspace = primary key
      // user, workspace, widget, resources, default resource (attachment), form, rule form
      //
      //
    } else if (route[1] == "widget") {
      console.log("widget");
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
        console.log("widget:");
        console.log(item.Item?.config?.widget);
        res.json(item.Item?.config?.widget || {});
      } catch (error) {
        console.log("error!");
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
    } else if (route[1] == "rule-form") {
      console.log("rule-form");
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
        console.log("rule-form:");
        console.log(item.Item?.config?.ruleForm);
        res.json(item.Item?.config?.ruleForm || {});
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(200).send();
      }
    } else if (route[1] == "rule-submit") {
      res.status(200).send();
    } else if (route[1] == "rule-run") {
      let userworkspaceid = user_gid + workspace_gid;
      try {
        let item = await ddb
          .get({
            TableName: TableName,
            Key: {
              userworkspace: userworkspaceid,
            },
          })
          .promise();

        console.log("rule-run");
        console.log(item);
        console.log(item.Item?.config?.attachment);
        res.json({
          action_result: "resources_created",
          resources_created: [
            {
              resource_name: item.Item?.config?.attachment?.resource_name,
              resource_url: item.Item?.config?.attachment?.resource_url,
            },
          ],
        });
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(500).send();
      }
    } else if (route[1] == "form") {
      console.log("form");
      try {
        let item = await ddb
          .get({
            TableName: TableName,
            Key: {
              userworkspace: user_gid + workspace_gid,
            },
          })
          .promise();

        console.log("form:");
        console.log(item.Item?.config?.form);
        res.json(item.Item?.config?.form || {});
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(500);
      }
    } else if (route[1] == "form-submit") {
      res.status(200).send();
    } else if (route[1] == "attach") {
      try {
        let item = await ddb
          .get({
            TableName: TableName,
            Key: {
              userworkspace: `${user_gid}${workspace_gid}`,
            },
          })
          .promise();

        console.log("attachment:");
        console.log(item.Item);
        console.log(item.Item?.config?.attachment);
        res.json(item.Item?.config?.attachment || {});
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(500);
      }
    } else if (route[1] == "lookup") {
      try {
        let item = await ddb
          .get({
            TableName: TableName,
            Key: {
              userworkspace: user_gid + workspace_gid,
            },
          })
          .promise();

        console.log("lookup:");
        console.log(item.Item?.config?.lookup);
        res.json(item.Item?.config?.lookup || {});
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(500);
      }
    } else {
      res.status(404).send();
    }
  }

  res.status(200);

  res.end();
};

export default api;
