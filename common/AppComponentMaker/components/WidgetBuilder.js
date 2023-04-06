import { useState } from "react";
import WidgetFieldEditor from "./WidgetFieldEditor";
import { TextField, Typography, Button } from "@mui/material";
const WidgetBulder = ({ initJson, param, save }) => {
  const [currentJson, setCurrentJson] = useState(initJson);
  const [isSaved, setIsSaved] = useState(false);
  const [fields, setFields] = useState(initJson.metadata.fields || []);

  const saveJson = () => {
    save(param, currentJson);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const updateField = ({ index, field }) => {
    let tempJson = { ...currentJson };
    tempJson.metadata.fields[index] = field;
    setCurrentJson(tempJson);
  };

  const deleteField = (index) => {
    let tempJson = { ...currentJson };
    console.log(tempJson);
    tempJson.metadata.fields.splice(index, 1);
    setCurrentJson(tempJson);
  };

  const addField = () => {
    let tempJson = currentJson;
    let newArray = [...currentJson.metadata.fields];
    newArray.push({
      color: "green",
      name: "Status",
      text: "In Progress",
      type: "pill",
    });
    tempJson.metadata.fields = newArray;
    setCurrentJson(tempJson);
    setFields(newArray);
  };

  const updateJson = (field, value) => {
    let tempJson = { ...currentJson };
    if (field in ["subtitle", "subicon_url"] && value === "") {
      delete tempJson[field];
    } else {
      tempJson.metadata[field] = value;
    }
    setCurrentJson(tempJson);
  };

  const updateFooter = (field, value) => {
    let tempJson = { ...currentJson };
    if (field === "icon_url" && value === "") {
      delete tempJson[field];
    } else {
      tempJson.metadata.footer[field] = value;
    }
    setCurrentJson(tempJson);
  };

  return (
    <div fullWidth>
      <div className="block m-5"></div>
      <Typography variant="h5" className="block">
        Header:
      </Typography>
      <TextField
        margin="normal"
        required
        size="small"
        className="full-width"
        label="Resource Name"
        value={currentJson.metadata.title}
        onChange={(e) => updateJson("title", e.target.value)}
      />
      <TextField
        margin="normal"
        className="half-width"
        size="small"
        label="subtitle icon url"
        onChange={(e) => updateJson("subicon_url", e.target.value)}
        value={currentJson.metadata.subicon_url || ""}
      />
      <TextField
        margin="normal"
        label="subtitle"
        className="half-width"
        size="small"
        value={currentJson.metadata.subtitle || ""}
        onChange={(e) => updateJson("subtitle", e.target.value)}
      />
      <div className="block m-5"></div>
      <Typography variant="h5">Fields:</Typography>
      <hr></hr>
      {currentJson.metadata.fields.map((field, index) => (
        <div key={index}>
          <WidgetFieldEditor
            field={field}
            index={index}
            updateField={updateField}
            deleteField={deleteField}
          ></WidgetFieldEditor>
          <hr></hr>
        </div>
      ))}
      {currentJson.metadata.fields.length < 4 && (
        <div className="m-5 flex">
          <Button className="only:w-fit px-5 py-2 m-auto " onClick={addField}>
            + add field
          </Button>
        </div>
      )}
      <Typography variant="h5">Footer:</Typography>
      <TextField
        margin="normal"
        className="full-width"
        label="footer text"
        size="small"
        value={currentJson.metadata.footer.text || ""}
        onChange={(e) => updateFooter("text", e.target.value)}
      />
      <TextField
        margin="normal"
        label="Footer icon url (optional)"
        className="half-width"
        size="small"
        onChange={(e) => updateFooter("icon_url", e.target.value)}
        value={currentJson.metadata.footer.icon_url || ""}
      />
      <TextField
        margin="normal"
        className="half-width"
        size="small"
        type="number"
        label="Number of Comments (optional)"
        onChange={(e) => updateJson("num_comments", Number(e.target.value))}
        value={currentJson.metadata.num_comments || ""}
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

export default WidgetBulder;
