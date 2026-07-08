export interface Template<Config = any> {
  id: string;
  titleKey: string;
  descKey: string;
  config: Config;
  scale: number;
}
