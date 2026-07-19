import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
raw_chan_id = os.getenv("CHANNEL_ID", "")
CHANNEL_ID = raw_chan_id if (raw_chan_id and raw_chan_id.startswith("UC")) else "UCkViZeUiDCEof_t9--OgZkA"

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend",
    "public",
    "data",
    "dummy.json"
)
BACKEND_OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "data",
    "data.json"
)


# Standard curated data that is merged with YouTube API results
CURATED_RESOURCES = [
    {
        "id": "cog-prep-guide",
        "title": "Cognizant GenC / Elevate Preparation Guide",
        "category": "Placement Prep",
        "company": "Cognizant",
        "description": "Comprehensive guide to clearing the Cognizant technical interview, training assessment, and skill matrix test.",
        "downloadUrl": "#",
        "tags": ["Cognizant", "GenC", "Training", "Interview"]
    },
    {
        "id": "tcs-nqt-roadmap",
        "title": "TCS NQT Preparation Roadmap & Syllabus",
        "category": "Placement Prep",
        "company": "TCS",
        "description": "Detailed syllabus, recommended resources, and mock questions for TCS National Qualifier Test (NQT).",
        "downloadUrl": "#",
        "tags": ["TCS", "NQT", "Aptitude", "Coding"]
    },
    {
        "id": "java-oop-cheatsheet",
        "title": "Java & OOPs Interview Cheat Sheet",
        "category": "Technical",
        "company": "All",
        "description": "Quick revision notes on Core Java, OOPs concepts, Exception Handling, Collections Framework, and Multithreading.",
        "downloadUrl": "#",
        "tags": ["Java", "OOPs", "Coding", "Interview"]
    },
    {
        "id": "dsa-interview-patterns",
        "title": "Top 15 DSA Patterns for Tech Interviews",
        "category": "Technical",
        "company": "All",
        "description": "Learn the patterns behind coding interview questions: Slidng Window, Two Pointers, Fast & Slow Pointers, etc.",
        "downloadUrl": "#",
        "tags": ["DSA", "Algorithms", "C++", "Java"]
    },
    {
        "id": "accenture-cognitive-prep",
        "title": "Accenture Cognitive and Coding Test Guide",
        "category": "Placement Prep",
        "company": "Accenture",
        "description": "Step-by-step preparation guide for Accenture's cognitive assessment, technical assessment, and coding round.",
        "downloadUrl": "#",
        "tags": ["Accenture", "Cognitive", "Coding", "Aptitude"]
    },
    {
        "id": "irfan-resume",
        "title": "Md Irfan's Resume",
        "category": "Resume",
        "company": "All",
        "description": "Professional resume of Md Irfan, Software Developer (3+ Years Experience).",
        "downloadUrl": "https://mega.nz/file/qs53CDja#dS4v5uKG4UGEwdMFtUVcoebN0F5KNmBNP5SqkDo3mEE",
        "tags": ["Resume", "Developer", "Java", "React"]
    },
    {
        "id": "c-study-notes",
        "title": "C Programming Quick Notes",
        "category": "Technical",
        "company": "All",
        "description": "Essential syntax, pointer concepts, structures, dynamic memory allocation, and key interview snippets.",
        "downloadUrl": "/notes/c-study-notes",
        "tags": ["C", "Syntax", "Pointers", "Core"]
    },
    {
        "id": "cpp-study-notes",
        "title": "C++ & OOPs Revision Notes",
        "category": "Technical",
        "company": "All",
        "description": "Object-oriented concepts, virtual functions, templates, STL (Standard Template Library), and C++ reference.",
        "downloadUrl": "/notes/cpp-study-notes",
        "tags": ["C++", "OOPs", "STL", "Polymorphism"]
    },
    {
        "id": "python-study-notes",
        "title": "Python Cheat Sheet & Reference",
        "category": "Technical",
        "company": "All",
        "description": "Core concepts, list comprehensions, decorators, generators, OOPs in Python, and common libraries.",
        "downloadUrl": "/notes/python-study-notes",
        "tags": ["Python", "Syntax", "Decorators", "OOPs"]
    },
    {
        "id": "dsa-study-notes",
        "title": "DSA Essential Hand Book",
        "category": "Technical",
        "company": "All",
        "description": "Overview of major data structures, sorting/searching algorithms, complexity analysis, and coding patterns.",
        "downloadUrl": "/notes/dsa-study-notes",
        "tags": ["DSA", "Data Structures", "Algorithms", "Binary Search"]
    },
    {
        "id": "java-study-notes",
        "title": "Java Programming Master Notes",
        "category": "Technical",
        "company": "All",
        "description": "Core Java, JVM architecture, multithreading, collections framework, Java 8 features (lambdas/streams).",
        "downloadUrl": "/notes/java-study-notes",
        "tags": ["Java", "OOPs", "JVM", "Streams"]
    },
    {
        "id": "system-design-study-notes",
        "title": "System Design Fundamentals",
        "category": "Technical",
        "company": "All",
        "description": "High-level architecture, scalability, load balancers, caching, databases (SQL vs NoSQL), and CAP theorem.",
        "downloadUrl": "/notes/system-design-study-notes",
        "tags": ["System Design", "Scalability", "Architecture", "Microservices"]
    },
    {
        "id": "spring-boot-study-notes",
        "title": "Spring Boot Core Concepts",
        "category": "Technical",
        "company": "All",
        "description": "Spring framework core, IoC, Dependency Injection, REST APIs, annotations reference, and Spring Data JPA.",
        "downloadUrl": "/notes/spring-boot-study-notes",
        "tags": ["Spring Boot", "Java", "REST API", "MVC"]
    },
    {
        "id": "microservices-study-notes",
        "title": "Microservices Architecture Blueprints",
        "category": "Technical",
        "company": "All",
        "description": "Discovery services (Eureka), API Gateway, Circuit Breaker patterns, configuration server, and Kafka integration.",
        "downloadUrl": "/notes/microservices-study-notes",
        "tags": ["Microservices", "API Gateway", "Eureka", "Kafka"]
    },
    {
        "id": "sql-study-notes",
        "title": "SQL & Relational Databases Quick Guide",
        "category": "Technical",
        "company": "All",
        "description": "SQL DDL/DML, Joins, grouping and aggregations, window functions, indexing strategies, and ACID properties.",
        "downloadUrl": "/notes/sql-study-notes",
        "tags": ["SQL", "Databases", "Joins", "Queries"]
    },
    {
        "id": "interview-questions-study-notes",
        "title": "Top 50 Technical Interview Questions",
        "category": "Technical",
        "company": "All",
        "description": "Hand-picked high-frequency technical and behavioral interview questions with standard answers.",
        "downloadUrl": "/notes/interview-questions-study-notes",
        "tags": ["Interview", "Questions", "Aptitude", "HR"]
    }
]

