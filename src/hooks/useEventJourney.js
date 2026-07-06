import { useCallback } from "react";
import { useFocusEffect, usePathname } from "expo-router";

import {
  getEventJourneySummary,
  trackEventJourneyActivity,
  trackEventJourneyPath,
} from "../services/eventJourneyTracker";

export function useEventJourneyScreen(activityKey) {
  useFocusEffect(
    useCallback(() => {
      if (activityKey) {
        trackEventJourneyActivity(activityKey);
      }
    }, [activityKey])
  );
}

export function useEventJourneyPathTracker() {
  const pathname = usePathname();

  useFocusEffect(
    useCallback(() => {
      if (pathname) {
        trackEventJourneyPath(pathname);
      }
    }, [pathname])
  );
}

export function useEventJourneySummaryLoader(setSummary) {
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getEventJourneySummary().then((summary) => {
        if (isMounted) {
          setSummary(summary);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [setSummary])
  );
}
