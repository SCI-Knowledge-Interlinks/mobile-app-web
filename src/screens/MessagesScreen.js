import React, { useCallback, useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";
import { getConversations } from "../services/chatService";
import { formatRelativeTime } from "../utils/formatTime";
import { getApiErrorMessage, isApiError } from "../utils/apiResponse";

function isNotFoundError(error) {
  if (!error) {
    return false;
  }

  if (isApiError(error) && (error.httpStatus === 404 || error.api?.code === 404)) {
    return true;
  }

  const message = getApiErrorMessage(error).toLowerCase();
  return message.includes("not found") || message.includes("no conversation");
}

export default function MessagesScreen({ onBack, onOpenConversation }) {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const items = await getConversations();
      setConversations(items);
    } catch (err) {
      if (isNotFoundError(err)) {
        setConversations([]);
        setError("");
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title="Message" onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadConversations(true)} />
          }
          contentContainerStyle={[
            !error && conversations.length === 0 ? styles.emptyScrollContent : null,
            { paddingBottom: scrollBottomPadding(insets) },
          ]}
        >
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {!error && conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No messages found</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {conversations.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() =>
                    onOpenConversation?.({
                      id: item.id,
                      title: item.title,
                    })
                  }
                  style={[styles.row, index < conversations.length - 1 && styles.rowBorder]}
                >
                  <View style={styles.iconWrap}>
                    <MaterialIcons name="chat-bubble-outline" size={22} color={colors.text} />
                    {item.unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <View style={styles.content}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.time}>
                        {formatRelativeTime(item.lastMessage?.createdAt || item.updatedAt)}
                      </Text>
                    </View>
                    <Text style={styles.body} numberOfLines={2}>
                      {item.lastMessage?.body || "Start a conversation"}
                    </Text>
                  </View>
                </TouchableOpacity>
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
    justifyContent: "center",
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
  iconWrap: {
    width: 28,
    alignItems: "center",
    paddingTop: 2,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
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
  errorText: {
    ...textPresets.caption,
    color: colors.danger,
    textAlign: "center",
    padding: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...textPresets.listItemTitle,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
