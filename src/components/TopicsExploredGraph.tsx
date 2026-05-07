import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type TopicItem = {
  label: string
  value: number
  color?: string
}

type TopicWithPercent = TopicItem & {
  percent: number
}

type TopicsExploredGraphProps = {
  topics: TopicItem[]
}

const DEFAULT_COLORS = ['#534AB7', '#7971CF', '#B9B5E3', '#D6D4EC', '#E5E3F5']

function toPercent(value: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.round((value / total) * 100)
}

export default function TopicsExploredGraph({ topics }: TopicsExploredGraphProps) {
  const normalizedTopics = useMemo<TopicWithPercent[]>(() => {
    const total = topics.reduce((sum, item) => sum + item.value, 0)

    return [...topics]
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        percent: toPercent(item.value, total),
      }))
  }, [topics])

  if (normalizedTopics.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No topics explored yet.</Text>
      </View>
    )
  }

  const [first, second, third, ...rest] = normalizedTopics

  return (
    <View>
      {first ? (
        <View style={[styles.topicTile, styles.fullWidthTile, { backgroundColor: first.color }]}>
          <Text style={styles.primaryTileText}>{first.label}</Text>
          <Text style={styles.primaryTileText}>{first.percent}%</Text>
        </View>
      ) : null}

      <View style={styles.twoColRow}>
        {second ? (
          <View style={[styles.topicTile, styles.halfTile, { backgroundColor: second.color }]}>
            <Text style={styles.secondaryTileText}>{second.label}</Text>
            <Text style={styles.secondaryTileText}>{second.percent}%</Text>
          </View>
        ) : null}

        {third ? (
          <View style={[styles.topicTile, styles.halfTile, { backgroundColor: third.color }]}>
            <Text style={styles.secondaryTileText}>{third.label}</Text>
            <Text style={styles.secondaryTileText}>{third.percent}%</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.gridWrap}>
        {rest.map((topic) => (
          <View
            key={topic.label}
            style={[styles.topicTile, styles.smallTile, { backgroundColor: topic.color }]}
          >
            <Text style={styles.smallTileText}>{topic.label}</Text>
            <Text style={styles.smallTileText}>{topic.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: 18,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  topicTile: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  fullWidthTile: {
    width: '100%',
    minHeight: 84,
    justifyContent: 'center',
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  halfTile: {
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  gridWrap: {
    marginTop: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallTile: {
    width: '49.2%',
    minHeight: 54,
    justifyContent: 'center',
  },
  primaryTileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
  },
  secondaryTileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  },
  smallTileText: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
})
