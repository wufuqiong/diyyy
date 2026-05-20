import React, { useState, useEffect, useCallback } from 'react';

import { Box, Alert, LinearProgress } from '@mui/material';

import { usePersistedConfig } from './use-persisted-config';
import { ResponsiveWorkbench } from '../../sections/_shared/ResponsiveWorkbench';
import { SettingsPanel, SettingsHeader } from '../../sections/_shared/SettingsPanel';

import type { WorksheetTool } from './types';

interface WorkbenchProps<Config, Problem> {
  tool: WorksheetTool<Config, Problem>;
  configVersion?: number;
}

export function Workbench<Config = any, Problem = any>({
  tool,
  configVersion = 1,
}: WorkbenchProps<Config, Problem>) {
  const [config, setConfig] = usePersistedConfig<Config>(
    `${tool.id}.config`,
    tool.defaultConfig,
    configVersion
  );

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await Promise.resolve(tool.generate(config));
      setProblems(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      console.error(`[${tool.id}] Generation error:`, err);
    } finally {
      setIsGenerating(false);
    }
  }, [tool, config]);

  useEffect(() => {
    generate();
  }, [generate]);

  const sidebar = (
    <SettingsPanel header={<SettingsHeader title={tool.meta.title} />}>
      <tool.Settings config={config} onChange={setConfig} />
    </SettingsPanel>
  );

  return (
    <>
      <title>{tool.meta.title}</title>
      <meta name="description" content={`${tool.meta.title} - DIYYY 练习单生成工具`} />

      <ResponsiveWorkbench sidebar={sidebar}>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            '@media print': {
              overflow: 'visible',
            },
          }}
        >
          {isGenerating && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                '@media print': {
                  display: 'none',
                },
              }}
            />
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                m: 2,
                '@media print': {
                  display: 'none',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <tool.Preview config={config} problems={problems} />
        </Box>
      </ResponsiveWorkbench>
    </>
  );
}
