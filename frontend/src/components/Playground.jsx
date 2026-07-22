import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import questionsData from '../data/questions.json';

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
  const pythonBuiltins = new Set(['len', 'range', 'list', 'dict', 'set', 'str', 'int', 'float', 'bool', 'type', 'sum', 'min', 'max', 'abs', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'open', 'input']);
  
  const cppKeywords = new Set(['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'package', 'return', 'if', 'else', 'for', 'while', 'do', 'void', 'int', 'double', 'float', 'char', 'boolean', 'long', 'static', 'final', 'new', 'this', 'super', 'override', 'include', 'using', 'namespace', 'const', 'virtual', 'auto']);
  const cppBuiltins = new Set(['cout', 'cin', 'endl', 'vector', 'unordered_map', 'map', 'string', 'set', 'pair', 'queue', 'stack', 'System', 'out', 'println', 'print', 'main', 'std']);
  
  const sqlKeywords = new Set(['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'SUM', 'MAX', 'MIN', 'AVG', 'COUNT', 'AS', 'AND', 'OR', 'IN', 'INSERT', 'INTO', 'VALUES', 'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UPDATE', 'DELETE', 'SET']);

  const tokens = escaped.match(tokenRegex) || [escaped];
  
  return tokens.map(token => {
    const rawToken = token
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    if (rawToken.startsWith('#') || rawToken.startsWith('//') || rawToken.startsWith('--')) {
      return `<span class="code-token-comment">${token}</span>`;
    }
    if ((rawToken.startsWith('"') && rawToken.endsWith('"')) || (rawToken.startsWith("'") && rawToken.endsWith("'"))) {
      return `<span class="code-token-string">${token}</span>`;
    }
    if (/^\d+$/.test(rawToken)) {
      return `<span class="code-token-number">${token}</span>`;
    }
    if (lang === 'python' && pythonKeywords.has(rawToken)) {
      return `<span class="code-token-keyword">${token}</span>`;
    }
    if (lang === 'python' && pythonBuiltins.has(rawToken)) {
      return `<span class="code-token-builtin">${token}</span>`;
    }
    if ((lang === 'java' || lang === 'cpp') && cppKeywords.has(rawToken)) {
      return `<span class="code-token-keyword">${token}</span>`;
    }
    if ((lang === 'java' || lang === 'cpp') && cppBuiltins.has(rawToken)) {
      return `<span class="code-token-builtin">${token}</span>`;
    }
    if (lang === 'sql' || lang === 'mysql' || lang === 'postgres') {
      const upperToken = rawToken.toUpperCase();
      if (sqlKeywords.has(upperToken)) {
        return `<span class="code-token-keyword">${token}</span>`;
      }
    }
    if (/^[=+\-*/%<>&|!~:;(){}\[\]]+$/.test(rawToken)) {
      return `<span class="code-token-operator">${token}</span>`;
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

const reconstructFullCode = (userEditedCode, originalTemplate, lang) => {
  if (!userEditedCode || !userEditedCode.trim()) return userEditedCode;

  const driverInfo = getHiddenDriverCode(originalTemplate || '');

  // 1. If originalTemplate has driver tags, use them cleanly
  if (driverInfo) {
    const { startMarker, endMarker, hiddenContent } = driverInfo;
    
    if (lang === 'java' || (originalTemplate && originalTemplate.includes('public class Main'))) {
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
  if (lang === 'java') {
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
  if (lang === 'python') {
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


const FREE_PLAYGROUND_TEMPLATES = {
  python: `# Write your custom Python 3 code here
def main():
    print("Hello, Virtual Gyans Playground!")

if __name__ == "__main__":
    main()`,

  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Virtual Gyans Playground!");
    }
}`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Virtual Gyans Playground!" << endl;
    return 0;
}`,

  mysql: `-- Write your custom MySQL query here
SELECT 'Hello, Virtual Gyans Playground!' AS message;`,

  postgres: `-- Write your custom PostgreSQL query here
SELECT 'Hello, Virtual Gyans Playground!' AS message;`
};


export default function Playground({ questions, onGoHome }) {
  const [dbQuestions, setDbQuestions] = useState([]);

  // Fetch all questions from Firebase Firestore collection `playground_questions` on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAllQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'playground_questions'));
        if (querySnapshot && !querySnapshot.empty) {
          const loaded = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          if (isMounted && loaded.length > 0) {
            setDbQuestions(loaded);
          }
        }
      } catch (err) {
        console.warn("Firestore collection query warning:", err);
      }
    };

    fetchAllQuestions();
    return () => { isMounted = false; };
  }, []);

  const activeQuestions = React.useMemo(() => {
    const map = new Map();
    // 1. Base PROBLEMS suite
    PROBLEMS.forEach(p => map.set(String(p.id), p));

    // 2. Full questions.json dataset
    if (questionsData && Array.isArray(questionsData)) {
      questionsData.forEach(q => {
        if (q && q.id) {
          const qId = String(q.id);
          const existing = map.get(qId) || {};
          map.set(qId, { ...existing, ...q });
        }
      });
    }

    // 3. Prop questions from App
    if (questions && Array.isArray(questions)) {
      questions.forEach(q => {
        if (q && q.id) {
          const qId = String(q.id);
          const existing = map.get(qId) || {};
          map.set(qId, { ...existing, ...q });
        }
      });
    }

    // 4. Live database questions from Firestore collection playground_questions
    if (dbQuestions && Array.isArray(dbQuestions)) {
      dbQuestions.forEach(q => {
        if (q && q.id) {
          const qId = String(q.id);
          const existing = map.get(qId) || {};
          map.set(qId, { ...existing, ...q });
        }
      });
    }

    return Array.from(map.values());
  }, [questions, dbQuestions]);

  const [activeProblem, setActiveProblem] = useState(null);
  const [activeLang, setActiveLang] = useState('python');
  const [code, setCode] = useState(FREE_PLAYGROUND_TEMPLATES.python);
  const [stdin, setStdin] = useState('');
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

  // ── Timer & Cache Refs ──
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);
  const questionCacheRef = useRef(new Map());

  useEffect(() => {
    // Prevent document body scrolling while in playground
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]);

  // Reset timer when problem changes
  useEffect(() => {
    setTimerSeconds(0);
    setTimerRunning(false);
  }, [activeProblem]);

  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTimerToggle = () => setTimerRunning(r => !r);
  const handleTimerReset = () => { setTimerRunning(false); setTimerSeconds(0); };

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
    } else {
      setTestCases([]);
      setSelectedCaseIdx(0);
      setTestResults({});
      setSubmitResult(null);
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
    isApplyingSolutionRef.current = true;
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
  
  const generateFallbackProblem = (q) => {
    const isSQLCategory = q.category && q.category.toLowerCase().includes('sql');
    const title = q.title || 'Coding Challenge';
    
    const description = q.description || `
      <div style="font-family:var(--font-heading);">
        <h3 style="font-size:1.15rem;margin-bottom:0.65rem;color:var(--text-primary);">${title}</h3>
        <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:1rem;">
          Write an efficient solution for <strong>${title}</strong>. Make sure to handle edge cases and optimize for time and space complexity.
        </p>
        ${q.input ? `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.85rem 1rem;border-radius:8px;margin-bottom:1rem;">
          <strong style="color:var(--primary);font-size:0.85rem;display:block;margin-bottom:0.35rem;">Sample Input:</strong>
          <pre style="margin:0;font-size:0.88rem;color:#e2e8f0;">${q.input}</pre>
        </div>` : ''}
      </div>
    `;

    const templates = (q.templates && Object.keys(q.templates).length > 0) ? q.templates : (
      isSQLCategory ? {
        mysql: `-- Solution for ${title}\nSELECT * FROM employees;`,
        postgres: `-- Solution for ${title}\nSELECT * FROM employees;`
      } : {
        python: `# Write your Python 3 solution for ${title}\ndef solution():\n    # TODO: Write code here\n    pass\n\nif __name__ == '__main__':\n    print("Executing solution for ${title}...")`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // TODO: Solution for ${title}\n        System.out.println("Executing Java Solution...");\n    }\n}`,
        cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // TODO: Solution for ${title}\n    cout << "Executing C++ Solution..." << endl;\n    return 0;\n}`,
        sql: `-- SQL query for ${title}\nSELECT * FROM employees;`
      }
    );

    return {
      id: q.id || 'prob-' + Math.random().toString(36).substr(2, 9),
      title,
      category: q.category || 'General',
      difficulty: q.difficulty || 'Easy',
      input: q.input || '',
      description,
      templates
    };
  };

  const selectQuestion = async (q, closeDrawer = false) => {
    if (!q) return;
    if (closeDrawer) setDrawerOpen(false);
    setSidebarTab('problem');

    const qId = String(q.id || q.title || '');

    // Check in-memory cache first if question details were already fetched
    if (questionCacheRef.current.has(qId)) {
      setActiveProblem(questionCacheRef.current.get(qId));
      return;
    }

    // 1. Immediately set activeProblem to a loading state with spinner so UI switches view instantly!
    const loadingProblem = {
      ...q,
      id: qId,
      title: q.title || 'Loading Question...',
      category: q.category || 'General',
      difficulty: q.difficulty || 'Easy',
      description: `
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:280px;color:var(--text-secondary);">
          <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:1.25rem;"></div>
          <h4 style="font-weight:700;font-size:1.05rem;color:var(--text-primary);margin-bottom:0.35rem;">Loading from Firebase Database...</h4>
          <p style="font-size:0.85rem;color:var(--text-secondary);">Retrieving question details & starter code for ${q.title || 'problem'}...</p>
        </div>
      `,
      templates: {
        python: '# Loading question template from database...',
        java: '// Loading question template from database...',
        cpp: '// Loading question template from database...',
        sql: '-- Loading question template from database...'
      }
    };

    setActiveProblem(loadingProblem);

    // 2. Fetch from Firebase Firestore & Vercel API
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://v-gyans.vercel.app';

      const firebaseFetch = getDoc(doc(db, 'playground_questions', qId))
        .then(snap => (snap && snap.exists()) ? { id: snap.id, ...snap.data() } : null)
        .catch(() => null);

      const apiFetch = fetch(`${API_URL}/api/questions/${encodeURIComponent(qId)}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null);

      const [firebaseData, apiData] = await Promise.all([firebaseFetch, apiFetch]);
      const fetched = firebaseData || apiData;

      if (fetched && (fetched.description || (fetched.templates && Object.keys(fetched.templates).length > 0))) {
        questionCacheRef.current.set(qId, fetched);
        setActiveProblem(fetched);
      } else {
        const staticMatch = PROBLEMS.find(p => String(p.id) === qId || (p.title && q.title && p.title.toLowerCase() === q.title.toLowerCase()));
        const resolvedObj = staticMatch || generateFallbackProblem(q);
        questionCacheRef.current.set(qId, resolvedObj);
        setActiveProblem(resolvedObj);
      }
    } catch (err) {
      console.warn("Database fetch error, using static problem:", err);
      const staticMatch = PROBLEMS.find(p => String(p.id) === qId || (p.title && q.title && p.title.toLowerCase() === q.title.toLowerCase()));
      const resolvedObj = staticMatch || generateFallbackProblem(q);
      questionCacheRef.current.set(qId, resolvedObj);
      setActiveProblem(resolvedObj);
    }
  };

  const codeAreaRef = useRef(null);
  const preRef = useRef(null);
  const isApplyingSolutionRef = useRef(false);

  // Sync template on problem or language change
  useEffect(() => {
    if (isApplyingSolutionRef.current) {
      isApplyingSolutionRef.current = false;
      setStdout('');
      setStderr('');
      setHasRun(false);
      return;
    }

    if (activeProblem) {
      const templates = activeProblem.templates || {};
      const template = templates[activeLang] || '';
      setCode(getVisibleCode(template));
      setStdin(activeProblem.input || '');
      setStdout('');
      setStderr('');
      setHasRun(false);
    } else {
      setCode(FREE_PLAYGROUND_TEMPLATES[activeLang] || '');
      setStdout('');
      setStderr('');
      setHasRun(false);
    }
  }, [activeProblem, activeLang]);

  // Determine if current question is SQL or Java 8 type
  const isSqlQuestion = activeProblem &&
    activeProblem.templates &&
    (activeProblem.templates.mysql !== undefined || activeProblem.templates.postgres !== undefined) &&
    activeProblem.templates.python === undefined;

  const isJava8Question = activeProblem &&
    (activeProblem.category === 'Java 8' || (activeProblem.category && activeProblem.category.includes('Java 8')));

  // Auto-switch language interface when active problem changes
  useEffect(() => {
    if (activeProblem) {
      const isJava8 = activeProblem.category === 'Java 8' || (activeProblem.category && activeProblem.category.includes('Java 8'));
      const isSQL =
        activeProblem.templates &&
        (activeProblem.templates.mysql !== undefined || activeProblem.templates.postgres !== undefined) &&
        activeProblem.templates.python === undefined;
      if (isJava8) {
        setActiveLang('java');
      } else if (isSQL) {
        setActiveLang('mysql');
      } else if (activeLang === 'mysql' || activeLang === 'postgres') {
        setActiveLang('python');
      }
    }
  }, [activeProblem]);

  // Group problems by category cleanly using curated categories
  const groupedProblems = activeQuestions.reduce((acc, p) => {
    if (p.id === 'custom') return acc;
    const cat = p.category || 'DSA - Arrays';
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
          code: reconstructFullCode(code, activeProblem?.templates?.[activeLang], activeLang),
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
      const fullCode = reconstructFullCode(code, activeProblem.templates[activeLang], activeLang);

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
          height: calc(100vh - 66px);
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
        .sidebar-home-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: rgba(148, 163, 184, 0.6);
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.18s ease;
          outline: none;
        }
        .sidebar-home-btn:hover {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.3);
          color: #38bdf8;
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.15);
        }
        body.light-theme .sidebar-home-btn {
          background: transparent !important;
          border-color: rgba(15,23,42,0.12) !important;
          color: rgba(100, 116, 139, 0.55) !important;
          backdrop-filter: blur(8px) !important;
        }
        body.light-theme .sidebar-home-btn:hover {
          background: rgba(2, 132, 199, 0.07) !important;
          border-color: rgba(2, 132, 199, 0.3) !important;
          color: #0284c7 !important;
          box-shadow: 0 0 8px rgba(2, 132, 199, 0.1) !important;
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
        body.light-theme .problem-title {
          color: #0f172a !important;
        }
        body.light-theme .problem-desc {
          color: #334155 !important;
        }
        body.light-theme .sidebar-tab-btn {
          color: #64748b !important;
        }
        body.light-theme .sidebar-tab-btn.active {
          color: #0f172a !important;
        }
        body.light-theme .leetcode-desc h4 {
          color: #0f172a !important;
        }
        body.light-theme .leetcode-desc p {
          color: #334155 !important;
        }
        body.light-theme .leetcode-desc pre {
          background: #f1f5f9 !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
        }
        body.light-theme .leetcode-desc li {
          color: #334155 !important;
        }
        body.light-theme .diff-easy { color: #15803d !important; background: rgba(22,163,74,0.1) !important; }
        body.light-theme .diff-medium { color: #b45309 !important; background: rgba(217,119,6,0.1) !important; }
        body.light-theme .diff-hard { color: #b91c1c !important; background: rgba(220,38,38,0.1) !important; }
        body.light-theme .diff-sandbox { color: #4338ca !important; background: rgba(79,70,229,0.1) !important; }
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
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-right: none;
          border-radius: 10px 0 0 10px;
          width: 36px;
          height: 115px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -4px 0 18px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
        }
        .drawer-toggle:hover {
          width: 42px;
          background: rgba(30, 41, 59, 0.98);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: -6px 0 24px rgba(0, 0, 0, 0.65);
        }
        .drawer-toggle-icon {
          color: #f8fafc;
          user-select: none;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 0.84rem;
          font-weight: 800;
          letter-spacing: 0.14em;
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
          font-size: 0.86rem;
          font-weight: 800;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .topic-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .topic-count {
          font-size: 0.74rem;
          color: #94a3b8;
          font-weight: 700;
        }
        .topic-arrow {
          color: #94a3b8;
          font-size: 0.75rem;
          transition: transform 0.2s;
          display: inline-block;
        }
        .topic-arrow.expanded { transform: rotate(90deg); }
        .question-list {
          display: none;
          flex-direction: column;
          padding: 0.35rem 0;
          background: rgba(0,0,0,0.35);
        }
        .question-list.visible { display: flex; }
        .question-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 1.25rem 0.65rem 1.75rem;
          cursor: pointer;
          border: none;
          background: transparent;
          text-align: left;
          width: 100%;
          transition: background 0.12s;
          gap: 0.55rem;
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }
        .question-item:hover { background: rgba(59,130,246,0.12); }
        .question-item.active { background: rgba(59,130,246,0.2); }
        .question-item-title {
          font-size: 0.88rem;
          color: #f1f5f9;
          font-weight: 500;
          flex: 1;
          line-height: 1.4;
        }
        .question-item.active .question-item-title { color: #60a5fa; font-weight: 700; }
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
          background: var(--bg-dark);
        }
        .ide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: var(--bg-dark-secondary);
          border-bottom: 1px solid var(--border-glass);
        }
        .lang-select {
          padding: 0.5rem;
          background: var(--bg-dark);
          border: 1px solid var(--border-glass);
          border-radius: 6px;
          color: var(--text-primary);
          font-weight: 500;
          outline: none;
        }
        .editor-wrapper {
          flex: 1;
          position: relative;
          background: var(--bg-dark-secondary);
          overflow: hidden;
          border-bottom: 1px solid var(--border-glass);
        }
        .line-numbers {
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          bottom: 0;
          background: var(--bg-dark);
          border-right: 1px solid var(--border-glass);
          color: var(--text-muted);
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
          caret-color: var(--text-primary);
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
          color: var(--text-primary);
          pointer-events: none;
          background: transparent;
          z-index: 1;
        }
        .console-body {
          flex: 1;
          padding: 0.75rem 1.25rem;
          overflow-y: auto;
          background: var(--bg-dark-secondary);
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
          background: var(--bg-dark);
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
          border: 1px solid var(--border-glass);
          padding: 0.25rem 0.4rem;
          text-align: left;
        }
        .schema-table th {
          background: var(--bg-dark);
          color: var(--text-muted);
        }
        .schema-table td {
          color: var(--text-secondary);
        }
        .schema-details {
          background: var(--bg-dark);
          border: 1px solid var(--border-glass);
          border-radius: 6px;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .schema-details summary {
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          user-select: none;
        }
        .schema-details summary:hover {
          color: var(--text-primary);
        }
        /* ── Solutions Panel CSS ── */
        .solution-details {
          background: var(--bg-dark);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          margin-bottom: 0.75rem;
          overflow: hidden;
        }
        .solution-details summary {
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
          background: var(--bg-dark-secondary);
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
          color: var(--text-primary);
        }
        /* Apply button lives in summary row, only visible when open */
        .summary-apply-btn {
          opacity: 0;
          pointer-events: none;
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          transition: opacity 0.15s;
        }
        .solution-details[open] .summary-apply-btn {
          opacity: 1;
          pointer-events: auto;
        }
        .solution-content {
          padding: 1rem;
          position: relative;
          background: var(--bg-dark-secondary);
        }
        .solution-content pre {
          color: #e2e8f0;
        }
        body.light-theme .solution-details {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
        }
        body.light-theme .solution-details summary {
          background: #f1f5f9 !important;
          color: #475569 !important;
        }
        body.light-theme .solution-details[open] summary {
          color: #0f172a !important;
          border-bottom-color: #e2e8f0 !important;
        }
        body.light-theme .solution-content {
          background: #f8fafc !important;
        }
        body.light-theme .solution-content pre {
          color: #1e293b !important;
        }
        /* ── Timer ── */
        .timer-widget {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 8px;
          padding: 0.28rem 0.55rem 0.28rem 0.7rem;
          font-family: 'Courier New', monospace;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(8px);
        }
        .timer-widget:has(.timer-display.running) {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }
        .timer-display {
          font-size: 0.88rem;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 0.08em;
          min-width: 3rem;
          text-align: center;
          transition: color 0.2s;
          font-variant-numeric: tabular-nums;
        }
        .timer-display.running {
          color: #34d399;
          text-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
        }
        .timer-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 5px;
          transition: all 0.15s;
          outline: none;
          flex-shrink: 0;
        }
        .timer-btn:hover {
          color: #f8fafc;
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.22);
        }
        .timer-reset {
          color: #64748b;
        }
        .timer-reset:hover {
          color: #fca5a5 !important;
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
        body.light-theme .timer-widget {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          box-shadow: 0 1px 4px rgba(15,23,42,0.08) !important;
        }
        body.light-theme .timer-widget:has(.timer-display.running) {
          background: #f0fdf4 !important;
          border-color: #34d399 !important;
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.2) !important;
        }
        body.light-theme .timer-display {
          color: #1e293b !important;
        }
        body.light-theme .timer-display.running {
          color: #059669 !important;
          text-shadow: none !important;
        }
        body.light-theme .timer-btn {
          background: #f1f5f9 !important;
          border-color: #e2e8f0 !important;
          color: #475569 !important;
        }
        body.light-theme .timer-btn:hover {
          background: #e2e8f0 !important;
          border-color: #94a3b8 !important;
          color: #0f172a !important;
        }
        body.light-theme .timer-reset:hover {
          background: #fee2e2 !important;
          border-color: #fca5a5 !important;
          color: #dc2626 !important;
        }
        .copy-solution-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-glass);
          border-radius: 6px;
          color: #cbd5e1;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .copy-solution-btn:hover {
          background: rgba(255, 255, 255, 0.11);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .copy-solution-btn.applied {
          background: rgba(16, 185, 129, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
          color: #10b981 !important;
        }
        body.light-theme .copy-solution-btn {
          background: rgba(15, 23, 42, 0.04) !important;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          color: #334155 !important;
        }
        body.light-theme .copy-solution-btn:hover {
          background: rgba(15, 23, 42, 0.08) !important;
          border-color: #0284c7 !important;
          color: #0284c7 !important;
        }
        body.light-theme .copy-solution-btn.applied {
          background: rgba(16, 185, 129, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.4) !important;
          color: #047857 !important;
        }
        .console-panel {
          height: 200px;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          background: var(--bg-dark-secondary);
          border-top: 1px solid var(--border-glass);
        }
        .console-tabs {
          display: flex;
          flex-direction: row;
          align-items: center;
          background: var(--bg-dark);
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
                        className={`question-item ${activeProblem?.id === p.id ? 'active' : ''}`}
                        onClick={() => selectQuestion(p, true)}
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

        {/* LEFT PANEL: Problem Description & Solutions OR Free Playground Hub */}
        <div className="playground-sidebar">
          {!activeProblem ? (
            <div style={{ padding: '1rem 1.15rem', flex: 1, overflowY: 'auto' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.85rem'
              }}>
                Curated Problem Categories
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {Object.entries(groupedProblems).map(([cat, items]) => {
                  const isExpanded = !!expandedTopics[cat];
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <button
                        className="category-card-btn"
                        onClick={() => toggleTopic(cat)}
                        style={{
                          borderRadius: '10px',
                          padding: '0.85rem 1.1rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.94rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <span className="category-card-name" style={{ letterSpacing: '-0.01em' }}>{cat}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            color: '#38bdf8',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '99px',
                            whiteSpace: 'nowrap'
                          }}>
                            {items.length} Questions
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isExpanded ? '▼' : '▶'}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.5rem', marginBottom: '0.4rem' }}>
                          {items.map(p => (
                            <button
                              key={p.id}
                              onClick={() => selectQuestion(p)}
                              style={{
                                background: activeProblem?.id === p.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                border: activeProblem?.id === p.id ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                padding: '0.6rem 0.85rem',
                                color: '#f8fafc',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s'
                              }}
                            >
                              <span>{p.title}</span>
                              <span className={`diff-badge diff-${(p.difficulty||'easy').toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                {p.difficulty}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="sidebar-header" style={{ padding: '0.5rem 1.25rem', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center' }}>
                {/* Home icon — returns to free playground landing */}
                <button
                  onClick={() => { setActiveProblem(null); setTimerSeconds(0); setTimerRunning(false); }}
                  title="Back to Custom Code"
                  className="sidebar-home-btn"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </button>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setSidebarTab('problem')}
                    className={`sidebar-tab-btn ${sidebarTab === 'problem' ? 'active' : ''}`}
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
                    className={`sidebar-tab-btn ${sidebarTab === 'solution' ? 'active' : ''}`}
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
                              <button
                                className={`copy-solution-btn summary-apply-btn ${copiedLang === `applied_${lang}` ? 'applied' : ''}`}
                                onClick={(e) => { e.preventDefault(); handleApplySolution(lang, code); }}
                              >
                                {copiedLang === `applied_${lang}` ? '✓ Loaded' : '⚡ Apply'}
                              </button>
                            </summary>
                            <div className="solution-content">
                              <pre style={{ margin: 0, padding: 0, overflowX: 'auto', fontSize: '0.8rem', fontFamily: 'Courier New, Courier, monospace', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
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
            </>
          )}
        </div>

        <div className="playground-ide">

          <div className="ide-header">
            <div className="ide-controls">
              <select 
                className="lang-select"
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value)}
              >
                {isJava8Question ? (
                  <option value="java">Java (JDK 17)</option>
                ) : isSqlQuestion ? (
                  <>
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                  </>
                ) : (
                  <>
                    <option value="python">Python 3</option>
                    <option value="java">Java (JDK 17)</option>
                    <option value="cpp">C++ (GCC 14)</option>
                    {!activeProblem && (
                      <>
                        <option value="mysql">MySQL</option>
                        <option value="postgres">PostgreSQL</option>
                      </>
                    )}
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* ── Timer ── */}
              <div className="timer-widget">
                <span className={`timer-display ${timerRunning ? 'running' : ''}`}>{formatTimer(timerSeconds)}</span>
                <button className="timer-btn" onClick={handleTimerToggle} title={timerRunning ? 'Pause timer' : 'Start timer'}>
                  {timerRunning ? (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                {timerSeconds > 0 && (
                  <button className="timer-btn timer-reset" onClick={handleTimerReset} title="Reset timer">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                  </button>
                )}
              </div>
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
              {activeProblem && (
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
              )}
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
                className={`console-tab ${consoleTab === 'input' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCaseIdx(-1);
                  setConsoleTab('input');
                }}
              >
                Input
              </button>

              <button 
                className={`console-tab ${consoleTab === 'output' && selectedCaseIdx === -1 ? 'active' : ''}`}
                onClick={() => {
                  setConsoleTab('output');
                }}
              >
                Output
              </button>
            </div>

            <div className="console-body" style={{ overflowY: 'auto' }}>
              {consoleTab === 'input' ? (
                <textarea
                  className="stdin-textarea"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter program input..."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Active Test Case Verification Details OR Free Playground STDOUT/STDERR */}
                  {activeProblem && testCases.length > 0 && selectedCaseIdx >= 0 && testCases[selectedCaseIdx] ? (
                    <div className="console-verification-card" style={{ borderRadius: '6px', padding: '0.65rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {testCases[selectedCaseIdx].label} Verification
                        </span>
                        {testResults[selectedCaseIdx] && (
                          <span className={testResults[selectedCaseIdx].passed ? 'pass-status-text' : 'fail-status-text'} style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            {testResults[selectedCaseIdx].passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.15rem' }}>Input</div>
                          <div className="console-code-box console-code-input" style={{ padding: '0.35rem 0.55rem', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                            {testCases[selectedCaseIdx].input}
                          </div>
                        </div>

                        {(testResults[selectedCaseIdx]?.stdout !== undefined ? testResults[selectedCaseIdx].stdout : stdout) !== '' && (
                          <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.15rem' }}>Your Output</div>
                            <div className={`console-code-box ${testResults[selectedCaseIdx]?.passed === false ? 'console-code-fail' : 'console-code-pass'}`} style={{ padding: '0.35rem 0.55rem', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                              {testResults[selectedCaseIdx]?.stdout !== undefined ? testResults[selectedCaseIdx].stdout : stdout}
                            </div>
                          </div>
                        )}

                        {testCases[selectedCaseIdx].expectedOutput && (
                          <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.15rem' }}>Expected Output</div>
                            <div className="console-code-box console-code-expected" style={{ padding: '0.35rem 0.55rem', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                              {testCases[selectedCaseIdx].expectedOutput}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {stdout && (
                        <div className="terminal-stdout">
                          <pre className="console-code-box console-code-pass" style={{ margin: 0, padding: '0.4rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>{stdout}</pre>
                        </div>
                      )}
                      {stderr && (
                        <div className="terminal-stderr">
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.3rem', fontFamily: 'sans-serif', fontWeight: 600, textTransform: 'uppercase' }}>STDERR / COMPILE ERROR</div>
                          <pre className="console-code-box console-code-fail" style={{ margin: 0, padding: '0.4rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>{stderr}</pre>
                        </div>
                      )}
                      {!stdout && !stderr && !isRunning && hasRun && (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>✓ Code ran successfully — no output produced.</p>
                      )}
                    </>
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
