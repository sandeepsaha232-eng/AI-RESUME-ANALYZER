package com.elevateresume.backend.resume;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResumeVersionRepository extends JpaRepository<ResumeVersionEntity, UUID> {
    Optional<ResumeVersionEntity> findFirstByResume_IdOrderByVersionNumberDesc(UUID resumeId);

    @Query("select coalesce(max(v.versionNumber), 0) from ResumeVersionEntity v where v.resume.id = :resumeId")
    int latestVersionNumber(@Param("resumeId") UUID resumeId);
}
