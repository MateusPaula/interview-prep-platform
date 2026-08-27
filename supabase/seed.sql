insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Two Sum', 'arrays', 'easy', $md$
Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Exactly one pair adds up to the target, and you may not use the same element twice. Return the indices in ascending order.

### Example 1

```
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9.
```

### Example 2

```
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
Explanation: nums[1] + nums[2] = 2 + 4 = 6. Using nums[0] twice is not allowed.
```

## Constraints

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- Exactly one valid answer exists.
$md$, $ts$
export function twoSum(nums: number[], target: number): [number, number] {
  return [-1, -1];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Merge Intervals', 'arrays', 'medium', $md$
Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals and return an array of non-overlapping intervals that covers exactly the same ranges, sorted by start.

### Example 1

```
Input: intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]
Output: [[1, 6], [8, 10], [15, 18]]
Explanation: [1, 3] and [2, 6] overlap, so they merge into [1, 6].
```

### Example 2

```
Input: intervals = [[1, 4], [4, 5]]
Output: [[1, 5]]
Explanation: Intervals that touch at a boundary are considered overlapping.
```

## Constraints

- `1 <= intervals.length <= 10^4`
- `0 <= start <= end <= 10^5`
- The input is not necessarily sorted.
$md$, $ts$
export function mergeIntervals(
  intervals: Array<[number, number]>,
): Array<[number, number]> {
  return [];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Valid Anagram', 'strings', 'easy', $md$
Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An anagram uses exactly the same characters with exactly the same frequencies, in any order.

### Example 1

```
Input: s = "anagram", t = "nagaram"
Output: true
Explanation: Both strings contain three a's, one n, one g, one r and one m.
```

### Example 2

```
Input: s = "rat", t = "car"
Output: false
Explanation: t contains a c that never appears in s.
```

## Constraints

- `1 <= s.length, t.length <= 5 * 10^4`
- `s` and `t` consist of lowercase English letters.
$md$, $ts$
export function isAnagram(s: string, t: string): boolean {
  return false;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Group Anagrams', 'strings', 'medium', $md$
Given an array of strings, group the anagrams together and return the groups. Groups and the strings inside a group may be returned in any order.

### Example 1

```
Input: words = ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
Explanation: "eat", "tea" and "ate" all use the letters a, e, t exactly once.
```

### Example 2

```
Input: words = ["a"]
Output: [["a"]]
Explanation: A single string forms its own group.
```

## Constraints

- `1 <= words.length <= 10^4`
- `0 <= words[i].length <= 100`
- `words[i]` consists of lowercase English letters.
$md$, $ts$
export function groupAnagrams(words: string[]): string[][] {
  return [];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('First Unique Character', 'hash-maps', 'easy', $md$
Given a string `s`, return the index of the first character that appears exactly once in the whole string. If no such character exists, return `-1`.

### Example 1

```
Input: s = "leetcode"
Output: 0
Explanation: The l at index 0 never appears again.
```

### Example 2

```
Input: s = "loveleetcode"
Output: 2
Explanation: l, o and e all repeat; the v at index 2 is the first character that occurs once.
```

## Constraints

- `1 <= s.length <= 10^5`
- `s` consists of lowercase English letters.
$md$, $ts$
export function firstUniqueChar(s: string): number {
  return -1;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Substring with Concatenation of All Words', 'hash-maps', 'hard', $md$
You are given a string `s` and an array `words` in which every word has the same length. Return the starting indices of every substring of `s` that is exactly a concatenation of all the words, each used exactly once, in any order and with no characters in between. Return the indices in any order.

### Example 1

```
Input: s = "barfoothefoobarman", words = ["foo", "bar"]
Output: [0, 9]
Explanation: The substring at index 0 is "barfoo" and the substring at index 9 is "foobar"; both are permutations of the words.
```

### Example 2

```
Input: s = "wordgoodgoodgoodbestword", words = ["word", "good", "best", "word"]
Output: []
Explanation: "word" must appear twice in the window, but no window contains all four words exactly.
```

## Constraints

- `1 <= s.length <= 10^4`
- `1 <= words.length <= 5000`
- `1 <= words[i].length <= 30`
- All words have the same length.
$md$, $ts$
export function findSubstring(s: string, words: string[]): number[] {
  return [];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Valid Palindrome', 'two-pointers', 'easy', $md$
Given a string `s`, return `true` if it is a palindrome after converting all uppercase letters to lowercase and removing every character that is not a letter or a digit, and `false` otherwise.

### Example 1

```
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: After cleaning, the string is "amanaplanacanalpanama", which reads the same in both directions.
```

### Example 2

```
Input: s = "race a car"
Output: false
Explanation: After cleaning, the string is "raceacar", which is not a palindrome.
```

## Constraints

- `1 <= s.length <= 2 * 10^5`
- `s` consists of printable ASCII characters.
$md$, $ts$
export function isPalindrome(s: string): boolean {
  return false;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Container With Most Water', 'two-pointers', 'medium', $md$
You are given an array `heights` where `heights[i]` is the height of a vertical line drawn at position `i`. Choose two lines that, together with the x-axis, form a container holding the most water, and return that maximum area. The container may not be slanted.

### Example 1

```
Input: heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
Explanation: The lines at indices 1 and 8 give min(8, 7) * (8 - 1) = 49.
```

### Example 2

```
Input: heights = [1, 1]
Output: 1
Explanation: min(1, 1) * (1 - 0) = 1.
```

## Constraints

- `2 <= heights.length <= 10^5`
- `0 <= heights[i] <= 10^4`
$md$, $ts$
export function maxArea(heights: number[]): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Longest Substring Without Repeating Characters', 'sliding-window', 'medium', $md$
Given a string `s`, return the length of the longest substring that contains no repeated characters. A substring is a contiguous sequence of characters.

### Example 1

```
Input: s = "abcabcbb"
Output: 3
Explanation: The longest substring without repeats is "abc".
```

### Example 2

```
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke". "pwke" is a subsequence, not a substring.
```

## Constraints

- `0 <= s.length <= 5 * 10^4`
- `s` consists of English letters, digits, symbols and spaces.
$md$, $ts$
export function lengthOfLongestSubstring(s: string): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Minimum Window Substring', 'sliding-window', 'hard', $md$
Given strings `s` and `t`, return the smallest substring of `s` that contains every character of `t`, including duplicates. If no such substring exists, return the empty string. The answer is guaranteed to be unique.

### Example 1

```
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: "BANC" is the shortest window containing A, B and C.
```

### Example 2

```
Input: s = "a", t = "aa"
Output: ""
Explanation: The window must contain two a's, but s only has one.
```

## Constraints

- `1 <= s.length, t.length <= 10^5`
- `s` and `t` consist of uppercase and lowercase English letters.
$md$, $ts$
export function minWindow(s: string, t: string): string {
  return "";
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Valid Parentheses', 'stacks-queues', 'easy', $md$
Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, return `true` if the brackets are balanced: every opening bracket is closed by the same type of bracket, in the correct order, and every closing bracket has a matching opener.

### Example 1

```
Input: s = "()[]{}"
Output: true
Explanation: Each pair opens and closes in order.
```

### Example 2

```
Input: s = "(]"
Output: false
Explanation: The ( is closed by ] which is the wrong type.
```

## Constraints

- `1 <= s.length <= 10^4`
- `s` consists only of the six bracket characters.
$md$, $ts$
export function isValidParentheses(s: string): boolean {
  return false;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Daily Temperatures', 'stacks-queues', 'medium', $md$
Given an array `temperatures` of daily temperatures, return an array `answer` where `answer[i]` is the number of days you have to wait after day `i` to reach a warmer temperature. If no warmer day ever comes, set `answer[i] = 0`.

### Example 1

```
Input: temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
Output: [1, 1, 4, 2, 1, 1, 0, 0]
Explanation: From day 2 (75), the next warmer day is day 6 (76), four days later.
```

### Example 2

```
Input: temperatures = [30, 40, 50, 60]
Output: [1, 1, 1, 0]
Explanation: Each day is immediately followed by a warmer one, except the last.
```

## Constraints

- `1 <= temperatures.length <= 10^5`
- `30 <= temperatures[i] <= 100`
$md$, $ts$
export function dailyTemperatures(temperatures: number[]): number[] {
  return [];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Reverse Linked List', 'linked-lists', 'easy', $md$
Given the head of a singly linked list, reverse the list and return the new head.

### Example 1

```
Input: head = 1 -> 2 -> 3 -> 4 -> 5
Output: 5 -> 4 -> 3 -> 2 -> 1
Explanation: Every next pointer is flipped to point at the previous node.
```

### Example 2

```
Input: head = null
Output: null
Explanation: The empty list reversed is still the empty list.
```

## Constraints

- The list has between 0 and 5000 nodes.
- `-5000 <= value <= 5000`
- Aim for O(1) extra space.
$md$, $ts$
export interface ListNode {
  value: number;
  next: ListNode | null;
}

export function reverseList(head: ListNode | null): ListNode | null {
  return null;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Merge K Sorted Lists', 'linked-lists', 'hard', $md$
You are given an array of `k` linked lists, each sorted in ascending order. Merge all of them into one sorted linked list and return its head.

### Example 1

```
Input: lists = [1 -> 4 -> 5, 1 -> 3 -> 4, 2 -> 6]
Output: 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6
Explanation: All three lists are interleaved into one sorted list.
```

### Example 2

```
Input: lists = []
Output: null
Explanation: There is nothing to merge.
```

## Constraints

- `0 <= k <= 10^4`
- The total number of nodes across all lists does not exceed 10^4.
- Each individual list is sorted in ascending order.
$md$, $ts$
export interface ListNode {
  value: number;
  next: ListNode | null;
}

export function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  return null;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Maximum Depth of Binary Tree', 'trees', 'easy', $md$
Given the root of a binary tree, return its maximum depth: the number of nodes on the longest path from the root down to a leaf.

### Example 1

```
Input: root = [3, 9, 20, null, null, 15, 7]
Output: 3
Explanation: The longest path is 3 -> 20 -> 15 (or 3 -> 20 -> 7), which has three nodes.
```

### Example 2

```
Input: root = null
Output: 0
Explanation: An empty tree has depth 0.
```

## Constraints

- The tree has between 0 and 10^4 nodes.
- `-100 <= value <= 100`
$md$, $ts$
export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function maxDepth(root: TreeNode | null): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Binary Tree Maximum Path Sum', 'trees', 'hard', $md$
A path in a binary tree is any sequence of nodes where each adjacent pair is connected by an edge, and a node appears at most once. The path does not need to pass through the root. Given the root of a binary tree, return the maximum sum of node values over all non-empty paths.

### Example 1

```
Input: root = [1, 2, 3]
Output: 6
Explanation: The path 2 -> 1 -> 3 sums to 6.
```

### Example 2

```
Input: root = [-10, 9, 20, null, null, 15, 7]
Output: 42
Explanation: The best path is 15 -> 20 -> 7 with sum 42; including -10 only hurts.
```

## Constraints

- The tree has between 1 and 3 * 10^4 nodes.
- `-1000 <= value <= 1000`
$md$, $ts$
export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function maxPathSum(root: TreeNode): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Course Schedule', 'graphs', 'medium', $md$
There are `numCourses` courses labeled from `0` to `numCourses - 1`. Each prerequisite pair `[a, b]` means you must take course `b` before course `a`. Return `true` if it is possible to finish all courses, and `false` otherwise.

### Example 1

```
Input: numCourses = 2, prerequisites = [[1, 0]]
Output: true
Explanation: Take course 0 first, then course 1.
```

### Example 2

```
Input: numCourses = 2, prerequisites = [[1, 0], [0, 1]]
Output: false
Explanation: The two courses require each other, forming a cycle.
```

## Constraints

- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- All prerequisite pairs are distinct.
$md$, $ts$
export function canFinish(
  numCourses: number,
  prerequisites: Array<[number, number]>,
): boolean {
  return false;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Word Ladder', 'graphs', 'hard', $md$
Given two words `beginWord` and `endWord` and a dictionary `wordList`, return the length of the shortest transformation sequence from `beginWord` to `endWord` such that each step changes exactly one letter and every intermediate word is in the dictionary. Return `0` if no sequence exists. `beginWord` does not need to be in the dictionary; the sequence length counts every word including both endpoints.

### Example 1

```
Input: beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log", "cog"]
Output: 5
Explanation: hit -> hot -> dot -> dog -> cog has five words.
```

### Example 2

```
Input: beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log"]
Output: 0
Explanation: cog is not in the dictionary, so no sequence can end there.
```

## Constraints

- `1 <= beginWord.length <= 10`
- All words have the same length and consist of lowercase English letters.
- `1 <= wordList.length <= 5000`
$md$, $ts$
export function ladderLength(
  beginWord: string,
  endWord: string,
  wordList: string[],
): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Binary Search', 'binary-search', 'easy', $md$
Given a sorted array of distinct integers `nums` and a `target`, return the index of `target` if it exists, or `-1` otherwise. Your solution must run in O(log n) time.

### Example 1

```
Input: nums = [-1, 0, 3, 5, 9, 12], target = 9
Output: 4
Explanation: 9 is at index 4.
```

### Example 2

```
Input: nums = [-1, 0, 3, 5, 9, 12], target = 2
Output: -1
Explanation: 2 is not in the array.
```

## Constraints

- `1 <= nums.length <= 10^4`
- `-10^4 <= nums[i], target <= 10^4`
- `nums` is sorted in ascending order with unique values.
$md$, $ts$
export function binarySearch(nums: number[], target: number): number {
  return -1;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Median of Two Sorted Arrays', 'binary-search', 'hard', $md$
Given two sorted arrays `nums1` and `nums2`, return the median of the combined sorted data. The overall run time must be O(log (m + n)).

### Example 1

```
Input: nums1 = [1, 3], nums2 = [2]
Output: 2
Explanation: The merged array is [1, 2, 3] and its median is 2.
```

### Example 2

```
Input: nums1 = [1, 2], nums2 = [3, 4]
Output: 2.5
Explanation: The merged array is [1, 2, 3, 4] and the median is (2 + 3) / 2 = 2.5.
```

## Constraints

- `0 <= nums1.length, nums2.length <= 1000`
- `1 <= nums1.length + nums2.length <= 2000`
- `-10^6 <= values <= 10^6`
$md$, $ts$
export function findMedianSortedArrays(
  nums1: number[],
  nums2: number[],
): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Subsets', 'recursion-backtracking', 'medium', $md$
Given an array `nums` of unique integers, return all possible subsets (the power set). The result must not contain duplicate subsets and may be returned in any order.

### Example 1

```
Input: nums = [1, 2, 3]
Output: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
Explanation: Every element is either included or excluded, giving 2^3 = 8 subsets.
```

### Example 2

```
Input: nums = [0]
Output: [[], [0]]
Explanation: The power set of a single element has two subsets.
```

## Constraints

- `1 <= nums.length <= 10`
- `-10 <= nums[i] <= 10`
- All values in `nums` are unique.
$md$, $ts$
export function subsets(nums: number[]): number[][] {
  return [];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('N-Queens', 'recursion-backtracking', 'hard', $md$
Place `n` queens on an `n x n` chessboard so that no two queens attack each other, and return all distinct solutions. Each solution is a board drawn as `n` strings where `Q` marks a queen and `.` marks an empty square. Queens attack along rows, columns and both diagonals.

### Example 1

```
Input: n = 4
Output: [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]
Explanation: The 4-queens puzzle has exactly two distinct solutions.
```

### Example 2

```
Input: n = 1
Output: [["Q"]]
Explanation: A single queen on a 1 x 1 board attacks nothing.
```

## Constraints

- `1 <= n <= 9`
$md$, $ts$
export function solveNQueens(n: number): string[][] {
  return [];
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Climbing Stairs', 'dynamic-programming', 'easy', $md$
You are climbing a staircase with `n` steps. Each move you climb either 1 or 2 steps. Return the number of distinct ways to reach the top.

### Example 1

```
Input: n = 2
Output: 2
Explanation: 1 + 1 or 2.
```

### Example 2

```
Input: n = 3
Output: 3
Explanation: 1 + 1 + 1, 1 + 2 or 2 + 1.
```

## Constraints

- `1 <= n <= 45`
$md$, $ts$
export function climbStairs(n: number): number {
  return 0;
}
$ts$);

insert into public.challenges (title, topic, difficulty, prompt, starter_code) values
('Coin Change', 'dynamic-programming', 'medium', $md$
You are given coin denominations `coins` and a total `amount`. Return the fewest number of coins needed to make up that amount, or `-1` if it cannot be made. You have an unlimited supply of each coin.

### Example 1

```
Input: coins = [1, 2, 5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1.
```

### Example 2

```
Input: coins = [2], amount = 3
Output: -1
Explanation: No combination of 2s sums to 3.
```

## Constraints

- `1 <= coins.length <= 12`
- `1 <= coins[i] <= 2^31 - 1`
- `0 <= amount <= 10^4`
$md$, $ts$
export function coinChange(coins: number[], amount: number): number {
  return -1;
}
$ts$);

insert into public.behavioral_questions (category, question) values
('teamwork', $q$Tell me about a time you had to collaborate closely with someone whose working style was very different from yours. How did you make the partnership productive?$q$),
('teamwork', $q$Describe a situation where your team was falling behind on a commitment. What did you personally do to help the team recover?$q$),
('teamwork', $q$Tell me about a time you had to explain a complex technical topic to non-technical stakeholders. How did you make sure they truly understood?$q$),
('leadership', $q$Tell me about a time you led a project or initiative without having formal authority over the people involved.$q$),
('leadership', $q$Describe a situation where you saw a problem nobody owned and took responsibility for fixing it end to end.$q$),
('leadership', $q$Tell me about a time you had to make an unpopular decision. How did you communicate it and bring people along?$q$),
('conflict', $q$Tell me about a strong technical disagreement you had with a teammate. How did you resolve it, and what was the outcome?$q$),
('conflict', $q$Describe a time you received criticism you felt was unfair. How did you respond in the moment and afterwards?$q$),
('conflict', $q$Tell me about a time you had to push back on a deadline or scope set by leadership. How did you handle the conversation?$q$),
('failure', $q$Tell me about a time you shipped something that broke in production. What happened, and what did you change afterwards?$q$),
('failure', $q$Describe a project that failed or was cancelled. What was your role, and what did you learn from it?$q$),
('failure', $q$Tell me about a time you missed a commitment you had made. How did you handle it with the people counting on you?$q$),
('growth', $q$Tell me about a skill you deliberately set out to learn recently. How did you approach it, and how did you measure progress?$q$),
('growth', $q$Describe the most useful piece of feedback you have ever received. What did you do with it?$q$),
('growth', $q$Tell me about a time you realized your initial approach to a problem was wrong. How did you course-correct?$q$);
