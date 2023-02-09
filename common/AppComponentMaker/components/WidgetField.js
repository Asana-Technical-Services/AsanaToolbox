import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Input,
  InputLabel,
  Skeleton,
  FormControl,
  TextField,
  Select,
  Button,
  MenuItem,
  LocalizationProvider,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import JSONInput from "react-json-editor-ajrm";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";

const ResponseEditor = ({ index, field, updateField, deleteField }) => {
  const handleDateChange = (value) => {
    console.log(value);
    handleUpdate("datetime", value);
  };

  const handleUpdate = (key, value) => {
    let newField = field;
    newField[key] = value;
    updateField({ index, newField });
  };

  if (field.type === "datetime_with_icon") {
    return (
      <FormControl>
        <div>DateTime Field with Icon</div>
        <TextField
          id="outlined-name"
          label="Name"
          value={field.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <TextField
          id="icon"
          label="icon URL - optional"
          value={field.icon_url}
          onChange={(e) => updateField("icon_url", e.target.value)}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
            value={field.datetime}
          />
        </LocalizationProvider>
        <Button color="red" onClick={() => deleteField(index)}>
          Delete Field
        </Button>
      </FormControl>
    );
  } else if (field.type === "pill") {
    return (
      <FormControl>
        <div>Pill field</div>
        <TextField
          id="outlined-name"
          label="Name"
          value={field.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={field.color}
          label="color"
          onChange={(e) => updateField("color", e.target.value)}
        >
          <MenuItem value={"none"}>none</MenuItem>
          <MenuItem value={"red"}>red</MenuItem>
          <MenuItem value={"orange"}>orange</MenuItem>
          <MenuItem value={"yellow-orange"}>yellow-orange</MenuItem>
          <MenuItem value={"yellow"}>yellow</MenuItem>
          <MenuItem value={"yellow-green"}>yellow-green</MenuItem>
          <MenuItem value={"green"}>green</MenuItem>
          <MenuItem value={"blue-green"}>blue-green</MenuItem>
          <MenuItem value={"aqua"}>aqua</MenuItem>
          <MenuItem value={"blue"}>blue</MenuItem>
          <MenuItem value={"indigo"}>indigo</MenuItem>
          <MenuItem value={"purple"}>purple</MenuItem>
          <MenuItem value={"hot-pink"}>hot-pink</MenuItem>
          <MenuItem value={"pink"}>pink</MenuItem>
          <MenuItem value={"cool-gray"}>cool-gray</MenuItem>
        </Select>
        <TextField
          id="outlined-text"
          label="Text"
          value={field.text}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <Button color="red" onClick={() => deleteField(index)}>
          Delete Field
        </Button>
      </FormControl>
    );
  } else if (field.type === "text_with_icon") {
    <FormControl>
      <div>Text field with Icon</div>
      <TextField
        id="outlined-name"
        label="Name"
        value={field.name}
        onChange={(e) => updateField("name", e.target.value)}
      />
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={field.color}
        label="color"
        onChange={(e) => updateField("color", e.target.value)}
      >
        <MenuItem value={"none"}>none</MenuItem>
        <MenuItem value={"red"}>red</MenuItem>
        <MenuItem value={"orange"}>orange</MenuItem>
        <MenuItem value={"yellow-orange"}>yellow-orange</MenuItem>
        <MenuItem value={"yellow"}>yellow</MenuItem>
        <MenuItem value={"yellow-green"}>yellow-green</MenuItem>
        <MenuItem value={"green"}>green</MenuItem>
        <MenuItem value={"blue-green"}>blue-green</MenuItem>
        <MenuItem value={"aqua"}>aqua</MenuItem>
        <MenuItem value={"blue"}>blue</MenuItem>
        <MenuItem value={"indigo"}>indigo</MenuItem>
        <MenuItem value={"purple"}>purple</MenuItem>
        <MenuItem value={"hot-pink"}>hot-pink</MenuItem>
        <MenuItem value={"pink"}>pink</MenuItem>
        <MenuItem value={"cool-gray"}>cool-gray</MenuItem>
      </Select>
      <TextField
        id="outlined-text"
        label="Text"
        value={field.text}
        onChange={(e) => updateField("name", e.target.value)}
      />
      <Button color="red" onClick={() => deleteField(index)}>
        Delete Field
      </Button>
    </FormControl>;
  }
};

export default ResponseEditor;
