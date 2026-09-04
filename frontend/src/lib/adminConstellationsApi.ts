import { adminApiFetch, readApiErrorBody } from "./api";
import type { Constellation } from "./constellationApi";

export async function fetchAdminConstellations(): Promise<Constellation[]> {
    const res = await adminApiFetch("/constellations", { method: "GET" });
    if (!res.ok) {
        throw new Error(await readApiErrorBody(res));
    }
    return res.json();
}

export async function generateAdminConstellation(payload: {
    domain: string;
    cefrLevel: string;
}): Promise<Constellation> {
    const res = await adminApiFetch("/constellations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error(await readApiErrorBody(res));
    }
    return res.json();
}

export async function deleteAdminConstellation(id: number): Promise<void> {
    const res = await adminApiFetch(`/constellations/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error(await readApiErrorBody(res));
    }
}