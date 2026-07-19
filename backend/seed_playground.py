import json
import os
import re

def camel_case(s):
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s)
    words = s.split()
    if not words:
        return ''
    return words[0].lower() + ''.join(w.capitalize() for w in words[1:])

def snake_case(s):
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s)
    return '_'.join(s.lower().split())

def make_python_template(func_name, params, ret_type):
    param_str = ", ".join(f"{name}" for name, _ in params)
    if ret_type == "list_int":
        default_return = "return []  # TODO: return result list"
    elif ret_type == "bool":
        default_return = "return False  # TODO: return True or False"
    elif ret_type == "str":
        default_return = 'return ""  # TODO: return result string'
    else:
        default_return = "return 0  # TODO: return result integer"
    body = f"    # Write your Python 3 code here\n    {default_return}"

    driver_lines = [
        "import sys",
        "import json",
        "lines = sys.stdin.read().split('\\n')",
        "if lines and lines[0].strip():"
    ]
    
    parse_calls = []
    for i, (name, ptype) in enumerate(params):
        if ptype == "list_int":
            driver_lines.append(f"    {name} = json.loads(lines[{i}].strip())")
        elif ptype == "int":
            driver_lines.append(f"    {name} = int(lines[{i}].strip())")
        elif ptype == "str":
            driver_lines.append(f"    {name} = lines[{i}].strip().replace('\"', '')")
        parse_calls.append(name)
        
    driver_lines.append(f"    print({func_name}({', '.join(parse_calls)}))")
    
    return f"def {func_name}({param_str}):\n{body}\n\n# -- HIDE DRIVER CODE START --\n# Driver code to test input\n" + "\n".join(driver_lines) + "\n# -- HIDE DRIVER CODE END --"

def make_java_template(func_name, params, ret_type):
    if ret_type == "int":
        java_ret = "int"
    elif ret_type == "bool":
        java_ret = "boolean"
    elif ret_type == "str":
        java_ret = "String"
    elif ret_type == "list_int":
        java_ret = "int[]"
    else:
        java_ret = "int[]"
    java_func = camel_case(func_name)
    
    java_params = []
    for name, ptype in params:
        jtype = "int[]" if ptype == "list_int" else "int" if ptype == "int" else "String"
        java_params.append(f"{jtype} {name}")
    
    body = f"        // Write your Java code here\n        return new {java_ret.replace('[]', '[0]')};" if "[]" in java_ret else f"        // Write your Java code here\n        return { '0' if java_ret == 'int' else 'false' if java_ret == 'boolean' else '\"\"' };"
    
    driver = [
        "    public static void main(String[] args) throws Exception {",
        "        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));"
    ]
    
    for i, (name, ptype) in enumerate(params):
        driver.append(f"        String line{i} = reader.readLine();")
        driver.append(f"        if (line{i} == null) return;")
        if ptype == "list_int":
            driver.append(f"        String clean{i} = line{i}.replace(\"[\", \"\").replace(\"]\", \"\").trim();")
            driver.append(f"        String[] tokens{i} = clean{i}.isEmpty() ? new String[0] : clean{i}.split(\",\");")
            driver.append(f"        int[] {name} = new int[tokens{i}.length];")
            driver.append(f"        for (int i = 0; i < tokens{i}.length; i++) {name}[i] = Integer.parseInt(tokens{i}[i].trim());")
        elif ptype == "int":
            driver.append(f"        int {name} = Integer.parseInt(line{i}.trim());")
        elif ptype == "str":
            driver.append(f"        String {name} = line{i}.trim().replace(\"\\\"\", \"\");")
            
    call_args = ", ".join(name for name, _ in params)
    if "[]" in java_ret:
        driver.append(f"        int[] res = {java_func}({call_args});")
        driver.append("        System.out.println(Arrays.toString(res));")
    else:
        driver.append(f"        System.out.println({java_func}({call_args}));")
        
    driver.append("    }")
    
    return f"import java.util.*;\nimport java.io.*;\n\npublic class Main {{\n    public static {java_ret} {java_func}({', '.join(java_params)}) {{\n{body}\n    }}\n\n    // -- HIDE DRIVER CODE START --\n" + "\n".join(driver) + "\n    // -- HIDE DRIVER CODE END --\n}"