INTERVIEW_EXPERIENCES = [
    {
        "id": "exp-1",
        "candidate": "Rahul Sharma",
        "role": "Cognizant GenC Developer",
        "company": "Cognizant",
        "date": "June 2026",
        "verdict": "Selected",
        "difficulty": "Medium",
        "rounds": [
            {"name": "Online Assessment", "summary": "Aptitude, logical reasoning, and 2 basic coding questions (Array-based and String-based)."},
            {"name": "Technical Interview", "summary": "Questions on Java (Inheritance vs Polymorphism, Abstract classes, Interface, memory management), SQL queries (Joins, Group By, 2nd highest salary), and my final year project details."},
            {"name": "HR Interview", "summary": "Basic behavioral questions: relocation willingness, night shift comfort, and background verification overview."}
        ],
        "tips": "Revise OOPs concepts thoroughly and practice basic SQL queries. Knowing your project inside out is critical."
    },
    {
        "id": "exp-2",
        "candidate": "Priya Patel",
        "role": "TCS Ninja Developer",
        "company": "TCS",
        "date": "July 2026",
        "verdict": "Selected",
        "difficulty": "Easy-Medium",
        "rounds": [
            {"name": "TCS NQT", "summary": "Numerical ability, verbal reasoning, and 2 coding questions (Matrix manipulation and string reversal)."},
            {"name": "TR/MR/HR Combined Interview", "summary": "Single panel interview. Asked about my favorite programming language (Python), explanation of lists vs tuples, basic database normalization, and situational questions like 'how do you handle conflicts in a team?'"}
        ],
        "tips": "Focus on verbal and aptitude speed during NQT. For the interview, show confidence and have basic knowledge of DBMS and SDLC."
    },
    {
        "id": "exp-3",
        "candidate": "Aniket Verma",
        "role": "Accenture ASE (Associate Software Engineer)",
        "company": "Accenture",
        "date": "May 2026",
        "verdict": "Selected",
        "difficulty": "Medium",
        "rounds": [
            {"name": "Cognitive and Technical Assessment", "summary": "Rapid fire MCQ on cognitive ability, pseudocode debugging, MS Office suite basics, and cloud concepts."},
            {"name": "Coding Assessment", "summary": "2 coding questions. One was on array manipulation, another on bitwise operators. Clearing 1 test case gets you through."},
            {"name": "Technical & HR Interview", "summary": "Discussion about project structure, Git commands used, team conflicts resolved, and goals for the next 2 years."}
        ],
        "tips": "Practice solving pseudocodes on platforms like GeeksforGeeks. Accenture's cognitive test has strict timing."
    }
]

