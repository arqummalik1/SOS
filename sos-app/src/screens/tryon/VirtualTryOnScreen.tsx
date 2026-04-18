import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

const LOG = '[SOS_VIRTUAL_TRYON_UI]';

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

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [starred, setStarred] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const contentWidth = Math.min(430, width - 24);
  const heroHeight = Math.round(contentWidth * 1.53);

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

  const displayImage = useMemo((): ImageSourcePropType => {
    if (!tryOn) {
      return selectedItemUri ? { uri: selectedItemUri } : HERO_FALLBACK;
    }
    const sl = statusLower(tryOn.status);
    if (sl === 'completed') {
      const u =
        tryOn.processedResultImageUrl || tryOn.resultImageUrl || tryOn.garmentImageUrl || selectedItemUri;
      return u ? { uri: u } : HERO_FALLBACK;
    }
    if (sl === 'failed') {
      const u = tryOn.garmentImageUrl || tryOn.resultImageUrl || selectedItemUri;
      return u ? { uri: u } : HERO_FALLBACK;
    }
    const u =
      tryOn.garmentImageUrl || selectedItemUri || tryOn.modelImageUrl || tryOn.resultImageUrl || null;
    return u ? { uri: u } : HERO_FALLBACK;
  }, [tryOn, selectedItemUri]);

  const showModelGhost = Boolean(tryOn?.modelImageUrl && (inProgress || bootstrapLoading) && canStartTryOn);

  const showAiOverlay = !isFailed && ((tryOn && inProgress) || (bootstrapLoading && canStartTryOn));

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(() => {
        void (async () => {
          try {
            const next = await getVirtualTryOn(id);
            setTryOn(next);
            const sl = statusLower(next.status);
            if (sl === 'completed' || sl === 'failed') {
              stopPolling();
              setStatusLine(sl === 'failed' ? 'Could not finish this try-on.' : 'Here is your try-on.');
            } else {
              setStatusLine('AI is generating your look…');
            }
          } catch (e) {
            console.warn(`${LOG} poll`, e);
          }
        })();
      }, 2200);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

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
          setTryOn(row);
          setStatusLine(isCompletedLike(row.status) ? 'Here is your try-on.' : 'AI is generating your look…');
          if (!isCompletedLike(row.status) && !isFailedLike(row.status)) {
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
          setTryOn(row);
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
          setTryOn(row);
          setStatusLine('AI is generating your look…');
          startPolling(row.id);
          return;
        }

        if (cancelled) return;
        setStatusLine('Open Virtual Try-On from an item in your wardrobe.');
      } catch (e) {
        if (cancelled) return;
        console.warn(`${LOG} bootstrap`, e);
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
    startPolling,
    stopPolling,
    wardrobeItemIdParam,
  ]);

  const onRefresh = useCallback(async () => {
    if (!tryOn?.id) return;
    setRefreshing(true);
    try {
      const row = await getVirtualTryOn(tryOn.id);
      setTryOn(row);
      const sl = statusLower(row.status);
      setStatusLine(sl === 'completed' ? 'Here is your try-on.' : sl === 'failed' ? 'Could not finish.' : 'AI is generating…');
    } catch (e) {
      notify({ type: 'error', message: safeApiMessage(e, 'Could not refresh status.') });
    } finally {
      setRefreshing(false);
    }
  }, [tryOn?.id]);

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
        const updated = await regenerateVirtualTryOn(row.id, {
          category: mapLabelToTryOnCategory(row.category),
          mode: (row.mode as 'balanced' | 'quality') || 'balanced',
        });
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
            paddingHorizontal: Math.max(12, (width - contentWidth) / 2),
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
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onLongPress={() => void onLongPressHero()}
          delayLongPress={600}
          style={[styles.heroWrap, { width: contentWidth, height: heroHeight }]}
        >
          <Image source={displayImage} style={styles.heroImage} resizeMode="cover" />
          {showModelGhost && tryOn?.modelImageUrl ? (
            <Image source={{ uri: tryOn.modelImageUrl }} style={styles.modelGhost} resizeMode="cover" />
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
    paddingTop: 16,
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
    marginTop: 2,
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
  hintLongPress: {
    ...typography.caption1,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 6,
  },
  heroWrap: {
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
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
