import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Input,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Button,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import JSONInput from "react-json-editor-ajrm";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";

export default function Component() {
  const { data: session } = useSession();

  // this is a variable of convenience. you can make api calls whenever this is true
  const [ready, setReady] = useState(false);

  // many requests require you to specify a workspace, so we've provided that here
  const [workspaces, setAvailableWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState();
  const [widgetJson, setWidgetJson] = useState("");
  const [widgetValid, setWidgetValid] = useState(true);
  const [dbRecord, setDbRecord] = useState({});
  const [jsonError, setJsonError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (session && session.access_token) {
      // do any inialization here - as soon as we have an access token read from the JWT in cookies.
      // sometimes the session isn't set on first render, especially if users are navigating directly to your app

      // for convenience, also adding "ready" as a stateful variable.
      setReady(true);
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
  }, [session]);

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
          setWidgetJson(JSON.stringify(body.config.widget, null, 2));
          return;
        }
        return;
      }
    } else {
      setCurrentWorkspace("none");
      setWidgetJson("");
      setDbRecord({});
    }
  };

  const save = async () => {
    let parsedWidget;
    try {
      parsedWidget = JSON.parse(widgetJson);
    } catch (e) {
      console.log(e.toString());
      setJsonError("error!" + e.toString());
      return;
    }
    setJsonError("");
    let newDbRecord = dbRecord;

    newDbRecord.config = { ...dbRecord?.config, widget: parsedWidget };
    let res = await fetch(
      "/api/apps/AppComponentMaker/config?user=" +
        session.user.gid +
        "&workspace=" +
        currentWorkspace,
      { method: "POST", body: JSON.stringify(newDbRecord) }
    );
    if (res.ok) {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }
    if (res.data) {
      setDbRecord(res.data);
      setWidgetJson(res.data?.config?.widget);
    }
  };

  const updateWidgetJson = (e) => {
    setWidgetJson(e);
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
          <ol className=" px-8 list-disc list-inside">
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
                </a>
              </p>
            </div>
            <FormControl fullWidth>
              <CodeMirror
                id="widget-input"
                value={widgetJson}
                onChange={updateWidgetJson}
                labelId="widget-entry"
                extensions={[jsonLanguage, json()]}
              />
              {jsonError || ""}
              {widgetValid && (
                <Button
                  onClick={save}
                  class="w-fit px-5 py-2 m-auto bg-blue-500 text-white rounded-full"
                >
                  {" "}
                  Save{" "}
                </Button>
              )}
              {isSaved && <div className="bg-green-400"> Saved! </div>}
            </FormControl>
          </div>
        )}
      </div>
    </div>
  );
}

const defaultJson = {
  template: "summary_with_details_v0",
  metadata: {
    title: "My Widget",
    subtitle: "Subtitle text",
    fields: [
      {
        name: "Text",
        type: "text_with_icon",
        text: "Some text",
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
// todo:
// lookup list of resources, modal form, default attachment, ruleaction - form,
