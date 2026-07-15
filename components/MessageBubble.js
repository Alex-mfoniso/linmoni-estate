import { StyleSheet, Text, View } from "react-native";
import COLORS from "../constants/colors";

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MessageBubble({ message, isMine = false, partnerName = "" }) {
  const seen = isMine && Array.isArray(message?.readBy) && message.readBy.length > 1;

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {isMine ? null : partnerName ? <Text style={styles.sender}>{partnerName}</Text> : null}
        <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
          {message?.text}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
            {formatTime(message?.createdAt)}
          </Text>
          {isMine ? (
            <Text style={[styles.state, seen ? styles.stateSeen : styles.stateSent]}>
              {seen ? "Seen" : "Sent"}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    flexDirection: "row",
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 8,
  },
  bubbleTheirs: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 8,
  },
  sender: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMine: {
    color: COLORS.white,
  },
  textTheirs: {
    color: COLORS.text,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  time: {
    fontSize: 11,
    fontWeight: "700",
  },
  timeMine: {
    color: "rgba(255,255,255,0.84)",
  },
  timeTheirs: {
    color: COLORS.mutedText,
  },
  state: {
    fontSize: 11,
    fontWeight: "800",
  },
  stateSeen: {
    color: "rgba(255,255,255,0.92)",
  },
  stateSent: {
    color: "rgba(255,255,255,0.70)",
  },
});
