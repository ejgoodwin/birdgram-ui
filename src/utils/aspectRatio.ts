export type AspectRatioKey = '1:1' | '4:5' | '16:9' | 'original';

export const FRAME_W = 400;

export const RATIO_LABELS: Record<AspectRatioKey, string> = {
  '1:1': 'Square',
  '4:5': 'Portrait',
  '16:9': 'Landscape',
  'original': 'Original',
};

export const RATIO_ORDER: AspectRatioKey[] = ['1:1', '4:5', '16:9', 'original'];

export function computeFrameH(ratio: AspectRatioKey, nat: { w: number; h: number } | null): number {
  if (!nat || nat.w === 0) return FRAME_W;
  switch (ratio) {
    case '1:1': return FRAME_W;
    case '4:5': return Math.round(FRAME_W * 5 / 4);
    case '16:9': return Math.round(FRAME_W * 9 / 16);
    case 'original': return Math.round(FRAME_W * nat.h / nat.w);
  }
}

export function frameHToRatio(frameH: number): AspectRatioKey {
  if (frameH === FRAME_W) return '1:1';
  if (frameH === Math.round(FRAME_W * 5 / 4)) return '4:5';
  if (frameH === Math.round(FRAME_W * 9 / 16)) return '16:9';
  return 'original';
}
