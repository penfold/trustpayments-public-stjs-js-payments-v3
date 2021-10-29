export interface ISeonConfig {
  session_id: string;
  host?: string;
  audio_fingerprint?: boolean;
  canvas_fingerprint?: boolean;
  webgl_fingerprint?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface ISeon {
  getBase64Session(callback: (data: string | null) => void): void;
  config(config: ISeonConfig): void;
}