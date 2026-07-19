import json
import os
os.environ["GRPC_DNS_RESOLVER"] = "native"
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

def get_dsa_description(title, category):
    t_lower = title.lower()
    
    # 1. Binary Trees / BST
    if "tree" in category.lower() or "bst" in category.lower():
        if "inorder" in t_lower:
            return "Given the root of a binary tree, return the <strong>inorder traversal</strong> (Left -> Root -> Right) of its nodes' values."
        if "preorder" in t_lower:
            return "Given the root of a binary tree, return the <strong>preorder traversal</strong> (Root -> Left -> Right) of its nodes' values."
        if "postorder" in t_lower:
            return "Given the root of a binary tree, return the <strong>postorder traversal</strong> (Left -> Right -> Root) of its nodes' values."
        if "level order" in t_lower:
            return "Given the root of a binary tree, return the <strong>level order traversal</strong> (i.e., from left to right, level by level) of its nodes' values."
        if "right side view" in t_lower:
            return "Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see ordered from top to bottom."
        if "zigzag" in t_lower:
            return "Given the root of a binary tree, return the <strong>zigzag level order traversal</strong> of its nodes' values. (i.e., from left to right, then right to left for the next level and alternate)."
        if "invert" in t_lower:
            return "Given the root of a binary tree, <strong>invert the tree</strong> (swap all left and right subtrees) and return its root."
        if "depth" in t_lower or "height" in t_lower:
            return "Given the root of a binary tree, return its <strong>maximum depth</strong>. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node."
        if "same tree" in t_lower:
            return "Given the roots of two binary trees <code>p</code> and <code>q</code>, write a function to check if they are the same or not (structurally identical and nodes have same values)."
        if "symmetric" in t_lower:
            return "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center)."
        if "validate" in t_lower:
            return "Given the root of a binary tree, determine if it is a valid <strong>Binary Search Tree (BST)</strong>. Left subtree must contain values less than node, right subtree values greater than node."
        if "insert" in t_lower:
            return "Given the root node of a Binary Search Tree (BST) and a value to insert into the tree, insert the value into the BST and return the root of the modified BST."
        if "delete" in t_lower:
            return "Given a root node reference of a BST and a key, delete the node with the given key in the BST, maintaining the BST property."
        if "kth smallest" in t_lower:
            return "Given the root of a binary search tree, and an integer <code>k</code>, return the <code>k</code>-th smallest value (1-indexed) of all the values of the nodes in the tree."
        if "lca" in t_lower or "lowest common ancestor" in t_lower:
            return "Given a binary tree or BST, find the <strong>lowest common ancestor (LCA)</strong> node of two given nodes <code>p</code> and <code>q</code>."
        if "path sum ii" in t_lower:
            return "Given the root of a binary tree and an integer <code>targetSum</code>, return all root-to-leaf paths where the sum of the node values in the path equals <code>targetSum</code>."
        if "path sum iii" in t_lower:
            return "Given the root of a binary tree and an integer <code>targetSum</code>, return the number of paths that sum to <code>targetSum</code> (paths do not need to start at root/end at leaf)."
        if "path sum" in t_lower:
            return "Given the root of a binary tree and an integer <code>targetSum</code>, return <code>true</code> if the tree has a root-to-leaf path such that adding up all the values along the path equals <code>targetSum</code>."
        if "diameter" in t_lower:
            return "Given the root of a binary tree, return the length of the <strong>diameter</strong> of the tree (length of the longest path between any two nodes)."
        if "balanced" in t_lower:
            return "Given a binary tree, determine if it is height-balanced (depth of two subtrees of every node never differs by more than 1)."
        if "merge two binary" in t_lower:
            return "Given two binary trees, merge them into a new binary tree. If two nodes overlap, sum their values. Otherwise, use the non-null node."
        if "serialize" in t_lower:
            return "Design an algorithm to serialize and deserialize a binary tree into a string and back to a tree."
        if "flatten" in t_lower:
            return "Given the root of a binary tree, flatten the tree into a singly linked list in-place using preorder traversal."
        if "sum root to leaf" in t_lower:
            return "Each root-to-leaf path in a binary tree represents a number formed by its digits. Return the total sum of all root-to-leaf numbers."
        if "complete tree nodes" in t_lower:
            return "Given the root of a complete binary tree, return the total number of nodes in the tree in less than O(N) time."

    # 2. Linked Lists
    if "linked list" in category.lower():
        if "reverse linked list ii" in t_lower:
            return "Given the head of a singly linked list and two integers <code>left</code> and <code>right</code>, reverse the nodes of the list from position <code>left</code> to position <code>right</code>, and return the modified list."
        if "reverse" in t_lower:
            return "Given the head of a singly linked list, reverse the list, and return its new head."
        if "merge k sorted" in t_lower:
            return "You are given an array of <code>k</code> linked-lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it."
        if "merge two sorted" in t_lower or "merge sorted" in t_lower:
            return "Merge two sorted linked lists and return it as a new sorted list."
        if "cycle ii" in t_lower:
            return "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return <code>null</code>."
        if "cycle" in t_lower:
            return "Given head, the head of a linked list, determine if the linked list has a cycle in it."
        if "remove nth node" in t_lower or "nth node from end" in t_lower:
            return "Given the head of a linked list, remove the <code>n</code>-th node from the end of the list and return its head."
        if "intersection" in t_lower:
            return "Given the heads of two singly linked-lists <code>headA</code> and <code>headB</code>, return the node at which the two lists intersect. If they have no intersection, return <code>null</code>."
        if "palindrome" in t_lower:
            return "Given the head of a singly linked list, return <code>true</code> if it is a palindrome (values read same forward and backward)."
        if "delete node" in t_lower:
            return "Write a function to delete a node in a singly linked list. You will only be given access to that specific node to be deleted."
        if "middle" in t_lower:
            return "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second one."
        if "odd even" in t_lower:
            return "Given the head of a singly linked list, group all the odd-indexed nodes together followed by the even-indexed nodes, and return the reordered list."
        if "swap nodes" in t_lower or "swap pairs" in t_lower:
            return "Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying values in the nodes."
        if "rotate" in t_lower:
            return "Given the head of a linked list, rotate the list to the right by <code>k</code> places."
        if "partition" in t_lower:
            return "Given the head of a linked list and a value <code>x</code>, partition it such that all nodes less than <code>x</code> come before nodes greater than or equal to <code>x</code>."
        if "remove duplicates ii" in t_lower:
            return "Given the head of a sorted linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list."
        if "remove duplicates" in t_lower:
            return "Given the head of a sorted linked list, delete all duplicates such that each element appears only once."
        if "add two numbers ii" in t_lower:
            return "You are given two non-empty linked lists representing non-negative integers. The most significant digit comes first. Add the two numbers and return it as a linked list."
        if "add two numbers" in t_lower:
            return "You are given two non-empty linked lists representing non-negative integers, stored in reverse order. Add the two numbers and return it as a linked list."
        if "copy list with random" in t_lower:
            return "A linked list is given such that each node contains an additional random pointer which could point to any node in the list or null. Construct a deep copy of the list."
        if "sort list" in t_lower:
            return "Given the head of a linked list, return the list after sorting it in O(n log n) time and O(1) memory."
        if "reorder" in t_lower:
            return "Reorder the singly linked list to follow the pattern: L0 → Ln → L1 → Ln-1 → L2 → Ln-2..."
        if "lru cache" in t_lower:
            return "Design a data structure that follows the constraints of a <strong>Least Recently Used (LRU) Cache</strong> with get and put operations in O(1) time."
        if "lfu cache" in t_lower:
            return "Design a data structure that follows the constraints of a <strong>Least Frequently Used (LFU) Cache</strong> with get and put operations in O(1) time."

    # 3. Stacks & Queues
    if "stack" in category.lower() or "queue" in category.lower():
        if "min stack" in t_lower:
            return "Design a stack that supports push, pop, top, and retrieving the minimum element in constant O(1) time."
        if "queue using stacks" in t_lower:
            return "Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support push, pop, peek, and empty."
        if "stack using queues" in t_lower:
            return "Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support push, pop, top, and empty."
        if "evaluate reverse polish" in t_lower or "polish" in t_lower:
            return "Evaluate the value of an arithmetic expression in <strong>Reverse Polish Notation (postfix)</strong>. Valid operators are +, -, *, and /."
        if "daily temperatures" in t_lower:
            return "Given an array of integers <code>temperatures</code>, return an array <code>answer</code> such that <code>answer[i]</code> is the number of days you have to wait to get a warmer temperature."
        if "next greater element ii" in t_lower:
            return "Given a circular integer array <code>nums</code>, return the next greater number for every element. If it doesn't exist, return -1."
        if "next greater element" in t_lower:
            return "Find the next greater element for each element in the array."
        if "simplify path" in t_lower:
            return "Given an absolute Unix-style path, convert it to the simplified canonical path (resolving '.', '..', and double slashes)."
        if "generate parentheses" in t_lower:
            return "Given <code>n</code> pairs of parentheses, write a function to generate all combinations of well-formed parentheses."
        if "decode string" in t_lower:
            return "Given an encoded string (e.g. <code>3[a]2[bc]</code>), return its decoded string (e.g. <code>aaabcbc</code>)."
        if "asteroid collision" in t_lower:
            return "Find the state of the asteroids after all collisions in a row. Asteroids move at same speed, positive right, negative left. Larger asteroid destroys smaller."
        if "online stock span" in t_lower:
            return "Design an algorithm that collects daily price quotes for some stock and returns the span of that stock's price for the current day."
        if "score of parentheses" in t_lower:
            return "Given a balanced parentheses string, return its score: () has score 1, AB has score A+B, (A) has score 2*A."
        if "circular queue" in t_lower:
            return "Design your implementation of the circular queue (FIFO buffer)."
        if "circular deque" in t_lower:
            return "Design your implementation of the circular double-ended queue (deque)."
        if "largest rectangle" in t_lower:
            return "Given an array of integers representing histogram heights, find the area of the largest rectangle in the histogram."
        if "maximal rectangle" in t_lower:
            return "Given a rows x cols binary matrix filled with 0s and 1s, find the largest rectangle containing only 1s and return its area."
        if "sliding window maximum" in t_lower:
            return "Given an array of integers and a sliding window of size <code>k</code>, return the maximum element in the window at each position."

    # 4. Graphs
    if "graph" in category.lower():
        if "islands" in t_lower:
            return "Given an m x n 2D binary grid representing land ('1') and water ('0'), count and return the total number of connected islands."
        if "clone graph" in t_lower:
            return "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph."
        if "course schedule ii" in t_lower:
            return "Return the ordering of courses you should take to finish all courses given course prerequisites. Return empty list if impossible."
        if "course schedule" in t_lower:
            return "Determine if you can finish all courses given pre-requisite list dependencies."
        if "pacific atlantic" in t_lower:
            return "Given an m x n island that borders both the Pacific Ocean and Atlantic Ocean. Return a list of grid coordinates where rain water can flow to both oceans."
        if "redundant connection" in t_lower:
            return "Given an undirected graph that started as a tree but had one edge added, find and return that redundant edge."
        if "valid tree" in t_lower:
            return "Given n nodes and a list of undirected edges, check if these edges make up a valid tree (connected and acyclic)."
        if "word ladder" in t_lower:
            return "Given beginWord, endWord, and wordList, find the length of the shortest transformation sequence from beginWord to endWord."
        if "dijkstra" in t_lower:
            return "Implement Dijkstra's shortest path algorithm to find the minimum distance from source to all other vertices in a weighted graph."
        if "bellman" in t_lower:
            return "Implement the Bellman-Ford shortest path algorithm which can handle negative edge weights."
        if "floyd" in t_lower:
            return "Implement the Floyd-Warshall all-pairs shortest path algorithm."
        if "kruskal" in t_lower:
            return "Implement Kruskal's algorithm to find the Minimum Spanning Tree (MST) of a weighted graph."
        if "prim" in t_lower:
            return "Implement Prim's algorithm to find the Minimum Spanning Tree (MST) of a weighted graph."
        if "rotting oranges" in t_lower:
            return "Find the minimum minutes elapsed until all fresh oranges are rotten, given rotten oranges spread to adjacent cells every minute."
        if "keys and rooms" in t_lower:
            return "There are n locked rooms. Each room contains keys to other rooms. Check if you can visit all rooms starting from room 0."
        if "shortest path in binary" in t_lower:
            return "Return the length of the shortest clear path (from top-left to bottom-right) in an n x n binary matrix. Cells must be 0."
        if "provinces" in t_lower or "connected components" in t_lower:
            return "Given an adjacency matrix, return the total number of connected components (provinces)."

    # 5. Recursion & Backtracking
    if "recursion" in category.lower() or "backtracking" in category.lower():
        if "subsets ii" in t_lower:
            return "Given an integer array nums that may contain duplicates, return all possible unique subsets (the power set)."
        if "subsets" in t_lower:
            return "Given an integer array of unique elements, return all possible subsets (the power set)."
        if "permutations ii" in t_lower:
            return "Given a collection of numbers that might contain duplicates, return all possible unique permutations."
        if "permutations" in t_lower:
            return "Given an array of distinct integers, return all the possible permutations."
        if "combination sum iii" in t_lower:
            return "Find all valid combinations of k numbers that sum up to target, using only numbers from 1 to 9 (each number at most once)."
        if "combination sum ii" in t_lower:
            return "Given candidate numbers and a target, find all unique combinations where the candidate numbers sum to target (use each number once)."
        if "combination sum" in t_lower:
            return "Given candidate numbers and a target, find all unique combinations where the candidates sum to target (numbers can be reused)."
        if "combinations" in t_lower:
            return "Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n]."
        if "n-queens ii" in t_lower:
            return "Return the total number of distinct solutions to the n-queens puzzle on an n x n chessboard."
        if "n-queens" in t_lower:
            return "Solve the n-queens puzzle, returning all distinct board configurations where n queens are placed safely."
        if "sudoku" in t_lower:
            return "Write a program to solve a Sudoku puzzle by filling the empty cells (marked with '.')."
        if "word search ii" in t_lower:
            return "Given an m x n board of characters and a list of words, return all words that can be constructed on the board."
        if "word search" in t_lower:
            return "Given an m x n grid of characters board and a string word, check if the word can be formed by letters of sequentially adjacent cells."
        if "palindrome partitioning" in t_lower:
            return "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible partitionings."
        if "letter combinations" in t_lower:
            return "Given a string containing digits from 2-9, return all possible letter combinations that the number could represent (like phone dialer)."

    # 6. Dynamic Programming
    if "dynamic" in category.lower() or "dp" in category.lower():
        if "climbing stairs" in t_lower:
            return "It takes n steps to reach the top. Each time you can climb 1 or 2 steps. Return the number of unique ways to reach the top."
        if "fibonacci" in t_lower:
            return "Calculate the n-th Fibonacci number where F(n) = F(n-1) + F(n-2)."
        if "house robber ii" in t_lower:
            return "Rob houses arranged in a circle (first house is neighbor of last). Return the maximum money you can rob without robbing adjacent houses."
        if "house robber" in t_lower:
            return "Rob houses along a street. Return the maximum money you can rob tonight without robbing adjacent houses."
        if "unique paths ii" in t_lower:
            return "Find the number of unique paths from top-left to bottom-right of a grid containing obstacles (marked as 1)."
        if "unique paths" in t_lower:
            return "Find the number of unique paths from top-left to bottom-right of an m x n grid (can only move down or right)."
        if "minimum path sum" in t_lower:
            return "Given an m x n grid filled with non-negative numbers, find a path from top-left to bottom-right which minimizes the sum of all numbers."
        if "coin change ii" in t_lower:
            return "Given coins of different denominations and a target amount, return the number of combinations that make up that amount."
        if "coin change" in t_lower:
            return "Given coins of different denominations and a target amount, return the fewest number of coins needed to make that amount."
        if "longest common subsequence" in t_lower:
            return "Given two strings text1 and text2, return the length of their longest common subsequence."
        if "longest increasing subsequence" in t_lower:
            return "Given an integer array, return the length of the longest strictly increasing subsequence."
        if "word break" in t_lower:
            return "Given a string s and a dictionary of words, determine if the string can be segmented into a space-separated sequence of dictionary words."
        if "partition equal" in t_lower:
            return "Determine if an array can be partitioned into two subsets such that the sum of elements in both subsets is equal."
        if "maximal square" in t_lower:
            return "Given an m x n binary matrix filled with 0s and 1s, find the largest square containing only 1s and return its area."
        if "target sum" in t_lower:
            return "Find the number of ways to assign + or - signs to array elements so that the sum of the array equals target."

    # 7. Sorting & Searching
    if "sorting" in category.lower() or "searching" in category.lower():
        if "binary search" in t_lower:
            return "Given a sorted ascending array of integers and a target, search for target and return its index, or -1 if not found."
        if "search 2d matrix ii" in t_lower:
            return "Search for target in an m x n matrix where rows are sorted left-to-right and columns are sorted top-to-bottom."
        if "search 2d matrix" in t_lower:
            return "Search for target in an m x n matrix where rows are sorted and the first integer of each row is greater than last of previous."
        if "kth largest" in t_lower:
            return "Given an unsorted array of integers, return the k-th largest element (not the k-th distinct element)."
        if "top k frequent" in t_lower:
            return "Given an integer array, return the k most frequent elements in any order."
        if "merge sort" in t_lower:
            return "Implement the Merge Sort algorithm to sort an array of integers in ascending order in O(N log N) time."
        if "quick sort" in t_lower:
            return "Implement the Quick Sort algorithm to sort an array of integers in ascending order."
        if "find first last" in t_lower:
            return "Given a sorted array, find the starting and ending position of a given target value. Return [-1, -1] if not found."
        if "search insert" in t_lower:
            return "Given a sorted array and a target, return the index if target is found, or the index where it would be if inserted in order."
        if "sqrt" in t_lower:
            return "Given a non-negative integer x, compute and return the square root of x, rounded down to the nearest integer."
        if "first bad version" in t_lower:
            return "Given n versions [1..n] and an API isBadVersion(version), find the first bad version which causes all subsequent versions to be bad."
        if "koko eating" in t_lower:
            return "Find the minimum integer speed k (bananas/hour) such that Koko can eat all bananas in piles within h hours."
        if "median of two sorted" in t_lower:
            return "Given two sorted arrays, return the median of the two sorted arrays in O(log(m+n)) time."

    # 8. Strings
    if "string" in category.lower():
        if "string to integer" in t_lower or "atoi" in t_lower:
            return "Implement the <code>myAtoi(string s)</code> function, which converts a string to a 32-bit signed integer (similar to C/C++'s <code>atoi</code>)."
        if "strstr" in t_lower:
            return "Given two strings <code>needle</code> and <code>haystack</code>, return the index of the first occurrence of <code>needle</code> in <code>haystack</code>, or <code>-1</code>."
        if "count and say" in t_lower:
            return "Generate the n-th term of the count-and-say sequence (run-length encoding of the previous term)."
        if "compare version" in t_lower:
            return "Compare two version strings version1 and version2, returning 1 if version1 > version2, -1 if version1 < version2, or 0 if equal."
        if "multiply strings" in t_lower:
            return "Multiply two non-negative integers represented as strings and return the product as a string."
        if "reverse words" in t_lower:
            return "Given an input string, reverse the order of the words."
        if "longest palindromic" in t_lower:
            return "Given a string, return the longest palindromic substring in it."
        if "edit distance" in t_lower:
            return "Find the minimum number of operations (insert, delete, replace) required to convert word1 to word2."
        if "is subsequence" in t_lower:
            return "Given s and t, check if s is a subsequence of t."
        if "zigzag" in t_lower:
            return "Convert a string to a zigzag pattern on n rows and read line-by-line."
        if "palindromic substrings" in t_lower:
            return "Given a string s, return the total count of palindromic substrings in it."
        if "color of chessboard" in t_lower:
            return "Determine if the square at the given coordinate on a standard chessboard is white (return true) or black (return false)."
        if "replace all question" in t_lower:
            return "Replace all '?' characters in a string with lowercase letters so that no two adjacent characters are identical."
        if "decrypt string" in t_lower:
            return "Decrypt a string formed by digits mapped to lowercase alphabet characters (digits 1-9 to a-i, 10# to 26# to j-z)."
        if "merge strings alternately" in t_lower:
            return "Merge two strings by adding letters in alternating order, appending any remaining suffix letters."
        if "pangram" in t_lower:
            return "Check if a sentence contains every letter of the English alphabet at least once."
        if "sorting the sentence" in t_lower:
            return "Reconstruct a sentence from shuffled words that are postfixed with their original 1-indexed word positions."
        if "nesting depth" in t_lower:
            return "Return the maximum nesting depth of parentheses in a valid parentheses string."
        if "truncate sentence" in t_lower:
            return "Truncate a sentence to contain only the first k words."
        if "items matching rule" in t_lower:
            return "Count the number of items that match a specific rule key ('type', 'color', or 'name') and rule value."
        if "goal parser" in t_lower:
            return "Parse Goal Parser commands where 'G' -> 'G', '()' -> 'o', and '(al)' -> 'al'."
        if "shuffle string" in t_lower:
            return "Restore a shuffled string where each character moves to its designated index from the indices array."
        if "defanging ip" in t_lower or "defang" in t_lower:
            return "Return a defanged version of an IP address where every period '.' is replaced with '[.]'."

    # 9. Arrays fallback
    if "array" in category.lower() or "arrays" in category.lower():
        if "missing positive" in t_lower:
            return "Given an unsorted integer array, find the smallest missing positive integer in O(n) time and O(1) space."
        if "trapping rain water" in t_lower:
            return "Given n non-negative integers representing an elevation map where width of each bar is 1, compute how much water it can trap after raining."
        if "contains duplicate" in t_lower:
            return "Return true if any value appears at least twice in the array, and false if every element is distinct."
        if "single number" in t_lower:
            return "Given a non-empty array of integers, every element appears twice except for one. Find that single one."
        if "move zeroes" in t_lower:
            return "Move all 0s in the array to the end while maintaining the relative order of the non-zero elements in-place."
        if "subarray sum equals k" in t_lower:
            return "Given an array of integers and an integer k, return the total number of contiguous subarrays whose sum equals to k."
        if "game of life" in t_lower:
            return "Implement Conway's Game of Life next state transition rules on a 2D board."
        if "merge sorted arrays" in t_lower or "merge sorted" in t_lower:
            return "Merge two sorted arrays nums1 and nums2 into nums1 as one sorted array."

    return f"Solve the standard <strong>{title}</strong> challenge under the {category} category."

