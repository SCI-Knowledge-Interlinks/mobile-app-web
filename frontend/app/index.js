import React, { useEffect, useState } from "react";
import { router } from "expo-router";

import LoginScreen from "../src/screens/LoginScreen";
import Loader from "../src/components/Loader";
import { getAuthSession } from "../src/services/sessionService";

export default function IndexRoute() {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const session = await getAuthSession();

      if (!mounted) return;

      if (session?.token) {
        router.replace("/home");
        return;
      }

      setCheckingSession(false);
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingSession) {
    return <Loader message="Checking session..." />;
  }

  return <LoginScreen />;
}
