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
                primary: { main: "#556CD6", contrastText: "#FFFFFF" },
                secondary: { main: "#408EC6", contrastText: "#408EC6" }, 
                danger: { main: "#D32F2F", contrastText: "#FFFFFF" }, 
                background: { 
                    default: "#F6E6CF", // Beige
                    paper: "rgba(246, 230, 207, 0.85)",
                },
                text: { 
                    primary: "#2B2B2B", 
                    secondary: "#555555", 
                },
            },
        };        
        
        const darkThemeConfig = {
            palette: {
                mode: "dark" as PaletteMode,
                primary: { main: "#2C2C54", contrastText: "#FFFFFF" },
                secondary: { main: "#333333", contrastText: "#AECBFA" },
                danger: { main: "#640000", contrastText: "#FFFFFF" },
                background: { 
                    default: "#121212", // Deep black background
                    paper: "rgba(28, 28, 28, 0.85)", // Slightly lighter for content cards
                },
                text: { 
                    primary: "#FFFFFF", 
                    secondary: "#B0B0B0", 
                },
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
                        root: ({ theme }: { theme: any }) => ({
                            "&.Mui-selected": {
                                color: theme.palette.secondary.contrastText
                            },
                        }),
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
