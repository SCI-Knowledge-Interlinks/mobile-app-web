import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles } from "../styles/commonStyles";
import { getConversationMessages } from "../services/chatService";
import {
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  subscribeToMessages,
} from "../services/chatSocket";
import { getSessionUserId } from "../services/sessionService";
import { formatMessageTime } from "../utils/formatTime";
import { getApiErrorMessage } from "../utils/network";

export default function ChatThreadScreen({ conversationId, title, onBack }) {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [threadTitle, setThreadTitle] = useState(title || "Chat");

  const appendMessage = useCallback((message) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current;
      }

      return [...current, message];
    });
  }, []);

  const loadThread = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const userId = await getSessionUserId();
      setCurrentUserId(userId ? Number(userId) : null);

      const data = await getConversationMessages(conversationId);
      setThreadTitle(data.conversation?.title || title || "Chat");
      setMessages(data.messages || []);

      const socket = await joinConversation(conversationId);
      socketRef.current = socket;

      const unsubscribe = subscribeToMessages(socket, (message) => {
        if (String(message.conversationId) !== String(conversationId)) {
          return;
        }

        appendMessage(message);
      });

      return unsubscribe;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [appendMessage, conversationId, title]);

  useEffect(() => {
    let unsubscribe;

    loadThread().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      unsubscribe?.();
      if (socketRef.current) {
        leaveConversation(socketRef.current, conversationId);
      }
    };
  }, [conversationId, loadThread]);

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending) {
      return;
    }

    setIsSending(true);
    setDraft("");

    try {
      const socket = socketRef.current || (await joinConversation(conversationId));
      socketRef.current = socket;
      const message = await sendSocketMessage(socket, conversationId, body);
      appendMessage(message);
    } catch (err) {
      setDraft(body);
      setError(getApiErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine =
      item.senderUserId != null &&
      currentUserId != null &&
      Number(item.senderUserId) === Number(currentUserId);

    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowOther]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {!isMine && item.senderName ? (
            <Text style={styles.senderName}>{item.senderName}</Text>
          ) : null}
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.body}</Text>
          <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title={threadTitle} onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: spacing.md },
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholder}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || isSending}
            activeOpacity={0.85}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    width: "100%",
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  messageRowOther: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: colors.primaryBlue,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  senderName: {
    ...textPresets.caption,
    color: colors.accentBlue,
    fontFamily: textPresets.listItemTitle.fontFamily,
  },
  messageText: {
    ...textPresets.body,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextMine: {
    color: colors.white,
  },
  messageTime: {
    ...textPresets.caption,
    color: colors.textMutedLight,
    alignSelf: "flex-end",
  },
  messageTimeMine: {
    color: "rgba(255,255,255,0.8)",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.pageBackgroundAlt,
    ...textPresets.body,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBlue,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    ...textPresets.caption,
    color: colors.danger,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
});
