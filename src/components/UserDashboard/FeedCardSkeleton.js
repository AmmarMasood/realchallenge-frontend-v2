import React from "react";
import "./FeedCard.css";

/**
 * Loading placeholder for FeedCard. Mirrors the real card's structure
 * (avatar + name/time, cover, title/text, action pills) so the layout
 * doesn't shift when posts arrive. Used by the News Feed and Community tabs.
 */
export default function FeedCardSkeleton() {
  return (
    <div className="dashboard-feed-container-card" aria-hidden="true">
      <div className="dashboard-feed-container-card-row1">
        <div className="feed-skeleton-block feed-skeleton-avatar" />
        <div
          className="dashboard-feed-container-card-row1-col2"
          style={{ gap: 8 }}
        >
          <div
            className="feed-skeleton-block feed-skeleton-line"
            style={{ width: 120 }}
          />
          <div
            className="feed-skeleton-block feed-skeleton-line"
            style={{ width: 80, height: 10 }}
          />
        </div>
      </div>

      <div
        className="feed-skeleton-block feed-skeleton-cover"
        style={{ marginTop: 10 }}
      />

      <div className="dashboard-feed-container-card-row3">
        <div
          className="feed-skeleton-block feed-skeleton-line"
          style={{ width: "70%", height: 20, marginBottom: 10 }}
        />
        <div className="feed-skeleton-block feed-skeleton-line" />
        <div
          className="feed-skeleton-block feed-skeleton-line"
          style={{ width: "85%", marginTop: 6 }}
        />
      </div>

      <div className="dashboard-feed-container-card-row4">
        <div className="feed-skeleton-block feed-skeleton-pill" />
        <div className="feed-skeleton-block feed-skeleton-pill" />
      </div>
    </div>
  );
}
