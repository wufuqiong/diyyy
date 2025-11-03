import type {
  Shadows,
  ColorSystemOptions,
  CssVarsThemeOptions,
  SupportedColorScheme,
  ThemeOptions as MuiThemeOptions,
} from '@mui/material/styles';

import type { CustomShadows } from './core/custom-shadows';

// ----------------------------------------------------------------------

declare module '@mui/material/styles' {
  interface Theme {
    shape: {
      borderRadius: number;
    };
  }
  
  interface ThemeOptions {
    shape?: {
      borderRadius?: number;
    };
  }
}

export type ThemeColorScheme = SupportedColorScheme;
export type ThemeCssVariables = Pick<
  CssVarsThemeOptions,
  'colorSchemeSelector' | 'disableCssColorScheme' | 'cssVarPrefix' | 'shouldSkipGeneratingVar'
>;

type ColorSchemeOptionsExtended = ColorSystemOptions & {
  shadows?: Shadows;
  customShadows?: CustomShadows;
};

// FIX: Use a more descriptive name
export type ExtendedThemeOptions = Omit<MuiThemeOptions, 'components'> &
  Pick<CssVarsThemeOptions, 'defaultColorScheme' | 'components'> & {
    colorSchemes?: Partial<Record<ThemeColorScheme, ColorSchemeOptionsExtended>>;
    cssVariables?: ThemeCssVariables;
  };