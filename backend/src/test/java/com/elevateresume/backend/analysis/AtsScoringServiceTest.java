package com.elevateresume.backend.analysis;

import static org.assertj.core.api.Assertions.assertThat;

import com.elevateresume.backend.resume.ResumeDtos;
import java.util.List;
import org.junit.jupiter.api.Test;

class AtsScoringServiceTest {

    private final AtsScoringService scoring = new AtsScoringService();

    @Test
    void calculatesScoreAndMissingSections() {
        ResumeDtos.Resume resume = new ResumeDtos.Resume(
                "res-1",
                "Backend Engineer Resume",
                "2026-07-16T00:00:00Z",
                new ResumeDtos.PersonalInfo(
                        "Sandeep Saha",
                        "sandeep@example.com",
                        "9999999999",
                        "Bengaluru",
                        "",
                        "",
                        "",
                        null),
                "Backend engineer with Spring Boot and cloud experience.",
                List.of(new ResumeDtos.Experience(
                        "exp-1",
                        "Acme",
                        "Backend Engineer",
                        "Remote",
                        "2024",
                        "Present",
                        true,
                        List.of("Built scalable APIs with Spring Boot.", "Reduced API latency by 30%."))),
                List.of(),
                List.of(),
                List.of("Java", "Spring Boot", "PostgreSQL", "REST"),
                List.of(),
                List.of(),
                0);

        AnalysisDtos.AnalyzerResult result = scoring.calculate(resume);

        assertThat(result.atsScore()).isGreaterThan(50);
        assertThat(result.missingSections()).contains("Education", "Projects");
        assertThat(result.categoryScores().keywords()).isEqualTo(70);
    }
}
