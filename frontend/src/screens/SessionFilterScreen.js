import React, { useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button} from "../components";
import { colors } from "../constants/colors";
import { layout } from "../constants/layout";
import { spacing } from "../constants/spacing";

const categories = ["Choose Category", 
  "AI Track", 
  "Innovation Track", 
  "Sustainability Track", 
  "Urban Design Track",
  "Mobility Track",
  "Design Track"
];
const venues = [
  "Choose Venue",
  "Grand Auditorium",
  "Green Hall",
  "Creative Lab",
  "Mobility Lab",
];

const timeSlots = [
  {
    key: "morning",
    title: "Morning",
    time: "6:00 AM - 12:00 PM",
    bg: colors.successLight,
  },
  {
    key: "afternoon",
    title: "Afternoon",
    time: "12:00 PM - 5:00 PM",
    bg: "#FFF3E8",
  },
  {
    key: "evening",
    title: "Evening",
    time: "5:00 PM - 12:00 AM",
    bg: "#F4EDFF",
  },
];

export default function SessionFilterScreen({ initialFilters = {}, onBack, onApply }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 32, 760), [width]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters.category || categories[0]
  );
  const [selectedVenue, setSelectedVenue] = useState(initialFilters.venue || venues[0]);
  const [selectedTime, setSelectedTime] = useState(initialFilters.timeSlot || "");
  const [bookmarkOnly, setBookmarkOnly] = useState(!!initialFilters.bookmarkOnly);

  const clearFilters = () => {
    setSelectedCategory(categories[0]);
    setSelectedVenue(venues[0]);
    setSelectedTime("");
    setBookmarkOnly(false);
  };

  const applyFilters = () => {
    onApply?.({
      category: selectedCategory,
      venue: selectedVenue,
      timeSlot: selectedTime,
      bookmarkOnly,
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 },
        ]}
      >
        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <View style={styles.topBar}>
            <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.closeButton}>
              <Ionicons name="close" size={34} color="#342B2B" />
            </TouchableOpacity>

            <Text style={styles.title}>Filter</Text>

            <TouchableOpacity activeOpacity={0.8} onPress={clearFilters} style={styles.clearButton}>
              <Ionicons name="refresh" size={23} color={colors.success} />
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <SectionLabel title="Category" />
          <DropdownField
            icon="grid-view"
            value={selectedCategory}
            open={categoryOpen}
            options={categories}
            onToggle={() => setCategoryOpen(!categoryOpen)}
            onSelect={(value) => {
              setSelectedCategory(value);
              setCategoryOpen(false);
            }}
          />

          <SectionLabel title="Time Slot" />
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TimeSlotCard
                key={slot.key}
                slot={slot}
                active={selectedTime === slot.key}
                onPress={() => setSelectedTime(slot.key)}
              />
            ))}
          </View>

          <SectionLabel title="Venue" />
          <DropdownField
            icon="location-on"
            value={selectedVenue}
            open={venueOpen}
            options={venues}
            onToggle={() => setVenueOpen(!venueOpen)}
            onSelect={(value) => {
              setSelectedVenue(value);
              setVenueOpen(false);
            }}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setBookmarkOnly(!bookmarkOnly)}
            style={styles.bookmarkCard}
          >
            {/* <View style={styles.bookmarkIconBox}>
              <Ionicons name="bookmark-outline" size={32} color={colors.success} />
            </View> */}
            <View style={styles.bookmarkTextBlock}>
              <Text style={styles.bookmarkTitle}>Show bookmark only</Text>
              <Text style={styles.bookmarkText}>Show only events you've saved</Text>
            </View>
            <View style={[styles.toggle, bookmarkOnly && styles.toggleActive]}>
              <View style={[styles.toggleKnob, bookmarkOnly && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>

         

           <Button
                                title="Apply Filters"
                                onPress={applyFilters}
                              />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ title }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function DropdownField({ icon, value, open, options, onToggle, onSelect }) {
  return (
    <View style={styles.dropdownWrap}>
      <TouchableOpacity activeOpacity={0.84} onPress={onToggle} style={styles.dropdownButton}>
       
        <Text style={styles.dropdownText}>{value}</Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={32}
          color="#342B2B"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => onSelect(item)}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>{item}</Text>
              {item === value && (
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function TimeSlotCard({ slot, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.timeCard, active && styles.timeCardActive]}
    >
      <Text style={styles.timeTitle}>{slot.title}</Text>
      <Text style={styles.timeText}>{slot.time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  topBar: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: layout.topBarHorizontalMargin,
    marginBottom: 26,
  },
  closeButton: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7E1DF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: "#302728",
    fontSize: 23,
    lineHeight: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  clearButton: {
    width: 126,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 7,
  },
  clearText: {
    color: colors.success,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  sectionLabel: {
    color: "#342B2B",
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "900",
    marginBottom: 20,
  },
  dropdownWrap: {
    marginBottom: 56,
  },
  dropdownButton: {
    minHeight: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E1DF",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  dropdownIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  dropdownText: {
    flex: 1,
    minWidth: 0,
    color: "#302728",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  dropdownList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#E7E1DF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  dropdownItem: {
    minHeight: 50,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  dropdownItemText: {
    color: "#342B2B",
    fontSize: 16,
    fontWeight: "700",
  },
  timeGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 58,
  },
  timeCard: {
    flex: 1,
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7E1DF",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    position: "relative",
  },
  timeCardActive: {
    borderColor: "#57BE7A",
    backgroundColor: "#F2FAF4",
  },
  
  
  timeTitle: {
    color: "#342B2B",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  timeText: {
    color: "#6D6666",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },
  bookmarkCard: {
    minHeight: 94,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E1DF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 70,
  },
  bookmarkIconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  bookmarkTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  bookmarkTitle: {
    color: "#342B2B",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  bookmarkText: {
    color: "#6D6666",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 3,
  },
  toggle: {
    width: 70,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDD8D6",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
 
});
