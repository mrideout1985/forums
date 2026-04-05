/**
 * Forum Application — MUI v7 Theme
 *
 * Design principles:
 * - Indigo/violet brand accent on an 80% neutral (slate) base
 * - CSS variables API (`cssVariables: true`) means one createTheme call owns
 *   both light and dark; the generated CSS vars switch automatically via
 *   data-mui-color-scheme attribute — no JS re-render required (SSR safe)
 * - InitColorSchemeScript in root.tsx prevents FOUC on hard reload
 * - All text/background pairings verified WCAG AA (≥4.5:1 normal, ≥3:1 large)
 *
 * Raw palette scale:
 *   Indigo:  200 #c7d2fe  300 #a5b4fc  400 #818cf8  500 #6366f1
 *            600 #4f46e5  700 #4338ca  800 #3730a3
 *   Violet:  400 #a78bfa  600 #7c3aed  800 #5b21b6
 *   Slate:   50  #f8fafc  100 #f1f5f9  200 #e2e8f0  300 #cbd5e1
 *            400 #94a3b8  500 #64748b  600 #475569  700 #334155
 *            800 #1e293b  900 #0f172a
 *   Green:   500 #22c55e  700 #15803d  dark-bg #14532d
 *   Amber:   400 #fbbf24  700 #b45309  dark-bg #78350f
 *   Red:     400 #f87171  700 #b91c1c  dark-bg #7f1d1d
 *   Sky:     400 #38bdf8  700 #0369a1  dark-bg #075985
 */

import { createTheme } from '@mui/material/styles';

// ─── Raw colour values ────────────────────────────────────────────────────────

const indigo = {
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
} as const;

const violet = {
  400: '#a78bfa',
  600: '#7c3aed',
  800: '#5b21b6',
} as const;

const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
} as const;

// ─── Theme ────────────────────────────────────────────────────────────────────