def get_problem_details(title, category):
    if category.startswith("SQL"):
        return get_sql_problem_details(title, category), "", [], "sql"

    # Define standard defaults
    t_lower = title.lower()
    desc = f"Write an algorithm to solve the <strong>{title}</strong> challenge."
    input_fmt = "Line 1: A JSON-formatted list of inputs."
    output_fmt = "Return the core result value."
    examples = [{"input": "[1, 2, 3]\n5", "output": "8"}]
    constraints = ["1 <= inputs.length <= 10^4", "-10^5 <= value <= 10^5"]
    default_input = "[1, 2, 3]\n5"
    params = [("nums", "list_int"), ("target", "int")]
    ret_type = "int"

    # Deep mapping of popular DSA questions to their actual LeetCode-style details
    dsa_details = {
        "two sum": (
            "Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.",
            "Line 1: A JSON-formatted array of integers (e.g. <code>[2,7,11,15]</code>)<br/>Line 2: An integer target (e.g. <code>9</code>)",
            "A JSON array of two indices (e.g. <code>[0, 1]</code>).",
            [
                {"input": "[2, 7, 11, 15]\n9", "output": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
                {"input": "[3, 2, 4]\n6", "output": "[1, 2]"}
            ],
            ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
            "[2, 7, 11, 15]\n9",
            [("nums", "list_int"), ("target", "int")], "list_int"
        ),
        "kadane": (
            "Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
            "Line 1: A JSON-formatted array of integers.",
            "An integer representing the maximum sum.",
            [
                {"input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6."},
                {"input": "[5, 4, -1, 7, 8]", "output": "23"}
            ],
            ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
            "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
            [("nums", "list_int")], "int"
        ),
        "max subarray": (
            "Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
            "Line 1: A JSON-formatted array of integers.",
            "An integer representing the maximum sum.",
            [
                {"input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6."},
                {"input": "[5, 4, -1, 7, 8]", "output": "23"}
            ],
            ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
            "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
            [("nums", "list_int")], "int"
        ),
        "container with most water": (
            "Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is 1, find two lines that together with the x-axis form a container, such that the container contains the most water.",
            "Line 1: A JSON list of integer heights.",
            "An integer representing the maximum volume of water.",
            [
                {"input": "[1, 8, 6, 2, 5, 4, 8, 3, 7]", "output": "49", "explanation": "The max area of water is formed between index 1 and index 8 with height 7. Volume = 7 * 7 = 49."},
                {"input": "[1, 1]", "output": "1"}
            ],
            ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
            "[1, 8, 6, 2, 5, 4, 8, 3, 7]",
            [("height", "list_int")], "int"
        ),
        "find peak element": (
            "Given an integer array <code>nums</code>, find a peak element, and return its index. A peak element is an element that is strictly greater than its neighbors.",
            "Line 1: A JSON array of integers.",
            "An integer representing the index of any peak element.",
            [
                {"input": "[1, 2, 3, 1]", "output": "2", "explanation": "3 is a peak element and its index is 2."}
            ],
            ["1 <= nums.length <= 1000", "-2^31 <= nums[i] <= 2^31 - 1"],
            "[1, 2, 3, 1]",
            [("nums", "list_int")], "int"
        ),
        "sort colors": (
            "Given an array <code>nums</code> with <code>n</code> objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue (represented by 0, 1, and 2 respectively).",
            "Line 1: A JSON array of integers containing only 0, 1, and 2.",
            "A JSON array containing the sorted integers.",
            [{"input": "[2, 0, 2, 1, 1, 0]", "output": "[0, 0, 1, 1, 2, 2]"}],
            ["n == nums.length", "1 <= n <= 300", "nums[i] is either 0, 1, or 2."],
            "[2, 0, 2, 1, 1, 0]",
            [("nums", "list_int")], "list_int"
        ),
        "product of array except self": (
            "Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>.",
            "Line 1: A JSON array of integers.",
            "A JSON array of products.",
            [{"input": "[1, 2, 3, 4]", "output": "[24, 12, 8, 6]"}],
            ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
            "[1, 2, 3, 4]",
            [("nums", "list_int")], "list_int"
        ),
        "interval": (
            "Given an array of intervals where <code>intervals[i] = [start_i, end_i]</code>, merge or insert intervals as requested.",
            "Line 1: A JSON-formatted 2D array representing intervals.",
            "A JSON 2D array of modified intervals.",
            [{"input": "[[1, 3], [2, 6], [8, 10]]", "output": "[[1, 6], [8, 10]]"}],
            ["1 <= intervals.length <= 10^4", "intervals[i].length == 2"],
            "[[1, 3], [2, 6], [8, 10]]",
            [("intervals", "list_int")], "list_int"
        ),
        "3sum": (
            "Given an integer array <code>nums</code>, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, and <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>.",
            "Line 1: A JSON array of integers.",
            "A JSON 2D array of triplets.",
            [{"input": "[-1, 0, 1, 2, -1, -4]", "output": "[[-1, -1, 2], [-1, 0, 1]]"}],
            ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
            "[-1, 0, 1, 2, -1, -4]",
            [("nums", "list_int")], "list_int"
        ),
        "4sum": (
            "Given an integer array <code>nums</code> and a target, return all unique quadruplets that sum to the target.",
            "Line 1: A JSON array of integers.<br/>Line 2: Target integer.",
            "A JSON 2D array of quadruplets.",
            [{"input": "[1, 0, -1, 0, -2, 2]\n0", "output": "[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]"}],
            ["4 <= nums.length <= 200"],
            "[1, 0, -1, 0, -2, 2]\n0",
            [("nums", "list_int"), ("target", "int")], "list_int"
        ),
        "best time to buy": (
            "You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i</code>-th day. Find the maximum profit you can achieve.",
            "Line 1: A JSON array of stock prices.",
            "An integer representing max profit.",
            [{"input": "[7, 1, 5, 3, 6, 4]", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."}],
            ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
            "[7, 1, 5, 3, 6, 4]",
            [("prices", "list_int")], "int"
        ),
        "plus one": (
            "You are given a large integer represented as an integer array <code>digits</code>, where each <code>digits[i]</code> is the <code>i</code>-th digit of the integer. Increment the large integer by one and return the resulting array of digits.",
            "Line 1: A JSON array of digits.",
            "A JSON array showing the digits after incrementing.",
            [{"input": "[1, 2, 3]", "output": "[1, 2, 4]"}],
            ["1 <= digits.length <= 100", "0 <= digits[i] <= 9"],
            "[1, 2, 3]",
            [("digits", "list_int")], "list_int"
        ),
        "reverse string": (
            "Write a function that reverses a string. The input string is given as a string of characters.",
            "Line 1: The input string wrapped in quotes (e.g. <code>\"hello\"</code>)",
            "The reversed string.",
            [
                {"input": "\"hello\"", "output": "\"olleh\""},
                {"input": "\"Hannah\"", "output": "\"hannaH\""}
            ],
            ["1 <= s.length <= 10^5", "s consists of printable ASCII characters."],
            "\"hello\"",
            [("s", "str")], "str"
        ),
        "valid anagram": (
            "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.",
            "Line 1: First string <code>s</code><br/>Line 2: Second string <code>t</code>",
            "Boolean (<code>true</code> or <code>false</code>).",
            [
                {"input": "\"anagram\"\n\"nagaram\"", "output": "true"},
                {"input": "\"rat\"\n\"car\"", "output": "false"}
            ],
            ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
            "\"anagram\"\n\"nagaram\"",
            [("s", "str"), ("t", "str")], "bool"
        ),
        "valid palindrome": (
            "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return <code>true</code> if it is a palindrome, or <code>false</code> otherwise.",
            "Line 1: A string wrapped in quotes.",
            "Boolean (<code>true</code> or <code>false</code>).",
            [
                {"input": "\"A man, a plan, a canal: Panama\"", "output": "true", "explanation": "\u0022amanaplanacanalpanama\u0022 is a palindrome."},
                {"input": "\"race a car\"", "output": "false"}
            ],
            ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
            "\"A man, a plan, a canal: Panama\"",
            [("s", "str")], "bool"
        ),
        "longest substring without repeating": (
            "Given a string <code>s</code>, find the length of the longest substring without repeating characters.",
            "Line 1: A string wrapped in double quotes.",
            "An integer representing the maximum length.",
            [{"input": "\"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."}],
            ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
            "\"abcabcbb\"",
            [("s", "str")], "int"
        ),
        "longest common prefix": (
            "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string <code>\"\"</code>.",
            "Line 1: A JSON-formatted list of strings.",
            "A string representing the common prefix.",
            [{"input": "[\"flower\",\"flow\",\"flight\"]", "output": "\"fl\""}],
            ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of only lowercase English letters."],
            "[\"flower\",\"flow\",\"flight\"]",
            [("strs", "list_str")], "str"
        ),
        "group anagrams": (
            "Given an array of strings <code>strs</code>, group the anagrams together. You can return the answer in any order.",
            "Line 1: A JSON-formatted list of strings.",
            "A JSON 2D list grouping the anagrams.",
            [{"input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}],
            ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
            "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
            [("strs", "list_str")], "list_list_str"
        ),
        "reverse linked list": (
            "Given the head of a singly linked list, reverse the list, and return its reversed head list values.",
            "Line 1: A JSON array representing list values (e.g. <code>[1,2,3,4,5]</code>)",
            "A JSON array showing the reversed list node values.",
            [{"input": "[1, 2, 3, 4, 5]", "output": "[5, 4, 3, 2, 1]"}],
            ["The number of nodes in the list is in the range [0, 5000].", "-5000 <= Node.val <= 5000"],
            "[1, 2, 3, 4, 5]",
            [("head", "list_int")], "list_int"
        ),
        "merge two sorted lists": (
            "Merge two sorted linked lists and return it as a new sorted list.",
            "Line 1: First JSON-formatted sorted list (e.g. <code>[1,2,4]</code>)<br/>Line 2: Second sorted list (e.g. <code>[1,3,4]</code>)",
            "A JSON array representing the merged sorted list.",
            [{"input": "[1, 2, 4]\n[1, 3, 4]", "output": "[1, 1, 2, 3, 4, 4]"}],
            ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100"],
            "[1, 2, 4]\n[1, 3, 4]",
            [("list1", "list_int"), ("list2", "list_int")], "list_int"
        ),
        "linked list cycle": (
            "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
            "Line 1: A JSON array representing list values.",
            "Boolean (<code>true</code> or <code>false</code>).",
            [{"input": "[3, 2, 0, -4]", "output": "true", "explanation": "There is a cycle in the linked list where tail connects to the second node."}],
            ["The number of nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5"],
            "[3, 2, 0, -4]",
            [("head", "list_int")], "bool"
        ),
        "middle of the linked list": (
            "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.",
            "Line 1: A JSON-formatted array of list values.",
            "A JSON array representing list values starting from the middle node.",
            [
                {"input": "[1, 2, 3, 4, 5]", "output": "[3, 4, 5]"},
                {"input": "[1, 2, 3, 4, 5, 6]", "output": "[4, 5, 6]"}
            ],
            ["The number of nodes in the list is in the range [1, 100].", "1 <= Node.val <= 100"],
            "[1, 2, 3, 4, 5]",
            [("head", "list_int")], "list_int"
        ),
        "middle of linked list": (
            "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.",
            "Line 1: A JSON-formatted array of list values.",
            "A JSON array representing list values starting from the middle node.",
            [
                {"input": "[1, 2, 3, 4, 5]", "output": "[3, 4, 5]"},
                {"input": "[1, 2, 3, 4, 5, 6]", "output": "[4, 5, 6]"}
            ],
            ["The number of nodes in the list is in the range [1, 100].", "1 <= Node.val <= 100"],
            "[1, 2, 3, 4, 5]",
            [("head", "list_int")], "list_int"
        ),
        "valid parentheses": (
            "Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.",
            "Line 1: A string wrapped in quotes (e.g. <code>\"()[]{}\"</code>)",
            "Boolean (<code>true</code> or <code>false</code>).",
            [
                {"input": "\"()[]{\u007d\"", "output": "true"},
                {"input": "\"(]\"", "output": "false"}
            ],
            ["1 <= s.length <= 10^4", "s consists of parentheses characters only."],
            "\"()[]{}\"",
            [("s", "str")], "bool"
        ),
        "daily temperatures": (
            "Given an array of integers <code>temperatures</code> representing the daily temperatures, return an array <code>answer</code> such that <code>answer[i]</code> is the number of days you have to wait after the <code>i</code>-th day to get a warmer temperature.",
            "Line 1: A JSON-formatted array of temperatures.",
            "A JSON array representing the days to wait.",
            [{"input": "[73, 74, 75, 71, 69, 72, 76, 73]", "output": "[1, 1, 4, 2, 1, 1, 0, 0]"}],
            ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
            "[73, 74, 75, 71, 69, 72, 76, 73]",
            [("temperatures", "list_int")], "list_int"
        ),
        "invert binary tree": (
            "Given the root of a binary tree, invert the tree, and return its root.",
            "Line 1: A JSON-formatted level-order traversal array of the tree (e.g. <code>[4,2,7,1,3,6,9]</code>)",
            "A JSON level-order traversal array of the inverted tree.",
            [{"input": "[4, 2, 7, 1, 3, 6, 9]", "output": "[4, 7, 2, 9, 6, 3, 1]"}],
            ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
            "[4, 2, 7, 1, 3, 6, 9]",
            [("root", "list_int")], "list_int"
        ),
        "maximum depth": (
            "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
            "Line 1: A JSON level-order traversal array of the tree.",
            "An integer depth value.",
            [{"input": "[3, 9, 20, null, null, 15, 7]", "output": "3"}],
            ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
            "[3, 9, 20, null, null, 15, 7]",
            [("root", "list_int")], "int"
        ),
        "same tree": (
            "Given the roots of two binary trees <code>p</code> and <code>q</code>, write a function to check if they are the same or not.",
            "Line 1: Level-order traversal of tree p.<br/>Line 2: Level-order traversal of tree q.",
            "Boolean (<code>true</code> or <code>false</code>).",
            [{"input": "[1, 2, 3]\n[1, 2, 3]", "output": "true"}],
            ["The number of nodes in both trees is in the range [0, 100]."],
            "[1, 2, 3]\n[1, 2, 3]",
            [("p", "list_int"), ("q", "list_int")], "bool"
        ),
        "number of islands": (
            "Given an <code>m x n</code> 2D binary grid <code>grid</code> which represents a map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return the number of islands.",
            "Line 1: A JSON-formatted 2D array representing the binary grid.",
            "An integer representing the total count of islands.",
            [{"input": "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", "output": "3"}],
            ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
            "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
            [("grid", "list_str")], "int"
        ),
        "course schedule": (
            "There are a total of <code>numCourses</code> courses you have to take, labeled from <code>0</code> to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a_i, b_i]</code> indicates that you must take course <code>b_i</code> first if you want to take course <code>a_i</code>. Determine if you can finish all courses.",
            "Line 1: Integer numCourses.<br/>Line 2: JSON 2D array of prerequisites.",
            "Boolean (<code>true</code> or <code>false</code>).",
            [{"input": "2\n[[1, 0]]", "output": "true"}],
            ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"],
            "2\n[[1, 0]]",
            [("numCourses", "int"), ("prerequisites", "list_int")], "bool"
        ),
        "subsets": (
            "Given an integer array <code>nums</code> of unique elements, return all possible subsets (the power set).",
            "Line 1: A JSON array of integers (e.g. <code>[1,2,3]</code>)",
            "A JSON 2D array containing all subset lists.",
            [{"input": "[1, 2, 3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"}],
            ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All elements of nums are unique."],
            "[1, 2, 3]",
            [("nums", "list_int")], "list_list_int"
        ),
        "permutations": (
            "Given an array <code>nums</code> of distinct integers, return all the possible permutations. You can return the answer in any order.",
            "Line 1: A JSON array of integers.",
            "A JSON 2D array of all permutations.",
            [{"input": "[1, 2, 3]", "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"}],
            ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10"],
            "[1, 2, 3]",
            [("nums", "list_int")], "list_list_int"
        ),
        "climbing stairs": (
            "You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            "Line 1: Integer steps <code>n</code>.",
            "Integer representing total unique combinations.",
            [
                {"input": "2", "output": "2", "explanation": "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps"},
                {"input": "3", "output": "3", "explanation": "There are three ways:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"}
            ],
            ["1 <= n <= 45"],
            "3",
            [("n", "int")], "int"
        ),
        "coin change": (
            "You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code> representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
            "Line 1: A JSON-formatted list of coin values.<br/>Line 2: Target integer amount.",
            "Integer representing minimum coins count, or -1 if impossible.",
            [
                {"input": "[1, 2, 5]\n11", "output": "3", "explanation": "11 = 5 + 5 + 1 (3 coins)."},
                {"input": "[2]\n3", "output": "-1"}
            ],
            ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
            "[1, 2, 5]\n11",
            [("coins", "list_int"), ("amount", "int")], "int"
        ),
        "unique paths": (
            "There is a robot on an <code>m x n</code> grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. Return the number of possible unique paths.",
            "Line 1: Grid rows m.<br/>Line 2: Grid columns n.",
            "An integer representing the number of paths.",
            [{"input": "3\n7", "output": "28"}],
            ["1 <= m, n <= 100"],
            "3\n7",
            [("m", "int"), ("n", "int")], "int"
        ),
        "binary search": (
            "Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If <code>target</code> exists, then return its index. Otherwise, return <code>-1</code>.",
            "Line 1: JSON array of sorted integers.<br/>Line 2: Target integer.",
            "Integer index of target or -1.",
            [
                {"input": "[-1, 0, 3, 5, 9, 12]\n9", "output": "4", "explanation": "9 exists in nums and its index is 4."},
                {"input": "[-1, 0, 3, 5, 9, 12]\n2", "output": "-1", "explanation": "2 does not exist in nums so return -1."}
            ],
            ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All the integers in nums are unique.", "nums is sorted in ascending order."],
            "[-1, 0, 3, 5, 9, 12]\n9",
            [("nums", "list_int"), ("target", "int")], "int"
        ),
        "kth largest": (
            "Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code>-th largest element in the array.",
            "Line 1: JSON array of integers.<br/>Line 2: Integer k.",
            "Integer representing kth largest element value.",
            [{"input": "[3, 2, 1, 5, 6, 4]\n2", "output": "5"}],
            ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
            "[3, 2, 1, 5, 6, 4]\n2",
            [("nums", "list_int"), ("k", "int")], "int"
        ),
        "fibonacci number": (
            "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Calculate the F(n).",
            "Line 1: Integer n.",
            "Integer representing the n-th Fibonacci number.",
            [{"input": "4", "output": "3"}],
            ["0 <= n <= 30"],
            "4",
            [("n", "int")], "int"
        ),
        "house robber": (
            "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected. Return the maximum amount of money you can rob tonight without alerting the police.",
            "Line 1: A JSON-formatted array of house values.",
            "Integer representing the maximum money value.",
            [{"input": "[1, 2, 3, 1]", "output": "4"}],
            ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
            "[1, 2, 3, 1]",
            [("nums", "list_int")], "int"
        ),
        "sudoku solver": (
            "Write a program to solve a Sudoku puzzle by filling the empty cells. Empty cells are indicated by character '.'.",
            "Line 1: A JSON-formatted 2D array of grid cells.",
            "A JSON-formatted 2D array representing solved board state.",
            [{"input": "[[\"5\",\"3\",\".\"],[\"6\",\".\",\".\"],[\".\",\"9\",\"8\"]]", "output": "[[\"5\",\"3\",\"4\"],[\"6\",\"7\",\"2\"],[\"1\",\"9\",\"8\"]]"}],
            ["The given board contain only digits 1-9 and '.'", "The board is guaranteed to have a unique solution."],
            "[[\"5\",\"3\",\".\"],[\"6\",\".\",\".\"],[\".\",\"9\",\"8\"]]",
            [("board", "list_str")], "list_list_str"
        ),
        "word search": (
            "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells.",
            "Line 1: A JSON 2D board of characters.<br/>Line 2: A word string.",
            "Boolean true or false.",
            [{"input": "[[\"A\",\"B\",\"C\"],[\"S\",\"F\",\"C\"]]\n\"ABCC\"", "output": "true"}],
            ["1 <= m, n <= 6", "1 <= word.length <= 15"],
            "[[\"A\",\"B\",\"C\"],[\"S\",\"F\",\"C\"]]\n\"ABCC\"",
            [("board", "list_str"), ("word", "str")], "bool"
        ),
        "remove duplicates": (
            "Given the head of a sorted linked list, delete all duplicates such that each element appears only once.",
            "Line 1: A JSON list of node values.",
            "A JSON array showing unique list node values.",
            [{"input": "[1, 1, 2]", "output": "[1, 2]"}],
            ["The number of nodes in the list is in the range [0, 300].", "-100 <= Node.val <= 100"],
            "[1, 1, 2]",
            [("head", "list_int")], "list_int"
        ),
        "add two numbers": (
            "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
            "Line 1: First list digits.<br/>Line 2: Second list digits.",
            "A JSON array showing the digits sum list.",
            [{"input": "[2, 4, 3]\n[5, 6, 4]", "output": "[7, 0, 8]"}],
            ["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9"],
            "[2, 4, 3]\n[5, 6, 4]",
            [("l1", "list_int"), ("l2", "list_int")], "list_int"
        )
    }

    # If the title matches one of our exact detailed definitions:
    matched = False
    for k, details in dsa_details.items():
        if k in t_lower:
            desc, input_fmt, output_fmt, examples, constraints, default_input, params, ret_type = details
            matched = True
            break
            
    if not matched:
        desc = get_dsa_description(title, category)
        # Determine defaults based on category
        if "string" in category.lower():
            input_fmt = "Line 1: A string wrapped in double quotes."
            output_fmt = "The computed string or integer result."
            examples = [{"input": "\"helloworld\"", "output": "10" if ("length" in t_lower or "count" in t_lower) else "\"helloworld\""}]
            constraints = ["1 <= s.length <= 10^5", "s consists of English letters."]
            default_input = "\"helloworld\""
            params = [("s", "str")]
            ret_type = "int" if ("length" in t_lower or "count" in t_lower or "depth" in t_lower or "match" in t_lower) else "str"
        elif "linked list" in category.lower():
            input_fmt = "Line 1: A JSON-formatted array representing nodes of the list."
            output_fmt = "A JSON array showing the modified list node values."
            examples = [{"input": "[1, 2, 3, 4]", "output": "[1, 2, 3, 4]"}]
            constraints = ["The number of nodes in the list is in the range [0, 5000].", "-100 <= Node.val <= 100"]
            default_input = "[1, 2, 3, 4]"
            params = [("head", "list_int")]
            ret_type = "list_int"
        elif "tree" in category.lower():
            input_fmt = "Line 1: A level-order traversal array of the tree."
            output_fmt = "The computed traversal list, boolean, or integer result."
            examples = [{"input": "[1, null, 2, 3]", "output": "3" if ("depth" in t_lower or "sum" in t_lower) else "[1, 2, 3]"}]
            constraints = ["The number of nodes in the tree is in the range [0, 1000]."]
            default_input = "[1, null, 2, 3]"
            params = [("root", "list_int")]
            ret_type = "int" if ("depth" in t_lower or "sum" in t_lower or "diameter" in t_lower or "kth" in t_lower) else "list_int"
        elif "graph" in category.lower():
            input_fmt = "Line 1: A JSON-formatted list of edges or adjacency list."
            output_fmt = "The traversal paths, integer values, or boolean result."
            examples = [{"input": "[[0,1],[1,2],[2,0]]", "output": "true" if ("cycle" in t_lower or "schedule" in t_lower or "bipartite" in t_lower) else "1"}]
            constraints = ["1 <= vertices <= 500", "0 <= edges.length <= 1000"]
            default_input = "[[0, 1], [1, 2], [2, 0]]"
            params = [("edges", "list_int")]
            ret_type = "bool" if ("cycle" in t_lower or "schedule" in t_lower or "bipartite" in t_lower) else "int"
        elif "sorting" in category.lower() or "searching" in category.lower():
            input_fmt = "Line 1: A JSON array of integers."
            output_fmt = "The sorted array, element value, or index."
            examples = [{"input": "[4, 2, 1, 3]", "output": "[1, 2, 3, 4]" if "sort" in t_lower else "2"}]
            constraints = ["1 <= nums.length <= 10^5", "-10^5 <= nums[i] <= 10^5"]
            default_input = "[4, 2, 1, 3]"
            params = [("nums", "list_int")]
            ret_type = "list_int" if "sort" in t_lower else "int"
        elif "stack" in category.lower() or "queue" in category.lower():
            input_fmt = "Line 1: A JSON array of operations or elements."
            output_fmt = "The computed evaluation result."
            examples = [{"input": "[1, 2, 3]", "output": "3"}]
            constraints = ["1 <= elements.length <= 10^4"]
            default_input = "[1, 2, 3]"
            params = [("nums", "list_int")]
            ret_type = "int"
        elif "dynamic" in category.lower() or "dp" in category.lower():
            input_fmt = "Line 1: A JSON list of values or single integer."
            output_fmt = "The optimized maximum profit, minimum path, or count value."
            examples = [{"input": "[10, 15, 20]", "output": "15"}]
            constraints = ["1 <= values.length <= 10^5"]
            default_input = "[10, 15, 20]"
            params = [("nums", "list_int")]
            ret_type = "int"
        else:
            input_fmt = "Line 1: A JSON-formatted list of inputs."
            output_fmt = "Return the core result value."
            examples = [{"input": "[1, 2, 3]\n5", "output": "8"}]
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

# Seeding directly to Firestore, no local files generated.

# Upload full details to Firebase Firestore
print("Attempting to upload question details to Firebase Firestore...")
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    # Initialize Firebase if not already initialized
    if not firebase_admin._apps:
        key_path = "backend/serviceAccountKey.json"
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized with local serviceAccountKey.json for seeding.")
        else:
            firebase_admin.initialize_app()
            print("Firebase initialized with default credentials for seeding.")
            
    db = firestore.client()
    
    print(f"Uploading {len(questions)} questions to Firestore 'playground_questions' collection...")
    batch = db.batch()
    count = 0
    for q in questions:
        doc_ref = db.collection("playground_questions").document(q["id"])
        batch.set(doc_ref, q)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            
    batch.commit()
    print("Successfully uploaded all question details to Firebase Firestore!")
except Exception as e:
    print(f"Warning: Failed to upload question details to Firestore: {e}")
