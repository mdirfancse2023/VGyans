import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Define rich, comprehensive study notes content for 10 topics
STUDY_NOTES = [
    {
        "id": "c-study-notes",
        "title": "C Programming Quick Notes",
        "category": "Technical",
        "company": "All",
        "description": "Essential syntax, pointer concepts, structures, dynamic memory allocation, and key interview snippets.",
        "downloadUrl": "/notes/c-study-notes",
        "tags": ["C", "Syntax", "Pointers", "Core"],
        "content": [
            {"type": "h1", "text": "1. Introduction to C"},
            {"type": "body", "text": "C is a robust, procedural, middle-level programming language developed in 1972 by Dennis Ritchie at Bell Labs. It forms the foundation of modern languages and is widely used in systems programming, compiler design, and embedded platforms."},
            {"type": "h1", "text": "2. Memory Address & Pointer Basics"},
            {"type": "body", "text": "A pointer is a variable that stores the memory address of another variable. Understanding pointers is critical for dynamic memory management, array manipulation, and parameter passing in C."},
            {"type": "code", "text": """#include <stdio.h>

int main() {
    int number = 100;
    int *ptr = &number; // ptr holds the address of number

    printf("Value of number: %d\\n", number);
    printf("Address of number: %p\\n", &number);
    printf("Value stored in ptr: %p\\n", ptr);
    printf("Dereferenced value (*ptr): %d\\n", *ptr); // Outputs 100

    return 0;
}"""},
            {"type": "h1", "text": "3. Dynamic Memory Allocation"},
            {"type": "body", "text": "C provides functions in the <code>&lt;stdlib.h&gt;</code> header to allocate memory at runtime dynamically:<br/>- <b>malloc(size):</b> Allocates specified bytes of uninitialized memory.<br/>- <b>calloc(num, size):</b> Allocates memory and initializes all bits to zero.<br/>- <b>realloc(ptr, new_size):</b> Resizes previously allocated memory block.<br/>- <b>free(ptr):</b> Deallocates and releases memory back to the heap."},
            {"type": "code", "text": """int *arr = (int*) calloc(5, sizeof(int)); // Allocates array of 5 integers, initialized to 0
if (arr == NULL) {
    printf("Allocation failed!");
    return 1;
}

// Perform operations...
arr[0] = 10;

free(arr); // Release memory to prevent memory leaks
arr = NULL; // Prevent dangling pointer"""},
            {"type": "h1", "text": "4. Structures vs Unions"},
            {"type": "body", "text": "Structures allocate a unique memory slot for each member, while Unions share a single memory slot among all members. The size of a union is equal to the size of its largest member."},
            {"type": "code", "text": """struct Employee {
    int id;          // 4 bytes
    char grade;      // 1 byte
    double salary;   // 8 bytes
}; // Total memory: ~16 bytes due to padding

union Cache {
    int val;         // 4 bytes
    char code;       // 1 byte
}; // Total memory: 4 bytes (shared)"""}
        ]
    },
    {
        "id": "cpp-study-notes",
        "title": "C++ & OOPs Revision Notes",
        "category": "Technical",
        "company": "All",
        "description": "Object-oriented concepts, virtual functions, templates, STL (Standard Template Library), and C++ reference.",
        "downloadUrl": "/notes/cpp-study-notes",
        "tags": ["C++", "OOPs", "STL", "Polymorphism"],
        "content": [
            {"type": "h1", "text": "1. Core Principles of OOPs"},
            {"type": "body", "text": "Object-Oriented Programming (OOP) in C++ uses four pillars:<br/>1. <b>Encapsulation:</b> Bundling variables and functions inside a class while shielding them using access specifiers (private, protected, public).<br/>2. <b>Abstraction:</b> Hiding implementation details and exposing minimal interfaces (using virtual/pure virtual functions).<br/>3. <b>Inheritance:</b> Creating subclasses from a parent class to re-use code and extend properties.<br/>4. <b>Polymorphism:</b> Allowing a call to act differently depending on context (e.g., function/operator overloading vs function overriding)."},
            {"type": "h1", "text": "2. Runtime Polymorphism & Virtual Functions"},
            {"type": "body", "text": "Runtime polymorphism is achieved in C++ by declaring base class functions as <code>virtual</code>. It instructs the compiler to resolve function calls during runtime rather than compile-time based on the type of object referenced."},
            {"type": "code", "text": """#include <iostream>
using namespace std;

class Base {
public:
    virtual void show() { // virtual keyword enables dynamic dispatch
        cout << "Base class show" << endl;
    }
};

class Derived : public Base {
public:
    void show() override {
        cout << "Derived class show" << endl;
    }
};

int main() {
    Base* bptr;
    Derived d;
    bptr = &d;
    bptr->show(); // Outputs: Derived class show (dynamic bind)
    return 0;
}"""},
            {"type": "h1", "text": "3. STL Containers Reference"},
            {"type": "body", "text": "C++ STL provides built-in data structures:<br/>- <b>Vector:</b> Dynamic contiguous array. Fast inserts/deletions at the end.<br/>- <b>Map:</b> Key-value lookup implemented as self-balancing Red-Black trees. Key operations are O(log n).<br/>- <b>Unordered Map:</b> Key-value lookup using hash tables. Average O(1) time complexity."}
        ]
    },
    {
        "id": "python-study-notes",
        "title": "Python Cheat Sheet & Reference",
        "category": "Technical",
        "company": "All",
        "description": "Core concepts, list comprehensions, decorators, generators, OOPs in Python, and common libraries.",
        "downloadUrl": "/notes/python-study-notes",
        "tags": ["Python", "Syntax", "Decorators", "OOPs"],
        "content": [
            {"type": "h1", "text": "1. Pythonic Collections and Complexities"},
            {"type": "body", "text": "Python has key built-in data types:<br/>- <b>List:</b> Ordered, mutable dynamic array. O(1) index lookup.<br/>- <b>Tuple:</b> Ordered, immutable, hashable sequence.<br/>- <b>Set:</b> Unordered, mutable collection of unique elements. O(1) lookups.<br/>- <b>Dictionary:</b> Hash-table based mapping of key-value pairs. O(1) average lookups."},
            {"type": "h1", "text": "2. Decorators and Metaprogramming"},
            {"type": "body", "text": "Decorators wrap another function to extend its behavior dynamically without altering the original function source code."},
            {"type": "code", "text": """def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling function: {func.__name__}")
        res = func(*args, **kwargs)
        print(f"Finished calling: {func.__name__}")
        return res
    return wrapper

@logger
def compute_sum(a, b):
    return a + b

print(compute_sum(10, 20)) # Automatically logs caller info"""},
            {"type": "h1", "text": "3. Generators & Memory Efficiency"},
            {"type": "body", "text": "Generators evaluate expressions lazily, returning an iterator that yields one item at a time. This saves substantial memory when working with large data ranges."},
            {"type": "code", "text": """# Generator function yielding values lazily
def fibonacci(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

for num in fibonacci(50):
    print(num, end=" ") # O(1) memory complexity"""}
        ]
    },
    {
        "id": "dsa-study-notes",
        "title": "DSA Essential Hand Book",
        "category": "Technical",
        "company": "All",
        "description": "Overview of major data structures, sorting/searching algorithms, complexity analysis, and coding patterns.",
        "downloadUrl": "/notes/dsa-study-notes",
        "tags": ["DSA", "Data Structures", "Algorithms", "Binary Search"],
        "content": [
            {"type": "h1", "text": "1. Big-O Complexity Quick Guide"},
            {"type": "body", "text": "Big-O notation describes the upper bound scaling of execution time or memory footprint in the worst-case scenario:<br/>- <b>O(1):</b> Constant time (Hash map lookup, array index).<br/>- <b>O(log n):</b> Logarithmic time (Binary Search).<br/>- <b>O(n):</b> Linear time (Linear search, single loop).<br/>- <b>O(n log n):</b> Linearithmic time (Merge sort, Heap sort).<br/>- <b>O(n^2):</b> Quadratic time (Bubble sort, nested loops)."},
            {"type": "h1", "text": "2. Binary Search (Logarithmic Search)"},
            {"type": "body", "text": "Binary search finds elements inside a pre-sorted array by repeatedly splitting the search interval in half. Complexity is O(log n)."},
            {"type": "code", "text": """int binarySearch(int arr[], int size, int target) {
    int left = 0;
    int right = size - 1;
    
    while(left <= right) {
        int mid = left + (right - left) / 2; // Prevents integer overflow
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1; // Target not found
}"""},
            {"type": "h1", "text": "3. Graphs: BFS vs DFS"},
            {"type": "body", "text": "<b>Breadth-First Search (BFS):</b> Explores vertices level-by-level using a Queue. Ideal for finding the shortest path in unweighted graphs.<br/><b>Depth-First Search (DFS):</b> Explores nodes as deep as possible before backtracking using a Stack or recursion. Ideal for topology sorting and path checking."}
        ]
    },
    {
        "id": "java-study-notes",
        "title": "Java Programming Master Notes",
        "category": "Technical",
        "company": "All",
        "description": "Core Java, JVM architecture, multithreading, collections framework, Java 8 features (lambdas/streams).",
        "downloadUrl": "/notes/java-study-notes",
        "tags": ["Java", "OOPs", "JVM", "Streams"],
        "content": [
            {"type": "h1", "text": "1. JVM Execution Lifecycle & Memory Zones"},
            {"type": "body", "text": "JVM executes Java bytecode. The memory layout is partitioned into five distinct areas:<br/>1. <b>Heap Area:</b> Stores all object instances and arrays. Managed by Garbage Collection.<br/>2. <b>Stack Area:</b> Stores local variables and execution frames for individual threads.<br/>3. <b>Method Area:</b> Stores class metadata, bytecode, static variables, and runtime constant pools.<br/>4. <b>PC Registers:</b> Contains the address of current instruction being executed.<br/>5. <b>Native Method Stack:</b> Holds instructions for native libraries (C/C++)."},
            {"type": "h1", "text": "2. Java Collections Core Hierarchy"},
            {"type": "body", "text": "- <b>List:</b> ArrayList (resizing array, O(1) random read) vs LinkedList (doubly linked list, O(1) insertions).<br/>- <b>Set:</b> HashSet (hash table lookup, unordered) vs TreeSet (Red-Black tree, sorted, unique).<br/>- <b>Map:</b> HashMap (hash-bucket array with tree conversion when list threshold &gt; 8) vs TreeMap (sorted keys)."},
            {"type": "h1", "text": "3. Java 8 Streams and Functional Coding"},
            {"type": "code", "text": """import java.util.*;
import java.util.stream.*;

public class StreamDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // Compute sum of squares of all even numbers
        int sumOfSquares = numbers.stream()
            .filter(n -> n % 2 == 0) // Filter evens
            .map(n -> n * n)         // Square them
            .reduce(0, Integer::sum);
            
        System.out.println("Result: " + sumOfSquares); // Outputs 220
    }
}"""}
        ]
    },
    {
        "id": "system-design-study-notes",
        "title": "System Design Fundamentals",
        "category": "Technical",
        "company": "All",
        "description": "High-level architecture, scalability, load balancers, caching, databases (SQL vs NoSQL), and CAP theorem.",
        "downloadUrl": "/notes/system-design-study-notes",
        "tags": ["System Design", "Scalability", "Architecture", "Microservices"],
        "content": [
            {"type": "h1", "text": "1. Scalability: Scale Up vs Scale Out"},
            {"type": "body", "text": "<b>Vertical Scaling (Scale Up):</b> Adding resources (RAM, CPU) to a single machine. Hard limits apply and creates a Single Point of Failure (SPOF).<br/><b>Horizontal Scaling (Scale Out):</b> Adding more servers to the cluster. Indefinite scalability, but requires load balancers and complex data sync."},
            {"type": "h1", "text": "2. Load Balancers"},
            {"type": "body", "text": "Load Balancers distribute user traffic across servers to optimize availability. Common algorithms include Round Robin, Weighted Round Robin, Least Connections, and IP Hashing."},
            {"type": "h1", "text": "3. Caching & Redis"},
            {"type": "body", "text": "Caching stores high-frequency data in memory (Redis, Memcached) to reduce database read pressure. Common patterns include:<br/>- <b>Cache-Aside:</b> Application checks cache; if miss, fetches from database and writes back to cache.<br/>- <b>Write-Through:</b> Application writes to cache, cache writes to database synchronously.<br/>- <b>Write-Behind (Write-Back):</b> Application writes to cache, database is updated asynchronously (fastest, but risk of data loss)."},
            {"type": "h1", "text": "4. Databases: SQL vs NoSQL"},
            {"type": "body", "text": "- <b>SQL (Relational):</b> Schema-enforced, structured tables, supports ACID transactions. Scaled vertically. Ideal for payments and billing.<br/>- <b>NoSQL (Non-Relational):</b> Flexible schema, Key-Value (Redis), Document (MongoDB), Column (Cassandra), Graph (Neo4j). Scaled horizontally. Ideal for social feeds, chat logs."}
        ]
    },
    {
        "id": "spring-boot-study-notes",
        "title": "Spring Boot Core Concepts",
        "category": "Technical",
        "company": "All",
        "description": "Spring framework core, IoC, Dependency Injection, REST APIs, annotations reference, and Spring Data JPA.",
        "downloadUrl": "/notes/spring-boot-study-notes",
        "tags": ["Spring Boot", "Java", "REST API", "MVC"],
        "content": [
            {"type": "h1", "text": "1. Spring IoC & Dependency Injection"},
            {"type": "body", "text": "Spring inversion of Control (IoC) Container manages bean creation, lifecycle, and mapping. Dependency Injection (DI) allows dependencies to be injected dynamically instead of hardcoding object instantiation inside controllers/services."},
            {"type": "h1", "text": "2. Core Annotations Cheat Sheet"},
            {"type": "body", "text": "- <code>@SpringBootApplication</code>: Combines Configuration, EnableAutoConfiguration, and ComponentScan.<br/>- <code>@RestController</code>: Marks a class as a controller returning REST JSON payloads.<br/>- <code>@Autowired</code>: Marks a dependency to be injected automatically by Spring.<br/>- <code>@Service / @Repository / @Component</code>: Marks classes as Spring Beans with specific architectural roles."},
            {"type": "h1", "text": "3. Rest API Controller Example"},
            {"type": "code", "text": """@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product prod = productService.findById(id);
        if (prod == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(prod);
    }
}"""}
        ]
    },
    {
        "id": "microservices-study-notes",
        "title": "Microservices Architecture Blueprints",
        "category": "Technical",
        "company": "All",
        "description": "Discovery services (Eureka), API Gateway, Circuit Breaker patterns, configuration server, and Kafka integration.",
        "downloadUrl": "/notes/microservices-study-notes",
        "tags": ["Microservices", "API Gateway", "Eureka", "Kafka"],
        "content": [
            {"type": "h1", "text": "1. Key Microservices Patterns"},
            {"type": "body", "text": "Microservices break a large monolithic app into small, autonomous, deployable services, requiring specialized patterns:<br/>- <b>Service Discovery (Eureka):</b> Registries mapping all microservice endpoints so they can search for each other.<br/>- <b>API Gateway (Spring Cloud Gateway):</b> Central proxy redirecting user requests, handling JWT validation and routing rules.<br/>- <b>Circuit Breaker (Resilience4j):</b> Prevents cascading network crashes by failing fast once a targeted downstream service fails threshold requirements."},
            {"type": "h1", "text": "2. Async Communication via Kafka"},
            {"type": "body", "text": "To prevent blocking threads, microservices use message queues like Apache Kafka or RabbitMQ. This permits highly decoupled, event-driven integrations."},
            {"type": "code", "text": """// Kafka consumer code inside consumer microservice
@Service
public class OrderConsumer {
    
    @KafkaListener(topics = "order-topic", groupId = "inventory-group")
    public void consumeOrderEvent(String eventJson) {
        System.out.println("Processing inventory decrease for order: " + eventJson);
        // Process local database operations here
    }
}"""}
        ]
    },
    {
        "id": "sql-study-notes",
        "title": "SQL & Relational Databases Quick Guide",
        "category": "Technical",
        "company": "All",
        "description": "SQL DDL/DML, Joins, grouping and aggregations, window functions, indexing strategies, and ACID properties.",
        "downloadUrl": "/notes/sql-study-notes",
        "tags": ["SQL", "Databases", "Joins", "Queries"],
        "content": [
            {"type": "h1", "text": "1. SQL Commands Classification"},
            {"type": "body", "text": "- <b>DDL (Data Definition):</b> CREATE, ALTER, DROP, TRUNCATE (defines database schemas).<br/>- <b>DML (Data Manipulation):</b> SELECT, INSERT, UPDATE, DELETE (manages records).<br/>- <b>DCL (Data Control):</b> GRANT, REVOKE (controls roles and privileges).<br/>- <b>TCL (Transaction Control):</b> COMMIT, ROLLBACK, SAVEPOINT."},
            {"type": "h1", "text": "2. Database Joins"},
            {"type": "body", "text": "Joins link tables based on shared column relationships. A LEFT JOIN fetches everything from the left table and matches from the right table, leaving NULLs for unmatched keys."},
            {"type": "code", "text": """-- Fetch employees and their department details
SELECT e.id, e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;"""},
            {"type": "h1", "text": "3. Window Functions & Aggregations"},
            {"type": "body", "text": "Window functions evaluate partitions without collapsing table records into unified groups. <i>DENSE_RANK()</i> returns ranking rows with no gaps in values."},
            {"type": "code", "text": """-- Rank employee salaries in their departments
SELECT name, dept_id, salary,
       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank
FROM employees;"""}
        ]
    },
    {
        "id": "interview-questions-study-notes",
        "title": "Top 50 Technical Interview Questions",
        "category": "Technical",
        "company": "All",
        "description": "Hand-picked high-frequency technical and behavioral interview questions with standard answers.",
        "downloadUrl": "/notes/interview-questions-study-notes",
        "tags": ["Interview", "Questions", "Aptitude", "HR"],
        "content": [
            {"type": "h1", "text": "Q1: Explain ACID Properties in DBMS"},
            {"type": "body", "text": "Transactions must support ACID rules:<br/>- <b>Atomicity:</b> Full transaction success or complete rollback.<br/>- <b>Consistency:</b> Transition database from one valid integrity state to another.<br/>- <b>Isolation:</b> Transactions run concurrently without interfering.<br/>- <b>Durability:</b> Committed transactions survive crashes (saved permanently)."},
            {"type": "h1", "text": "Q2: How does a HashMap work internally in Java?"},
            {"type": "body", "text": "HashMap stores key-value pairs in buckets based on the key's hashcode. It maps indices using <code>(n - 1) & hash</code>. If multiple keys hash to the same index (collision), they are chained in a LinkedList. In Java 8, if a LinkedList size in a bucket exceeds 8 and the table capacity is &ge; 64, it converts the list into a Red-Black Tree for faster O(log n) lookups."},
            {"type": "h1", "text": "Q3: Explain differences between REST and SOAP"},
            {"type": "body", "text": "- <b>REST:</b> Architectural style, uses HTTP methods, lighter payload formats (JSON, XML, HTML), stateless, easily scalable.<br/>- <b>SOAP:</b> Strict protocol, uses XML only, requires WSDL contracts, supports built-in WS-Security, heavier payload, supports stateful transactions."},
            {"type": "h1", "text": "Q4: Describe a time you faced team conflicts (HR STAR Method)"},
            {"type": "body", "text": "<b>Situation:</b> In our final year project, we had to choose between SQL and MongoDB. Two members clashed heavily.<br/><b>Task:</b> As the project coordinator, I had to resolve the conflict without affecting the timeline.<br/><b>Action:</b> I scheduled a meeting, listened to both ideas, listed the pros and cons of SQL vs NoSQL relative to our specific requirements, and proposed a vote based on technical fit.<br/><b>Result:</b> We chose SQL, completed the project 1 week early, and maintained great team relationships."}
        ]
    }
]

def main():
    # Load credentials
    key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json")
    if not os.path.exists(key_path):
        print(f"Error: serviceAccountKey.json not found at {key_path}")
        return
        
    cred = credentials.Certificate(key_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    print("Uploading 10 structured study notes (blogs) to Firestore...")
    batch = db.batch()
    for note in STUDY_NOTES:
        doc_ref = db.collection("notes").document(note["id"])
        batch.set(doc_ref, note)
        
    batch.commit()
    print("Firestore study notes upload completed successfully!")
    
    # Update local data.json
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
    if os.path.exists(data_path):
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        data["notes"] = STUDY_NOTES
        
        with open(data_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Local data.json backup updated with 'notes' collection successfully!")

if __name__ == "__main__":
    main()
