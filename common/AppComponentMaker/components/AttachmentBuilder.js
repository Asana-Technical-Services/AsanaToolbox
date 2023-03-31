import { useState } from "react";
import WidgetFieldEditor from "./WidgetFieldEditor";
import {
  FormControl,
  TextField,
  Typography,
  Select,
  Button,
  MenuItem,
} from "@mui/material";
const AttachmentBuilder = ({ initJson, save }) => {
  const [currentJson, setCurrentJson] = useState(initJson);
  const [isSaved, setIsSaved] = useState(false);

  const updateJson = (field, value) => {
    let tempJson = { ...currentJson };

    tempJson[field] = value;

    setCurrentJson(tempJson);
  };

  const saveJson = () => {
    save("attachment", currentJson);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div fullWidth>
      <div className="block m-5"></div>
      <TextField
        margin="normal"
        required
        className="full-width"
        label="resource name"
        value={currentJson.resource_name}
        onChange={(e) => updateJson("resource_name", e.target.value)}
      />
      <TextField
        margin="normal"
        required
        className="full-width"
        label="resource url"
        value={currentJson.resource_url}
        onChange={(e) => updateJson("resource_url", e.target.value)}
      />
      <div className="m-5 flex">
        <Button
          margin="normal"
          onClick={() => saveJson(currentJson)}
          className="w-fit px-5 py-2 m-auto  bg-blue-500 text-white rounded-full"
        >
          {" "}
          Save{" "}
        </Button>
      </div>{" "}
      {isSaved && <div className="bg-green-400"> Saved! </div>}
    </div>
  );
};

export default AttachmentBuilder;
