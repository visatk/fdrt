import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-native-markdown-display';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme() ?? 'light';
  
  const isNew = id === 'new';
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch existing note if not new
  const { data: existingNote, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => api.getNote(id!),
    enabled: !isNew,
  });

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [existingNote]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: api.saveNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.back();
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      id: isNew ? undefined : id,
      title,
      content,
    });
  };

  if (isLoading && !isNew) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          headerTitle: isNew ? 'New Note' : 'Edit Note',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saveMutation.isPending}>
              <ThemedText style={{ color: Colors[colorScheme].tint, fontWeight: 'bold' }}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ThemedView style={styles.container}>
        {/* Title Input */}
        <TextInput
          style={[styles.titleInput, { color: Colors[colorScheme].text }]}
          placeholder="Note Title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        {/* Toolbar */}
        <ThemedView style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.tab, mode === 'edit' && styles.activeTab]}
            onPress={() => setMode('edit')}
          >
            <ThemedText>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'preview' && styles.activeTab]}
            onPress={() => setMode('preview')}
          >
            <ThemedText>Preview</ThemedText>
          </TouchableOpacity>
          
          {!isNew && (
             <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteMutation.mutate(id!)}>
               <IconSymbol name="trash" size={20} color="red" />
             </TouchableOpacity>
          )}
        </ThemedView>

        {/* Editor / Preview Area */}
        <ThemedView style={styles.editorContainer}>
          {mode === 'edit' ? (
            <TextInput
              style={[
                styles.contentInput, 
                { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background }
              ]}
              multiline
              placeholder="Write your markdown here..."
              placeholderTextColor="#888"
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          ) : (
            <ScrollView style={styles.previewScroll}>
              <Markdown
                style={{
                  body: { color: Colors[colorScheme].text },
                  code_block: { backgroundColor: '#333', padding: 10, borderRadius: 5 },
                  code_inline: { backgroundColor: '#333', color: '#fff' },
                }}
              >
                {content}
              </Markdown>
            </ScrollView>
          )}
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleInput: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, padding: 8 },
  toolbar: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  tab: { paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, borderRadius: 16, overflow: 'hidden' },
  activeTab: { backgroundColor: 'rgba(150, 150, 150, 0.2)' },
  deleteBtn: { marginLeft: 'auto', padding: 8 },
  editorContainer: { flex: 1, borderRadius: 8, overflow: 'hidden' },
  contentInput: { flex: 1, fontSize: 16, padding: 12, lineHeight: 24 },
  previewScroll: { flex: 1, padding: 12 },
});
