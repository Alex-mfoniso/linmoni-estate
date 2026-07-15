import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROLES } from "../constants/roles";
import { getUserById } from "./userService";
import { createNotification } from "./notificationService";

const CONVERSATIONS_KEY = "linpal.conversations.v1";
const MESSAGES_KEY = "linpal.messages.v1";

const conversationSubscribers = new Set();
const messageSubscribers = new Map();

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeParticipantProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    uid: String(profile.uid || "").trim(),
    fullName: String(profile.fullName || "").trim(),
    email: String(profile.email || "").trim(),
    phone: String(profile.phone || "").trim(),
    role: String(profile.role || "").trim(),
    status: String(profile.status || "").trim(),
    profilePhoto: String(profile.profilePhoto || "").trim(),
  };
}

function normalizeConversation(conversation) {
  const participantIds = Array.isArray(conversation?.participantIds)
    ? [...new Set(conversation.participantIds.map((id) => String(id || "").trim()).filter(Boolean))].sort()
    : [];
  const participantProfiles = Array.isArray(conversation?.participantProfiles)
    ? conversation.participantProfiles
        .map(normalizeParticipantProfile)
        .filter(Boolean)
    : [];
  const unreadCountByUser = conversation?.unreadCountByUser || {};

  return {
    id: String(conversation?.id || buildId("conv")),
    conversationKey: String(conversation?.conversationKey || ""),
    participantIds,
    participantProfiles,
    propertyId: String(conversation?.propertyId || "").trim(),
    propertyTitle: String(conversation?.propertyTitle || "").trim(),
    propertyAddress: String(conversation?.propertyAddress || "").trim(),
    lastMessage: String(conversation?.lastMessage || "").trim(),
    lastMessageSenderId: String(conversation?.lastMessageSenderId || "").trim(),
    lastMessageAt: conversation?.lastMessageAt || null,
    unreadCountByUser,
    createdAt: conversation?.createdAt || new Date().toISOString(),
    updatedAt: conversation?.updatedAt || new Date().toISOString(),
  };
}

function normalizeMessage(message) {
  return {
    id: String(message?.id || buildId("msg")),
    conversationId: String(message?.conversationId || "").trim(),
    senderId: String(message?.senderId || "").trim(),
    senderProfile: normalizeParticipantProfile(message?.senderProfile),
    text: String(message?.text || "").trim(),
    readBy: Array.isArray(message?.readBy)
      ? [...new Set(message.readBy.map((id) => String(id || "").trim()).filter(Boolean))]
      : [],
    createdAt: message?.createdAt || new Date().toISOString(),
    updatedAt: message?.updatedAt || new Date().toISOString(),
  };
}

function buildConversationKey(participantIds, propertyId = "") {
  const normalizedIds = [...new Set(participantIds.map((id) => String(id || "").trim()).filter(Boolean))].sort();
  return `${normalizedIds.join("|")}::${String(propertyId || "").trim()}`;
}

async function readConversations() {
  const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map(normalizeConversation);
}

async function writeConversations(conversations) {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

async function readMessages() {
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map(normalizeMessage);
}

async function writeMessages(messages) {
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

function getConversationPartner(conversation, userId) {
  return (
    conversation?.participantProfiles?.find((profile) => profile.uid !== userId) ||
    conversation?.participantProfiles?.[0] ||
    null
  );
}

function sortByLatest(left, right) {
  return new Date(right.lastMessageAt || right.updatedAt || 0) -
    new Date(left.lastMessageAt || left.updatedAt || 0);
}

function isAllowedMessagingRole(role) {
  return role !== ROLES.STAKEHOLDER;
}

async function emitConversationSubscribers() {
  const conversations = await readConversations();

  await Promise.all(
    [...conversationSubscribers].map(async (subscriber) => {
      const items = conversations
        .filter((conversation) => conversation.participantIds.includes(subscriber.userId))
        .sort(sortByLatest)
        .map((conversation) => ({
          ...conversation,
          unreadCount: Number(conversation.unreadCountByUser?.[subscriber.userId] || 0),
          partnerProfile: getConversationPartner(conversation, subscriber.userId),
        }));

      await subscriber.callback(items);
    })
  );
}

async function emitMessageSubscribers(conversationId) {
  const messages = await readMessages();
  const items = messages
    .filter((message) => message.conversationId === conversationId)
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));

  const subscribers = messageSubscribers.get(conversationId);
  if (!subscribers) {
    return;
  }

  await Promise.all([...subscribers].map(async (subscriber) => subscriber.callback(items)));
}

