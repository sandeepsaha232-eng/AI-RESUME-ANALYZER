package com.elevateresume.backend.resume;

import com.elevateresume.backend.shared.TextLists;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ResumeNormalizer {

    public ResumeDtos.Resume normalize(ResumeDtos.Resume resume, UUID idOverride) {
        if (resume == null) {
            return null;
        }

        UUID id = idOverride != null ? idOverride : uuidOrNew(resume.id());
        String now = OffsetDateTime.now(ZoneOffset.UTC).toString();
        ResumeDtos.PersonalInfo personal = resume.personalInfo() == null
                ? new ResumeDtos.PersonalInfo("", "", "", "", "", "", "", null)
                : resume.personalInfo();

        return new ResumeDtos.Resume(
                id.toString(),
                blankToDefault(resume.title(), "Untitled Resume"),
                now,
                normalizePersonal(personal),
                TextLists.textOrBlank(resume.summary()),
                normalizeExperience(resume.experience()),
                normalizeEducation(resume.education()),
                normalizeProjects(resume.projects()),
                TextLists.clean(resume.skills()),
                normalizeCertifications(resume.certifications()),
                normalizeLanguages(resume.languages()),
                resume.atsScore() == null ? 0 : resume.atsScore());
    }

    public UUID uuidOrNew(String id) {
        if (id != null) {
            try {
                return UUID.fromString(id);
            } catch (IllegalArgumentException ignored) {
                // Frontend local ids such as "res-123" are replaced when persisted.
            }
        }
        return UUID.randomUUID();
    }

    private ResumeDtos.PersonalInfo normalizePersonal(ResumeDtos.PersonalInfo personal) {
        return new ResumeDtos.PersonalInfo(
                TextLists.textOrBlank(personal.fullName()),
                TextLists.textOrBlank(personal.email()),
                TextLists.textOrBlank(personal.phone()),
                TextLists.textOrBlank(personal.location()),
                TextLists.textOrBlank(personal.website()),
                TextLists.textOrBlank(personal.linkedin()),
                TextLists.textOrBlank(personal.github()),
                personal.photoUrl());
    }

    private List<ResumeDtos.Experience> normalizeExperience(List<ResumeDtos.Experience> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .map(item -> new ResumeDtos.Experience(
                        idOrGenerated(item.id(), "exp"),
                        TextLists.textOrBlank(item.company()),
                        TextLists.textOrBlank(item.position()),
                        TextLists.textOrBlank(item.location()),
                        TextLists.textOrBlank(item.startDate()),
                        TextLists.textOrBlank(item.endDate()),
                        Boolean.TRUE.equals(item.current()),
                        TextLists.clean(item.bullets())))
                .toList();
    }

    private List<ResumeDtos.Education> normalizeEducation(List<ResumeDtos.Education> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .map(item -> new ResumeDtos.Education(
                        idOrGenerated(item.id(), "edu"),
                        TextLists.textOrBlank(item.institution()),
                        TextLists.textOrBlank(item.degree()),
                        TextLists.textOrBlank(item.fieldOfStudy()),
                        TextLists.textOrBlank(item.location()),
                        TextLists.textOrBlank(item.startDate()),
                        TextLists.textOrBlank(item.endDate()),
                        Boolean.TRUE.equals(item.current()),
                        TextLists.textOrBlank(item.gpa())))
                .toList();
    }

    private List<ResumeDtos.Project> normalizeProjects(List<ResumeDtos.Project> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .map(item -> new ResumeDtos.Project(
                        idOrGenerated(item.id(), "proj"),
                        TextLists.textOrBlank(item.name()),
                        TextLists.textOrBlank(item.role()),
                        TextLists.textOrBlank(item.url()),
                        TextLists.textOrBlank(item.startDate()),
                        TextLists.textOrBlank(item.endDate()),
                        TextLists.clean(item.bullets())))
                .toList();
    }

    private List<ResumeDtos.Certification> normalizeCertifications(List<ResumeDtos.Certification> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .map(item -> new ResumeDtos.Certification(
                        idOrGenerated(item.id(), "cert"),
                        TextLists.textOrBlank(item.name()),
                        TextLists.textOrBlank(item.issuer()),
                        TextLists.textOrBlank(item.date()),
                        TextLists.textOrBlank(item.url())))
                .toList();
    }

    private List<ResumeDtos.Language> normalizeLanguages(List<ResumeDtos.Language> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .map(item -> new ResumeDtos.Language(
                        idOrGenerated(item.id(), "lang"),
                        TextLists.textOrBlank(item.name()),
                        TextLists.textOrBlank(item.proficiency())))
                .toList();
    }

    private String idOrGenerated(String id, String prefix) {
        if (id != null && !id.isBlank()) {
            return id;
        }
        return prefix + "-" + UUID.randomUUID();
    }

    private String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }
}
