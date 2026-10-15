type FormatTypes = "time" | "percent" | "angle";

export function getFormattedValue(type: FormatTypes, value: number) {
    if (value === null || value === undefined) return "";

    switch (type) {
        case "time":
            return new Intl.DateTimeFormat("default", {
                hour: "2-digit",
                minute: "2-digit",
            }).format(value);

        case "percent":
            return `${Math.round(value * 100)}%`;

        case "angle":
            return `${+value.toFixed(2)}°`;

        default:
            return value;
    }
}
