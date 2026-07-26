// Consistent DD/MM/YYYY formatting across the whole site.
export function formatDate(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export function formatDateTime(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d)) return "";
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${formatDate(d)}, ${time}`;
}