FLASHCARDS = [
    {
        "id": "fc-1",
        "question": "What is the difference between an Abstract Class and an Interface in Java?",
        "answer": "An Abstract Class can have both abstract and concrete methods, can have state (instance variables), and supports single inheritance. An Interface can only have abstract methods (prior to Java 8), static/default methods (Java 8+), cannot have instance variables (only static final constants), and supports multiple inheritance.",
        "category": "Java"
    },
    {
        "id": "fc-2",
        "question": "What is Method Overriding vs Method Overloading?",
        "answer": "Overloading happens in the same class when two methods have the same name but different signatures (compile-time polymorphism). Overriding happens in child classes when a subclass redefines a parent class method with the identical signature (run-time polymorphism).",
        "category": "Java"
    },
    {
        "id": "fc-3",
        "question": "How do you find the second highest salary in SQL?",
        "answer": "Using subqueries: `SELECT MAX(Salary) FROM Employee WHERE Salary < (SELECT MAX(Salary) FROM Employee);` or using LIMIT/OFFSET: `SELECT Salary FROM Employee ORDER BY Salary DESC LIMIT 1 OFFSET 1;`.",
        "category": "SQL"
    },
    {
        "id": "fc-4",
        "question": "What is the difference between a Singly Linked List and a Doubly Linked List?",
        "answer": "A Singly Linked List node contains data and a pointer to the next node (unidirectional traversal). A Doubly Linked List node contains data, a pointer to the next node, and a pointer to the previous node (bidirectional traversal, but consumes more memory per node).",
        "category": "DSA"
    },
    {
        "id": "fc-5",
        "question": "Explain the concept of Garbage Collection in Java.",
        "answer": "Garbage Collection is an automatic process by the JVM that identifies and destroys objects that are no longer referenced in the heap memory, freeing up system resources. System.gc() can suggest execution, but doesn't guarantee immediate GC.",
        "category": "Java"
    }
]

