import { useState } from "react";
import { TextField, Typography, Button } from "@mui/material";
const LookupBuilder = ({ initJson, save }) => {
  const [currentJson, setCurrentJson] = useState(initJson);
  const [isSaved, setIsSaved] = useState(false);

  const saveJson = () => {
    save("lookup", currentJson);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const deleteListItem = (index) => {
    let tempJson = { ...currentJson };
    console.log(tempJson);
    tempJson.items.splice(index, 1);
    setCurrentJson(tempJson);
  };

  const addListItem = () => {
    let tempItems = [...currentJson.items];
    tempItems.push({
      title: "List Item",
      value: "seachresult",
      subtitle: "",
    });
    updateJson("items", tempItems);
  };

  const updateListItem = (index, field, value) => {
    let tempItems = [...currentJson.items];
    if (field === "subtitle" && value === "") {
      delete tempItems[index][field];
    } else {
      tempItems[index][field] = value;
    }
    updateJson("items", tempItems);
  };

  const updateJson = (field, value) => {
    let tempJson = { ...currentJson };

    tempJson[field] = value;

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
        className="full-width"
        label="List Header (optional)"
        value={currentJson.header}
        onChange={(e) => updateJson("header", e.target.value)}
      />
      <div className="block m-5"></div>
      <Typography variant="h5">Typeahead Items:</Typography>
      <hr></hr>
      {currentJson.items.map((item, index) => (
        <div key={index}>
          <TextField
            margin="normal"
            required
            className="full-width"
            label="List item title"
            value={item.title}
            onChange={(e) => updateListItem(index, "title", e.target.value)}
          />
          <TextField
            margin="normal"
            required
            className="full-width"
            label="List item subtitle (optional)"
            value={item.subtitle}
            onChange={(e) => updateListItem(index, "subtitle", e.target.value)}
          />
          <Button
            margin="normal"
            onClick={() => deleteListItem(index)}
            className=" px-5 py-2 m-auto  text-red w-full"
          >
            {" "}
            Delete{" "}
          </Button>
          <br></br>
          <hr></hr>
        </div>
      ))}
      <div className="m-5 flex">
        <Button className="only:w-fit px-5 py-2 m-auto " onClick={addListItem}>
          + add list Item
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

export default LookupBuilder;
