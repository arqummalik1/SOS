import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Alert,
  Image,
  ImageSourcePropType,
  ImageURISource,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { typography } from '../../theme/typography';
import { ApiError } from '../../api/errors';
import type { VirtualTryOnRouteParams } from '../../navigation/virtualTryOnRouteParams';
import type { VirtualTryOn } from '../../models/VirtualTryOn.model';
import {
  deleteVirtualTryOn,
  getVirtualTryOn,
  initiateVirtualTryOn,
  mapLabelToTryOnCategory,
  rateVirtualTryOn,
  reactVirtualTryOn,
  type VirtualTryOnReaction,
  regenerateVirtualTryOn,
  saveVirtualTryOnToLookbook,
  scheduleVirtualTryOn,
} from '../../services/virtualTryOnService';
import { notify } from '../../utils/notify';
import { TryOnAiGeneratingOverlay } from '../../components/tryon/TryOnAiGeneratingOverlay';

type VirtualTryOnScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ VirtualTryOn: VirtualTryOnRouteParams | undefined }, 'VirtualTryOn'>;
};

const HERO_FALLBACK = require('../../../assets/VirtualTryOn/Frame 1000006731.png');

const POLL_FAST_MS = 2500;
const POLL_SLOW_MS = 5000;
const POLL_FAST_WINDOW_MS = 30_000;
const POLL_TIMEOUT_MS = 180_000;

const defaultScheduleSlot = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const parseNumericId = (v: string | undefined | null): number | undefined => {
  if (v == null || v === '') return undefined;
  return /^\d+$/.test(v) ? Number(v) : undefined;
};

const safeApiMessage = (e: unknown, fallback: string): string =>
  e instanceof ApiError ? e.message : fallback;

const statusLower = (s: string | undefined) => (s == null ? '' : String(s).toLowerCase());

