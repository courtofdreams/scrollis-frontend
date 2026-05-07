import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PieChart } from 'react-native-gifted-charts'
import TopicsExploredGraph from '../components/TopicsExploredGraph'
import { themeColors } from '../utils/Theme'
import { MaterialIcons } from '@expo/vector-icons'
import { useAppAuthContext } from '../contexts/AppAuthContext'
import { useAnalysisResult } from '../contexts/AnalysisContext'
import { HistoricalTopic, Topic } from '../models/Analysis'
import { useAnalysis } from '../hooks/useAnalysis'

const colorsSeries = [
  '#4F47BD',
  '#7E77D7',
  '#CECBF3',
  '#B9B5E3',
  '#EDEBFF',
  '#F8F8F8',
  '#C1C1C1',
  '#A9A9A9',
  '#7971CF',
  '#B9B5E3',
]

export default function ProfileScreen() {
  const [activeRange, setActiveRange] = useState<'7d' | '30d'>('7d')
  const { name, username }= useAppAuthContext()
  const { analysis } = useAnalysisResult();
  const { fetchHistoricalTopics } = useAnalysis();
  const [ topicData, setTopicData ] = useState([])
  const [historicalTopics, setHistoricalTopics] = useState<HistoricalTopic[]>([])


  const extractedTopics = useMemo(() => {
    if (!analysis) return [];

    const topics = analysis.topics.map((topic: Topic) => topic.category);

    return topics
  }, [analysis]);
  
  const avatarText = useMemo(() => {   
    if (!name) return 'NA'
    const parts = name.trim().split(' ')
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    } else {
      return (
        parts[0].charAt(0).toUpperCase() +
        parts[parts.length - 1].charAt(0).toUpperCase()
      )
    }
  }, [name])

  const perspectiveSeries = useMemo(
    () => [
      { key: 'Your Feed', value: 58, color: '#534AB7' },
      { key: 'Wandering', value: 28, color: '#8D85DC' },
      { key: 'Uncharted', value: 14, color: '#D9D8D5' },
    ],
    [],
  )

  const topicsData = useMemo(() => {
    if (!historicalTopics || historicalTopics.length === 0) return [];

    return historicalTopics.map((topic, index) => ({
      label: topic.category,
      value: topic.percentage,
      count: topic.count,
      color: colorsSeries[index % colorsSeries.length],
    }));
  }, [historicalTopics]);

  const curatedTopics = useMemo(
    () => {
      if (!extractedTopics) return [];

      const uniqueTopics = Array.from(new Set(extractedTopics));
      return uniqueTopics;
    },
    [extractedTopics]
  )

  useEffect(() => {
    if (!fetchHistoricalTopics) return;

    const fetchHistoricalTopicsData = async () => {
      try {
        const data = await fetchHistoricalTopics();
        setHistoricalTopics(data.historicalTopics || []);
      } catch (error) {
        console.error('Failed to fetch historical topics data:', error);
      }
    };

    fetchHistoricalTopicsData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Pressable style={styles.calendarButton}>
            <MaterialIcons style={styles.calendarLogo} name="calendar-today" size={10}/>
          </Pressable>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{username}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>194</Text>
              <Text style={styles.metricLabel}>Posts Read</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>54</Text>
              <Text style={styles.metricLabel}>Topics Explored</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>7</Text>
              <Text style={styles.metricLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.sectionHeading}>Your Content Consumption</Text>
          <Text style={styles.sectionSubheading}>This is what you've been into lately</Text>

          <View style={styles.rangeRow}>
            <TouchableOpacity
              onPress={() => setActiveRange('7d')}
              style={[styles.rangeChip, activeRange === '7d' && styles.rangeChipActive]}
            >
              <Text style={[styles.rangeText, activeRange === '7d' && styles.rangeTextActive]}>
                Last 7d
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveRange('30d')}
              style={[styles.rangeChip, activeRange === '30d' && styles.rangeChipActive]}
            >
              <Text style={[styles.rangeText, activeRange === '30d' && styles.rangeTextActive]}>
                Last 30d
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.blockTitle}>Perspectives You've Seen</Text>

          <View style={styles.chartWrap}>
            <PieChart
              data={perspectiveSeries.map((item) => ({ value: item.value, color: item.color }))}
              donut
              radius={92}
              innerRadius={62}
              centerLabelComponent={() => <Text style={styles.centerValue}>58%</Text>}
            />
          </View>

          <View style={styles.legendWrap}>
            {perspectiveSeries.map((item) => (
              <View key={item.key} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.key}</Text>
                <Text style={styles.legendValue}>{item.value}%</Text>
              </View>
            ))}
          </View>

          <Text style={styles.reachText}>↑ 8% more reach than last week</Text>

          <View style={styles.divider} />

          <Text style={styles.blockTitle}>Topics You've Explored</Text>
          <TopicsExploredGraph topics={topicsData} />

          <View style={styles.divider} />

          <Text style={styles.blockTitle}>Your Curated Topics</Text>
          <View style={styles.tagWrap}>
            {curatedTopics.map((topic) => (
              <View key={topic} style={styles.tagChip}>
                <Text style={styles.tagText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    // paddingHorizontal: 16,
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: themeColors.primaryDim,
    borderWidth: 1,
    borderColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  calendarLogo: {
    color: themeColors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  handle: {
    color: '#475467',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 18,
  },
  metricsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: themeColors.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#D1D5DB',
  },
  contentCard: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  sectionHeading: {
    color: themeColors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubheading: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  rangeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  rangeChip: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  rangeChipActive: {
    borderColor: '#B9B6E8',
    backgroundColor: '#EDEBFF',
  },
  rangeText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '500',
  },
  rangeTextActive: {
    color: themeColors.primary,
    fontWeight: '600',
  },
  blockTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  chartWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  centerValue: {
    color: '#6B6B6B',
    fontSize: 40,
    fontWeight: '700',
  },
  legendWrap: {
    marginTop: 6,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    color: '#344054',
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '700',
  },
  reachText: {
    color: '#00A98F',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  tagText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
})