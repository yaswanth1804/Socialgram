import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const rtmSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    notifications: [],
    unreadNotificationCount: 0,
  },
  reducers: {
    // Set a notification (like, follow, comment, reply, etc.)
    setNotification: (state, action) => {
      const { type, user, post, comment, reply } = action.payload;
      console.log(action.payload);

      // Remove the corresponding notification if it's a "dislike", "unfollow", "delete_comment", "delete_message"
      if (
        [
          "dislike",
          "unfollow",
          "delete_comment",
          "delete_reply",
          "delete_message",
          "dislike_reply",
          "dislike_comment",
        ].includes(type)
      ) {
        state.notifications = state.notifications.filter((item) => {
          // Remove like on dislike
          if (
            type === "dislike" &&
            item.type === "like" &&
            item.user?._id === user?._id &&
            item.post?._id === post?._id
          ) {
            return false;
          }
          // Remove follow on unfollow
          if (
            type === "unfollow" &&
            item.type === "follow" &&
            item.user?._id === user?._id &&
            item.post?._id === post?._id
          ) {
            return false;
          }
          // Remove comment on delete_comment
          if (
            type === "delete_comment" &&
            item.type === "comment" &&
            item.user?._id === user?._id &&
            item.post?._id === post?._id &&
            item.comment?._id === comment?._id
          ) {
            return false;
          }
          // Remove reply on delete_reply
          if (
            type === "delete_reply" &&
            item.type === "reply" &&
            item.user?._id === user?._id &&
            item.post?._id === post?._id &&
            item.comment?._id === comment?._id
          ) {
            return false;
          }
          // Remove message on delete_message
          if (
            type === "delete_message" &&
            item.type === "message" &&
            item.user?._id === user?._id &&
            item.post?._id === post?._id
          ) {
            return false;
          }
          // Remove like on dislike_reply
          if (
            type === "dislike_reply" &&
            item.type === "like_reply" &&
            item.user?._id === user?._id &&
            item.reply?._id === reply?._id
          ) {
            return false;
          }
          // Remove like on dislike_comment
          if (
            type === "dislike_comment" &&
            item.type === "like_comment" &&
            item.user?._id === user?._id &&
            item.comment?._id === comment?._id
          ) {
            return false;
          }
          return true;
        });
      } else {
        // Add notification for like, follow, comment, reply, message
        state.notifications.unshift({
          ...action.payload,
          id: uuidv4(),
          isRead: false,
        });
      }

      // Update unread notification count
      state.unreadNotificationCount = state.notifications.filter(
        (notif) => !notif.isRead
      ).length;
    },

    // Mark a specific notification as read
    markNotificationAsRead: (state, action) => {
      const { id } = action.payload;
      const notificationIndex = state.notifications.findIndex(
        (item) => item.id === id
      );

      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        if (!notification.isRead) {
          notification.isRead = true;
          state.unreadNotificationCount -= 1; // Decrease unread count
        }
      }
    },

    // Mark all notifications as read
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notif) => {
        notif.isRead = true;
      });
      state.unreadNotificationCount = 0;
    },

    // Remove all notifications
    deleteAllNotifications: (state) => {
      state.notifications = [];
      state.unreadNotificationCount = 0;
    },
  },
});

export const {
  setNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} = rtmSlice.actions;

export default rtmSlice.reducer;
