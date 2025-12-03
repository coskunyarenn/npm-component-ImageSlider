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
  Modal,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ZoomableImage from "./ZoomableImage";

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
  aspectRatio?: string;
  isActiveZooming?: boolean;
}

const { width } = Dimensions.get("window");
const mainSlideWidth = width * 1;
const mainSpacing = 16;

const ImageSliderComponent: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = true,
  dotpagination,
  numberpagination,
  haveArrows,
  showIndexCounter = false,
  aspectRatio = "430 / 224",
  isActiveZooming = false,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [initialModalIndex, setInitialModalIndex] = useState(0);
  const modalScrollRef = useRef<ScrollView>(null);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const loopImages =
    images.length > 1
      ? [images[images.length - 1], ...images, images[0]]
      : images;

  const parsedAspectRatio =
    parseInt(aspectRatio.split("/")[0]) / parseInt(aspectRatio.split("/")[1]);

  const openModalAtIndex = (index: number) => {
    setInitialModalIndex(index);
    setModalCurrentIndex(index);
    setZoomModalVisible(true);
  };

  const closeModal = () => {
    setCurrentIndex(modalCurrentIndex);
    if (scrollRef.current && images.length > 1) {
      const targetX = (modalCurrentIndex + 1) * (mainSlideWidth + mainSpacing);
      scrollRef.current.scrollTo({ x: targetX, animated: false });
    }
    setZoomModalVisible(false);
  };

  useEffect(() => {
    if (images.length > 1) {
      scrollRef.current?.scrollTo({
        x: mainSlideWidth + mainSpacing,
        animated: false,
      });
    }
  }, [images]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollToIndex(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, currentIndex, images.length]);

  const scrollToIndex = (index: number) => {
    if (images.length <= 1) return;
    const targetIndex = (index + images.length) % images.length;
    scrollRef.current?.scrollTo({
      x: (targetIndex + 1) * (mainSlideWidth + mainSpacing),
      animated: true,
    });
    setCurrentIndex(targetIndex);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (images.length <= 1) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    let index = Math.round(offsetX / (mainSlideWidth + mainSpacing)) - 1;

    if (index < 0) {
      index = images.length - 1;
      scrollRef.current?.scrollTo({
        x: images.length * (mainSlideWidth + mainSpacing),
        animated: false,
      });
    } else if (index >= images.length) {
      index = 0;
      scrollRef.current?.scrollTo({
        x: mainSlideWidth + mainSpacing,
        animated: false,
      });
    }
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (zoomModalVisible && modalScrollRef.current && images.length > 1) {
      const initialX = (initialModalIndex + 1) * width;
      modalScrollRef.current.scrollTo({ x: initialX, animated: false });
    }
  }, [zoomModalVisible]);

  const onModalMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (images.length <= 1) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    let index = Math.round(offsetX / width) - 1;

    if (index < 0) {
      index = images.length - 1;
      modalScrollRef.current?.scrollTo({
        x: images.length * width,
        animated: false,
      });
    } else if (index >= images.length) {
      index = 0;
      modalScrollRef.current?.scrollTo({ x: width, animated: false });
    }
    setModalCurrentIndex(index);
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={mainSlideWidth + mainSpacing}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{
            paddingHorizontal: (width - mainSlideWidth) / 2,
          }}
        >
          {loopImages.map((img, idx) => {
            const realIndex =
              images.length > 1 ? (idx - 1 + images.length) % images.length : 0;
            return (
              <View
                key={idx}
                style={{ width: mainSlideWidth, marginRight: mainSpacing }}
              >
                {isActiveZooming ? (
                  <TouchableOpacity onPress={() => openModalAtIndex(realIndex)}>
                    <Image
                      source={{ uri: img.images }}
                      style={[styles.image, { aspectRatio: parsedAspectRatio }]}
                    />
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={{ uri: img.images }}
                    style={[styles.image, { aspectRatio: parsedAspectRatio }]}
                  />
                )}
              </View>
            );
          })}
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

      {/* Zoom Modal */}
      <Modal
        visible={zoomModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Kapat</Text>
            </TouchableOpacity>

            <ScrollView
              ref={modalScrollRef}
              horizontal
              nestedScrollEnabled
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onModalMomentumScrollEnd}
              scrollEnabled={!isZoomed}
            >
              {loopImages.map((img, idx) => (
                <View key={idx} style={styles.modalImageContainer}>
                  <ZoomableImage
                    uri={img.images}
                    aspectRatio={parsedAspectRatio}
                    onZoomChange={setIsZoomed}
                  />
                </View>
              ))}
            </ScrollView>

            {showIndexCounter && (
              <View style={styles.modalIndexCounter}>
                <Text style={styles.indexCounterText}>
                  {modalCurrentIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
};

export default ImageSliderComponent;

const styles = StyleSheet.create({
  container: { position: "relative" },
  image: { width: "100%" },
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
  activeDot: { backgroundColor: "#fff" },
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
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.4)",
  },
  numberText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  activeNumberText: { color: "rgba(128,128,128,0.4)" },
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
  indexCounterText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  modalContainer: { flex: 1, backgroundColor: "black" },
  modalCloseButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 10,
  },
  modalCloseButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  modalImageContainer: {
    width: width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalIndexCounter: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
