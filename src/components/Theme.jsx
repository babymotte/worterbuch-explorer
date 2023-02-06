import { CssBaseline, ThemeProvider } from "@mui/material";
import { grey, teal } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import React, { useContext } from "react";

const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: teal["800"],
    },
    text: {
      primary: grey["500"],
    },
  },
});

const LightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const DarkModeContext = React.createContext({
  darkMode: true,
  setDarkMode: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

const Theme = ({ children }) => {
  const [darkMode, setDarkMode] = usePersistedDM();

  const theme = darkMode ? DarkTheme : LightTheme;

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
};

export default Theme;

function usePersistedDM() {
  const [dm, setDm] = React.useState(load());
  const updateDm = (val) => {
    setDm(val);
    persist(val);
  };
  return [dm, updateDm];
}

function load() {
  if (window.localStorage) {
    const json = window.localStorage.getItem("worterbuch.explorer.darkMode");
    return json !== "false";
  } else {
    return false;
  }
}

function persist(val) {
  if (window.localStorage) {
    window.localStorage.setItem(
      "worterbuch.explorer.darkMode",
      JSON.stringify(Boolean(val))
    );
  }
}
