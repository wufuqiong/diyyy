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
  Preview: React.FC<{ config: Config; problems: Problem[] }>;
  Settings: React.FC<{ config: Config; onChange: (c: Config) => void }>;
  meta: WorksheetToolMeta;
}
