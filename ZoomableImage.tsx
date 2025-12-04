import React from "react";
import { Image, View, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
} from "react-native-reanimated";

interface ZoomableImageProps {
  uri: string;
  aspectRatio: number;
  onZoomChange?: (zoomed: boolean) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  aspectRatio,
  onZoomChange,
}) => {
  const scale = useSharedValue(1);

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 🔍 Pinch Zoom
  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    let newScale = e.scale;

    if (newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale > MAX_SCALE) newScale = MAX_SCALE;

    scale.value = newScale;

    if (onZoomChange) runOnJS(onZoomChange)(scale.value > 1);
  });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      const targetScale = scale.value > 1 ? 1 : 2.5;

      scale.value = withTiming(targetScale, { duration: 250 });

      if (onZoomChange) {
        runOnJS(onZoomChange)(targetScale > 1);
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        aspectRatio,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <Image
            source={{ uri }}
            style={{ width: "100%", aspectRatio }}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default ZoomableImage;
