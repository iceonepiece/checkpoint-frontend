import { SupabaseClient } from "@supabase/supabase-js";

export function isFileObject(value: unknown): value is { type: "file" } {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "type" in value &&
        (value as { type: string }).type === "file"
    );
}

// NEW: Helper to check lock status from DB
export async function getLockStatus(
    supabase: SupabaseClient,
    repoId: number,
    path: string
) {
    const { data } = await supabase
        .from("files")
        .select(`
            lock_events (
                is_locked,
                github_id,
                created_at,
                user:users (username)
            )
        `)
        .eq("repo_id", repoId)
        .eq("path", path)
        .order("created_at", { foreignTable: "lock_events", ascending: false })
        .limit(1, { foreignTable: "lock_events" })
        .maybeSingle();

    if (!data || !data.lock_events || data.lock_events.length === 0) {
        return { isLocked: false, lockedByUserId: null, lockedByUsername: null };
    }

    const latest = data.lock_events[0];
    // @ts-expect-error username may not appear
    const username = latest.user?.username || "Unknown";

    return { 
        isLocked: latest.is_locked, 
        lockedByUserId: latest.github_id,
        lockedByUsername: username 
    };
}