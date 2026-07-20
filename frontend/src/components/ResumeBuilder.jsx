import React, { useState } from 'react';

export default function ResumeBuilder() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    summary: '',
    skills: '',
    experience: [
      { company: '', role: '', duration: '', desc: '' }
    ],
    projects: [
      { name: '', tech: '', desc: '' }
    ],
    certifications: '',
    achievements: '',
    education: [
      { school: '', degree: '', year: '', grade: '' }
    ]
  });

  const [activeStep, setActiveStep] = useState(0);
  const [fontSizeSetting, setFontSizeSetting] = useState('medium');

  const loadSampleData = () => {
    setFormData({
      name: 'Md Irfan',
      title: 'Full Stack Software Engineer',
      email: 'virtualgyans@gmail.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/virtualgyans',
      github: 'github.com/mdirfancse2023',
      summary: 'Results-driven Full Stack Software Engineer with expertise in React, Node.js, and FastAPI. Passionate about technical education, system architecture, and building optimized, accessible web applications. Experienced in designing structured databases and teaching technical concepts to 10k+ learners.',
      skills: 'Languages: Java, Python, JavaScript, SQL, C++\nFrameworks: React.js, FastAPI, Node.js, Express\nDatabases: MySQL, PostgreSQL, MongoDB\nDeveloper Tools: Git, GitHub, Docker, VS Code',
      experience: [
        {
          company: 'Virtual Gyans (Tech Channel)',
          role: 'Technical Educator & Founder',
          duration: '2023 - Present',
          desc: 'Created recruitment preparation blueprints and placement guides for Cognizant, TCS, and Accenture. Taught Java, SQL, and DSA concepts to 10k+ candidates.'
        },
        {
          company: 'Corporate Internships',
          role: 'Junior Frontend Developer',
          duration: 'Jan 2023 - Jun 2023',
          desc: 'Built responsive web platforms using React and CSS Grid. Optimized site performance, reducing LCP by 25% and improving accessibility scores.'
        }
      ],
      projects: [
        {
          name: 'Interactive Onboarding Timelines',
          tech: 'React, Vite, CSS-in-JS',
          desc: 'Created an onboarding progress tracker helping candidate engineers navigate corporate hiring milestones seamlessly.'
        },
        {
          name: '3D Technical Quiz System',
          tech: 'Vanilla JS, CSS 3D Transforms',
          desc: 'Designed a flashcard-based self-evaluation quiz with smooth card flip physics and custom result metrics.'
        }
      ],
      certifications: '• AWS Certified Cloud Practitioner — Amazon Web Services (2025)\n• Java SE 11 Developer Certification — Oracle (2024)\n• Meta Front-End Developer Professional Certificate — Coursera (2024)',
      achievements: '• Secured Global Rank 254 out of 15,000+ participants in LeetCode Weekly Contest.\n• Winner of HackQuest Smart India Hackathon (College Round) for smart health-tracker app.\n• Built technical content community on YouTube with 10k+ active subscribers and 500k+ views.',
      education: [
        {
          school: 'ABC Technical University',
          degree: 'B.Tech in Computer Science',
          year: '2020 - 2024',
          grade: '8.7 CGPA'
        }
      ]
    });
  };

  const handleChange = (e, section = null, index = null, field = null) => {
    if (section) {
      const updatedSection = [...formData[section]];
      updatedSection[index][field] = e.target.value;
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addField = (section, template) => {
    setFormData({
      ...formData,
      [section]: [...formData[section], template]
    });
  };

  const removeField = (section, index) => {
    if (formData[section].length > 1) {
      const updatedSection = formData[section].filter((_, idx) => idx !== index);
      setFormData({ ...formData, [section]: updatedSection });
    }
  };

  const handlePrint = () => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        generatePDF();
      };
      document.body.appendChild(script);
    } else {
      generatePDF();
    }
  };

  const generatePDF = () => {
    const element = document.querySelector('.preview-panel');
    if (!element) return;

    const opt = {
      margin:       [0.4, 0.4, 0.4, 0.4],
      filename:     `${(formData.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    const originalShadow = element.style.boxShadow;
    const originalBorderRadius = element.style.borderRadius;
    const originalPadding = element.style.padding;
    const originalMargin = element.style.margin;
    const originalMinHeight = element.style.minHeight;
    const originalHeight = element.style.height;
    const originalPosition = element.style.position;
    const originalTop = element.style.top;
    
    element.style.boxShadow = 'none';
    element.style.borderRadius = '0';
    element.style.padding = '0 6px 0 6px';
    element.style.margin = '0';
    element.style.minHeight = 'auto';
    element.style.height = 'auto';
    element.style.position = 'static';
    element.style.top = 'auto';

    setTimeout(() => {
      window.html2pdf().from(element).set(opt).save().then(() => {
        element.style.boxShadow = originalShadow;
        element.style.borderRadius = originalBorderRadius;
        element.style.padding = originalPadding;
        element.style.margin = originalMargin;
        element.style.minHeight = originalMinHeight;
        element.style.height = originalHeight;
        element.style.position = originalPosition;
        element.style.top = originalTop;
      }).catch(err => {
        console.error("PDF generation failed:", err);
        element.style.boxShadow = originalShadow;
        element.style.borderRadius = originalBorderRadius;
        element.style.padding = originalPadding;
        element.style.margin = originalMargin;
        element.style.minHeight = originalMinHeight;
        element.style.height = originalHeight;
        element.style.position = originalPosition;
        element.style.top = originalTop;
        window.print();
      });
    }, 150);
  };

  const getSizes = () => {
    switch (fontSizeSetting) {
      case 'small':
        return {
          name: '15pt',
          title: '9.5pt',
          info: '8.2pt',
          sectionHeader: '9.5pt',
          sectionBody: '8.2pt',
          sectionBodySmall: '8pt',
          marginBottomSection: '0.45rem',
          marginBottomItem: '0.2rem',
          paddingBottomHeader: '0.04rem',
          gap: '0.3rem'
        };
      case 'large':
        return {
          name: '21pt',
          title: '11.5pt',
          info: '10pt',
          sectionHeader: '12pt',
          sectionBody: '10pt',
          sectionBodySmall: '9.5pt',
          marginBottomSection: '1.1rem',
          marginBottomItem: '0.65rem',
          paddingBottomHeader: '0.15rem',
          gap: '0.6rem'
        };
      case 'medium':
      default:
        return {
          name: '18pt',
          title: '10.5pt',
          info: '9pt',
          sectionHeader: '11pt',
          sectionBody: '9pt',
          sectionBodySmall: '8.5pt',
          marginBottomSection: '0.8rem',
          marginBottomItem: '0.5rem',
          paddingBottomHeader: '0.1rem',
          gap: '0.4rem'
        };
    }
  };

  const sizes = getSizes();

  const renderSkills = (skillsString) => {
    if (!skillsString) return null;
    const lines = skillsString.split(/[;\n]+/).map(line => line.trim()).filter(line => line.length > 0);
    return lines.map((line, idx) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const category = line.slice(0, colonIdx).trim();
        const skills = line.slice(colonIdx + 1).trim();
        return (
          <div key={idx} style={{ fontSize: sizes.sectionBody, marginBottom: '0.25rem', color: '#111111', fontFamily: 'Arial, sans-serif' }}>
            <strong>{category}:</strong> {skills}
          </div>
        );
      }
      return (
        <div key={idx} style={{ fontSize: sizes.sectionBody, marginBottom: '0.25rem', color: '#111111', fontFamily: 'Arial, sans-serif' }}>
          {line}
        </div>
      );
    });
  };

  const renderListSection = (text) => {
    if (!text) return null;
    const items = text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    return items.map((item, idx) => {
      const displayItem = item.startsWith('•') || item.startsWith('-') || item.startsWith('*') ? item : `• ${item}`;
      return (
        <div key={idx} style={{ fontSize: sizes.sectionBodySmall, marginBottom: '0.15rem', color: '#111111', lineHeight: 1.35, fontFamily: 'Arial, sans-serif' }}>
          {displayItem}
        </div>
      );
    });
  };

  const steps = ['Personal Details & Summary', 'Skills & Experience', 'Personal Projects', 'Certifications, Achievements & Education'];

  return (
    <div className="resume-builder-wrapper">
      <style>{`
        .resume-builder-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }
        @media (max-width: 1024px) {
          .resume-builder-grid {
            grid-template-columns: 1fr;
          }
        }
        .form-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 1.5rem;
        }
        .preview-panel {
          background: #ffffff;
          color: #0f172a;
          border-radius: 8px;
          padding: 3rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          font-family: 'Arial', 'Helvetica', sans-serif;
          min-height: 800px;
          height: fit-content;
          position: sticky;
          top: 2rem;
          line-height: 1.4;
        }
        .preview-panel > div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--primary);
          outline: none;
        }
        .step-indicators {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 1rem;
          gap: 0.5rem;
        }
        .step-tab {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          padding: 0.25rem 0.25rem;
        }
        .step-tab.active {
          color: var(--primary);
        }
        .step-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary);
        }
        
        /* Light Mode overrides */
        body.light-theme .form-panel {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
        }
        body.light-theme .form-group label {
          color: #334155 !important;
        }
        body.light-theme .form-group input, 
        body.light-theme .form-group textarea {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
        }
        body.light-theme .form-group input:focus, 
        body.light-theme .form-group textarea:focus {
          border-color: #0284c7 !important;
        }
        body.light-theme .step-tab {
          color: #64748b !important;
        }
        body.light-theme .step-tab.active {
          color: #0284c7 !important;
        }
        body.light-theme .step-tab.active::after {
          background: #0284c7 !important;
        }
        body.light-theme .font-size-select {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
          color: #334155 !important;
        }
        body.light-theme .font-size-select:hover {
          background: #f1f5f9 !important;
          border-color: #0284c7 !important;
          color: #0284c7 !important;
        }

        /* Print Stylesheet integration */
        @media print {
          body * {
            visibility: hidden;
          }
          .preview-panel, .preview-panel * {
            visibility: visible;
          }
          .preview-panel {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none;
            color: #000;
          }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', margin: 0 }}>Dynamic Resume Builder</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select 
            value={fontSizeSetting} 
            onChange={(e) => setFontSizeSetting(e.target.value)}
            style={{ 
              padding: '0.4rem 0.75rem', 
              fontSize: '0.85rem', 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              height: '32px'
            }}
            className="font-size-select"
          >
            <option value="small" style={{ background: 'var(--bg-dark-secondary)', color: 'var(--text-primary)' }}>Small Font</option>
            <option value="medium" style={{ background: 'var(--bg-dark-secondary)', color: 'var(--text-primary)' }}>Medium Font</option>
            <option value="large" style={{ background: 'var(--bg-dark-secondary)', color: 'var(--text-primary)' }}>Large Font</option>
          </select>
          <button className="btn btn-secondary" onClick={loadSampleData} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '32px', display: 'inline-flex', alignItems: 'center' }}>
            Load Sample Data
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '32px', display: 'inline-flex', alignItems: 'center' }}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="resume-builder-grid">
        {/* Form Inputs Panel */}
        <div className="form-panel">
          <div className="step-indicators">
            {steps.map((step, idx) => (
              <button 
                key={idx} 
                className={`step-tab ${activeStep === idx ? 'active' : ''}`}
                onClick={() => setActiveStep(idx)}
              >
                {idx + 1}. {step}
              </button>
            ))}
          </div>

          {activeStep === 0 && (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Personal Contact Info & Summary</h4>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Md Irfan" />
              </div>
              <div className="form-group">
                <label>Professional Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Software Engineer Intern" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="virtualgyans@gmail.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/username" />
                </div>
                <div className="form-group">
                  <label>GitHub Profile URL</label>
                  <input type="text" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/username" />
                </div>
              </div>
              <div className="form-group">
                <label>Professional Summary</label>
                <textarea rows="4" name="summary" value={formData.summary} onChange={handleChange} placeholder="Briefly describe your career objectives, experience, and key strengths..." />
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Technical Skills & Experience</h4>
              
              <div className="form-group">
                <label>List Technical Skills (Category-wise)</label>
                <textarea 
                  rows="4" 
                  name="skills" 
                  value={formData.skills} 
                  onChange={handleChange} 
                  placeholder="Format: Category: Skill1, Skill2&#10;e.g.&#10;Languages: Java, Python, SQL&#10;Frameworks: React, FastAPI" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Work Experience / Internships</h4>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => addField('experience', { company: '', role: '', duration: '', desc: '' })}
                >
                  + Add Experience
                </button>
              </div>

              {formData.experience.map((exp, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: 'var(--bg-dark-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>Position #{idx + 1}</span>
                    {formData.experience.length > 1 && (
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                        onClick={() => removeField('experience', idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" value={exp.company} onChange={(e) => handleChange(e, 'experience', idx, 'company')} placeholder="e.g. Cognizant" />
                  </div>
                  <div className="form-group">
                    <label>Role Title</label>
                    <input type="text" value={exp.role} onChange={(e) => handleChange(e, 'experience', idx, 'role')} placeholder="e.g. Software Engineer Intern" />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input type="text" value={exp.duration} onChange={(e) => handleChange(e, 'experience', idx, 'duration')} placeholder="e.g. Jan 2023 - Present" />
                  </div>
                  <div className="form-group">
                    <label>Job Description</label>
                    <textarea rows="3" value={exp.desc} onChange={(e) => handleChange(e, 'experience', idx, 'desc')} placeholder="Describe your achievements and key deliverables..." />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--text-primary)' }}>Personal Projects</h4>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => addField('projects', { name: '', tech: '', desc: '' })}
                >
                  + Add Project
                </button>
              </div>

              {formData.projects.map((proj, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: 'var(--bg-dark-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>Project #{idx + 1}</span>
                    {formData.projects.length > 1 && (
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                        onClick={() => removeField('projects', idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input type="text" value={proj.name} onChange={(e) => handleChange(e, 'projects', idx, 'name')} placeholder="e.g. Portfolio Website" />
                  </div>
                  <div className="form-group">
                    <label>Technologies Used</label>
                    <input type="text" value={proj.tech} onChange={(e) => handleChange(e, 'projects', idx, 'tech')} placeholder="e.g. React.js, Vite, CSS Grid" />
                  </div>
                  <div className="form-group">
                    <label>Short Description</label>
                    <textarea rows="2" value={proj.desc} onChange={(e) => handleChange(e, 'projects', idx, 'desc')} placeholder="Explain project core deliverables and metrics..." />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Certifications, Achievements & Education</h4>
              
              <div className="form-group">
                <label>Certifications (One per line)</label>
                <textarea 
                  rows="3" 
                  name="certifications" 
                  value={formData.certifications} 
                  onChange={handleChange} 
                  placeholder="e.g. AWS Certified Cloud Practitioner&#10;Oracle Java Certified SE 11" 
                />
              </div>

              <div className="form-group">
                <label>Achievements (One per line)</label>
                <textarea 
                  rows="3" 
                  name="achievements" 
                  value={formData.achievements} 
                  onChange={handleChange} 
                  placeholder="e.g. Secured Rank 12 out of 5000+ candidates&#10;Winner of National Hackathon" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Education Details</h4>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => addField('education', { school: '', degree: '', year: '', grade: '' })}
                >
                  + Add Education
                </button>
              </div>

              {formData.education.map((edu, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: 'var(--bg-dark-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>Education #{idx + 1}</span>
                    {formData.education.length > 1 && (
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                        onClick={() => removeField('education', idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>College / University / School Name</label>
                    <input type="text" value={edu.school} onChange={(e) => handleChange(e, 'education', idx, 'school')} placeholder="e.g. ABC Tech Institute" />
                  </div>
                  <div className="form-group">
                    <label>Degree & Stream</label>
                    <input type="text" value={edu.degree} onChange={(e) => handleChange(e, 'education', idx, 'degree')} placeholder="e.g. B.Tech in CSE" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Year of Study</label>
                      <input type="text" value={edu.year} onChange={(e) => handleChange(e, 'education', idx, 'year')} placeholder="e.g. 2020 - 2024" />
                    </div>
                    <div className="form-group">
                      <label>CGPA / Percentage</label>
                      <input type="text" value={edu.grade} onChange={(e) => handleChange(e, 'education', idx, 'grade')} placeholder="e.g. 8.5 CGPA" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button 
              className="btn btn-secondary" 
              disabled={activeStep === 0} 
              onClick={() => setActiveStep((prev) => prev - 1)}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Back
            </button>
            <button 
              className="btn btn-primary" 
              disabled={activeStep === steps.length - 1} 
              onClick={() => setActiveStep((prev) => prev + 1)}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="preview-panel">
          <div style={{ textAlign: 'center', margin: 0, padding: 0, paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomSection }}>
            <h2 style={{ fontSize: sizes.name, fontWeight: 'bold', margin: 0, marginTop: 0, paddingTop: 0, color: '#000000', letterSpacing: '-0.02em', fontFamily: 'Arial, sans-serif' }}>
              {formData.name || 'YOUR NAME'}
            </h2>
            <p style={{ fontSize: sizes.title, fontWeight: 'bold', color: '#1e293b', margin: `0 0 ${sizes.gap} 0`, padding: 0, fontFamily: 'Arial, sans-serif' }}>
              {formData.title || 'Professional Title'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: sizes.gap, fontSize: sizes.info, color: '#334155', fontFamily: 'Arial, sans-serif' }}>
              {formData.email && <span>{formData.email}</span>}
              {formData.phone && <><span>|</span><span>{formData.phone}</span></>}
              {formData.linkedin && <><span>|</span><span>{formData.linkedin}</span></>}
              {formData.github && <><span>|</span><span>{formData.github}</span></>}
            </div>
          </div>

          {/* Professional Summary */}
          {formData.summary && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Professional Summary
              </h3>
              <p style={{ fontSize: sizes.sectionBody, color: '#111111', margin: 0, lineHeight: 1.4, fontFamily: 'Arial, sans-serif', textAlign: 'justify' }}>
                {formData.summary}
              </p>
            </div>
          )}

          {/* Technical Skills */}
          {formData.skills && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Technical Skills
              </h3>
              {renderSkills(formData.skills)}
            </div>
          )}

          {/* Work Experience */}
          {formData.experience && formData.experience.length > 0 && formData.experience[0].company && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Work Experience
              </h3>
              {formData.experience.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: sizes.gap, fontSize: sizes.sectionBody, color: '#111111', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000000' }}>
                    <span>{exp.role || 'Role'} — {exp.company || 'Company'}</span>
                    <span style={{ fontWeight: 'normal', fontSize: sizes.sectionBodySmall, color: '#334155', paddingRight: '6px' }}>{exp.duration || 'Duration'}</span>
                  </div>
                  {exp.desc && (
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: sizes.sectionBodySmall, color: '#334155', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                      {exp.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Personal Projects */}
          {formData.projects && formData.projects.length > 0 && formData.projects[0].name && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Personal Projects
              </h3>
              {formData.projects.map((proj, idx) => (
                <div key={idx} style={{ marginBottom: sizes.gap, fontSize: sizes.sectionBody, color: '#111111', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000000' }}>
                    <span>{proj.name || 'Project Name'} {proj.tech && <span style={{ fontWeight: 'normal', fontSize: sizes.sectionBodySmall, color: '#334155' }}>({proj.tech})</span>}</span>
                  </div>
                  {proj.desc && (
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: sizes.sectionBodySmall, color: '#334155', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                      {proj.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {formData.certifications && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Certifications
              </h3>
              {renderListSection(formData.certifications)}
            </div>
          )}

          {/* Achievements */}
          {formData.achievements && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Achievements
              </h3>
              {renderListSection(formData.achievements)}
            </div>
          )}

          {/* Education */}
          {formData.education && formData.education.length > 0 && formData.education[0].school && (
            <div style={{ marginBottom: sizes.marginBottomSection }}>
              <h3 style={{ fontSize: sizes.sectionHeader, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: sizes.paddingBottomHeader, marginBottom: sizes.marginBottomItem, color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                Education
              </h3>
              {formData.education.map((edu, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: sizes.sectionBody, marginBottom: '0.25rem', color: '#111111', fontFamily: 'Arial, sans-serif' }}>
                  <div>
                    <strong>{edu.school || 'School/University'}</strong> — {edu.degree || 'Degree'}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: sizes.sectionBodySmall, color: '#334155', paddingRight: '6px' }}>
                    <span>{edu.year || 'Duration'}</span> | <strong>{edu.grade || 'Grade'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
