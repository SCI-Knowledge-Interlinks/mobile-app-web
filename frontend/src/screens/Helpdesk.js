import React, { useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Header } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

const tabs = ["FAQs", "Contact Us", "Support Chat"];

const faqs = [
  {
    question: "How do I update my profile?",
    answer: "Go to the Profile tab and tap Edit Profile to update your bio, contact details and profile picture.",
  },
  {
    question: "What is My Calendar?",
    answer: "My Calendar shows sessions and meetings you have saved for quick access during the event.",
  },
  {
    question: "How does networking or matchmaking work?",
    answer: "Use Networking to discover attendees and connect with people relevant to your interests.",
  },
  {
    question: "How do I book or manage meetings?",
    answer: "Open a profile and use the schedule option to request or manage a one-to-one meeting.",
  },
  {
    question: "Where can I find exhibitor details and booth locations?",
    answer: "Open Exhibition to view exhibitors, booth numbers, halls and saved bookmarks.",
  },
  {
    question: "Can I search for speakers or sessions?",
    answer: "Yes. Use the search bar on Speakers, Sessions, Exhibition and Helpdesk pages.",
  },
  {
    question: "Who can I contact for technical issues?",
    answer: "Contact the technical desk from the Contact Us tab or send a support chat message.",
  },
];

const contacts = [
  { category: "Housekeeping", name: "Deepak Shah", phone: "+91-9100000000", initials: "DS" },
  { category: "Security", name: "Ankur Sharma", phone: "+91-9200000000", initials: "AS" },
  { category: "Fire & Ambulance", name: "Deepak Shah", phone: "+91-9300000000", initials: "DS" },
  { category: "Technical Support", name: "Priya Mehta", phone: "+91-9400000000", initials: "PM" },
];

export default function Helpdesk({ onBack }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const [activeTab, setActiveTab] = useState("FAQs");
  const [searchText, setSearchText] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [messageText, setMessageText] = useState("");

  const visibleFaqs = faqs.filter((item) =>
    [item.question, item.answer].join(" ").toLowerCase().includes(searchText.trim().toLowerCase())
  );
  const visibleContacts = contacts.filter((item) =>
    [item.category, item.name, item.phone].join(" ").toLowerCase().includes(searchText.trim().toLowerCase())
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: activeTab === "Support Chat" ? insets.bottom + 130 : insets.bottom + spacing.xl },
        ]}
      >
        <Header title="Helpdesk" onBack={onBack} contentWidth={contentWidth}>
          <View style={styles.headerControls}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={27} color="#363236" />
              <TextInput
                placeholder="Search for help..."
                placeholderTextColor="#918889"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />
              {searchText ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={25} color="#B6B7BE" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.helpTabs}>
              {tabs.map((tab) => {
                const active = activeTab === tab;

                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.85}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.helpTab, active && styles.activeHelpTab]}
                  >
                    <Text style={[styles.helpTabText, active && styles.activeHelpTabText]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Header>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          {activeTab === "FAQs" ? (
            <View style={[styles.backgroundCard, styles.sectionStack]}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <Text style={styles.sectionSubtitle}>Find answers to common questions quickly</Text>
              {visibleFaqs.map((item, index) => (
                <FaqCard
                  key={item.question}
                  item={item}
                  open={openFaqIndex === index}
                  onPress={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                />
              ))}
            </View>
          ) : null}

          {activeTab === "Contact Us" ? (
            <View style={[styles.backgroundCard, styles.sectionStack]}>
              {visibleContacts.map((item) => (
                <View key={`${item.category}-${item.phone}`} style={styles.contactGroup}>
                  <Text style={styles.contactCategory}>{item.category}</Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
                    <Card style={styles.contactCard}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.initials}</Text>
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <View style={styles.phoneRow}>
                          <MaterialIcons name="phone" size={18} color={colors.muted} />
                          <Text style={styles.phoneText}>{item.phone}</Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {activeTab === "Support Chat" ? (
            <View style={[styles.backgroundCard, styles.chatEmpty]}>
              <Text style={styles.chatHint}>Your query will be resolved within 2-24 hours.</Text>
              <View style={styles.chatComposer}>
                <TextInput
                  placeholder="Type your message..."
                  placeholderTextColor="#B2ADB0"
                  value={messageText}
                  onChangeText={setMessageText}
                  style={styles.chatInput}
                />
                <TouchableOpacity activeOpacity={0.85} style={styles.sendButton}>
                  <Ionicons name="paper-plane-outline" size={31} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function FaqCard({ item, open, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
      <Card style={styles.faqCard}>
        <View style={styles.faqTopRow}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={24} color="#09142F" />
        </View>
        {open ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerControls: {
    gap: 14,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  searchBox: {
    minHeight: 56,
    borderRadius: 24,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    gap: 14,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 18,
    paddingVertical: 0,
  },
  helpTabs: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6E4DE",
    backgroundColor: colors.white,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpTab: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  activeHelpTab: {
    backgroundColor: colors.topSection,
  },
  helpTabText: {
    color: "#6D6D72",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  activeHelpTabText: {
    color: colors.white,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -28,
  },
  backgroundCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E9E7EF",
    backgroundColor: colors.white,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  sectionStack: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  faqCard: {
    borderRadius: 18,
    backgroundColor: "#F7F6FC",
    padding: 0,
    overflow: "hidden",
  },
  faqTopRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
  },
  faqQuestion: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  faqAnswer: {
    borderTopWidth: 1,
    borderTopColor: colors.white,
    color: "#6D6D72",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  contactGroup: {
    gap: 12,
    marginBottom: 18,
  },
  contactCategory: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
  },
  contactCard: {
    minHeight: 116,
    borderRadius: 22,
    backgroundColor: "#F3F2F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 18,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  phoneText: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  chatEmpty: {
    minHeight: 520,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  chatHint: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  chatComposer: {
    width: "100%",
    minHeight: 74,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DDD8D6",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 8,
    gap: 12,
  },
  chatInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 18,
    paddingVertical: 0,
  },
  sendButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#4B5FB6",
    alignItems: "center",
    justifyContent: "center",
  },
});
