import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";

export default function ListSearchBar({
  value,
  onChangeText,
  placeholder = "Search here",
  rounded = false,
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.box, rounded && styles.boxRounded]}>
        <Ionicons name="search-outline" size={22} color={colors.searchIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          returnKeyType="search"
        />
        {value ? (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onChangeText("")}>
            <Ionicons name="close-circle" size={22} color={colors.clearIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm,
    backgroundColor: colors.pageBackground,
  },
  box: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm + 4,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  boxRounded: {
    borderRadius: 24,
    minHeight: 44,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...textPresets.body,
    color: colors.text,
    paddingVertical: 0,
  },
});
