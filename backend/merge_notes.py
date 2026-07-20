import json
import os

# Load live notes
with open('/Users/macbook/Documents/June/VGyans/scratch_notes.json', 'r', encoding='utf-8') as f:
    notes = json.load(f)

# Define new notes
new_notes = [
    {
        "id": "react-study-notes",
        "downloadUrl": "/notes/react-study-notes",
        "company": "All",
        "title": "React & Modern Frontend Development Guide",
        "tags": ["React", "JavaScript", "Frontend", "Hooks"],
        "description": "Essential guide to React hooks (useState, useEffect, useMemo), virtual DOM, state management, and lifecycle methods.",
        "category": "Technical",
        "content": [
            {"text": "1. Virtual DOM & Reconciliation", "type": "h1"},
            {"text": "React uses a virtual representation of the real DOM. When state changes, a new Virtual DOM tree is created and compared (diffed) with the old one. React then updates only the changed parts of the real DOM in a process called reconciliation.", "type": "body"},
            {"text": "2. React Hooks Reference", "type": "h1"},
            {"text": "Hooks allow functional components to use state and lifecycle features:<br/>- <b>useState:</b> Local state management.<br/>- <b>useEffect:</b> Side effects (data fetching, subscriptions).<br/>- <b>useMemo:</b> Memoize expensive calculations.<br/>- <b>useCallback:</b> Memoize callback functions to avoid re-renders.", "type": "body"},
            {"text": "3. Component Example", "type": "h1"},
            {"text": "import React, { useState, useEffect } from 'react';\n\nexport default function UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    fetch(`/api/users/${userId}`)\n      .then(res => res.json())\n      .then(data => setUser(data));\n  }, [userId]);\n\n  if (!user) return <div>Loading...</div>;\n  return <div>Hello, {user.name}</div>;\n}", "type": "code"}
        ]
    },
    {
        "id": "angular-study-notes",
        "downloadUrl": "/notes/angular-study-notes",
        "company": "All",
        "title": "Angular Architecture & Framework Guide",
        "tags": ["Angular", "TypeScript", "Frontend", "RxJS"],
        "description": "Revision notes on Angular modules, components, services, dependency injection, RxJS observables, and routing.",
        "category": "Technical",
        "content": [
            {"text": "1. Component & Module Architecture", "type": "h1"},
            {"text": "Angular is a component-based framework. Every Angular application has at least one root module (NgModule) and a root component. Components define UI, views, and data logic using TypeScript classes.", "type": "body"},
            {"text": "2. Dependency Injection & Services", "type": "h1"},
            {"text": "Services share data and logic across components. Angular's built-in Dependency Injection (DI) framework injects service instances dynamically into component constructors when required.", "type": "body"},
            {"text": "3. Angular Component & RxJS Example", "type": "h1"},
            {"text": "import { Component, OnInit } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\n\n@Component({\n  selector: 'app-user-profile',\n  template: `<div *ngIf=\"user$ | async as user\">Hello, {{user.name}}</div>`\n})\nexport class UserProfileComponent implements OnInit {\n  user$!: Observable<any>;\n\n  constructor(private http: HttpClient) {}\n\n  ngOnInit() {\n    this.user$ = this.http.get('/api/users/1');\n  }\n}", "type": "code"}
        ]
    },
    {
        "id": "rest-api-study-notes",
        "downloadUrl": "/notes/rest-api-study-notes",
        "company": "All",
        "title": "RESTful API Design & HTTP Methods Cheat Sheet",
        "tags": ["REST API", "API", "HTTP", "Backend"],
        "description": "Understand REST principles, HTTP status codes, GET/POST/PUT/DELETE methods, authentication, and payload design.",
        "category": "Technical",
        "content": [
            {"text": "1. REST Core Principles", "type": "h1"},
            {"text": "REST (Representational State Transfer) is an architectural style for APIs:<br/>- <b>Stateless:</b> Each request contains all information needed to process it.<br/>- <b>Client-Server:</b> Separation of user interface from data storage.<br/>- <b>Uniform Interface:</b> Resource-based URLs (e.g. `/api/v1/users`).", "type": "body"},
            {"text": "2. HTTP Methods & Status Codes", "type": "h1"},
            {"text": "<b>HTTP Methods:</b><br/>- <code>GET</code>: Retrieve resource.<br/>- <code>POST</code>: Create resource.<br/>- <code>PUT/PATCH</code>: Update resource.<br/>- <code>DELETE</code>: Delete resource.<br/><br/><b>HTTP Status Codes:</b><br/>- <code>200 OK / 201 Created</code>: Success.<br/>- <code>400 Bad Request / 401 Unauthorized / 404 Not Found</code>: Client errors.<br/>- <code>500 Internal Server Error</code>: Server error.", "type": "body"},
            {"text": "3. Express API Route Example", "type": "h1"},
            {"text": "const express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.post('/api/users', (req, res) => {\n  const newUser = req.body;\n  if (!newUser.name) {\n    return res.status(400).json({ error: 'Name is required' });\n  }\n  // Save user to database\n  res.status(201).json({ id: 1, name: newUser.name });\n});", "type": "code"}
        ]
    }
]

# Merge lists by checking duplicates
existing_ids = {n['id'] for n in notes}
for nn in new_notes:
    if nn['id'] not in existing_ids:
        notes.append(nn)

# Save to backup folder in backend
os.makedirs('/Users/macbook/Documents/June/VGyans/backend/data/backup', exist_ok=True)
with open('/Users/macbook/Documents/June/VGyans/backend/data/backup/notes.json', 'w', encoding='utf-8') as f:
    json.dump(notes, f, indent=2, ensure_ascii=False)

# Save to frontend public/data (full version)
with open('/Users/macbook/Documents/June/VGyans/frontend/public/data/notes.json', 'w', encoding='utf-8') as f:
    json.dump(notes, f, indent=2, ensure_ascii=False)

# Save to backend data (full version)
with open('/Users/macbook/Documents/June/VGyans/backend/data/notes.json', 'w', encoding='utf-8') as f:
    json.dump(notes, f, indent=2, ensure_ascii=False)

print("Notes merged and saved successfully! Total notes count:", len(notes))