ONBOARDING_STAGES = {
    "Cognizant": [
        {"stage": "1. Letter of Intent (LOI)", "duration": "Immediate", "desc": "Received after clearing the interview rounds. Acceptance is required within 3-7 days."},
        {"stage": "2. Pre-onboarding Training", "duration": "1 - 2 Months", "desc": "Mandatory enablement training on tech stacks (Java, C#, Python, QA, etc.) via platforms like Udemy/Internal portals."},
        {"stage": "3. Offer Letter (OL)", "duration": "2 - 4 Weeks after LOI/Training", "desc": "Formal employment offer containing compensation breakdown and tentative joining date."},
        {"stage": "4. Document Verification", "duration": "1 - 2 Weeks", "desc": "Upload degree certificates, PAN, Aadhaar, and background check authorization on the onboarding portal."},
        {"stage": "5. Onboarding & Induction", "duration": "Day 1", "desc": "Physical or virtual induction, asset allocation (laptop setup), and assignment of employee ID."}
    ],
    "TCS": [
        {"stage": "1. Exam & Interview Results", "duration": "Immediate", "desc": "Receipt of NQT scorecard and interview completion mail."},
        {"stage": "2. Offer Letter on NextStep Portal", "duration": "2 - 4 Weeks", "desc": "Generated on the TCS NextStep portal. Must download, sign, and upload acceptance."},
        {"stage": "3. ILP (Initial Learning Program) Scheduling", "duration": "1 - 3 Months", "desc": "Assigned batch for digital or physical learning at a TCS center. Covers coding, Agile, and soft skills."},
        {"stage": "4. Joining Letter (JL)", "duration": "3 - 6 Weeks before onboarding", "desc": "Final date and location of joining, including ILP center details."},
        {"stage": "5. BGC (Background Check)", "duration": "1 - 2 Weeks", "desc": "Service Agreement uploading (usually requires stamp papers and guarantor signature) and medical certificate submissions."}
    ],
    "Accenture": [
        {"stage": "1. Selection Mail & Task Allocation", "duration": "1 - 2 Weeks", "desc": "Selection notification followed by access to the Workday onboarding portal for tasks."},
        {"stage": "2. Document Uploads & Green Audit", "duration": "2 - 4 Weeks", "desc": "Intense review of educational records. Once verified, you get a 'Green Status' mail."},
        {"stage": "3. Warm-up Learning & Primers", "duration": "1 Month", "desc": "Self-learning modules on software engineering fundamentals. Followed by a primer assessment."},
        {"stage": "4. Date of Joining (DOJ) Confirmation", "duration": "2 - 4 Weeks before joining", "desc": "Official joining date confirmation based on business demand and location selection."},
        {"stage": "5. Day 1 Induction", "duration": "Day 1", "desc": "Onboarding induction at the office, asset issuance, and project tagging setup."}
    ]
}