export const VirtualTryOnScreen: React.FC<VirtualTryOnScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const params = route.params;

  const wardrobeItemIdParam = params?.selectedItem?.wardrobeItemId;
  const outfitIdParam = params?.outfit?.id;
  const existingTryOnId = params?.existingTryOnId;

  const [tryOn, setTryOn] = useState<VirtualTryOn | null>(null);
  const [statusLine, setStatusLine] = useState<string>('Preparing…');
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [displayAspectRatio, setDisplayAspectRatio] = useState<number>(16 / 9);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [starred, setStarred] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartedAtRef = useRef<number | null>(null);
  const pollIntervalMsRef = useRef<number>(POLL_FAST_MS);
  const pollRequestInFlightRef = useRef(false);
  const timedOutRef = useRef(false);
  const pollErrorNotifiedRef = useRef(false);
  const pausedPollingTryOnIdRef = useRef<string | null>(null);

  const contentWidth = width;
  const heroHeight = Math.round(contentWidth * displayAspectRatio);
  const estimatedFloatingTabOverlay = 72 + 24; // Matches CustomTabBar absolute visual footprint on Android

  const canStartTryOn = useMemo(() => {
    if (existingTryOnId && /^\d+$/.test(existingTryOnId)) return true;
    if (parseNumericId(wardrobeItemIdParam ?? null) != null) return true;
    if (parseNumericId(outfitIdParam != null ? String(outfitIdParam) : null) != null) return true;
    return false;
  }, [existingTryOnId, outfitIdParam, wardrobeItemIdParam]);

  const selectedItemUri = useMemo((): string | null => {
    const sel = params?.selectedItem?.image;
    if (sel && typeof sel === 'object' && 'uri' in sel && typeof (sel as ImageURISource).uri === 'string') {
      return (sel as ImageURISource).uri as string;
    }
    return null;
  }, [params?.selectedItem?.image]);

  const isFailed = statusLower(tryOn?.status) === 'failed';
  const isCompleted = statusLower(tryOn?.status) === 'completed';
  /** Any non-terminal job state (pending, processing, or unknown in-flight labels from the API). */
  const inProgress = Boolean(tryOn?.id) && !isCompleted && !isFailed;

  const displayImageMeta = useMemo((): { source: ImageSourcePropType; sourceKind: string } => {
    if (!tryOn) {
      return selectedItemUri
        ? { source: { uri: selectedItemUri }, sourceKind: 'selectedItem' }
        : { source: HERO_FALLBACK, sourceKind: 'fallback' };
    }
    const sl = statusLower(tryOn.status);
    if (sl === 'completed') {
      // Per API docs: show processed image when ready (final background-removed), else show raw result
      const u =
        tryOn.isProcessedResultReady && tryOn.processedResultImageUrl
          ? tryOn.processedResultImageUrl // Final processed image (FULL MODEL)
          : tryOn.resultImageUrl // Raw AI output (fast, shown first)
            || tryOn.processedResultImageUrl // Fallback to processed if flag not set yet
            || tryOn.garmentImageUrl
            || selectedItemUri;
      const sourceKind =
        tryOn.isProcessedResultReady && tryOn.processedResultImageUrl
          ? 'processedResult'
          : tryOn.resultImageUrl
            ? 'result'
            : tryOn.processedResultImageUrl
              ? 'processedResult'
              : tryOn.garmentImageUrl
                ? 'garment'
                : selectedItemUri
                  ? 'selectedItem'
                  : 'fallback';
      return u ? { source: { uri: u }, sourceKind } : { source: HERO_FALLBACK, sourceKind: 'fallback' };
    }
    if (sl === 'failed') {
      const u = tryOn.garmentImageUrl || tryOn.resultImageUrl || selectedItemUri;
      const sourceKind = tryOn.garmentImageUrl
        ? 'garment'
        : tryOn.resultImageUrl
          ? 'result'
          : selectedItemUri
            ? 'selectedItem'
            : 'fallback';
      return u ? { source: { uri: u }, sourceKind } : { source: HERO_FALLBACK, sourceKind: 'fallback' };
    }
    // During generation keep reference stable: model image only (or fallback).
    const u = tryOn.modelImageUrl || null;
    const sourceKind = tryOn.modelImageUrl
      ? 'model'
      : 'fallback';
    return u ? { source: { uri: u }, sourceKind } : { source: HERO_FALLBACK, sourceKind: 'fallback' };
  }, [tryOn, selectedItemUri]);

  const showModelGhost = Boolean(
    tryOn?.modelImageUrl &&
      (inProgress || bootstrapLoading) &&
      canStartTryOn &&
      displayImageMeta.sourceKind !== 'model'
  );

  const showAiOverlay = !isFailed && ((tryOn && inProgress) || (bootstrapLoading && canStartTryOn));

  const displayImageUri = useMemo(() => {
    const s = displayImageMeta.source;
    if (typeof s === 'object' && s && 'uri' in s && typeof (s as { uri?: unknown }).uri === 'string') {
      return (s as { uri: string }).uri;
    }
    return null;
  }, [displayImageMeta.source]);

  useEffect(() => {
    let cancelled = false;
    if (!displayImageUri) {
      const asset = Image.resolveAssetSource(HERO_FALLBACK);
      if (asset?.width && asset?.height && !cancelled) {
        setDisplayAspectRatio((prev) => {
          const next = asset.height / asset.width;
          return Math.abs(prev - next) < 0.01 ? prev : next;
        });
      }
      return () => {
        cancelled = true;
      };
    }

    Image.getSize(
      displayImageUri,
      (w, h) => {
        if (cancelled || !w || !h) return;
        setDisplayAspectRatio((prev) => {
          const next = h / w;
          return Math.abs(prev - next) < 0.01 ? prev : next;
        });
      },
      () => {}
    );
    return () => {
      cancelled = true;
    };
  }, [displayImageUri]);

  useEffect(() => {
    if (!showAiOverlay) {
      setGenerationProgress(0);
      return;
    }
    const started = pollStartedAtRef.current ?? Date.now();
    const tick = () => {
      const elapsed = Date.now() - started;
      // UX target: reach ~95% by 15s, then wait for server completion.
      const p = Math.min(0.95, elapsed / 15_000);
      setGenerationProgress(p);
    };
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [showAiOverlay]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollRequestInFlightRef.current = false;
  }, []);

  const setTryOnIfChanged = useCallback((next: VirtualTryOn) => {
    setTryOn((prev) => {
      if (!prev) return next;
      const same =
        prev.id === next.id &&
        prev.status === next.status &&
        prev.modelImageUrl === next.modelImageUrl &&
        prev.garmentImageUrl === next.garmentImageUrl &&
        prev.resultImageUrl === next.resultImageUrl &&
        prev.processedResultImageUrl === next.processedResultImageUrl &&
        prev.isProcessedResultReady === next.isProcessedResultReady &&
        prev.errorMessage === next.errorMessage &&
        prev.reaction === next.reaction &&
        prev.rating === next.rating &&
        prev.isSavedToLookbook === next.isSavedToLookbook &&
        prev.scheduledFor === next.scheduledFor;
      return same ? prev : next;
    });
  }, []);

  const beginPollingInterval = useCallback(
    (id: string, intervalMs: number) => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollIntervalMsRef.current = intervalMs;
      pollTimerRef.current = setInterval(() => {
        void (async () => {
          if (pollRequestInFlightRef.current) return;
          const startedAt = pollStartedAtRef.current ?? Date.now();
          const elapsed = Date.now() - startedAt;

          if (elapsed >= POLL_TIMEOUT_MS) {
            stopPolling();
            timedOutRef.current = true;
            setStatusLine('Try-on is taking longer than expected. Pull down to retry.');
            if (!pollErrorNotifiedRef.current) {
              pollErrorNotifiedRef.current = true;
              notify({
                type: 'error',
                message: 'Try-on timed out. Please pull down to refresh or retry.',
              });
            }
            return;
          }

          pollRequestInFlightRef.current = true;
          try {
            const next = await getVirtualTryOn(id);

            setTryOnIfChanged(next);
            timedOutRef.current = false;
            pollErrorNotifiedRef.current = false;
            const sl = statusLower(next.status);

            if (sl === 'failed') {
              stopPolling();
              const failureMessage = next.errorMessage?.trim() || 'Virtual try-on failed. Please try again.';
              setStatusLine(failureMessage);
              notify({ type: 'error', message: failureMessage });
              return;
            }

            if (sl === 'completed' && next.resultImageUrl) {
              // Keep showing raw output immediately, then upgrade when processed becomes ready.
              setStatusLine(next.isProcessedResultReady ? 'Here is your try-on.' : 'Final touch-up in progress…');
            } else if (sl === 'pending' || sl === 'processing') {
              setStatusLine('AI is generating your look…');
            }

            if (sl === 'completed' && next.isProcessedResultReady && next.processedResultImageUrl) {
              stopPolling();
              setStatusLine('Here is your try-on.');
              return;
            }
          } catch (e) {
            console.warn('[API - ERROR] Polling error:', e);
            if (!pollErrorNotifiedRef.current) {
              pollErrorNotifiedRef.current = true;
              notify({
                type: 'error',
                message: safeApiMessage(e, 'Could not update try-on status. Retrying...'),
              });
            }
          } finally {
            pollRequestInFlightRef.current = false;
          }
        })();
      }, intervalMs);
    },
    [setTryOnIfChanged, stopPolling]
  );

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      pollStartedAtRef.current = Date.now();
      pollErrorNotifiedRef.current = false;
      timedOutRef.current = false;
      // Fire one immediate poll to reduce first-result latency.
      pollRequestInFlightRef.current = true;
      void getVirtualTryOn(id)
        .then((next) => {
          setTryOnIfChanged(next);
          const sl = statusLower(next.status);
          if (sl === 'failed') {
            stopPolling();
            const failureMessage = next.errorMessage?.trim() || 'Virtual try-on failed. Please try again.';
            setStatusLine(failureMessage);
            notify({ type: 'error', message: failureMessage });
            return;
          }
          if (sl === 'completed' && next.resultImageUrl) {
            setStatusLine(next.isProcessedResultReady ? 'Here is your try-on.' : 'Final touch-up in progress…');
          } else {
            setStatusLine('AI is generating your look…');
          }
          if (sl === 'completed' && next.isProcessedResultReady && next.processedResultImageUrl) {
            stopPolling();
            return;
          }
          beginPollingInterval(id, POLL_FAST_MS);
        })
        .catch((e) => {
          console.warn('[SOS_VIRTUAL_TRYON] Poll bootstrap error:', e);
          beginPollingInterval(id, POLL_FAST_MS);
        })
        .finally(() => {
          pollRequestInFlightRef.current = false;
        });
    },
    [beginPollingInterval, setTryOnIfChanged, stopPolling]
  );

  useEffect(() => {
    if (!pollTimerRef.current || !pollStartedAtRef.current) return;
    const elapsed = Date.now() - pollStartedAtRef.current;
    if (elapsed >= POLL_FAST_WINDOW_MS && pollIntervalMsRef.current !== POLL_SLOW_MS && tryOn?.id) {
      beginPollingInterval(tryOn.id, POLL_SLOW_MS);
    }
  }, [tryOn?.status, tryOn?.id, beginPollingInterval]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        if (pollTimerRef.current && tryOn?.id) {
          pausedPollingTryOnIdRef.current = tryOn.id;
          stopPolling();
        }
        return;
      }

      const resumeId = pausedPollingTryOnIdRef.current;
      const status = statusLower(tryOn?.status);
      const shouldResume =
        Boolean(resumeId) &&
        status !== 'failed' &&
        !(status === 'completed' && tryOn?.isProcessedResultReady && tryOn?.processedResultImageUrl) &&
        !timedOutRef.current;
      if (shouldResume && resumeId) {
        startPolling(resumeId);
      }
      pausedPollingTryOnIdRef.current = null;
    });

    return () => subscription.remove();
  }, [startPolling, stopPolling, tryOn?.id, tryOn?.status, tryOn?.isProcessedResultReady, tryOn?.processedResultImageUrl]);

  useEffect(() => {
    if (tryOn?.reaction === 'liked') {
      setLiked(true);
      setDisliked(false);
    } else if (tryOn?.reaction === 'disliked') {
      setLiked(false);
      setDisliked(true);
    } else {
      setLiked(false);
      setDisliked(false);
    }
    setSaved(Boolean(tryOn?.isSavedToLookbook));
    setStarred(tryOn?.rating != null && tryOn.rating > 0);
    setAddedToCalendar(Boolean(tryOn?.scheduledFor));
  }, [tryOn?.reaction, tryOn?.isSavedToLookbook, tryOn?.rating, tryOn?.scheduledFor]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setBootstrapLoading(true);
      setStatusLine('Preparing…');
      try {
        if (existingTryOnId && /^\d+$/.test(existingTryOnId)) {
          const row = await getVirtualTryOn(existingTryOnId);

          if (cancelled) return;
          setTryOnIfChanged(row);
          setStatusLine(
            isFailedLike(row.status)
              ? (row.errorMessage?.trim() || 'Try-on failed.')
              : isCompletedLike(row.status) && row.isProcessedResultReady
                ? 'Here is your try-on.'
                : isCompletedLike(row.status) && row.resultImageUrl
                  ? 'Final touch-up in progress…'
                  : 'AI is generating your look…'
          );
          if (!isFailedLike(row.status) && !(isCompletedLike(row.status) && row.isProcessedResultReady && row.processedResultImageUrl)) {
            startPolling(row.id);
          }
          return;
        }

        const wid = parseNumericId(wardrobeItemIdParam ?? null);
        if (wid != null) {
          const cat = mapLabelToTryOnCategory(params?.selectedItem?.details?.category);

          const row = await initiateVirtualTryOn({
            wardrobe_item_id: wid,
            category: cat,
            mode: 'balanced',
          });

          if (cancelled) return;
          setTryOnIfChanged(row);
          setStatusLine('AI is generating your look…');
          startPolling(row.id);
          return;
        }

        const oid = parseNumericId(outfitIdParam != null ? String(outfitIdParam) : null);
        if (oid != null) {
          const cat = mapLabelToTryOnCategory(params?.outfit?.category);

          const row = await initiateVirtualTryOn({
            outfit_id: oid,
            category: cat,
            mode: 'balanced',
          });

          if (cancelled) return;
          setTryOnIfChanged(row);
          setStatusLine('AI is generating your look…');
          startPolling(row.id);
          return;
        }

        if (cancelled) return;
        setStatusLine('Open Virtual Try-On from an item in your wardrobe.');
      } catch (e) {
        if (cancelled) return;
        console.warn('[SOS_VIRTUAL_TRYON] bootstrap', e);
        notify({
          type: 'error',
          message: safeApiMessage(e, 'Could not start virtual try-on. Check your connection and try again.'),
        });
        setStatusLine('Could not start try-on.');
      } finally {
        if (!cancelled) {
          setBootstrapLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [
    existingTryOnId,
    outfitIdParam,
    params?.outfit?.category,
    params?.selectedItem?.details?.category,
    wardrobeItemIdParam,
    startPolling,
    stopPolling,
    setTryOnIfChanged,
  ]);

  const onRefresh = useCallback(async () => {
    if (!tryOn?.id) return;
    setRefreshing(true);
    try {
      const row = await getVirtualTryOn(tryOn.id);
      setTryOnIfChanged(row);
      const sl = statusLower(row.status);
      setStatusLine(sl === 'completed' ? 'Here is your try-on.' : sl === 'failed' ? 'Could not finish.' : 'AI is generating…');
    } catch (e) {
      notify({ type: 'error', message: safeApiMessage(e, 'Could not refresh status.') });
    } finally {
      setRefreshing(false);
    }
  }, [setTryOnIfChanged, tryOn?.id]);

  const requireTryOn = (): VirtualTryOn | null => {
    if (!tryOn?.id) {
      notify({ type: 'info', message: 'Start a try-on from a wardrobe item first.' });
      return null;
    }
    return tryOn;
  };

  const withAction = async (fn: () => Promise<void>) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      await fn();
    } finally {
      setActionBusy(false);
    }
  };

  const submitReaction = (reaction: VirtualTryOnReaction) =>
    withAction(async () => {
      const row = requireTryOn();
      if (!row) return;
      if (statusLower(row.status) !== 'completed') {
        notify({ type: 'info', message: 'Result not ready yet.' });
        return;
      }
      try {
        const updated = await reactVirtualTryOn(row.id, reaction);
        setTryOn(updated);
        notify({ type: 'success', message: reaction ? 'Preference saved.' : 'Cleared.' });
      } catch (e) {
        notify({ type: 'error', message: safeApiMessage(e, 'Could not save reaction.') });
      }
    });

  const onToggleLike = () => {
    const wasDisliked = disliked;
    const nextLiked = !liked;
    setLiked(nextLiked);
    if (nextLiked) setDisliked(false);
    const reaction: VirtualTryOnReaction = nextLiked ? 'liked' : wasDisliked ? 'disliked' : null;
    void submitReaction(reaction);
  };

  const onToggleDislike = () => {
    const wasLiked = liked;
    const nextDisliked = !disliked;
    setDisliked(nextDisliked);
    if (nextDisliked) setLiked(false);
    const reaction: VirtualTryOnReaction = nextDisliked ? 'disliked' : wasLiked ? 'liked' : null;
    void submitReaction(reaction);
  };

  const onToggleSave = () =>
    withAction(async () => {
      const row = requireTryOn();
      if (!row) return;
      if (statusLower(row.status) !== 'completed') {
        notify({ type: 'info', message: 'Result not ready yet.' });
        return;
      }
      if (row.isSavedToLookbook) {
        notify({ type: 'info', message: 'Already in your lookbook.' });
        return;
      }
      try {
        const updated = await saveVirtualTryOnToLookbook(row.id);
        setTryOn(updated);
        notify({ type: 'success', message: 'Saved to lookbook.' });
      } catch (e) {
        notify({ type: 'error', message: safeApiMessage(e, 'Could not save to lookbook.') });
      }
    });

  const onShuffle = () =>
    withAction(async () => {
      const row = requireTryOn();
      if (!row) return;
      try {
        setShuffleOn(true);
        console.log('[API - REGENERATE] POST /virtual-try-on/:id/regenerate - Regenerating try-on ID:', row.id);
        const updated = await regenerateVirtualTryOn(row.id, {
          category: mapLabelToTryOnCategory(row.category),
          mode: (row.mode as 'balanced' | 'quality') || 'balanced',
        });
        console.log('[API - REGENERATE] Regeneration started - New ID:', updated.id, '- Status:', updated.status);
        setTryOn(updated);
        startPolling(updated.id);
        setStatusLine('AI is generating your look…');
        notify({ type: 'success', message: 'New version started. This may take a few seconds.' });
      } catch (e) {
        notify({ type: 'error', message: safeApiMessage(e, 'Could not regenerate.') });
      } finally {
        setShuffleOn(false);
      }
    });

  const onToggleStar = () =>
    withAction(async () => {
      const row = requireTryOn();
      if (!row) return;
      if (statusLower(row.status) !== 'completed') {
        notify({ type: 'info', message: 'Result not ready yet.' });
        return;
      }
      const nextRating = starred ? null : 5;
      try {
        const updated = await rateVirtualTryOn(row.id, nextRating);
        setTryOn(updated);
        notify({ type: 'success', message: nextRating ? 'Thanks for the rating.' : 'Rating cleared.' });
      } catch (e) {
        notify({ type: 'error', message: safeApiMessage(e, 'Could not update rating.') });
      }
    });

  const onSchedule = () => {
    const row = requireTryOn();
    if (!row) return;
    if (statusLower(row.status) !== 'completed') {
      notify({ type: 'info', message: 'Result not ready yet.' });
      return;
    }
    const slot = defaultScheduleSlot();
    Alert.alert('Schedule try-on', `Save a reminder for ${slot}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Schedule',
        onPress: () =>
          void withAction(async () => {
            try {
              const updated = await scheduleVirtualTryOn(row.id, slot);
              setTryOn(updated);
              notify({ type: 'success', message: 'Scheduled.' });
            } catch (e) {
              notify({ type: 'error', message: safeApiMessage(e, 'Could not schedule.') });
            }
          }),
      },
    ]);
  };

  const onLongPressHero = () => {
    const row = requireTryOn();
    if (!row) return;
    Alert.alert('Delete try-on', 'Remove this generated try-on from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          void withAction(async () => {
            try {
              stopPolling();
              await deleteVirtualTryOn(row.id);
              notify({ type: 'success', message: 'Deleted.' });
              navigation.goBack();
            } catch (e) {
              notify({ type: 'error', message: safeApiMessage(e, 'Could not delete.') });
            }
          }),
      },
    ]);
  };

  const actionsEnabled =
    Boolean(tryOn?.id) && statusLower(tryOn?.status) === 'completed' && !actionBusy && !bootstrapLoading;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + 72,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          tryOn?.id ? (
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#A580A6" />
          ) : undefined
        }
      >
        <TouchableOpacity style={styles.backRow} activeOpacity={0.75} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={17} color="#1A1A1A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerWrap}>
          <Text style={styles.heading}>Virtual Try-On</Text>
          <Text style={styles.subHeading} numberOfLines={2}>
            {statusLine}
          </Text>
          {showAiOverlay ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(generationProgress * 100)}%` }]} />
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onLongPress={() => void onLongPressHero()}
          delayLongPress={600}
          style={[styles.heroWrap, { width: contentWidth, height: heroHeight }]}
        >
          <Image
            source={displayImageMeta.source}
            style={styles.heroImage}
            resizeMode="contain"
          />
          {showModelGhost && tryOn?.modelImageUrl ? (
            <Image
              source={{ uri: tryOn.modelImageUrl }}
              style={styles.modelGhost}
              resizeMode="contain"
            />
          ) : null}
          {isFailed ? (
            <View style={styles.failedOverlay}>
              <Text style={styles.failedText}>Try-on failed. Pull down to refresh or go back and try again.</Text>
            </View>
          ) : null}
          {showAiOverlay ? (
            <TryOnAiGeneratingOverlay visible containerHeight={heroHeight} />
          ) : bootstrapLoading && !canStartTryOn ? (
            <View style={styles.lightOverlay}>
              <ActivityIndicator size="large" color="#A580A6" />
            </View>
          ) : null}
        </TouchableOpacity>
        <Text style={styles.hintLongPress}>Long-press image to delete this try-on</Text>

        <View style={styles.actionsWrap}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              activeOpacity={0.85}
              disabled={!actionsEnabled}
              onPress={() => void onToggleLike()}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, disliked && styles.actionButtonActive]}
              activeOpacity={0.85}
              disabled={!actionsEnabled}
              onPress={() => void onToggleDislike()}
            >
              <Ionicons name={disliked ? 'thumbs-down' : 'thumbs-down-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, saved && styles.actionButtonActive]}
              activeOpacity={0.85}
              disabled={!actionsEnabled}
              onPress={() => void onToggleSave()}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, shuffleOn && styles.actionButtonActive]}
              activeOpacity={0.85}
              disabled={!tryOn?.id || actionBusy || bootstrapLoading}
              onPress={() => void onShuffle()}
            >
              <Ionicons name="shuffle-outline" size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, starred && styles.actionButtonActive]}
              activeOpacity={0.85}
              disabled={!actionsEnabled}
              onPress={() => void onToggleStar()}
            >
              <Ionicons name={starred ? 'star' : 'star-outline'} size={29} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, addedToCalendar && styles.actionButtonActive]}
              activeOpacity={0.85}
              disabled={!actionsEnabled}
              onPress={() => void onSchedule()}
            >
              <Ionicons name={addedToCalendar ? 'calendar' : 'calendar-outline'} size={29} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

function isCompletedLike(status: string | undefined): boolean {
  return statusLower(status) === 'completed';
}

function isFailedLike(status: string | undefined): boolean {
  return statusLower(status) === 'failed';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 80,
  },
  backRow: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  backText: {
    ...typography.caption1,
    color: '#2D2D2D',
  },
  headerWrap: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  heading: {
    ...typography.title1,
    color: '#151515',
  },
  subHeading: {
    marginTop: 4,
    ...typography.caption1,
    color: '#3A3A3A',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  progressTrack: {
    marginTop: 10,
    width: '84%',
    height: 6,
    backgroundColor: '#E3D8E8',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A580A6',
    borderRadius: 999,
  },
  hintLongPress: {
    ...typography.caption1,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 6,
  },
  heroWrap: {
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  modelGhost: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,21,21,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  failedText: {
    ...typography.caption1,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsWrap: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  actionButtonActive: {
    opacity: 0.78,
  },
});
