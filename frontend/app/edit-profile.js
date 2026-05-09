import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import EditProfileScreen from "../src/screens/EditProfileScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { getAuthSession, saveAuthSession } from "../src/services/sessionService";
import {
  loadUserFromSessionOrParams,
  saveUserProfile,
} from "../src/services/userService";
import { getApiErrorMessage, isNoInternetError } from "../src/utils/network";
import {
  getUserLookupFromParams,
  getUserRouteParams,
} from "../src/utils/routeParams";
import { mapUser } from "../src/utils/userMapper";

export default function EditProfileRoute() {
  const params = useLocalSearchParams();
  const lookup = getUserLookupFromParams(params);
  const [initialUser, setInitialUser] = useState(() => mapUser({}, lookup.email));
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  const loadUser = useCallback(async () => {
    try {
      setIsRetrying(true);
      const latestUser = await loadUserFromSessionOrParams(lookup);

      if (!latestUser) {
        router.replace("/");
        return;
      }

      setInitialUser(mapUser(latestUser, lookup.email));
      setShowNoInternet(false);
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      console.error("Edit profile load failed:", getApiErrorMessage(error));
    } finally {
      setIsRetrying(false);
    }
  }, [lookup.email, lookup.mobileNumber]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const saveProfile = async (form) => {
    const savedUser = await saveUserProfile({
      email: lookup.email || form.email,
      name: form.name,
      countryCode: form.countryCode,
      mobileNumber: form.mobileNumber,
      company: form.company,
      designation: form.designation,
      gender: form.gender,
      city: form.city,
      country: form.country,
      pincode: form.pincode,
    });

    const session = await getAuthSession();
    if (session?.token) {
      await saveAuthSession({ token: session.token, user: savedUser });
    }

    setPendingForm(null);
    setShowNoInternet(false);
    return mapUser(savedUser, lookup.email);
  };

  const retryOfflineAction = async () => {
    try {
      setIsRetrying(true);

      if (pendingForm) {
        const savedUser = await saveProfile(pendingForm);
        router.replace({ pathname: "/profile", params: getUserRouteParams(savedUser) });
        return;
      }

      await loadUser();
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      console.error("Edit profile retry failed:", getApiErrorMessage(error));
    } finally {
      setIsRetrying(false);
    }
  };

  if (showNoInternet) {
    return <NoInternetScreen onRetry={retryOfflineAction} isRetrying={isRetrying} />;
  }

  return (
    <EditProfileScreen
      initialUser={initialUser}
      onBack={() => router.back()}
      onSave={async (form) => {
        try {
          return await saveProfile(form);
        } catch (error) {
          if (isNoInternetError(error)) {
            setPendingForm(form);
            setShowNoInternet(true);
            throw new Error(error.message);
          }

          throw new Error(getApiErrorMessage(error));
        }
      }}
      onSaveSuccess={(savedUser) => {
        if (!savedUser) return;
        router.replace({ pathname: "/profile", params: getUserRouteParams(savedUser) });
      }}
    />
  );
}
