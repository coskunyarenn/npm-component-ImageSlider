import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

interface ImageItem {
  id: number;
  images: string;
}

interface ImageSliderProps {
  images: ImageItem[];
  autoPlay?: boolean;
  dotpagination?: boolean;
  numberpagination?: boolean;
  haveArrows?: boolean;
  showIndexCounter?: boolean;
}

const { width } = Dimensions.get("window");
const slideWidth = width * 1;
const spacing = 16;

const ImageSliderComponent: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = true,
  dotpagination,
  numberpagination,
  haveArrows,
  showIndexCounter = false,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loopImages = [images[images.length - 1], ...images, images[0]];

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: slideWidth + spacing, animated: false });
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      scrollToIndex(currentIndex + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, currentIndex]);

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({
      x: (index + 1) * (slideWidth + spacing),
      animated: true,
    });
    setCurrentIndex((index + images.length) % images.length);
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    let index = Math.round(offsetX / (slideWidth + spacing)) - 1;

    if (index < 0) {
      scrollRef.current?.scrollTo({
        x: images.length * (slideWidth + spacing),
        animated: false,
      });
      index = images.length - 1;
    } else if (index >= images.length) {
      scrollRef.current?.scrollTo({ x: slideWidth + spacing, animated: false });
      index = 0;
    }

    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth + spacing}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingHorizontal: (width - slideWidth) / 2 }}
      >
        {loopImages.map((img, idx) => (
          <View key={idx} style={{ width: slideWidth, marginRight: spacing }}>
            <Image source={{ uri: img.images }} style={styles.image} />
            {/* <Image source={require(img.images)} style={styles.image} /> */}

            {/* <Image
              source={require('../assets/430x224.png')}
              style={styles.image}
            /> */}
          </View>
        ))}
      </ScrollView>
      {showIndexCounter && (
        <View style={styles.indexCounterContainer}>
          <Text style={styles.indexCounterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {haveArrows && (
        <View style={styles.arrowsButtonContainer}>
          <TouchableOpacity onPress={() => scrollToIndex(currentIndex - 1)}>
            <Text style={styles.arrow}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToIndex(currentIndex + 1)}>
            <Text style={styles.arrow}>{">"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {dotpagination && (
        <View style={styles.dotsContainer}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      )}

      {numberpagination && (
        <View style={styles.numbersContainer}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.number,
                currentIndex === idx ? styles.activeNumber : null,
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  currentIndex === idx ? styles.activeNumberText : null,
                ]}
              >
                {idx + 1}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ImageSliderComponent;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 430 / 224,
  },
  dotsContainer: {
    position: "absolute",
    bottom: -10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#888",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#cececeff",
  },
  numbersContainer: {
    position: "absolute",
    bottom: -50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(128,128,128,0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeNumber: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "rgba(128,128,128,0.4)",
  },
  numberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  activeNumberText: {
    color: "rgba(128,128,128,0.4)",
  },
  arrowsButtonContainer: {
    position: "absolute",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "90%",
    height: "100%",
    marginHorizontal: 20,
  },
  arrow: {
    fontSize: 22,
    borderWidth: 2,
    height: 35,
    width: 35,
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "#ccc",
    color: "#fff",
    borderColor: "#fff",
    borderRadius: 20,
    top: "50%",
  },
  indexCounterContainer: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indexCounterText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
