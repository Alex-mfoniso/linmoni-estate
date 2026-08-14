import AnimatedStateView from "./AnimatedStateView";

export default function RevealView({ children, delay = 0, style }) {
  return (
    <AnimatedStateView delay={delay} style={style}>
      {children}
    </AnimatedStateView>
  );
}
