import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Input,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import JSONInput from "react-json-editor-ajrm";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";

export default function component() {
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
      <div>!</div>
      <div>this is a sample app which can be developed upon</div>
      <div> for example, here are your user's current workspaces:</div>
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

        {currentWorkspace && currentWorkspace != "none" && (
          <FormControl fullWidth>
            <CodeMirror
              id="widget-input"
              value={widgetJson}
              onChange={updateWidgetJson}
              labelId="widget-entry"
              extensions={[jsonLanguage, json()]}
            />
            {jsonError || ""}
            {widgetValid && <button onClick={save}> Save </button>}
          </FormControl>
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



