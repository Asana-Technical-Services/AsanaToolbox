import { useState } from "react";
import { TextField, Typography, Button } from "@mui/material";
import FormFieldBuilder from "./FormComponents/FormFieldBuilder";
const FormBuilder = ({ initJson, param, save }) => {
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
    tempJson.metadata.fields = tempJson.metadata.fields.map((field, index) => {
      field.id = `field_${index}`;
      return field;
    });
    setCurrentJson(tempJson);
  };

  const addField = () => {
    let tempJson = currentJson;
    let newArray = [...currentJson.metadata.fields];
    newArray.push({
      name: "Multi-line text field",
      id: `field_${newArray.length + 1}`,
      placeholder: "Type something...",
      type: "multi_line_text",
      value: "",
      is_required: false,
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

  return (
    <div>
      <div className="block m-5"></div>
      <TextField
        margin="normal"
        required
        className="full-width"
        label="Form Title"
        value={currentJson.metadata.title}
        onChange={(e) => updateJson("title", e.target.value)}
      />
      <div className="block m-5"></div>
      <Typography variant="h5">Fields:</Typography>
      <hr></hr>
      {currentJson.metadata.fields.map((field, index) => (
        <div key={index}>
          <FormFieldBuilder
            field={field}
            index={index}
            updateField={updateField}
            deleteField={deleteField}
          />
          <hr></hr>
        </div>
      ))}
      <div className="m-5 flex">
        <Button className="only:w-fit px-5 py-2 m-auto " onClick={addField}>
          + add field
        </Button>
      </div>
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

export default FormBuilder;