def generate_mock_data():
    print("Generating rich mock data for Virtual Gyans...")
    mock_stats = {
        "subscriberCount": "124500",
        "viewCount": "9875400",
        "videoCount": "412",
        "avatarUrl": "/youtube-avatar.png",
        "bannerUrl": "/youtube-banner.png",
        "title": "Virtual Gyans",
        "description": "Your ultimate destination for career guidance, placement preparation, and technical training. We simplify recruitment processes for top MNCs like Cognizant, TCS, Infosys, and Accenture, and offer simple tutorials on programming and Computer Science."
    }

    mock_playlists = [
        {"id": "pl-1", "title": "Cognizant GenC Training Prep", "videoCount": "15"},
        {"id": "pl-2", "title": "Java Placement Course", "videoCount": "32"},
        {"id": "pl-3", "title": "TCS NQT Preparation", "videoCount": "22"},
        {"id": "pl-4", "title": "Career Q&A and Job Updates", "videoCount": "48"}
    ]

    mock_videos = [
        {
            "id": "vid-1",
            "title": "Cognizant GenC Training Rules 2026 | Passing Criteria & Skill Matrix Explained",
            "description": "In this video, we discuss the detailed rules for Cognizant GenC onboarding training, passing marks, and what happens if you fail the assessments.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=270&fit=crop",
            "publishedAt": "2026-07-10T12:00:00Z",
            "category": "Placement Prep",
            "videoUrl": "https://www.youtube.com/watch?v=vid-1",
            "views": "15K",
            "duration": "12:45"
        },
        {
            "id": "vid-2",
            "title": "Cognizant Onboarding Delay Update | Important Information for 2025/2026 Batch",
            "description": "Latest updates regarding Cognizant joining letters, training schedules, and what you should do while waiting for onboarding.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=480&h=270&fit=crop",
            "publishedAt": "2026-07-15T08:30:00Z",
            "category": "Placement Prep",
            "videoUrl": "https://www.youtube.com/watch?v=vid-2",
            "views": "28K",
            "duration": "08:15"
        },
        {
            "id": "vid-3",
            "title": "Java Full Placement Course - Tutorial 1: OOPs Concepts in One Video",
            "description": "Learn object-oriented programming concepts in Java from scratch with real-world examples. Perfect for campus placements.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&h=270&fit=crop",
            "publishedAt": "2026-06-20T14:00:00Z",
            "category": "Technical",
            "videoUrl": "https://www.youtube.com/watch?v=vid-3",
            "views": "45K",
            "duration": "45:30"
        },
        {
            "id": "vid-4",
            "title": "TCS NQT 2026 Preparation Guide | Complete Syllabus, Pattern & Imp Topics",
            "description": "How to prepare for TCS NQT 2026 exam. We discuss paper pattern, coding questions, and aptitude shortcuts.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=270&fit=crop",
            "publishedAt": "2026-07-01T10:00:00Z",
            "category": "Placement Prep",
            "videoUrl": "https://www.youtube.com/watch?v=vid-4",
            "views": "32K",
            "duration": "15:20"
        },
        {
            "id": "vid-5",
            "title": "Cognizant GenC Technical Interview Experience | Real Questions & Answers",
            "description": "In this video, one of our subscribers shares their full Cognizant technical interview experience, questions asked, and answers.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=480&h=270&fit=crop",
            "publishedAt": "2026-06-15T09:00:00Z",
            "category": "Placement Prep",
            "videoUrl": "https://www.youtube.com/watch?v=vid-5",
            "views": "22K",
            "duration": "18:40"
        },
        {
            "id": "vid-6",
            "title": "Data Structures & Algorithms (DSA) Roadmap for Placement Prep 2026",
            "description": "Complete step-by-step roadmap to master DSA for placements in 3 months. Topics to study and websites to practice.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=480&h=270&fit=crop",
            "publishedAt": "2026-05-10T15:00:00Z",
            "category": "Technical",
            "videoUrl": "https://www.youtube.com/watch?v=vid-6",
            "views": "60K",
            "duration": "22:10"
        },
        {
            "id": "vid-7",
            "title": "Wipro Elite National Talent Hunt (NTH) Joining Update & Training Details",
            "description": "Important updates on Wipro onboarding delays, Project Readiness Program (PRP), and what is the training criteria.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=480&h=270&fit=crop",
            "publishedAt": "2026-07-08T11:00:00Z",
            "category": "Placement Prep",
            "videoUrl": "https://www.youtube.com/watch?v=vid-7",
            "views": "12K",
            "duration": "10:30"
        },
        {
            "id": "vid-8",
            "title": "HR Interview Common Questions & Best Answers for Freshers",
            "description": "Crack any HR interview with these simple tips and structures for questions like 'Tell me about yourself', 'Why should we hire you?'.",
            "thumbnailUrl": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=480&h=270&fit=crop",
            "publishedAt": "2026-06-28T07:00:00Z",
            "category": "Placement Prep",
            "videoUrl": "https://www.youtube.com/watch?v=vid-8",
            "views": "19K",
            "duration": "11:50"
        }
    ]

    notes_list = []
    try:
        local_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "data.json")
        if os.path.exists(local_data_path):
            with open(local_data_path, "r", encoding="utf-8") as f:
                notes_list = json.load(f).get("notes", [])
    except Exception:
        pass

    return {
        "channel": mock_stats,
        "playlists": mock_playlists,
        "videos": mock_videos,
        "resources": CURATED_RESOURCES,
        "experiences": INTERVIEW_EXPERIENCES,
        "flashcards": FLASHCARDS,
        "onboardingStages": ONBOARDING_STAGES,
        "notes": notes_list,
        "lastUpdated": "2026-07-19T11:45:00Z"
    }

