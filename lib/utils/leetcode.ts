/**
 * LeetCode URL Parser Utility
 * Extracts problem title from LeetCode URL
 */

export interface LeetCodeProblemData {
  title: string;
  slug: string;
  platform: "LeetCode";
}

/**
 * Parse LeetCode URL and extract problem metadata
 * Examples:
 * - https://leetcode.com/problems/two-sum/
 * - https://leetcode.com/problems/two-sum
 * - https://leetcode.com/problems/two-sum/description/
 * 
 * @param url - LeetCode problem URL
 * @returns Parsed problem data or null if invalid
 */
export function parseLeetCodeUrl(url: string): LeetCodeProblemData | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Check if it's a valid LeetCode URL
    if (!url.includes("leetcode.com/problems/")) {
      return null;
    }

    // Extract the slug from the URL
    // Pattern: /problems/{slug}/ or /problems/{slug}
    const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (!match || !match[1]) {
      return null;
    }

    const slug = match[1];

    // Convert slug to title
    // Example: "two-sum" -> "Two Sum"
    const title = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      title,
      slug,
      platform: "LeetCode",
    };
  } catch {
    return null;
  }
}

/**
 * Validate if a URL is a LeetCode problem URL
 * @param url - URL to validate
 * @returns true if valid LeetCode URL
 */
export function isValidLeetCodeUrl(url: string): boolean {
  return parseLeetCodeUrl(url) !== null;
}
