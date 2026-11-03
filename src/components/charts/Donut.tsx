import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { theme } from '@/constants/theme';

export interface DonutSlice {
  value: number;
  color: string;
}

interface DonutProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  /** Optional centre content. */
  children?: React.ReactNode;
}

/**
 * Lightweight SVG donut chart (works on web + native via react-native-svg).
 * Slices are drawn as stroked arcs using the dash-offset technique.
 */
export function Donut({ slices, size = 180, thickness = 22, children }: DonutProps) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);

  let offset = 0;
  const arcs =
    total > 0
      ? slices
          .filter((s) => s.value > 0)
          .map((s, i) => {
            const fraction = s.value / total;
            const length = fraction * circumference;
            const arc = (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                fill="transparent"
              />
            );
            offset += length;
            return arc;
          })
      : null;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={theme.colors.surfaceSunken}
          strokeWidth={thickness}
          fill="transparent"
        />
        {/* Rotate so slices start at 12 o'clock */}
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {arcs}
        </G>
      </Svg>
      {children}
    </View>
  );
}
