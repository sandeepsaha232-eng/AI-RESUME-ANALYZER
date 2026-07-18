package com.elevateresume.backend.ai;

import com.elevateresume.backend.analysis.AnalysisDtos;
import com.elevateresume.backend.resume.ResumeDtos;
import com.elevateresume.backend.shared.ApiException;
import com.elevateresume.backend.shared.JsonText;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CareerAiService {
    private final GroqClient groq;
    private final ObjectMapper objectMapper;

    public CareerAiService(GroqClient groq, ObjectMapper objectMapper) {
        this.groq = groq;
        this.objectMapper = objectMapper;
    }

    public AnalysisDtos.AnalyzerResult withRecommendations(
            ResumeDtos.Resume resume,
            AnalysisDtos.AnalyzerResult base) {
        if (!groq.isConfigured()) {
            return new AnalysisDtos.AnalyzerResult(
                    base.atsScore(),
                    base.categoryScores(),
                    base.missingSections(),
                    List.of(new AnalysisDtos.Recommendation(
                            "rec-1",
                            "keywords",
                            "Set GROQ_API_KEY to receive personalized AI recommendations. Until then, add role-specific keywords and measurable achievements.",
                            "medium",
                            "skills")));
        }

        String prompt = """
                You are an elite Career Coach and ATS Expert.
                The candidate's resume has been evaluated deterministically by our scoring engine.
                Scores out of 100:
                - Overall ATS Rating: %d
                - Formatting Density: %d
                - Keyword Optimization: %d
                - Readability Index: %d
                - Grammar Accuracy: %d
                - Structural Completeness: %d

                Resume JSON:
                %s

                Return ONLY a valid JSON object:
                {
                  "recommendations": [
                    {
                      "id": "rec-1",
                      "category": "formatting" | "keywords" | "readability" | "grammar" | "completeness",
                      "text": "Specific, practical advice.",
                      "severity": "high" | "medium" | "low",
                      "section": "experience" | "summary" | "skills" | "certifications" | "languages" | "education" | "projects" | "personal"
                    }
                  ]
                }
                Provide 3-5 recommendations.
                """.formatted(
                base.atsScore(),
                base.categoryScores().formatting(),
                base.categoryScores().keywords(),
                base.categoryScores().readability(),
                base.categoryScores().grammar(),
                base.categoryScores().completeness(),
                prettyJson(resume));

        try {
            JsonNode parsed = objectMapper.readTree(JsonText.cleanJsonBlock(groq.generate(prompt)));
            AnalysisDtos.Recommendation[] recommendations = objectMapper.treeToValue(
                    parsed.path("recommendations"),
                    AnalysisDtos.Recommendation[].class);
            List<AnalysisDtos.Recommendation> safeRecommendations = recommendations == null
                    ? fallbackRecommendations()
                    : Arrays.asList(recommendations);
            return new AnalysisDtos.AnalyzerResult(
                    base.atsScore(),
                    base.categoryScores(),
                    base.missingSections(),
                    safeRecommendations);
        } catch (Exception exception) {
            return new AnalysisDtos.AnalyzerResult(
                    base.atsScore(),
                    base.categoryScores(),
                    base.missingSections(),
                    fallbackRecommendations());
        }
    }

    public ResumeDtos.Resume parseResume(String rawText) {
        if (!groq.isConfigured()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GROQ_KEY_MISSING",
                    "GROQ_API_KEY is required to parse uploaded resumes.");
        }

        String prompt = """
                You are an expert ATS Resume Parser. Extract only facts present in the raw resume text.
                Return ONLY valid JSON matching this shape:
                {
                  "title": "string",
                  "personalInfo": {"fullName":"", "email":"", "phone":"", "location":"", "website":"", "linkedin":"", "github":""},
                  "summary": "string",
                  "experience": [{"company":"", "position":"", "location":"", "startDate":"", "endDate":"", "current": false, "bullets": []}],
                  "education": [{"institution":"", "degree":"", "fieldOfStudy":"", "location":"", "startDate":"", "endDate":"", "current": false, "gpa": ""}],
                  "projects": [{"name":"", "role":"", "url":"", "startDate":"", "endDate":"", "bullets": []}],
                  "skills": [],
                  "certifications": [{"name":"", "issuer":"", "date":"", "url":""}],
                  "languages": [{"name":"", "proficiency":""}]
                }
                If a section is missing, return an empty array or empty string. Do not invent content.

                Raw resume text:
                %s
                """.formatted(rawText);

        try {
            return objectMapper.readValue(JsonText.cleanJsonBlock(groq.generate(prompt)), ResumeDtos.Resume.class);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI_JSON_PARSE_ERROR", "Groq returned resume JSON that could not be parsed.");
        }
    }

    public AnalysisDtos.JobMatchResult compare(ResumeDtos.Resume resume, String jdText) {
        if (!groq.isConfigured()) {
            return new AnalysisDtos.JobMatchResult(
                    70,
                    List.of("system design", "kubernetes", "graphql"),
                    List.of(
                            new AnalysisDtos.SkillGap("system design", "missing"),
                            new AnalysisDtos.SkillGap("kubernetes", "missing"),
                            new AnalysisDtos.SkillGap("graphql", "missing"),
                            new AnalysisDtos.SkillGap("react", "found"),
                            new AnalysisDtos.SkillGap("typescript", "found")),
                    "Set GROQ_API_KEY to receive role-specific fit analysis.");
        }

        String prompt = """
                You are a professional Technical Recruiter and Job Fit Analyst.
                Compare this resume against the target job description.

                Resume JSON:
                %s

                Target Job Description:
                %s

                Return ONLY valid JSON:
                {
                  "matchPercentage": 0,
                  "missingKeywords": [],
                  "skillGaps": [{"skill": "name", "status": "missing" | "found"}],
                  "experienceGapNotes": "2-3 sentences"
                }
                Include up to 8 important skills/tools.
                """.formatted(prettyJson(resume), jdText);

        try {
            return objectMapper.readValue(JsonText.cleanJsonBlock(groq.generate(prompt)), AnalysisDtos.JobMatchResult.class);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI_JSON_PARSE_ERROR", "Groq returned job-match JSON that could not be parsed.");
        }
    }

    public String improveBullet(String bullet, String action, String title) {
        if (!groq.isConfigured()) {
            if ("fix-grammar".equals(action)) {
                return bullet.replaceAll("(?i)i did", "Successfully delivered")
                        .replaceAll("(?i)and got", "resulting in")
                        .trim();
            }
            return "Delivered high-impact " + clean(title, "professional")
                    + " initiatives, improving workflow quality and accelerating measurable delivery outcomes.";
        }

        String prompt = """
                Rewrite this resume bullet for the role "%s".
                Action: %s
                Original bullet: %s

                Output ONLY the rewritten bullet as plain text.
                """.formatted(clean(title, "Professional"), clean(action, "enhance-bullet"), bullet);
        return groq.generate(prompt).trim();
    }

    public String generateSummary(ResumeDtos.Resume resume) {
        if (!groq.isConfigured()) {
            return "Results-oriented " + clean(resume.title(), "Professional")
                    + " with hands-on expertise in " + String.join(", ", safeSkills(resume).stream().limit(4).toList())
                    + ". Proven ability to deliver scalable solutions and improve business outcomes.";
        }

        String prompt = """
                Draft a compelling professional resume summary in 300-500 characters.
                Use strong action language and avoid generic filler.
                Resume JSON:
                %s

                Output ONLY the summary text.
                """.formatted(prettyJson(resume));
        return groq.generate(prompt).trim();
    }

    public String generateCoverLetter(ResumeDtos.Resume resume, String company, String role, String jdText) {
        if (!groq.isConfigured()) {
            String name = resume.personalInfo() == null ? "Candidate" : clean(resume.personalInfo().fullName(), "Candidate");
            return "Dear Hiring Manager" + (company == null || company.isBlank() ? "" : " at " + company) + ",\n\n"
                    + "I am excited to apply for the " + clean(role, resume.title()) + " position. My background in "
                    + String.join(", ", safeSkills(resume).stream().limit(4).toList())
                    + " and hands-on project delivery aligns well with your team's needs.\n\n"
                    + "I would welcome the opportunity to discuss how my experience can contribute to your goals.\n\n"
                    + "Sincerely,\n" + name;
        }

        String prompt = """
                Write a polished, concise cover letter.
                Company: %s
                Role: %s
                Job Description: %s
                Resume JSON: %s

                Output ONLY the finished cover letter text.
                """.formatted(clean(company, "the company"), clean(role, resume.title()), clean(jdText, ""), prettyJson(resume));
        return groq.generate(prompt).trim();
    }

    private List<AnalysisDtos.Recommendation> fallbackRecommendations() {
        return List.of(
                new AnalysisDtos.Recommendation(
                        "rec-f1",
                        "keywords",
                        "Add target-role keywords directly inside skills, summary, and experience bullets.",
                        "high",
                        "skills"),
                new AnalysisDtos.Recommendation(
                        "rec-f2",
                        "completeness",
                        "Add quantified metrics to experience bullets so ATS and recruiters can read business impact quickly.",
                        "medium",
                        "experience"));
    }

    private String prettyJson(Object value) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return String.valueOf(value);
        }
    }

    private String clean(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private List<String> safeSkills(ResumeDtos.Resume resume) {
        return resume.skills() == null ? List.of("software engineering") : resume.skills();
    }
}
