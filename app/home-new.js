import React, { useCallback, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import HomeScreenNew from "../src/screens/HomeScreenNew";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { getConversations } from "../src/services/chatService";
import { getEventHome, getEventInfo, getDignitariesPreview, getPartnersPreview, getSpeakersPreview } from "../src/services/eventService";
import { hasUnreadNotifications } from "../src/services/notificationInboxService";
import { clearAuthSession } from "../src/services/sessionService";
import { loadUserFromSessionOrParams } from "../src/services/userService";
import { mapEventHomeResponse } from "../src/utils/eventHomeMapper";
import { getApiErrorMessage, isNoInternetError } from "../src/utils/network";
import { getUserLookupFromParams } from "../src/utils/routeParams";
import { mapUser } from "../src/utils/userMapper";
import { trackEventJourneyActivity } from "../src/services/eventJourneyTracker";

export default function HomeNewRoute() {
  const params = useLocalSearchParams();
  const initialTab = getInitialTabFromParams(params.tab);
  const lookup = getUserLookupFromParams(params);
  const [user, setUser] = useState(() => mapUser({}, lookup.email));
  const [homeContent, setHomeContent] = useState(null);
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasUnreadNotificationDot, setHasUnreadNotificationDot] = useState(false);
  const [hasUnreadMessageDot, setHasUnreadMessageDot] = useState(false);

  const loadBadgeDots = useCallback(async () => {
    try {
      const unreadNotifications = await hasUnreadNotifications();
      setHasUnreadNotificationDot(unreadNotifications);
    } catch {
      setHasUnreadNotificationDot(false);
    }

    try {
      const conversations = await getConversations();
      const unreadMessages = conversations.some((item) => Number(item?.unreadCount) > 0);
      setHasUnreadMessageDot(unreadMessages);
    } catch {
      setHasUnreadMessageDot(false);
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      setIsRetrying(true);
      const latestUser = await loadUserFromSessionOrParams(lookup);

      if (!latestUser) {
        router.replace("/");
        return;
      }

      setUser(mapUser(latestUser, lookup.email));
      setShowNoInternet(false);
      await trackEventJourneyActivity("login");
      await loadBadgeDots();

      try {
        const [homeResponse, eventInfo, speakers, partners, dignitaries] = await Promise.all([
          getEventHome(),
          getEventInfo().catch(() => null),
          getSpeakersPreview(5).catch(() => []),
          getPartnersPreview(3).catch(() => []),
          getDignitariesPreview(5).catch(() => []),
        ]);

        setHomeContent(
          mapEventHomeResponse({
            ...homeResponse,
            ...(eventInfo || {}),
            speakers,
            partners,
            dignitaries,
            socialLinks: homeResponse?.socialLinks || eventInfo?.socialLinks,
            bannerImages: homeResponse?.bannerImages,
            quickAccessItems: homeResponse?.quickAccessItems,
          })
        );
      } catch (homeError) {
        console.log("Home content API failed:", getApiErrorMessage(homeError));
      }
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      await clearAuthSession();
      console.error("Home load failed:", getApiErrorMessage(error));
      router.replace("/");
    } finally {
      setIsRetrying(false);
    }
  }, [loadBadgeDots, lookup.email, lookup.mobileNumber]);

  useFocusEffect(
    useCallback(() => {
      loadUser();

      // Keep users in the app after login — do not return to auth screens.
      if (Platform.OS !== "android") {
        return undefined;
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        BackHandler.exitApp();
        return true;
      });

      return () => subscription.remove();
    }, [loadUser])
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={loadUser} isRetrying={isRetrying} />;
  }

  return (
    <HomeScreenNew
      user={user}
      homeContent={homeContent}
      initialTab={initialTab}
      onOpenSpeakers={() => router.push("/speakers")}
      onOpenDignitaries={() => router.push("/dignitaries")}
      onOpenGallery={() => router.push("/gallery")}
      onOpenMyBadge={() => router.push("/my-badge")}
      onOpenBadgeScanner={() => router.push("/badge-scanner")}
      onOpenExhibition={() => router.push("/exhibitor-new")}
      onOpenEventInfo={() => router.push("/event-info")}
      onOpenContactUs={() => router.push("/contact-us")}
      onOpenEventJourney={() => router.push("/event-journey")}
      onOpenAwards={() => router.push("/awards")}
      onOpenB2BPartnering={() => router.push("/b2b-partnering")}
      onOpenFloorPlan={() => router.push("/floor-plan")}
      onOpenBociPartner={() => router.push("/boci-partner")}
      onOpenNotifications={() => router.push("/notifications")}
      onOpenMessages={() => router.push("/messages")}
      hasUnreadNotifications={hasUnreadNotificationDot}
      hasUnreadMessages={hasUnreadMessageDot}
      onOpenPartners={() => router.push("/partners-new")}
      onOpenConference={() => router.push("/conference-list")}
      onLogout={async () => {
        await clearAuthSession();
        router.replace("/");
      }}
    />
  );
}

function getInitialTabFromParams(tabParam) {
  const value = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  return ["home", "hub", "profile"].includes(value) ? value : "home";
}
