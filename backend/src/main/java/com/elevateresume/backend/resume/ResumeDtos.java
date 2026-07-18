package com.elevateresume.backend.resume;

import com.elevateresume.backend.analysis.AnalysisDtos;
import java.util.List;

public final class ResumeDtos {
    private ResumeDtos() {
    }

    public record PersonalInfo(
            String fullName,
            String email,
            String phone,
            String location,
            String website,
            String linkedin,
            String github,
            String photoUrl) {
    }

    public record Experience(
            String id,
            String company,
            String position,
            String location,
            String startDate,
            String endDate,
            Boolean current,
            List<String> bullets) {
    }

    public record Education(
            String id,
            String institution,
            String degree,
            String fieldOfStudy,
            String location,
            String startDate,
            String endDate,
            Boolean current,
            String gpa) {
    }

    public record Project(
            String id,
            String name,
            String role,
            String url,
            String startDate,
            String endDate,
            List<String> bullets) {
    }

    public record Certification(
            String id,
            String name,
            String issuer,
            String date,
            String url) {
    }

    public record Language(
            String id,
            String name,
            String proficiency) {
    }

    public record Resume(
            String id,
            String title,
            String lastEdited,
            PersonalInfo personalInfo,
            String summary,
            List<Experience> experience,
            List<Education> education,
            List<Project> projects,
            List<String> skills,
            List<Certification> certifications,
            List<Language> languages,
            Integer atsScore) {
    }

    public record ResumeRequest(Resume resume) {
    }

    public record UploadResult(Resume resume, AnalysisDtos.AnalyzerResult analysis) {
    }
}
