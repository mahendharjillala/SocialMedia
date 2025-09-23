/**
 * Utility function to get the full image URL
 * @param url - The image URL (can be relative or absolute)
 * @returns The full image URL
 */
export const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:8084${url}`;
};
