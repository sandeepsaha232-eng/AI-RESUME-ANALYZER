package com.elevateresume.backend.jobs;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class JobDescriptionDtos {
    private JobDescriptionDtos() {
    }

    public record JobDescriptionRequest(String title, String company, String jdText) {
    }

    public record JobDescriptionResponse(
            UUID id,
            UUID userId,
            String title,
            String company,
            String jdText,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