def fetch_youtube_data():
    try:
        from sync_youtube import fetch_youtube_channel_metadata, fetch_youtube_videos
        channel = fetch_youtube_channel_metadata()
        videos = fetch_youtube_videos()
        playlists = []
        
        # Check if Firebase is available
        key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json")
        has_firebase = os.getenv("FIREBASE_SERVICE_ACCOUNT") or os.path.exists(key_path)
        
        resources_list = CURATED_RESOURCES
        experiences_list = INTERVIEW_EXPERIENCES
        flashcards_list = FLASHCARDS
        onboarding_stages_dict = ONBOARDING_STAGES
        
        if has_firebase:
            try:
                import firebase_admin
                from firebase_admin import credentials, firestore
                
                if not firebase_admin._apps:
                    firebase_creds_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
                    if firebase_creds_json:
                        creds_dict = json.loads(firebase_creds_json)
                        cred = credentials.Certificate(creds_dict)
                        firebase_admin.initialize_app(cred)
                    else:
                        cred = credentials.Certificate(key_path)
                        firebase_admin.initialize_app(cred)
                
                db = firestore.client()
                
                # Fetch resources
                print("Fetching resources from Firestore during static compile...")
                resources_list = [doc.to_dict() for doc in db.collection("resources").stream()]
                if not resources_list:
                    resources_list = CURATED_RESOURCES
                    
                # Fetch experiences
                print("Fetching experiences from Firestore during static compile...")
                experiences_list = [doc.to_dict() for doc in db.collection("experiences").stream()]
                def get_exp_num(exp):
                    try:
                        return int(exp.get("id", "").split("-")[-1])
                    except Exception:
                        return 0
                experiences_list.sort(key=get_exp_num, reverse=True)
                if not experiences_list:
                    experiences_list = INTERVIEW_EXPERIENCES
                    
                # Fetch flashcards
                print("Fetching flashcards from Firestore during static compile...")
                flashcards_list = [doc.to_dict() for doc in db.collection("flashcards").stream()]
                if not flashcards_list:
                    flashcards_list = FLASHCARDS
                    
                # Fetch onboardingStages
                print("Fetching onboarding stages from Firestore during static compile...")
                stages_docs = db.collection("onboardingStages").stream()
                onboarding_stages_dict = {doc.id: doc.to_dict().get("stages", []) for doc in stages_docs}
                if not onboarding_stages_dict:
                    onboarding_stages_dict = ONBOARDING_STAGES
                
                # Fetch study notes
                print("Fetching study notes from Firestore during static compile...")
                notes_list = [doc.to_dict() for doc in db.collection("notes").stream()]
                
                # Fetch playground questions
                print("Fetching playground questions from Firestore during static compile...")
                questions_list = [doc.to_dict() for doc in db.collection("playground_questions").stream()]
                    
            except Exception as e:
                print(f"Error fetching Firestore data during static compile, falling back to static lists: {e}")
                notes_list = []
                questions_list = []

        if not notes_list:
            try:
                local_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "data.json")
                if os.path.exists(local_data_path):
                    with open(local_data_path, "r", encoding="utf-8") as f:
                        notes_list = json.load(f).get("notes", [])
            except Exception:
                pass

        if not questions_list:
            try:
                local_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "data.json")
                if os.path.exists(local_data_path):
                    with open(local_data_path, "r", encoding="utf-8") as f:
                        questions_list = json.load(f).get("playground_questions", [])
            except Exception:
                pass

        import datetime
        return {
            "channel": channel,
            "playlists": playlists,
            "videos": videos,
            "resources": resources_list,
            "experiences": experiences_list,
            "flashcards": flashcards_list,
            "onboardingStages": onboarding_stages_dict,
            "notes": notes_list,
            "playground_questions": questions_list,
            "lastUpdated": datetime.datetime.utcnow().isoformat() + "Z"
        }

    except Exception as e:
        print(f"Error fetching data from YouTube API: {e}")
        return None

