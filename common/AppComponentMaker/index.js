import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Button,
  Typography,
  setRef,
} from "@mui/material";
import axios from "axios";
import LookupBuilder from "./components/LookupBuilder";
import WidgetBulder from "./components/WidgetBuilder";
import AttachmentBuilder from "./components/AttachmentBuilder";
import FormBuilder from "./components/FormBuilder";

export default function Component() {
  const { data: session } = useSession();

  // many requests require you to specify a workspace, so we've provided that here
  const [workspaces, setAvailableWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState();
  const [dbRecord, setDbRecord] = useState({});
  const [jsonStatus, setJsonStatus] = useState();
  const [tempJson, setTempJson] = useState({});
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    if (dbRecord?.config) {
      setTempJson(JSON.stringify(dbRecord.config));
    }
  }, [dbRecord, setTempJson]);

  useEffect(() => {
    if (session && session.access_token) {
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

  const handleJsonChange = (e) => {
    setTempJson(e.target.value);
  };

  const saveJson = async () => {
    try {
      let newDbRecord = dbRecord;
      newDbRecord.config = JSON.parse(tempJson);

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
        setJsonStatus("Saved!");
        setTimeout(() => setJsonStatus(), 2000);
        return true;
      } else {
        setJsonStatus("Invalid Json! cannot save!");
        setTimeout(() => setJsonStatus(), 2000);
        return false;
      }
    } catch {
      setJsonStatus("Invalid Json! cannot save!");
      setTimeout(() => setJsonStatus(), 2000);
      return false;
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(tempJson).then(
      () => {
        setCopyStatus(true);
        setTimeout(() => {
          setCopyStatus(false);
        }, 1000);
      },
      () => {}
    );
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

  return (
    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <h1>Custom App Component Config</h1>
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
            <div className="block m-3"></div>
            <details>
              <summary>full json for quick import/export</summary>
              <div>
                <p>
                  only use this for copy/pasting of config data, this could
                  potentially lock the app configurations below
                </p>
                {jsonStatus && <div>{jsonStatus}</div>}
                <TextField
                  margin="normal"
                  className="full-width"
                  id={"full_json_export_import"}
                  label="Full Config Json"
                  value={tempJson}
                  onChange={handleJsonChange}
                />
                {copyStatus && <div className="bg-green-700">{"copied!"}</div>}
                <Button onClick={copyJson}>Copy Json</Button>
                <Button onClick={saveJson}> Save</Button>
              </div>
            </details>
            <div className="block m-3"></div>

            <div>
              <Typography variant="h3">Widget</Typography>
              <p>
                Edit the configuration below to set up your Widget, then hit
                save. To see a live preview, attach a resource to a task and
                refresh your widget in Asana. Check out the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/widget-metadata"
                >
                  https://developers.asana.com/docs/widget-metadata
                </a>{" "}
              </p>
              <WidgetBulder
                key={dbRecord.config?.widget}
                initJson={dbRecord.config?.widget || defaultWidget}
                param="widget"
                save={save}
              />
            </div>
            <div>
              <br></br>
              <Typography variant="h3">Lookup list</Typography>
              <p>
                Edit the configuration below, then hit save. This list of items
                will appear when the user types in the box to add a resource in
                the task pane. You can review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/lookup"
                >
                  https://developers.asana.com/docs/lookup
                </a>{" "}
              </p>
              <LookupBuilder
                key={dbRecord.config?.lookup}
                initJson={dbRecord.config?.lookup || defaultLookup}
                save={save}
              />
            </div>
            <div>
              <Typography variant="h3">Attachment</Typography>
              <p>
                Edit the config below to set your attachment name and reference
                URL, then hit save. This will be the name of the "resource" that
                gets attached to the task. You can review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/docs/attached-resource"
                >
                  https://developers.asana.com/docs/attached-resource
                </a>{" "}
              </p>
              <AttachmentBuilder
                key={dbRecord.config?.attachment}
                initJson={dbRecord.config?.attachment || defaultAttachment}
                save={save}
              />
            </div>

            <div>
              <Typography variant="h3">Modal Form</Typography>
              <p>
                Edit the config below to add fields to your form, then hit save.
                To see a live preview, open your app in your Asana environment.
                Check out the documentation on modal forms here:
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/reference/modal-forms"
                >
                  https://developers.asana.com/reference/modal-forms
                </a>{" "}
              </p>
              <FormBuilder
                key={dbRecord.config?.form}
                initJson={dbRecord.config?.form || defaultForm}
                param="form"
                save={save}
              />
            </div>
            <div>
              <Typography variant="h3">Rule Form</Typography>
              <p>
                Edit the config below to configure your Rule form, then hit
                save. To see a live preview, open the rule builder in Asana for
                your app. or review the documentation at{" "}
                <a
                  className="text-blue-700"
                  href="https://developers.asana.com/reference/rule-actions#formmetadata"
                >
                  https://developers.asana.com/reference/rule-actions#formmetadata
                </a>{" "}
              </p>
              <FormBuilder
                key={dbRecord.config?.widget}
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
    },
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult2",
    },
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult3",
    },
    {
      title: "Item title",
      subtitle: "Item subtitle",
      value: "searchResult4",
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
        name: "Describe your ask",
        value: "",
        is_required: false,
      },
      {
        type: "checkbox",
        id: "checkbox",
        name: "Select all that apply",
        is_required: true,
        options: [
          {
            id: "1",
            label: "project 1",
          },
          {
            id: "2",
            label: "project 2",
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
        name: "Standard description to be used:",
        value: "",
        is_required: false,
      },
      {
        type: "checkbox",
        id: "checkbox",
        name: "Select projects to include",
        is_required: true,
        options: [
          {
            id: "1",
            label: "project 1",
          },
          {
            id: "2",
            label: "project 2",
          },
        ],
      },
    ],
  },
};
