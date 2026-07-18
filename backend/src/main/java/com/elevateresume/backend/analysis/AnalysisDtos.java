package com.elevateresume.backend.analysis;

import com.elevateresume.backend.resume.ResumeDtos;
import java.util.List;

public final class AnalysisDtos {
    private AnalysisDtos() {
    }

    public record CategoryScores(
            int formatting,
            int keywords,
            int readability,
            int grammar,
            int completeness) {
    }

    public record Recommendation(
            String id,
            String category,
            String text,
            String severity,
            String section) {
    }

    public record AnalyzerResult(
            int atsScore,
            CategoryScores categoryScores,
            List<String> missingSections,
            List<Recommendation> recommendations) {
    }

    public record AnalyzeRequest(ResumeDtos.Resume resume) {
    }

    public record SkillGap(String skill, String status) {
    }

    public record JobMatchResult(
            int matchPercentage,
            List<String> missingKeywords,
            List<SkillGap> skillGaps,
            String experienceGapNotes) {
    }

    public record CompareRequest(ResumeDtos.Resume resume, String jdText) {
    }
}
