package com.elevateresume.backend.jobs;

import com.elevateresume.backend.shared.ApiException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JobDescriptionService {
    private final JobDescriptionRepository jobs;

    public JobDescriptionService(JobDescriptionRepository jobs) {
        this.jobs = jobs;
    }

    @Transactional(readOnly = true)
    public List<JobDescriptionDtos.JobDescriptionResponse> list(UUID userId) {
        return jobs.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public JobDescriptionDtos.JobDescriptionResponse save(UUID userId, JobDescriptionDtos.JobDescriptionRequest request) {
        if (request == null || request.jdText() == null || request.jdText().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "JOB_DESCRIPTION_REQUIRED", "Job description text is required.");
        }

        JobDescriptionEntity entity = new JobDescriptionEntity();
        entity.setUserId(userId);
        entity.setTitle(request.title() == null || request.title().isBlank() ? "Target Role" : request.title().trim());
        entity.setCompany(request.company() == null ? "" : request.company().trim());
        entity.setJdText(request.jdText().trim());
        return toResponse(jobs.save(entity));
    }

    private JobDescriptionDtos.JobDescriptionResponse toResponse(JobDescriptionEntity entity) {
        return new JobDescriptionDtos.JobDescriptionResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getCompany(),
                entity.getJdText(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
