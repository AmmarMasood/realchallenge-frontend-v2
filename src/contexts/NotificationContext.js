import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { getNotifications, markNotificationsAsRead, markAllNotificationsAsRead as markAllAsReadApi } from "../services/users";
import { userInfoContext } from "./UserStore";
import { LanguageContext } from "./LanguageContext";
import { get } from "lodash";

export const NotificationContext = createContext();

const POLLING_INTERVAL = 60000; // 1 minute
const PAGE_SIZE = 10;

/**
 * Interpolate parameters into a translation string
 * Replaces {{paramName}} with actual values
 * @param {string} text - Translation string with placeholders
 * @param {Object} params - Parameter values
 * @returns {string} Interpolated string
 */
const interpolateParams = (text, params = {}) => {
  if (!text || !params) return text;

  return Object.entries(params).reduce((result, [key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    return result.replace(regex, value);
  }, text);
};

const NotificationProvider = ({ children }) => {
  const [rawNotifications, setRawNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false,
  });
  const [userInfo] = useContext(userInfoContext);
  const { strings } = useContext(LanguageContext);

  // Fetch first page of notifications
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!userInfo.authenticated) {
      setRawNotifications([]);
      setUnreadCount(0);
      setPagination({ currentPage: 1, totalPages: 1, totalCount: 0, hasMore: false });
      return;
    }

    try {
      setLoading(true);
      const res = await getNotifications(1, PAGE_SIZE);
      if (res && res.notifications) {
        setRawNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
        setPagination(res.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: res.notifications.length,
          hasMore: false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userInfo.authenticated]);

  // Load more notifications (lazy loading)
  const loadMore = useCallback(async () => {
    if (!userInfo.authenticated || loadingMore || !pagination.hasMore) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = pagination.currentPage + 1;
      const res = await getNotifications(nextPage, PAGE_SIZE);
      if (res && res.notifications) {
        setRawNotifications((prev) => [...prev, ...res.notifications]);
        setPagination(res.pagination || {
          currentPage: nextPage,
          totalPages: pagination.totalPages,
          totalCount: pagination.totalCount,
          hasMore: false,
        });
      }
    } catch (err) {
      console.error("Failed to load more notifications:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [userInfo.authenticated, loadingMore, pagination]);

  /**
   * Transform raw notifications to resolved translations
   * This re-runs when language changes (strings updates)
   */
  const notifications = useMemo(() => {
    return rawNotifications.map((notification) => {
      // If notification has translation keys, resolve them
      if (notification.titleKey) {
        const rawTitle = get(strings, notification.titleKey, notification.titleKey);
        const rawBody = get(strings, notification.bodyKey, notification.bodyKey);

        return {
          ...notification,
          // Resolved title and body based on current language
          title: interpolateParams(rawTitle, notification.params),
          body: interpolateParams(rawBody, notification.params),
        };
      }

      // Legacy notification with hardcoded title/body
      return notification;
    });
  }, [rawNotifications, strings]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationsAsRead(notificationId);
      // Update local state
      setRawNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read using the backend API
  const markAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setRawNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Fetch notifications when user authenticates
  useEffect(() => {
    if (userInfo.authenticated) {
      fetchNotifications();
    } else {
      setRawNotifications([]);
      setUnreadCount(0);
    }
  }, [userInfo.authenticated, fetchNotifications]);

  // Set up polling interval
  useEffect(() => {
    if (!userInfo.authenticated) return;

    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [userInfo.authenticated, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    pagination,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easier access
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationProvider;
