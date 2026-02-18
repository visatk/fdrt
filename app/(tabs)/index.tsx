import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, Note } from '@/services/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  const { data: notes, isLoading, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: api.getNotes,
  });

  const renderItem = ({ item }: { item: Note }) => (
    <Link href={`/note/${item.id}`} asChild>
      <TouchableOpacity>
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {item.title}
          </ThemedText>
          <ThemedText numberOfLines={2} style={styles.cardPreview}>
            {item.content}
          </ThemedText>
          <ThemedText style={styles.date}>
            {new Date((item.updated_at || 0) * 1000).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">DevNotes</ThemedText>
        <TouchableOpacity onPress={() => router.push(`/note/new`)}>
          <IconSymbol name="plus.circle.fill" size={32} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </ThemedView>

      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
              No notes yet. Create one!
            </ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listContent: { paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  cardTitle: { marginBottom: 4 },
  cardPreview: { opacity: 0.7, marginBottom: 8 },
  date: { fontSize: 12, opacity: 0.5 },
});
