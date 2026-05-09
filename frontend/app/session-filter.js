import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import SessionFilterScreen from "../src/screens/SessionFilterScreen";

export default function SessionFilterRoute() {
  const params = useLocalSearchParams();
  const bookmarks = getBookmarksFromParams(params.bookmarks);
  const filters = getFiltersFromParams(params.filters);

  return (
    <SessionFilterScreen
      initialFilters={filters}
      onBack={() => router.back()}
      onApply={(filters) =>
        router.replace({
          pathname: "/home",
          params: {
            activeTab: "sessions",
            filters: JSON.stringify(filters),
            bookmarks: JSON.stringify(bookmarks),
          },
        })
      }
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
