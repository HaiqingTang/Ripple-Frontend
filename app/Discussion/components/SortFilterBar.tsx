import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { sharedStyles, COLORS } from "@/styles/sharedStyles";

export type SortBy = "date" | "popularity" | "relevance";

type Props = {
  sortBy: SortBy;
  onSortChange: (v: SortBy) => void;
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  query: string;
  onQueryChange: (v: string) => void;
};

const SortFilterBar: React.FC<Props> = React.memo(
  ({ sortBy, onSortChange, availableTags, selectedTags, onTagsChange, query, onQueryChange }) => {
    const toggleTag = React.useCallback(
      (t: string) => {
        const set = new Set(selectedTags);
        set.has(t) ? set.delete(t) : set.add(t);
        onTagsChange(Array.from(set));
      },
      [selectedTags, onTagsChange]
    );

    return (
      <View style={{ marginTop: 8, marginBottom: 8 }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          {([
            { key: "date", label: "Date" },
            { key: "popularity", label: "Popularity" },
            { key: "relevance", label: "Relevance" },
          ] as { key: SortBy; label: string }[]).map(({ key, label }) => {
            const active = sortBy === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onSortChange(key)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? COLORS.primary : COLORS.border,
                  backgroundColor: active ? COLORS.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: active ? COLORS.white : COLORS.text,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


        {availableTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginBottom: 4 }}
          >
            {availableTags.map((t) => {
              const active = selectedTags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTag(t)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? COLORS.primary : COLORS.border,
                    backgroundColor: active ? COLORS.primaryLight : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: active ? COLORS.primary : COLORS.text,
                    }}
                  >
                    #{t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}


        {sortBy === "relevance" && (
          <View
            style={{
              marginTop: 4,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: COLORS.muted,
                marginBottom: 4,
                fontWeight: "600",
              }}
            >
              Relevance keyword
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: COLORS.bgMuted,
                }}
                
                onPress={() => onQueryChange("")}
              >
                <Text style={{ fontSize: 12, color: COLORS.text }}>Clear</Text>
              </TouchableOpacity>
              <Text
                
                style={{ fontSize: 12, color: query ? COLORS.text : COLORS.muted }}
                numberOfLines={1}
              >
                {query ? `“${query}”` : "Tip: set keyword in code or hook"}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
);

SortFilterBar.displayName = "SortFilterBar";
export default SortFilterBar;
