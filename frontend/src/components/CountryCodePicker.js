import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { countryCodes, defaultCountryCode } from "../constants/countryCodes";
import Card from "./Card";

export default function CountryCodePicker({
  selectedCode = defaultCountryCode.dialCode,
  selectedIso = defaultCountryCode.iso,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCountry =
    countryCodes.find((country) => country.iso === selectedIso) ||
    countryCodes.find((country) => country.dialCode === selectedCode) ||
    defaultCountryCode;

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countryCodes;

    return countryCodes.filter((country) => {
      return (
        country.name.toLowerCase().includes(query) ||
        country.iso.toLowerCase().includes(query) ||
        country.dialCode.includes(query)
      );
    });
  }, [search]);

  const handleSelect = (country) => {
    onSelect?.(country);
    setSearch("");
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen((current) => !current)}
        style={styles.button}
      >
        <Text style={styles.codeText}>{selectedCountry.dialCode}</Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setOpen(false)}
            style={styles.modalBackdrop}
          />

          <Card style={styles.dropdown}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select country code</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country"
              autoCapitalize="none"
              style={styles.searchInput}
            />

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={`${country.iso}-${country.dialCode}`}
                  activeOpacity={0.75}
                  onPress={() => handleSelect(country)}
                  style={styles.item}
                >
                  <Text style={styles.countryName} numberOfLines={1}>
                    {country.name}
                  </Text>
                  <Text style={styles.countryCode}>{country.dialCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 96,
  },
  button: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
  },
  arrow: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dropdown: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "78%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eeeeee",
    backgroundColor: "#ffffff",
    padding: 12,
  },
  modalHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "800",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  closeText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "800",
  },
  searchInput: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
    color: "#111111",
    fontSize: 14,
  },
  list: {
    maxHeight: 340,
    marginTop: 8,
  },
  item: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  countryName: {
    flex: 1,
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  countryCode: {
    color: "#e65539",
    fontSize: 14,
    fontWeight: "800",
  },
});
