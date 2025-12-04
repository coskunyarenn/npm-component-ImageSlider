import React, { useState } from "react";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  aspectRatio,
  onZoomChange,
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  const imageWidth = SCREEN_WIDTH;
  const imageHeight = imageWidth / aspectRatio;

  const getBound = (value: number, max: number) => {
    "worklet";
    return Math.max(Math.min(value, max), -max);
  };

  const [isZoomed, setIsZoomed] = useState(false);

  const setZoomState = (z: boolean) => {
    setIsZoomed(z);
    onZoomChange?.(z);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      let newScale = e.scale;
      if (newScale < MIN_SCALE) newScale = MIN_SCALE;
      if (newScale > MAX_SCALE) newScale = MAX_SCALE;

      scale.value = newScale;

      const maxX = (imageWidth * scale.value - SCREEN_WIDTH) / 2;
      const maxY = (imageHeight * scale.value - imageHeight) / 2;

      translateX.value = getBound(translateX.value, maxX);
      translateY.value = getBound(translateY.value, maxY);

      runOnJS(setZoomState)(scale.value > 1);
    })
    .onEnd(() => {
      if (scale.value === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      const targetScale = scale.value > 1 ? 1 : 2.5;

      scale.value = withTiming(targetScale, { duration: 250 });

      if (targetScale === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }

      runOnJS(setZoomState)(targetScale > 1);
    });

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isZoomed)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (!isZoomed) return;

      const maxX = (imageWidth * scale.value - SCREEN_WIDTH) / 2;
      const maxY = (imageHeight * scale.value - imageHeight) / 2;

      translateX.value = getBound(startX.value + e.translationX, maxX);
      translateY.value = getBound(startY.value + e.translationY, maxY);
    })
    .onEnd(() => {
      const maxX = (imageWidth * scale.value - SCREEN_WIDTH) / 2;
      const maxY = (imageHeight * scale.value - imageHeight) / 2;

      translateX.value = getBound(translateX.value, maxX);
      translateY.value = getBound(translateY.value, maxY);
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    doubleTapGesture,
    panGesture
  );

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
            style={{
              width: "100%",
              aspectRatio,
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default ZoomableImage;
