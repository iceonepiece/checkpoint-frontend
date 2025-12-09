export function isFileObject(value: unknown): value is { type: "file" } {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "type" in value &&
        (value as { type: string }).type === "file"
    );
}