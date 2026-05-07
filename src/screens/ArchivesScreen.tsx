import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Dimensions, ActivityIndicator } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'
import { themeColors } from '../utils/Theme'
import { HistoricalDigest, HistoricalDigestResponse, TopicDigest } from '../models/Analysis'
import { useAnalysis } from '../hooks/useAnalysis'

const SCREEN_HEIGHT = Dimensions.get('window').height

const CATEGORY_COLORS: Record<string, string> = {
    Sports: '#22C55E',
    Entertainment: '#F59E0B',
    Technology: '#3B82F6',
    Politics: '#EF4444',
    Science: '#8B5CF6',
    Business: '#06B6D4',
    Health: '#EC4899',
    Default: '#9CA3AF',
}

interface ArchivesScreenProps {
    visible: boolean
    onClose: () => void
    fetchHistoricalDigests: () => Promise<HistoricalDigestResponse>
}

export default function ArchivesScreen({ visible, onClose }: ArchivesScreenProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [modalMounted, setModalMounted] = useState(false)
    const [historicalDigests, setHistoricalDigests] = useState<HistoricalDigest[]>([])
    const [loading, setLoading] = useState(false)
    const { fetchHistoricalDigests } = useAnalysis()

    const translateY = useSharedValue(SCREEN_HEIGHT)

    // All hooks before early return
    useEffect(() => {
        if (visible) {
            setModalMounted(true)
            setTimeout(() => {
                translateY.value = withSpring(0, { damping: 28, stiffness: 280, mass: 0.8 })
            }, 10)
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280 }, (finished) => {
                if (finished) runOnJS(setModalMounted)(false)
            })
        }
    }, [visible])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await fetchHistoricalDigests()
                setHistoricalDigests(res.historicalDigests)
                // Auto-select the most recent date
                if (res.historicalDigests.length > 0) {
                    const latest = res.historicalDigests[res.historicalDigests.length - 1]
                    setSelectedDate(new Date(latest.date))
                    setCurrentDate(new Date(latest.date))
                }
            } catch (e) {
                console.error('Error fetching historical digests:', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }))

    // Build a map of date string -> digest for O(1) lookup
    const digestMap = useMemo(() => {
        const map: Record<string, HistoricalDigest> = {}
        historicalDigests.forEach(d => {
            map[d.date] = d // key: "2026-05-07"
        })
        return map
    }, [historicalDigests])

    const digestDateStrings = useMemo(() => new Set(Object.keys(digestMap)), [digestMap])

    const toDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    const hasDigest = (date: Date) => digestDateStrings.has(toDateKey(date))

    const today = new Date()
    const isToday = (date: Date) =>
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

    const isSelected = (date: Date) =>
        !!selectedDate && toDateKey(date) === toDateKey(selectedDate)

    const selectedDigest = useMemo(() => {
        if (!selectedDate) return null
        return digestMap[toDateKey(selectedDate)] ?? null
    }, [selectedDate, digestMap])

    const handlePrevMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))

    const handleNextMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayJS = new Date(year, month, 1).getDay()
        const offset = (firstDayJS + 6) % 7

        const days: (Date | null)[] = []
        for (let i = 0; i < offset; i++) days.push(null)
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))
        return days
    }, [currentDate])

    useEffect(() => {
    if (historicalDigests.length > 0) {
        const sorted = [...historicalDigests].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        const [year, month, day] = sorted[0].date.split('-').map(Number)
        setSelectedDate(new Date(year, month - 1, day))
        setCurrentDate(new Date(year, month - 1, day))
    }
    }, [historicalDigests])

    if (!modalMounted) return null

    return (
        <Modal visible={modalMounted} transparent animationType="none" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />

            <Animated.View style={[styles.sheet, sheetStyle]}>
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.sheetHeader}>
                    <View style={styles.sheetHeaderIcon}>
                        <MaterialIcons name="calendar-today" size={18} color={themeColors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sheetTitle}>Archives</Text>
                        <Text style={styles.sheetSubtitle}>Previous daily digests</Text>
                    </View>
                    <Pressable onPress={onClose} hitSlop={10}>
                        <MaterialIcons name="close" size={22} color="#9CA3AF" />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Month Navigation */}
                    <View style={styles.monthHeader}>
                        <Pressable onPress={handlePrevMonth} style={styles.navButton}>
                            <MaterialIcons name="chevron-left" size={22} color="#444" />
                        </Pressable>
                        <Text style={styles.monthText}>{monthName}</Text>
                        <Pressable onPress={handleNextMonth} style={styles.navButton}>
                            <MaterialIcons name="chevron-right" size={22} color="#444" />
                        </Pressable>
                    </View>

                    {/* Day Headers */}
                    <View style={styles.dayHeaderRow}>
                        {dayNames.map(day => (
                            <Text key={day} style={styles.dayHeader}>{day}</Text>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {calendarDays.map((date, index) => (
                            <Pressable
                                key={index}
                                style={styles.dayCell}
                                onPress={() => date && hasDigest(date) && setSelectedDate(date)} // ← only selectable if has digest
                                disabled={!date}
                                >
                                {date && (
                                    <>
                                    <View style={[
                                        styles.dayNumWrap,
                                        isSelected(date) && styles.selectedCircle,
                                        !isSelected(date) && isToday(date) && styles.todayCircle,
                                    ]}>
                                        <Text style={[
                                        styles.dayText,
                                        isSelected(date) && styles.selectedDayText,
                                        isToday(date) && !isSelected(date) && styles.todayText,
                                        !hasDigest(date) && styles.dimmedDayText, // ← dim if no digest
                                        ]}>
                                        {date.getDate()}
                                        </Text>
                                    </View>
                                    <View style={[styles.dot, !hasDigest(date) && styles.dotHidden]} />
                                    </>
                                )}
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Bottom Content */}
                    {loading ? (
                        <ActivityIndicator color={themeColors.primary} style={{ marginTop: 20 }} />
                    ) : selectedDigest ? (
                        <DigestDetail digest={selectedDigest} />
                    ) : (
                        <EmptyState onClose={onClose} />
                    )}
                </ScrollView>
            </Animated.View>
        </Modal>
    )
}

// ── Digest Detail ────────────────────────────────────────────────────────────

function DigestDetail({ digest }: { digest: HistoricalDigest }) {
    return (
        <View style={styles.digestContainer}>
            {/* Date header */}
            <View style={styles.digestHeaderRow}>
                <Text style={styles.digestWeekday}>{digest.weekday}</Text>
                <Text style={styles.digestDate}>{formatDate(digest.date)}</Text>
            </View>

            {/* Summary */}
            <Text style={styles.digestSummary}>{digest.summary}</Text>

            {/* Topic pills */}
            <View style={styles.topicPillsRow}>
                {digest.topics.map(topic => (
                    <View key={topic.topicId} style={styles.topicPill}>
                        <Text style={styles.topicPillText}>{topic.headline}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

function TopicCard({ topic }: { topic: TopicDigest }) {
    const color = CATEGORY_COLORS[topic.category] ?? CATEGORY_COLORS.Default

    return (
        <View style={styles.topicCard}>
            <View style={styles.topicCardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.categoryText, { color }]}>{topic.category}</Text>
                </View>
                <View style={styles.topicStats}>
                    <MaterialIcons name="article" size={12} color="#9CA3AF" />
                    <Text style={styles.statText}>{topic.nPosts}</Text>
                    <MaterialIcons name="people" size={12} color="#9CA3AF" style={{ marginLeft: 6 }} />
                    <Text style={styles.statText}>{topic.nPerspectives}</Text>
                </View>
            </View>
            <Text style={styles.topicHeadline}>{topic.headline}</Text>
            <Text style={styles.topicSummary}>{topic.shortSummary}</Text>
            <View style={styles.keywordsRow}>
                {topic.keywords.slice(0, 4).map(kw => (
                    <View key={kw} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>#{kw}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

function EmptyState({ onClose }: { onClose: () => void }) {
    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <MaterialIcons name="calendar-today" size={24} color="#fff" />
            </View>
            <Text style={styles.emptyText}>
                You can't archive the present! Head to your feed to read today's digest.
            </Text>
            <Pressable style={styles.ctaButton} onPress={onClose}>
                <Text style={styles.ctaText}>Go to today's feed →</Text>
            </Pressable>
        </View>
    )
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { // ← force en-US, not device locale
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const styles = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 20, paddingBottom: 40, height: SCREEN_HEIGHT * 0.75, 
    },
    handle: {
        width: 36, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2,
        alignSelf: 'center', marginTop: 12, marginBottom: 16,
    },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    sheetHeaderIcon: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: '#EDEDFC', justifyContent: 'center', alignItems: 'center',
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    sheetSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 1 },
    monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthText: { fontSize: 17, fontWeight: '600', color: '#111' },
    navButton: {
        width: 34, height: 34, borderRadius: 8,
        borderWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
    },
    dayHeaderRow: { flexDirection: 'row', marginBottom: 4 },
    dayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, fontWeight: '500', color: '#9CA3AF', paddingBottom: 6 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
    dayNumWrap: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    selectedCircle: { backgroundColor: themeColors.primary },
    todayCircle: { borderWidth: 1.5, borderColor: themeColors.primary },
    dayText: { fontSize: 14, fontWeight: '500', color: '#222' },
    selectedDayText: { color: '#fff', fontWeight: '600' },
    todayText: { color: themeColors.primary, fontWeight: '600' },
    dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: themeColors.primary, marginTop: 2 },
    dotHidden: { backgroundColor: 'transparent' },
    divider: { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginVertical: 16 },

    // Digest detail
    digestContainer: {
        backgroundColor: '#EDEAFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#5147C420',
    },
    digestHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    digestWeekday: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    digestDate: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '400',
    },
    digestSummary: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 23,
        marginBottom: 14,
    },
    topicPillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    topicPill: {
        backgroundColor: '#ffffff',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBlockColor: '#E5E7EB',
    },
    topicPillText: {
        fontSize: 13,
        color: themeColors.primary,
        fontWeight: '500',
    },

    // Topic card
    topicCard: {
        backgroundColor: '#F9FAFB', borderRadius: 12,
        padding: 12, marginBottom: 10,
        borderWidth: 1, borderColor: '#F0F0F0',
    },
    topicCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    categoryText: { fontSize: 11, fontWeight: '600' },
    topicStats: { flexDirection: 'row', alignItems: 'center' },
    statText: { fontSize: 11, color: '#9CA3AF', marginLeft: 3 },
    topicHeadline: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4, lineHeight: 20 },
    topicSummary: { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 8 },
    keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    keywordChip: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    keywordText: { fontSize: 11, color: themeColors.primary, fontWeight: '500' },

    // Empty state
    emptyState: { backgroundColor: '#F0F0FA', borderRadius: 16, padding: 20, alignItems: 'center' },
    emptyIcon: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: themeColors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    emptyText: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 22, marginBottom: 14 },
    ctaButton: {
        backgroundColor: themeColors.primary, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20, width: '100%', alignItems: 'center',
    },
    ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    dimmedDayText: {
    color: '#D1D5DB', 
    },
})