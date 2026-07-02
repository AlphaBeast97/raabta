import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { toast } from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  users: [],
  conversations: [],
  messages: [],
  selectedUser: null,
  isConversationLoading: false,
  isUserLoading: false,
  isMessageLoading: false,
  activeConversationId: null,
  searchQuery: "",
  sidebarTab: "chats",
  composerText: "",
  isSoundEnabled: true,
  isSendingMedia: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set((state) => ({
        users: res.data,
        selectedUser:
          state.selectedUser &&
          res.data.some((user) => user.id === state.selectedUser.id)
            ? state.selectedUser
            : null,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getConversations: async () => {
    set({ isConversationLoading: true });
    try {
      const res = await axiosInstance.get("/messages/conversations");
      set({ conversations: res.data });
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      set({ isConversationLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data, activeConversationId: userId });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(`${error.response?.data?.message || "An error occurred"}`, {
        id: "fetch-messages-error",
      });
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessages: async (messagesData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messagesData,
      );

      set({ messages: [...messages, res.data.newMessage], composerText: "" });

      get().getConversations();
      return true;
    } catch (error) {
      toast.error(`${error.response?.data?.message || "An error occurred"}`, {
        id: "send-message-error",
      });
      return false;
    }
  },

  subscribeToMessages: (userId) => {
    if (!userId) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      // Only update the store if the new message is for the currently selected user
      if (String(newMessage.senderId) !== String(userId)) return;

      set({ messages: [...get().messages, newMessage] });

      get().getConversations();
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setActiveConversationId: (activeConversationId) => {
    set((state) => ({
      activeConversationId,
      selectedUser:
        state.users.find((user) => user._id === activeConversationId) ||
        state.conversations.find((user) => user._id === activeConversationId) ||
        null,
      messages: activeConversationId ? state.messages : [],
    }));
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSidebarTab: (sidebarTab) => set({ sidebarTab }),

  setComposerText: (composerText) => set({ composerText }),

  setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

  sendTextMessage: async (conversationId) => {
    const messageText = get().composerText.trim();
    if (!conversationId || !messageText) return false;

    return get().sendMessages({ text: messageText });
  },

  sendMediaMessage: async (conversationId, file) => {
    if (!conversationId || !file) return false;

    const formData = new FormData();
    formData.append("media", file);

    set({ isSendingMedia: true });

    try {
      return await get().sendMessages(formData);
    } finally {
      set({ isSendingMedia: false });
    }
  },
}));
