import React from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SearchScreen() {
  const recentSearches = ['AI Regulation', 'Climate', 'Privacy']

  const trendingTopics = [
    {
      title: 'AI Regulation in the EU',
      description: 'New framework sets global precedent for algorithmic accountability',
    },
    {
      title: 'Climate Tipping Points',
      description: 'New research identifies five critical thresholds closer than expected',
    },
    {
      title: 'Universal Basic Income Trials',
      description: 'Three-year pilot programs show mixed economic outcomes',
    },
    {
      title: 'Space Mining Rights',
      description: 'International debate over asteroid resource extraction heats up',
    },
    {
      title: 'Gene Editing for Crops',
      description: 'CRISPR-modified varieties approved for commercial use',
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={22} color="#7B7B7B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics, themes..."
            placeholderTextColor="#7B7B7B"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
          <View style={styles.chipsRow}>
            {recentSearches.map((item) => (
              <Pressable key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRENDING</Text>
          <View style={styles.cardsColumn}>
            {trendingTopics.map((topic) => (
              <Pressable key={topic.title} style={styles.topicCard}>
                <View style={styles.cardAccent} />
                <View style={styles.cardContent}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  scrollContent: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEAE4',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#2A2A2A',
    fontWeight: '400',
    paddingVertical: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 40,
    fontWeight: '700',
    color: '#6E6E6E',
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 999,
    backgroundColor: '#FAFAFA',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#252525',
  },
  cardsColumn: {
    gap: 10,
  },
  topicCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    paddingVertical: 16,
    paddingRight: 14,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardAccent: {
    width: 5,
    borderRadius: 10,
    backgroundColor: '#5448CB',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#707070',
    fontWeight: '400',
  },
})