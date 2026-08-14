import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import COLORS from "../constants/colors";
import useReducedMotion from "../hooks/useReducedMotion";

export default function SkeletonLoader({ rows = 1, height = 18 }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = reduceMotion
      ? 0
      : withRepeat(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          -1,
          true
        );
  }, [progress, reduceMotion]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.5 : interpolate(progress.value, [0, 1], [0.35, 0.75]),
  }));

  return (
    <View style={styles.wrapper} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: rows }).map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.line, shimmerStyle, { height, width: `${90 - index * 12}%` }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  line: { borderRadius: 8, backgroundColor: COLORS.borderStrong, overflow: "hidden" },
});
