import { Image } from 'react-native';
import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';

/** Portrait full-body frame (width : height). */
const ASPECT_W = 9;
const ASPECT_H = 16;

/** After 9:16 crop, cap longer side to keep uploads under reverse-proxy limits. */
const MAX_LONG_EDGE = 1280;
const JPEG_QUALITY = 0.78;

const log = (message: string, meta?: Record<string, unknown>) => {
  console.log(`[SOS_FULL_BODY_IMAGE] prepare: ${message}`, meta ?? '');
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
 * Center-crop to **9:16** (portrait), then scale so the longer side is at most {@link MAX_LONG_EDGE},
 * and encode as JPEG. Used before `POST /onboarding/full-body-image` (`full_body_image` field).
 */
export const prepareFullBodyImageForUpload = async (
  sourceUri: string
): Promise<{ uri: string; filename: string; mimeType: string }> => {
  const dims = await getDimensions(sourceUri);
  const actions: Action[] = [];

  if (dims) {
    const { width: w, height: h } = dims;
    const targetRatio = ASPECT_W / ASPECT_H;
    const srcRatio = w / h;

    let cropW: number;
    let cropH: number;
    let originX: number;
    let originY: number;

    if (srcRatio > targetRatio) {
      cropH = h;
      cropW = Math.floor((h * ASPECT_W) / ASPECT_H);
      originX = Math.floor((w - cropW) / 2);
      originY = 0;
    } else {
      cropW = w;
      cropH = Math.floor((w * ASPECT_H) / ASPECT_W);
      originX = 0;
      originY = Math.floor((h - cropH) / 2);
    }

    cropW = Math.max(1, cropW);
    cropH = Math.max(1, cropH);
    originX = Math.max(0, Math.min(originX, w - cropW));
    originY = Math.max(0, Math.min(originY, h - cropH));

    actions.push({
      crop: {
        originX,
        originY,
        width: cropW,
        height: cropH,
      },
    });

    const longEdge = Math.max(cropW, cropH);
    if (longEdge > MAX_LONG_EDGE) {
      if (cropW >= cropH) {
        actions.push({ resize: { width: MAX_LONG_EDGE } });
      } else {
        actions.push({ resize: { height: MAX_LONG_EDGE } });
      }
    }

    log('pipeline', {
      sourceW: w,
      sourceH: h,
      crop: { originX, originY, width: cropW, height: cropH },
      resized: longEdge > MAX_LONG_EDGE,
    });
  } else {
    actions.push({ resize: { height: MAX_LONG_EDGE } });
    log('dimensions unknown — resize-only fallback (could not read size for 9:16 crop)', {
      height: MAX_LONG_EDGE,
    });
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
    filename: `full-body-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
  };
};
