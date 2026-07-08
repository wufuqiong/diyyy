import { getTemplateConfig, templateRegistry } from '../registry';

const EXPECTED_COUNTS: Record<string, number> = {
  charcolor: 1,
  charmaze: 3,
  chartrace: 8,
  'math-genie': 11,
  'hundred-chart': 3,
  'word-search': 2,
};

describe('templateRegistry', () => {
  it('contains all six tools', () => {
    expect(Object.keys(templateRegistry).sort()).toEqual([
      'charcolor',
      'charmaze',
      'chartrace',
      'hundred-chart',
      'math-genie',
      'word-search',
    ]);
  });

  Object.entries(EXPECTED_COUNTS).forEach(([toolId, count]) => {
    it(`has ${count} templates for ${toolId}`, () => {
      expect(templateRegistry[toolId]).toHaveLength(count);
    });
  });

  it('every template has a unique id', () => {
    const ids = Object.values(templateRegistry).flat().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every template has titleKey and descKey', () => {
    Object.values(templateRegistry)
      .flat()
      .forEach((t) => {
        expect(t.titleKey).toBeTruthy();
        expect(t.descKey).toBeTruthy();
        expect(t.titleKey).toMatch(/^templates\./);
      });
  });
});

describe('getTemplateConfig', () => {
  it('returns config for a valid template', () => {
    const config = getTemplateConfig('charcolor', 'charcolor-wo-shi-zhongguoren');
    expect(config).toBeDefined();
    expect(config.userInput).toBe('我是中国人');
  });

  it('returns undefined for unknown template id', () => {
    expect(getTemplateConfig('charcolor', 'nonexistent')).toBeUndefined();
  });

  it('returns undefined for unknown tool id', () => {
    expect(getTemplateConfig('unknown', 'any')).toBeUndefined();
  });

  it('returns undefined for null template id', () => {
    expect(getTemplateConfig('charcolor', null)).toBeUndefined();
  });
});
