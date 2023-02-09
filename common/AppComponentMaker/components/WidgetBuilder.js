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
import JSONInput from "react-json-editor-ajrm";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";

const ResponseEditor = ({ initJson, param, save }) => {
  const [currentJson, setCurrentJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    let newjson = {};

    try {
      newjson = JSON.stringify(initJson, null, 2);
    } catch (error) {
      console.log(error);
    }

    setCurrentJson(newjson);
  }, [initJson]);
  


  const saveJson = () => {
    setJsonError("");
    try {
      let jsonToSave = JSON.parse(currentJson);
      save(param, jsonToSave);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      setJsonError(e.toString());
    }
  };
  console.log(currentJson);
  return (
    <FormControl fullWidth>
      <CodeMirror
        id={param + "input"}
        value={currentJson}
        onChange={setCurrentJson}
        labelId="widget-entry"
        extensions={[jsonLanguage, json()]}
      />
      {jsonError || ""}
      {
        <Button
          onClick={saveJson}
          class="w-fit px-5 py-2 m-auto bg-blue-500 text-white rounded-full"
        >
          {" "}
          Save{" "}
        </Button>
      }
      {isSaved && <div className="bg-green-400"> Saved! </div>}
    </FormControl>
  );
};

export default ResponseEditor;


{
  "metadata": {
    "error": "The resource cannot be accessed",
    "fields": [],
    "footer": {},
    "num_comments": 2,
    "subicon_url": "https://example-icon.png",
    "subtitle": "Custom App Story · Open in Custom App",
    "title": "Status"
  },
  "template": "summary_with_details_v0"
}