import { adminApiFetch, readApiErrorBody } from "./api";

export type AdminAvatarRow = {
  id: number;
  url: string;
  key: string;
  isActive: boolean;
  createdAt: string;
};

export async function fetchAdminAvatars(): Promise<AdminAvatarRow[]> {
  const res = await adminApiFetch("/avatars", { method: "GET" });
  if (!res.ok) {
    throw new Error(await readApiErrorBody(res));
  }
  return res.json();
}

export async function uploadAdminAvatar(file: File): Promise<AdminAvatarRow> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await adminApiFetch("/avatars/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await readApiErrorBody(res));
  }
  return res.json();
}

export async function toggleAdminAvatarStatus(
  id: number,
  isActive: boolean,
): Promise<AdminAvatarRow> {
  const res = await adminApiFetch(`/avatars/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    throw new Error(await readApiErrorBody(res));
  }
  return res.json();
}