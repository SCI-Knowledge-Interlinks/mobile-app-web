import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import { useAppContentWidth } from "../hooks/useAppContentWidth";

export default function InfoCarousel({
  slides,
  height = 220,
  variant = "card",
  fullWidth = false,
  width: widthProp,
  imageResizeMode,
  autoScroll = false,
  autoScrollMs = 4000,
  slideContentAlign = "center",
  style,
}) {
  // Use app shell width (not full browser width) so web carousel stays centered.
  const appContentWidth = useAppContentWidth(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const carouselWidth =
    widthProp ??
    (layoutWidth > 0
      ? layoutWidth
      : fullWidth
        ? appContentWidth
        : Math.min(Math.max(appContentWidth - 32, 0), 760));
  const slideResizeMode = imageResizeMode ?? (variant === "banner" ? "cover" : "contain");
  const scrollRef = useRef(null);
  const activeIndexRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isBanner = variant === "banner";
  const bannerSlideJustify =
    slideContentAlign === "bottom" ? "flex-end" : "center";
  const cardSlideHeight = height + 16;
  const cardWrapperHeight = cardSlideHeight + 24;

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [slides.length, carouselWidth]);

  useEffect(() => {
    if (!autoScroll || slides.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (isUserScrollingRef.current) {
        return;
      }

      const nextIndex = (activeIndexRef.current + 1) % slides.length;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * carouselWidth,
        animated: true,
      });
    }, autoScrollMs);

    return () => clearInterval(interval);
  }, [autoScroll, autoScrollMs, carouselWidth, slides.length]);

  const handleScrollEnd = (event) => {
    isUserScrollingRef.current = false;
    const index = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  return (
    <View
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== layoutWidth) {
          setLayoutWidth(nextWidth);
        }
      }}
      style={[
        styles.wrapper,
        fullWidth && styles.wrapperFullWidth,
        isBanner ? styles.bannerWrapper : styles.cardWrapper,
        {
          width: widthProp ? carouselWidth : fullWidth || isBanner ? "100%" : carouselWidth,
          maxWidth: "100%",
          alignSelf: "center",
          height: isBanner ? height : cardWrapperHeight,
        },
        style,
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollBeginDrag={() => {
          isUserScrollingRef.current = true;
        }}
        scrollEventThrottle={16}
        style={isBanner ? styles.bannerScroll : { height: cardSlideHeight }}
      >
        {slides.map((slide) => (
          <View
            key={slide.key}
            style={[
              isBanner ? styles.bannerSlide : styles.slide,
              isBanner && { justifyContent: bannerSlideJustify },
              {
                width: carouselWidth,
                height: isBanner ? height : cardSlideHeight,
              },
            ]}
          >
            <Image
              source={slide.image}
              style={isBanner ? styles.bannerImage : styles.slideImage}
              resizeMode={slideResizeMode}
            />
          </View>
        ))}
      </ScrollView>
      <View style={[styles.dotsRow, isBanner && styles.bannerDotsRow]}>
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            style={[
              styles.dot,
              isBanner && styles.bannerDot,
              index === activeIndex
                ? isBanner
                  ? styles.bannerDotActive
                  : styles.dotActive
                : isBanner
                  ? styles.bannerDotInactive
                  : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    overflow: "hidden",
  },
  wrapperFullWidth: {
    alignSelf: "stretch",
  },
  cardWrapper: {
    backgroundColor: colors.brandBlue,
    borderRadius: 16,
    paddingBottom: 14,
  },
  bannerWrapper: {
    backgroundColor: colors.brandBlue,
  },
  bannerScroll: {
    flex: 1,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerSlide: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  bannerDotsRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    marginTop: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.white,
    opacity: 1,
  },
  dotInactive: {
    backgroundColor: colors.white,
    opacity: 0.35,
  },
  bannerDotActive: {
    backgroundColor: colors.white,
    opacity: 1,
  },
  bannerDotInactive: {
    backgroundColor: colors.white,
    opacity: 0.45,
  },
});
