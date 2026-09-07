import { useWindowDimensions } from 'react-native';

/** Width in points at which a second column of recipe cards fits comfortably. */
const TABLET_BREAKPOINT = 600;
/** Width at which a third column fits. */
const WIDE_BREAKPOINT = 900;
/**
 * Height below which a tile card - a wide photo above the text - costs more
 * vertical room than it is worth. A landscape phone sits under this.
 */
const TALL_ENOUGH_FOR_TILES = 600;

export interface Layout {
  width: number;
  height: number;
  isLandscape: boolean;
  /** True from tablet width upwards, in either orientation. */
  isWide: boolean;
  /** How many recipe cards to place per row. */
  columns: number;
  /**
   * Whether cards should stack their photo above the text. False on a
   * landscape phone, which is wide enough for two columns but too short to
   * spend the height on a cover photo.
   */
  prefersTiles: boolean;
}

/**
 * Describes the current window so screens can adapt to phone or tablet and to
 * either orientation.
 *
 * Reads `useWindowDimensions`, which re-renders on rotation and on split-screen
 * resize - unlike `Dimensions.get`, which is captured once.
 */
export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isLandscape: width > height,
    isWide: width >= TABLET_BREAKPOINT,
    columns: width >= WIDE_BREAKPOINT ? 3 : width >= TABLET_BREAKPOINT ? 2 : 1,
    prefersTiles: width >= TABLET_BREAKPOINT && height >= TALL_ENOUGH_FOR_TILES,
  };
}