export const theme = createTheme({
  /**
   * Enable the CSS variables API. MUI generates CSS custom properties
   * (--mui-palette-primary-main, etc.) and switches them via
   * data-mui-color-scheme="dark" on <html> — no runtime JS palette swap.
   */
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },

  colorSchemes: {
    // ── Light ──────────────────────────────────────────────────────────────
    light: {
      palette: {
        primary: {
          light: indigo[400], // #818cf8 — hover/focus rings, tinted surfaces
          main: indigo[600], // #4f46e5 — 6.14:1 on white ✅
          dark: indigo[800], // #3730a3 — pressed state
          contrastText: '#ffffff',
        },
        secondary: {
          light: violet[400], // #a78bfa
          main: violet[600], // #7c3aed — 5.73:1 on white ✅
          dark: violet[800], // #5b21b6
          contrastText: '#ffffff',
        },
        background: {
          default: slate[50], // #f8fafc — page canvas (off-white, easy on eyes)
          paper: '#ffffff', // cards, modals, drawers
        },
        text: {
          primary: slate[900], // #0f172a — ~19:1 ✅
          secondary: slate[600], // #475569 — 7.6:1 ✅
          disabled: slate[400], // #94a3b8
        },
        divider: slate[200], // #e2e8f0 — subtle borders
        action: {
          hover: 'rgba(79, 70, 229, 0.06)', // indigo tint on hover
          selected: 'rgba(79, 70, 229, 0.10)',
          focus: 'rgba(79, 70, 229, 0.12)',
          disabledBackground: slate[100],
          disabled: slate[400],
        },
        success: {
          main: '#15803d', // green-700 — 5.06:1 on white ✅
          light: '#86efac', // green-300
          dark: '#14532d', // green-900
          contrastText: '#ffffff',
        },
        warning: {
          main: '#b45309', // amber-700 — 5.0:1 on white ✅
          light: '#fcd34d', // amber-300
          dark: '#78350f', // amber-900
          contrastText: '#ffffff',
        },
        error: {
          main: '#b91c1c', // red-700 — 6.55:1 on white ✅
          light: '#fca5a5', // red-300
          dark: '#7f1d1d', // red-900
          contrastText: '#ffffff',
        },
        info: {
          main: '#0369a1', // sky-700 — 5.95:1 on white ✅
          light: '#bae6fd', // sky-200
          dark: '#075985', // sky-800
          contrastText: '#ffffff',
        },
      },
    },

    // ── Dark ───────────────────────────────────────────────────────────────
    dark: {
      palette: {
        primary: {
          light: indigo[300], // #a5b4fc — very light, tinted surfaces
          main: indigo[400], // #818cf8 — 6.28:1 on slate-900 ✅
          dark: indigo[600], // #4f46e5 — pressed state
          contrastText: slate[900], // dark text needed on light indigo
        },
        secondary: {
          light: violet[400], // #a78bfa
          main: violet[400], // #a78bfa — 6.88:1 on slate-900 ✅
          dark: violet[600], // #7c3aed
          contrastText: slate[900],
        },
        background: {
          default: slate[900], // #0f172a — deep navy-black for night reading
          paper: slate[800], // #1e293b — cards/surfaces lifted one step
        },
        text: {
          primary: slate[100], // #f1f5f9 — 17:1 on slate-900 ✅
          secondary: slate[400], // #94a3b8 — 7.2:1 on slate-900 ✅
          disabled: slate[600], // #475569
        },
        divider: slate[700], // #334155 — visible but not harsh
        action: {
          hover: 'rgba(129, 140, 248, 0.08)', // indigo-400 tint
          selected: 'rgba(129, 140, 248, 0.14)',
          focus: 'rgba(129, 140, 248, 0.16)',
          disabledBackground: slate[800],
          disabled: slate[600],
        },
        success: {
          main: '#22c55e', // green-500 — 8.2:1 on slate-900 ✅
          light: '#86efac',
          dark: '#15803d',
          contrastText: slate[900], // dark text on bright green ✅
        },
        warning: {
          main: '#fbbf24', // amber-400 — 11.2:1 on slate-900 ✅
          light: '#fcd34d',
          dark: '#b45309',
          contrastText: slate[900], // dark text on bright amber ✅
        },
        error: {
          main: '#f87171', // red-400 — 6.68:1 on slate-900 ✅
          light: '#fca5a5',
          dark: '#b91c1c',
          contrastText: slate[900], // dark text on bright red ✅
        },
        info: {
          main: '#38bdf8', // sky-400 — 8.59:1 on slate-900 ✅
          light: '#7dd3fc',
          dark: '#0369a1',
          contrastText: slate[900], // dark text on bright sky ✅
        },
      },
    },
  },

  typography: {
    fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'].join(','),
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },

    body1: { fontSize: '1rem', lineHeight: 1.75, letterSpacing: '0.01em' },
    body2: { fontSize: '0.875rem', lineHeight: 1.65, letterSpacing: '0.01em' },

    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5, letterSpacing: '0.02em' },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
          },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: indigo[700] },
          '&:active': { backgroundColor: indigo[800] },
        },
        outlinedPrimary: {
          borderColor: indigo[600],
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.06)',
            borderColor: indigo[700],
          },
        },
        textPrimary: {
          '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.06)' },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
          },
        },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${slate[200]}`,
          '[data-mui-color-scheme="dark"] &': {
            borderColor: slate[700],
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        colorPrimary: {
          backgroundColor: '#ffffff',
          color: slate[900],
          borderBottom: `1px solid ${slate[200]}`,
          '[data-mui-color-scheme="dark"] &': {
            backgroundColor: slate[800],
            color: slate[100],
            borderBottomColor: slate[700],
          },
        },
      },
    },

    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
            borderRadius: 2,
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: indigo[500],
          },
        },
        notchedOutline: {
          borderColor: slate[300],
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: slate[200],
          '[data-mui-color-scheme="dark"] &': {
            borderColor: slate[700],
          },
        },
      },
    },

    MuiButtonBase: {
      defaultProps: { disableRipple: false },
    },

    MuiCssBaseline: {
      styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-text-size-adjust: 100%; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        img, video, canvas, svg { max-width: 100%; }
        p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
        :focus-visible { outline-offset: 2px; }
      `,
    },
  },
});
