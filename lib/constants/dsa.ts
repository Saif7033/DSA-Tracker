import { DifficultyType, PlatformType, ProblemStatusType } from "@/types/database.types";

export const DIFFICULTIES: readonly DifficultyType[] = ["Easy", "Medium", "Hard"] as const;

export const STATUSES: readonly ProblemStatusType[] = ["Unsolved", "Attempted", "Solved"] as const;

export const PLATFORMS: readonly PlatformType[] = [
  "LeetCode",
  "CodeChef",
  "HackerRank",
  "GeeksforGeeks",
  "Other",
] as const;

export const COMMON_TOPICS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
  "Matrix",
  "Design",
] as const;

export const COMMON_PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  "Fast & Slow Pointers",
  "Merge Intervals",
  "Cyclic Sort",
  "In-place Reversal of a LinkedList",
  "Tree BFS / Level Order",
  "Tree DFS / Pre/In/Postorder",
  "Two Heaps",
  "Subsets / Combinations",
  "Modified Binary Search",
  "Bitwise XOR",
  "Top 'K' Elements",
  "K-way Merge",
  "0/1 Knapsack",
  "Unbounded Knapsack",
  "Longest Common Subsequence",
  "Monotonic Stack",
  "Topological Sort",
  "Union Find / Disjoint Set",
  "Prefix Sum",
] as const;

export const COMMON_COMPLEXITIES = [
  "O(1)",
  "O(log N)",
  "O(N)",
  "O(N log N)",
  "O(N^2)",
  "O(2^N)",
  "O(N!)",
] as const;
