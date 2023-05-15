import { Button, CircularProgress } from "@mui/material";

export default function LoadingButton(props) {
  return (
    <Button {...props}>
      {props.children}
      {props.loading && <CircularProgress
        size={30}
        color="secondary"
        style={{ position: "absolute" }}
      />}
    </Button>
  ); 
}