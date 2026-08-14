import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import useReducedMotion from "../hooks/useReducedMotion";
import MOTION from "../constants/motion";

export default function AnimatedStateView({ children, delay = 0, style }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? 1
      : withDelay(
          delay,
          withTiming(1, {
            duration: MOTION.duration.standard,
            easing: Easing.out(Easing.cubic),
          })
        );
  }, [delay, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: reduceMotion ? 0 : (1 - progress.value) * MOTION.distance.standard },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
