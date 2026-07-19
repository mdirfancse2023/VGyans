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
  } else if (lang === 'sql' || lang === 'mysql' || lang === 'postgres') {
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
    if (lang === 'sql' || lang === 'mysql' || lang === 'postgres') {
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
  if (!userEditedCode || !userEditedCode.trim()) return userEditedCode;

  const driverInfo = getHiddenDriverCode(originalTemplate || '');

  // 1. If originalTemplate has driver tags, use them cleanly
  if (driverInfo) {
    const { startMarker, endMarker, hiddenContent } = driverInfo;
    
    if (originalTemplate.includes('public class Main')) {
      if (userEditedCode.includes('public static void main(')) {
        return userEditedCode;
      }
      if (userEditedCode.includes('public class Main')) {
        const lastBraceIndex = userEditedCode.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
          return userEditedCode.substring(0, lastBraceIndex) + 
                 "\n\n  " + startMarker + hiddenContent + endMarker + "\n" + 
                 userEditedCode.substring(lastBraceIndex);
        }
      } else {
        return "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n  " + 
               userEditedCode + "\n\n  " + 
               startMarker + hiddenContent + endMarker + "\n}";
      }
    }
    return userEditedCode + "\n\n" + startMarker + hiddenContent + endMarker;
  }

  // 2. Fallback: If originalTemplate has no driver tags or is missing, dynamically generate driver code!
  
  // Java Dynamic Driver Fallback
  if (userEditedCode.includes('public static') || userEditedCode.includes('class Main') || userEditedCode.includes('int ') || userEditedCode.includes('boolean ') || userEditedCode.includes('void ')) {
    if (userEditedCode.includes('public static void main(')) {
      return userEditedCode;
    }
    
    // Extract method name
    const match = userEditedCode.match(/public\s+static\s+[\w\[\]<>]+\s+(\w+)\s*\(/) || userEditedCode.match(/static\s+[\w\[\]<>]+\s+(\w+)\s*\(/) || userEditedCode.match(/[\w\[\]<>]+\s+(\w+)\s*\(/);
    const funcName = match ? match[1] : 'maxSubarrayKadane';
    
    const javaDriver = `
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line0 = reader.readLine();
        if (line0 == null) return;
        String line1 = reader.readLine();
        
        String clean0 = line0.replace("[", "").replace("]", "").trim();
        String[] tokens0 = clean0.isEmpty() ? new String[0] : clean0.split(",");
        int[] nums = new int[tokens0.length];
        for (int i = 0; i < tokens0.length; i++) {
            try { nums[i] = Integer.parseInt(tokens0[i].trim()); } catch (Exception e) {}
        }
        
        if (line1 != null && !line1.trim().isEmpty()) {
            try {
                int target = Integer.parseInt(line1.trim());
                Object res = ${funcName}(nums, target);
                if (res instanceof int[]) System.out.println(Arrays.toString((int[])res));
                else System.out.println(res);
                return;
            } catch (Exception e) {}
        }
        
        Object res = ${funcName}(nums);
        if (res instanceof int[]) System.out.println(Arrays.toString((int[])res));
        else System.out.println(res);
    }`;

    if (userEditedCode.includes('public class Main')) {
      const lastBraceIndex = userEditedCode.lastIndexOf('}');
      if (lastBraceIndex !== -1) {
        return userEditedCode.substring(0, lastBraceIndex) + "\n\n  " + javaDriver + "\n" + userEditedCode.substring(lastBraceIndex);
      }
    }
    return "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n  " + userEditedCode + "\n\n  " + javaDriver + "\n}";
  }

  // Python Dynamic Driver Fallback
  if (userEditedCode.includes('def ')) {
    const match = userEditedCode.match(/def\s+(\w+)\s*\(/);
    if (match) {
      const funcName = match[1];
      const pyDriver = `\n\nimport sys, json\nlines = sys.stdin.read().split('\\n')\nif lines and lines[0].strip():\n    try:\n        arg1 = json.loads(lines[0].strip())\n        if len(lines) > 1 and lines[1].strip():\n            try:\n                arg2 = int(lines[1].strip())\n                print(${funcName}(arg1, arg2))\n            except Exception:\n                print(${funcName}(arg1))\n        else:\n            print(${funcName}(arg1))\n    except Exception:\n        print(${funcName}(lines[0].strip()))`;
      return userEditedCode + pyDriver;
    }
  }

  return userEditedCode;
};

const formatSolutionCode = (lang, langCode) => {
  if (!langCode || !langCode.trim()) return langCode;
  const targetLang = (lang === 'cpp') ? 'cpp' : (lang === 'java') ? 'java' : (lang === 'mysql' || lang === 'postgres') ? 'sql' : 'python';
  
  if (targetLang === 'java' && !langCode.includes('class Main')) {
    const indented = langCode.split('\n').map(line => '    ' + line).join('\n');
    return `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n${indented}\n}`;
  }
  if (targetLang === 'cpp' && !langCode.includes('main()') && !langCode.includes('#include')) {
    return `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <algorithm>\n\nusing namespace std;\n\n${langCode}`;
  }
  return langCode;
};

const parseTestCasesFromProblem = (problem) => {
  if (!problem) return [];
  const desc = problem.description || '';
  const testCases = [];

  const regex = /<strong>Input:<\/strong>\s*([\s\S]*?)<strong>Output:<\/strong>\s*([\s\S]*?)(?=<strong>Explanation:<\/strong>|<\/pre>|<h4|$)/gi;
  let match;
  let count = 1;

  while ((match = regex.exec(desc)) !== null) {
    let rawInput = match[1].replace(/<[^>]+>/g, '').trim();
    let rawOutput = match[2].replace(/<[^>]+>/g, '').trim();
    
    rawInput = rawInput.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    rawOutput = rawOutput.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

    if (rawInput || rawOutput) {
      testCases.push({
        id: count,
        label: `Case ${count}`,
        input: rawInput,
        expectedOutput: rawOutput
      });
      count++;
    }
  }

  if (testCases.length === 0 && problem.input) {
    testCases.push({
      id: 1,
      label: 'Case 1',
      input: problem.input.trim(),
      expectedOutput: ''
    });
  }

  return testCases;
};

const compareOutputs = (actual, expected) => {
  if (!expected) return null;
  const act = (actual || '').trim();
  const exp = (expected || '').trim();

  if (act === exp) return true;

  // Number comparison (e.g. 23 vs 23)
  if (act !== '' && exp !== '' && !isNaN(act) && !isNaN(exp) && Number(act) === Number(exp)) return true;

  // Normalization comparison (strip spaces, trailing newlines, commas)
  const normalize = (s) => (s || '').replace(/[\r\n\s]+/g, '').replace(/,/g, ',').toLowerCase();
  if (normalize(act) === normalize(exp)) return true;

  // JSON array/object comparison
  try {
    const actJson = JSON.parse(act);
    const expJson = JSON.parse(exp);
    return JSON.stringify(actJson) === JSON.stringify(expJson);
  } catch (e) {
    // Not JSON
  }

  return false;
};


export default function Playground({ questions }) {
  const activeQuestions = (questions && questions.length > 0) ? questions : PROBLEMS;
  const [activeProblem, setActiveProblem] = useState(activeQuestions[0]);
  const [activeLang, setActiveLang] = useState('python');
  const [code, setCode] = useState(getVisibleCode(activeQuestions[0]?.templates?.python || ''));
  const [stdin, setStdin] = useState(activeQuestions[0]?.input || '');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleTab, setConsoleTab] = useState('output');
  const [hasRun, setHasRun] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [sidebarTab, setSidebarTab] = useState('problem');
  const [copiedLang, setCopiedLang] = useState('');

  // LeetCode Test Cases & Submissions State
  const [testCases, setTestCases] = useState([]);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [testResults, setTestResults] = useState({});
  const [submitResult, setSubmitResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeProblem) {
      const parsedCases = parseTestCasesFromProblem(activeProblem);
      setTestCases(parsedCases);
      setSelectedCaseIdx(0);
      setTestResults({});
      setSubmitResult(null);
      if (parsedCases.length > 0) {
        setStdin(parsedCases[0].input || '');
      } else {
        setStdin(activeProblem.input || '');
      }
    }
  }, [activeProblem]);

  const handleCopySolution = (langCode, lang) => {
    const fullSolution = formatSolutionCode(lang, langCode);
    navigator.clipboard.writeText(fullSolution);
    setCopiedLang(lang);
    setTimeout(() => {
      setCopiedLang('');
    }, 1500);
  };

  const handleApplySolution = (lang, langCode) => {
    const targetLang = (lang === 'cpp') ? 'cpp' : (lang === 'java') ? 'java' : (lang === 'mysql' || lang === 'postgres') ? 'sql' : 'python';
    const fullSolution = formatSolutionCode(lang, langCode);
    setActiveLang(targetLang);
    setCode(fullSolution);
    setCopiedLang(`applied_${lang}`);
    setTimeout(() => {
      setCopiedLang('');
    }, 1500);
  };

  const toggleTopic = (cat) => setExpandedTopics(prev => ({ ...prev, [cat]: !prev[cat] }));
  
  const selectQuestion = async (q) => {
    setDrawerOpen(false);
    setSidebarTab('problem');
    if (q.id === 'custom') {
      setActiveProblem(q);
      return;
    }
    
    if (q.description && q.templates && Object.keys(q.templates).length > 0) {
      setActiveProblem(q);
      return;
    }
    
    // Set a loading description state
    setActiveProblem({
      ...q,
      description: '<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:200px;color:var(--text-secondary);"><div style="width:30px;height:30px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem;"></div><p>Loading question details...</p></div>',
      templates: {}
    });
    
    try {
      let fullQuestion = null;
      try {
        const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
        const res = await fetch(`${API_URL}/api/questions/${q.id}`);
        if (res.ok) {
          fullQuestion = await res.json();
        }
      } catch (e) {
        console.warn('API fetch failed, falling back to static backup json:', e);
      }

      // Fallback to static backup JSON if API is offline or returns error
      if (!fullQuestion || !fullQuestion.templates || Object.keys(fullQuestion.templates).length === 0) {
        const backupRes = await fetch(`./data/playground_questions.json`);
        if (backupRes.ok) {
          const allBackupQuestions = await backupRes.json();
          fullQuestion = allBackupQuestions.find(item => item.id === q.id);
        }
      }

      if (fullQuestion) {
        setActiveProblem(fullQuestion);
        
        // Save in local memory list so we don't refetch
        if (questions) {
          const idx = questions.findIndex(item => item.id === q.id);
          if (idx !== -1) {
            questions[idx] = fullQuestion;
          }
        }
      } else {
        throw new Error('Failed to fetch details');
      }
    } catch (err) {
      console.error(err);
      setActiveProblem({
        ...q,
        description: '<p style="color:var(--danger);padding:1rem;">Failed to load question details. Please try again.</p>',
        templates: {
          python: '# Error loading question details'
        }
      });
    }
  };

  const codeAreaRef = useRef(null);
  const preRef = useRef(null);

  // Sync active problem when dynamic questions list is loaded
  useEffect(() => {
    if (activeQuestions && activeQuestions.length > 0) {
      const firstProblem = activeQuestions[0];
      if (firstProblem.id !== 'custom' && (!firstProblem.description || !firstProblem.templates)) {
        selectQuestion(firstProblem);
      } else {
        setActiveProblem(firstProblem);
      }
    }
  }, [questions]);

  // Sync template on problem or language change
  useEffect(() => {
    if (activeProblem) {
      const templates = activeProblem.templates || {};
      const template = templates[activeLang] || '';
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
    setSubmitResult(null);
    setConsoleTab('output');

    const activeInput = stdin;
    const activeCase = (selectedCaseIdx >= 0 && testCases[selectedCaseIdx]) ? testCases[selectedCaseIdx] : null;

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
          input: activeInput
        })
      });

      const result = await response.json();
      if (response.ok) {
        const out = result.stdout || '';
        const err = result.stderr || '';
        setStdout(out);
        setStderr(err);
        setHasRun(true);

        if (activeCase && activeCase.expectedOutput) {
          const isPassed = compareOutputs(out, activeCase.expectedOutput);
          setTestResults(prev => ({
            ...prev,
            [selectedCaseIdx]: {
              passed: isPassed,
              stdout: out,
              stderr: err,
              expected: activeCase.expectedOutput,
              input: activeInput
            }
          }));
        }
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

  const handleSubmitAll = async () => {
    if (testCases.length === 0) {
      handleRunCode();
      return;
    }

    setIsSubmitting(true);
    setStdout('');
    setStderr('');
    setHasRun(false);
    setSubmitResult(null);
    setConsoleTab('output');

    let passedCount = 0;
    const newResults = {};
    let firstFailedCase = null;

    try {
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
      const fullCode = reconstructFullCode(code, activeProblem.templates[activeLang]);

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const response = await fetch(`${API_URL}/api/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: activeLang,
            code: fullCode,
            input: tc.input
          })
        });

        const result = await response.json();
        if (response.ok) {
          const out = result.stdout || '';
          const err = result.stderr || '';
          const isPassed = compareOutputs(out, tc.expectedOutput);
          newResults[i] = {
            passed: isPassed,
            stdout: out,
            stderr: err,
            expected: tc.expectedOutput,
            input: tc.input
          };

          if (isPassed) {
            passedCount++;
          } else if (!firstFailedCase) {
            firstFailedCase = { index: i, tc, stdout: out, stderr: err };
          }
        } else {
          newResults[i] = {
            passed: false,
            stdout: '',
            stderr: result.detail || result.error || 'Execution Error',
            expected: tc.expectedOutput,
            input: tc.input
          };
          if (!firstFailedCase) {
            firstFailedCase = { index: i, tc, stdout: '', stderr: result.detail || result.error };
          }
        }
      }

      setTestResults(newResults);
      const allPassed = passedCount === testCases.length;

      setSubmitResult({
        status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
        passedCount,
        totalCount: testCases.length,
        failedCase: firstFailedCase
      });

      const targetIdx = firstFailedCase ? firstFailedCase.index : 0;
      setSelectedCaseIdx(targetIdx);
      if (testCases[targetIdx]) {
        setStdin(testCases[targetIdx].input);
        setStdout(newResults[targetIdx]?.stdout || '');
        setStderr(newResults[targetIdx]?.stderr || '');
      }
      setHasRun(true);
    } catch (err) {
      setStderr(`Network Error: ${err.message}`);
      setHasRun(true);
    } finally {
      setIsSubmitting(false);
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
          position: relative;
        }
        .playground-sidebar {
          width: 320px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          background: rgba(15, 22, 42, 0.4);
          overflow: hidden;
        }
        .sidebar-section {
          padding: 1.25rem;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(7, 10, 19, 0.4);
          flex-shrink: 0;
        }
        .sidebar-header-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .diff-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .diff-easy   { background: rgba(34,197,94,0.15); color: #22c55e; }
        .diff-medium { background: rgba(234,179,8,0.15);  color: #eab308; }
        .diff-hard   { background: rgba(239,68,68,0.15);  color: #ef4444; }
        .diff-sandbox { background: rgba(99,102,241,0.15); color: #818cf8; }

        .problem-title {
          font-size: 1.05rem;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          font-weight: 700;
          line-height: 1.3;
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
        /* ── RIGHT DRAWER ── */
        .drawer-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 40;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .questions-drawer {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 340px;
          background: #080d1a;
          border-left: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: -8px 0 32px rgba(0,0,0,0.5);
        }
        .questions-drawer.open {
          transform: translateX(0);
        }
        .drawer-toggle {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          z-index: 60;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none;
          border-radius: 8px 0 0 8px;
          width: 28px;
          height: 80px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.2s, background 0.2s;
          box-shadow: -3px 0 12px rgba(59,130,246,0.4);
        }
        .drawer-toggle:hover {
          width: 34px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }
        .drawer-toggle-icon {
          color: #fff;
          font-size: 1rem;
          line-height: 1;
          user-select: none;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transform: rotate(180deg);
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(7, 10, 19, 0.7);
          flex-shrink: 0;
        }
        .drawer-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .drawer-close {
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-glass);
          color: #94a3b8;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
        }
        .drawer-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
        .drawer-search {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-glass);
          flex-shrink: 0;
        }
        .drawer-search input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          color: #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .drawer-search input:focus { border-color: #3b82f6; }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem 0;
        }
        .topic-group {}
        .topic-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1.25rem;
          cursor: pointer;
          user-select: none;
          transition: background 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .topic-header:hover { background: rgba(255,255,255,0.04); }
        .topic-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #60a5fa;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .topic-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .topic-count {
          font-size: 0.7rem;
          color: #475569;
          font-weight: 600;
        }
        .topic-arrow {
          color: #475569;
          font-size: 0.7rem;
          transition: transform 0.2s;
          display: inline-block;
        }
        .topic-arrow.expanded { transform: rotate(90deg); }
        .question-list {
          display: none;
          flex-direction: column;
          padding: 0.25rem 0;
          background: rgba(0,0,0,0.2);
        }
        .question-list.visible { display: flex; }
        .question-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 1.5rem 0.45rem 2rem;
          cursor: pointer;
          border: none;
          background: transparent;
          text-align: left;
          width: 100%;
          transition: background 0.12s;
          gap: 0.5rem;
        }
        .question-item:hover { background: rgba(59,130,246,0.08); }
        .question-item.active { background: rgba(59,130,246,0.15); }
        .question-item-title {
          font-size: 0.78rem;
          color: #cbd5e1;
          flex: 1;
          line-height: 1.3;
        }
        .question-item.active .question-item-title { color: #93c5fd; font-weight: 600; }
        body.light-theme .questions-drawer { background: #f8fafc; }
        body.light-theme .drawer-search input { background: #fff; color: #0f172a; }
        body.light-theme .topic-name { color: #2563eb; }
        body.light-theme .question-item-title { color: #334155; }
        body.light-theme .question-item.active .question-item-title { color: #1d4ed8; }
        body.light-theme .topic-header:hover { background: rgba(0,0,0,0.04); }
        body.light-theme .question-item:hover { background: rgba(37,99,235,0.06); }
        body.light-theme .question-item.active { background: rgba(37,99,235,0.1); }

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
        /* ── Solutions Panel CSS ── */
        .solution-details {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          margin-bottom: 0.75rem;
          overflow: hidden;
        }
        .solution-details summary {
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: #cbd5e1;
          cursor: pointer;
          user-select: none;
          background: rgba(30, 41, 59, 0.3);
          outline: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .solution-details summary::-webkit-details-marker {
          display: none;
        }
        .solution-details[open] summary {
          border-bottom: 1px solid var(--border-glass);
          color: #f8fafc;
        }
        .solution-content {
          padding: 1rem;
          position: relative;
          background: #080c16;
        }
        .copy-solution-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid var(--border-glass);
          border-radius: 4px;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.55rem;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
          outline: none;
        }
        .copy-solution-btn:hover {
          color: #f8fafc;
          background: var(--primary);
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

        {/* DRAWER OVERLAY */}
        {drawerOpen && (
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
        )}

        {/* RIGHT SLIDE-IN DRAWER */}
        <div className={`questions-drawer ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <span className="drawer-title">📚 Select Question</span>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="drawer-search">
            <input
              type="text"
              placeholder="🔍  Search questions..."
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                if (!q) { setExpandedTopics({}); return; }
                const matched = {};
                Object.entries(groupedProblems).forEach(([cat, items]) => {
                  if (items.some(p => p.title.toLowerCase().includes(q))) matched[cat] = true;
                });
                setExpandedTopics(matched);
              }}
            />
          </div>
          <div className="drawer-body">
            {Object.entries(groupedProblems).map(([category, items]) => {
              const isExpanded = !!expandedTopics[category];
              return (
                <div className="topic-group" key={category}>
                  <div className="topic-header" onClick={() => toggleTopic(category)}>
                    <span className="topic-name">{category}</span>
                    <span className="topic-meta">
                      <span className="topic-count">{items.length}Q</span>
                      <span className={`topic-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
                    </span>
                  </div>
                  <div className={`question-list ${isExpanded ? 'visible' : ''}`}>
                    {items.map(p => (
                      <button
                        key={p.id}
                        className={`question-item ${activeProblem.id === p.id ? 'active' : ''}`}
                        onClick={() => selectQuestion(p)}
                      >
                        <span className="question-item-title">{p.title}</span>
                        <span className={`diff-badge diff-${(p.difficulty||'easy').toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DRAWER TOGGLE TAB on right edge */}
        <button
          className="drawer-toggle"
          onClick={() => setDrawerOpen(o => !o)}
          title="Browse Questions"
        >
          <span className="drawer-toggle-icon">{drawerOpen ? '✕ Close' : '☰ Questions'}</span>
        </button>

        {/* LEFT PANEL: Problem Description & Solutions */}
        <div className="playground-sidebar">
          <div className="sidebar-header" style={{ padding: '0.5rem 1.25rem', gap: '1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarTab('problem')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: sidebarTab === 'problem' ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0',
                  cursor: 'pointer',
                  borderBottom: sidebarTab === 'problem' ? '2px solid var(--primary)' : '2px solid transparent',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                Problem
              </button>
              <button
                onClick={() => setSidebarTab('solution')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: sidebarTab === 'solution' ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0',
                  cursor: 'pointer',
                  borderBottom: sidebarTab === 'solution' ? '2px solid var(--primary)' : '2px solid transparent',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                Solution
              </button>
            </div>
            <span className={`diff-badge diff-${(activeProblem.difficulty||'easy').toLowerCase()}`} style={{ marginLeft: 'auto' }}>
              {activeProblem.difficulty}
            </span>
          </div>

          <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
            {sidebarTab === 'problem' ? (
              <>
                <h3 className="problem-title">{activeProblem.title}</h3>
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
                  </div>
                )}
              </>
            ) : (
              <div className="solutions-panel" style={{ padding: '0.5rem 0' }}>
                <h3 className="problem-title" style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Solutions</h3>
                {activeProblem.solutions ? (
                  Object.entries(activeProblem.solutions)
                    .filter(([lang, code]) => code && code.trim())
                    .map(([lang, code]) => (
                      <details className="solution-details" key={lang}>
                        <summary>
                          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                            {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python 3' : lang === 'java' ? 'Java' : lang === 'mysql' ? 'MySQL' : lang === 'postgres' ? 'PostgreSQL' : lang}
                          </span>
                        </summary>
                        <div className="solution-content">
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <button 
                              className="copy-solution-btn"
                              onClick={() => handleApplySolution(lang, code)}
                              style={{ position: 'static', background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}
                            >
                              {copiedLang === `applied_${lang}` ? '✓ Loaded into Editor' : '⚡ Apply to Editor'}
                            </button>
                          </div>
                          <pre style={{ margin: 0, padding: 0, overflowX: 'auto', fontSize: '0.8rem', fontFamily: 'Courier New, Courier, monospace', lineHeight: 1.5, color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            <code>{formatSolutionCode(lang, code)}</code>
                          </pre>
                        </div>
                      </details>
                    ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No solutions pre-generated for this task.</p>
                )}
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

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', gap: '0.4rem', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
              >
                {isRunning ? (
                  <>Running...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Run Code
                  </>
                )}
              </button>
              <button 
                className="btn btn-primary"
                style={{ padding: '0.45rem 1.1rem', gap: '0.4rem', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}
                onClick={handleSubmitAll}
                disabled={isRunning || isSubmitting}
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>
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
          <div className="console-panel" style={{ height: '230px', minHeight: '180px' }}>
            <div className="console-tabs" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflowX: 'auto' }}>
              {testCases.map((tc, idx) => {
                const res = testResults[idx];
                return (
                  <button
                    key={idx}
                    className={`console-tab ${selectedCaseIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCaseIdx(idx);
                      setStdin(tc.input);
                      if (testResults[idx]) {
                        setStdout(testResults[idx].stdout || '');
                        setStderr(testResults[idx].stderr || '');
                      }
                      setConsoleTab('output');
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>{tc.label}</span>
                    {res && (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.08rem 0.3rem',
                        borderRadius: '4px',
                        background: res.passed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
                        color: res.passed ? '#4ade80' : '#f87171',
                        fontWeight: 800
                      }}>
                        {res.passed ? '✓' : '✗'}
                      </span>
                    )}
                  </button>
                );
              })}

              <button 
                className={`console-tab ${selectedCaseIdx === -1 ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCaseIdx(-1);
                  setConsoleTab('input');
                }}
              >
                Custom Input (stdin)
              </button>
            </div>

            <div className="console-body" style={{ overflowY: 'auto' }}>
              {consoleTab === 'input' ? (
                <textarea
                  className="stdin-textarea"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs for standard input stream..."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Active Test Case Verification Details */}
                  {selectedCaseIdx >= 0 && testCases[selectedCaseIdx] && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.65rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                          {testCases[selectedCaseIdx].label} Verification
                        </span>
                        {testResults[selectedCaseIdx] && (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: testResults[selectedCaseIdx].passed ? '#4ade80' : '#f87171'
                          }}>
                            {testResults[selectedCaseIdx].passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.15rem' }}>Input</div>
                          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.55rem', borderRadius: '4px', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                            {testCases[selectedCaseIdx].input}
                          </div>
                        </div>

                        {(testResults[selectedCaseIdx]?.stdout !== undefined ? testResults[selectedCaseIdx].stdout : stdout) !== '' && (
                          <div>
                            <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.15rem' }}>Your Output</div>
                            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.55rem', borderRadius: '4px', color: testResults[selectedCaseIdx]?.passed === false ? '#f87171' : '#4ade80', whiteSpace: 'pre-wrap' }}>
                              {testResults[selectedCaseIdx]?.stdout !== undefined ? testResults[selectedCaseIdx].stdout : stdout}
                            </div>
                          </div>
                        )}

                        {testCases[selectedCaseIdx].expectedOutput && (
                          <div>
                            <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.15rem' }}>Expected Output</div>
                            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.55rem', borderRadius: '4px', color: '#38bdf8', whiteSpace: 'pre-wrap' }}>
                              {testCases[selectedCaseIdx].expectedOutput}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {stderr && (
                    <div className="terminal-stderr">
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem', fontFamily: 'sans-serif', fontWeight: 600 }}>STDERR / COMPILE ERROR:</div>
                      {stderr}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
