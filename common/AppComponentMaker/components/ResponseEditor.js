import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonLanguage } from "@codemirror/lang-json";

const ResponseEditor = ({ initJson, param, save }) => {
  const [currentJson, setCurrentJson] = useState("");
  const [isSaved, setIsSaved] = useState(false);
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
    <div fullWidth>
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
          Save
        </Button>
      }
      {isSaved && <div className="bg-green-400"> Saved! </div>}
    </div>
  );
};

export default ResponseEditor;
