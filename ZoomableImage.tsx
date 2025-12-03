import React from "react";
import { Image, View, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const MIN_SCALE = 1; // never smaller than default
  const MAX_SCALE = 3; // optional max zoom

  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    let newScale = e.scale;
    // Clamp the scale between MIN_SCALE and MAX_SCALE
    if (newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale > MAX_SCALE) newScale = MAX_SCALE;

    scale.value = newScale;

    if (onZoomChange) {
      runOnJS(onZoomChange)(scale.value > 1);
    }
  });

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        aspectRatio,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GestureDetector gesture={pinchGesture}>
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
