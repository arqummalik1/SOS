import { Image } from 'react-native';
import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';

/** Longest edge cap — keeps uploads under typical reverse-proxy body limits (nginx 413). */
const MAX_LONG_EDGE = 1280;
const JPEG_QUALITY = 0.78;

const log = (message: string, meta?: Record<string, unknown>) => {
  console.log(`[SOS_PROFILE_IMAGE] prepare: ${message}`, meta ?? '');
};

const getDimensions = (uri: string): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve(null)
    );
  });

/**
 * Resizes (if needed) and re-encodes as JPEG so multipart uploads stay small on iOS and Android
 * (camera + gallery), avoiding 413 from intermediaries.
 */
export const prepareProfileImageForUpload = async (
  sourceUri: string
): Promise<{ uri: string; filename: string; mimeType: string }> => {
  const dims = await getDimensions(sourceUri);
  const actions: Action[] = [];

  if (dims) {
    const longEdge = Math.max(dims.width, dims.height);
    if (longEdge > MAX_LONG_EDGE) {
      if (dims.width >= dims.height) {
        actions.push({ resize: { width: MAX_LONG_EDGE } });
      } else {
        actions.push({ resize: { height: MAX_LONG_EDGE } });
      }
    }
    log('dimensions', { width: dims.width, height: dims.height, willResize: actions.length > 0 });
  } else {
    actions.push({ resize: { width: MAX_LONG_EDGE } });
    log('dimensions unknown — applying width resize fallback', { maxWidth: MAX_LONG_EDGE });
  }

  const result = await manipulateAsync(sourceUri, actions, {
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  log('encoded', {
    width: result.width,
    height: result.height,
    format: 'jpeg',
    quality: JPEG_QUALITY,
  });

  return {
    uri: result.uri,
    filename: `profile-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
  };
};