def main():
    data = fetch_youtube_data()
    if not data:
        print("Using high-quality mock data fallback...")
        data = generate_mock_data()

    # Define directories
    backend_data_dir = os.path.dirname(BACKEND_OUTPUT_PATH)
    backend_backup_dir = os.path.join(backend_data_dir, "backup")
    frontend_data_dir = os.path.dirname(OUTPUT_PATH)

    os.makedirs(backend_data_dir, exist_ok=True)
    os.makedirs(backend_backup_dir, exist_ok=True)
    os.makedirs(frontend_data_dir, exist_ok=True)

    # 1. Save full detailed segregated files in backend/data/backup/
    keys = ["channel", "playlists", "videos", "resources", "experiences", "flashcards", "onboardingStages", "notes", "playground_questions"]
    for key in keys:
        if key in data:
            with open(os.path.join(backend_backup_dir, f"{key}.json"), "w", encoding="utf-8") as f:
                json.dump(data[key], f, indent=2, ensure_ascii=False)

    # 3. Strip data for minified local databases
    stripped = {}
    if "channel" in data:
        stripped["channel"] = data["channel"]
    if "playlists" in data:
        stripped["playlists"] = [
            {"id": p.get("id"), "title": p.get("title"), "videoCount": p.get("videoCount")}
            for p in data["playlists"]
        ]
    if "videos" in data:
        stripped["videos"] = [
            {
                "id": v.get("id"),
                "title": v.get("title"),
                "description": v.get("description", ""),
                "thumbnailUrl": v.get("thumbnailUrl") or f"https://i.ytimg.com/vi/{v.get('id')}/hqdefault.jpg",
                "publishedAt": v.get("publishedAt", ""),
                "category": v.get("category", "Placement Prep"),
                "videoUrl": v.get("videoUrl") or f"https://www.youtube.com/watch?v={v.get('id')}",
                "views": v.get("views", "N/A"),
                "duration": v.get("duration", "N/A")
            }
            for v in data["videos"]
        ]
    if "resources" in data:
        stripped["resources"] = data["resources"]
    if "experiences" in data:
        stripped["experiences"] = [
            {
                "id": e.get("id"),
                "company": e.get("company"),
                "role": e.get("role"),
                "verdict": e.get("verdict"),
                "candidate": e.get("candidate"),
                "date": e.get("date"),
                "difficulty": e.get("difficulty"),
                "tips": e.get("tips")
            }
            for e in data["experiences"]
        ]
    if "flashcards" in data:
        stripped["flashcards"] = [
            {"id": f.get("id"), "title": f.get("title"), "category": f.get("category")}
            for f in data["flashcards"]
        ]
    if "onboardingStages" in data:
        stripped["onboardingStages"] = {company: [] for company in data["onboardingStages"]}
    if "notes" in data:
        stripped["notes"] = [
            {"id": n.get("id"), "title": n.get("title")}
            for n in data["notes"]
        ]
    if "playground_questions" in data:
        stripped["playground_questions"] = data["playground_questions"]

    # 4. Save minified segregated files to backend/data/ and frontend/public/data/
    for key in keys:
        if key in stripped:
            with open(os.path.join(backend_data_dir, f"{key}.json"), "w", encoding="utf-8") as f:
                json.dump(stripped[key], f, indent=2, ensure_ascii=False)
            with open(os.path.join(frontend_data_dir, f"{key}.json"), "w", encoding="utf-8") as f:
                json.dump(stripped[key], f, indent=2, ensure_ascii=False)

    print("Static data compiled, minified, and segregated successfully!")

if __name__ == "__main__":
    main()
