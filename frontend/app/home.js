import React, { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import HomeScreen from "../src/screens/HomeScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { clearAuthSession } from "../src/services/sessionService";
import { loadUserFromSessionOrParams } from "../src/services/userService";
import { getApiErrorMessage, isNoInternetError } from "../src/utils/network";
import { uploadProfilePhoto } from "../src/utils/profileImage";
import {
  getParamValue,
  getUserLookupFromParams,
  getUserRouteParams,
} from "../src/utils/routeParams";
import { mapUser } from "../src/utils/userMapper";

export default function HomeRoute() {
  const params = useLocalSearchParams();
  const lookup = getUserLookupFromParams(params);
  const [user, setUser] = useState(() => mapUser({}, lookup.email));
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const message = getParamValue(params.message, "You have successfully logged in");
  const initialActiveTab = getParamValue(params.activeTab, "home");
  const sessionFilters = getFiltersFromParams(params.filters);
  const initialBookmarkedSessionIds = getBookmarksFromParams(params.bookmarks);

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
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      await clearAuthSession();
      console.error("Home user load failed:", getApiErrorMessage(error));
      router.replace("/");
    } finally {
      setIsRetrying(false);
    }
  }, [lookup.email, lookup.mobileNumber]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={loadUser} isRetrying={isRetrying} />;
  }

  return (
    <HomeScreen
      message={message}
      user={user}
      initialActiveTab={initialActiveTab}
      sessionFilters={sessionFilters}
      initialBookmarkedSessionIds={initialBookmarkedSessionIds}
      onEditProfile={() =>
        router.push({ pathname: "/edit-profile", params: getUserRouteParams(user) })
      }
      onOpenSpeakers={() => router.push("/speakers")}
      onOpenCalendar={() => router.push("/my-calendar")}
      onOpenExhibition={(selectedTab) =>
        router.push({
          pathname: "/exhibition",
          params: selectedTab ? { selectedTab } : {},
        })
      }
      onOpenHelpdesk={() => router.push("/helpdesk")}
      onOpenSpeakerInfo={(data) =>
        router.push({
          pathname: "/speaker-info",
          params: { data: JSON.stringify(data) },
        })
      }
      onOpenSessionDetails={(session) =>
        router.push({
          pathname: "/session-details",
          params: { session: JSON.stringify(session) },
        })
      }
      onOpenSessionFilter={(bookmarkedSessionIds, filters) =>
        router.push({
          pathname: "/session-filter",
          params: {
            bookmarks: JSON.stringify(bookmarkedSessionIds),
            filters: JSON.stringify(filters),
          },
        })
      }
      onLogout={async () => {
        await clearAuthSession();
        router.replace("/");
      }}
      onProfilePhotoSelected={async (asset) => {
        const profileImageUrl = await uploadProfilePhoto(asset);
        setUser((currentUser) => ({ ...currentUser, profileImageUrl }));
        return profileImageUrl;
      }}
    />
  );
}

function getFiltersFromParams(filtersParam) {
  const value = Array.isArray(filtersParam) ? filtersParam[0] : filtersParam;

  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

function getBookmarksFromParams(bookmarksParam) {
  const value = Array.isArray(bookmarksParam) ? bookmarksParam[0] : bookmarksParam;

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}
