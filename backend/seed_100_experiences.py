import os
import json
import random
import datetime
import firebase_admin
from firebase_admin import credentials, firestore

FIRST_NAMES = ["Aarav", "Aditya", "Akash", "Amit", "Ananya", "Aniket", "Anjali", "Arjun", "Arohi", "Avani", 
               "Deepak", "Divya", "Gaurav", "Harsh", "Isha", "Karan", "Kavya", "Manish", "Neha", "Nikhil", 
               "Pooja", "Pranav", "Priya", "Rahul", "Rohan", "Riya", "Sanjay", "Shreya", "Siddharth", "Sneha", 
               "Sunita", "Tanvi", "Uday", "Varun", "Vikram", "Yash", "Swati", "Kunal", "Meera", "Ramesh",
               "Sandeep", "Kiran", "Nisha", "Rajesh", "Jyoti", "Kishore", "Preeti", "Suresh", "Abhishek", "Aishwarya"]

LAST_NAMES = ["Sharma", "Verma", "Gupta", "Patel", "Mehta", "Nair", "Iyer", "Rao", "Joshi", "Singh", 
              "Kumar", "Reddy", "Choudhury", "Das", "Banerjee", "Chatterjee", "Mishra", "Pandey", "Saxena", "Deshmukh",
              "Bose", "Pillai", "Prasad", "Naidu", "Menon", "Sen", "Roy", "Gowda", "Kulkarni", "Jha"]

COMPANIES = ["TCS", "Accenture", "Cognizant", "Wipro", "Infosys", "Capgemini"]

ROLES = {
    "TCS": ["TCS Ninja Developer", "TCS Digital Specialist", "TCS Prime Engineer", "TCS System Engineer"],
    "Accenture": ["Accenture ASE (Associate Software Engineer)", "Accenture FSE (Full Stack Engineer)"],
    "Cognizant": ["Cognizant GenC Developer", "Cognizant GenC Elevate Specialist", "Cognizant GenC Next Analyst"],
    "Wipro": ["Wipro Elite Developer", "Wipro Turbo Analyst"],
    "Infosys": ["Infosys System Engineer", "Infosys Specialist Programmer", "Infosys Power Programmer"],
    "Capgemini": ["Capgemini Analyst", "Capgemini Senior Analyst"]
}

TECH_SUMMARIES = {
    "TCS": [
        "Asked about basic OOPs principles. I explained Inheritance with a real-world example of Vehicles. They asked me to write code for Method Overriding in Python/Java.",
        "Discussion about DBMS and SQL. I had to write queries for Inner Join and find the duplicate rows in a table using GROUP BY and HAVING count(*) > 1.",
        "Asked about difference between lists and tuples. Explanatory discussion on SDLC (Software Development Life Cycle) model, specifically Agile vs Waterfall.",
        "Asked to write code to check if a string is a Palindrome. Also asked basic questions on pointers (C++) or memory management (Python)."
    ],
    "Accenture": [
        "Asked about my final year project. I explained the architecture, technologies used (React, Python), database model, and my specific role in the team.",
        "Discussion on cloud computing. What is SaaS, PaaS, IaaS? What is the difference between SQL and NoSQL databases?",
        "Discussion on Git commands. Explain the difference between git pull and git fetch. How do you resolve conflicts during git merge?",
        "Discussion on basic data structures. Explain the difference between Stack and Queue. Write code to reverse a linked list."
    ],
    "Cognizant": [
        "Asked to write code for finding the 2nd highest salary in a table using subqueries. Also asked about SQL Indexes and views.",
        "Discussion on REST APIs. What are GET, POST, PUT, DELETE methods? What does status code 404, 500, and 200 mean?",
        "Asked about HTML, CSS, and JS basics. Explain CSS box model, difference between let and const in JS, and what is event bubbling.",
        "Asked about OOPs features. Explain abstraction vs encapsulation. Write a small code implementing an interface in Java/C#."
    ],
    "Wipro": [
        "Asked to write a program to swap two numbers without using a third variable. I wrote it using arithmetic operations.",
        "Discussion on basic networking concepts. What is TCP/IP model? Explain the difference between HTTP and HTTPS protocols.",
        "Discussion on database Normalization (1NF, 2NF, 3NF). Why is it needed? Explain ACID properties of databases.",
        "Asked about Python data structures. Explain lists, dicts, and sets. When to use which? Write code to remove duplicates from a list."
    ],
    "Infosys": [
        "Coding question: Find if two strings are anagrams of each other. I wrote an O(n) solution using hashmap.",
        "Deep discussion on Operating System concepts. Explain paging, virtual memory, deadlocks, and how to prevent deadlocks.",
        "Discussion on complex SQL queries. Explain correlated subqueries. Write a query to find employees who earn more than their managers.",
        "Asked to write code to rotate a 2D matrix by 90 degrees. Also asked about complexity analysis (Big O notation) of search algorithms."
    ],
    "Capgemini": [
        "Asked to explain Java inheritance, interfaces, abstract classes. Write code demonstrating multiple inheritance using interfaces.",
        "Discussion on SDLC models. Why Agile is preferred? What is scrum meeting? Explain Sprint cycle.",
        "Asked about SQL Joins. Write query for Left Join. How does it handle null values? Explain database primary key vs foreign key.",
        "Asked to write a program to find the factorial of a number using recursion. What are the advantages and disadvantages of recursion?"
    ]
}

