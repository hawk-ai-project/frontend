"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";

export default function UserAvatar({ user, fallback = "U", adminUserId = null }) {
  const [imageUrl, setImageUrl] = useState(null);
  const profileFileId = user?.profileFileId;
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || fallback;

  useEffect(() => {
    if (!profileFileId) return undefined;
    let active = true;
    let objectUrl;
    const request = adminUserId
      ? adminService.getUserProfileImage(adminUserId)
      : authService.getProfileImage();
    request.then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    }).catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profileFileId, adminUserId]);

  return <div className="avatar" aria-hidden="true">
    {profileFileId && imageUrl
      ? <Image src={imageUrl} alt="" fill sizes="32px" unoptimized />
      : initial}
  </div>;
}
