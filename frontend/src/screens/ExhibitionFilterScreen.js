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

import { Button } from "../components";
import { colors } from "../constants/colors";
import { layout } from "../constants/layout";

const sortOptions = [
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
];

const halls = ["Choose Hall", "1", "2", "3", "4", "5", "6"];

const businessAreas = [
  "AI",
  "Automotive",
  "Cloud",
  "Connectivity",
  "EV Infrastructure",
  "Finance",
  "Fleet Solutions",
  "Infrastructure",
  "Mobility Platform",
  "Parking",
  "Technology",
  "Ticketing",
];

export default function ExhibitionFilterScreen({ initialFilters = {}, onBack, onApply }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 32, 760), [width]);
  const [hallOpen, setHallOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(initialFilters.sortBy || "name-asc");
  const [selectedHall, setSelectedHall] = useState(initialFilters.hall || halls[0]);
  const [selectedBusinessAreas, setSelectedBusinessAreas] = useState(
    Array.isArray(initialFilters.businessAreas) ? initialFilters.businessAreas : []
  );
  const [bookmarkOnly, setBookmarkOnly] = useState(!!initialFilters.bookmarkOnly);

  const clearFilters = () => {
    setSelectedSort("name-asc");
    setSelectedHall(halls[0]);
    setSelectedBusinessAreas([]);
    setBookmarkOnly(false);
  };

  const applyFilters = () => {
    onApply?.({
      sortBy: selectedSort,
      hall: selectedHall,
      businessAreas: selectedBusinessAreas,
      bookmarkOnly,
    });
  };

  const toggleBusinessArea = (area) => {
    setSelectedBusinessAreas((currentAreas) =>
      currentAreas.includes(area)
        ? currentAreas.filter((item) => item !== area)
        : [...currentAreas, area]
    );
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

          <SectionLabel title="Sort by Name" />
          <View style={styles.sortGrid}>
            {sortOptions.map((option) => {
              const active = selectedSort === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.84}
                  onPress={() => setSelectedSort(option.value)}
                  style={[styles.sortCard, active && styles.sortCardActive]}
                >
                  <Text style={[styles.sortText, active && styles.sortTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionLabel title="Hall (Booth)" />
          <DropdownField
            value={selectedHall}
            open={hallOpen}
            options={halls}
            onToggle={() => setHallOpen(!hallOpen)}
            onSelect={(value) => {
              setSelectedHall(value);
              setHallOpen(false);
            }}
          />

          <SectionLabel title="Area of Business" />
          <CheckboxDropdown
            open={businessOpen}
            selectedItems={selectedBusinessAreas}
            options={businessAreas}
            onToggle={() => setBusinessOpen(!businessOpen)}
            onSelect={toggleBusinessArea}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setBookmarkOnly(!bookmarkOnly)}
            style={styles.bookmarkCard}
          >
            <View style={styles.bookmarkTextBlock}>
              <Text style={styles.bookmarkTitle}>Show bookmark only</Text>
              <Text style={styles.bookmarkText}>Show only exhibitors you've saved</Text>
            </View>
            <View style={[styles.toggle, bookmarkOnly && styles.toggleActive]}>
              <View style={[styles.toggleKnob, bookmarkOnly && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>

          <Button title="Apply Filters" onPress={applyFilters} />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ title }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function DropdownField({ value, open, options, onToggle, onSelect }) {
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

      {open ? (
        <View style={styles.dropdownList}>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => onSelect(item)}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>{item}</Text>
              {item === value ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CheckboxDropdown({ open, selectedItems, options, onToggle, onSelect }) {
  const label = selectedItems.length > 0 ? `${selectedItems.length} selected` : "Choose Area";

  return (
    <View style={styles.dropdownWrap}>
      <TouchableOpacity activeOpacity={0.84} onPress={onToggle} style={styles.dropdownButton}>
        <Text style={styles.dropdownText}>{label}</Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={32}
          color="#342B2B"
        />
      </TouchableOpacity>

      {open ? (
        <View style={styles.dropdownList}>
          {options.map((item) => {
            const checked = selectedItems.includes(item);

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => onSelect(item)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
                <Ionicons
                  name={checked ? "checkbox" : "square-outline"}
                  size={22}
                  color={checked ? colors.success : "#8E8584"}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
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
  sortGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 56,
  },
  sortCard: {
    flex: 1,
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7E1DF",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sortCardActive: {
    borderColor: "#57BE7A",
    backgroundColor: "#F2FAF4",
  },
  sortText: {
    color: "#342B2B",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  sortTextActive: {
    color: colors.success,
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
