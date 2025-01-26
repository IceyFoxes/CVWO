import "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        danger: PaletteColor;
    }

    interface PaletteOptions {
        danger?: PaletteColorOptions;
    }
}
