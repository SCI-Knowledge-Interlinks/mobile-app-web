import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import ProfileScreen from "../src/screens/ProfileScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { clearAuthSession } from "../src/services/sessionService";
import { loadUserFromSessionOrParams } from "../src/services/userService";
import { getApiErrorMessage, isNoInternetError } from "../src/utils/network";
import { uploadProfilePhoto } from "../src/utils/profileImage";
import {
  getUserLookupFromParams,
  getUserRouteParams,
} from "../src/utils/routeParams";
import { mapUser } from "../src/utils/userMapper";

export default function ProfileRoute() {
  const params = useLocalSearchParams();
  const lookup = getUserLookupFromParams(params);
  const [user, setUser] = useState(() => mapUser({}, lookup.email));
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

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
      console.error("Profile load failed:", getApiErrorMessage(error));
      router.replace("/");
    } finally {
      setIsRetrying(false);
    }
  }, [lookup.email, lookup.mobileNumber]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (showNoInternet) {
    return <NoInternetScreen onRetry={loadUser} isRetrying={isRetrying} />;
  }

  return (
    <ProfileScreen
      user={user}
      onHome={() => router.replace({ pathname: "/home", params: getUserRouteParams(user) })}
      onEditProfile={() =>
        router.push({ pathname: "/edit-profile", params: getUserRouteParams(user) })
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