def make_cpp_template(func_name, params, ret_type):
    cpp_ret = "int" if ret_type == "int" else "bool" if ret_type == "bool" else "string" if ret_type == "str" else "vector<int>"
    cpp_func = camel_case(func_name)
    
    cpp_params = []
    for name, ptype in params:
        ctype = "vector<int>&" if ptype == "list_int" else "int" if ptype == "int" else "string"
        cpp_params.append(f"{ctype} {name}")
        
    body = f"    // Write your C++ code here\n    return {{}};" if "vector" in cpp_ret else f"    // Write your C++ code here\n    return { '0' if cpp_ret == 'int' else 'false' if cpp_ret == 'bool' else '\"\"' };"
    
    driver = [
        "int main() {"
    ]
    
    for i, (name, ptype) in enumerate(params):
        driver.append(f"    string line{i};")
        driver.append(f"    if (!getline(cin, line{i})) return 0;")
        if ptype == "list_int":
            driver.append(f"    vector<int> {name};")
            driver.append(f"    stringstream ss{i}(line{i});")
            driver.append(f"    char ch{i};")
            driver.append(f"    int val{i};")
            driver.append(f"    ss{i} >> ch{i}; // Consume '['")
            driver.append(f"    while (ss{i} >> val{i}) {{")
            driver.append(f"        {name}.push_back(val{i});")
            driver.append(f"        ss{i} >> ch{i}; // Consume ',' or ']'")
            driver.append("    }")
        elif ptype == "int":
            driver.append(f"    int {name} = stoi(line{i});")
        elif ptype == "str":
            driver.append(f"    string {name} = line{i};")
            driver.append(f"    {name}.erase(remove({name}.begin(), {name}.end(), '\"'), {name}.end());")
            
    call_args = ", ".join(name for name, _ in params)
    if "vector" in cpp_ret:
        driver.append(f"    vector<int> res = {cpp_func}({call_args});")
        driver.append("    cout << \"[\";")
        driver.append("    for (int i = 0; i < res.size(); i++) {")
        driver.append("        cout << res[i] << (i == res.size() - 1 ? \"\" : \", \");")
        driver.append("    }")
        driver.append("    cout << \"]\" << endl;")
    else:
        driver.append(f"    cout << boolalpha << {cpp_func}({call_args}) << endl;")
        
    driver.append("    return 0;")
    driver.append("}")
    
    return f"#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <algorithm>\n\nusing namespace std;\n\n{cpp_ret} {cpp_func}({', '.join(cpp_params)}) {{\n{body}\n}}\n\n// -- HIDE DRIVER CODE START --\n" + "\n".join(driver) + "\n// -- HIDE DRIVER CODE END --"

def make_leetcode_style_html(desc, input_fmt, output_fmt, examples, constraints):
    html = "<div class='leetcode-desc'>"
    html += f"<p style='margin-bottom: 1rem;'>{desc}</p>"
    
    html += "<h4 style='color: #0284c7; font-size: 0.85rem; margin-top: 1rem; margin-bottom: 0.3rem; font-weight: 700;'>Input Format</h4>"
    html += f"<p style='font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;'>{input_fmt}</p>"
    
    html += "<h4 style='color: #0284c7; font-size: 0.85rem; margin-top: 1rem; margin-bottom: 0.3rem; font-weight: 700;'>Output Format</h4>"
    html += f"<p style='font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;'>{output_fmt}</p>"
    
    for i, ex in enumerate(examples, 1):
        html += f"<h4 style='color: #e2e8f0; font-size: 0.8rem; margin-top: 0.8rem; margin-bottom: 0.3rem; font-weight: 600;'>Example {i}</h4>"
        html += "<pre style='background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.5rem 0.75rem; font-family: monospace; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.8rem; white-space: pre-wrap; line-height: 1.4;'>"
        html += f"<strong>Input:</strong> {ex['input']}\n"
        html += f"<strong>Output:</strong> {ex['output']}\n"
        if ex.get('explanation'):
            html += f"<strong>Explanation:</strong> {ex['explanation']}"
        html += "</pre>"
        
    html += "<h4 style='color: #0284c7; font-size: 0.85rem; margin-top: 1rem; margin-bottom: 0.4rem; font-weight: 700;'>Constraints</h4>"
    html += "<ul style='font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.2rem; margin-bottom: 1rem;'>"
    for c in constraints:
        html += f"<li style='margin-bottom: 0.2rem;'>{c}</li>"
    html += "</ul>"
    
    html += "</div>"
    return html