HR_SUMMARIES = {
    "TCS": [
        "Asked if I am willing to relocate to any location in India. Also asked about my willingness to work in night shifts. I said yes to both.",
        "Asked about my strengths and weaknesses. I explained how I work on my weakness (time management) by using calendar tools.",
        "Asked why I want to join TCS. I talked about TCS being a global leader and its training programs like ILP.",
        "Asked situational questions like: 'If your project deadline is near and your team member falls sick, what will you do?'"
    ],
    "Accenture": [
        "Discussed my hobbies and extra-curricular activities. They asked how I handle pressure and work stress.",
        "Asked why I applied for Accenture. I discussed Accenture's innovation centers and their focus on cloud and digital transformation.",
        "Discussed team collaboration: 'Tell me about a time you had a conflict with a team member and how you resolved it.'",
        "Asked about my career plans for the next 3 to 5 years. I explained my goal of becoming a technical lead."
    ],
    "Cognizant": [
        "Asked about my salary expectations and willingness to work in shifts. Verified my educational documents.",
        "Discussion on company core values. Why Cognizant? What do you know about Cognizant's recent acquisitions?",
        "Asked: 'If you are assigned to a technology that you do not know, how will you handle it?'",
        "Discussed my leadership qualities and instances where I took initiative in college events."
    ],
    "Wipro": [
        "Asked about the Wipro service agreement (bond). Verified my willingness to sign it and relocate.",
        "Discussed Wipro's culture and values (Spirit of Wipro). Asked how I align with them.",
        "Asked: 'Why should we hire you instead of other candidates?' I highlighted my technical projects and fast learning ability.",
        "Discussion on my family background and willingness to adapt to new corporate environments."
    ],
    "Infosys": [
        "Asked about the company history and founders. Why Infosys? I mentioned their beautiful campuses and training center in Mysore.",
        "Asked situational questions: 'If your manager gives you negative feedback, how will you react?'",
        "Discussed how I keep myself updated with latest technology trends. I mentioned blogs and certification courses.",
        "Verification of academic records and discussions on location preferences."
    ],
    "Capgemini": [
        "Discussed Capgemini's French heritage and global presence. Asked about my willingness to relocate.",
        "Asked: 'What is the most challenging situation you faced in college, and how did you overcome it?'",
        "Discussion on work-life balance and how I prioritize my tasks when multiple assignments are due.",
        "Discussed my communication skills and how I ensure clarity when presenting projects to non-technical stakeholders."
    ]
}

APTITUDE_SUMMARIES = {
    "TCS": [
        "Online test on TCS iON platform. Quant questions on time-work, speed-distance, probability. Coding questions: series summation and matrix transposing.",
        "NQT online test. Included verbal, numerical, and reasoning sections. Very tight constraints. Coding section had 1 easy (Prime Check) and 1 medium (Graph traversal) question.",
        "Standard NQT test. Numerical questions on averages, percentages, and simple interest. Coding questions: array element search and string duplication removal."
    ],
    "Accenture": [
        "Cognitive assessment with rapid-fire questions on abstract reasoning, logic, and English. Technical section had pseudocode, MS Office, and cloud concepts.",
        "Cognitive and technical test. Pseudocodes were tricky (bitwise operations and nested loops). English section was focused on prepositions and grammar.",
        "Rapid fire MCQ on cognitive ability and basic IT topics. English section had reading comprehension and error spotting."
    ],
    "Cognizant": [
        "Aptitude test containing logical reasoning, quantitative analysis, and verbal skills. Also included a SQL query MCQs section.",
        "AMCAT-based assessment. Had sections on logical reasoning, quantitative ability, and debugging codes (Automata Fix).",
        "Online test on Mettl. Verbal ability was moderate, quant had probability and permutation questions. Coding was on arrays."
    ],
    "Wipro": [
        "Elite NLTH online test. Aptitude section was of moderate difficulty. Essay writing section was online (automating checking for spelling and grammar).",
        "NLTH test on CoCubes. Quant questions on ratios, time-speed-distance, and log values. Coding had 2 easy programs.",
        "Online test with quantitative, analytical, and verbal sections. Essay writing section on topics like 'Impact of AI on jobs'."
    ],
    "Infosys": [
        "InfyTQ Certification test. Extremely tough Python coding and database query questions. Focus on OOPs logic and data structures.",
        "HackwithInfy online coding challenge. Had 3 coding questions. I solved 1.5 questions to get selected for the interview.",
        "System Engineer online assessment. Had sections on mathematical puzzles, visual reasoning, and pseudocode analysis."
    ],
    "Capgemini": [
        "Aptitude test with game-based reasoning (inductive, grid challenge, motion challenge) which was very interactive and interesting.",
        "Pseudo-code, English communication, and game-based aptitude sections. Game-based reasoning requires rapid spatial memory.",
        "Online test with behavioral, English grammar, pseudo-code analysis, and basic mathematical sections."
    ]
}

