import React, { useState, useEffect, useRef } from 'react';

const PROBLEMS = [
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
            // Clean bracket array "[2,7,11,15]" -> "2,7,11,15"
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
        // Parse array format e.g. [2, 7, 11, 15]
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
      sql: `-- SQL query cannot solve a general string palindrome check directly without recursive expressions.
-- Switch to Python, C++, or Java for this challenge, or write an employee aggregate query here!
SELECT 'Use programming languages for Palindrome Check!' as message;`
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
-- Hint: Use LIMIT, OFFSET or subqueries with MAX()
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
-- Hint: JOIN employees with departments and GROUP BY department_name
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

export default function Playground() {
  const [activeProblem, setActiveProblem] = useState(PROBLEMS[0]);
  const [activeLang, setActiveLang] = useState('python');
  const [code, setCode] = useState(PROBLEMS[0].templates.python);
  const [stdin, setStdin] = useState(PROBLEMS[0].input);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [editorTheme, setEditorTheme] = useState('dark');
  const [consoleTab, setConsoleTab] = useState('output');

  const codeAreaRef = useRef(null);

  // Sync template on problem or language change
  useEffect(() => {
    const template = activeProblem.templates[activeLang] || '';
    setCode(template);
    setStdin(activeProblem.input || '');
    setStdout('');
    setStderr('');
  }, [activeProblem, activeLang]);

  // Handle Tab key insertion & Bracket Autoclose inside textarea
  const handleKeyDown = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. Tab insertion (4 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const updatedCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(updatedCode);
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }

    // 2. Bracket Auto-closing
    const pairs = {
      '{': '}',
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'"
    };

    if (pairs[e.key] !== undefined) {
      e.preventDefault();
      const char = e.key;
      const closingChar = pairs[char];
      
      const updatedCode = code.substring(0, start) + char + closingChar + code.substring(end);
      setCode(updatedCode);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setStdout('');
    setStderr('');
    setConsoleTab('output');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
      const res = await fetch(`${API_URL}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeLang,
          code,
          stdin
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStdout(data.stdout || '');
        setStderr(data.stderr || '');
      } else {
        const errData = await res.json();
        setStderr(errData.detail || 'Server encountered an error running your code.');
      }
    } catch (err) {
      setStderr(`Network Error: Could not connect to code compiler backend. Make sure the API server is running.`);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <style>{`
        .playground-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - 120px);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        @media (max-width: 968px) {
          .playground-container {
            grid-template-columns: 1fr;
            height: auto;
            max-height: none;
          }
        }
        .playground-sidebar {
          background: rgba(30, 41, 59, 0.4);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;
        }
        .sidebar-section {
          padding: 1.25rem;
        }
        .sidebar-section:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .problem-select {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .problem-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.4rem;
        }
        .problem-desc {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #94a3b8;
          margin-bottom: 1.25rem;
        }
        .playground-ide {
          display: flex;
          flex-direction: column;
          background: rgba(15, 23, 42, 0.2);
          overflow: hidden;
          height: 100%;
        }
        .ide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(30, 41, 59, 0.4);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }
        .ide-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .lang-select {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          outline: none;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .editor-wrapper {
          flex: 1;
          display: flex;
          position: relative;
          background: #0f172a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .line-numbers {
          padding: 1rem 0.5rem;
          text-align: right;
          color: #475569;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          user-select: none;
          background: rgba(15, 23, 42, 0.4);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          width: 40px;
        }
        .code-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          padding: 1rem;
          resize: none;
          overflow-y: auto;
          white-space: pre;
        }
        .console-panel {
          background: rgba(15, 23, 42, 0.8);
          display: flex;
          flex-direction: column;
          height: 200px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .console-tabs {
          display: flex;
          background: rgba(30, 41, 59, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }
        .console-tab {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .console-tab.active {
          color: #f8fafc;
          border-bottom: 2px solid #0284c7;
          background: rgba(255, 255, 255, 0.02);
        }
        .console-body {
          flex: 1;
          padding: 0.75rem 1.25rem;
          overflow-y: auto;
        }
        .terminal-stdout {
          font-family: 'Courier New', Courier, monospace;
          color: #10b981;
          white-space: pre-wrap;
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .terminal-stderr {
          font-family: 'Courier New', Courier, monospace;
          color: #ef4444;
          white-space: pre-wrap;
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .stdin-textarea {
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #f8fafc;
          font-family: monospace;
          padding: 0.5rem;
          outline: none;
          resize: none;
          font-size: 0.8rem;
        }
        .schema-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .schema-table th, .schema-table td {
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.3rem 0.5rem;
          text-align: left;
        }
        .schema-table th {
          background: rgba(255,255,255,0.02);
          color: #94a3b8;
        }
        .schema-table td {
          color: #cbd5e1;
        }
      `}</style>

      <div className="playground-container">
        {/* SIDEBAR: Problems and Details */}
        <div className="playground-sidebar">
          <div className="sidebar-section">
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>SELECT PROBLEM</label>
            <select 
              className="problem-select"
              value={activeProblem.id}
              onChange={(e) => {
                const found = PROBLEMS.find(p => p.id === e.target.value);
                if (found) setActiveProblem(found);
              }}
            >
              {PROBLEMS.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 className="problem-title">{activeProblem.title}</h3>
            <span className="badge badge-primary" style={{ marginBottom: '1rem', textTransform: 'none' }}>{activeProblem.difficulty}</span>
            <p className="problem-desc" dangerouslySetInnerHTML={{ __html: activeProblem.description }} />

            {/* SQL Table Reference Helper */}
            {activeLang === 'sql' && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <h4 style={{ color: '#0284c7', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 700 }}>DATABASE SCHEMA REFERENCE</h4>
                
                <h5 style={{ color: '#f8fafc', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Table: <strong>employees</strong></h5>
                <table className="schema-table">
                  <thead>
                    <tr><th>Column</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>id (PK)</td><td>INTEGER</td></tr>
                    <tr><td>name</td><td>TEXT</td></tr>
                    <tr><td>department_id (FK)</td><td>INTEGER</td></tr>
                    <tr><td>salary</td><td>INTEGER</td></tr>
                    <tr><td>manager_id</td><td>INTEGER</td></tr>
                  </tbody>
                </table>

                <h5 style={{ color: '#f8fafc', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Table: <strong>departments</strong></h5>
                <table className="schema-table">
                  <thead>
                    <tr><th>Column</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>id (PK)</td><td>INTEGER</td></tr>
                    <tr><td>department_name</td><td>TEXT</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* MAIN IDE EDITOR AREA */}
        <div className="playground-ide">
          <div className="ide-header">
            <div className="ide-controls">
              <select 
                className="lang-select"
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value)}
              >
                <option value="python">Python 3</option>
                <option value="java">Java (JDK 17)</option>
                <option value="cpp">C++ (GCC 11)</option>
                <option value="sql">SQL (SQLite3)</option>
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
                  <svg className="spin" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  Compiling...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>

          {/* CODE EDITOR PANELS */}
          <div className="editor-wrapper">
            <div className="line-numbers">
              {lineNumbers.map(n => (
                <div key={n}>{n}</div>
              ))}
            </div>
            <textarea
              ref={codeAreaRef}
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
                  {!stdout && !stderr && (
                    <p style={{ color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>Click "Run Code" to compile and execute program output...</p>
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
