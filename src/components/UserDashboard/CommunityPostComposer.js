import React, { useEffect, useRef, useState } from "react";
import { Modal, Avatar, message } from "antd";
import {
  UserOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { createPost } from "../../services/communityPosts";
import { getPhotoUploadUrl } from "../../services/customer";
import { getUserProfileInfo } from "../../services/users";

// Community post creator. A trigger card sits above the feed (avatar + a
// "Share your progress" pill + Photo / Video / Finished-challenge actions);
// clicking it opens the "Create Post" popup to write a post with optional
// photo or video. Reuses the same presigned-S3 upload flow as profile
// photos. On success it calls onPosted() so the feed can refresh.
export default function CommunityPostComposer({ userInfo, onPosted }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", avatar: "" });

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userInfo || !userInfo.id) return;
      const res = await getUserProfileInfo(userInfo.id);
      const c = res && res.customer;
      if (!cancelled && c) {
        setProfile({
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          avatar: c.avatar || "",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userInfo]);

  const firstName = profile.firstName || (userInfo && userInfo.username) || "";
  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    (userInfo && userInfo.username) ||
    "";

  const isVideoFile = file && file.type && file.type.startsWith("video");

  const clearImage = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
  };

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setTitle("");
    setText("");
    clearImage();
  };

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    // reset so re-picking the same file still fires onChange
    e.target.value = "";
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOpen(true);
  };

  // Open the popup AND the OS file picker together; if the user cancels the
  // picker, the composer popup stays open so they can still type.
  const openPicker = (ref) => {
    setOpen(true);
    if (ref.current) ref.current.click();
  };

  const uploadMedia = async (f) => {
    const { presignedUrl, fileUrl } = await getPhotoUploadUrl({
      filename: f.name,
      mimeType: f.type,
    });
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", f.type);
      xhr.onload = () =>
        xhr.status === 200 ? resolve() : reject(new Error("upload failed"));
      xhr.onerror = () => reject(new Error("upload failed"));
      xhr.send(f);
    });
    return fileUrl;
  };

  const submit = async () => {
    if (!title.trim()) {
      message.warning("Please add a title for your post.");
      return;
    }
    setSubmitting(true);
    try {
      let image = "";
      if (file) image = await uploadMedia(file);
      await createPost({ title: title.trim(), text: text.trim(), image });
      message.success("Posted to the community!");
      setOpen(false);
      setTitle("");
      setText("");
      clearImage();
      onPosted && onPosted();
    } catch (_) {
      message.error("Could not create your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avatarNode = (
    <Avatar
      shape="circle"
      src={profile.avatar || (userInfo && userInfo.avatar) || undefined}
      icon={<UserOutlined />}
      style={{ flexShrink: 0 }}
    />
  );

  const action = (icon, label, onClick) => (
    <button
      type="button"
      onClick={onClick}
      className="font-paragraph-white"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "15px",
        fontWeight: 600,
        color: "#fff",
        padding: "6px 10px",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* hidden inputs reused by both the trigger and the popup */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        style={{ display: "none" }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={onPick}
        style={{ display: "none" }}
      />

      {/* ── Trigger card ── */}
      <div
        style={{
          width: "100%",
          background: "#1B2531",
          border: "1px solid #2F3E50",
          borderRadius: "10px",
          padding: "16px 18px",
          marginBottom: "22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {avatarNode}
          <div
            onClick={() => setOpen(true)}
            className="font-paragraph-white"
            style={{
              flex: 1,
              background: "#0F151D",
              border: "1px solid #2F3E50",
              borderRadius: "24px",
              padding: "11px 18px",
              color: "#8e9298",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {firstName
              ? `Share your progress, ${firstName}…`
              : "Share your progress…"}
          </div>
        </div>

        <div
          style={{
            height: "1px",
            background: "#2F3E50",
            margin: "14px 0 6px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          {action(
            <PictureOutlined
              style={{ color: "var(--color-orange)", fontSize: "18px" }}
            />,
            "Photo",
            () => openPicker(photoInputRef)
          )}
          {action(
            <VideoCameraOutlined
              style={{ color: "#3B82F6", fontSize: "18px" }}
            />,
            "Video",
            () => openPicker(videoInputRef)
          )}
        </div>
      </div>

      {/* ── Create Post popup ── */}
      <Modal
        title={<div className="font-card-heading">Create Post</div>}
        visible={open}
        onCancel={close}
        footer={false}
        width="40%"
        bodyStyle={{ paddingTop: 0 }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}
        >
          {avatarNode}
          <span className="font-paragraph-white" style={{ fontWeight: 600 }}>
            {fullName}
          </span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title *"
          className="font-paragraph-white"
          style={{
            width: "100%",
            background: "#1D2631",
            border: "1px solid #2F3E50",
            borderRadius: "6px",
            color: "#fff",
            padding: "12px",
            fontSize: "16px",
            fontWeight: 600,
            outline: "none",
            marginBottom: "10px",
          }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            firstName
              ? `What's on your mind, ${firstName}? Share your win…`
              : "What's on your mind? Share your win…"
          }
          rows={5}
          className="font-paragraph-white"
          style={{
            width: "100%",
            background: "#1D2631",
            border: "1px solid #2F3E50",
            borderRadius: "6px",
            color: "#fff",
            padding: "12px",
            fontSize: "15px",
            resize: "vertical",
            outline: "none",
          }}
        />

        {preview ? (
          <div style={{ position: "relative", marginTop: "12px" }}>
            {isVideoFile ? (
              <video
                src={preview}
                controls
                style={{
                  width: "100%",
                  maxHeight: "280px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  display: "block",
                  background: "#000",
                }}
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "280px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  display: "block",
                }}
              />
            )}
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove media"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(0,0,0,0.55)",
                border: "none",
                color: "#fff",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseOutlined />
            </button>
            {file && file.name && (
              <div
                className="font-paragraph-white"
                style={{ fontSize: "13px", color: "#8e9298", marginTop: "6px" }}
              >
                {file.name}
              </div>
            )}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #2F3E50",
            borderRadius: "8px",
            padding: "10px 14px",
            marginTop: "16px",
          }}
        >
          <span className="font-paragraph-white" style={{ fontSize: "15px" }}>
            Add to your post
          </span>
          <span style={{ display: "inline-flex", gap: "14px" }}>
            <PictureOutlined
              onClick={() => openPicker(photoInputRef)}
              style={{ color: "var(--color-orange)", fontSize: "22px", cursor: "pointer" }}
            />
            <VideoCameraOutlined
              onClick={() => openPicker(videoInputRef)}
              style={{ color: "#3B82F6", fontSize: "22px", cursor: "pointer" }}
            />
          </span>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="font-paragraph-white"
          style={{
            width: "100%",
            background: "var(--color-orange)",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            padding: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
            marginTop: "16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {submitting ? <LoadingOutlined /> : null}
          Post
        </button>
      </Modal>
    </>
  );
}
