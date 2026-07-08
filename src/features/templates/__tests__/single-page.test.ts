import { templateRegistry } from '../registry';

import { charcolorTool } from 'src/features/charcolor/config';
import { chartraceTool } from 'src/features/chartrace/config';
import { wordSearchTool } from 'src/features/word-search';
import { hundredChartTool } from 'src/features/hundred-chart';
import { mathGenieTool } from 'src/features/math-genie';

// charmaze needs miemie data — import the actual generator
import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import { generateMazePages } from 'src/features/charmaze/utils';

const miemieWordData = loadMiemieLessons(miemieDetails as any, 'word');

async function getPageCount(toolId: string, config: any): Promise<number> {
  switch (toolId) {
    case 'charcolor': {
      const result = charcolorTool.generate(config);
      return (result as any[]).length;
    }
    case 'charmaze': {
      const result = generateMazePages(config, miemieWordData);
      return result.length;
    }
    case 'chartrace': {
      // chartrace returns [] — PaperSheet reads from config, always 1 physical page
      return 1;
    }
    case 'math-genie': {
      const result = await mathGenieTool.generate(config);
      const problemsPerPage = config.problemsPerPage || 20;
      return Math.ceil(result.length / problemsPerPage);
    }
    case 'hundred-chart': {
      const result = hundredChartTool.generate(config);
      // Filter out answer-key sheets
      const pages = result.filter((s: any) => !s.isAnswerKey);
      return pages.length;
    }
    case 'word-search': {
      const result = wordSearchTool.generate(config);
      return result.filter((s: any) => !s.isAnswerKey).length;
    }
    default:
      return 1;
  }
}

describe('Template single-page constraint', () => {
  const allTemplates = Object.entries(templateRegistry).flatMap(([toolId, templates]) =>
    templates.map((t) => ({ toolId, template: t })),
  );

  it.each(allTemplates)(
    '$template.id produces exactly 1 page',
    async ({ toolId, template }) => {
      const pageCount = await getPageCount(toolId, template.config);
      expect(pageCount).toBe(1);
    },
  );
});
