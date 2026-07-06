import React, { useCallback, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";
import {
  getNotificationInbox,
  markAllNotificationsRead,
} from "../services/notificationInboxService";
import { formatRelativeTime } from "../utils/formatTime";

export default function NotificationsScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadScreen = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const items = await getNotificationInbox();
      setNotifications(items);
      await markAllNotificationsRead();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScreen();
    }, [loadScreen])
  );

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title="Notification" onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadScreen(true)} />
          }
          contentContainerStyle={[
            notifications.length === 0 ? styles.emptyScrollContent : null,
            { paddingBottom: scrollBottomPadding(insets) },
          ]}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No notifications found</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {notifications.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.row, index < notifications.length - 1 && styles.rowBorder]}
                >
                  <Ionicons
                    name={item.read ? "notifications-outline" : "notifications"}
                    size={22}
                    color={colors.text}
                  />
                  <View style={styles.content}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
                    </View>
                    {!!item.body && <Text style={styles.body}>{item.body}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: {
    ...textPresets.listItemTitle,
    color: colors.textSecondary,
    textAlign: "center",
  },
  listCard: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 4,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm + 2,
  },
  title: {
    flex: 1,
    ...textPresets.listItemTitle,
    color: colors.text,
  },
  time: {
    ...textPresets.listItemMeta,
    color: colors.textMutedLight,
  },
  body: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    lineHeight: 19,
    color: colors.textMutedLight,
  },
});
