import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';

import { useAsyncCallback } from '@/hooks/use-async-callback';
import { persistPhoto } from '@/storage/photo-storage';

/** Where a photo comes from. */
export type PhotoSource = 'camera' | 'library';

/** Raised when the user declines the permission a source needs. */
export class PermissionDeniedError extends Error {
  constructor(readonly source: PhotoSource) {
    super(
      source === 'camera'
        ? 'YumBook needs permission to use your camera. You can grant it in Settings.'
        : 'YumBook needs permission to use your photo library. You can grant it in Settings.'
    );
    this.name = 'PermissionDeniedError';
  }
}

interface UseImagePickerOptions {
  /** Receives the URI of a photo already copied into permanent storage. */
  onPicked: (uri: string) => void;
  /** Called if a permission is refused or the picker fails. */
  onError?: (error: Error) => void;
}

export interface ImagePickerApi {
  /** Opens the camera or the library, requesting permission first if needed. */
  pick: (source: PhotoSource) => void;
  /** True while a picker is open or a photo is being copied. */
  isPicking: boolean;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.7,
};

/**
 * Choosing a recipe photo, end to end.
 *
 * Bundles the three steps that always travel together - request the right
 * permission, open the right picker, copy the result out of the cache
 * directory - so a component that wants a photo only has to say where from.
 *
 * Permission state comes from expo-image-picker's own hooks, which keep the
 * granted status in React state rather than re-querying the OS on every call.
 */
export function useImagePicker({ onPicked, onError }: UseImagePickerOptions): ImagePickerApi {
  const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const pickPhoto = useCallback(
    async (source: PhotoSource) => {
      const alreadyGranted =
        source === 'camera' ? cameraPermission?.granted : libraryPermission?.granted;

      const granted =
        alreadyGranted === true ||
        (source === 'camera'
          ? (await requestCameraPermission()).granted
          : (await requestLibraryPermission()).granted);

      if (!granted) {
        throw new PermissionDeniedError(source);
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

      const asset = result.canceled ? undefined : result.assets?.[0];

      // A cancelled picker is a normal outcome, not a failure.
      if (asset !== undefined) {
        onPicked(persistPhoto(asset.uri));
      }
    },
    [
      cameraPermission?.granted,
      libraryPermission?.granted,
      requestCameraPermission,
      requestLibraryPermission,
      onPicked,
    ]
  );

  const { run, isPending } = useAsyncCallback(pickPhoto, { onError });

  const pick = useCallback(
    (source: PhotoSource) => {
      void run(source);
    },
    [run]
  );

  return { pick, isPicking: isPending };
}
