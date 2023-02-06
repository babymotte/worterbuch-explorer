import { useDarkMode } from "./Theme";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Stack, Switch } from "@mui/material";

export default function ThemeSwitch() {
  const { darkMode, setDarkMode } = useDarkMode();
  return (
    <Stack direction="row" alignItems="center">
      <LightModeIcon />
      <Switch
        defaultChecked={darkMode}
        onChange={(e) => setDarkMode(e.target.checked)}
      />
      <DarkModeIcon />
    </Stack>
  );
}
