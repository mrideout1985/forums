import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { type ReactNode } from 'react';
import { theme } from '~/lib/theme';

interface AppThemeProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app with the MUI theme and CssBaseline.
 *
 * CssBaseline takes ownership of background-color and color from the theme,
 * so app.css must not set those independently.
 *
 * Place this as the outermost provider in root.tsx so all MUI components
 * and all children receive correct theme tokens.
 */
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

/**
 * Re-exported for convenience so consumers can wire up a colour scheme toggle
 * without adding an extra import from @mui/material.
 *
 * Usage:
 *   const { mode, setMode } = useColorScheme();
 *   <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
 */
export { useColorScheme } from '@mui/material/styles';