TIPS = {
    "TCS": [
        "Practice coding on GeeksforGeeks and study basic SQL queries. Be confident in TR panel and don't lie on your resume.",
        "Be strong in your final year project. Know the basic concepts of SDLC and DBMS. Relocation question should always be answered with 'Yes'.",
        "Prepare NQT mock tests. Verbal section is easy, but quant requires speed. For the interview, revise basic Java/C++ concepts."
    ],
    "Accenture": [
        "Focus on MS Office, MS Excel shortcuts, and cloud computing definitions. Accenture's cognitive test has strict timing rules.",
        "Communication assessment requires a quiet room and clear pronunciation. For the interview, talk about teamwork and collaboration.",
        "Practice solving pseudocodes on platforms like GeeksforGeeks. Ensure you write at least one coding question correctly to qualify."
    ],
    "Cognizant": [
        "Rehearse your project details. Be prepared for SQL queries involving JOINS and aggregate functions. HR round is easy.",
        "Practice debugging questions (finding syntax/logical errors in C/Java/Python). Basic OOPs concepts are mandatory.",
        "Solve aptitude tests. Keep your resume concise. Show enthusiasm to learn new frameworks in the interview."
    ],
    "Wipro": [
        "Elite test requires good typing speed for the essay writing section. Review basic OOPs and array manipulation code.",
        "For Wipro Elite, focus on Java/Python string methods. Be willing to relocate and sign the service agreement.",
        "Revise basic data structures (Stacks, Queues, Linked Lists) and database normalization rules (1NF, 2NF, 3NF)."
    ],
    "Infosys": [
        "Infosys InfyTQ is coding-heavy, so practice data structures thoroughly. Revise DBMS schemas and database indexes.",
        "Focus on logical puzzles and matrix/string algorithms. Explain your project with block diagrams.",
        "Be strong in Operating System concepts (paging, virtual memory) and explain your coding logic clearly during the interview."
    ],
    "Capgemini": [
        "Game-based aptitude tests are unique; watch tutorial videos on YouTube before attempting. Practice basic pseudo-codes.",
        "Be ready with abstract class vs interface code. Capgemini HR focuses heavily on communication and flexibility.",
        "Practice quantitative and reasoning MCQs. During the interview, show good soft skills and explain project challenges."
    ]
}

DIFFICULTIES = ["Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"]
VERDICTS = ["Selected", "Selected", "Selected", "Rejected"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
YEARS = ["2025", "2026"]

def generate_experience(idx):
    company = random.choice(COMPANIES)
    role = random.choice(ROLES[company])
    candidate = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    date = f"{random.choice(MONTHS)} {random.choice(YEARS)}"
    verdict = random.choice(VERDICTS)
    difficulty = random.choice(DIFFICULTIES)
    
    rounds = [
        {
            "name": f"Round 1: Online Assessment / Aptitude Test",
            "summary": random.choice(APTITUDE_SUMMARIES[company])
        },
        {
            "name": f"Round 2: Technical Interview (TR)",
            "summary": random.choice(TECH_SUMMARIES[company])
        },
        {
            "name": f"Round 3: HR & Managerial Interview (MR/HR)",
            "summary": random.choice(HR_SUMMARIES[company])
        }
    ]
    
    tips = random.choice(TIPS[company])
    
    return {
        "id": f"exp-{idx}",
        "candidate": candidate,
        "role": role,
        "company": company,
        "date": date,
        "verdict": verdict,
        "difficulty": difficulty,
        "rounds": rounds,
        "tips": tips
    }

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
    
    print("Generating 100 interview experiences...")
    
    # We generate exp-4 to exp-103
    experiences = []
    for i in range(4, 104):
        exp = generate_experience(i)
        experiences.append(exp)
        
    print(f"Bulk uploading 100 experiences (exp-4 to exp-103) to Firestore...")
    batch = db.batch()
    for exp in experiences:
        doc_ref = db.collection("experiences").document(exp["id"])
        batch.set(doc_ref, exp)
        
    batch.commit()
    print("Firestore upload completed successfully!")
    
    # Also append to local data.json so offline backup works
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
    if os.path.exists(data_path):
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        local_exps = data.get("experiences", [])
        # Remove any existing generated ones in the range exp-4 to exp-103 to avoid duplicates if rerun
        local_exps = [e for e in local_exps if not (e.get("id", "").startswith("exp-") and e.get("id", "").split("-")[-1].isdigit() and 4 <= int(e.get("id", "").split("-")[-1]) <= 103)]
        
        # Append new ones
        local_exps.extend(experiences)
        
        # Sort local experiences descending by id number
        def get_exp_num(e):
            try:
                return int(e.get("id", "").split("-")[-1])
            except Exception:
                return 0
        local_exps.sort(key=get_exp_num, reverse=True)
        
        data["experiences"] = local_exps
        
        with open(data_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Local data.json backup updated successfully!")

if __name__ == "__main__":
    main()
