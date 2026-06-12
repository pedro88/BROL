/**
 * PhotoPicker — bouton "Choisir une photo" via expo-image-picker.
 *
 * @package @brol/mobile
 */

import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { spacing } from "../theme";
import { Button } from "./ui/button";

export interface PickedPhoto {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

interface PhotoPickerProps {
  onPhotoSelected: (photo: PickedPhoto | null) => void;
  disabled?: boolean;
}

export function PhotoPicker({ onPhotoSelected, disabled }: PhotoPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission refusée", "Autorisez l'accès aux photos dans les réglages.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }
    const asset = result.assets[0];
    setPreview(asset.uri);
    onPhotoSelected({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize ?? 0,
    });
  };

  const clear = () => {
    setPreview(null);
    onPhotoSelected(null);
  };

  return (
    <View style={styles.wrapper}>
      {preview ? (
        <>
          <Image source={{ uri: preview }} style={styles.preview} />
          <View style={styles.row}>
            <Button variant="outline" size="sm" onPress={pick} disabled={disabled}>
              Changer
            </Button>
            <Button variant="ghost" size="sm" onPress={clear} disabled={disabled}>
              Supprimer
            </Button>
          </View>
        </>
      ) : (
        <Button variant="outline" onPress={pick} disabled={disabled} fullWidth>
          Choisir une photo
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 4,
  },
  row: { flexDirection: "row", gap: spacing.sm },
});
