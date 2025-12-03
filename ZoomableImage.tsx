import React from "react";
import { Image } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ZoomableImageProps {
  uri: string;
  aspectRatio: number;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ uri, aspectRatio }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 250 });
    });

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={animatedStyle}>
        <Image
          source={{ uri }}
          style={{ width: "100%", aspectRatio }}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default ZoomableImage;
