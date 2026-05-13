import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import Exhibition from "../src/screens/Exhibition";

export default function ExhibitionRoute() {
  const params = useLocalSearchParams();
  const filters = getFiltersFromParams(params.filters);
  const bookmarkedItemIds = getBookmarksFromParams(params.bookmarks);
  const selectedTab = getSelectedTabFromParams(params.selectedTab);

  return (
    <Exhibition
      filters={filters}
      initialBookmarkedItemIds={bookmarkedItemIds}
      initialActiveTab={selectedTab}
      onBack={() => router.back()}
      onOpenFilter={(currentBookmarkedItemIds, currentFilters) =>
        router.push({
          pathname: "/exhibition-filter",
          params: {
            bookmarks: JSON.stringify(currentBookmarkedItemIds),
            filters: JSON.stringify(currentFilters),
          },
        })
      }
    />
  );
}

function getSelectedTabFromParams(selectedTabParam) {
  const value = Array.isArray(selectedTabParam) ? selectedTabParam[0] : selectedTabParam;
  return ["Partners", "Exhibitors", "Startup"].includes(value) ? value : "Partners";
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
