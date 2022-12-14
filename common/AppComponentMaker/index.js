import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from "axios";
import ResponseEditor from "./components/ResponseEditor";

export default function Component() {
  const { data: session } = useSession();

  // many requests require you to specify a workspace, so we've provided that here
  const [workspaces, setAvailableWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState();
  const [dbRecord, setDbRecord] = useState({});

  useEffect(() => {
    if (session && session.access_token) {
      // do any inialization here - as soon as we have an access token read from the JWT in cookies.
      // sometimes the session isn't set on first render, especially if users are navigating directly to your app

      // for convenience, also adding "ready" as a stateful variable.
      //if we haven't already, get our available workspaces
      if (workspaces?.length == 0) {
        axios
          .get("https://app.asana.com/api/1.0/workspaces", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          .then((response) => {
            if (response?.data?.data) {
              setAvailableWorkspaces(response.data.data);
            }
          });
      }
    }
  }, [session, workspaces.length]);

  const handleWorkspaceChange = async (e) => {
    if (e.target.value && e.target.value != "none") {
      setCurrentWorkspace(e.target.value);
      let resp = await fetch(
        "/api/apps/AppComponentMaker/config?user=" +
          session.user.gid +
          "&workspace=" +
          e.target.value
      );
      if (resp.ok) {
        let body = await resp.json();
        if (body?.config?.widget) {
          setDbRecord(body);
          return;
        }
        return;
      }
    } else {
      setCurrentWorkspace("none");
      setDbRecord({});
    }
  };

  const save = async (param, value) => {
    let newDbRecord = dbRecord;

    newDbRecord.config = { ...dbRecord?.config };
    newDbRecord.config[param] = value;

    let res = await fetch(
      "/api/apps/AppComponentMaker/config?user=" +
        session.user.gid +
        "&workspace=" +
        currentWorkspace,
      { method: "POST", body: JSON.stringify(newDbRecord) }
    );
    if (res.data) {
      setDbRecord(res.data);
    }
    if (res.ok) {
      return true;
    } else {
      return false;
    }
  };

  // we have Tailwind CSS https://tailwindcss.com/docs/installation
  //  and Material UI components https://mui.com/material-ui/
  // available to import and use
  return (
    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <h1>Custom App Component Demo</h1>
      <p>
        This app allows you to create a customized App Component for
        demonstration purposes. Please follow all of the steps on this page
        while signed in as your Phoenix user which you'll be using for the demo.
        You may create the actual Asana application from your own Asana account.
        <br />
        <br />
        We track the user ID and workspace you're signed in to and display the
        configuration you decide below. If you use a different user in the
        domain, or are using the same app in a different org,
        <br /> <br />
        There are two parts to the configuration: The creation of a Custom App
        (done in the
        <a href="https://app.asana.com/0/my-apps" className="text-blue-700">
          {" "}
          Asana dev console
        </a>
        ) and the configuration of the data the app will return in the widget
        and form (done here)
        <br /> <br />
      </p>
      <div>
        <details>
          <summary>Asana Dev Console Steps:</summary>
          <ol className=" px-8 list-disc list-outside">
            <li>
              Navigate to{" "}
              <a
                className="text-blue-700"
                href="https://app.asana.com/0/my-apps"
              >
                https://app.asana.com/0/my-apps
              </a>
            </li>
            <li>
              Click "create new app" and name it after the app you'd like to
              simulate. This is how your app will appear in Asana{" "}
            </li>
            <li>
              Under "Basic information" enter your app name and the main icon
              for the app you're looking to simulate{" "}
            </li>
            <li>
              Under "App Components" select the app component elements you'd
              like to use:
              <ul className="list-outside px-8">
                <li>
                  <details>
                    <summary>
                      <b>Lookup:</b>
                    </summary>
                    <ul className="list-disc list-outside px-8">
                      <li>
                        <b> Resource Attach URL: </b>
                        https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/attach
                      </li>
                      <li>
                        <b>Resource typeahead URL: </b>
                        https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/lookup{" "}
                      </li>
                    </ul>
                  </details>
                </li>
                <li>
                  <details>
                    <summary>
                      <b>Entry Point: </b>
                    </summary>
                    <div className="px-8">
                      <p>
                        Provide good placeholder text here, such as "attach
                        resource"
                      </p>
                    </div>
                  </details>
                </li>

                <li>
                  <details>
                    <summary>
                      <b>Widget: </b>
                    </summary>
                    <ul className="list-disc list-outside px-8">
                      <li>
                        <b>Widget metadata URL: </b>
                        https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/widget
                      </li>
                      <li>
                        <b>Match URL pattern: </b>(any regex you want to match -
                        you can even input your target app url instead) <br />{" "}
                        <b>example:</b>
                        https:\/\/.asana-toolbox.vercel.app\/api\/apps\/AppComponentMaker\/.*
                      </li>
                    </ul>
                  </details>
                </li>
                <li>
                  <details>
                    <summary>
                      <b>Rule Action:</b>
                    </summary>
                    <p>
                      Add a new action and name it as you'd like, then use the
                      following urls:
                    </p>
                    <ul className="list-disc list-outside px-8">
                      <li>
                        <b>Run action URL: </b>
                        https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/rule-run
                      </li>
                      <li>
                        <b>Form metadata URL: </b>
                        https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/rule-form{" "}
                      </li>
                    </ul>
                  </details>
                </li>
                <li>
                  <details>
                    <summary>
                      <b>Modal Form:</b>
                    </summary>
                    <b>Form metadata URL:</b>
                    https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/form
                  </details>
                </li>
              </ul>
            </li>
            <li>
              Finally, under "Install your app", add the authenication url:
              <br></br>
              "https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/auth"
              <br />
              and add your phoenix domain in "Add an organization"
            </li>
          </ol>
        </details>
        <br />
      </div>

      <div>
        For the data configuration, start by selecting the phoenix workspace
        you'd like to configure this for:
      </div>
      <div>
        <div className=" my-4">
          <FormControl fullWidth>
            <InputLabel id="workspace-selector">Workspace</InputLabel>
            <Select
              labelId="workspace-selector"
              id="workspace-simple-select"
              value={currentWorkspace || "none"}
              label="Workspaces"
              onChange={handleWorkspaceChange}
            >
              <MenuItem value="none">Select a workspace</MenuItem>
              {workspaces.map((space) => (
                <MenuItem key={space.gid} value={space.gid}>
                  {space.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {currentWorkspace && currentWorkspace !== "none" && (
          <div>
            <div>
              <b>Widget</b>
              <p>
                Edit the JSON below to configure your Widget, then hit save. To
                see a live preview, use the UI builder provided in the dev
                console here:{" "}
                <a
                  className="text-blue-700"
                  href="https://app.asana.com/0/my-apps/response-builder"
                >
                  https://app.asana.com/0/my-apps/response-builder
                </a>{" "}
                or review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/widget-metadata"
                >
                  https://developers.asana.com/docs/widget-metadata
                </a>{" "}
              </p>
              <ResponseEditor
                initJson={dbRecord.config?.widget || defaultWidget}
                param="widget"
                save={save}
              />
            </div>
            <div>
              <b>Lookup list</b>
              <p>
                Edit the JSON below to configure your lookup list, then hit
                save. This list of items will appear when the user types in the
                box to add a resource in the task pane. You can play around with
                a preview using the UI builder here:
                <a
                  className="text-blue-700"
                  href="https://app.asana.com/0/my-apps/response-builder"
                >
                  https://app.asana.com/0/my-apps/response-builder
                </a>{" "}
                or review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/lookup"
                >
                  https://developers.asana.com/docs/lookup
                </a>{" "}
              </p>
              <ResponseEditor
                initJson={dbRecord.config?.lookup || defaultLookup}
                param="lookup"
                save={save}
              />
            </div>
            <div>
              <b>Attachment</b>
              <p>
                Edit the JSON below to configure your attachment name and
                reference URL, then hit save. This will be the name of the
                "resource" that gets attached to the task. You can review the
                documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/attached-resource"
                >
                  https://developers.asana.com/docs/attached-resource
                </a>{" "}
              </p>
              <ResponseEditor
                initJson={dbRecord.config?.attachment || defaultAttachment}
                param="attachment"
                save={save}
              />
            </div>

            <div>
              <b>Modal Form</b>
              <p>
                Edit the JSON below to configure your Widget, then hit save. To
                see a live preview, use the UI builder provided in the dev
                console here:{" "}
                <a
                  className="text-blue-700"
                  href="https://app.asana.com/0/my-apps/response-builder"
                >
                  https://app.asana.com/0/my-apps/response-builder
                </a>{" "}
                or review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/widget-metadata"
                >
                  https://developers.asana.com/docs/widget-metadata
                </a>{" "}
              </p>
              <ResponseEditor
                initJson={dbRecord.config?.form || defaultForm}
                param="form"
                save={save}
              />
            </div>
            <div>
              <b>Rule Form</b>
              <p>
                Edit the JSON below to configure your Widget, then hit save. To
                see a live preview, use the UI builder provided in the dev
                console here:{" "}
                <a
                  className="text-blue-700"
                  href="https://app.asana.com/0/my-apps/response-builder"
                >
                  https://app.asana.com/0/my-apps/response-builder
                </a>{" "}
                or review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/widget-metadata"
                >
                  https://developers.asana.com/docs/widget-metadata
                </a>{" "}
              </p>
              <ResponseEditor
                initJson={dbRecord.config?.ruleForm || defaultRuleForm}
                param="ruleForm"
                save={save}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const defaultWidget = {
  template: "summary_with_details_v0",
  metadata: {
    title: "My Widget",
    subtitle: "Subtitle text",
    fields: [
      {
        name: "Pill",
        type: "pill",
        text: "Some text",
        color: "green",
      },
      {
        name: "Text",
        type: "text_with_icon",
        text: "Some text",
      },
    ],
    footer: {
      footer_type: "custom_text",
      text: "Last updated today",
    },
  },
};

const defaultLookup = {
  header: "Items",
  items: [
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult1",
      icon_url: "https://www.fillmurray.com/16/16",
    },
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult2",
      icon_url: "https://www.fillmurray.com/16/16",
    },
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult3",
      icon_url: "https://www.fillmurray.com/16/16",
    },
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult4",
      icon_url: "https://www.fillmurray.com/16/16",
    },
  ],
};

const defaultAttachment = {
  resource_name: "Build the Thing",
  resource_url:
    "https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/attachment",
};

const defaultForm = {
  template: "form_metadata_v0",
  metadata: {
    title: "create new resource",
    on_submit_callback:
      "https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/attach",
    fields: [
      {
        type: "multi_line_text",
        id: "multi_line_text",
        name: "Multi-line text field",
        value: "",
        is_required: false,
        placeholder: "Type something...",
      },
      {
        type: "checkbox",
        id: "checkbox",
        is_required: true,
        options: [
          {
            id: "1",
            label: "Checkbox field",
          },
        ],
      },
    ],
  },
};

const defaultRuleForm = {
  template: "form_metadata_v0",
  metadata: {
    on_submit_callback:
      "https://asana-toolbox.vercel.app/api/apps/AppComponentMaker/rule-form",
    fields: [
      {
        type: "multi_line_text",
        id: "multi_line_text",
        name: "Multi-line text field",
        value: "",
        is_required: false,
        placeholder: "Type something...",
      },
      {
        type: "checkbox",
        id: "checkbox",
        is_required: true,
        options: [
          {
            id: "1",
            label: "Checkbox field",
          },
        ],
      },
    ],
  },
};
// todo:
// lookup list of resources, modal form, default attachment, ruleaction - form,
