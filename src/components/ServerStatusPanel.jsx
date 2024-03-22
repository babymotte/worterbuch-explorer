import { Button, Grid, Stack, Typography } from "@mui/material";
import ServerSelection from "./ServerSelection";
import StatusIndicator from "./StatusIndicator";
import EditIcon from "@mui/icons-material/Edit";
import pkg from "../../package.json";
import ConfigButton from "./ConfigButton";

export default function ServerStatusPanel({ setEditing }) {
  return (
    <Grid container columnGap={2}>
      <Grid item xs>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* <ThemeSwitch /> */}
          <Stack direction="row" spacing={1} alignItems="center">
            <ConfigButton />
            <Typography>
              Wörterbuch&nbsp;Explorer&nbsp;v{pkg.version}
            </Typography>
          </Stack>
          <Stack flexGrow={1} />
          <StatusIndicator />
          <ServerSelection />
        </Stack>
      </Grid>
      <Grid item md={2} lg={1}>
        <Button
          sx={{ width: "100%", height: "100%" }}
          variant="outlined"
          selected
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </Grid>
    </Grid>
  );
}
