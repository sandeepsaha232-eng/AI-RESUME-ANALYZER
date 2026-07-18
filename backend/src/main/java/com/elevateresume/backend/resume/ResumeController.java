package com.elevateresume.backend.resume;

import com.elevateresume.backend.ai.CareerAiService;
import com.elevateresume.backend.analysis.AnalysisDtos;
import com.elevateresume.backend.analysis.AtsScoringService;
import com.elevateresume.backend.auth.AuthService;
import com.elevateresume.backend.auth.CurrentUser;
import com.elevateresume.backend.shared.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {
    private final AuthService auth;
    private final ResumeService resumes;
    private final ResumeNormalizer normalizer;
    private final ResumeDocumentParser documents;
    private final AtsScoringService scoring;
    private final CareerAiService ai;

    public ResumeController(
            AuthService auth,
            ResumeService resumes,
            ResumeNormalizer normalizer,
            ResumeDocumentParser documents,
            AtsScoringService scoring,
            CareerAiService ai) {
        this.auth = auth;
        this.resumes = resumes;
        this.normalizer = normalizer;
        this.documents = documents;
        this.scoring = scoring;
        this.ai = ai;
    }

    @GetMapping
    public ApiResponses.Data<List<ResumeDtos.Resume>> list(HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        return new ApiResponses.Data<>(resumes.list(user.id()));
    }

    @GetMapping("/{id}")
    public ApiResponses.Data<ResumeDtos.Resume> get(@PathVariable String id, HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        return new ApiResponses.Data<>(resumes.get(user.id(), resumes.parseId(id)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponses.Data<ResumeDtos.Resume> create(
            @RequestBody ResumeDtos.ResumeRequest body,
            HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        return new ApiResponses.Data<>(resumes.save(user.id(), body.resume(), null));
    }

    @PutMapping("/{id}")
    public ApiResponses.Data<ResumeDtos.Resume> update(
            @PathVariable String id,
            @RequestBody ResumeDtos.ResumeRequest body,
            HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        UUID resumeId = resumes.parseId(id);
        return new ApiResponses.Data<>(resumes.save(user.id(), body.resume(), resumeId));
    }

    @DeleteMapping("/{id}")
    public ApiResponses.Message delete(@PathVariable String id, HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        resumes.delete(user.id(), resumes.parseId(id));
        return new ApiResponses.Message("Resume successfully deleted from database records.");
    }

    @PostMapping("/upload")
    public ApiResponses.Data<ResumeDtos.UploadResult> upload(@RequestParam("file") MultipartFile file) {
        String rawText = documents.extractText(file);
        ResumeDtos.Resume parsed = normalizer.normalize(ai.parseResume(rawText), UUID.randomUUID());
        AnalysisDtos.AnalyzerResult base = scoring.calculate(parsed);
        AnalysisDtos.AnalyzerResult enriched = ai.withRecommendations(parsed, base);
        return new ApiResponses.Data<>(new ResumeDtos.UploadResult(parsed, enriched));
    }
}
