import json
import os
import re

# Categories for DSA (250 questions)
# Categories for SQL (100 questions)

def camel_case(s):
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s)
    words = s.split()
    if not words:
        return ''
    return words[0].lower() + ''.join(w.capitalize() for w in words[1:])

def snake_case(s):
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s)
    return '_'.join(s.lower().split())

def pascal_case(s):
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s)
    return ''.join(w.capitalize() for w in s.split())

def make_python_template(func_name, params, ret_type):
    param_str = ", ".join(f"{name}" for name, _ in params)
    body = "    # Write your Python 3 code here\n    pass"
    
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
    
    return f"def {func_name}({param_str}):\n{body}\n\n# Driver code to test input\n" + "\n".join(driver_lines)

def make_java_template(func_name, params, ret_type):
    java_ret = "int" if ret_type == "int" else "boolean" if ret_type == "bool" else "String" if ret_type == "str" else "int[]"
    java_func = camel_case(func_name)
    
    java_params = []
    for name, ptype in params:
        jtype = "int[]" if ptype == "list_int" else "int" if ptype == "int" else "String"
        java_params.append(f"{jtype} {name}")
    
    body = f"        // Write your Java code here\n        return new {java_ret.replace('[]', '[0]')};" if "[]" in java_ret else f"        // Write your Java code here\n        return { '0' if java_ret == 'int' else 'false' if java_ret == 'boolean' else '\"\"' };"
    
    driver = [
        "import java.util.*;",
        "import java.io.*;",
        "",
        "public class Main {",
        f"    public static {java_ret} {java_func}({', '.join(java_params)}) {{",
        body,
        "    }",
        "",
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
    driver.append("}")
    
    return "\n".join(driver)

def make_cpp_template(func_name, params, ret_type):
    cpp_ret = "int" if ret_type == "int" else "bool" if ret_type == "bool" else "string" if ret_type == "str" else "vector<int>"
    cpp_func = camel_case(func_name)
    
    cpp_params = []
    for name, ptype in params:
        ctype = "vector<int>&" if ptype == "list_int" else "int" if ptype == "int" else "string"
        cpp_params.append(f"{ctype} {name}")
        
    body = f"    // Write your C++ code here\n    return {{}};" if "vector" in cpp_ret else f"    // Write your C++ code here\n    return { '0' if cpp_ret == 'int' else 'false' if cpp_ret == 'bool' else '\"\"' };"
    
    driver = [
        "#include <iostream>",
        "#include <vector>",
        "#include <string>",
        "#include <sstream>",
        "#include <algorithm>",
        "",
        "using namespace std;",
        "",
        f"{cpp_ret} {cpp_func}({', '.join(cpp_params)}) {{",
        body,
        "}",
        "",
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
    
    return "\n".join(driver)

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
            
        inp = "[1, 2, 3, 4]\n5"
        if "Palindrome" in title or "String" in title:
            inp = '"racecar"'
        elif "Sum" in title:
            inp = "[2, 7, 11, 15]\n9"
            
        params = [("nums", "list_int"), ("target", "int")]
        ret_type = "int"
        
        if "Palindrome" in title or "Valid" in title or "Same" in title or "Cycle" in title:
            ret_type = "bool"
            
        if "String" in title or "Word" in title:
            params = [("s", "str")]
            
        func_name = snake_case(title)
        desc = f"Given the parameters, implement the core algorithm to solve **{title}**.<br/><br/><strong>Input format:</strong><br/>Line 1: Stdin argument.<br/>Line 2: Stdin target integer (if applicable).<br/><br/><strong>Output format:</strong> Return the correct result as defined by the standard problem signature."

        questions.append({
            "id": f"dsa-{num_str}",
            "title": f"{id_counter}. {title}",
            "difficulty": difficulty,
            "category": f"DSA - {category}",
            "description": desc,
            "input": inp,
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
        desc = ""
        
        if category == "Basic Select":
            names = ["All Employees", "High Earners", "IT Department Staff", "Employees Hired in 2023", "Unique Employee Names", "Employees with No Manager", "Sort Employees by Salary", "Select Top 5 Budgets", "Find Specific Project", "Custom Columns Employees", "Salary Greater than 80000", "Employees under Manager 3", "Project Budget Range", "Location of Departments", "Employees starting with A", "Employees with High ID", "Project Budgets Descending", "Department Names list", "Distinct Job Locations", "Hired After Jan 2021"]
            title = names[idx - 1] if idx <= len(names) else f"Basic Query {idx}"
            desc = f"Write a SQL query to solve: <strong>{title}</strong> against the database tables."
        elif category == "Joins":
            names = ["Employee Department Names", "Department Managers", "Employees on Projects", "Department Spending Joins", "Unassigned Projects", "Employees without Departments", "All Managers and Subordinates", "Project Hours per Employee", "High Budget Project Assignments", "Department Cities List", "Cross Join Teams", "Join Multi-Tables", "Self Join Bosses", "Department Budget Allotment", "Employees working > 40 Hours", "Subcontractor Project Hours", "Employees and Project Budgets", "Missing Department Logs", "Project and Departments Joined", "Location Wise Employees List"]
            title = names[idx - 1] if idx <= len(names) else f"Join Query {idx}"
            desc = f"Write a SQL query using JOINs to solve: <strong>{title}</strong>."
        elif category == "Aggregations":
            names = ["Average Salary per Department", "Total Budget of All Projects", "Count of Employees in IT", "Maximum Salary in Company", "Total Hours Spent on Project 1", "Average Project Budget", "Total Salary Expense", "Count Departments in USA", "Min Max Salary per Dept", "Department Headcount", "Average Hours Worked", "Sum Hours Worked per Project", "Salary Stats overall", "Employee Count per Location", "Projects Count per Budget", "Average Department Salaries > 50000", "Maximum Project Hours Worked", "Count Employees under Manager 1", "Sum Budgets > 1000000", "Count Distinct Project Members"]
            title = names[idx - 1] if idx <= len(names) else f"Aggregation Query {idx}"
            desc = f"Write a SQL query utilizing GROUP BY and aggregate functions to find: <strong>{title}</strong>."
        elif category == "Subqueries & CTEs":
            names = ["Second Highest Salary", "Employees with Above Average Salary", "Highest Paid in Department", "Departments with No Employees Subquery", "CTE Department Headcount", "CTE Project Budget Ranking", "Subquery Manager Details", "Find Employees Hired Before Manager", "CTEs for Project Hour Sums", "CTE Employee Projects Info", "Subquery High Hours Worked", "Departments with Sum Salary > Average", "Project Budgets > Department Salaries", "Manager Salary Greater than Employee", "Double Nested Salary Subquery", "Department Name of Max Salary Employee", "CTE Highest Budget Projects Only", "Subquery Hired After Boss", "Employees not in Project 1", "Department Managers Average Salary"]
            title = names[idx - 1] if idx <= len(names) else f"Subquery/CTE Query {idx}"
            desc = f"Write a SQL query utilizing subqueries or Common Table Expressions (CTEs) to find: <strong>{title}</strong>."
        elif category == "Window Functions":
            names = ["Rank Employees by Salary", "Department Wise Salary Rank", "Dense Rank Project Budgets", "Row Number per Department Hired", "Lead Lag Salaries Comparison", "Moving Average Employee Salaries", "Running Total of Project Hours", "Percent Rank Salaries", "NTILE Salary Quartiles", "First Value Hire Date per Dept", "Last Value Budgets", "Lag Project Budget Differences", "Rank Projects by Hours Worked", "Window Sum Salaries per Location", "Row Number for Orders", "Running Total Order Amounts", "Order Item Counts Windowed", "Customer Order Frequency Rank", "Average Order Value Windowed", "Product Price Rank in Categories"]
            title = names[idx - 1] if idx <= len(names) else f"Window Function Query {idx}"
            desc = f"Write a SQL query using window functions (e.g. <code>RANK()</code>, <code>ROW_NUMBER()</code>, <code>LEAD()</code>) to solve: <strong>{title}</strong>."

        questions.append({
            "id": f"sql-{num_str}",
            "title": f"{sql_counter}. SQL: {title}",
            "difficulty": "Easy" if idx <= 7 else "Medium" if idx <= 15 else "Hard",
            "category": f"SQL - {category}",
            "description": f"{desc}<br/><br/>Refer to the database schema helper inside the sidebar to see structural tables.",
            "input": "",
            "templates": {
                "sql": f"-- Write your {category} SQL query here\n",
                "python": "# Use SQL language for this database challenge!\nprint('Please select SQL mode.')",
                "java": "public class Main { public static void main(String[] args) { System.out.println(\"Please select SQL mode.\"); } }",
                "cpp": "#include <iostream>\nint main() { std::cout << \"Please select SQL mode.\" << std::endl; return 0; }"
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
