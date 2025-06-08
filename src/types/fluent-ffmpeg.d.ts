declare module 'fluent-ffmpeg' {
  import { EventEmitter } from 'events';

  interface FfmpegCommand {
    setFfmpegPath(path: string): void;
    // Tambahkan method atau properti lain yang Anda gunakan
  }

  const ffmpeg: {
    (input?: string): FfmpegCommand;
    setFfmpegPath(path: string): void;
  };

  export = ffmpeg;
}
