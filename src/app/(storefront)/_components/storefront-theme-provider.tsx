"use client";

import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from "@mui/material";
import { useMemo } from "react";

export function StorefrontThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          background: {
            default: "#fffdfa",
            paper: "#fffdfa",
          },
          primary: {
            main: "#1a1816",
          },
          text: {
            primary: "#1a1816",
            secondary: "#838383",
          },
        },
        typography: {
          fontFamily: "var(--font-sans), sans-serif",
          h1: {
            fontFamily: "var(--font-serif), serif",
          },
          h2: {
            fontFamily: "var(--font-serif), serif",
          },
          h3: {
            fontFamily: "var(--font-serif), serif",
          },
          body2: {
            fontWeight: 100,
          }
        },
        shape: {
          borderRadius: 0,
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
          body: {
            backgroundColor: "#fffdfa",
            color: "#1a1816",
            fontFamily: "var(--font-sans), sans-serif",
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}

