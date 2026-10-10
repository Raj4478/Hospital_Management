export const titleCase = (s = "") =>
  String(s).replace(/_/g, " ").replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—";

export function timeAgo(d) {
  if (!d) return "";
  const secs = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDate(d);
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const MEAL_SLOTS = ["morning", "evening", "night"];

export const DELIVERY_STATUS = {
  pending: { label: "Pending", tone: "slate" },
  preparing: { label: "Preparing", tone: "amber" },
  out_for_delivery: { label: "Out for delivery", tone: "blue" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const NEXT_STATUS = {
  pending: { status: "preparing", label: "Start preparing" },
  preparing: { status: "out_for_delivery", label: "Send out" },
  out_for_delivery: { status: "delivered", label: "Mark delivered" },
};

export const STAFF_STATUS = {
  available: { label: "Available", tone: "green" },
  busy: { label: "On delivery", tone: "amber" },
  off_duty: { label: "Off duty", tone: "slate" },
};