def make_sql_desc_html(task_desc, tables_used, output_fmt_desc, example_query, example_output_rows):
    """Generate a SQL-style question description showing task, tables, and expected output."""
    html = "<div class='leetcode-desc'>"
    html += f"<p style='margin-bottom:1rem;'>{task_desc}</p>"

    html += "<h4 style='color:#0284c7;font-size:0.85rem;margin-top:1rem;margin-bottom:0.4rem;font-weight:700;'>Tables Available</h4>"
    html += f"<p style='font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem;'>Use the following tables: <code>{'</code>, <code>'.join(tables_used)}</code>. The schema is shown in the <strong>Relational Schema Reference</strong> panel below.</p>"

    html += "<h4 style='color:#0284c7;font-size:0.85rem;margin-top:1rem;margin-bottom:0.4rem;font-weight:700;'>Output Format</h4>"
    html += f"<p style='font-size:0.8rem;color:var(--text-secondary);margin-bottom:1rem;'>{output_fmt_desc}</p>"

    if example_query:
        html += "<h4 style='color:#e2e8f0;font-size:0.8rem;margin-top:0.8rem;margin-bottom:0.3rem;font-weight:600;'>Example Query</h4>"
        html += f"<pre style='background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:0.5rem 0.75rem;font-family:monospace;font-size:0.78rem;color:#93c5fd;margin-bottom:0.8rem;white-space:pre-wrap;line-height:1.4;'>{example_query}</pre>"

    if example_output_rows:
        html += "<h4 style='color:#e2e8f0;font-size:0.8rem;margin-top:0.8rem;margin-bottom:0.3rem;font-weight:600;'>Expected Output</h4>"
        html += "<div style='overflow-x:auto;margin-bottom:0.8rem;'>"
        html += "<table style='border-collapse:collapse;font-size:0.78rem;font-family:monospace;'>"
        headers = list(example_output_rows[0].keys())
        html += "<thead><tr>"
        for h in headers:
            html += f"<th style='border:1px solid rgba(255,255,255,0.12);padding:0.3rem 0.6rem;color:#38bdf8;background:rgba(0,0,0,0.3);text-align:left;'>{h}</th>"
        html += "</tr></thead><tbody>"
        for row in example_output_rows:
            html += "<tr>"
            for h in headers:
                html += f"<td style='border:1px solid rgba(255,255,255,0.08);padding:0.3rem 0.6rem;color:#cbd5e1;'>{row.get(h,'')}</td>"
            html += "</tr>"
        html += "</tbody></table></div>"

    html += "</div>"
    return html

def get_sql_problem_details(title, category):
    """Return proper SQL-style description HTML for a SQL question."""
    sub = category.replace("SQL - ", "")

    # ── Per-question overrides ──────────────────────────────────────────────
    overrides = {
        "All Employees":          ("Write a query to retrieve <strong>all columns</strong> from the <code>employees</code> table.", ["employees"], "All rows and columns from the employees table.", "SELECT * FROM employees;", [{"id":1,"name":"Md Irfan","department_id":1,"salary":120000,"manager_id":"NULL","hire_date":"2020-01-15"},{"id":2,"name":"Rahul Sharma","department_id":1,"salary":95000,"manager_id":1,"hire_date":"2021-03-22"}]),
        "High Earners":           ("Find all employees whose <strong>salary is greater than 90,000</strong>.", ["employees"], "name and salary of qualifying employees.", "SELECT name, salary FROM employees WHERE salary > 90000;", [{"name":"Md Irfan","salary":120000},{"name":"Vikram Malhotra","salary":110000}]),
        "Department Names list":  ("List the <strong>names of all departments</strong> in the company.", ["departments"], "A single column: department_name.", "SELECT department_name FROM departments;", [{"department_name":"Engineering"},{"department_name":"Product"},{"department_name":"Marketing"},{"department_name":"HR"}]),
        "Average Salary per Department": ("Calculate the <strong>average salary</strong> for each department.", ["employees","departments"], "department_name and avg_salary, ordered by avg_salary DESC.", "SELECT d.department_name, AVG(e.salary) AS avg_salary\nFROM employees e JOIN departments d ON e.department_id=d.id\nGROUP BY d.department_name\nORDER BY avg_salary DESC;", [{"department_name":"Engineering","avg_salary":101250.0},{"department_name":"Product","avg_salary":97500.0}]),
        "Second Highest Salary":  ("Find the <strong>second highest salary</strong> from the employees table. Return NULL if it doesn't exist.", ["employees"], "SecondHighestSalary — a single value.", "SELECT MAX(salary) AS SecondHighestSalary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);", [{"SecondHighestSalary":110000}]),
        "Rank Employees by Salary": ("Rank all employees by their salary using the <strong>RANK()</strong> window function, highest first.", ["employees"], "name, salary, and salary_rank columns.", "SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS salary_rank\nFROM employees;", [{"name":"Md Irfan","salary":120000,"salary_rank":1},{"name":"Vikram Malhotra","salary":110000,"salary_rank":2}]),
        "Employee Department Names": ("Write a JOIN query to display each employee's <strong>name alongside their department name</strong>.", ["employees","departments"], "employee_name and department_name.", "SELECT e.name AS employee_name, d.department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.id;", [{"employee_name":"Md Irfan","department_name":"Engineering"},{"employee_name":"Rahul Sharma","department_name":"Engineering"}]),
    }

    if title in overrides:
        task_desc, tables_used, out_fmt, eq, erows = overrides[title]
        return make_sql_desc_html(task_desc, tables_used, out_fmt, eq, erows)

    # ── Category-level defaults ─────────────────────────────────────────────
    cat_defaults = {
        "Basic Select":        (["employees","departments"], "The queried columns as a result set.", "SELECT ... FROM employees WHERE ...;", []),
        "Joins":               (["employees","departments","projects","employee_projects"], "Columns from joined tables as a result set.", "SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id=d.id;", []),
        "Aggregations":        (["employees","departments","projects"], "Aggregated values (e.g. COUNT, SUM, AVG) per group.", "SELECT department_id, COUNT(*) AS total FROM employees GROUP BY department_id;", []),
        "Subqueries & CTEs":   (["employees","departments"], "Result rows using a subquery or CTE expression.", "WITH dept_avg AS (SELECT department_id, AVG(salary) AS avg FROM employees GROUP BY department_id)\nSELECT name FROM employees WHERE salary > (SELECT avg FROM dept_avg WHERE department_id=1);", []),
        "Window Functions":    (["employees","departments","orders"], "Result rows with an extra window-computed column.", "SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees;", []),
    }

    tables_used, out_fmt, eq, erows = cat_defaults.get(sub, (["employees"], "A result set.", "", []))
    task_desc = f"Write a <strong>{sub}</strong> SQL query to solve: <em>{title}</em>."
    return make_sql_desc_html(task_desc, tables_used, out_fmt, eq, erows)

