import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
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
}

const { width } = Dimensions.get("window");
const slideWidth = width * 0.8; // Her slide ekranın %80'i
const spacing = 16; // Resimler arası boşluk

const ImageSliderComponent: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = true,
  dotpagination,
  numberpagination,
  haveArrows,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * (slideWidth + spacing),
          animated: true,
        });
        return nextIndex;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [autoPlay, images.length]);

  // Scroll bittiğinde index güncelle
  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (slideWidth + spacing));
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
        {images.map((img) => (
          <View
            key={img.id}
            style={{ width: slideWidth, marginRight: spacing }}
          >
            <Image source={{ uri: img.images }} style={styles.image} />
          </View>
        ))}
      </ScrollView>
      {haveArrows && (
        <View style={styles.arrowsButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              const nextIndex = (currentIndex - 1) % images.length;
              setCurrentIndex(nextIndex);
              scrollRef.current?.scrollTo({
                x: nextIndex * (slideWidth + spacing),
                animated: true,
              });
            }}
          >
            <Text style={styles.arrow}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const nextIndex = (currentIndex + 1) % images.length;
              setCurrentIndex(nextIndex);
              scrollRef.current?.scrollTo({
                x: nextIndex * (slideWidth + spacing),
                animated: true,
              });
            }}
          >
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
    height: 250,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    resizeMode: "cover",
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
    backgroundColor: "rgba(128,128,128,0.4)", // pasif sayı rengi
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeNumber: {
    backgroundColor: "#fff", // aktif sayı rengi
    borderWidth: 2,
    borderColor: "rgba(128,128,128,0.4)",
  },
  numberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  activeNumberText: {
    color: "rgba(128,128,128,0.4)", // aktif sayı metni rengi
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
});
