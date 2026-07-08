import { charmazeTemplates } from 'src/features/charmaze/templates';
import { charcolorTemplates } from 'src/features/charcolor/templates';
import { chartraceTemplates } from 'src/features/chartrace/templates';
import { mathGenieTemplates } from 'src/features/math-genie/templates';
import { wordSearchTemplates } from 'src/features/word-search/templates';
import { hundredChartTemplates } from 'src/features/hundred-chart/templates';

import type { Template } from './types';

export const templateRegistry: Record<string, Template[]> = {
  charcolor: charcolorTemplates,
  charmaze: charmazeTemplates,
  chartrace: chartraceTemplates,
  'math-genie': mathGenieTemplates,
  'hundred-chart': hundredChartTemplates,
  'word-search': wordSearchTemplates,
};

export function getTemplateConfig(toolId: string, templateId: string | null): any | undefined {
  if (!templateId) return undefined;
  const templates = templateRegistry[toolId];
  if (!templates) return undefined;
  const template = templates.find((t) => t.id === templateId);
  return template?.config;
}
