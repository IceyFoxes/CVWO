import React, { createContext, useMemo, useState } from "react";
import { createTheme, PaletteMode, ThemeProvider } from "@mui/material/styles";
import Montserrat from "../font/static/Montserrat-Regular.ttf";

export const ColorModeContext = createContext({
    mode: "light",
    toggleColorMode: () => {},
});

const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<PaletteMode>("light");

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        [mode]
    );

    const theme = useMemo(() => {
        const isLight = mode === "light";

        const lightThemeConfig = {
            palette: {
                mode: "light" as PaletteMode,
                primary: { main: "#00246B", contrastText: "#FFFFFF" },
                secondary: { main: "#408EC6", contrastText: "#FFFFFF" },
                background: { default: "#EDF4F2", paper: "#C4DFE6" },
                text: { primary: "#000000", secondary: "##FFFFFF" },
            },
        };

        const darkThemeConfig = {
            palette: {
                mode: "dark" as PaletteMode,
                primary: { main: "#00246B", contrastText: "#FFFFFF" },
                secondary: { main: "#408EC6", contrastText: "#FFFFFF" },
                background: { default: "#121212", paper: "#1E1E1E" },
                text: { primary: "#FFFFFF", secondary: "#000000" },
            },
        };

        const themeConfig = isLight ? lightThemeConfig : darkThemeConfig;

        return createTheme({
            ...themeConfig,
            typography: {
                fontFamily: "Montserrat, Arial",
                button: { textTransform: "none", fontWeight: 600 },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        "@font-face": {
                            fontFamily: "Montserrat",
                            fontStyle: "normal",
                            fontDisplay: "swap",
                            fontWeight: 400,
                            src: `local('Montserrat'), local('Montserrat-Regular'), url(${Montserrat}) format('ttf')`,
                            unicodeRange:
                                "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
                        },
                    },
                },
                MuiTab: {
                    styleOverrides: {
                        root: {
                            "&.Mui-selected": {
                                color: "#5661bf",
                            },
                        },
                    },
                },
            },
        });
    }, [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default ColorModeProvider;
