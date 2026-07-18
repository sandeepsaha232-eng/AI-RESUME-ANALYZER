package com.elevateresume.backend.ai;

import com.elevateresume.backend.analysis.AnalysisDtos;
import com.elevateresume.backend.shared.ApiException;
import com.elevateresume.backend.shared.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AiController {
    private final CareerAiService ai;

    public AiController(CareerAiService ai) {
        this.ai = ai;
    }

    @PostMapping("/compare")
    public ApiResponses.Data<AnalysisDtos.JobMatchResult> compare(@RequestBody AnalysisDtos.CompareRequest request) {
        if (request == null || request.resume() == null || request.jdText() == null || request.jdText().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "COMPARE_INPUTS_REQUIRED", "Resume and job description text are required.");
        }
        return new ApiResponses.Data<>(ai.compare(request.resume(), request.jdText()));
    }

    @PostMapping("/improve")
    public ApiResponses.Suggestion improve(@RequestBody AiDtos.ImproveRequest request) {
        if (request == null || request.bullet() == null || request.bullet().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "BULLET_REQUIRED", "Bullet text is required.");
        }
        return new ApiResponses.Suggestion(ai.improveBullet(request.bullet(), request.action(), request.title()));
    }

    @PostMapping("/generate-summary")
    public ApiResponses.Suggestion generateSummary(@RequestBody AiDtos.SummaryRequest request) {
        if (request == null || request.resume() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RESUME_REQUIRED", "Resume object is required.");
        }
        return new ApiResponses.Suggestion(ai.generateSummary(request.resume()));
    }

    @PostMapping("/generate-cover-letter")
    public ApiResponses.Suggestion generateCoverLetter(@RequestBody AiDtos.CoverLetterRequest request) {
        if (request == null || request.resume() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RESUME_REQUIRED", "Resume object is required.");
        }
        return new ApiResponses.Suggestion(ai.generateCoverLetter(
                request.resume(),
                request.company(),
                request.role(),
                request.jdText()));
    }
}
