import React, { useEffect, useMemo, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Popup, Toast } from "../components";
import BottomTabs from "../navigation/BottomTabs";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { getSafeText } from "../utils/userMapper";

const userIcon = require("../assets/user.png");
const pencilIcon = require("../assets/pencil.png");
const cameraIcon = require("../assets/camera.png");

const menuItems = [
  { label: "My Badge", icon: "badge" },
  { label: "My Briefcase", icon: "business-center" },
  { label: "My Meetings", icon: "groups" },
  { label: "My Notes", icon: "description" },
  { label: "My Calendar", icon: "event" },
  { label: "Favourites", icon: "favorite-border" },
  { label: "Logout", icon: "logout" },
];

export default function ProfileScreen({
  user = {},
  embedded = false,
  onHome,
  onEditProfile,
  onLogout,
  onProfilePhotoSelected,
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = useMemo(() => Math.min(width - 24, 720), [width]);
  const savedImage = getSafeText(user.profileImageUrl);
  const [profileImage, setProfileImage] = useState(savedImage);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setProfileImage(savedImage);
  }, [savedImage]);

  const pickPhoto = async (source) => {
    setShowPhotoPopup(false);

    try {
      if (source === "camera" && Platform.OS !== "web") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setToast("Camera permission is required.");
          return;
        }
      }

      const options = {
        mediaTypes: ["images"],
        allowsEditing: Platform.OS !== "web",
        aspect: [1, 1],
        quality: 0.8,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const selectedAsset = result.assets[0];
      setProfileImage(selectedAsset.uri);

      if (onProfilePhotoSelected) {
        setIsUploading(true);
        const savedUrl = await onProfilePhotoSelected(selectedAsset);
        if (savedUrl) setProfileImage(savedUrl);
      }
    } catch (error) {
      setToast(error.message || "Could not update profile photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMenuPress = (label) => {
    if (label === "Logout") {
      onLogout?.();
      return;
    }

    setToast(`${label} is coming soon.`);
  };

  const content = (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profilePage}>
          <View
            style={[
              styles.profileHeader,
              { paddingTop: insets.top + 16 },
            ]}
          >
            <View style={[styles.headerInner, { maxWidth: contentWidth }]}>
              <View style={styles.headerTopActions}>
                <View style={styles.headerSpacer} />
                <Text style={styles.screenTitle}>Profile</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onEditProfile}
                  style={styles.headerIconButton}
                >
                  <Image
                    source={pencilIcon}
                    style={styles.headerActionIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.userProfileInfo}>
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImage}>
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        style={styles.profilePhoto}
                        resizeMode="cover"
                        onError={() => setProfileImage("")}
                      />
                    ) : (
                      <Image source={userIcon} style={styles.profileUserIcon} resizeMode="contain" />
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isUploading}
                    onPress={() => setShowPhotoPopup(true)}
                    style={styles.profileImageEditBadge}
                  >
                    <Image
                      source={cameraIcon}
                      style={[
                        styles.cameraIcon,
                        isUploading && styles.cameraIconUploading,
                      ]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.profileUserDetails}>
                  <Text style={styles.userName} numberOfLines={2}>
                    {getSafeText(user.name) || "Profile"}
                  </Text>
                  {!!getSafeText(user.email) && (
                    <Text style={styles.userText} numberOfLines={1}>
                      {getSafeText(user.email)}
                    </Text>
                  )}
                  {!!getSafeText(user.mobile) && (
                    <Text style={styles.userText} numberOfLines={1}>
                      {getSafeText(user.mobile)}
                    </Text>
                  )}
                  {!!getSafeText(user.designation) && (
                    <Text style={styles.userText} numberOfLines={1}>
                      {getSafeText(user.designation)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.content, { maxWidth: contentWidth }]}>
            <View pointerEvents={toast ? "auto" : "none"} style={styles.toastOverlay}>
              <Toast message={toast} type="success" onClose={() => setToast("")} />
            </View>

            <Card style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <View key={item.label}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleMenuPress(item.label)}
                    style={styles.menuRow}
                  >
                    <View style={styles.menuLeft}>
                      <View style={styles.menuIconBox}>
                        <MaterialIcons
                          name={item.icon}
                          size={22}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={28} color="#D1D1D1" />
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>

      {!embedded && (
        <BottomTabs
          activeTab="profile"
          onTabPress={(tab) => {
            if (tab === "home") onHome?.();
          }}
        />
      )}

      <Popup
        visible={showPhotoPopup}
        title="Profile photo"
        message="Choose how you want to update your photo."
        primaryLabel="Gallery"
        secondaryLabel={Platform.OS === "web" ? "Cancel" : "Camera"}
        onPrimary={() => pickPhoto("library")}
        onSecondary={() => {
          if (Platform.OS === "web") {
            setShowPhotoPopup(false);
          } else {
            pickPhoto("camera");
          }
        }}
      >
        {Platform.OS !== "web" && (
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => setShowPhotoPopup(false)}
          />
        )}
      </Popup>
    </>
  );

  return <View style={styles.screen}>{content}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  profilePage: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    gap: spacing.md,
    paddingHorizontal: 25,
    marginTop: -60,
    marginBottom: 18,
    position: "relative",
  },
  toastOverlay: {
    position: "absolute",
    top: -54,
    left: 25,
    right: 25,
    zIndex: 10,
  },
  headerInner: {
    width: "100%",
    alignSelf: "center",
  },
  profileHeader: {
    minHeight: 286,
    backgroundColor: colors.green,
    paddingHorizontal: 30,
    paddingBottom: 92,
    width: "100%",
  },
  headerTopActions: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionIcon: {
    width: 18,
    height: 18,
    tintColor: colors.white,
  },
  screenTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  userProfileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 20,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
  },
  profileUserIcon: {
    width: 64,
    height: 64,
    tintColor: colors.green,
  },
  profileImageEditBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  cameraIcon: {
    width: 18,
    height: 18,
    tintColor: colors.green,
  },
  cameraIconUploading: {
    opacity: 0.45,
  },
  profileUserDetails: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  userName: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    marginBottom: 3,
  },
  userText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
  },
  menuCard: {
    padding: 0,
    paddingVertical: 18,
    borderRadius: 30,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  menuLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginLeft: 84,
    marginRight: 22,
  },
});
