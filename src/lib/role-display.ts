export function displayRole(role?: string | null): string {
  if (!role) {
    return "Unknown";
  }

  const normalized = role.trim().toLowerCase();
  if (normalized === "lawyer") {
    return "Judge";
  }
  if (normalized === "lawyer_analysis") {
    return "Judge FIR Review";
  }

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function sanitizeRoleText(text?: string | null): string {
  if (!text) {
    return "";
  }

  return text
    .replace(/\blawyers\b/gi, "judges")
    .replace(/\blawyer analysis\b/gi, "judge FIR review")
    .replace(/\blawyer dashboard\b/gi, "judge dashboard")
    .replace(/\blawyer profile\b/gi, "judge profile")
    .replace(/\blawyer access\b/gi, "judge access")
    .replace(/\blawyer\b/gi, "judge");
}
