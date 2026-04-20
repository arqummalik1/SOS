import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/**
 * Walks up the navigation tree to find the root stack that hosts `AddItemCamera` / `AddItemGallery`
 * (registered next to `Main` in `RootNavigator`).
 */
function findNavigatorWithRoute(
  navigation: NavigationProp<ParamListBase>,
  routeName: string
): NavigationProp<ParamListBase> | undefined {
  let nav: NavigationProp<ParamListBase> | undefined = navigation;
  for (let i = 0; i < 8 && nav; i += 1) {
    const names = nav.getState?.()?.routeNames;
    if (names?.includes(routeName)) {
      return nav;
    }
    nav = nav.getParent?.();
  }
  return undefined;
}

export function navigateToAddItemCamera(
  navigation: NavigationProp<ParamListBase>,
  params?: { folderId?: string }
): boolean {
  const root = findNavigatorWithRoute(navigation, 'AddItemCamera');
  if (!root) {
    console.warn('[SOS_NAV] navigateToAddItemCamera: root stack not found');
    return false;
  }
  (root as unknown as { navigate: (name: string, p?: object) => void }).navigate('AddItemCamera', params);
  return true;
}

export function navigateToAddItemGallery(
  navigation: NavigationProp<ParamListBase>,
  params?: { folderId?: string }
): boolean {
  const root = findNavigatorWithRoute(navigation, 'AddItemGallery');
  if (!root) {
    console.warn('[SOS_NAV] navigateToAddItemGallery: root stack not found');
    return false;
  }
  (root as unknown as { navigate: (name: string, p?: object) => void }).navigate('AddItemGallery', params);
  return true;
}
