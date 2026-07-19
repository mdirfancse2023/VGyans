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
    if category.startswith("SQL"):
        return get_sql_problem_details(title, category), "", [], "sql"

    # Define standard defaults
    desc = f"Write an algorithm to solve the <strong>{title}</strong> challenge."
    input_fmt = "Line 1: A JSON-formatted list of inputs."
    output_fmt = "Return the core result value."
    examples = [
        {"input": "[1, 2, 3]\n5", "output": "8"},
        {"input": "[10, -5, 20]\n10", "output": "30"}
    ]
    constraints = ["1 <= inputs.length <= 10^4", "-10^5 <= value <= 10^5"]
    default_input = "[1, 2, 3]\n5"
    params = [("nums", "list_int"), ("target", "int")]
    ret_type = "int"

    # Check for specific titles or category signatures to fill details correctly
    
    # ── ARRAYS ──
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
        params = [("nums", "list_int"), ("target", "int")]
        ret_type = "list_int"
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
        params = [("nums", "list_int")]
        ret_type = "int"
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
        params = [("height", "list_int")]
        ret_type = "int"
    elif "Find Peak Element" in title:
        desc = "Given an integer array <code>nums</code>, find a peak element, and return its index. A peak element is an element that is strictly greater than its neighbors."
        input_fmt = "Line 1: A JSON array of integers."
        output_fmt = "An integer representing the index of any peak element."
        examples = [
            {"input": "[1, 2, 3, 1]", "output": "2", "explanation": "3 is a peak element and its index is 2."}
        ]
        constraints = ["1 <= nums.length <= 1000", "-2^31 <= nums[i] <= 2^31 - 1"]
        default_input = "[1, 2, 3, 1]"
        params = [("nums", "list_int")]
        ret_type = "int"
    elif "Sort Colors" in title:
        desc = "Given an array <code>nums</code> with <code>n</code> objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue (represented by 0, 1, and 2 respectively)."
        input_fmt = "Line 1: A JSON array of integers containing only 0, 1, and 2."
        output_fmt = "A JSON array containing the sorted integers."
        examples = [
            {"input": "[2, 0, 2, 1, 1, 0]", "output": "[0, 0, 1, 1, 2, 2]"}
        ]
        constraints = ["n == nums.length", "1 <= n <= 300", "nums[i] is either 0, 1, or 2."]
        default_input = "[2, 0, 2, 1, 1, 0]"
        params = [("nums", "list_int")]
        ret_type = "list_int"
    elif "Product of Array Except Self" in title:
        desc = "Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>."
        input_fmt = "Line 1: A JSON array of integers."
        output_fmt = "A JSON array of products."
        examples = [
            {"input": "[1, 2, 3, 4]", "output": "[24, 12, 8, 6]"}
        ]
        constraints = ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer."]
        default_input = "[1, 2, 3, 4]"
        params = [("nums", "list_int")]
        ret_type = "list_int"
    elif "Interval" in title:
        desc = "Given an array of intervals where <code>intervals[i] = [start_i, end_i]</code>, merge or insert intervals as requested."
        input_fmt = "Line 1: A JSON-formatted 2D array representing intervals."
        output_fmt = "A JSON 2D array of modified intervals."
        examples = [
            {"input": "[[1, 3], [2, 6], [8, 10]]", "output": "[[1, 6], [8, 10]]"}
        ]
        constraints = ["1 <= intervals.length <= 10^4", "intervals[i].length == 2"]
        default_input = "[[1, 3], [2, 6], [8, 10]]"
        params = [("intervals", "list_int")]
        ret_type = "list_int"
    elif "3Sum" in title:
        desc = "Given an integer array <code>nums</code>, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, and <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>."
        input_fmt = "Line 1: A JSON array of integers."
        output_fmt = "A JSON 2D array of triplets."
        examples = [
            {"input": "[-1, 0, 1, 2, -1, -4]", "output": "[[-1, -1, 2], [-1, 0, 1]]"}
        ]
        constraints = ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"]
        default_input = "[-1, 0, 1, 2, -1, -4]"
        params = [("nums", "list_int")]
        ret_type = "list_int"
    elif "Best Time to Buy" in title:
        desc = "You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i</code>-th day. Find the maximum profit you can achieve."
        input_fmt = "Line 1: A JSON array of stock prices."
        output_fmt = "An integer representing max profit."
        examples = [
            {"input": "[7, 1, 5, 3, 6, 4]", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."}
        ]
        constraints = ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"]
        default_input = "[7, 1, 5, 3, 6, 4]"
        params = [("prices", "list_int")]
        ret_type = "int"
    elif "Plus One" in title:
        desc = "You are given a large integer represented as an integer array <code>digits</code>, where each <code>digits[i]</code> is the <code>i</code>-th digit of the integer. Increment the large integer by one and return the resulting array of digits."
        input_fmt = "Line 1: A JSON array of digits."
        output_fmt = "A JSON array showing the digits after incrementing."
        examples = [
            {"input": "[1, 2, 3]", "output": "[1, 2, 4]"}
        ]
        constraints = ["1 <= digits.length <= 100", "0 <= digits[i] <= 9"]
        default_input = "[1, 2, 3]"
        params = [("digits", "list_int")]
        ret_type = "list_int"

    # ── STRINGS ──
    elif "Reverse String" in title:
        desc = "Write a function that reverses a string. The input string is given as a string of characters."
        input_fmt = "Line 1: The input string wrapped in quotes (e.g. <code>\"hello\"</code>)"
        output_fmt = "The reversed string."
        examples = [
            {"input": "\"hello\"", "output": "\"olleh\""},
            {"input": "\"Hannah\"", "output": "\"hannaH\""}
        ]
        constraints = ["1 <= s.length <= 10^5", "s consists of printable ASCII characters."]
        default_input = "\"hello\""
        params = [("s", "str")]
        ret_type = "str"
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
        params = [("s", "str"), ("t", "str")]
        ret_type = "bool"
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
        params = [("s", "str")]
        ret_type = "bool"
    elif "Longest Substring Without Repeating" in title:
        desc = "Given a string <code>s</code>, find the length of the longest substring without repeating characters."
        input_fmt = "Line 1: A string wrapped in double quotes."
        output_fmt = "An integer representing the maximum length."
        examples = [
            {"input": "\"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."}
        ]
        constraints = ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."]
        default_input = "\"abcabcbb\""
        params = [("s", "str")]
        ret_type = "int"
    elif "Longest Common Prefix" in title:
        desc = "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string <code>\"\"</code>."
        input_fmt = "Line 1: A JSON-formatted list of strings."
        output_fmt = "A string representing the common prefix."
        examples = [
            {"input": "[\"flower\",\"flow\",\"flight\"]", "output": "\"fl\""}
        ]
        constraints = ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of only lowercase English letters."]
        default_input = "[\"flower\",\"flow\",\"flight\"]"
        params = [("strs", "list_str")]
        ret_type = "str"
    elif "Group Anagrams" in title:
        desc = "Given an array of strings <code>strs</code>, group the anagrams together. You can return the answer in any order."
        input_fmt = "Line 1: A JSON-formatted list of strings."
        output_fmt = "A JSON 2D list grouping the anagrams."
        examples = [
            {"input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}
        ]
        constraints = ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."]
        default_input = "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]"
        params = [("strs", "list_str")]
        ret_type = "list_list_str"

    # ── LINKED LISTS ──
    elif "Reverse Linked List" in title:
        desc = "Given the head of a singly linked list, reverse the list, and return its reversed head list values."
        input_fmt = "Line 1: A JSON array representing list values (e.g. <code>[1,2,3,4,5]</code>)"
        output_fmt = "A JSON array showing the reversed list node values."
        examples = [
            {"input": "[1, 2, 3, 4, 5]", "output": "[5, 4, 3, 2, 1]"}
        ]
        constraints = ["The number of nodes in the list is in the range [0, 5000].", "-5000 <= Node.val <= 5000"]
        default_input = "[1, 2, 3, 4, 5]"
        params = [("head", "list_int")]
        ret_type = "list_int"
    elif "Merge Two Sorted Lists" in title:
        desc = "Merge two sorted linked lists and return it as a new sorted list."
        input_fmt = "Line 1: First JSON-formatted sorted list (e.g. <code>[1,2,4]</code>)<br/>Line 2: Second sorted list (e.g. <code>[1,3,4]</code>)"
        output_fmt = "A JSON array representing the merged sorted list."
        examples = [
            {"input": "[1, 2, 4]\n[1, 3, 4]", "output": "[1, 1, 2, 3, 4, 4]"}
        ]
        constraints = ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100"]
        default_input = "[1, 2, 4]\n[1, 3, 4]"
        params = [("list1", "list_int"), ("list2", "list_int")]
        ret_type = "list_int"
    elif "Linked List Cycle" in title:
        desc = "Given head, the head of a linked list, determine if the linked list has a cycle in it."
        input_fmt = "Line 1: A JSON array representing list values."
        output_fmt = "Boolean (<code>true</code> or <code>false</code>)."
        examples = [
            {"input": "[3, 2, 0, -4]", "output": "true", "explanation": "There is a cycle in the linked list where tail connects to the second node."}
        ]
        constraints = ["The number of nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5"]
        default_input = "[3, 2, 0, -4]"
        params = [("head", "list_int")]
        ret_type = "bool"
    elif "Middle of the Linked List" in title or "Middle of Linked List" in title:
        desc = "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node."
        input_fmt = "Line 1: A JSON-formatted array of list values."
        output_fmt = "A JSON array representing list values starting from the middle node."
        examples = [
            {"input": "[1, 2, 3, 4, 5]", "output": "[3, 4, 5]"},
            {"input": "[1, 2, 3, 4, 5, 6]", "output": "[4, 5, 6]"}
        ]
        constraints = ["The number of nodes in the list is in the range [1, 100].", "1 <= Node.val <= 100"]
        default_input = "[1, 2, 3, 4, 5]"
        params = [("head", "list_int")]
        ret_type = "list_int"

    # ── STACKS & QUEUES ──
    elif "Valid Parentheses" in title:
        desc = "Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid."
        input_fmt = "Line 1: A string wrapped in quotes (e.g. <code>\"()[]{}\"</code>)"
        output_fmt = "Boolean (<code>true</code> or <code>false</code>)."
        examples = [
            {"input": "\"()[]{\u007d\"", "output": "true"},
            {"input": "\"(]\"", "output": "false"}
        ]
        constraints = ["1 <= s.length <= 10^4", "s consists of parentheses characters only."]
        default_input = "\"()[]{}\""
        params = [("s", "str")]
        ret_type = "bool"
    elif "Daily Temperatures" in title:
        desc = "Given an array of integers <code>temperatures</code> representing the daily temperatures, return an array <code>answer</code> such that <code>answer[i]</code> is the number of days you have to wait after the <code>i</code>-th day to get a warmer temperature."
        input_fmt = "Line 1: A JSON-formatted array of temperatures."
        output_fmt = "A JSON array representing the days to wait."
        examples = [
            {"input": "[73, 74, 75, 71, 69, 72, 76, 73]", "output": "[1, 1, 4, 2, 1, 1, 0, 0]"}
        ]
        constraints = ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"]
        default_input = "[73, 74, 75, 71, 69, 72, 76, 73]"
        params = [("temperatures", "list_int")]
        ret_type = "list_int"

    # ── TREES & BST ──
    elif "Invert Binary Tree" in title:
        desc = "Given the root of a binary tree, invert the tree, and return its root."
        input_fmt = "Line 1: A JSON-formatted level-order traversal array of the tree (e.g. <code>[4,2,7,1,3,6,9]</code>)"
        output_fmt = "A JSON level-order traversal array of the inverted tree."
        examples = [
            {"input": "[4, 2, 7, 1, 3, 6, 9]", "output": "[4, 7, 2, 9, 6, 3, 1]"}
        ]
        constraints = ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"]
        default_input = "[4, 2, 7, 1, 3, 6, 9]"
        params = [("root", "list_int")]
        ret_type = "list_int"
    elif "Maximum Depth of Binary Tree" in title:
        desc = "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node."
        input_fmt = "Line 1: A JSON level-order traversal array of the tree."
        output_fmt = "An integer depth value."
        examples = [
            {"input": "[3, 9, 20, null, null, 15, 7]", "output": "3"}
        ]
        constraints = ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"]
        default_input = "[3, 9, 20, null, null, 15, 7]"
        params = [("root", "list_int")]
        ret_type = "int"
    elif "Same Tree" in title:
        desc = "Given the roots of two binary trees <code>p</code> and <code>q</code>, write a function to check if they are the same or not."
        input_fmt = "Line 1: Level-order traversal of tree p.<br/>Line 2: Level-order traversal of tree q."
        output_fmt = "Boolean (<code>true</code> or <code>false</code>)."
        examples = [
            {"input": "[1, 2, 3]\n[1, 2, 3]", "output": "true"}
        ]
        constraints = ["The number of nodes in both trees is in the range [0, 100]."]
        default_input = "[1, 2, 3]\n[1, 2, 3]"
        params = [("p", "list_int"), ("q", "list_int")]
        ret_type = "bool"

    # ── GRAPHS ──
    elif "Number of Islands" in title:
        desc = "Given an <code>m x n</code> 2D binary grid <code>grid</code> which represents a map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return the number of islands."
        input_fmt = "Line 1: A JSON-formatted 2D array representing the binary grid."
        output_fmt = "An integer representing the total count of islands."
        examples = [
            {"input": "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", "output": "3"}
        ]
        constraints = ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."]
        default_input = "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]"
        params = [("grid", "list_str")]
        ret_type = "int"
    elif "Course Schedule" in title:
        desc = "There are a total of <code>numCourses</code> courses you have to take, labeled from <code>0</code> to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a_i, b_i]</code> indicates that you must take course <code>b_i</code> first if you want to take course <code>a_i</code>. Determine if you can finish all courses."
        input_fmt = "Line 1: Integer numCourses.<br/>Line 2: JSON 2D array of prerequisites."
        output_fmt = "Boolean (<code>true</code> or <code>false</code>)."
        examples = [
            {"input": "2\n[[1, 0]]", "output": "true"}
        ]
        constraints = ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"]
        default_input = "2\n[[1, 0]]"
        params = [("numCourses", "int"), ("prerequisites", "list_int")]
        ret_type = "bool"

    # ── RECURSION & BACKTRACKING ──
    elif "Subsets" in title:
        desc = "Given an integer array <code>nums</code> of unique elements, return all possible subsets (the power set)."
        input_fmt = "Line 1: A JSON array of integers (e.g. <code>[1,2,3]</code>)"
        output_fmt = "A JSON 2D array containing all subset lists."
        examples = [
            {"input": "[1, 2, 3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"}
        ]
        constraints = ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All elements of nums are unique."]
        default_input = "[1, 2, 3]"
        params = [("nums", "list_int")]
        ret_type = "list_int"
    elif "Permutations" in title:
        desc = "Given an array <code>nums</code> of distinct integers, return all the possible permutations. You can return the answer in any order."
        input_fmt = "Line 1: A JSON array of integers."
        output_fmt = "A JSON 2D array of all permutations."
        examples = [
            {"input": "[1, 2, 3]", "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"}
        ]
        constraints = ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10"]
        default_input = "[1, 2, 3]"
        params = [("nums", "list_int")]
        ret_type = "list_int"

    # ── DYNAMIC PROGRAMMING ──
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
        params = [("n", "int")]
        ret_type = "int"
    elif "Coin Change" in title:
        desc = "You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code> representing a total amount of money. Return the fewest number of coins that you need to make up that amount."
        input_fmt = "Line 1: A JSON-formatted list of coin values.<br/>Line 2: Target integer amount."
        output_fmt = "Integer representing minimum coins count, or -1 if impossible."
        examples = [
            {"input": "[1, 2, 5]\n11", "output": "3", "explanation": "11 = 5 + 5 + 1 (3 coins)."},
            {"input": "[2]\n3", "output": "-1"}
        ]
        constraints = ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"]
        default_input = "[1, 2, 5]\n11"
        params = [("coins", "list_int"), ("amount", "int")]
        ret_type = "int"
    elif "Unique Paths" in title:
        desc = "There is a robot on an <code>m x n</code> grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. Return the number of possible unique paths."
        input_fmt = "Line 1: Integer rows m.<br/>Line 2: Integer columns n."
        output_fmt = "An integer representing the number of paths."
        examples = [
            {"input": "3\n7", "output": "28"}
        ]
        constraints = ["1 <= m, n <= 100"]
        default_input = "3\n7"
        params = [("m", "int"), ("n", "int")]
        ret_type = "int"

    # ── SORTING & SEARCHING ──
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
        params = [("nums", "list_int"), ("target", "int")]
        ret_type = "int"
    elif "Kth Largest Element" in title:
        desc = "Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code>-th largest element in the array."
        input_fmt = "Line 1: JSON array of integers.<br/>Line 2: Integer k."
        output_fmt = "Integer representing kth largest element value."
        examples = [
            {"input": "[3, 2, 1, 5, 6, 4]\n2", "output": "5"}
        ]
        constraints = ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"]
        default_input = "[3, 2, 1, 5, 6, 4]\n2"
        params = [("nums", "list_int"), ("k", "int")]
        ret_type = "int"

    # ── CATEGORY-BASED FALLBACK ──
    else:
        if "String" in category or "Strings" in category:
            desc = f"Given a string <code>s</code>, write an algorithm to solve the <strong>{title}</strong> challenge."
            input_fmt = "Line 1: A double-quoted string (e.g. <code>\"abcd\"</code>)"
            output_fmt = "The computed string or integer result."
            examples = [
                {"input": "\"helloworld\"", "output": "10"}
            ]
            constraints = ["1 <= s.length <= 10^5", "s consists of lowercase English letters."]
            default_input = "\"helloworld\""
            params = [("s", "str")]
            ret_type = "int" if "Count" in title or "Length" in title or "Find" in title else "str"
        elif "Linked List" in category:
            desc = f"Given the head of a singly linked list, solve the <strong>{title}</strong> challenge."
            input_fmt = "Line 1: A JSON-formatted array representing nodes of the list (e.g. <code>[1,2,3,4]</code>)"
            output_fmt = "A JSON array showing the modified list node values."
            examples = [
                {"input": "[1, 2, 3, 4]", "output": "[1, 2, 3, 4]"}
            ]
            constraints = ["The number of nodes in the list is in the range [0, 5000].", "-100 <= Node.val <= 100"]
            default_input = "[1, 2, 3, 4]"
            params = [("head", "list_int")]
            ret_type = "list_int"
        elif "Tree" in category:
            desc = f"Given the root of a binary tree, solve the tree-based challenge: <strong>{title}</strong>."
            input_fmt = "Line 1: A level-order traversal array of the tree (e.g. <code>[1,null,2,3]</code>)"
            output_fmt = "The computed traversal list or integer result."
            examples = [
                {"input": "[1, null, 2, 3]", "output": "3" if "Depth" in title or "Count" in title else "[1, 2, 3]"}
            ]
            constraints = ["The number of nodes in the tree is in the range [0, 1000]."]
            default_input = "[1, null, 2, 3]"
            params = [("root", "list_int")]
            ret_type = "int" if "Depth" in title or "Count" in title or "Diameter" in title else "list_int"
        elif "Graph" in category:
            desc = f"Write an algorithm to solve the <strong>{title}</strong> graph challenge."
            input_fmt = "Line 1: A JSON-formatted list of edges or adjacency list (e.g. <code>[[0,1],[1,2]]</code>)"
            output_fmt = "The traversal paths or boolean result."
            examples = [
                {"input": "[[0, 1], [1, 2], [2, 0]]", "output": "true" if "Cycle" in title or "Schedule" in title else "1"}
            ]
            constraints = ["1 <= vertices <= 500", "0 <= edges.length <= 1000"]
            default_input = "[[0, 1], [1, 2], [2, 0]]"
            params = [("edges", "list_int")]
            ret_type = "bool" if "Cycle" in title or "Schedule" in title or "Bipartite" in title else "int"
        elif "Sorting" in category or "Searching" in category:
            desc = f"Given an array of integers <code>nums</code>, solve the <strong>{title}</strong> sorting/searching problem."
            input_fmt = "Line 1: A JSON array of integers (e.g. <code>[4,2,1,3]</code>)"
            output_fmt = "The sorted array, element value, or index."
            examples = [
                {"input": "[4, 2, 1, 3]", "output": "[1, 2, 3, 4]"}
            ]
            constraints = ["1 <= nums.length <= 10^5", "-10^5 <= nums[i] <= 10^5"]
            default_input = "[4, 2, 1, 3]"
            params = [("nums", "list_int")]
            ret_type = "list_int" if "Sort" in title else "int"
        elif "Stack" in category or "Queue" in category:
            desc = f"Using stack/queue operations, solve the <strong>{title}</strong> challenge."
            input_fmt = "Line 1: A JSON array of operations or elements."
            output_fmt = "The computed evaluation result."
            examples = [
                {"input": "[1, 2, 3]", "output": "3"}
            ]
            constraints = ["1 <= elements.length <= 10^4"]
            default_input = "[1, 2, 3]"
            params = [("nums", "list_int")]
            ret_type = "int"
        elif "Dynamic" in category or "DP" in category:
            desc = f"Write an optimized dynamic programming solution for the <strong>{title}</strong> challenge."
            input_fmt = "Line 1: A JSON list of values or single integer."
            output_fmt = "The optimized maximum profit, minimum path, or count value."
            examples = [
                {"input": "[10, 15, 20]", "output": "15"}
            ]
            constraints = ["1 <= values.length <= 10^5"]
            default_input = "[10, 15, 20]"
            params = [("nums", "list_int")]
            ret_type = "int"
        else:
            desc = f"Write an algorithm to solve the <strong>{title}</strong> challenge."
            input_fmt = "Line 1: A JSON-formatted list of inputs."
            output_fmt = "Return the core result value."
            examples = [
                {"input": "[1, 2, 3]\n5", "output": "8"}
            ]
            constraints = ["1 <= inputs.length <= 10^4"]
            default_input = "[1, 2, 3]\n5"
            params = [("nums", "list_int"), ("target", "int")]
            ret_type = "int"

    return make_leetcode_style_html(desc, input_fmt, output_fmt, examples, constraints), default_input, params, ret_type

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
            
        func_name = snake_case(title)
        desc_html, default_input, params, ret_type = get_problem_details(title, f"DSA - {category}")

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

        desc_html, _, _, _ = get_problem_details(title, f"SQL - {category}")

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
