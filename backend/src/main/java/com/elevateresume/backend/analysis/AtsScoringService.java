package com.elevateresume.backend.analysis;

import com.elevateresume.backend.resume.ResumeDtos;
import com.elevateresume.backend.shared.TextLists;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AtsScoringService {

    public AnalysisDtos.AnalyzerResult calculate(ResumeDtos.Resume resume) {
        int formatting = calculateFormatting(resume);
        int keywords = calculateKeywords(resume);
        int readability = calculateReadability(resume);
        int grammar = 92;
        int completeness = calculateCompleteness(resume);

        int atsScore = Math.round((formatting + keywords + readability + grammar + completeness) / 5.0f);
        AnalysisDtos.CategoryScores categoryScores = new AnalysisDtos.CategoryScores(
                formatting,
                keywords,
                readability,
                grammar,
                completeness);

        return new AnalysisDtos.AnalyzerResult(
                atsScore,
                categoryScores,
                missingSections(resume),
                List.of());
    }

    private int calculateFormatting(ResumeDtos.Resume resume) {
        int formatting = 60;
        if (!safe(resume.experience()).isEmpty()) {
            formatting += 15;
        }
        if (!safe(resume.education()).isEmpty()) {
            formatting += 15;
        }
        if (!TextLists.clean(resume.skills()).isEmpty()) {
            formatting += 10;
        }

        int penalty = 0;
        for (ResumeDtos.Experience experience : safe(resume.experience())) {
            for (String bullet : TextLists.clean(experience.bullets())) {
                if (bullet.length() > 250) {
                    penalty += 5;
                }
            }
        }
        for (ResumeDtos.Project project : safe(resume.projects())) {
            for (String bullet : TextLists.clean(project.bullets())) {
                if (bullet.length() > 250) {
                    penalty += 5;
                }
            }
        }
        return Math.max(40, formatting - Math.min(20, penalty));
    }

    private int calculateKeywords(ResumeDtos.Resume resume) {
        int skillsCount = TextLists.clean(resume.skills()).size();
        if (skillsCount >= 12) {
            return 100;
        }
        if (skillsCount >= 8) {
            return 85;
        }
        if (skillsCount >= 4) {
            return 70;
        }
        if (skillsCount >= 1) {
            return 50;
        }
        return 30;
    }

    private int calculateReadability(ResumeDtos.Resume resume) {
        int readability = 0;
        if (TextLists.hasText(resume.summary())) {
            readability += 20;
        }

        List<ResumeDtos.Experience> experience = safe(resume.experience());
        int expCount = experience.size();
        if (expCount >= 3) {
            readability += 40;
        } else if (expCount >= 1) {
            readability += 25;
        }

        if (expCount == 0) {
            return readability + 10;
        }

        int totalBullets = experience.stream()
                .mapToInt(item -> TextLists.clean(item.bullets()).size())
                .sum();
        double averageBullets = (double) totalBullets / expCount;
        if (averageBullets >= 2 && averageBullets <= 5) {
            readability += 40;
        } else if (averageBullets > 0) {
            readability += 25;
        } else {
            readability += 10;
        }
        return readability;
    }

    private int calculateCompleteness(ResumeDtos.Resume resume) {
        int completeness = 0;
        ResumeDtos.PersonalInfo personal = resume.personalInfo();
        boolean hasContact = personal != null
                && TextLists.hasText(personal.fullName())
                && TextLists.hasText(personal.email())
                && TextLists.hasText(personal.phone());
        if (hasContact) {
            completeness += 20;
        }
        if (TextLists.hasText(resume.summary())) {
            completeness += 20;
        }
        if (!safe(resume.experience()).isEmpty()) {
            completeness += 25;
        }
        if (!safe(resume.education()).isEmpty()) {
            completeness += 15;
        }
        if (!safe(resume.projects()).isEmpty()) {
            completeness += 10;
        }
        if (!TextLists.clean(resume.skills()).isEmpty()) {
            completeness += 10;
        }
        return completeness;
    }

    private List<String> missingSections(ResumeDtos.Resume resume) {
        List<String> missing = new ArrayList<>();
        if (!TextLists.hasText(resume.summary())) {
            missing.add("Summary / Profile");
        }
        if (safe(resume.experience()).isEmpty()) {
            missing.add("Work Experience");
        }
        if (safe(resume.education()).isEmpty()) {
            missing.add("Education");
        }
        if (safe(resume.projects()).isEmpty()) {
            missing.add("Projects");
        }
        if (TextLists.clean(resume.skills()).isEmpty()) {
            missing.add("Skills");
        }
        if (safe(resume.certifications()).isEmpty()) {
            missing.add("Certifications");
        }
        if (safe(resume.languages()).isEmpty()) {
            missing.add("Languages");
        }
        return missing;
    }

    private <T> List<T> safe(List<T> values) {
        return values == null ? List.of() : values;
    }
}
