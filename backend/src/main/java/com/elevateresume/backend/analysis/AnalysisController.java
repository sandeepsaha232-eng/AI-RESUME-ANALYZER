package com.elevateresume.backend.analysis;

import com.elevateresume.backend.ai.CareerAiService;
import com.elevateresume.backend.shared.ApiException;
import com.elevateresume.backend.shared.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analyze")
public class AnalysisController {
    private final AtsScoringService scoring;
    private final CareerAiService ai;

    public AnalysisController(AtsScoringService scoring, CareerAiService ai) {
        this.scoring = scoring;
        this.ai = ai;
    }

    @PostMapping
    public ApiResponses.Data<AnalysisDtos.AnalyzerResult> analyze(@RequestBody AnalysisDtos.AnalyzeRequest request) {
        if (request == null || request.resume() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RESUME_REQUIRED", "Resume object is required.");
        }
        AnalysisDtos.AnalyzerResult base = scoring.calculate(request.resume());
        return new ApiResponses.Data<>(ai.withRecommendations(request.resume(), base));
    }
}
