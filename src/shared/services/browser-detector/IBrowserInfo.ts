export interface IBrowserInfo {
  browser: {
    name?: string;
    version?: string;
    isSupported?: boolean;
  };
  engine: {
    name?: string;
    version?: string;
  };
  os: {
    name?: string;
    version?: string;
    versionName?: string;
    isSupported?: boolean;
  };
  platform: {
    type?: string;
    vendor?: string;
    model?: string;
  };
  isSupported: boolean;
}
