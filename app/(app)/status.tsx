import { Avatar } from "@/components/ui/Avatar";
import { AppTheme } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatusItem {
  id: string;
  name: string;
  time: string;
  avatar?: string;
  viewed: boolean;
}

const STATUS_DATA: StatusItem[] = [
  { id: "1", name: "My Status", time: "Tap to add status", viewed: false, avatar: undefined },
  { id: "2", name: "Alice Johnson", time: "Just now", viewed: false },
  { id: "3", name: "Bob Smith", time: "30 minutes ago", viewed: true },
  { id: "4", name: "Charlie Brown", time: "1 hour ago", viewed: true },
];

export default function StatusScreen() {
  const [statuses] = useState(STATUS_DATA);

  const renderStatus = ({ item }: { item: StatusItem }) => (
    <TouchableOpacity
      style={styles.statusItem}
      onPress={() => {
        if (item.id === "1") {
          router.push("/(app)/createStatus");
        }
      }}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          name={item.name}
          uri={item.avatar}
          size={56}
          style={item.viewed && item.id !== "1" ? styles.viewedAvatar : undefined}
        />
        {item.id === "1" && (
          <View style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
          </View>
        )}
      </View>
      <View style={styles.statusContent}>
        <Text style={styles.statusName}>
          {item.id === "1" ? "My Status" : item.name}
        </Text>
        <Text style={styles.statusTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Status</Text>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent updates</Text>
      </View>

      <FlatList
        data={statuses.filter((s) => s.id !== "1")}
        renderItem={renderStatus}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.myStatusRow} onPress={() => router.push("/(app)/createStatus")}>
        <View style={styles.myStatusAvatar}>
          <Avatar name="My Status" size={56} />
          <View style={styles.myStatusAdd}>
            <Text style={styles.myStatusAddIcon}>+</Text>
          </View>
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusName}>My Status</Text>
          <Text style={styles.statusTime}>Tap to add status</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#00A884",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  menuIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F2F5",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3B4A54",
  },
  list: {
    paddingVertical: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  viewedAvatar: {
    opacity: 0.6,
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00A884",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  addIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  statusContent: {
    marginLeft: 12,
  },
  statusName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111B21",
  },
  statusTime: {
    fontSize: 13,
    color: "#667781",
  },
  myStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E7E9EB",
    marginTop: 8,
  },
  myStatusAvatar: {
    position: "relative",
  },
  myStatusAdd: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00A884",
  },
  myStatusAddIcon: {
    color: "#00A884",
    fontSize: 16,
    fontWeight: "600",
  },
});