def get_problem_details(title, category):
    # ── SQL questions get their own style ──────────────────────────────────────
    if category.startswith("SQL"):
        return get_sql_problem_details(title, category), ""

    # Default Fallback values for DSA
    desc = f"Write an algorithm to solve the <strong>{title}</strong> challenge."
    input_fmt = "Line 1: A JSON-formatted list of inputs."
    output_fmt = "Return the core result value."
    examples = [
        {"input": "[1, 2, 3]\n5", "output": "8"},
        {"input": "[10, -5, 20]\n10", "output": "30"}
    ]
    constraints = ["1 <= inputs.length <= 10^4", "-10^5 <= value <= 10^5"]
    default_input = "[1, 2, 3]\n5"
    
    # Specific Mapping for standard DSA questions
    if "Two Sum" in title:
        desc = "Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>."
        input_fmt = "Line 1: A JSON-formatted array of integers (e.g. <code>[2,7,11,15]</code>)<br/>Line 2: An integer target (e.g. <code>9</code>)"
        output_fmt = "A JSON array of two indices (e.g. <code>[0, 1]</code>)."
        examples = [
            {"input": "[2, 7, 11, 15]\n9", "output": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
            {"input": "[3, 2, 4]\n6", "output": "[1, 2]", "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."}
        ]
        constraints = ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."]
        default_input = "[2, 7, 11, 15]\n9"
    elif "Kadane" in title or "Max Subarray" in title:
        desc = "Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum."
        input_fmt = "Line 1: A JSON-formatted array of integers (e.g. <code>[-2,1,-3,4,-1,2,1,-5,4]</code>)"
        output_fmt = "An integer representing the maximum sum."
        examples = [
            {"input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6."},
            {"input": "[5, 4, -1, 7, 8]", "output": "23", "explanation": "[5,4,-1,7,8] has the largest sum = 23."}
        ]
        constraints = ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"]
        default_input = "[-2, 1, -3, 4, -1, 2, 1, -5, 4]"
    elif "Container With Most Water" in title:
        desc = "Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is 1, find two lines that together with the x-axis form a container, such that the container contains the most water."
        input_fmt = "Line 1: A JSON list of integer heights (e.g. <code>[1,8,6,2,5,4,8,3,7]</code>)"
        output_fmt = "An integer representing the maximum volume of water."
        examples = [
            {"input": "[1, 8, 6, 2, 5, 4, 8, 3, 7]", "output": "49", "explanation": "The max area of water is formed between index 1 and index 8 with height 7. Volume = 7 * 7 = 49."},
            {"input": "[1, 1]", "output": "1"}
        ]
        constraints = ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"]
        default_input = "[1, 8, 6, 2, 5, 4, 8, 3, 7]"
    elif "Reverse String" in title:
        desc = "Write a function that reverses a string. The input string is given as a string of characters."
        input_fmt = "Line 1: The input string wrapped in quotes (e.g. <code>\"hello\"</code>)"
        output_fmt = "The reversed string."
        examples = [
            {"input": "\"hello\"", "output": "olleh"},
            {"input": "\"Hannah\"", "output": "hannaH"}
        ]
        constraints = ["1 <= s.length <= 10^5", "s consists of printable ASCII characters."]
        default_input = "\"hello\""
    elif "Valid Anagram" in title:
        desc = "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise."
        input_fmt = "Line 1: First string <code>s</code><br/>Line 2: Second string <code>t</code>"
        output_fmt = "Boolean (<code>true</code> or <code>false</code>)."
        examples = [
            {"input": "\"anagram\"\n\"nagaram\"", "output": "true"},
            {"input": "\"rat\"\n\"car\"", "output": "false"}
        ]
        constraints = ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."]
        default_input = "\"anagram\"\n\"nagaram\""
    elif "Valid Palindrome" in title:
        desc = "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return <code>true</code> if it is a palindrome, or <code>false</code> otherwise."
        input_fmt = "Line 1: A string wrapped in quotes."
        output_fmt = "Boolean (<code>true</code> or <code>false</code>)."
        examples = [
            {"input": "\"A man, a plan, a canal: Panama\"", "output": "true", "explanation": "\u0022amanaplanacanalpanama\u0022 is a palindrome."},
            {"input": "\"race a car\"", "output": "false"}
        ]
        constraints = ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."]
        default_input = "\"A man, a plan, a canal: Panama\""
    elif "Climbing Stairs" in title:
        desc = "You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?"
        input_fmt = "Line 1: Integer steps <code>n</code>."
        output_fmt = "Integer representing total unique combinations."
        examples = [
            {"input": "2", "output": "2", "explanation": "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps"},
            {"input": "3", "output": "3", "explanation": "There are three ways:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"}
        ]
        constraints = ["1 <= n <= 45"]
        default_input = "3"
    elif "Binary Search" in title:
        desc = "Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If <code>target</code> exists, then return its index. Otherwise, return <code>-1</code>."
        input_fmt = "Line 1: JSON array of sorted integers.<br/>Line 2: Target integer."
        output_fmt = "Integer index of target or -1."
        examples = [
            {"input": "[-1, 0, 3, 5, 9, 12]\n9", "output": "4", "explanation": "9 exists in nums and its index is 4."},
            {"input": "[-1, 0, 3, 5, 9, 12]\n2", "output": "-1", "explanation": "2 does not exist in nums so return -1."}
        ]
        constraints = ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All the integers in nums are unique.", "nums is sorted in ascending order."]
        default_input = "[-1, 0, 3, 5, 9, 12]\n9"
        
    # Standard SQL Descriptions
    elif "SQL" in title:
        if "All Employees" in title:
            desc = "Write a query to select all records and columns from the <code>employees</code> table."
            examples = [
                {"input": "SELECT * FROM employees;", "output": "id | name         | department_id | salary | manager_id | hire_date\n---+--------------+---------------+--------+------------+----------\n1  | Md Irfan     | 1             | 120000 | NULL       | 2020-01-15\n..."}
            ]
            constraints = ["Return columns in the order: id, name, department_id, salary, manager_id, hire_date."]
        elif "High Earners" in title:
            desc = "Write a query to find all employees earning a salary strictly greater than <code>90,000</code>."
            examples = [
                {"input": "SELECT name, salary FROM employees WHERE salary > 90000;", "output": "name            | salary\n----------------+-------\nMd Irfan        | 120000\nPriya Patel     | 105000\nVikram Malhotra | 110000"}
            ]
            constraints = ["Filter rows where salary > 90000."]
        elif "Employee Department Names" in title:
            desc = "Write a query to retrieve each employee's <code>name</code> along with their corresponding <code>department_name</code> using an <code>INNER JOIN</code>."
            examples = [
                {"input": "SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id;", "output": "name        | department_name\n------------+----------------\nMd Irfan    | Engineering\nPriya Patel | Product\n..."}
            ]
            constraints = ["Link employees to departments by department_id."]
        elif "Second Highest Salary" in title:
            desc = "Write a SQL query to get the second highest salary from the <code>employees</code> table. If there is no second highest salary, the query should return <code>NULL</code>."
            examples = [
                {"input": "SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;", "output": "salary\n------\n110000"}
            ]
            constraints = ["Must handle duplicate salaries correctly."]
        elif "Rank Employees" in title:
            desc = "Write a query to rank all employees by salary in descending order using the <code>DENSE_RANK()</code> window function."
            examples = [
                {"input": "SELECT name, salary, DENSE_RANK() OVER(ORDER BY salary DESC) as rnk FROM employees;", "output": "name            | salary | rnk\n----------------+--------+----\nMd Irfan        | 120000 | 1\nVikram Malhotra | 110000 | 2\n..."}
            ]
            constraints = ["Rank must be dense (no gaps in rank ordering)."]
        else:
            desc = f"Write a SQL query to solve the database problem: <strong>{title}</strong>."
            examples = [
                {"input": f"-- Select query for {title}", "output": "Table records showing compiled result set."}
            ]
            constraints = ["Observe table schemas in the sidebar to write compatible joins and aggregates."]

    return make_leetcode_style_html(desc, input_fmt, output_fmt, examples, constraints), default_input

# Setup questions lists
dsa_categories = {
    "Arrays": 30,
    "Strings": 30,
    "Linked Lists": 25,
    "Stacks & Queues": 25,
    "Trees & BST": 30,
    "Graphs": 25,
    "Recursion & Backtracking": 25,
    "Dynamic Programming": 35,
    "Sorting & Searching": 25,
}

questions = []
id_counter = 1

for category, count in dsa_categories.items():
    for idx in range(1, count + 1):
        num_str = f"{id_counter:03d}"
        title = f"{category[:-1] if category.endswith('s') else category} Problem {idx}"
        
        if category == "Arrays":
            names = ["Max Subarray (Kadane)", "Two Sum", "Container With Most Water", "Find Peak Element", "Sort Colors (0s 1s 2s)", "Product of Array Except Self", "Merge Intervals", "Insert Interval", "3Sum", "4Sum", "Next Permutation", "Set Matrix Zeroes", "Spiral Matrix", "Rotate Image", "Search in Rotated Array", "Find Minimum in Rotated", "Max Product Subarray", "Majority Element", "Move Zeroes", "Subarray Sum Equals K", "Game of Life", "Merge Sorted Arrays", "First Missing Positive", "Trapping Rain Water", "Best Time to Buy Sell Stock", "Best Time to Buy Sell Stock II", "Contains Duplicate", "Single Number", "Intersection of Arrays", "Plus One"]
            title = names[idx - 1] if idx <= len(names) else f"Array Challenge {idx}"
        elif category == "Strings":
            names = ["Reverse String", "Valid Anagram", "Longest Substring Without Repeating", "Valid Palindrome", "String to Integer (atoi)", "Longest Common Prefix", "Group Anagrams", "Implement strStr", "Count and Say", "Compare Version Numbers", "Multiply Strings", "Valid Parentheses", "Reverse Words in String", "Longest Palindromic Substring", "Edit Distance", "Is Subsequence", "Zigzag Conversion", "Palindromic Substrings", "Determine Color of Chessboard", "Replace All Question Marks", "Decrypt String Alphabet", "Merge Strings Alternately", "Check Pangram", "Sorting the Sentence", "Maximum Nesting Depth", "Truncate Sentence", "Count Items Matching Rule", "Goal Parser Interpretation", "Shuffle String", "Defanging IP Address"]
            title = names[idx - 1] if idx <= len(names) else f"String Challenge {idx}"
        elif category == "Linked Lists":
            names = ["Reverse Linked List", "Merge Two Sorted Lists", "Remove Nth Node From End", "Linked List Cycle", "Linked List Cycle II", "Intersection of Two Lists", "Palindrome Linked List", "Delete Node in Linked List", "Middle of Linked List", "Odd Even Linked List", "Swap Nodes in Pairs", "Rotate List", "Partition List", "Remove Duplicates", "Remove Duplicates II", "Add Two Numbers", "Add Two Numbers II", "Copy List with Random Pointer", "Sort List", "Reorder List", "Reverse Linked List II", "Merge K Sorted Lists", "Reverse Nodes in K-Group", "LFU Cache", "LRU Cache"]
            title = names[idx - 1] if idx <= len(names) else f"Linked List Challenge {idx}"
        elif category == "Stacks & Queues":
            names = ["Min Stack", "Implement Queue using Stacks", "Implement Stack using Queues", "Evaluate Reverse Polish", "Daily Temperatures", "Next Greater Element I", "Next Greater Element II", "Valid Parentheses Stack", "Simplify Path", "Generate Parentheses", "Decode String", "Asteroid Collision", "Online Stock Span", "Score of Parentheses", "Design Circular Queue", "Design Circular Deque", "Trapping Rain Water Stack", "Largest Rectangle in Histogram", "Maximal Rectangle", "Sliding Window Maximum", "Remove Duplicate Letters", "Basic Calculator", "Basic Calculator II", "Build Array with Stack Operations", "Crawler Log Folder"]
            title = names[idx - 1] if idx <= len(names) else f"Stack/Queue Challenge {idx}"
        elif category == "Trees & BST":
            names = ["Inorder Traversal", "Preorder Traversal", "Postorder Traversal", "Binary Tree Level Order", "Maximum Depth of Binary Tree", "Same Tree", "Symmetric Tree", "Invert Binary Tree", "Path Sum", "Path Sum II", "Path Sum III", "Lowest Common Ancestor BST", "Lowest Common Ancestor BT", "Validate BST", "Insert into BST", "Delete Node BST", "Kth Smallest in BST", "Binary Tree Right Side View", "Diameter of Binary Tree", "Balanced Binary Tree", "Convert Sorted Array to BST", "Merge Two Binary Trees", "Construct BT from Preorder Inorder", "Binary Tree Maximum Path Sum", "Serialize Deserialize Binary Tree", "Populating Next Right Pointers", "Flatten Binary Tree to List", "Sum Root to Leaf Numbers", "Binary Tree Zigzag", "Count Complete Tree Nodes"]
            title = names[idx - 1] if idx <= len(names) else f"Tree Challenge {idx}"
        elif category == "Graphs":
            names = ["Number of Islands", "Clone Graph", "Course Schedule", "Course Schedule II", "Pacific Atlantic Water Flow", "Redundant Connection", "Number of Connected Components", "Graph Valid Tree", "Word Ladder", "Dijkstra Algorithm", "Bellman Ford", "Floyd Warshall", "Kruskal Algorithm", "Prim Algorithm", "Reconstruct Itinerary", "Network Delay Time", "Cheapest Flights Within K Stops", "Is Graph Bipartite", "All Paths From Source to Target", "Rotting Oranges", "Find Eventual Safe States", "Keys and Rooms", "Shortest Path in Binary Matrix", "Number of Provinces", "Evaluate Division"]
            title = names[idx - 1] if idx <= len(names) else f"Graph Challenge {idx}"
        elif category == "Recursion & Backtracking":
            names = ["Subsets", "Subsets II", "Permutations", "Permutations II", "Combinations", "Combination Sum", "Combination Sum II", "Combination Sum III", "N-Queens", "N-Queens II", "Sudoku Solver", "Word Search", "Word Search II", "Palindrome Partitioning", "Generate Parentheses Recursion", "Letter Combinations", "Beautiful Arrangement", "Factor Combinations", "Target Sum", "Recursion Power", "Tower of Hanoi", "Josephus Problem", "Generate Power Set", "Matchsticks to Square", "IP Address Restoration"]
            title = names[idx - 1] if idx <= len(names) else f"Backtracking Challenge {idx}"
        elif category == "Dynamic Programming":
            names = ["Climbing Stairs", "Fibonacci Number", "House Robber", "House Robber II", "Longest Palindromic Substring DP", "Min Cost Climbing Stairs", "Unique Paths", "Unique Paths II", "Minimum Path Sum", "Integer Break", "Decode Ways", "Coin Change", "Coin Change II", "Longest Common Subsequence", "Longest Increasing Subsequence", "Word Break", "Partition Equal Subset Sum", "Edit Distance DP", "Maximum Product Subarray DP", "Best Time to Buy Sell Stock III", "Best Time to Buy Sell Stock IV", "Maximal Square", "One and Zeroes", "Combination Sum IV", "Target Sum DP", "Wiggle Subsequence", "Burst Balloons", "Super Egg Drop", "Distinct Subsequences", "Scramble String", "Palindrome Partitioning II", "Interleaving String", "Wildcard Matching", "Regular Expression Matching", "Triangle"]
            title = names[idx - 1] if idx <= len(names) else f"DP Challenge {idx}"
        elif category == "Sorting & Searching":
            names = ["Binary Search", "Search 2D Matrix", "Search 2D Matrix II", "Kth Largest Element", "Top K Frequent Elements", "Merge Sort", "Quick Sort", "Find First Last Position", "Search Insert Position", "Sqrt(x)", "Guess Number Higher Lower", "First Bad Version", "Peak Index Mountain Array", "Find Peak Element BS", "Search Rotated Array", "Search Rotated Array II", "Find Min Rotated", "Find Min Rotated II", "Koko Eating Bananas", "Capacity to Ship Packages", "Median of Two Sorted Arrays", "Sort Array", "Sort Characters By Frequency", "K Closest Points to Origin", "Intersection of Arrays II"]
            title = names[idx - 1] if idx <= len(names) else f"Sorting/Searching Challenge {idx}"

        difficulty = "Easy"
        if idx % 3 == 0:
            difficulty = "Hard"
        elif idx % 2 == 0:
            difficulty = "Medium"
            
        params = [("nums", "list_int"), ("target", "int")]
        ret_type = "int"

        # Override params and ret_type per problem type
        if any(k in title for k in ["Two Sum", "3Sum", "4Sum", "Intersection", "Top K", "K Closest"]):
            params = [("nums", "list_int"), ("target", "int")]
            ret_type = "list_int"
        elif any(k in title for k in ["Palindrome", "Valid Anagram", "Valid Palindrome", "Same Tree", "Cycle", "Pangram", "Bipartite", "Balanced", "Symmetric"]):
            ret_type = "bool"
        elif any(k in title for k in ["Reverse String", "Decrypt String", "Shuffle String", "Sorting the Sentence", "Goal Parser", "Defanging", "Truncate Sentence"]):
            params = [("s", "str")]
            ret_type = "str"
        elif any(k in title for k in ["Group Anagrams", "Valid Parentheses", "Letter Combinations"]):
            params = [("s", "str")]
            ret_type = "str"
        elif any(k in title for k in ["Word", "String to Integer", "Longest Common Prefix", "Longest Substring", "Longest Palindromic"]):
            params = [("s", "str")]
            ret_type = "int"
        elif any(k in title for k in ["Climbing Stairs", "Fibonacci", "Sqrt", "Guess Number", "First Bad", "Kth Largest", "Majority Element", "Single Number", "Move Zeroes", "House Robber", "Count"]):
            params = [("nums", "list_int"), ("target", "int")]
            ret_type = "int"
        elif any(k in title for k in ["Merge Sort", "Quick Sort", "Sort", "Rotate", "Product of Array", "Subsets", "Permutations", "Combinations", "Merge Sorted"]):
            params = [("nums", "list_int"), ("target", "int")]
            ret_type = "list_int"

            
        func_name = snake_case(title)
        desc_html, default_input = get_problem_details(title, f"DSA - {category}")

        questions.append({
            "id": f"dsa-{num_str}",
            "title": f"{id_counter}. {title}",
            "difficulty": difficulty,
            "category": f"DSA - {category}",
            "description": desc_html,
            "input": default_input,
            "templates": {
                "python": make_python_template(func_name, params, ret_type),
                "java": make_java_template(func_name, params, ret_type),
                "cpp": make_cpp_template(func_name, params, ret_type),
                "sql": f"-- This challenge is categorized under {category}.\n-- Select C++, Java, or Python to run this algorithm."
            }
        })
        id_counter += 1

sql_categories = {
    "Basic Select": 20,
    "Joins": 20,
    "Aggregations": 20,
    "Subqueries & CTEs": 20,
    "Window Functions": 20
}

sql_counter = 1
for category, count in sql_categories.items():
    for idx in range(1, count + 1):
        num_str = f"{sql_counter:03d}"
        title = f"SQL {category} Query {idx}"
        
        if category == "Basic Select":
            names = ["All Employees", "High Earners", "IT Department Staff", "Employees Hired in 2023", "Unique Employee Names", "Employees with No Manager", "Sort Employees by Salary", "Select Top 5 Budgets", "Find Specific Project", "Custom Columns Employees", "Salary Greater than 80000", "Employees under Manager 3", "Project Budget Range", "Location of Departments", "Employees starting with A", "Employees with High ID", "Project Budgets Descending", "Department Names list", "Distinct Job Locations", "Hired After Jan 2021"]
            title = names[idx - 1] if idx <= len(names) else f"Basic Query {idx}"
        elif category == "Joins":
            names = ["Employee Department Names", "Department Managers", "Employees on Projects", "Department Spending Joins", "Unassigned Projects", "Employees without Departments", "All Managers and Subordinates", "Project Hours per Employee", "High Budget Project Assignments", "Department Cities List", "Cross Join Teams", "Join Multi-Tables", "Self Join Bosses", "Department Budget Allotment", "Employees working > 40 Hours", "Subcontractor Project Hours", "Employees and Project Budgets", "Missing Department Logs", "Project and Departments Joined", "Location Wise Employees List"]
            title = names[idx - 1] if idx <= len(names) else f"Join Query {idx}"
        elif category == "Aggregations":
            names = ["Average Salary per Department", "Total Budget of All Projects", "Count of Employees in IT", "Maximum Salary in Company", "Total Hours Spent on Project 1", "Average Project Budget", "Total Salary Expense", "Count Departments in USA", "Min Max Salary per Dept", "Department Headcount", "Average Hours Worked", "Sum Hours Worked per Project", "Salary Stats overall", "Employee Count per Location", "Projects Count per Budget", "Average Department Salaries > 50000", "Maximum Project Hours Worked", "Count Employees under Manager 1", "Sum Budgets > 1000000", "Count Distinct Project Members"]
            title = names[idx - 1] if idx <= len(names) else f"Aggregation Query {idx}"
        elif category == "Subqueries & CTEs":
            names = ["Second Highest Salary", "Employees with Above Average Salary", "Highest Paid in Department", "Departments with No Employees Subquery", "CTE Department Headcount", "CTE Project Budget Ranking", "Subquery Manager Details", "Find Employees Hired Before Manager", "CTEs for Project Hour Sums", "CTE Employee Projects Info", "Subquery High Hours Worked", "Departments with Sum Salary > Average", "Project Budgets > Department Salaries", "Manager Salary Greater than Employee", "Double Nested Salary Subquery", "Department Name of Max Salary Employee", "CTE Highest Budget Projects Only", "Subquery Hired After Boss", "Employees not in Project 1", "Department Managers Average Salary"]
            title = names[idx - 1] if idx <= len(names) else f"Subquery/CTE Query {idx}"
        elif category == "Window Functions":
            names = ["Rank Employees by Salary", "Department Wise Salary Rank", "Dense Rank Project Budgets", "Row Number per Department Hired", "Lead Lag Salaries Comparison", "Moving Average Employee Salaries", "Running Total of Project Hours", "Percent Rank Salaries", "NTILE Salary Quartiles", "First Value Hire Date per Dept", "Last Value Budgets", "Lag Project Budget Differences", "Rank Projects by Hours Worked", "Window Sum Salaries per Location", "Row Number for Orders", "Running Total Order Amounts", "Order Item Counts Windowed", "Customer Order Frequency Rank", "Average Order Value Windowed", "Product Price Rank in Categories"]
            title = names[idx - 1] if idx <= len(names) else f"Window Function Query {idx}"

        desc_html, _ = get_problem_details(title, f"SQL - {category}")

        questions.append({
            "id": f"sql-{num_str}",
            "title": f"{sql_counter}. SQL: {title}",
            "difficulty": "Easy" if idx <= 7 else "Medium" if idx <= 15 else "Hard",
            "category": f"SQL - {category}",
            "description": desc_html,
            "input": "",
            "templates": {
                "mysql": f"-- Write your {category} SQL query here\n-- Use MySQL syntax\n",
                "postgres": f"-- Write your {category} SQL query here\n-- Use PostgreSQL syntax\n"
            }
        })
        sql_counter += 1

print(f"Generated {len(questions)} playground questions in total.")

def inject_questions(file_path):
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
    else:
        data = {}
        
    data["playground_questions"] = questions
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Injected and saved questions to: {file_path}")

inject_questions("backend/data.json")
inject_questions("frontend/public/data.json")
