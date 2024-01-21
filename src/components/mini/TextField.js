import { TextField } from "@mui/material";
import PropTypes from "prop-types";

const TextFieldInput = (props) => (
  <TextField
    { ...props }
    id="outlined-required"
    sx={{
      color:'white',
      '& .MuiInputBase-input': {
        backgroundColor:'transparent!important',
        border:'none!important',
        color:'white!important',
        py: !props.multiline ? '10px!important' : 0,
        fontSize: props.fontSize ? `${props.fontSize}px!important` : ''
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor:'white!important',
        borderRadius:'5px!important',
        color:'white!important',
      },
      '& .MuiFormLabel-root': {
        color:'white!important'
      },
      '& .MuiFormHelperText-root': {
        color:'red!important'
      },
      '& .MuiInputBase-input.Mui-disabled': {
        WebkitTextFillColor: "white",
      }
    }}
  />
)

TextFieldInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  fullWidth: PropTypes.bool,
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  multiline: PropTypes.bool,
  minRows: PropTypes.number
}

export default TextFieldInput