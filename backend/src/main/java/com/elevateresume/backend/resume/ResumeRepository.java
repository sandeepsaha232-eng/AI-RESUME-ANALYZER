package com.elevateresume.backend.resume;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<ResumeEntity, UUID> {
    List<ResumeEntity> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<ResumeEntity> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
