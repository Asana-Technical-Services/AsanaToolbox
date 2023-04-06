import {
  FormControl,
  TextField,
  Select,
  Button,
  MenuItem,
  InputLabel,
} from "@mui/material";
import CheckboxQuestion from "./CheckboxQuestion";
import GenericQuestion from "./GenericQuestion";

const FormFieldBuilder = ({ index, field, updateField, deleteField }) => {
  const handleUpdate = (key, value) => {
    let newField = field;

    newField[key] = value;
    updateField({ index, field: newField });
  };

  const changeFieldType = (type) => {
    let newField = {};
    if (type !== field.type) {
      if (type === "checkbox") {
        newField = sampleCheckbox;
        newField.id = field.id;
      } else if (type === "date") {
        newField = sampleDate;
        newField.id = field.id;
      } else if (type === "datetime") {
        newField = sampleDateTime;
        newField.id = field.id;
      } else if (type === "dropdown") {
        newField = sampleDropdown;
        newField.id = field.id;
      } else if (type === "multi_line_text") {
        newField = sampleMultiLineText;
        newField.id = field.id;
      } else if (type === "radio_button") {
        newField = sampleRadioButton;
        newField.id = field.id;
      } else if (type === "rich_text") {
        newField = sampleRichText;
        newField.id = field.id;
      } else if (type === "single_line_text") {
        newField = sampleSingleLineText;
        newField.id = field.id;
      } else if (type === "static_text") {
        newField = sampleStaticText;
        newField.id = field.id;
      }

      updateField({ index, field: newField });
    }
  };
  console.log(field.type);

  return (
    <div fullWidth className=" py-4 px-2 border-l-gray-300 border-l-2">
      <FormControl variant="standard" size="small" fullWidth>
        <InputLabel
          id={"field-type-label-" + index}
          htmlFor={"field-type-simple-select" + index}
        >
          Field Type
        </InputLabel>

        <Select
          margin="normal"
          label="Field Type"
          labelId={"field-type-label-" + index}
          id={"field-type-simple-select" + index}
          value={field.type}
          onChange={(e) => changeFieldType(e.target.value)}
        >
          <MenuItem value={"checkbox"}>Checkbox</MenuItem>
          <MenuItem value={"date"}>Date</MenuItem>
          <MenuItem value={"datetime"}>Datetime</MenuItem>
          <MenuItem value={"dropdown"}>Dropdown</MenuItem>
          <MenuItem value={"multi_line_text"}>Multi-Line Text</MenuItem>
          <MenuItem value={"single_line_text"}>Single Line Text</MenuItem>
          <MenuItem value={"rich_text"}>Rich Text</MenuItem>
          <MenuItem value={"radio_button"}>Radio Button</MenuItem>
          <MenuItem value={"static_text"}>Static Text Block</MenuItem>
        </Select>
      </FormControl>
      {["checkbox", "dropdown", "radio_button"].includes(field.type) && (
        <CheckboxQuestion
          field={field}
          updateField={handleUpdate}
        ></CheckboxQuestion>
      )}
      {[
        "date",
        "datetime",
        "multi_line_text",
        "single_line_text",
        "rich_text",
      ].includes(field.type) && (
        <GenericQuestion
          field={field}
          updateField={handleUpdate}
        ></GenericQuestion>
      )}
      {field.type === "static_text" && (
        <TextField
          margin="normal"
          id="outlined-text"
          label="Static Form Text"
          className="half-width"
          value={field.name}
          onChange={(e) => handleUpdate("name", e.target.value)}
        />
      )}
      <Button
        margin="normal"
        size="small"
        fullWidth
        className="red"
        onClick={() => deleteField(index)}
      >
        Delete Field
      </Button>
    </div>
  );
};

export default FormFieldBuilder;

const sampleCheckbox = {
  is_required: false,
  name: "select all that apply",
  options: [
    {
      id: "opt-in",
      label: "Opt in",
    },
  ],
  type: "checkbox",
  value: [],
};

const sampleDate = {
  is_required: false,
  name: "Due Date",
  type: "date",
  value: "",
};

const sampleDateTime = {
  is_required: false,
  name: "Due Date and Time",
  type: "datetime",
  value: "",
};

const sampleDropdown = {
  is_required: false,
  name: "Select from the following:",
  options: [
    {
      id: "red",
      label: "Red",
    },
  ],
  type: "dropdown",
  value: "",
  width: "full",
};

const sampleMultiLineText = {
  is_required: false,
  name: "Describe your request",
  type: "multi_line_text",
  value: "",
};

const sampleRadioButton = {
  is_required: false,
  name: "Select the one that applies",
  options: [
    {
      id: "radio_option_0",
      label: "Radio Option 1",
    },
  ],
  type: "radio_button",
  value: "",
};

const sampleRichText = {
  is_required: false,
  name: "Describe your Ask in Rich Text",
  type: "rich_text",
  value: "",
};

const sampleSingleLineText = {
  is_required: false,
  name: "your name",
  type: "single_line_text",
  value: "",
  width: "full",
};

const sampleStaticText = {
  name: "Please enter the following details:",
  type: "static_text",
};
