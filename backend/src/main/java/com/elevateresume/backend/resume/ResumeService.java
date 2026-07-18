package com.elevateresume.backend.resume;

import com.elevateresume.backend.analysis.AtsScoringService;
import com.elevateresume.backend.shared.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResumeService {
    private final ResumeRepository resumes;
    private final ResumeVersionRepository versions;
    private final ResumeNormalizer normalizer;
    private final AtsScoringService scoring;
    private final ObjectMapper objectMapper;

    public ResumeService(
            ResumeRepository resumes,
            ResumeVersionRepository versions,
            ResumeNormalizer normalizer,
            AtsScoringService scoring,
            ObjectMapper objectMapper) {
        this.resumes = resumes;
        this.versions = versions;
        this.normalizer = normalizer;
        this.scoring = scoring;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ResumeDtos.Resume> list(UUID userId) {
        return resumes.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(entity -> latestSnapshot(entity)
                        .orElseGet(() -> metadataOnly(entity)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumeDtos.Resume get(UUID userId, UUID resumeId) {
        ResumeEntity entity = resumes.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "Resume was not found."));
        return latestSnapshot(entity)
                .orElseGet(() -> metadataOnly(entity));
    }

    @Transactional
    public ResumeDtos.Resume save(UUID userId, ResumeDtos.Resume incoming, UUID idOverride) {
        if (incoming == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RESUME_REQUIRED", "Resume object is required.");
        }

        UUID resumeId = idOverride == null ? normalizer.uuidOrNew(incoming.id()) : idOverride;
        ResumeDtos.Resume scored = withLatestScore(normalizer.normalize(incoming, resumeId));

        ResumeEntity entity = resumes.findByIdAndUserId(resumeId, userId).orElseGet(ResumeEntity::new);
        entity.setId(resumeId);
        entity.setUserId(userId);
        entity.setTitle(scored.title());
        entity.setSummary(scored.summary());
        entity.setAtsScore(scored.atsScore());
        ResumeEntity saved = resumes.save(entity);

        ResumeVersionEntity version = new ResumeVersionEntity();
        version.setId(UUID.randomUUID());
        version.setResume(saved);
        version.setVersionNumber(versions.latestVersionNumber(resumeId) + 1);
        version.setTitle(scored.title());
        version.setResumeJson(objectMapper.valueToTree(scored));
        versions.save(version);

        return scored;
    }

    @Transactional
    public void delete(UUID userId, UUID resumeId) {
        if (resumes.findByIdAndUserId(resumeId, userId).isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "Resume was not found.");
        }
        resumes.deleteByIdAndUserId(resumeId, userId);
    }

    public UUID parseId(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_RESUME_ID", "Resume id must be a UUID.");
        }
    }

    private ResumeDtos.Resume withLatestScore(ResumeDtos.Resume resume) {
        int score = scoring.calculate(resume).atsScore();
        return new ResumeDtos.Resume(
                resume.id(),
                resume.title(),
                resume.lastEdited(),
                resume.personalInfo(),
                resume.summary(),
                resume.experience(),
                resume.education(),
                resume.projects(),
                resume.skills(),
                resume.certifications(),
                resume.languages(),
                score);
    }

    private java.util.Optional<ResumeDtos.Resume> latestSnapshot(ResumeEntity entity) {
        return versions.findFirstByResume_IdOrderByVersionNumberDesc(entity.getId())
                .map(version -> objectMapper.convertValue(version.getResumeJson(), ResumeDtos.Resume.class));
    }

    private ResumeDtos.Resume metadataOnly(ResumeEntity entity) {
        return new ResumeDtos.Resume(
                entity.getId().toString(),
                entity.getTitle(),
                entity.getUpdatedAt() == null ? null : entity.getUpdatedAt().toString(),
                new ResumeDtos.PersonalInfo("", "", "", "", "", "", "", null),
                entity.getSummary(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                entity.getAtsScore());
    }
}
