export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatDateTime = (date) =>
  `${formatDate(date)} ${formatTime(date)}`;