async function ensureConversationParticipantProfiles(participantIds) {
  const profiles = await Promise.all(participantIds.map((id) => getUserById(id)));
  const validProfiles = profiles.filter(Boolean).map(normalizeParticipantProfile);

  if (validProfiles.length !== participantIds.length) {
    throw new Error("One or more chat participants could not be found.");
  }

  if (validProfiles.some((profile) => !isAllowedMessagingRole(profile.role))) {
    throw new Error("Stakeholders do not have messaging access.");
  }

  return validProfiles;
}

export async function createOrGetConversation({
  participantIds = [],
  propertyId = "",
  propertyTitle = "",
  propertyAddress = "",
}) {
  const normalizedParticipantIds = [...new Set(participantIds.map((id) => String(id || "").trim()).filter(Boolean))];

  if (normalizedParticipantIds.length !== 2) {
    throw new Error("Messaging currently supports one-to-one conversations only.");
  }

  const participantProfiles = await ensureConversationParticipantProfiles(normalizedParticipantIds);
  const conversationKey = buildConversationKey(normalizedParticipantIds, propertyId);
  const conversations = await readConversations();
  const existing = conversations.find((conversation) => conversation.conversationKey === conversationKey);

  if (existing) {
    const nextConversation = normalizeConversation({
      ...existing,
      participantProfiles: participantProfiles.length ? participantProfiles : existing.participantProfiles,
      propertyTitle: propertyTitle || existing.propertyTitle,
      propertyAddress: propertyAddress || existing.propertyAddress,
      updatedAt: new Date().toISOString(),
    });

    const nextConversations = conversations.map((conversation) =>
      conversation.id === nextConversation.id ? nextConversation : conversation
    );
    await writeConversations(nextConversations);
    await emitConversationSubscribers();
    return nextConversation;
  }

  const now = new Date().toISOString();
  const conversation = normalizeConversation({
    id: buildId("conv"),
    conversationKey,
    participantIds: normalizedParticipantIds,
    participantProfiles,
    propertyId,
    propertyTitle,
    propertyAddress,
    lastMessage: "",
    lastMessageSenderId: "",
    lastMessageAt: null,
    unreadCountByUser: {
      [normalizedParticipantIds[0]]: 0,
      [normalizedParticipantIds[1]]: 0,
    },
    createdAt: now,
    updatedAt: now,
  });

  await writeConversations([conversation, ...conversations]);
  await emitConversationSubscribers();
  return conversation;
}

export async function getConversationById(conversationId) {
  if (!conversationId) {
    return null;
  }

  const conversations = await readConversations();
  return conversations.find((conversation) => conversation.id === conversationId) || null;
}

export async function getUserConversations(userId) {
  if (!userId) {
    return [];
  }

  const conversations = await readConversations();
  return conversations
    .filter((conversation) => conversation.participantIds.includes(userId))
    .sort(sortByLatest)
    .map((conversation) => ({
      ...conversation,
      unreadCount: Number(conversation.unreadCountByUser?.[userId] || 0),
      partnerProfile: getConversationPartner(conversation, userId),
    }));
}

export async function getMessagesByConversationId(conversationId) {
  if (!conversationId) {
    return [];
  }

  const messages = await readMessages();
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
}

