import {
  FormControl,
  TextField,
  Select,
  Button,
  MenuItem,
  InputLabel,
  Typography,
} from "@mui/material";
const WidgetFieldEditor = ({ index, field, updateField, deleteField }) => {
  const handleUpdate = (key, value) => {
    let newField = field;
    if (key == "icon_url" && value == "") {
      delete newField[key];
    } else {
      newField[key] = value;
    }
    updateField({ index, field: newField });
  };

  const changeFieldType = (type) => {
    let newField = {};
    if (type !== field.type) {
      if (type === "text_with_icon") {
        newField = {
          icon_url: "https://example-icon.png",
          name: "Status",
          text: "In Progress",
          type: "text_with_icon",
        };
      } else {
        newField = {
          name: "Status",
          text: "In Progress",
          color: "green",
          type: "pill",
        };
      }

      updateField({ index, field: newField });
    }
  };

  if (field.type == "pill") {
    return (
      <div fullWidth className="widgetform py-4">
        <Typography variant="h6" className="full-width" gutterBottom>
          Pill field
        </Typography>
        <FormControl fullWidth className="half-width">
          <InputLabel
            id={"field-type-label-" + index}
            htmlFor={"field-type-simple-select" + index}
          >
            Field Type
          </InputLabel>

          <Select
            margin="normal"
            label="Field Type"
            className="half-width"
            labelId={"field-type-label-" + index}
            id={"field-type-simple-select" + index}
            value={field.type}
            onChange={(e) => changeFieldType(e.target.value)}
          >
            <MenuItem value={"pill"}>pill</MenuItem>
            <MenuItem value={"text_with_icon"}>text</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="normal"
          className="full-width"
          id={"outlined-name" + index}
          label="Name"
          required
          value={field.name}
          onChange={(e) => handleUpdate("name", e.target.value)}
        />
        <FormControl margin="normal" className="half-width">
          <InputLabel id={"color-simple-select-label" + index}>
            color
          </InputLabel>

          <Select
            labelId={"color-simple-select-label" + index}
            id={"color-simple-select" + index}
            label="color"
            value={field.color}
            onChange={(e) => handleUpdate("color", e.target.value)}
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
        </FormControl>
        <TextField
          margin="normal"
          id="outlined-text"
          label="Text"
          className="half-width"
          value={field.text}
          onChange={(e) => handleUpdate("text", e.target.value)}
        />
        <Button
          margin="normal"
          fullWidth
          className="red"
          onClick={() => deleteField(index)}
        >
          Delete Field
        </Button>
      </div>
    );
  } else if (field.type == "text_with_icon") {
    return (
      <div className="widgetform py-4">
        <Typography className="full-width" variant="h6" gutterBottom>
          Text Field with Icon
        </Typography>
        <FormControl fullWidth className="half-width">
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
            className="half-width"
            onChange={(e) => changeFieldType(e.target.value)}
          >
            <MenuItem value={"pill"}>pill</MenuItem>
            <MenuItem value={"text_with_icon"}>text</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="normal"
          id={"outlined-name" + index}
          className="full-width"
          required
          label="Name"
          value={field.name}
          onChange={(e) => handleUpdate("name", e.target.value)}
        />
        <TextField
          margin="normal"
          className="half-width"
          id={"icon_url_field" + index}
          label="Icon Url (optional)"
          value={field.icon_url}
          onChange={(e) => handleUpdate("icon_url", e.target.value)}
        />

        <TextField
          margin="normal"
          className="half-width"
          id={"outlined-text" + index}
          label="Text"
          value={field.text}
          onChange={(e) => handleUpdate("text", e.target.value)}
        />
        <Button
          className="red"
          margin="normal"
          fullWidth
          onClick={() => deleteField(index)}
        >
          Delete Field
        </Button>
      </div>
    );
  }
};

export default WidgetFieldEditor;
