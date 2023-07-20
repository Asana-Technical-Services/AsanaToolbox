import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Link,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import FormInfo from "./components/FormInfo";

export default function SplashPage() {
  const { data: session } = useSession();

  /* This is a variable of convenience. 
  you can make api calls whenever this is true
  */
  // eslint-disable-next-line no-unused-vars
  const [ready, setReady] = useState(false);
  const [workspace, setWorkspace] = useState("none");
  const [availableWorkspaces, setAvailableWorkspaces] = useState([]);
  const [formResponse, setFormResponse] = useState({
    status: "",
    status_message: "",
    url: "",
  });
  const [currentJson, setCurrentJson] = useState({
    company_size: "",
    project_type: "",
  });

  /* <any requests require you to specify a workspace, 
  so we've provided that here
  */
  const updateField = (index, field) => {
    const tempJson = { ...currentJson };
    tempJson[index] = field;
    setCurrentJson(tempJson);
    setFormResponse({
      status: "",
      status_message: "",
      url: "",
    });
  };

  const submitJsonData = async () => {
    // eslint-disable-next-line camelcase
    const { company_size, industry, project_type, departments } = currentJson;

    console.log(currentJson);
    // eslint-disable-next-line camelcase
    if (!company_size || !industry || !project_type || !departments) {
      setFormResponse({
        status: "error",
        status_message: "Please fill out all fields before submitting.",
      });
      return; // stops the function if any field is empty
    }
    console.log("response ok");

    setFormResponse({
      status: "loading",
      status_message: "Asking ChatGPT...",
    });

    console.log("sending request");

    const response = await fetch(
      `/api/apps/DemoAutoBuilder/build?user=${session.user.gid}&workspace=${workspace}`,
      {
        method: "POST",
        body: JSON.stringify(currentJson),
      }
    );
    
    console.log("got response");
    console.log(response);
    if (!response.ok) {
      console.log("not ok");
      throw new Error("Failed to fetch");
    }

    const data = response.body;
    if (!data) {
      console.log("no data recieved");
      throw new Error("No data received");
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let tempValue = ""; // temporary value to store incomplete json strings

    let url = "";
    let text = "";
    let status = "";
    while (!done) {
      console.log("starting loop");
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      let chunkValue = decoder.decode(value);
      console.log("tempValue: ", tempValue);
      console.log("chunk: ", chunkValue);

      // if there is a temp value, prepend it to the incoming chunk
      if (tempValue) {
        chunkValue = tempValue + chunkValue;
        tempValue = "";
      }
      if (chunkValue.includes("building")) {
        setFormResponse({
          status: "loading",
          status_message: "Building Work Graph...",
        });
      }
      // match url string and extract it from the chunk
      const match = chunkValue.match(/\{(.*?)\}/);
      console.log(match);

      if (match) {
        url = match[1];
        console.log("url: ", url);
        false();
      }

      tempValue = chunkValue;
    }

    if (url !== "") {
      text = "Build complete! Visit: ";
      status = "complete";
    } else {
      text = "recieved an error";
      status = "error";
    }
    setFormResponse({ status, status_message: text, url });
  };

  useEffect(() => {
    const initializeWorkspaces = async () => {
      if (session && session.access_token) {
        /* Do any inialization here, 
        as soon as we have an access token read from the JWT in cookies.
        sometimes the session isn't set on first render, 
        especially if users are navigating directly to your app
        */

        // for convenience, also adding "ready" as a stateful variable.
        setReady(true);

        // if we haven't already, get our available workspaces
        if (availableWorkspaces?.length === 0) {
          const response = await axios.get(
            "https://app.asana.com/api/1.0/workspaces",
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          );
          if (response?.data?.data) {
            setAvailableWorkspaces(response.data.data);
          }
        }
      }
    };
    initializeWorkspaces();
  }, [session, availableWorkspaces]);

  const handleWorkspaceChange = (e) => {
    const targetValue = e.target.value;
    if (targetValue && targetValue !== "none") {
      setWorkspace(targetValue);
    } else {
      setWorkspace("none");
    }
  };

  /* We have Tailwind CSS https://tailwindcss.com/docs/installation
  and Material UI components https://mui.com/material-ui/
  available to import and use
  */

  return (
    <div className="px-4 py-2 m-auto my-20 max-w-2xl flex flex-col content-center">
      <div className="text-4xl  w-auto">Demo Auto Builder</div>
      <FormInfo />
      {/* Workspace Selection */}
      <div className=" my-4">
        <FormControl fullWidth>
          <InputLabel id="workspace-selector">Workspace</InputLabel>
          <Select
            required
            labelId="workspace-selector"
            id="workspace-simple-select"
            value={workspace}
            label="Workspaces"
            onChange={handleWorkspaceChange}
          >
            <MenuItem value="none">Select a workspace</MenuItem>
            {availableWorkspaces.map((space) => (
              <MenuItem key={space.gid} value={space.gid}>
                {space.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {workspace && workspace !== "none" ? (
        <FormControl>
          <Typography variant="h5">Configuration Questions</Typography>
          <p>
            The following questions are used to help shape the input prompt to
            ChatGPT and generate content for the demo environment?
          </p>

          {/* Company Size Selection */}
          <div className="m-5">
            <p>What is the approximate size of the (example) company?</p>
            <Select
              required
              size="small"
              className="full-width"
              displayEmpty
              value={currentJson.company_size}
              onChange={(e) => updateField("company_size", e.target.value)}
            >
              <MenuItem value="">Select one...</MenuItem>
              <MenuItem value="microbusiness">
                Microbusiness (1-9 Employees)
              </MenuItem>
              <MenuItem value="smallbusiness">
                Small Business (10-49 Employees)
              </MenuItem>
              <MenuItem value="mediumbusiness">
                Medium-Sized Business (50-249 Employees)
              </MenuItem>
              <MenuItem value="largebusiness">
                Large Business (250-999 Employees)
              </MenuItem>
              <MenuItem value="enterprisebusiness">
                Enterprise Business (1000+ Employees)
              </MenuItem>
            </Select>
          </div>

          {/* Industry Text Input */}
          <div className="m-5">
            <p>What industry is (example) company in or for?</p>
            <TextField
              required
              id="industry-text"
              label="Industry"
              size="small"
              className="half-width"
              onChange={(e) => updateField("industry", e.target.value)}
            />
          </div>

          {/* Project Type Selection */}
          <div className="m-5">
            <p>What types of projects and sections should be made?</p>
            <Select
              required
              size="small"
              className="full-width"
              displayEmpty
              value={currentJson.project_type}
              onChange={(e) => updateField("project_type", e.target.value)}
            >
              <MenuItem value="">Select one...</MenuItem>
              <MenuItem value="kanban">
                Kanban (e.g. To Do, In Progress, Complete, etc.)
              </MenuItem>
              <MenuItem value="thematic">
                Thematic (e.g. Content, Publishing, References, etc.)
              </MenuItem>
            </Select>
          </div>

          {/* Departments Text Input  */}
          <div className="m-5">
            <p>
              Departments or Business Units (specify any number of departments
              or business units to generate portfolios for the company,
              separated by commas - example: Product Management, Finance, IT,
              Procurement)
            </p>
            <TextField
              required
              id="departments-text"
              label="Departments"
              size="small"
              className="full-width"
              onChange={(e) => updateField("departments", e.target.value)}
            />
          </div>

          {/* Submit Form Button  */}
          <Button variant="outlined" onClick={submitJsonData}>
            Submit
          </Button>
        </FormControl>
      ) : null}

      <div className="m-5 flex flex-col items-center">
        {formResponse.status === "error" ? (
          <Typography className="red text-lg mb-3">
            {formResponse.status_message}
          </Typography>
        ) : (
          <Typography className="text-blue-700 text-lg mb-3">
            {formResponse.status_message}
          </Typography>
        )}

        {formResponse?.url ? (
          <Link
            href={formResponse.url}
            className="underline text-blue-500 hover:text-blue-700"
          >
            {formResponse.url}
          </Link>
        ) : null}
        {formResponse.status && formResponse.status === "loading" && (
          <LinearProgress color="secondary" className="mt-3 w-full" />
        )}
      </div>
    </div>
  );
}
