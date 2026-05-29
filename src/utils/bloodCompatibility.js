export const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Can donorBlood donate to recipientBlood?
export const canDonateTo = (donor, recipient) => {
  if (donor === recipient) return true;
  if (donor === "O-") return true;
  if (donor === "O+" && recipient !== "A-" && recipient !== "B-" && recipient !== "AB-") return true;
  if (donor === "A+" && (recipient === "A+" || recipient === "AB+")) return true;
  if (donor === "B+" && (recipient === "B+" || recipient === "AB+")) return true;
  if (donor === "AB+") return recipient === "AB+";
  if (donor === "A-") return recipient.includes("A") || recipient === "AB+";
  if (donor === "B-") return recipient.includes("B") || recipient === "AB+";
  if (donor === "AB-") return recipient === "AB+" || recipient === "AB-";
  return false;
};

// For display: which recipients can this donor help?
export const compatibleWith = (donor) => {
  const all = bloodTypes.filter(bt => canDonateTo(donor, bt));
  if (all.length === bloodTypes.length) return "يمكنك التبرع للجميع";
  if (all.length === 0) return "لا يمكنك التبرع لأحد";
  return `يمكنك التبرع لـ: ${all.join(", ")}`;
};