export async function sendMessage({ conversationId, senderId, text }) {
  const cleanedText = String(text || "").trim();

  if (!conversationId || !senderId) {
    throw new Error("Missing message details.");
  }

  if (!cleanedText) {
    throw new Error("Message cannot be empty.");
  }

  if (cleanedText.length > 1000) {
    throw new Error("Messages can be up to 1000 characters.");
  }

  const conversations = await readConversations();
  const index = conversations.findIndex((conversation) => conversation.id === conversationId);

  if (index < 0) {
    throw new Error("Conversation not found.");
  }

  const conversation = conversations[index];
  if (!conversation.participantIds.includes(senderId)) {
    throw new Error("You do not have access to this conversation.");
  }

  const senderProfile =
    conversation.participantProfiles.find((profile) => profile.uid === senderId) ||
    (await getUserById(senderId));

  const messages = await readMessages();
  const message = normalizeMessage({
    id: buildId("msg"),
    conversationId,
    senderId,
    senderProfile,
    text: cleanedText,
    readBy: [senderId],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const nextMessages = [...messages, message];
  const participantIds = conversation.participantIds;
  const unreadCountByUser = {
    ...(conversation.unreadCountByUser || {}),
  };

  participantIds.forEach((participantId) => {
    unreadCountByUser[participantId] = participantId === senderId
      ? 0
      : Number(unreadCountByUser[participantId] || 0) + 1;
  });

  const nextConversation = normalizeConversation({
    ...conversation,
    participantProfiles: participantProfileMerge(conversation.participantProfiles, senderProfile),
    lastMessage: cleanedText,
    lastMessageSenderId: senderId,
    lastMessageAt: message.createdAt,
    unreadCountByUser,
    updatedAt: new Date().toISOString(),
  });

  const nextConversations = [...conversations];
  nextConversations[index] = nextConversation;

  await writeMessages(nextMessages);
  await writeConversations(nextConversations);
  await Promise.all(
    participantIds
      .filter((participantId) => participantId !== senderId)
      .map((receiverId) =>
        createNotification({
          userId: receiverId,
          title: "New message",
          message: `${senderProfile?.fullName || "Someone"} sent you a message.`,
          type: "message_received",
          relatedId: conversationId,
          relatedType: "conversation",
          deduplicationKey: `${conversationId}:${receiverId}:${message.id}`,
        })
      )
  );
  await emitConversationSubscribers();
  await emitMessageSubscribers(conversationId);
  return message;
}

function participantProfileMerge(existingProfiles, senderProfile) {
  const profiles = Array.isArray(existingProfiles) ? [...existingProfiles] : [];
  const index = profiles.findIndex((profile) => profile.uid === senderProfile?.uid);

  if (!senderProfile?.uid) {
    return profiles;
  }

  if (index >= 0) {
    profiles[index] = normalizeParticipantProfile(senderProfile);
  } else {
    profiles.push(normalizeParticipantProfile(senderProfile));
  }

  return profiles.filter(Boolean);
}

export async function markConversationMessagesAsRead(conversationId, userId) {
  if (!conversationId || !userId) {
    return [];
  }

  const conversations = await readConversations();
  const conversationIndex = conversations.findIndex((conversation) => conversation.id === conversationId);

  if (conversationIndex < 0) {
    return [];
  }

  const conversation = conversations[conversationIndex];
  const messages = await readMessages();
  const nextMessages = messages.map((message) => {
    if (message.conversationId !== conversationId) {
      return message;
    }

    if (message.readBy.includes(userId)) {
      return message;
    }

    return normalizeMessage({
      ...message,
      readBy: [...message.readBy, userId],
      updatedAt: new Date().toISOString(),
    });
  });

  const nextConversation = normalizeConversation({
    ...conversation,
    unreadCountByUser: {
      ...(conversation.unreadCountByUser || {}),
      [userId]: 0,
    },
    updatedAt: new Date().toISOString(),
  });

  const nextConversations = [...conversations];
  nextConversations[conversationIndex] = nextConversation;

  await writeMessages(nextMessages);
  await writeConversations(nextConversations);
  await emitConversationSubscribers();
  await emitMessageSubscribers(conversationId);
  return nextMessages.filter((message) => message.conversationId === conversationId);
}

export async function getUnreadMessageCount(userId) {
  if (!userId) {
    return 0;
  }

  const conversations = await readConversations();
  return conversations.reduce((total, conversation) => {
    return total + Number(conversation.unreadCountByUser?.[userId] || 0);
  }, 0);
}

export async function subscribeToConversations(userId, callback) {
  if (!userId || typeof callback !== "function") {
    return () => {};
  }

  const subscriber = { userId, callback };
  conversationSubscribers.add(subscriber);

  try {
    const items = await getUserConversations(userId);
    await callback(items);
  } catch {
    await callback([]);
  }

  return () => {
    conversationSubscribers.delete(subscriber);
  };
}

export async function subscribeToMessages(conversationId, callback) {
  if (!conversationId || typeof callback !== "function") {
    return () => {};
  }

  const subscriber = { conversationId, callback };
  if (!messageSubscribers.has(conversationId)) {
    messageSubscribers.set(conversationId, new Set());
  }

  messageSubscribers.get(conversationId).add(subscriber);

  try {
    const items = await getMessagesByConversationId(conversationId);
    await callback(items);
  } catch {
    await callback([]);
  }

  return () => {
    const subscribers = messageSubscribers.get(conversationId);
    if (!subscribers) {
      return;
    }

    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      messageSubscribers.delete(conversationId);
    }
  };
}

export { isAllowedMessagingRole };
