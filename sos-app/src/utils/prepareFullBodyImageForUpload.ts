import { Image, Platform } from 'react-native';
import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';

// #region agent log
const agentIngestFullBodyPrepare = (
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
  runId = 'pre-fix'
) => {
  fetch('http://127.0.0.1:7307/ingest/b5866ded-1c1e-4e33-85c9-06d109e465f6', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '6ccc31' },
    body: JSON.stringify({
      sessionId: '6ccc31',
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

const log = (message: string, meta?: Record<string, unknown>) => {
  console.log(`[SOS_FULL_BODY_IMAGE] prepare: ${message}`, meta ?? '');
};

const MAX_LONG_EDGE = 1600;
const JPEG_QUALITY = 0.82;

const getDimensions = (uri: string): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve(null)
    );
  });

/**
 * Non-cropping optimization for full-body upload.
 * Preserves full frame while reducing payload size to avoid server limits/timeouts.
 */
export const prepareFullBodyImageForUpload = async (
  sourceUri: string
): Promise<{ uri: string; filename: string; mimeType: string }> => {
  const dims = await getDimensions(sourceUri);
  const actions: Action[] = [];

  if (dims) {
    const { width: w, height: h } = dims;
    const longEdge = Math.max(w, h);
    if (longEdge > MAX_LONG_EDGE) {
      if (w >= h) {
        actions.push({ resize: { width: MAX_LONG_EDGE } });
      } else {
        actions.push({ resize: { height: MAX_LONG_EDGE } });
      }
    }

    log('optimize', {
      sourceW: w,
      sourceH: h,
      aspectRatio: (h / w).toFixed(2),
      resized: longEdge > MAX_LONG_EDGE,
      note: 'NO CROPPING + ASPECT RATIO PRESERVED',
    });
    // #region agent log
    agentIngestFullBodyPrepare('H-C', 'prepareFullBodyImageForUpload.ts:optimize', 'source optimized with resolved dimensions', {
      platform: Platform.OS,
      sourceW: w,
      sourceH: h,
      aspectHW: h / w,
      resized: longEdge > MAX_LONG_EDGE,
    });
    // #endregion
  } else {
    log('optimize (dimensions unknown)', { note: 'NO CROPPING + FALLBACK JPEG ENCODE' });
    // #region agent log
    agentIngestFullBodyPrepare('H-C', 'prepareFullBodyImageForUpload.ts:optimize', 'source optimized with unknown dimensions', {
      platform: Platform.OS,
      fallback: 'encode-only',
    });
    // #endregion
  }

  const result = await manipulateAsync(sourceUri, actions, {
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  log('encoded', {
    outW: result.width,
    outH: result.height,
    aspectRatio: result.width > 0 ? (result.height / result.width).toFixed(2) : 'N/A',
    quality: JPEG_QUALITY,
    resized: actions.length > 0,
    note: 'NO CROPPING + JPEG optimize',
  });
  // #region agent log
  agentIngestFullBodyPrepare('H-C', 'prepareFullBodyImageForUpload.ts:encoded', 'optimized output generated', {
    platform: Platform.OS,
    outW: result.width,
    outH: result.height,
    aspectHW: result.width > 0 ? result.height / result.width : null,
    resized: actions.length > 0,
    quality: JPEG_QUALITY,
  });
  // #endregion

  return {
    uri: result.uri,
    filename: `full-body-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
  };
};
