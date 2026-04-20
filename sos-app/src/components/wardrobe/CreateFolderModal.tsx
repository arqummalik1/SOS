import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { typography } from '../../theme/typography';
import { wardrobeFolderService } from '../../services/wardrobeFolderService';
import { ApiError } from '../../api/errors';
import { notify } from '../../utils/notify';
import { logSosError } from '../../utils/logSosError';

const LOG = '[SOS_CREATE_FOLDER_MODAL]';

type CreateFolderModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  onClose,
  onCreated,
}) => {
  const { width } = useWindowDimensions();
  const sheetWidth = Math.min(360, width - 32);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorCode, setColorCode] = useState('#2563eb');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setColorCode('#2563eb');
    setIsSubmitting(false);
  }, []);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      notify({ type: 'error', message: 'Please enter a folder name.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await wardrobeFolderService.createFolder({
        name: trimmedName,
        description: description.trim(),
        color_code: colorCode.trim() || '#2563eb',
      });
      notify({ type: 'success', message: 'Wardrobe folder created.' });
      reset();
      onCreated();
      onClose();
    } catch (error) {
      logSosError(LOG, 'createFolder', error);
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Could not create folder. Please try again.';
      notify({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={[styles.sheet, { width: sheetWidth }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.title}>Create wardrobe</Text>
            <Text style={styles.subtitle}>Add a new folder to organize items.</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Work Outfits"
              placeholderTextColor="#888888"
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Short description"
              placeholderTextColor="#888888"
              multiline
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Color (hex)</Text>
            <TextInput
              style={styles.input}
              value={colorCode}
              onChangeText={setColorCode}
              placeholder="#2563eb"
              placeholderTextColor="#888888"
              autoCapitalize="none"
              editable={!isSubmitting}
            />

            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.btnGhost]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.btnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Create</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    ...typography.title3,
    color: '#111111',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.footnote,
    color: '#666666',
    marginBottom: 16,
  },
  label: {
    ...typography.caption1,
    color: '#444444',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    ...typography.body,
    color: '#111111',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    minWidth: 100,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  btnGhost: {
    backgroundColor: '#EFEFEF',
  },
  btnGhostText: {
    ...typography.callout,
    color: '#222222',
  },
  btnPrimary: {
    backgroundColor: '#111111',
  },
  btnPrimaryText: {
    ...typography.callout,
    color: '#FFFFFF',
  },
});
