package com.elevateresume.backend.ai;

import com.elevateresume.backend.resume.ResumeDtos;

public final class AiDtos {
    private AiDtos() {
    }

    public record ImproveRequest(String bullet, String action, String title) {
    }

    public record SummaryRequest(ResumeDtos.Resume resume) {
    }

    public record CoverLetterRequest(ResumeDtos.Resume resume, String company, String role, String jdText) {
    }
}
