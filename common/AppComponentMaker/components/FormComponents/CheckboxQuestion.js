import {
  TextField,
  Button,
  Checkbox,
  MenuItem,
  FormControl,
  FormControlLabel,
  Select,
  InputLabel,
  Typography,
} from "@mui/material";

const CheckboxQuestion = ({ updateField, field }) => {
  const updateOptionLabel = (index, value) => {
    let tempOptions = [...field.options];
    tempOptions[index].label = value;
    updateField("options", tempOptions);
  };
  console.log("rendered!");

  const deleteOption = (index) => {
    let tempOptions = [...field.options];
    tempOptions.splice(index, 1);
    tempOptions = tempOptions.map((field, index) => {
      field.id = `field_option_${index}`;
      return field;
    });
    updateField("options", tempOptions);
  };

  const addOption = () => {
    let tempOptions = [...field.options];

    tempOptions.push({
      id: `field_option_${tempOptions.length}`,
      label: "new option",
    });
    updateField("options", tempOptions);
  };

  return (
    <div fullWidth className="py-4 px-2 border-l-gray-300 border-l-2">
      <TextField
        margin="normal"
        id="outlined-text"
        label="Question Name"
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
      <Typography variant="h6"> Field Options: </Typography>
      {field.options.map((option, index) => (
        <div key={field.id + "dropdown_option_" + index}>
          <hr></hr>
          <TextField
            margin="normal"
            id="outlined-text"
            label="Option Name"
            className="half-width"
            value={option.label}
            onChange={(e) => updateOptionLabel(index, e.target.value)}
          />
          <Button
            margin="normal"
            fullWidth
            className="red"
            onClick={() => deleteOption(index)}
          >
            Delete option
          </Button>
        </div>
      ))}
      <Button
        margin="normal"
        fullWidth
        className=" text-blue-500"
        onClick={() => addOption()}
      >
        + add option
      </Button>
      {field.type === "dropdown" && (
        <FormControl className="full-width">
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

export default CheckboxQuestion;
