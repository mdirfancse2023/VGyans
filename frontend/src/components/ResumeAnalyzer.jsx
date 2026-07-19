import React, { useState } from 'react';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [targetCompany, setTargetCompany] = useState('Cognizant');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [results, setResults] = useState(null);

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text to analyze!");
      return;
    }

    setAnalyzing(true);
    setResults(null);
    
    // Simulate multi-stage analysis steps for high-premium experience
    const steps = [
      "Parsing resume document structure...",
      "Extracting sections & contact details...",
      "Analyzing technical skill keywords...",
      "Evaluating action verb strength...",
      "Calculating ATS compatibility metrics..."
    ];
    
    let currentStepIdx = 0;
    setAnalysisStep(steps[0]);
    
    const interval = setInterval(() => {
      currentStepIdx += 1;
      if (currentStepIdx < steps.length) {
        setAnalysisStep(steps[currentStepIdx]);
      } else {
        clearInterval(interval);
        performAnalysis();
      }
    }, 450);
  };

  const performAnalysis = () => {
    const text = resumeText.toLowerCase();
    
    // 1. Check for contact details
    const hasEmail = text.includes('@') && (text.includes('.com') || text.includes('.in') || text.includes('.org') || text.includes('.edu'));
    const hasPhone = (text.match(/\+?\d[\d\s-]{8,12}\d/) !== null);
    const hasLinkedIn = text.includes('linkedin.com');
    const hasGitHub = text.includes('github.com');
    
    // 2. Check for standard sections
    const hasEducation = text.includes('education') || text.includes('school') || text.includes('university') || text.includes('college') || text.includes('btech') || text.includes('cgpa');
    const hasExperience = text.includes('experience') || text.includes('work') || text.includes('intern') || text.includes('employment') || text.includes('job');
    const hasProjects = text.includes('project') || text.includes('projects');
    const hasSkills = text.includes('skill') || text.includes('skills') || text.includes('languages') || text.includes('technologies');
    
    // 3. Count Action Verbs
    const actionVerbsList = [
      'led', 'developed', 'designed', 'created', 'optimized', 
      'implemented', 'managed', 'built', 'solved', 'reduced', 
      'increased', 'achieved', 'initiated', 'engineered', 'formulated'
    ];
    const foundVerbs = actionVerbsList.filter(verb => text.includes(verb));
    const verbCount = foundVerbs.length;

    // 4. Calculate ATS Score
    let score = 40; // Base score
    if (hasEmail) score += 10;
    if (hasPhone) score += 10;
    if (hasLinkedIn) score += 10;
    if (hasGitHub) score += 10;
    if (hasEducation) score += 5;
    if (hasExperience) score += 5;
    if (hasProjects) score += 5;
    if (hasSkills) score += 5;
    if (verbCount >= 4) score += 10;
    else if (verbCount >= 2) score += 5;
    
    // Cap score at 100
    score = Math.min(100, score);

    // 5. Generate recommendations
    const recommendations = [];
    if (!hasEmail || !hasPhone) {
      recommendations.push("Add clear contact information (Email and Phone) at the top of your resume so recruiters can reach out.");
    }
    if (!hasLinkedIn) {
      recommendations.push("Include a link to your LinkedIn profile. It helps recruiters verify your professional credentials.");
    }
    if (!hasGitHub) {
      recommendations.push("Add your GitHub profile link. For tech roles, recruiters look for repositories showing actual coding projects.");
    }
    if (!hasEducation) {
      recommendations.push("Clearly outline an 'Education' section detailing your Degree, Stream, Year of Graduation, and CGPA/Percentage.");
    }
    if (!hasExperience && !hasProjects) {
      recommendations.push("Add a 'Projects' or 'Work Experience' section. Detail at least 2 software projects showing what you built.");
    }
    if (!hasSkills) {
      recommendations.push("Create a designated 'Technical Skills' section grouping your languages (Java, Python, Javascript) and tools (Git, SQL).");
    }
    if (verbCount < 3) {
      recommendations.push("Start your project and work descriptions with strong action verbs (e.g. 'Optimized app load time...' instead of 'I was responsible for...');");
    }

    // 6. Target company customized tips
    let companyAdvice = "";
    if (targetCompany === "Cognizant") {
      companyAdvice = "Cognizant looks for strong fundamentals in Object Oriented Programming (Java/Python) and Database Systems (SQL). Ensure these keywords are prominently listed. For GenC Elevate, emphasize full-stack project architectures.";
    } else if (targetCompany === "TCS") {
      companyAdvice = "TCS NQT evaluates logical reasoning and programming proficiency. Focus on highlighting Data Structures, Algorithms, and core academic projects on your resume. Make sure to specify languages used in each project.";
    } else if (targetCompany === "Accenture") {
      companyAdvice = "Accenture values modern development methodologies (Agile, SDLC), Cloud awareness (AWS/Azure), and frontend/backend frameworks. Adding terms like 'REST API', 'Git version control', or 'Cloud deployment' will boost compatibility.";
    } else {
      companyAdvice = "For general ATS parsers, ensure you use simple fonts, standard section headers, and avoid complex table borders or double-column layouts that confuse reader bots.";
    }

    setResults({
      score,
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGitHub,
      hasEducation,
      hasExperience,
      hasProjects,
      hasSkills,
      verbCount,
      recommendations,
      companyAdvice
    });
    setAnalyzing(false);
  };

  return (
    <div className="resume-analyzer-wrapper">
      <style>{`
        .analyzer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }
        @media (max-width: 1024px) {
          .analyzer-grid {
            grid-template-columns: 1fr;
          }
        }
        .input-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .results-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 1.5rem;
          color: #fff;
        }
        .score-circle-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255,255,255,0.01);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.03);
        }
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 8px solid #cbd5e1;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-heading);
          margin-bottom: 0.5rem;
        }
        .score-circle.low { border-color: var(--danger); color: var(--danger); }
        .score-circle.med { border-color: #f59e0b; color: #f59e0b; }
        .score-circle.high { border-color: var(--success); color: var(--success); }
        
        .checklist-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .checklist-icon {
          font-weight: bold;
        }
        .checklist-icon.pass { color: var(--success); }
        .checklist-icon.fail { color: var(--danger); }
        
        .recommendation-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .recommendation-item {
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.05);
          border-left: 3px solid var(--danger);
          border-radius: 0 8px 8px 0;
          font-size: 0.85rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }
        .recommendation-item.success-item {
          background: rgba(16, 185, 129, 0.05);
          border-left-color: var(--success);
          color: #fff;
        }
      `}</style>

      <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1.5rem' }}>AI-Style Resume Analyzer (ATS Checker)</h3>

      <div className="analyzer-grid">
        {/* Input Text Area Panel */}
        <div className="input-panel">
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
              Select Target Placement:
            </label>
            <select 
              value={targetCompany} 
              onChange={(e) => setTargetCompany(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0d1a', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
            >
              <option value="Cognizant">Cognizant GenC / Elevate</option>
              <option value="TCS">TCS NQT (Ninja/Digital/Prime)</option>
              <option value="Accenture">Accenture ASE/FSE</option>
              <option value="General">General Technical ATS Standard</option>
            </select>
          </div>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
              Paste Resume Content (Plain Text):
            </label>
            <textarea
              rows="12"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Copy everything from your resume document (PDF or Word) and paste it here..."
              style={{ width: '100%', flexGrow: 1, padding: '1rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', lineHeight: 1.5, resize: 'none' }}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze} 
            disabled={analyzing}
            style={{ width: '100%', padding: '0.8rem' }}
          >
            {analyzing ? "Running Diagnostics..." : "Analyze ATS & Compatibility"}
          </button>
        </div>

        {/* Results Analysis Panel */}
        <div className="results-panel">
          {analyzing && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
              <p style={{ color: '#fff', fontWeight: '500', fontSize: '0.95rem' }}>{analysisStep}</p>
            </div>
          )}

          {!analyzing && !results && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Analysis Performed</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>Paste your resume text on the left and select your target role to check your compatibility scores.</p>
            </div>
          )}

          {!analyzing && results && (
            <div>
              {/* Score Header */}
              <div className="score-circle-wrapper">
                <div className={`score-circle ${results.score < 55 ? 'low' : results.score < 80 ? 'med' : 'high'}`}>
                  {results.score}%
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>ATS Score Estimate</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {results.score < 55 ? 'Critical adjustments needed' : results.score < 80 ? 'Good, minor fixes suggested' : 'Excellent placement readiness'}
                </div>
              </div>

              {/* Sections Checklist */}
              <h4 style={{ fontSize: '0.95rem', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Checklist Analysis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasEmail ? 'pass' : 'fail'}`}>{results.hasEmail ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasEmail ? '#fff' : 'var(--text-muted)' }}>Email Address</span>
                  </div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasPhone ? 'pass' : 'fail'}`}>{results.hasPhone ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasPhone ? '#fff' : 'var(--text-muted)' }}>Phone Number</span>
                  </div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasLinkedIn ? 'pass' : 'fail'}`}>{results.hasLinkedIn ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasLinkedIn ? '#fff' : 'var(--text-muted)' }}>LinkedIn Link</span>
                  </div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasGitHub ? 'pass' : 'fail'}`}>{results.hasGitHub ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasGitHub ? '#fff' : 'var(--text-muted)' }}>GitHub Link</span>
                  </div>
                </div>

                <div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasEducation ? 'pass' : 'fail'}`}>{results.hasEducation ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasEducation ? '#fff' : 'var(--text-muted)' }}>Education Section</span>
                  </div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasExperience ? 'pass' : 'fail'}`}>{results.hasExperience ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasExperience ? '#fff' : 'var(--text-muted)' }}>Experience Block</span>
                  </div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasProjects ? 'pass' : 'fail'}`}>{results.hasProjects ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasProjects ? '#fff' : 'var(--text-muted)' }}>Projects Section</span>
                  </div>
                  <div className="checklist-item">
                    <span className={`checklist-icon ${results.hasSkills ? 'pass' : 'fail'}`}>{results.hasSkills ? '✓' : '✗'}</span>
                    <span style={{ color: results.hasSkills ? '#fff' : 'var(--text-muted)' }}>Skills Section</span>
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <h4 style={{ fontSize: '0.95rem', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Personalized Action Plan</h4>
              {results.recommendations.length === 0 ? (
                <div className="recommendation-item success-item">
                  ✓ Great job! Your resume contains all standard ATS checkpoints and matches core technical formatting guidelines.
                </div>
              ) : (
                <ul className="recommendation-list">
                  {results.recommendations.map((rec, idx) => (
                    <li key={idx} className="recommendation-item">
                      ⚠️ {rec}
                    </li>
                  ))}
                </ul>
              )}

              {/* Company Specific Advice */}
              <h4 style={{ fontSize: '0.95rem', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                Target Placement Strategy ({targetCompany})
              </h4>
              <div style={{ background: 'rgba(6, 182, 212, 0.05)', borderLeft: '3px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {results.companyAdvice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
