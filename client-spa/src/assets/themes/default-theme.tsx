import { createTheme } from "@mantine/core";
import WebFont from "webfontloader" 

const fontFamily = "PT Serif";
const fontFamilyMonospace = "Inconsolata";
const fontFamilyHeadings = "DM Display Serif";

WebFont.load({
    google: {
        families: [fontFamily, fontFamilyMonospace, fontFamilyHeadings]
    }
});

const defaultTheme = createTheme({
    focusRing: "always",

    // font-family used in all components
    fontFamily,
    // font-family used in code and similar components
    fontFamilyMonospace,
    // font-family and text-wrap style for headings (H1-H6), used in TypographyStylesProvider and Title components
    headings: {
        fontFamily: fontFamilyHeadings,
        textWrap: "pretty"
    },
    fontSmoothing: true,

    colors: {
        "teal": ["#809DAE", "#68889B", "#597B8F", "#517387", "#4B6D81", "#456579", "#3D5A6C", "#2F4958", "#1B303B", "#030E16"],
        "navy": ["#95AFCE", "#869EBC", "#778DAC", "#687D9C", "#596D8D", "#4B5D7E", "#3E4E6F", "#313E60", "#273052", "#1D2143"],
        "patina": ["#8FB79F", "#83A496", "#78928C", "#6D807D", "#60706C", "#52615A", "#445246", "#374433", "#253729", "#14292C"],
        "neutral": ["#E8E4DD", "#E3D4C4", "#DBC5B2", "#D1B6A4", "#C3A997", "#B49D8D", "#A49183", "#94867A", "#867A70", "#796E64"],
        "softer-warm": ["#E2BD6E", "#DFB468", "#DCAC63", "#D9A35F", "#D59B5B", "#D19258", "#CD8A56", "#C88254", "#C37A53", "#A05322"]
    },

    primaryColor: "navy",
    primaryShade: 7,

    black: "#0F1229",
    white: "#FCFCFB",

    // border radius
    defaultRadius: "lg",

    
});

export default defaultTheme;
