import { useContext, createContext } from 'react';

import { candyColors } from 'src/theme/tokens';

/**
 * Per-tool identity color, provided by Workbench (from toolColors[tool.id]).
 * Consumed by preview chrome (PageNavigator, sheet accents) so each tool's
 * preview area picks up its candy identity color without prop drilling.
 */
const ToolColorContext = createContext<string>(candyColors.blue);

export const ToolColorProvider = ToolColorContext.Provider;

export const useToolColor = (): string => useContext(ToolColorContext);
