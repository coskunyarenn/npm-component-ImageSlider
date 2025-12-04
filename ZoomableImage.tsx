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
  aspectRatio: number; // Gorselin genislik / yukseklik orani
  onZoomChange?: (zoomed: boolean) => void; // Zoom durumunu disari bildirmek icin
}

// Ekran genisligi ve yuksekligi
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  aspectRatio,
  onZoomChange,
}) => {
  //  Zoom degeri (1 = normal)
  const scale = useSharedValue(1);

  //  Goruntunun yatay-dikey kayma degeri
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // min ve maks zoom seviyeleri
  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  // gorselin ekrana otururken kaplayacagi genislik ve yukseklik
  const imageWidth = SCREEN_WIDTH;
  const imageHeight = imageWidth / aspectRatio;

  // Kayma limit-goruntu disari tasmasin diye pozisyonu sinirla
  const getBound = (value: number, max: number) => {
    "worklet";
    return Math.max(Math.min(value, max), -max);
  };

  // ekranda uygulanacak animasyonlu transform
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value }, // yatay kaydirma
        { translateY: translateY.value }, // dikey kaydirma
        { scale: scale.value }, // zoom seviyesi
      ],
    };
  });

  //  PINCH GESTURE — iki parmakla zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      let newScale = e.scale;

      // Zoom degerini sinirla
      if (newScale < MIN_SCALE) newScale = MIN_SCALE;
      if (newScale > MAX_SCALE) newScale = MAX_SCALE;

      scale.value = newScale;

      // Zoom sirasinda resmin tasabilecegi maks mesafe
      const maxX = (imageWidth * scale.value - SCREEN_WIDTH) / 2;
      const maxY = (imageHeight * scale.value - imageHeight) / 2;

      // Yeni pozisyonu sinirla
      translateX.value = getBound(translateX.value, maxX);
      translateY.value = getBound(translateY.value, maxY);

      // disariya zoom durumunu gonder
      if (onZoomChange) runOnJS(onZoomChange)(scale.value > 1);
    })
    .onEnd(() => {
      // eger zoom tamamen bitti (scale = 1), resmi ortala
      if (scale.value === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  // DOUBLE TAP ZOOM (cift dokun)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      // eger zoom varsa, geri kucult — yoksa büyüt
      const targetScale = scale.value > 1 ? 1 : 2.5;

      // Animasyonlu zoom
      scale.value = withTiming(targetScale, { duration: 250 });

      // eger kucultuluyorsa, konumu sifirla
      if (targetScale === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }

      if (onZoomChange) runOnJS(onZoomChange)(targetScale > 1);
    });

  // DRAG / PAN — gorseli parmakla tasima
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(scale.value > 1)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;

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

  //  tum gesture'lari birlikte calistir
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    doubleTapGesture,
    panGesture
  );

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        aspectRatio, // render alani aspectRatio ile hesaplanir
        // overflow: "hidden", // resim disari tasmasin
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <Image
            source={{ uri }}
            style={{
              width: "100%", // goruntu genisligi
              aspectRatio, // yuksekligi  oranla belirleniyor
            }}
            resizeMode="contain" // gorsel orantili sekilde ekrana sigar
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default ZoomableImage;
