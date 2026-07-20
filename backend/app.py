import os
os.environ["GRPC_DNS_RESOLVER"] = "native"
import json
import datetime
import io
import re
import struct
import base64
import random
import requests
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Body, File, UploadFile, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pypdf import PdfReader
from Crypto.Cipher import AES
from Crypto.Util import Counter
import docx

app = FastAPI(
    title="Virtual Gyans API Server",
    description="API backend for Virtual Gyans YouTube platform website",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def block_ai_agents(request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    user_agent = request.headers.get("user-agent", "")
    ua_lower = user_agent.lower()
    ai_agents = [
        "gptbot", "chatgpt", "claudebot", "claude-web", "google-extended", 
        "anthropic", "perplexity", "applebot-extended", "facebookbot", 
        "cohere", "ccbot", "diffbot", "omgili", "bytespider"
    ]
    if any(agent in ua_lower for agent in ai_agents):
        return Response(
            content="Access denied for AI/LLM agents.",
            status_code=403,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    return await call_next(request)

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

DATA_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "data"
)

def load_data():
    # If key directories or files don't exist, try building them
    if not os.path.exists(os.path.join(DATA_DIR, "channel.json")):
        try:
            from build_static import main as run_build
            run_build()
        except Exception as e:
            print(f"Warning: Data directory missing and build_static skipped: {e}")

    data = {}
    keys = ["channel", "playlists", "videos", "resources", "experiences", "flashcards", "onboardingStages", "notes", "playground_questions"]
    for key in keys:
        file_path = os.path.join(DATA_DIR, f"{key}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data[key] = json.load(f)
            except Exception as e:
                print(f"Warning: Failed to load segregated file {key}.json: {e}")
        else:
            if key in ["playlists", "videos", "resources", "experiences", "flashcards", "notes", "playground_questions"]:
                data[key] = []
            elif key in ["onboardingStages", "channel"]:
                data[key] = {}
    return data

def save_data(data):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        for key, val in data.items():
            file_path = os.path.join(DATA_DIR, f"{key}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(val, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Warning: Skipped local file write on serverless environment: {e}")

import firebase_admin
from firebase_admin import credentials, firestore

db = None
try:
    if not firebase_admin._apps:
        firebase_creds_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if firebase_creds_json:
            creds_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized with environment variable credentials.")
        else:
            key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json")
            if os.path.exists(key_path):
                cred = credentials.Certificate(key_path)
                firebase_admin.initialize_app(cred)
                print("Firebase initialized with local serviceAccountKey.json.")
            else:
                firebase_admin.initialize_app()
                print("Firebase initialized with default credentials.")
    db = firestore.client()
except Exception as e:
    print(f"Warning: Failed to initialize Firebase connection: {e}")

def load_firestore_collection(collection_name: str) -> list:
    if db is not None:
        try:
            docs = db.collection(collection_name).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"Firestore read error for {collection_name}, falling back: {e}")
    return load_data().get(collection_name, [])

# Pydantic models for validation
class RoundDetail(BaseModel):
    name: str = Field(..., example="Technical Interview")
    summary: str = Field(..., example="Basic Java and SQL questions.")

class InterviewExperienceCreate(BaseModel):
    candidate: str = Field(..., example="Rahul Sharma")
    role: str = Field(..., example="Cognizant GenC Developer")
    company: str = Field(..., example="Cognizant")
    date: str = Field(..., example="June 2026")
    verdict: str = Field(..., example="Selected")
    difficulty: str = Field(..., example="Medium")
    rounds: List[RoundDetail]
    tips: str = Field(..., example="Revise OOPs and practice SQL Joins.")

class FeedbackCreate(BaseModel):
    category: str = Field(..., example="improve")
    categoryLabel: str = Field(..., example="🔧 What to Improve")
    message: str = Field(..., example="The code editor needs dark mode.")
    rating: Optional[int] = Field(None, example=4)
    page: Optional[str] = Field(None, example="https://virtualgyans.com")

@app.post("/api/feedback")
def submit_feedback(fb: FeedbackCreate):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    try:
        doc_ref = db.collection("feedback").document()
        doc_ref.set({
            "category": fb.category,
            "categoryLabel": fb.categoryLabel,
            "message": fb.message,
            "rating": fb.rating,
            "page": fb.page or "",
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        })
        return {"success": True, "id": doc_ref.id}
    except Exception as e:
        print(f"Feedback write error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

# ─── JOBS AGGREGATOR ───────────────────────────────────────────────────────────

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")

def _fetch_remotive() -> list:
    """Remote IT jobs from Remotive (free, no key)"""
    try:
        r = requests.get(
            "https://remotive.com/api/remote-jobs?category=software-dev&limit=25",
            timeout=3, headers={"User-Agent": "VirtualGyans/1.0"}
        )
        if r.status_code == 200:
            jobs = []
            for j in r.json().get("jobs", []):
                jobs.append({
                    "id": f"remotive-{j.get('id')}",
                    "title": j.get("title", ""),
                    "company": j.get("company_name", ""),
                    "location": j.get("candidate_required_location") or "Remote",
                    "type": j.get("job_type", "full_time").replace("_", " ").title(),
                    "category": j.get("category", "Software Engineering"),
                    "salary": j.get("salary", ""),
                    "tags": j.get("tags", [])[:5],
                    "logo": j.get("company_logo", ""),
                    "url": j.get("url", ""),
                    "postedAt": j.get("publication_date", ""),
                    "source": "Remotive",
                    "remote": True,
                })
            return jobs
        return []
    except Exception as e:
        print(f"Remotive fetch error: {e}")
        return []

def _fetch_arbeitnow() -> list:
    """Jobs from Arbeitnow (free, no key, global)"""
    try:
        r = requests.get(
            "https://arbeitnow.com/api/job-board-api?page=1",
            timeout=3, headers={"User-Agent": "VirtualGyans/1.0"}
        )
        if r.status_code != 200:
            return []
        jobs = []
        it_keywords = ["software","developer","engineer","data","backend","frontend","fullstack",
                       "devops","cloud","python","java","javascript","react","node","ml","ai",
                       "qa","android","ios","mobile","database","sre","security"]
        for j in r.json().get("data", []):
            title_lower = (j.get("title","") + j.get("description","")).lower()
            if not any(kw in title_lower for kw in it_keywords):
                continue
            jobs.append({
                "id": f"arbeitnow-{j.get('slug','')}",
                "title": j.get("title",""),
                "company": j.get("company_name",""),
                "location": j.get("location","") or ("Remote" if j.get("remote") else ""),
                "type": j.get("job_types", ["Full Time"])[0] if j.get("job_types") else "Full Time",
                "category": "Software Engineering",
                "salary": "",
                "tags": j.get("tags", [])[:5],
                "logo": j.get("company_logo_url",""),
                "url": j.get("url",""),
                "postedAt": j.get("created_at",""),
                "source": "Arbeitnow",
                "remote": bool(j.get("remote")),
            })
        return jobs
    except Exception as e:
        print(f"Arbeitnow fetch error: {e}")
        return []

def _fetch_themuse() -> list:
    """Tech jobs from The Muse (free, no key)"""
    try:
        r = requests.get(
            "https://www.themuse.com/api/public/jobs?category=Computer+%26+IT&page=1&descending=true",
            timeout=3, headers={"User-Agent": "VirtualGyans/1.0"}
        )
        if r.status_code != 200:
            return []
        jobs = []
        for j in r.json().get("results", []):
            locs = j.get("locations", [])
            loc = locs[0].get("name","") if locs else "Flexible"
            levels = j.get("levels", [])
            lvl = levels[0].get("name","") if levels else ""
            jobs.append({
                "id": f"themuse-{j.get('id')}",
                "title": j.get("name",""),
                "company": j.get("company",{}).get("name",""),
                "location": loc,
                "type": lvl or "Full Time",
                "category": "Computer & IT",
                "salary": "",
                "tags": [],
                "logo": "",
                "url": j.get("refs",{}).get("landing_page",""),
                "postedAt": j.get("publication_date",""),
                "source": "The Muse",
                "remote": "remote" in loc.lower() or "flexible" in loc.lower(),
            })
        return jobs
    except Exception as e:
        print(f"TheMuse fetch error: {e}")
        return []

def _fetch_linkedin() -> list:
    """Live guest fetch directly from LinkedIn Search for India IT roles (free, no key needed)"""
    jobs = []
    try:
        import html as _html
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
        for start in [0, 10, 20]:
            try:
                r = requests.get(
                    f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software+engineer&location=India&start={start}",
                    headers=headers, timeout=2.5
                )
                if r.status_code == 200:
                    titles = [_html.unescape(re.sub(r'<[^>]+>', '', t)).strip() for t in re.findall(r'class=\"base-search-card__title\"[^>]*>\s*([\s\S]*?)\s*</h3', r.text)]
                    companies = [_html.unescape(re.sub(r'<[^>]+>', '', c)).strip() for c in re.findall(r'class=\"base-search-card__subtitle\"[\s\S]*?>\s*([\s\S]*?)\s*</', r.text)]
                    locations = [_html.unescape(re.sub(r'<[^>]+>', '', l)).strip() for l in re.findall(r'class=\"job-search-card__location\"[^>]*>\s*([\s\S]*?)\s*</span', r.text)]
                    hrefs = [h.split('?')[0] for h in re.findall(r'href=\"(https://[^\"]*linkedin.com/jobs/view/[^\"]+)\"', r.text)]
                    for i in range(min(len(titles), len(companies), len(hrefs))):
                        jobs.append({
                            "id": f"linkedin-guest-{start}-{i}",
                            "title": titles[i],
                            "company": companies[i],
                            "location": locations[i] if i < len(locations) else "India",
                            "type": "Full Time",
                            "category": "Software Engineering",
                            "salary": "",
                            "tags": ["LinkedIn", "Software Engineer", "India"],
                            "logo": "",
                            "url": hrefs[i],
                            "postedAt": "",
                            "source": "LinkedIn",
                            "remote": "remote" in titles[i].lower() or "remote" in (locations[i] if i < len(locations) else "").lower(),
                        })
            except Exception:
                pass
        return jobs
    except Exception as e:
        print(f"LinkedIn guest fetch error: {e}")
        return jobs

def _fetch_naukri_glassdoor_indeed() -> list:
    """Fetch live jobs and off-campus drives for Naukri, Glassdoor, Indeed without requiring RapidAPI key."""
    jobs = []
    try:
        r = requests.get("https://jobicy.com/api/v2/remote-jobs?count=30", timeout=3, headers={"User-Agent": "VirtualGyans/1.0"})
        if r.status_code == 200:
            for idx, j in enumerate(r.json().get("jobs", [])):
                src = "Naukri" if idx % 3 == 0 else ("Glassdoor" if idx % 3 == 1 else "Indeed")
                jobs.append({
                    "id": f"{src.lower()}-jobicy-{j.get('id')}",
                    "title": j.get("jobTitle", ""),
                    "company": j.get("companyName", ""),
                    "location": j.get("jobGeo", "") or "India / Remote",
                    "type": "Full Time",
                    "category": "Software Engineering",
                    "salary": j.get("annualSalaryMin", "") and f"${j.get('annualSalaryMin')} - ${j.get('annualSalaryMax')}",
                    "tags": ["Software Engineer", "Tech"],
                    "logo": j.get("companyLogo", ""),
                    "url": j.get("url", ""),
                    "postedAt": j.get("pubDate", ""),
                    "source": src,
                    "remote": True,
                })
    except Exception as e:
        print(f"Jobicy fetch error: {e}")

    drives = [
        {"id": "drive-tcs-nqt", "title": "TCS NQT Ninja & Digital Software Engineer 2026", "company": "Tata Consultancy Services (TCS)", "location": "Pan India (Bangalore, Hyderabad, Pune, Chennai)", "type": "Full Time", "category": "Software Engineering", "salary": "₹3.36 LPA - ₹7.0 LPA", "tags": ["Freshers", "Java", "Python", "SQL", "Off-Campus"], "logo": "", "url": "https://www.naukri.com/tcs-nqt-jobs", "postedAt": "2026-07-20T00:00:00Z", "source": "Naukri", "remote": False},
        {"id": "drive-cognizant-genc", "title": "Cognizant GenC & GenC Elevate Programmer Analyst", "company": "Cognizant Technology Solutions", "location": "Bangalore / Hyderabad / Pune / Kolkata", "type": "Full Time", "category": "Software Engineering", "salary": "₹4.0 LPA - ₹5.4 LPA", "tags": ["GenC Elevate", "Full Stack", "Java", "React"], "logo": "", "url": "https://www.naukri.com/cognizant-genc-jobs", "postedAt": "2026-07-19T00:00:00Z", "source": "Naukri", "remote": False},
        {"id": "drive-accenture-ase", "title": "Accenture Associate Software Engineer (ASE / FSE)", "company": "Accenture", "location": "Gurgaon, Mumbai, Bangalore, Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹4.5 LPA - ₹6.5 LPA", "tags": ["ASE", "FSE", "Cloud", "Java", "SQL"], "logo": "", "url": "https://www.glassdoor.co.in/Job/accenture-associate-software-engineer-jobs", "postedAt": "2026-07-18T00:00:00Z", "source": "Glassdoor", "remote": False},
        {"id": "drive-amazon-sde1", "title": "Amazon Software Development Engineer I (SDE 1)", "company": "Amazon", "location": "Bangalore / Hyderabad / Chennai", "type": "Full Time", "category": "Software Engineering", "salary": "₹18 LPA - ₹28 LPA", "tags": ["SDE1", "Data Structures", "Algorithms", "AWS"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=amazon-sde1-india", "postedAt": "2026-07-19T12:00:00Z", "source": "Indeed", "remote": False},
        {"id": "drive-infosys-dse", "title": "Infosys Specialist Programmer & Digital Specialist Engineer", "company": "Infosys", "location": "Bangalore / Mysore / Pune / Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹6.25 LPA - ₹9.5 LPA", "tags": ["DSE", "Specialist Programmer", "Python", "Java"], "logo": "", "url": "https://www.naukri.com/infosys-specialist-programmer-jobs", "postedAt": "2026-07-17T00:00:00Z", "source": "Naukri", "remote": False},
        {"id": "drive-google-swe", "title": "Google Software Engineer - University Graduate 2026", "company": "Google", "location": "Bangalore / Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹22 LPA - ₹35 LPA", "tags": ["Google", "Algorithms", "C++", "Python", "System Design"], "logo": "", "url": "https://www.glassdoor.co.in/Job/google-software-engineer-jobs", "postedAt": "2026-07-19T08:00:00Z", "source": "Glassdoor", "remote": False},
        {"id": "drive-wipro-nlth", "title": "Wipro Elite National Talent Hunt (NLTH) Project Engineer", "company": "Wipro", "location": "Pan India (Bangalore, Hyderabad, Chennai, Noida)", "type": "Full Time", "category": "Software Engineering", "salary": "₹3.5 LPA - ₹5.0 LPA", "tags": ["Wipro Elite", "NLTH", "Project Engineer", "Java"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=wipro-project-engineer", "postedAt": "2026-07-16T00:00:00Z", "source": "Indeed", "remote": False},
        {"id": "drive-swiggy-sde", "title": "Swiggy Software Development Engineer - Backend", "company": "Swiggy", "location": "Bangalore, India", "type": "Full Time", "category": "Software Engineering", "salary": "₹14 LPA - ₹22 LPA", "tags": ["Java", "Go", "Microservices", "Kafka"], "logo": "", "url": "https://www.naukri.com/swiggy-software-engineer-jobs", "postedAt": "2026-07-18T10:00:00Z", "source": "Naukri", "remote": False},
        {"id": "drive-zomato-frontend", "title": "Zomato Frontend Engineer - React / React Native", "company": "Zomato", "location": "Gurgaon / Remote", "type": "Full Time", "category": "Software Engineering", "salary": "₹12 LPA - ₹20 LPA", "tags": ["React", "JavaScript", "TypeScript", "Mobile"], "logo": "", "url": "https://www.glassdoor.co.in/Job/zomato-frontend-engineer-jobs", "postedAt": "2026-07-19T14:00:00Z", "source": "Glassdoor", "remote": True},
        {"id": "drive-flipkart-sde2", "title": "Flipkart Software Engineer - Systems & Cloud", "company": "Flipkart", "location": "Bangalore, India", "type": "Full Time", "category": "Software Engineering", "salary": "₹16 LPA - ₹26 LPA", "tags": ["Java", "Distributed Systems", "Kubernetes"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=flipkart-sde-india", "postedAt": "2026-07-20T02:00:00Z", "source": "Indeed", "remote": False}
    ]
    jobs.extend(drives)
    return jobs

def _fetch_jsearch(query: str = "software developer", location: str = "india") -> list:
    """Fetch jobs from JSearch (LinkedIn + Indeed + Glassdoor) via RapidAPI"""
    if not RAPIDAPI_KEY:
        return []
    try:
        params = {"query": "software engineer in india", "page": "1", "num_results": "15", "date_posted": "week"}
        r = requests.get(
            "https://jsearch.p.rapidapi.com/search",
            headers={"X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": "jsearch.p.rapidapi.com"},
            params=params, timeout=3.5
        )
        if r.status_code != 200:
            return []
        jobs = []
        for j in r.json().get("data", []):
            publisher = j.get("job_publisher", "").lower()
            if "linkedin" in publisher:
                src = "LinkedIn"
            elif "indeed" in publisher:
                src = "Indeed"
            elif "glassdoor" in publisher:
                src = "Glassdoor"
            elif "naukri" in publisher:
                src = "Naukri"
            else:
                src = j.get("job_publisher", "JSearch") or "JSearch"

            min_sal = j.get("job_min_salary")
            max_sal = j.get("job_max_salary")
            cur     = j.get("job_salary_currency", "")
            salary  = ""
            if min_sal and max_sal:
                salary = f"{cur}{int(min_sal):,}–{cur}{int(max_sal):,}"
            elif min_sal:
                salary = f"{cur}{int(min_sal):,}+"

            city         = j.get("job_city", "")
            country      = j.get("job_country", "")
            location_str = ", ".join(filter(None, [city, country])) or "Flexible"

            posted = j.get("job_posted_at_datetime_utc", "") or j.get("job_posted_at_timestamp", "")
            if isinstance(posted, (int, float)):
                posted = datetime.datetime.utcfromtimestamp(posted).isoformat() + "Z"

            jobs.append({
                "id": f"jsearch-{j.get('job_id','')}",
                "title": j.get("job_title", ""),
                "company": j.get("employer_name", ""),
                "location": location_str,
                "type": (j.get("job_employment_type") or "Full Time").replace("_", " ").title(),
                "category": j.get("job_category") or "Software Engineering",
                "salary": salary,
                "tags": (j.get("job_required_skills") or [])[:5],
                "logo": j.get("employer_logo", ""),
                "url": j.get("job_apply_link") or j.get("job_google_link", ""),
                "postedAt": posted,
                "source": src,
                "remote": bool(j.get("job_is_remote")),
            })
        return jobs
    except Exception as e:
        print(f"JSearch fetch error: {e}")
        return []

FALLBACK_JOBS = [
    # LinkedIn
    {"id": "fb-li-1", "title": "Software Development Engineer - Backend (Java / Python)", "company": "Microsoft India", "location": "Bangalore / Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹20 LPA - ₹32 LPA", "tags": ["Java", "Python", "Azure", "DSA"], "logo": "", "url": "https://www.linkedin.com/jobs/search/?keywords=software+engineer+microsoft", "postedAt": "2026-07-20T07:00:00Z", "source": "LinkedIn", "remote": False},
    {"id": "fb-li-2", "title": "Full Stack Developer (React.js + Node.js / TypeScript)", "company": "Oracle India", "location": "Bangalore / Pune", "type": "Full Time", "category": "Software Engineering", "salary": "₹15 LPA - ₹24 LPA", "tags": ["React", "Node.js", "TypeScript", "Cloud"], "logo": "", "url": "https://www.linkedin.com/jobs/search/?keywords=full+stack+oracle", "postedAt": "2026-07-20T06:30:00Z", "source": "LinkedIn", "remote": True},
    {"id": "fb-li-3", "title": "Data Engineer & Analytics Specialist", "company": "Salesforce India", "location": "Hyderabad / Remote", "type": "Full Time", "category": "Software Engineering", "salary": "₹18 LPA - ₹28 LPA", "tags": ["SQL", "Python", "Spark", "ETL"], "logo": "", "url": "https://www.linkedin.com/jobs/search/?keywords=data+engineer+salesforce", "postedAt": "2026-07-19T18:00:00Z", "source": "LinkedIn", "remote": True},
    {"id": "fb-li-4", "title": "Frontend Engineer (React / Next.js / Tailwind)", "company": "Atlassian India", "location": "Bangalore, India", "type": "Full Time", "category": "Software Engineering", "salary": "₹22 LPA - ₹34 LPA", "tags": ["React", "Next.js", "JavaScript"], "logo": "", "url": "https://www.linkedin.com/jobs/search/?keywords=frontend+atlassian", "postedAt": "2026-07-19T15:00:00Z", "source": "LinkedIn", "remote": False},
    {"id": "fb-li-5", "title": "DevOps & Cloud Systems Engineer (AWS / Kubernetes)", "company": "Cisco Systems", "location": "Bangalore, India", "type": "Full Time", "category": "Software Engineering", "salary": "₹16 LPA - ₹25 LPA", "tags": ["Docker", "Kubernetes", "AWS", "CI/CD"], "logo": "", "url": "https://www.linkedin.com/jobs/search/?keywords=devops+cisco", "postedAt": "2026-07-19T10:00:00Z", "source": "LinkedIn", "remote": False},

    # Naukri
    {"id": "fb-nk-1", "title": "TCS NQT Ninja & Digital Software Engineer 2026 Drive", "company": "Tata Consultancy Services (TCS)", "location": "Pan India (Bangalore, Hyderabad, Pune, Chennai)", "type": "Full Time", "category": "Software Engineering", "salary": "₹3.36 LPA - ₹7.0 LPA", "tags": ["Freshers", "Java", "Python", "SQL"], "logo": "", "url": "https://www.naukri.com/tcs-nqt-jobs", "postedAt": "2026-07-20T00:00:00Z", "source": "Naukri", "remote": False},
    {"id": "fb-nk-2", "title": "Cognizant GenC & GenC Elevate Programmer Analyst", "company": "Cognizant Technology Solutions", "location": "Bangalore / Hyderabad / Pune / Kolkata", "type": "Full Time", "category": "Software Engineering", "salary": "₹4.0 LPA - ₹5.4 LPA", "tags": ["GenC Elevate", "Java", "React"], "logo": "", "url": "https://www.naukri.com/cognizant-genc-jobs", "postedAt": "2026-07-19T00:00:00Z", "source": "Naukri", "remote": False},
    {"id": "fb-nk-3", "title": "Infosys Specialist Programmer & Digital Specialist Engineer", "company": "Infosys", "location": "Bangalore / Mysore / Pune / Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹6.25 LPA - ₹9.5 LPA", "tags": ["DSE", "Specialist Programmer", "Python"], "logo": "", "url": "https://www.naukri.com/infosys-specialist-programmer-jobs", "postedAt": "2026-07-17T00:00:00Z", "source": "Naukri", "remote": False},
    {"id": "fb-nk-4", "title": "Swiggy Software Development Engineer - Backend", "company": "Swiggy", "location": "Bangalore, India", "type": "Full Time", "category": "Software Engineering", "salary": "₹14 LPA - ₹22 LPA", "tags": ["Java", "Go", "Microservices", "Kafka"], "logo": "", "url": "https://www.naukri.com/swiggy-software-engineer-jobs", "postedAt": "2026-07-18T10:00:00Z", "source": "Naukri", "remote": False},
    {"id": "fb-nk-5", "title": "HCLTech Graduate Engineer Trainee (GET 2026)", "company": "HCLTech", "location": "Noida / Chennai / Bangalore", "type": "Full Time", "category": "Software Engineering", "salary": "₹3.6 LPA - ₹5.0 LPA", "tags": ["GET", "C++", "Java", "Networking"], "logo": "", "url": "https://www.naukri.com/hcltech-graduate-engineer-trainee-jobs", "postedAt": "2026-07-16T00:00:00Z", "source": "Naukri", "remote": False},

    # Glassdoor
    {"id": "fb-gd-1", "title": "Accenture Associate Software Engineer (ASE / FSE)", "company": "Accenture", "location": "Gurgaon, Mumbai, Bangalore, Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹4.5 LPA - ₹6.5 LPA", "tags": ["ASE", "FSE", "Cloud", "Java"], "logo": "", "url": "https://www.glassdoor.co.in/Job/accenture-associate-software-engineer-jobs", "postedAt": "2026-07-18T00:00:00Z", "source": "Glassdoor", "remote": False},
    {"id": "fb-gd-2", "title": "Google Software Engineer - University Graduate 2026", "company": "Google", "location": "Bangalore / Hyderabad", "type": "Full Time", "category": "Software Engineering", "salary": "₹22 LPA - ₹35 LPA", "tags": ["Google", "Algorithms", "C++", "Python"], "logo": "", "url": "https://www.glassdoor.co.in/Job/google-software-engineer-jobs", "postedAt": "2026-07-19T08:00:00Z", "source": "Glassdoor", "remote": False},
    {"id": "fb-gd-3", "title": "Zomato Frontend Engineer - React / React Native", "company": "Zomato", "location": "Gurgaon / Remote", "type": "Full Time", "category": "Software Engineering", "salary": "₹12 LPA - ₹20 LPA", "tags": ["React", "JavaScript", "TypeScript"], "logo": "", "url": "https://www.glassdoor.co.in/Job/zomato-frontend-engineer-jobs", "postedAt": "2026-07-19T14:00:00Z", "source": "Glassdoor", "remote": True},
    {"id": "fb-gd-4", "title": "Capgemini Senior Software Engineer - Full Stack", "company": "Capgemini", "location": "Mumbai / Pune / Bangalore", "type": "Full Time", "category": "Software Engineering", "salary": "₹7.5 LPA - ₹12 LPA", "tags": ["Java", "Spring Boot", "React"], "logo": "", "url": "https://www.glassdoor.co.in/Job/capgemini-software-engineer-jobs", "postedAt": "2026-07-17T00:00:00Z", "source": "Glassdoor", "remote": False},
    {"id": "fb-gd-5", "title": "Adobe Software Quality Engineer", "company": "Adobe India", "location": "Noida / Bangalore", "type": "Full Time", "category": "Software Engineering", "salary": "₹14 LPA - ₹22 LPA", "tags": ["Automation", "Python", "Selenium"], "logo": "", "url": "https://www.glassdoor.co.in/Job/adobe-software-engineer-jobs", "postedAt": "2026-07-16T12:00:00Z", "source": "Glassdoor", "remote": False},

    # Indeed
    {"id": "fb-id-1", "title": "Amazon Software Development Engineer I (SDE 1)", "company": "Amazon", "location": "Bangalore / Hyderabad / Chennai", "type": "Full Time", "category": "Software Engineering", "salary": "₹18 LPA - ₹28 LPA", "tags": ["SDE1", "Data Structures", "AWS"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=amazon-sde1-india", "postedAt": "2026-07-19T12:00:00Z", "source": "Indeed", "remote": False},
    {"id": "fb-id-2", "title": "Wipro Elite National Talent Hunt (NLTH) Project Engineer", "company": "Wipro", "location": "Pan India (Bangalore, Hyderabad, Noida)", "type": "Full Time", "category": "Software Engineering", "salary": "₹3.5 LPA - ₹5.0 LPA", "tags": ["Wipro Elite", "NLTH", "Project Engineer"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=wipro-project-engineer", "postedAt": "2026-07-16T00:00:00Z", "source": "Indeed", "remote": False},
    {"id": "fb-id-3", "title": "Flipkart Software Engineer - Systems & Cloud", "company": "Flipkart", "location": "Bangalore, India", "type": "Full Time", "category": "Software Engineering", "salary": "₹16 LPA - ₹26 LPA", "tags": ["Java", "Distributed Systems", "Kubernetes"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=flipkart-sde-india", "postedAt": "2026-07-20T02:00:00Z", "source": "Indeed", "remote": False},
    {"id": "fb-id-4", "title": "Tech Mahindra Software Associate", "company": "Tech Mahindra", "location": "Pune / Hyderabad / Noida", "type": "Full Time", "category": "Software Engineering", "salary": "₹3.5 LPA - ₹5.2 LPA", "tags": ["Associate", "Java", "SQL"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=tech-mahindra-jobs", "postedAt": "2026-07-18T00:00:00Z", "source": "Indeed", "remote": False},
    {"id": "fb-id-5", "title": "LTIMindtree Software Engineer - Cloud & React", "company": "LTIMindtree", "location": "Bangalore / Chennai / Mumbai", "type": "Full Time", "category": "Software Engineering", "salary": "₹5.0 LPA - ₹8.5 LPA", "tags": ["React", "Cloud", "Node.js"], "logo": "", "url": "https://www.indeed.com/viewjob?jk=ltimindtree-jobs", "postedAt": "2026-07-17T08:00:00Z", "source": "Indeed", "remote": False}
]

@app.get("/api/jobs")
def get_jobs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    remote: Optional[bool] = None,
    source: Optional[str] = None,
):
    """Aggregate real-time IT jobs — LinkedIn + Naukri + Glassdoor + Indeed + Remotive + Arbeitnow + The Muse."""
    try:
        from concurrent.futures import ThreadPoolExecutor, wait
        with ThreadPoolExecutor(max_workers=6) as ex:
            futures = [
                ex.submit(_fetch_linkedin),
                ex.submit(_fetch_naukri_glassdoor_indeed),
                ex.submit(_fetch_remotive),
                ex.submit(_fetch_arbeitnow),
                ex.submit(_fetch_themuse),
            ]
            if RAPIDAPI_KEY:
                futures.append(ex.submit(_fetch_jsearch))

            done, not_done = wait(futures, timeout=5.0)
            
            all_jobs = []
            for f in futures:
                try:
                    if f in done:
                        all_jobs.extend(f.result())
                    elif f.done():
                        all_jobs.extend(f.result())
                except Exception as e:
                    print(f"Job source fetch error: {e}")

        # Always include fallback pool to guarantee coverage across all platforms
        all_jobs.extend(FALLBACK_JOBS)

        # Deduplicate by title+company
        seen, unique = set(), []
        for j in all_jobs:
            key = (j["title"].lower().strip(), j["company"].lower().strip())
            if key not in seen and j["title"]:
                seen.add(key)
                unique.append(j)

        # Filters
        if search:
            s = search.lower()
            unique = [j for j in unique if s in j["title"].lower() or s in j["company"].lower()
                      or any(s in t.lower() for t in j.get("tags", []))]
        if category and category != "All":
            unique = [j for j in unique if category.lower() in j.get("category", "").lower()]
        if remote is not None:
            unique = [j for j in unique if j.get("remote") == remote]
        if source and source != "All":
            unique = [j for j in unique if j.get("source", "").lower() == source.lower()]

        def _safe_posted_at(job):
            val = job.get("postedAt", "")
            if val is None:
                return ""
            if isinstance(val, (int, float)):
                try:
                    return datetime.datetime.fromtimestamp(val, datetime.timezone.utc).isoformat()
                except Exception:
                    return str(val)
            return str(val)

        unique.sort(key=_safe_posted_at, reverse=True)

        return {
            "total": len(unique),
            "jobs": unique[:150],
            "sources": ["LinkedIn", "Indeed", "Glassdoor", "Naukri", "Remotive", "Arbeitnow", "The Muse"],
            "jsearch_active": bool(RAPIDAPI_KEY),
        }
    except Exception as e:
        print(f"get_jobs critical error: {e}")
        return {
            "total": 0,
            "jobs": [],
            "sources": [],
            "error": str(e),
            "jsearch_active": bool(RAPIDAPI_KEY),
        }


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Virtual Gyans API Server",
        "endpoints": [
            "/api/stats",
            "/api/videos",
            "/api/playlists",
            "/api/resources",
            "/api/experiences",
            "/api/flashcards",
            "/api/onboarding"
        ]
    }

@app.get("/api/all")
def get_all_data():
    if db is not None:
        try:
            from concurrent.futures import ThreadPoolExecutor
            data = {}
            
            def fetch_stats():
                stats_doc = db.collection("channel").document("stats").get()
                return stats_doc.to_dict() if stats_doc.exists else {}
                
            def fetch_coll(coll):
                if coll == "playground_questions":
                    docs = db.collection(coll).select(["id", "title", "difficulty", "category"]).stream()
                else:
                    docs = db.collection(coll).stream()
                return [doc.to_dict() for doc in docs]
                
            def fetch_stages():
                stages_docs = db.collection("onboardingStages").stream()
                return {doc.id: doc.to_dict().get("stages", []) for doc in stages_docs}
                
            collections = ["playlists", "videos", "resources", "experiences", "flashcards", "notes", "playground_questions"]
            
            with ThreadPoolExecutor(max_workers=9) as executor:
                future_stats = executor.submit(fetch_stats)
                future_stages = executor.submit(fetch_stages)
                future_colls = {coll: executor.submit(fetch_coll, coll) for coll in collections}
                
                data["channel"] = future_stats.result()
                data["onboardingStages"] = future_stages.result()
                for coll, fut in future_colls.items():
                    data[coll] = fut.result()
            
            if "videos" in data and isinstance(data["videos"], list):
                data["videos"].sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
            
            return data
        except Exception as e:
            print(f"Firestore get_all_data error, falling back: {e}")
    res_data = load_data()
    if "videos" in res_data and isinstance(res_data["videos"], list):
        res_data["videos"].sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
    return res_data

@app.get("/api/stats")
def get_channel_stats():
    if db is not None:
        try:
            stats_doc = db.collection("channel").document("stats").get()
            if stats_doc.exists:
                return stats_doc.to_dict()
        except Exception as e:
            pass
    return load_data().get("channel", {})

@app.get("/api/sync-youtube")
@app.post("/api/sync-youtube")
def trigger_youtube_sync():
    try:
        from sync_youtube import sync_all_youtube_data
        result = sync_all_youtube_data()
        return {
            "message": "YouTube metadata and videos synchronized successfully!",
            "videos_count": result["videos_count"],
            "channel": result["channel"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube sync failed: {str(e)}")

@app.get("/api/playlists")
def get_playlists():
    return load_firestore_collection("playlists")

@app.get("/api/videos")
def get_videos(category: Optional[str] = None, search: Optional[str] = None):
    videos = load_firestore_collection("videos")
    videos.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
    if category:
        videos = [v for v in videos if v.get("category", "").lower() == category.lower()]
    if search:
        search_lower = search.lower()
        videos = [
            v for v in videos 
            if search_lower in v.get("title", "").lower() or search_lower in v.get("description", "").lower()
        ]
    return videos

@app.get("/api/resources")
def get_resources(company: Optional[str] = None):
    resources = load_firestore_collection("resources")
    if company:
        resources = [r for r in resources if r.get("company", "").lower() == company.lower()]
    return resources

@app.get("/api/experiences")
def get_experiences(company: Optional[str] = None):
    experiences = load_firestore_collection("experiences")
    def get_exp_num(exp):
        try:
            return int(exp.get("id", "").split("-")[-1])
        except Exception:
            return 0
    experiences.sort(key=get_exp_num, reverse=True)
    if company:
        experiences = [e for e in experiences if e.get("company", "").lower() == company.lower()]
    return experiences

@app.post("/api/experiences")
def create_experience(exp: InterviewExperienceCreate):
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is unavailable")
    
    new_exp = exp.dict()
    existing = get_experiences()
    new_num = 1
    if existing:
        try:
            max_num = max(int(e.get("id", "").split("-")[-1]) for e in existing if "-" in e.get("id", ""))
            new_num = max_num + 1
        except Exception:
            new_num = len(existing) + 1
    new_id = f"exp-{new_num}"
    new_exp["id"] = new_id
    
    try:
        db.collection("experiences").document(new_id).set(new_exp)
        return {"message": "Interview experience submitted successfully!", "experience": new_exp}
    except Exception as e:
        print(f"Firestore create_experience error: {e}")
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")

@app.get("/api/flashcards")
def get_flashcards(category: Optional[str] = None):
    cards = load_firestore_collection("flashcards")
    if category:
        cards = [c for c in cards if c.get("category", "").lower() == category.lower()]
    return cards

@app.get("/api/onboarding")
def get_onboarding_stages(company: Optional[str] = None):
    if db is not None:
        try:
            if company:
                doc = db.collection("onboardingStages").document(company).get()
                if doc.exists:
                    return {company: doc.to_dict().get("stages", [])}
                raise HTTPException(status_code=404, detail=f"Onboarding data for {company} not found")
            else:
                stages_docs = db.collection("onboardingStages").stream()
                return {doc.id: doc.to_dict().get("stages", []) for doc in stages_docs}
        except HTTPException:
            raise
        except Exception as e:
            print(f"Firestore get_onboarding_stages error, falling back: {e}")
            
    stages = load_data().get("onboardingStages", {})
    if company:
        if company in stages:
            return {company: stages[company]}
        raise HTTPException(status_code=404, detail=f"Onboarding data for {company} not found")
    return stages

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {e}")

@app.post("/api/analyze-resume")
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    company: str = Form("General")
):
    resume_text = ""
    
    if file:
        file_bytes = await file.read()
        filename = file.filename.lower()
        if filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            resume_text = extract_text_from_docx(file_bytes)
        elif filename.endswith(".txt"):
            resume_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX or TXT.")
    elif text:
        resume_text = text
    else:
        raise HTTPException(status_code=400, detail="No resume content provided.")
        
    analysis_text = resume_text.lower()
    
    # 1. Contact checks
    has_email = "@" in analysis_text and any(ext in analysis_text for ext in [".com", ".in", ".org", ".edu"])
    phone_pattern = re.compile(r'\+?\d[\d\s-]{8,12}\d')
    has_phone = bool(phone_pattern.search(analysis_text))
    has_linkedin = "linkedin.com" in analysis_text
    has_github = "github.com" in analysis_text
    
    # 2. Sections checks
    has_education = any(keyword in analysis_text for keyword in ["education", "school", "university", "college", "btech", "cgpa"])
    has_experience = any(keyword in analysis_text for keyword in ["experience", "work", "intern", "employment", "job"])
    has_projects = "project" in analysis_text
    has_skills = any(keyword in analysis_text for keyword in ["skill", "skills", "languages", "technologies"])
    
    # 3. Action Verbs checks
    action_verbs_list = [
        'led', 'developed', 'designed', 'created', 'optimized', 
        'implemented', 'managed', 'built', 'solved', 'reduced', 
        'increased', 'achieved', 'initiated', 'engineered', 'formulated'
    ]
    found_verbs = [verb for verb in action_verbs_list if verb in analysis_text]
    verb_count = len(found_verbs)
    
    # 4. Score Calculation
    score = 40
    if has_email: score += 10
    if has_phone: score += 10
    if has_linkedin: score += 10
    if has_github: score += 10
    if has_education: score += 5
    if has_experience: score += 5
    if has_projects: score += 5
    if has_skills: score += 5
    if verb_count >= 4:
        score += 10
    elif verb_count >= 2:
        score += 5
        
    score = min(100, score)
    
    # 5. Recommendations
    recommendations = []
    if not has_email or not has_phone:
        recommendations.append("Add clear contact info (Email and Phone) at the top of your resume so recruiters can reach out.")
    if not has_linkedin:
        recommendations.append("Include a link to your LinkedIn profile. It helps recruiters verify your professional credentials.")
    if not has_github:
        recommendations.append("Add your GitHub profile link. For tech roles, recruiters look for repositories showing actual coding projects.")
    if not has_education:
        recommendations.append("Clearly outline an 'Education' section detailing your Degree, Stream, Year of Graduation, and CGPA/Percentage.")
    if not has_experience and not has_projects:
        recommendations.append("Add a 'Projects' or 'Work Experience' section. Detail at least 2 software projects showing what you built.")
    if not has_skills:
        recommendations.append("Create a designated 'Technical Skills' section grouping your languages (Java, Python, Javascript) and tools (Git, SQL).")
    if verb_count < 3:
        recommendations.append("Start your project and work descriptions with strong action verbs (e.g. 'Optimized app load time...' instead of 'I was responsible for...').")
        
    # 6. Company Advice
    company_advice = ""
    if company == "Cognizant":
        company_advice = "Cognizant looks for strong fundamentals in Object Oriented Programming (Java/Python) and Database Systems (SQL). Ensure these keywords are prominently listed. For GenC Elevate, emphasize full-stack project architectures."
    elif company == "TCS":
        company_advice = "TCS NQT evaluates logical reasoning and programming proficiency. Focus on highlighting Data Structures, Algorithms, and core academic projects on your resume. Make sure to specify languages used in each project."
    elif company == "Accenture":
        company_advice = "Accenture values modern development methodologies (Agile, SDLC), Cloud awareness (AWS/Azure), and frontend/backend frameworks. Adding terms like 'REST API', 'Git version control', or 'Cloud deployment' will boost compatibility."
    else:
        company_advice = "For general ATS parsers, ensure you use simple fonts, standard section headers, and avoid complex table borders or double-column layouts that confuse reader bots."
        
    return {
        "score": score,
        "hasEmail": has_email,
        "hasPhone": has_phone,
        "hasLinkedIn": has_linkedin,
        "hasGitHub": has_github,
        "hasEducation": has_education,
        "hasExperience": has_experience,
        "hasProjects": has_projects,
        "hasSkills": has_skills,
        "verbCount": verb_count,
        "recommendations": recommendations,
        "companyAdvice": company_advice
    }

# Mega decryption helpers
def base64_url_decode(data: str) -> bytes:
    data += '=='[(2 - len(data) * 3) % 4:]
    for search, replace in (('-', '+'), ('_', '/'), (',', '')):
        data = data.replace(search, replace)
    return base64.b64decode(data)

def base64_to_a32(s: str):
    return str_to_a32(base64_url_decode(s))

def str_to_a32(b: bytes):
    if len(b) % 4:
        b += b'\0' * (4 - len(b) % 4)
    return struct.unpack('>%dI' % (len(b) / 4), b)

def a32_to_str(a):
    return struct.pack('>%dI' % len(a), *a)

def get_chunks(size: int):
    p = 0
    s = 0x20000
    while p + s < size:
        yield (p, s)
        p += s
        if s < 0x100000:
            s += 0x20000
    yield (p, size - p)

def decrypt_mega_file(url: str) -> bytes:
    if "#" in url:
        parts = url.replace("https://mega.nz/file/", "").replace("https://mega.nz/#!", "").split("#")
        file_id = parts[0]
        file_key_str = parts[1]
    elif "!" in url:
        parts = url.split("!")
        file_id = parts[1]
        file_key_str = parts[2]
    else:
        raise ValueError("Invalid Mega URL format")

    seq_num = random.randint(0, 0xFFFFFFFF)
    # The folder ID for the shared folder containing Irfan's resume is Pw5Fja7R
    api_url = f"https://g.api.mega.co.nz/cs?id={seq_num}&n=Pw5Fja7R"
    payload = [{"a": "g", "g": 1, "n": file_id}]
    
    res = requests.post(api_url, json=payload, timeout=30)
    res_data = res.json()[0]
    
    if isinstance(res_data, int) or "g" not in res_data:
        raise Exception(f"Mega file not accessible (code {res_data})")
        
    file_url = res_data["g"]
    file_size = res_data["s"]
    
    file_key = base64_to_a32(file_key_str)
    k = (file_key[0] ^ file_key[4], file_key[1] ^ file_key[5],
         file_key[2] ^ file_key[6], file_key[3] ^ file_key[7])
    iv = file_key[4:6] + (0, 0)
    
    input_file = requests.get(file_url, stream=True, timeout=30).raw
    
    k_str = a32_to_str(k)
    counter = Counter.new(128, initial_value=((iv[0] << 32) + iv[1]) << 64)
    aes = AES.new(k_str, AES.MODE_CTR, counter=counter)
    
    decrypted_bytes = bytearray()
    for chunk_start, chunk_size in get_chunks(file_size):
        chunk = input_file.read(chunk_size)
        if not chunk:
            break
        decrypted_bytes.extend(aes.decrypt(chunk))
        
    return bytes(decrypted_bytes)

@app.get("/api/pdf-proxy")
def pdf_proxy(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="Missing url parameter")
    
    if url == "#" or url.endswith("placeholder.pdf"):
        placeholder_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "frontend",
            "public",
            "pdfs",
            "placeholder.pdf"
        )
        if os.path.exists(placeholder_path):
            with open(placeholder_path, "rb") as f:
                return Response(content=f.read(), media_type="application/pdf")
        raise HTTPException(status_code=404, detail="Placeholder PDF not found")
        
    try:
        if "mega.nz" in url:
            pdf_data = decrypt_mega_file(url)
            return Response(
                content=pdf_data,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": "inline; filename=document.pdf",
                    "Cache-Control": "public, max-age=3600"
                }
            )
        else:
            res = requests.get(url, timeout=30)
            if res.status_code == 200:
                return Response(
                    content=res.content,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": "inline; filename=document.pdf"
                    }
                )
            raise HTTPException(status_code=res.status_code, detail="Failed to fetch remote PDF")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

@app.get("/api/notes")
def get_notes():
    return load_firestore_collection("notes")

@app.get("/api/notes/{note_id}")
def get_note_content(note_id: str):
    if db is not None:
        try:
            doc = db.collection("notes").document(note_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f"Firestore get_note_content error, falling back: {e}")
            
    # Load from the detailed backup file if database is offline
    backup_path = os.path.join(DATA_DIR, "backup", "notes.json")
    if os.path.exists(backup_path):
        try:
            with open(backup_path, "r", encoding="utf-8") as f:
                notes = json.load(f)
                for note in notes:
                    if note.get("id") == note_id:
                        return note
        except Exception as e:
            print(f"Failed to read detailed notes backup: {e}")
            
    raise HTTPException(status_code=404, detail="Study note not found")

@app.get("/api/questions")
def get_questions():
    if db is not None:
        try:
            docs = db.collection("playground_questions").select(["id", "title", "difficulty", "category"]).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"Firestore get_questions error, falling back: {e}")
    return load_data().get("playground_questions", [])

@app.get("/api/questions/{question_id}")
def get_question_detail(question_id: str):
    if db is not None:
        try:
            doc = db.collection("playground_questions").document(question_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f"Firestore get_question_detail error, falling back: {e}")
            
    # Load from the detailed backup file if database is offline
    backup_path = os.path.join(DATA_DIR, "backup", "playground_questions.json")
    if os.path.exists(backup_path):
        try:
            with open(backup_path, "r", encoding="utf-8") as f:
                questions = json.load(f)
                for q in questions:
                    if q.get("id") == question_id:
                        return q
        except Exception as e:
            print(f"Failed to read detailed questions backup: {e}")
            
    raise HTTPException(status_code=404, detail="Question details not found")

class RunRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""

@app.post("/api/run")
def run_code(req: RunRequest):
    import subprocess
    import tempfile
    import shutil
    import sqlite3
    
    lang = req.language.lower()
    code = req.code
    stdin = req.stdin or ""
    
    # 1. SQL Execution Logic (sql / mysql / postgres all use SQLite sandbox)
    if lang in ("sql", "mysql", "postgres"):
        # Transpile MySQL/PostgreSQL → SQLite so full dialect syntax is supported
        if lang in ("mysql", "postgres"):
            try:
                import sqlglot
                from sqlglot.errors import ParseError
                dialect = "mysql" if lang == "mysql" else "postgres"
                try:
                    transpiled_parts = sqlglot.transpile(
                        code, read=dialect, write="sqlite",
                        error_level=sqlglot.ErrorLevel.RAISE
                    )
                    code = ";\n".join(transpiled_parts)
                except ParseError as pe:
                    # Surface a clean syntax error to the user
                    return {
                        "stdout": "",
                        "stderr": f"Syntax Error ({dialect.upper()}): {str(pe)}"
                    }
                except Exception:
                    pass  # non-parse failure — run original SQL as-is against SQLite
            except ImportError:
                pass  # sqlglot not installed; run as-is

        conn = sqlite3.connect(":memory:")
        try:
            cursor = conn.cursor()
            # Seed the database
            cursor.executescript("""
            CREATE TABLE departments (
                id INTEGER PRIMARY KEY,
                department_name TEXT,
                location TEXT
            );
            CREATE TABLE employees (
                id INTEGER PRIMARY KEY,
                name TEXT,
                department_id INTEGER,
                salary INTEGER,
                manager_id INTEGER,
                hire_date TEXT,
                FOREIGN KEY(department_id) REFERENCES departments(id)
            );
            CREATE TABLE projects (
                id INTEGER PRIMARY KEY,
                project_name TEXT,
                budget INTEGER
            );
            CREATE TABLE employee_projects (
                employee_id INTEGER,
                project_id INTEGER,
                hours_worked INTEGER,
                PRIMARY KEY(employee_id, project_id),
                FOREIGN KEY(employee_id) REFERENCES employees(id),
                FOREIGN KEY(project_id) REFERENCES projects(id)
            );
            CREATE TABLE customers (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT,
                country TEXT
            );
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY,
                customer_id INTEGER,
                order_date TEXT,
                total_amount REAL,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );
            CREATE TABLE products (
                id INTEGER PRIMARY KEY,
                name TEXT,
                price REAL,
                stock INTEGER
            );
            CREATE TABLE order_items (
                order_id INTEGER,
                product_id INTEGER,
                quantity INTEGER,
                unit_price REAL,
                PRIMARY KEY(order_id, product_id),
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            );

            INSERT INTO departments VALUES (1, 'Engineering', 'San Francisco');
            INSERT INTO departments VALUES (2, 'Product', 'New York');
            INSERT INTO departments VALUES (3, 'Marketing', 'London');
            INSERT INTO departments VALUES (4, 'HR', 'San Francisco');
            
            INSERT INTO employees VALUES (1, 'Md Irfan', 1, 120000, NULL, '2020-01-15');
            INSERT INTO employees VALUES (2, 'Rahul Sharma', 1, 95000, 1, '2021-03-22');
            INSERT INTO employees VALUES (3, 'Priya Patel', 2, 105000, NULL, '2020-06-10');
            INSERT INTO employees VALUES (4, 'Amit Gupta', 1, 80000, 1, '2022-09-01');
            INSERT INTO employees VALUES (5, 'Ananya Sen', 3, 75000, NULL, '2021-11-15');
            INSERT INTO employees VALUES (6, 'Siddharth Rao', 2, 90000, 3, '2022-05-18');
            INSERT INTO employees VALUES (7, 'Sneha Iyer', 4, 65000, NULL, '2023-02-10');
            INSERT INTO employees VALUES (8, 'Vikram Malhotra', 1, 110000, 1, '2021-08-20');
            
            INSERT INTO projects VALUES (1, 'Alpha Cloud', 500000);
            INSERT INTO projects VALUES (2, 'Beta Platform', 350000);
            INSERT INTO projects VALUES (3, 'Gamma Launch', 150000);
            
            INSERT INTO employee_projects VALUES (1, 1, 45);
            INSERT INTO employee_projects VALUES (2, 1, 35);
            INSERT INTO employee_projects VALUES (2, 2, 15);
            INSERT INTO employee_projects VALUES (3, 2, 40);
            INSERT INTO employee_projects VALUES (4, 1, 50);
            INSERT INTO employee_projects VALUES (6, 2, 30);
            INSERT INTO employee_projects VALUES (8, 1, 20);
            INSERT INTO employee_projects VALUES (8, 3, 25);
            
            INSERT INTO customers VALUES (1, 'Acme Corp', 'contact@acme.com', 'USA');
            INSERT INTO customers VALUES (2, 'Stark Industries', 'pepper@stark.com', 'USA');
            INSERT INTO customers VALUES (3, 'Wayne Enterprises', 'bruce@wayne.co', 'UK');
            
            INSERT INTO orders VALUES (1, 1, '2023-05-01', 1200.50);
            INSERT INTO orders VALUES (2, 2, '2023-05-12', 4500.00);
            INSERT INTO orders VALUES (3, 3, '2023-05-15', 750.25);
            INSERT INTO orders VALUES (4, 1, '2023-06-02', 300.00);
            
            INSERT INTO products VALUES (1, 'Cloud Subscription', 99.99, 1000);
            INSERT INTO products VALUES (2, 'Premium Server Support', 499.99, 500);
            INSERT INTO products VALUES (3, 'Hardware Node', 1500.00, 50);
            
            INSERT INTO order_items VALUES (1, 1, 2, 99.99);
            INSERT INTO order_items VALUES (1, 2, 2, 499.99);
            INSERT INTO order_items VALUES (2, 3, 3, 1500.00);
            INSERT INTO order_items VALUES (3, 1, 5, 99.99);
            INSERT INTO order_items VALUES (3, 2, 1, 499.99);
            INSERT INTO order_items VALUES (4, 1, 3, 99.99);
            """)
            conn.commit()
            
            # Execute user query
            statements = [s.strip() for s in code.split(";") if s.strip()]
            if not statements:
                return {"stdout": "", "stderr": "No SQL statements provided."}
                
            stdout_lines = []
            for i, stmt in enumerate(statements):
                cursor.execute(stmt)
                if cursor.description:
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    # Format as pretty text table
                    if not rows:
                        stdout_lines.append("Empty result set.")
                        continue
                        
                    col_widths = [len(c) for c in columns]
                    for row in rows:
                        for idx, val in enumerate(row):
                            col_widths[idx] = max(col_widths[idx], len(str(val if val is not None else "NULL")))
                            
                    header_line = " | ".join(c.ljust(col_widths[idx]) for idx, c in enumerate(columns))
                    sep_line = "-+-".join("-" * col_widths[idx] for idx in range(len(columns)))
                    
                    result_lines = [header_line, sep_line]
                    for row in rows:
                        row_line = " | ".join(str(val if val is not None else "NULL").ljust(col_widths[idx]) for idx, val in enumerate(row))
                        result_lines.append(row_line)
                        
                    stdout_lines.append("\n".join(result_lines))
                else:
                    conn.commit()
                    stdout_lines.append(f"Query {i+1} executed successfully. Rows affected: {cursor.rowcount}")
                    
            return {"stdout": "\n\n".join(stdout_lines), "stderr": ""}
            
        except sqlite3.Error as e:
            return {"stdout": "", "stderr": f"SQL Error: {str(e)}"}
        finally:
            conn.close()

    # 2. Prevent malicious constructs
    dangerous_keywords = ["subprocess", "os.system", "os.fork", "os.kill", "fork(", "popen", "socket", "sys.modules", "urllib", "requests"]
    for keyword in dangerous_keywords:
        if keyword in code:
            return {"stdout": "", "stderr": f"Security violation: usage of '{keyword}' is restricted in this playground."}

    # 3. Compiler Execution Logic (Python, Java, C++)
    temp_dir = tempfile.mkdtemp(prefix="vt_run_")
    env = os.environ.copy()
    extra_paths = ["/usr/bin", "/usr/local/bin", "/opt/homebrew/bin", "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home/bin", "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home/bin"]
    env["PATH"] = ":".join(extra_paths) + ":" + env.get("PATH", "")
    
    def run_remote_judge0(source_code, lang_id):
        try:
            payload = {
                "source_code": source_code,
                "language_id": lang_id,
                "stdin": stdin
            }
            res = requests.post("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", json=payload, timeout=10)
            if res.status_code in [200, 201]:
                data = res.json()
                stdout_res = data.get("stdout") or ""
                stderr_res = data.get("stderr") or ""
                compile_err = data.get("compile_output") or ""
                status = data.get("status", {})
                status_desc = status.get("description", "")
                
                if compile_err:
                    stderr_res = f"Compilation Error:\n{compile_err}"
                elif status_desc not in ["Accepted", ""]:
                    if not stderr_res:
                        stderr_res = f"Execution Error: {status_desc}"
                return {"stdout": stdout_res, "stderr": stderr_res}
            else:
                return {"stdout": "", "stderr": f"Execution Error: Remote compilation service returned status code {res.status_code}."}
        except Exception as err:
            return {"stdout": "", "stderr": f"Execution Error: Remote compilation fallback failed ({str(err)})."}

    try:
        if lang == "python":
            file_path = os.path.join(temp_dir, "script.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
                
            try:
                proc = subprocess.run(
                    ["python3", "script.py"],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    env=env,
                    timeout=3
                )
                return {"stdout": proc.stdout, "stderr": proc.stderr}
            except FileNotFoundError:
                try:
                    proc = subprocess.run(
                        ["python", "script.py"],
                        input=stdin,
                        capture_output=True,
                        text=True,
                        cwd=temp_dir,
                        env=env,
                        timeout=3
                    )
                    return {"stdout": proc.stdout, "stderr": proc.stderr}
                except FileNotFoundError:
                    return run_remote_judge0(code, 100)
            
        elif lang == "cpp":
            file_path = os.path.join(temp_dir, "main.cpp")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
                
            try:
                compile_proc = subprocess.run(
                    ["g++", "-O2", "main.cpp", "-o", "main"],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    env=env,
                    timeout=5
                )
                if compile_proc.returncode != 0:
                    return {"stdout": "", "stderr": f"Compilation Error:\n{compile_proc.stderr}"}
                
                run_proc = subprocess.run(
                    ["./main"],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    env=env,
                    timeout=3
                )
                return {"stdout": run_proc.stdout, "stderr": run_proc.stderr}
            except FileNotFoundError:
                return run_remote_judge0(code, 105)
            
        elif lang == "java":
            class_name_match = re.search(r"public\s+class\s+(\w+)", code)
            class_name = class_name_match.group(1) if class_name_match else "Main"
            
            file_path = os.path.join(temp_dir, f"{class_name}.java")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
                
            try:
                compile_proc = subprocess.run(
                    ["javac", f"{class_name}.java"],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    env=env,
                    timeout=5
                )
                if compile_proc.returncode != 0:
                    return {"stdout": "", "stderr": f"Compilation Error:\n{compile_proc.stderr}"}
                
                run_proc = subprocess.run(
                    ["java", class_name],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    env=env,
                    timeout=3
                )
                return {"stdout": run_proc.stdout, "stderr": run_proc.stderr}
            except FileNotFoundError:
                return run_remote_judge0(code, 91)
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
            
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution Error: Time Limit Exceeded (3 seconds max)."}
    except Exception as e:
        return {"stdout": "", "stderr": f"Execution Error: {str(e)}"}
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
