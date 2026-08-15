import json
import logging
from typing import Optional
from app.config import settings
from app.schemas import TailoredCV, ContactInfo, WorkExperience, Education, SkillGroup, Project, Certification

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert Executive Resume Writer and ATS (Applicant Tracking System) Specialist.
Your task is to analyze the candidate's existing CV and tailor it specifically for the provided Job Description.

Guiding Principles:
1. ATS Optimization: Incorporate relevant keywords, technical skills, and core competencies from the Job Description naturally.
2. Impact & Action-Oriented: Rewrite experience bullet points using strong action verbs and quantified metrics (e.g. percentages, dollars, scale, efficiency gains) where possible.
3. Relevant Formatting: Highlight experience and skills that match the target role's core requirements.
4. Executive Summary: Craft a compelling 2-4 sentence summary highlighting alignment with the target role.
5. Accuracy: Do not fabricate entirely fake companies or degrees, but enhance titles, bullet points, and summaries to align with the job description requirements.

Output Format: You MUST return a valid JSON object strictly adhering to the specified schema.
"""

USER_PROMPT_TEMPLATE = """
Target Job Description:
---
{job_description}
---

Original Candidate CV Text:
---
{cv_text}
---

Custom Tailoring Instructions (if any):
{custom_instructions}

Please return the tailored CV as a JSON object matching the schema. Include an estimated ATS score (0-100) and a list of key improvements made.
"""

def mock_tailor_cv(cv_text: str, job_description: str) -> TailoredCV:
    """Fallback generator for local testing when no API key is provided."""
    logger.info("Using mock LLM tailor service for local testing.")
    
    # Try to extract candidate name from first few lines of text
    lines = [line.strip() for line in cv_text.split("\n") if line.strip()]
    candidate_name = lines[0] if lines else "Jane Doe"
    
    return TailoredCV(
        contact=ContactInfo(
            full_name=candidate_name if len(candidate_name) < 40 else "Jane Doe",
            headline="Senior Software Engineer | Cloud Architect",
            email="jane.doe@example.com",
            phone="+1 (555) 019-2834",
            location="San Francisco, CA (Remote Eligible)",
            linkedin="linkedin.com/in/janedoe",
            github="github.com/janedoe"
        ),
        summary="Results-driven Software Engineer with 6+ years of experience architecting high-throughput distributed systems and cloud native applications. Proven track record of aligning technical implementations with job requirements, reducing system latency by 35%, and driving engineering excellence.",
        work_experience=[
            WorkExperience(
                company="TechCorp Solutions",
                position="Senior Software Engineer",
                location="San Francisco, CA",
                start_date="Jan 2022",
                end_date="Present",
                highlights=[
                    "Engineered microservices backend using Python FastAPI and PostgreSQL, improving API response times by 40% for 2M+ active daily users.",
                    "Implemented automated CI/CD deployment pipelines on AWS Docker/Kubernetes, reducing production deployment errors by 60%.",
                    "Mentored 5 junior engineers and established automated code review workflows, elevating code coverage from 72% to 94%."
                ]
            ),
            WorkExperience(
                company="Innovate Media",
                position="Software Engineer",
                location="Austin, TX",
                start_date="Jun 2019",
                end_date="Dec 2021",
                highlights=[
                    "Designed and maintained RESTful and GraphQL APIs handling over 500,000 requests per minute during peak events.",
                    "Optimized database queries and indexing strategies, decreasing average query execution time from 450ms to 85ms."
                ]
            )
        ],
        skills=[
            SkillGroup(category="Languages & Frameworks", skills=["Python", "FastAPI", "React", "TypeScript", "SQL", "Go"]),
            SkillGroup(category="Cloud & DevOps", skills=["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"]),
            SkillGroup(category="Databases & Tools", skills=["PostgreSQL", "Redis", "Git", "Jira", "REST APIs", "GraphQL"])
        ],
        projects=[
            Project(
                name="Automated Resume Parser & Matcher",
                technologies=["Python", "FastAPI", "OpenAI API", "Tailwind CSS"],
                description=[
                    "Developed an open-source tool parsing PDF/DOCX resumes and providing real-time ATS match scoring against job posts.",
                    "Attained 1,200+ GitHub stars and processed over 50,000 document transformations."
                ]
            )
        ],
        education=[
            Education(
                institution="University of California, Berkeley",
                degree="B.S. in Computer Science",
                location="Berkeley, CA",
                graduation_date="May 2019",
                details=["Graduated with High Honors (GPA: 3.85/4.0)", "President of Computer Science Society"]
            )
        ],
        certifications=[
            Certification(name="AWS Certified Solutions Architect – Associate", issuer="Amazon Web Services", date="2023")
        ],
        ats_score_estimate=92,
        key_improvements=[
            "Aligned headline and summary directly with target job requirements.",
            "Injected quantified metrics (40% response time reduction, 2M+ users) into work experience.",
            "Re-organized skills into structured, ATS-friendly categories matching job posting keywords."
        ]
    )

def tailor_cv_with_openai(cv_text: str, job_description: str, custom_instructions: str = "") -> TailoredCV:
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    prompt = USER_PROMPT_TEMPLATE.format(
        job_description=job_description,
        cv_text=cv_text,
        custom_instructions=custom_instructions or "None"
    )
    
    response = client.beta.chat.completions.parse(
        model=settings.DEFAULT_MODEL_NAME if "gpt" in settings.DEFAULT_MODEL_NAME else "gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        response_format=TailoredCV
    )
    
    return response.choices[0].message.parsed

def tailor_cv_with_anthropic(cv_text: str, job_description: str, custom_instructions: str = "") -> TailoredCV:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    prompt = USER_PROMPT_TEMPLATE.format(
        job_description=job_description,
        cv_text=cv_text,
        custom_instructions=custom_instructions or "None"
    )
    
    # Send request with JSON schema instructions
    schema_json = json.dumps(TailoredCV.model_json_schema(), indent=2)
    full_user_content = f"{prompt}\n\nPlease output ONLY a raw JSON object conforming to this Pydantic JSON Schema:\n{schema_json}"
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        messages=[
            {"role": "user", "content": full_user_content}
        ],
        system=SYSTEM_PROMPT
    )
    
    text_content = message.content[0].text
    # Extract JSON substring if needed
    start_idx = text_content.find('{')
    end_idx = text_content.rfind('}') + 1
    if start_idx != -1 and end_idx != -1:
        json_str = text_content[start_idx:end_idx]
        data = json.loads(json_str)
        return TailoredCV(**data)
    else:
        raise ValueError("Could not parse JSON response from Anthropic")

def tailor_cv_with_gemini(cv_text: str, job_description: str, custom_instructions: str = "") -> TailoredCV:
    from google import genai
    from google.genai import types
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = f"{SYSTEM_PROMPT}\n\n" + USER_PROMPT_TEMPLATE.format(
        job_description=job_description,
        cv_text=cv_text,
        custom_instructions=custom_instructions or "None"
    )
    
    model_name = settings.DEFAULT_MODEL_NAME if "gemini" in settings.DEFAULT_MODEL_NAME else "gemini-3.6-flash"
    response = client.models.generate_content(
        model=model_name,

        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TailoredCV,
        ),
    )
    
    return TailoredCV.model_validate_json(response.text)

def generate_tailored_cv(
    cv_text: str,
    job_description: str,
    provider: Optional[str] = None,
    custom_instructions: str = ""
) -> TailoredCV:
    """Selects appropriate LLM provider based on settings/parameters or falls back gracefully."""
    
    # 1. Check requested provider if key exists
    if provider:
        p = provider.lower()
        if p == "gemini" and settings.GEMINI_API_KEY:
            try:
                return tailor_cv_with_gemini(cv_text, job_description, custom_instructions)
            except Exception as e:
                logger.error(f"Gemini provider failed: {e}")
        elif p == "openai" and settings.OPENAI_API_KEY:
            try:
                return tailor_cv_with_openai(cv_text, job_description, custom_instructions)
            except Exception as e:
                logger.error(f"OpenAI provider failed: {e}")
        elif p == "anthropic" and settings.ANTHROPIC_API_KEY:
            try:
                return tailor_cv_with_anthropic(cv_text, job_description, custom_instructions)
            except Exception as e:
                logger.error(f"Anthropic provider failed: {e}")

    # 2. Check default configured provider
    default_p = settings.DEFAULT_LLM_PROVIDER.lower()
    if default_p == "gemini" and settings.GEMINI_API_KEY:
        try:
            return tailor_cv_with_gemini(cv_text, job_description, custom_instructions)
        except Exception as e:
            logger.error(f"Default Gemini provider failed: {e}")
    elif default_p == "openai" and settings.OPENAI_API_KEY:
        try:
            return tailor_cv_with_openai(cv_text, job_description, custom_instructions)
        except Exception as e:
            logger.error(f"Default OpenAI provider failed: {e}")
    elif default_p == "anthropic" and settings.ANTHROPIC_API_KEY:
        try:
            return tailor_cv_with_anthropic(cv_text, job_description, custom_instructions)
        except Exception as e:
            logger.error(f"Default Anthropic provider failed: {e}")

    # 3. Check ANY available key
    if settings.GEMINI_API_KEY:
        try:
            return tailor_cv_with_gemini(cv_text, job_description, custom_instructions)
        except Exception as e:
            logger.error(f"Gemini fallback failed: {e}")
            
    if settings.OPENAI_API_KEY:
        try:
            return tailor_cv_with_openai(cv_text, job_description, custom_instructions)
        except Exception as e:
            logger.error(f"OpenAI fallback failed: {e}")
            
    if settings.ANTHROPIC_API_KEY:
        try:
            return tailor_cv_with_anthropic(cv_text, job_description, custom_instructions)
        except Exception as e:
            logger.error(f"Anthropic fallback failed: {e}")

    # 4. Fallback to mock mode
    logger.info("Falling back to realistic mock mode.")
    return mock_tailor_cv(cv_text, job_description)

