import React, { useState, useEffect, useRef } from 'react';

const PROBLEMS = [
  {
    id: 'custom',
    title: '0. Custom Sandbox / Free Coding',
    difficulty: 'Sandbox',
    description: `Write and test your own custom code in any supported programming language. Use the Custom Input (stdin) tab below to pass input arguments to your program.`,
    input: ``,
    templates: {
      python: `# Write your own Python code here\nprint("Hello World!")`,
      java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}`,
      sql: `-- Query against employees / departments tables\nSELECT * FROM employees;`
    }
  },
  {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.<br/><br/>You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    input: `[2, 7, 11, 15]\n9`,
    templates: {
      python: `def two_sum(nums, target):
    # Write your Python 3 code here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Driver code to test input
import sys
import json
lines = sys.stdin.read().split('\\n')
if len(lines) >= 2:
    nums = json.loads(lines[0].strip())
    target = int(lines[1].strip())
    print(two_sum(nums, target))`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your Java code here
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line1 = reader.readLine();
        String line2 = reader.readLine();
        if (line1 != null && line2 != null) {
            String cleaned = line1.replace("[", "").replace("]", "").trim();
            String[] tokens = cleaned.split(",");
            int[] nums = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                nums[i] = Integer.parseInt(tokens[i].trim());
            }
            int target = Integer.parseInt(line2.trim());
            int[] res = twoSum(nums, target);
            System.out.println("[" + res[0] + ", " + res[1] + "]");
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
#include <sstream>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your C++ code here
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (seen.count(diff)) {
            return {seen[diff], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {
        vector<int> nums;
        stringstream ss(line1);
        char ch;
        int val;
        ss >> ch; // Consume '['
        while (ss >> val) {
            nums.push_back(val);
            ss >> ch; // Consume ',' or ']'
        }
        int target = stoi(line2);
        vector<int> res = twoSum(nums, target);
        cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    }
    return 0;
}`,
      sql: `-- Select all columns from employees
SELECT * FROM employees;`
    }
  },
  {
    id: 'palindrome',
    title: '2. Palindrome Check',
    difficulty: 'Easy',
    description: `Given a string <code>s</code>, return <code>true</code> if it is a palindrome, and <code>false</code> otherwise.<br/><br/>A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward.`,
    input: `racecar`,
    templates: {
      python: `def is_palindrome(s):
    # Write your Python 3 code here
    return s == s[::-1]

import sys
s = sys.stdin.read().strip()
print(str(is_palindrome(s)).lower())`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static boolean isPalindrome(String s) {
        // Write your Java code here
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line = reader.readLine();
        if (line != null) {
            System.out.println(isPalindrome(line.trim()));
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

bool isPalindrome(string s) {
    // Write your C++ code here
    string rev = s;
    reverse(rev.begin(), rev.end());
    return s == rev;
}

int main() {
    string line;
    if (getline(cin, line)) {
        cout << (isPalindrome(line) ? "true" : "false") << endl;
    }
    return 0;
}`,
      sql: `-- SQL query cannot solve a general string palindrome check directly in this sandbox.
-- Switch to Python, C++, or Java, or write an employee query!
SELECT 'Use Python, C++, or Java for Palindrome Check!' as message;`
    }
  },
  {
    id: 'sql-2nd-salary',
    title: '3. SQL: 2nd Highest Salary',
    difficulty: 'Medium',
    description: `Write a SQL query to find the second highest salary from the <code>employees</code> table.<br/><br/>If there is no second highest salary, the query should return <code>NULL</code>.`,
    input: ``,
    templates: {
      sql: `-- Write your SQL query here.
SELECT MAX(salary) AS SecondHighestSalary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);`,
      python: `# Use SQL language for this database challenge!
print("Please select SQL language to run database queries.")`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Please select SQL language to run database queries.");
    }
}`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    cout << "Please select SQL language to run database queries." << endl;
    return 0;
}`
    }
  },
  {
    id: 'sql-dept-salary',
    title: '4. SQL: Department Salaries',
    difficulty: 'Medium',
    description: `Write a SQL query to calculate the total salary spent per department.<br/><br/>Return the department name and the total salary, sorted in descending order of total salary.`,
    input: ``,
    templates: {
      sql: `-- Write your SQL query here
SELECT d.department_name, SUM(e.salary) AS total_spending
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
GROUP BY d.department_name
ORDER BY total_spending DESC;`,
      python: `# Use SQL language for this database challenge!
print("Please select SQL language to run database queries.")`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Please select SQL language to run database queries.");
    }
}`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    cout << "Please select SQL language to run database queries." << endl;
    return 0;
}`
    }
  }
];

const highlightCode = (codeText, lang) => {
  if (!codeText) return '';
  let escaped = codeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let tokenRegex;
  if (lang === 'python') {
    tokenRegex = /(#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  } else if (lang === 'java' || lang === 'cpp') {
    tokenRegex = /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  } else if (lang === 'sql') {
    tokenRegex = /(--.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  } else {
    tokenRegex = /(\b\w+\b|[^\s\w]+|\s+)/g;
  }

  const pythonKeywords = new Set(['def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for', 'in', 'while', 'try', 'except', 'pass', 'print', 'and', 'or', 'not', 'is', 'lambda', 'with', 'yield', 'None', 'True', 'False']);
  const cppKeywords = new Set(['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'package', 'return', 'if', 'else', 'for', 'while', 'do', 'void', 'int', 'double', 'float', 'char', 'boolean', 'long', 'static', 'final', 'new', 'this', 'super', 'override', 'include', 'using', 'namespace', 'cout', 'cin', 'endl', 'vector', 'unordered_map', 'string', 'const', 'virtual']);
  const sqlKeywords = new Set(['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'SUM', 'MAX', 'MIN', 'AVG', 'COUNT', 'AS', 'AND', 'OR', 'IN', 'INSERT', 'INTO', 'VALUES', 'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES']);

  const tokens = escaped.match(tokenRegex) || [escaped];
  
  return tokens.map(token => {
    const rawToken = token
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    if (rawToken.startsWith('#') || rawToken.startsWith('//') || rawToken.startsWith('--')) {
      return `<span style="color: #64748b; font-style: italic;">${token}</span>`;
    }
    if ((rawToken.startsWith('"') && rawToken.endsWith('"')) || (rawToken.startsWith("'") && rawToken.endsWith("'"))) {
      return `<span style="color: #a7f3d0;">${token}</span>`;
    }
    if (/^\d+$/.test(rawToken)) {
      return `<span style="color: #f59e0b;">${token}</span>`;
    }
    if (lang === 'python' && pythonKeywords.has(rawToken)) {
      return `<span style="color: #60a5fa; font-weight: 700;">${token}</span>`;
    }
    if ((lang === 'java' || lang === 'cpp') && cppKeywords.has(rawToken)) {
      return `<span style="color: #60a5fa; font-weight: 700;">${token}</span>`;
    }
    if (lang === 'sql') {
      const upperToken = rawToken.toUpperCase();
      if (sqlKeywords.has(upperToken)) {
        return `<span style="color: #38bdf8; font-weight: 700;">${token}</span>`;
      }
    }
    return token;
  }).join('');
};


const getVisibleCode = (fullCode) => {
  if (!fullCode) return '';
  
  const startMarker = '# -- HIDE DRIVER CODE START --';
  const endMarker = '# -- HIDE DRIVER CODE END --';
  const javaCppStartMarker = '// -- HIDE DRIVER CODE START --';
  const javaCppEndMarker = '// -- HIDE DRIVER CODE END --';
  
  if (fullCode.includes(startMarker) && fullCode.includes(endMarker)) {
    const parts = fullCode.split(startMarker);
    const endParts = parts[1].split(endMarker);
    return (parts[0] + (endParts[1] || '')).trim();
  }
  
  if (fullCode.includes(javaCppStartMarker) && fullCode.includes(javaCppEndMarker)) {
    const parts = fullCode.split(javaCppStartMarker);
    const endParts = parts[1].split(javaCppEndMarker);
    return (parts[0] + (endParts[1] || '')).trim();
  }
  
  return fullCode;
};

const getHiddenDriverCode = (originalTemplate) => {
  if (!originalTemplate) return null;
  const startMarker = '# -- HIDE DRIVER CODE START --';
  const endMarker = '# -- HIDE DRIVER CODE END --';
  const javaCppStartMarker = '// -- HIDE DRIVER CODE START --';
  const javaCppEndMarker = '// -- HIDE DRIVER CODE END --';
  
  if (originalTemplate.includes(startMarker) && originalTemplate.includes(endMarker)) {
    const parts = originalTemplate.split(startMarker);
    const endParts = parts[1].split(endMarker);
    return {
      startMarker,
      endMarker,
      hiddenContent: endParts[0]
    };
  }
  if (originalTemplate.includes(javaCppStartMarker) && originalTemplate.includes(javaCppEndMarker)) {
    const parts = originalTemplate.split(javaCppStartMarker);
    const endParts = parts[1].split(javaCppEndMarker);
    return {
      startMarker: javaCppStartMarker,
      endMarker: javaCppEndMarker,
      hiddenContent: endParts[0]
    };
  }
  return null;
};

const reconstructFullCode = (userEditedCode, originalTemplate) => {
  const driverInfo = getHiddenDriverCode(originalTemplate);
  if (!driverInfo) return userEditedCode;
  
  const { startMarker, endMarker, hiddenContent } = driverInfo;
  
  if (originalTemplate.includes('public class Main')) {
    const lastBraceIndex = userEditedCode.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      return userEditedCode.substring(0, lastBraceIndex) + 
             "\n\n  " + startMarker + hiddenContent + endMarker + "\n" + 
             userEditedCode.substring(lastBraceIndex);
    }
  }
  
  return userEditedCode + "\n\n" + startMarker + hiddenContent + endMarker;
};


export default function Playground({ questions }) {
  const activeQuestions = (questions && questions.length > 0) ? questions : PROBLEMS;
  const [activeProblem, setActiveProblem] = useState(activeQuestions[0]);
  const [activeLang, setActiveLang] = useState('python');
  const [code, setCode] = useState(getVisibleCode(activeQuestions[0].templates.python));
  const [stdin, setStdin] = useState(activeQuestions[0].input);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleTab, setConsoleTab] = useState('output');
  const [hasRun, setHasRun] = useState(false);

  const codeAreaRef = useRef(null);
  const preRef = useRef(null);

  // Sync active problem when dynamic questions list is loaded
  useEffect(() => {
    if (activeQuestions && activeQuestions.length > 0) {
      setActiveProblem(activeQuestions[0]);
    }
  }, [questions]);

  // Sync template on problem or language change
  useEffect(() => {
    if (activeProblem) {
      const template = activeProblem.templates[activeLang] || '';
      setCode(getVisibleCode(template));
      setStdin(activeProblem.input || '');
      setStdout('');
      setStderr('');
      setHasRun(false);
    }
  }, [activeProblem, activeLang]);

  // Determine if current question is SQL type (has mysql/postgres templates, not python/java/cpp)
  const isSqlQuestion = activeProblem &&
    activeProblem.templates &&
    (activeProblem.templates.mysql !== undefined || activeProblem.templates.postgres !== undefined) &&
    activeProblem.templates.python === undefined;

  // Auto-switch language interface when active problem changes
  useEffect(() => {
    if (activeProblem) {
      const isSQL =
        activeProblem.templates &&
        (activeProblem.templates.mysql !== undefined || activeProblem.templates.postgres !== undefined) &&
        activeProblem.templates.python === undefined;
      if (isSQL) {
        setActiveLang('mysql');
      } else if (activeLang === 'mysql' || activeLang === 'postgres') {
        setActiveLang('python');
      }
    }
  }, [activeProblem]);

  // Group problems by category
  const groupedProblems = activeQuestions.reduce((acc, p) => {
    const cat = p.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  // Synchronize Pre scroll position with Textarea scroll position
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Handle Tab key insertion & Bracket Autoclose inside textarea
  const handleKeyDown = (e) => {
    const textarea = e.target;
    const { value, selectionStart, selectionEnd } = textarea;

    if (e.key === 'Tab') {
      e.preventDefault();
      const tabString = "    ";
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      setCode(before + tabString + after);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + tabString.length;
      }, 0);
      return;
    }

    const pairs = {
      '(': ')',
      '{': '}',
      '[': ']',
      '"': '"',
      "'": "'"
    };

    if (pairs[e.key]) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      setCode(before + e.key + closeChar + after);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setStdout('');
    setStderr('');
    setHasRun(false);
    setConsoleTab('output');
    try {
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
      const response = await fetch(`${API_URL}/api/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: activeLang,
          code: reconstructFullCode(code, activeProblem.templates[activeLang]),
          input: stdin
        })
      });

      const result = await response.json();
      if (response.ok) {
        setStdout(result.stdout || '');
        setStderr(result.stderr || '');
        setHasRun(true);
      } else {
        setStderr(result.detail || result.error || 'Server error occurred during compilation.');
        setHasRun(true);
      }
    } catch (err) {
      setStderr(`Network Error: ${err.message}`);
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .playground-container {
          display: flex;
          background: var(--bg-dark-secondary);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          height: calc(100vh - 120px);
          overflow: hidden;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .playground-sidebar {
          width: 320px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          background: rgba(15, 22, 42, 0.4);
        }
        .sidebar-section {
          padding: 1.25rem;
        }
        .sidebar-section:not(:last-child) {
          border-bottom: 1px solid var(--border-glass);
        }
        .problem-select {
          width: 100%;
          padding: 0.6rem;
          background: rgba(7, 10, 19, 0.6);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }
        .problem-title {
          font-size: 1.15rem;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .problem-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .problem-desc strong {
          color: #f8fafc;
        }
        .problem-desc code {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.15rem 0.3rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.8rem;
          color: #f43f5e;
        }
        body.light-theme .problem-desc code {
          background: rgba(15, 23, 42, 0.05);
          color: #be123c;
        }
        body.light-theme .problem-desc strong {
          color: #0f172a !important;
        }
        .playground-ide {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #070a13;
        }
        .ide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(15, 22, 42, 0.5);
          border-bottom: 1px solid var(--border-glass);
        }
        .lang-select {
          padding: 0.5rem;
          background: rgba(7, 10, 19, 0.8);
          border: 1px solid var(--border-glass);
          border-radius: 6px;
          color: var(--text-primary);
          font-weight: 500;
          outline: none;
        }
        .editor-wrapper {
          flex: 1;
          position: relative;
          background: #080c16;
          overflow: hidden;
          border-bottom: 1px solid var(--border-glass);
        }
        .line-numbers {
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          color: #475569;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          text-align: right;
          padding: 1rem 0.5rem;
          box-sizing: border-box;
          user-select: none;
          z-index: 2;
          overflow: hidden;
        }
        .code-textarea {
          position: absolute;
          top: 0;
          left: 40px;
          right: 0;
          bottom: 0;
          width: calc(100% - 40px);
          height: 100%;
          background: transparent;
          border: none;
          color: transparent;
          caret-color: #f8fafc;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          padding: 1rem;
          box-sizing: border-box;
          white-space: pre;
          overflow: auto;
          outline: none;
          resize: none;
          z-index: 3;
        }
        .highlight-overlay {
          position: absolute;
          top: 0;
          left: 40px;
          right: 0;
          bottom: 0;
          margin: 0;
          padding: 1rem;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          white-space: pre;
          overflow: hidden;
          color: #e2e8f0;
          pointer-events: none;
          background: transparent;
          z-index: 1;
        }
        .console-body {
          flex: 1;
          padding: 0.75rem 1.25rem;
          overflow-y: auto;
          background: #05070d;
        }
        .terminal-stdout {
          color: #4ade80;
          font-family: 'Courier New', Courier, monospace;
          white-space: pre-wrap;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }
        .terminal-stderr {
          color: #f87171;
          font-family: 'Courier New', Courier, monospace;
          white-space: pre-wrap;
          font-size: 0.85rem;
        }
        .stdin-textarea {
          width: 100%;
          height: 100%;
          background: rgba(7, 10, 19, 0.5);
          border: 1px solid var(--border-glass);
          border-radius: 6px;
          color: var(--text-primary);
          font-family: 'Courier New', Courier, monospace;
          padding: 0.6rem;
          outline: none;
          resize: none;
          font-size: 0.8rem;
        }
        .schema-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.72rem;
          margin-bottom: 0.5rem;
        }
        .schema-table th, .schema-table td {
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.25rem 0.4rem;
          text-align: left;
        }
        .schema-table th {
          background: rgba(255,255,255,0.02);
          color: #94a3b8;
        }
        .schema-table td {
          color: #cbd5e1;
        }
        .schema-details {
          background: rgba(15, 22, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .schema-details summary {
          color: #cbd5e1;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          user-select: none;
        }
        .schema-details summary:hover {
          color: #f8fafc;
        }
        .console-panel {
          height: 200px;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          background: #03050a;
          border-top: 1px solid var(--border-glass);
        }
        .console-tabs {
          display: flex;
          flex-direction: row;
          align-items: center;
          background: rgba(7, 10, 19, 0.6);
          border-bottom: 1px solid var(--border-glass);
          padding: 0 0.5rem;
          flex-shrink: 0;
        }
        .console-tab {
          padding: 0.45rem 1rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .console-tab:hover {
          color: #94a3b8;
        }
        .console-tab.active {
          color: #f8fafc;
          border-bottom-color: #3b82f6;
        }
      `}</style>

      <div className="playground-container">
        {/* SIDEBAR: Problems and Details */}
        <div className="playground-sidebar">
          <div className="sidebar-section">
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>SELECT QUESTION</label>
            <select 
              className="problem-select"
              value={activeProblem.id}
              onChange={(e) => {
                const found = activeQuestions.find(p => p.id === e.target.value);
                if (found) setActiveProblem(found);
              }}
            >
              {Object.entries(groupedProblems).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 className="problem-title">{activeProblem.title}</h3>
            <span className="badge badge-primary" style={{ marginBottom: '1rem', textTransform: 'none' }}>{activeProblem.difficulty}</span>
            <p className="problem-desc" dangerouslySetInnerHTML={{ __html: activeProblem.description }} />

            {/* SQL Table Reference Helper */}
            {isSqlQuestion && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <h4 style={{ color: '#0284c7', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700 }}>RELATIONAL SCHEMA REFERENCE</h4>
                
                <details className="schema-details" open>
                  <summary>Table: employees</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>id (PK)</td><td>INTEGER</td></tr>
                      <tr><td>name</td><td>TEXT</td></tr>
                      <tr><td>department_id (FK)</td><td>INTEGER</td></tr>
                      <tr><td>salary</td><td>INTEGER</td></tr>
                      <tr><td>manager_id</td><td>INTEGER</td></tr>
                      <tr><td>hire_date</td><td>TEXT</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: departments</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>id (PK)</td><td>INTEGER</td></tr>
                      <tr><td>department_name</td><td>TEXT</td></tr>
                      <tr><td>location</td><td>TEXT</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: projects</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>id (PK)</td><td>INTEGER</td></tr>
                      <tr><td>project_name</td><td>TEXT</td></tr>
                      <tr><td>budget</td><td>INTEGER</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: employee_projects</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>employee_id (PK, FK)</td><td>INTEGER</td></tr>
                      <tr><td>project_id (PK, FK)</td><td>INTEGER</td></tr>
                      <tr><td>hours_worked</td><td>INTEGER</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: customers</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>id (PK)</td><td>INTEGER</td></tr>
                      <tr><td>name</td><td>TEXT</td></tr>
                      <tr><td>email</td><td>TEXT</td></tr>
                      <tr><td>country</td><td>TEXT</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: orders</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>id (PK)</td><td>INTEGER</td></tr>
                      <tr><td>customer_id (FK)</td><td>INTEGER</td></tr>
                      <tr><td>order_date</td><td>TEXT</td></tr>
                      <tr><td>total_amount</td><td>REAL</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: products</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>id (PK)</td><td>INTEGER</td></tr>
                      <tr><td>name</td><td>TEXT</td></tr>
                      <tr><td>price</td><td>REAL</td></tr>
                      <tr><td>stock</td><td>INTEGER</td></tr>
                    </tbody>
                  </table>
                </details>

                <details className="schema-details">
                  <summary>Table: order_items</summary>
                  <table className="schema-table" style={{ marginTop: '0.4rem' }}>
                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                    <tbody>
                      <tr><td>order_id (PK, FK)</td><td>INTEGER</td></tr>
                      <tr><td>product_id (PK, FK)</td><td>INTEGER</td></tr>
                      <tr><td>quantity</td><td>INTEGER</td></tr>
                      <tr><td>unit_price</td><td>REAL</td></tr>
                    </tbody>
                  </table>
                </details>
              </div>
            )}
          </div>
        </div>

        <div className="playground-ide">
          <div className="ide-header">
            <div className="ide-controls">
              <select 
                className="lang-select"
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value)}
              >
                {isSqlQuestion ? (
                  <>
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                  </>
                ) : (
                  <>
                    <option value="python">Python 3</option>
                    <option value="java">Java (JDK 17)</option>
                    <option value="cpp">C++ (GCC 14)</option>
                  </>
                )}
              </select>
            </div>

            <button 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', gap: '0.5rem', cursor: 'pointer' }}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" opacity="0.75"></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>

          <div className="editor-wrapper">
            <div className="line-numbers">
              {code.split('\n').map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>
            
            {/* Syntax Highlight overlay */}
            <pre className="highlight-overlay" ref={preRef} dangerouslySetInnerHTML={{ __html: highlightCode(code, activeLang) }} />
            
            <textarea
              ref={codeAreaRef}
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          {/* BOTTOM TERMINAL PANEL */}
          <div className="console-panel">
            <div className="console-tabs">
              <button 
                className={`console-tab ${consoleTab === 'output' ? 'active' : ''}`}
                onClick={() => setConsoleTab('output')}
              >
                Console Output
              </button>
              <button 
                className={`console-tab ${consoleTab === 'input' ? 'active' : ''}`}
                onClick={() => setConsoleTab('input')}
              >
                Custom Input (stdin)
              </button>
            </div>

            <div className="console-body">
              {consoleTab === 'input' ? (
                <textarea
                  className="stdin-textarea"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs for standard input stream..."
                />
              ) : (
                <>
                  {stdout && (
                    <div className="terminal-stdout">
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem', fontFamily: 'sans-serif', fontWeight: 600 }}>STDOUT:</div>
                      {stdout}
                    </div>
                  )}
                  {stderr && (
                    <div className="terminal-stderr">
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem', fontFamily: 'sans-serif', fontWeight: 600 }}>STDERR:</div>
                      {stderr}
                    </div>
                  )}
                  {!stdout && !stderr && !isRunning && !hasRun && (
                    <p style={{ color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>Click "Run Code" to compile and execute program output...</p>
                  )}
                  {!stdout && !stderr && !isRunning && hasRun && (
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>✓ Code ran successfully — no output produced.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
