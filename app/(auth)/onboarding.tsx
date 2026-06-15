import { AppTheme } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    icon: "💬",
    title: "Connect Instantly",
    description: "Chat with your team in real-time conversations on Nexus",
    color: ["#6366F1", "#8B5CF6"],
  },
  {
    id: 2,
    icon: "👥",
    title: "Collaborate Seamlessly",
    description: "Create groups, share ideas, and work together effortlessly",
    color: ["#8B5CF6", "#A78BFA"],
  },
  {
    id: 3,
    icon: "✅",
    title: "Get Things Done",
    description: "Track tasks, set reminders, and achieve your goals with Nexus",
    color: ["#A78BFA", "#D8B4FE"],
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      setCurrentIndex(Math.round(offsetX / width));
    },
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    navigation.navigate("login");
  };

  const handleGetStarted = () => {
    navigation.navigate("signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <LinearGradient
            key={slide.id}
            colors={slide.color}
            style={styles.slide}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.slideContent}>
              <Animated.View
                style={[styles.iconContainer, { transform: [{ scale: 1 }] }]}
              >
                <Text style={styles.icon}>{slide.icon}</Text>
              </Animated.View>

              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? AppTheme.colors.primary
                      : AppTheme.colors.border,
                  width: index === currentIndex ? 32 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={
            currentIndex === slides.length - 1 ? handleGetStarted : handleNext
          }
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  skipText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.lg,
  },
  slideContent: {
    alignItems: "center",
    marginBottom: AppTheme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: AppTheme.spacing.lg,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    ...AppTheme.typography.hero,
    color: AppTheme.colors.textInverse,
    marginBottom: AppTheme.spacing.md,
    textAlign: "center",
  },
  description: {
    ...AppTheme.typography.subtitle,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    maxWidth: width - AppTheme.spacing.lg * 2,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    gap: AppTheme.spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    ...AppTheme.shadow.button,
  },
  buttonText: {
    color: AppTheme.colors.textInverse,
    fontSize: 16,
    fontWeight: "700",
  },
});
