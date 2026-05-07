import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type ScrolisSplashProps = {
  onAnimDone?: () => void;
};

type ArcConfig = {
  r: number;
  strokeWidth: number;
  startAngle: number;
  totalSweep: number;
};

const cx = 65;
const cy = 65;

const ARC_CONFIG: ArcConfig[] = [
  { r: 52, strokeWidth: 13, startAngle: -20, totalSweep: 335 },
  { r: 32, strokeWidth: 13, startAngle: -20, totalSweep: 335 },
];

function polarToXY(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepAngle: number
): string {
  const s = Math.min(Math.max(sweepAngle, 0.5), 359.5);
  const [x1, y1] = polarToXY(cx, cy, r, startAngle);
  const [x2, y2] = polarToXY(cx, cy, r, startAngle + s);
  const large = s > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function ScrolisSplash({ onAnimDone }: ScrolisSplashProps) {
  const arcAnims = useRef<Animated.Value[]>(
    ARC_CONFIG.map(() => new Animated.Value(0))
  ).current;

  const labelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(
      200,
      arcAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    ).start(() => {
      setTimeout(() => {
        Animated.timing(labelAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(() => onAnimDone?.());
      }, 300);
    });
  }, [arcAnims, labelAnim, onAnimDone]);

  return (
    <View style={styles.container}>
      <Svg width={130} height={130} viewBox="0 0 130 130">
        {ARC_CONFIG.map((arc, i) => {
          const d = arcAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [
              arcPath(cx, cy, arc.r, arc.startAngle, 0.5),
              arcPath(cx, cy, arc.r, arc.startAngle, arc.totalSweep),
            ],
          });

          return (
            <AnimatedPath
              fill="none"
              stroke="#5147C4"
              strokeWidth={arc.strokeWidth}
              strokeLinecap="round"
              key={`arc-${arc.r}`}
              d={arcPath(cx, cy, arc.r, arc.startAngle, arc.totalSweep)}
              strokeDasharray={400}
              strokeDashoffset={arcAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [400, 0],
              })}
            />
          );
        })}
      </Svg>

      <Animated.Text style={[styles.label, { opacity: labelAnim }]}>
        Scrolis
      </Animated.Text>
    </View>
  );
}

const { height } = Dimensions.get('window');

export function useSplashTransition(onDone?: () => void) {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const trigger = () => {
    Animated.timing(scrollAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onDone?.());
  };

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height],
  });

  return { translateY, trigger };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EE',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  label: {
    color: '#5147C4',
    fontSize: 22,
    fontWeight: '700',
  },
});