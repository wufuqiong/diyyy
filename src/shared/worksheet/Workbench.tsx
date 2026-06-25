import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Alert, Snackbar, Typography, LinearProgress } from '@mui/material';

import { toolColors, candyColors } from 'src/theme/tokens';

import { isSafari } from './is-safari';
import { HelpDrawer } from './HelpDrawer';
import { PreviewStage } from './PreviewStage';
import { WorksheetToolbar } from './WorksheetToolbar';
import { ToolColorProvider } from './ToolColorContext';
import { usePersistedConfig } from './use-persisted-config';
import { TITLE_SLOT_ID, TOOLBAR_SLOT_ID } from './ToolbarSlot';
import { SettingsPanel } from '../../sections/_shared/SettingsPanel';
import { ResponsiveWorkbench } from '../../sections/_shared/ResponsiveWorkbench';
import { SafariPrintWarning, shouldShowSafariWarning } from './SafariPrintWarning';

import type { WorksheetTool } from './types';

interface WorkbenchProps<Config, Problem> {
  tool: WorksheetTool<Config, Problem>;
  configVersion?: number;
  /** Milliseconds to debounce auto-generation after config changes. Default 0 (no debounce). */
  debounceMs?: number;
  /** Control auto-generation. Default true. Pass a function to derive from config. */
  autoGenerate?: boolean | ((config: Config) => boolean);
}

export function Workbench<Config = any, Problem = any>({
  tool,
  configVersion = 1,
  debounceMs = 0,
  autoGenerate = true,
}: WorkbenchProps<Config, Problem>) {
  const [config, setConfig] = usePersistedConfig<Config>(
    `${tool.id}.config`,
    tool.defaultConfig,
    configVersion,
    { onRestore: () => setShowRestoredSnackbar(true) }
  );

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [safariWarningOpen, setSafariWarningOpen] = useState(false);
  const [showRestoredSnackbar, setShowRestoredSnackbar] = useState(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const isSafariBrowser = useRef(isSafari());
  const hasMounted = useRef(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const isAuto = typeof autoGenerate === 'function' ? autoGenerate(config) : autoGenerate;

  const contentColumns = tool.deriveContentColumns?.(config);

  const navKey = tool.id === 'math-genie' ? 'mathGenie' : tool.id === 'hundred-chart' ? 'hundredChart' : tool.id === 'word-search' ? 'wordSearch' : tool.id;

  const toolColor = toolColors[tool.id] || candyColors.blue;

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

  // Generate on mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate when config changes (if autoGenerate is enabled)
  useEffect(() => {
    if (!hasMounted.current || !isAuto) {
      return undefined;
    }

    if (debounceMs > 0) {
      const timeoutId = setTimeout(() => {
        generate();
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    }

    generate();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isAuto]);

  const handlePrint = useCallback(() => {
    if (isSafariBrowser.current && shouldShowSafariWarning()) {
      setSafariWarningOpen(true);
      return;
    }
    window.print();
  }, []);

  const handleSafariContinuePrint = useCallback(() => {
    window.print();
  }, []);

  // Intercept ⌘P / Ctrl+P for Safari
  useEffect(() => {
    if (!isSafariBrowser.current || !shouldShowSafariWarning()) return undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setSafariWarningOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSavePdf = useCallback(async () => {
    if (!pdfContainerRef.current) return;
    const baseName = tool.deriveTitle?.(config) || tool.id;
    const sanitized = baseName.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '_');
    setIsSavingPdf(true);
    try {
      const { saveWorksheetAsPdf } = await import('./save-pdf');
      await saveWorksheetAsPdf(pdfContainerRef.current, `${sanitized}.pdf`);
    } finally {
      setIsSavingPdf(false);
    }
  }, [tool, config]);

  const handleReset = useCallback(() => {
    setConfig(tool.defaultConfig);
  }, [tool.defaultConfig, setConfig]);

  const toolbarPortal = (
    <WorksheetToolbar
      onPrint={handlePrint}
      onSavePdf={handleSavePdf}
      onReset={handleReset}
      onHelp={() => setHelpDrawerOpen(true)}
      isSaving={isSavingPdf}
    />
  );

  const titlePortal = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '12px',
          bgcolor: `${toolColor}18`,
          color: toolColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          '& .MuiSvgIcon-root': { fontSize: 20 },
        }}
      >
        {tool.meta.icon}
      </Box>
      <Typography
        sx={{
          fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: toolColor,
          whiteSpace: 'nowrap',
        }}
      >
        {t(`nav.${navKey}`)}
      </Typography>
    </Box>
  );

  const sidebar = (
    <SettingsPanel header={null}>
      <tool.Settings
        config={config}
        onChange={setConfig}
        onGenerate={isAuto ? undefined : generate}
        isGenerating={isGenerating}
      />
    </SettingsPanel>
  );

  const [portalTargets, setPortalTargets] = useState<{ toolbar: HTMLElement | null; title: HTMLElement | null }>({ toolbar: null, title: null });

  useEffect(() => {
    const find = () => {
      const tb = document.getElementById(TOOLBAR_SLOT_ID);
      const tt = document.getElementById(TITLE_SLOT_ID);
      if (tb && tt) {
        setPortalTargets({ toolbar: tb, title: tt });
        return true;
      }
      return false;
    };
    if (find()) return undefined;
    const timer = setInterval(() => { if (find()) clearInterval(timer); }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <ToolColorProvider value={toolColor}>
      {portalTargets.title && createPortal(titlePortal, portalTargets.title)}
      {portalTargets.toolbar && createPortal(toolbarPortal, portalTargets.toolbar)}
      <title>{tool.meta.title}</title>
      <meta name="description" content={`${tool.meta.title} - DIYYY 练习单生成工具`} />

      <Box sx={{ '--tool-color': toolColor, '--tool-color-alpha': `${toolColor}28`, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ResponsiveWorkbench sidebar={sidebar}>
        {isGenerating && (
          <LinearProgress
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              '@media print': { display: 'none' },
            }}
          />
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              m: 2,
              '@media print': { display: 'none' },
            }}
          >
            {error}
          </Alert>
        )}

        <PreviewStage contentColumns={contentColumns}>
          <tool.Preview config={config} problems={problems} pdfContainerRef={pdfContainerRef} onConfigChange={setConfig} />
        </PreviewStage>
      </ResponsiveWorkbench>
      </Box>

      <Snackbar
        open={showRestoredSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowRestoredSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '@media print': { display: 'none' } }}
      >
        <Alert severity="info" onClose={() => setShowRestoredSnackbar(false)} sx={{ width: '100%' }}>
          {t('common.configRestored')}
        </Alert>
      </Snackbar>

      <SafariPrintWarning
        open={safariWarningOpen}
        onClose={() => setSafariWarningOpen(false)}
        onSavePdf={handleSavePdf}
        onContinuePrint={handleSafariContinuePrint}
      />

      <HelpDrawer
        toolId={tool.id}
        open={helpDrawerOpen}
        onClose={() => setHelpDrawerOpen(false)}
      />
    </ToolColorProvider>
  );
}
