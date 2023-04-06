import {
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";

const GenericQuestion = ({ updateField, field }) => {
  return (
    <div
      fullWidth
      className="widgetform py-4 px-2 border-l-gray-300 border-l-2"
    >
      <TextField
        margin="normal"
        id="outlined-text"
        label="Question Name"
        size="small"
        className="half-width"
        value={field.name}
        onChange={(e) => updateField("name", e.target.value)}
      />
      <FormControlLabel
        label="Required?"
        control={
          <Checkbox
            checked={field.checked}
            onChange={(e) => {
              updateField("is_required", e.target.checked);
            }}
            inputProps={{ "aria-label": "controlled" }}
          />
        }
      />

      {field.type === "single_line_text" && (
        <FormControl className="full-width" size="small">
          <InputLabel
            id={"field-width-label" + field.id}
            htmlFor={"field-type-simple-select" + field.id}
          >
            Field Width
          </InputLabel>

          <Select
            margin="normal"
            label="Field Type"
            className="half-width"
            labelId={"field-width-label" + field.id}
            id={"field-type-simple-select" + field.id}
            value={field.width}
            onChange={(e) => updateField("width", e.target.value)}
          >
            <MenuItem value={"full"}>Full width</MenuItem>
            <MenuItem value={"half"}>Half width</MenuItem>
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default GenericQuestion;
