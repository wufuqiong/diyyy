import type { ReactNode } from 'react';

export interface WorksheetToolMeta {
  title: string;
  icon: ReactNode;
  route: string;
}

export interface WorksheetTool<Config = any, Problem = any> {
  id: string;
  defaultConfig: Config;
  generate: (config: Config) => Problem[] | Promise<Problem[]>;
  Preview: React.FC<{ config: Config; problems: Problem[]; pdfContainerRef?: React.RefObject<HTMLDivElement | null>; onConfigChange?: (config: Config) => void }>;
  Settings: React.FC<{ config: Config; onChange: (c: Config) => void; onGenerate?: () => void; isGenerating?: boolean }>;
  meta: WorksheetToolMeta;
  deriveTitle?: (config: Config) => string;
  /** Number of content columns for preview-stage width calculation (optional). */
  deriveContentColumns?: (config: Config) => number | undefined;
}
