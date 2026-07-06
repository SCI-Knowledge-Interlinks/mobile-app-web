import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { getApiErrorMessage, isNoInternetError } from "../utils/network";

export function useEventScreenData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoInternet, setShowNoInternet] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await loader();
      setData(result);
      setShowNoInternet(false);
      return result;
    } catch (err) {
      if (isNoInternetError(err)) {
        setShowNoInternet(true);
      } else {
        setError(getApiErrorMessage(err));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return {
    data,
    isLoading,
    error,
    showNoInternet,
    reload: load,
  };
}
