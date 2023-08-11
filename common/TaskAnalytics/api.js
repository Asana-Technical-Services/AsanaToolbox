import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Cors from "cors";

// Load the AWS SDK for Node.js
import { DynamoDB } from "aws-sdk";
import { CountQueuingStrategy } from "node:stream/web";
const REGION = "us-east-1"; //e.g. "us-east-1"
const TableName = "AsanaToolboxTracker";
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
  console.log("here!");
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

  let reqData = {};
  try {
    reqData = JSON.parse(req.body?.data || "{}");
  } catch (e) {
    console.log(e);
  }
  if (!user_gid || user_gid == undefined) {
    user_gid = reqData?.user;
  }
  if (!workspace_gid || user_gid == undefined) {
    workspace_gid = reqData?.workspace;
  }

  [user_gid, workspace_gid] = [String(user_gid), String(workspace_gid)];
  //routes:  hi, rule-form, rule-submit,rule-run, get form, form-submit,
  if (route.length > 1) {
    if (route[1] == "config") {
      let Items = await ddb
        .scan({
          TableName: TableName,
        })
        .promise();
      console.log(Items);
      res.json(Items);

      //
      // post config to ddb by user and auth
      // ddb config
      // user+workspace = primary key
      // user, workspace, widget, resources, default resource (attachment), form, rule form
      //
      //
    } else if (route[1] == "widget") {
      console.log("widget");
      console.log(req?.query);
      let TrackerID = req?.query?.attachment;
      let TaskID = req?.query?.task;
      let TrackerIDTaskID = `${TaskID}`;
      console.log(TrackerID);
      console.log(TaskID);
      console.log(TrackerIDTaskID);

      try {
        let item = await ddb
          .get({
            TableName: TableName,
            Key: {
              TrackerIDTaskID: TrackerIDTaskID,
            },
          })
          .promise();

        let count = item.Item?.Counter;
        console.log(count);
        console.log(item.Item);
        count += 1;
        await ddb
          .put(
            {
              TableName: TableName,
              Item: {
                TrackerIDTaskID: TrackerIDTaskID,
                Counter: count,
                TrackerID: item.Item?.TrackerID,
                TaskID: TaskID,
              },
            },
            function (err, data) {
              if (err) {
                console.log(err);
                res.status(500).send();
              } else {
                console.log("data");
                console.log(data);
                res.status(200).json({
                  template: "summary_with_details_v0",
                  metadata: {
                    title: item.Item?.TrackerID || "Analytics",
                    fields: [
                      {
                        name: "View Count",
                        text: `${count}`,
                        type: "text_with_icon",
                      },
                    ],
                    footer: {
                      footer_type: "custom_text",
                      text: "100% Certified Correct™",
                    },
                  },
                });
              }
            }
          )
          .promise();
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(500).send();
        return;
      }
    } else if (route[1] == "auth") {
      res.status(200).send(`<!DOCTYPE html>
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
    } else if (route[1] == "attach") {
      console.log(req.body);
      console.log("attach");
      const dataJson = JSON.parse(req.body.data);
      const TaskID = dataJson.task;
      const TrackerID = dataJson.query;
      const TrackerIDTaskID = `${TaskID}`;
      console.log(TrackerID);
      console.log(TaskID);
      try {
        await ddb
          .put(
            {
              TableName: TableName,
              Item: {
                TrackerIDTaskID: TrackerIDTaskID,
                Counter: 0,
                TrackerID: TrackerID,
                TaskID: TaskID,
              },
            },
            function (err, data) {
              if (err) {
                console.log(err);
                res.status(500).send();
              } else {
                console.log("data");
                console.log(data);
                res.json({
                  resource_name: TrackerID,
                  resource_url:
                    "https://asana-toolbox.vercel.app/apps/TaskAnalytics",
                });
              }
            }
          )
          .promise();
      } catch (error) {
        console.log("error!");
        console.log(error);
        res.status(500).send();
        return;
      }
    }
  } else {
    res.status(200).send();
  }
};

export default api;
