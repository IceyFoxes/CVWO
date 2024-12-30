import React, { createContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export const ColorModeContext = createContext({
    mode: "light",
    toggleColorMode: () => {},
});

const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<"light" | "dark">("light");

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        [mode]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: "#1976d2",
                    },
                    secondary: {
                        main: "#180161",
                    },
                },
                typography: {
                    fontFamily: [
                        "Helvetica Neue",
                        "Roboto", 
                        "Arial", 
                        "sans-serif",
                    ].join(","),
                    allVariants: {
                        textAlign: "left",
                    },
                },
            }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default ColorModeProvider;

