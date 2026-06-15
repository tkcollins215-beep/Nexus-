import { Avatar } from "@/components/ui/Avatar";
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
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface StatusItem {
  id: string;
  name: string;
  time: string;
  avatar?: string;
  viewed: boolean;
}

const STATUS_DATA: StatusItem[] = [
  { id: "1", name: "Alice Johnson", time: "Just now", viewed: false },
  { id: "2", name: "Bob Smith", time: "30 minutes ago", viewed: true },
  { id: "3", name: "Charlie Brown", time: "1 hour ago", viewed: true },
];

export default function StatusScreen() {
  const [statuses] = useState(STATUS_DATA);

  const renderStatus = ({ item }: { item: StatusItem }) => (
    <TouchableOpacity
      style={styles.statusItem}
      onPress={() => router.push("/(app)/createStatus")}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          name={item.name}
          uri={item.avatar}
          size={56}
        />
      </View>
      <View style={styles.statusContent}>
        <Text style={styles.statusName}>{item.name}</Text>
        <Text style={styles.statusTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#1a0f3f", "#2d1b69", "#1a0f3f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Status</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.myStatusSection}>
          <TouchableOpacity
            style={styles.myStatusRow}
            onPress={() => router.push("/(app)/createStatus")}
          >
            <View style={styles.myStatusAvatar}>
              <Avatar name="My Status" size={56} />
              <View style={styles.myStatusAdd}>
                <MaterialCommunityIcons name="plus" size={16} color="#A855F7" />
              </View>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusName}>My Status</Text>
              <Text style={styles.statusTime}>Tap to add status</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent updates</Text>
        </View>

        <FlatList
          data={statuses}
          renderItem={renderStatus}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  myStatusSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  myStatusRow: {
    flexDirection: "row",
    alignItems: "center",
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
    borderColor: "#A855F7",
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
  statusContent: {
    marginLeft: 12,
  },
  statusName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  statusTime: {
    fontSize: 13,
    color: "#A1A5B4",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A1A5B4",
  },
  list: {
    paddingVertical: 8,
  },
});