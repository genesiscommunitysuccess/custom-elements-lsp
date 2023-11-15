export type PluginConfig = {
  srcRouteFromTSServer?: string;
  designSystemPrefix?: string;
  parser?: {
    timeout?: number;
    fastEnable?: boolean;
    src?: string;
    dependencies?: string[];
  };
  plugins?: string[];
};
