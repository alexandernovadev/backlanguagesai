export const calculateReadingTimeFromContent = (content: string): number => {
  const raw = content || "";
  if (!raw.trim()) return 0;

  // Sanitize simple markdown symbols for a more realistic word count
  const sanitized = raw.replace(/[>#*_`\-\[\]\(\)!]/g, " ");
  const words = sanitized.trim() ? sanitized.trim().split(/\s+/).length : 0;

  const wordsPerMinute = 200;
  const minutes = words > 0 ? Math.ceil(words / wordsPerMinute) : 0;

  // If there is content, enforce minimum 1 minute; otherwise 0
  return words > 0 ? Math.max(1, minutes) : 0;
};


