// Registration spam defense.
//
// Tuned against the bot signups seen Aug 2026: "<random-word> LLC" business
// names with high-entropy single-token contact names (e.g. "CZdHHczTLwXsQGiJtCYnTBn"),
// dot-abused gmail addresses, and every optional field filled.
//
// Design goal: catch those bots with ~zero false positives against real buyers.
// A real contact is either "First Last" (has a space) or a short real word
// ("Lolita", "Sloan", "Maggie"). None of those trip the checks below.

/**
 * A contact name is "gibberish" only when it is a single token (no spaces),
 * fairly long, AND shows a random-generator fingerprint: a lowercase letter
 * immediately followed by an uppercase one (mid-word caps), or a run of 5+
 * consonants. Real single-word names are short and pronounceable, so they pass.
 */
export function looksLikeGibberishName(raw: unknown): boolean {
  const name = (raw ?? '').toString().trim();
  if (!name) return false;
  // Real names almost always contain a space (First Last) — never gibberish here.
  if (/\s/.test(name)) return false;
  // Short single tokens are legitimate first names.
  if (name.length < 12) return false;
  // Mid-word capital: "hugxzpBEsFhNSIZtxX", "CZdHHczTLwXsQGiJtCYnTBn"
  if (/[a-z][A-Z]/.test(name)) return true;
  // Long consonant run: random strings rarely respect vowel spacing.
  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(name)) return true;
  return false;
}

/** True if the hidden honeypot field was filled — only bots do that. */
export function honeypotTripped(body: Record<string, unknown>): boolean {
  const hp = (body?.company_fax ?? '').toString().trim();
  return hp.length > 0;
}

/**
 * Full gate for a registration payload.
 * - honeypot: silently drop (pretend success) — bot never adapts.
 * - gibberish contact name: reject with a user-facing message.
 */
export function screenRegistration(body: Record<string, unknown>): {
  action: 'allow' | 'silent-drop' | 'reject';
  message?: string;
} {
  if (honeypotTripped(body)) return { action: 'silent-drop' };
  if (looksLikeGibberishName(body?.contact_name)) {
    return { action: 'reject', message: 'Please enter a valid contact name.' };
  }
  return { action: 'allow' };
}
