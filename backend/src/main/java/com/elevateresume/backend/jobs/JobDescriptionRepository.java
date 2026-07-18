package com.elevateresume.backend.jobs;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobDescriptionRepository extends JpaRepository<JobDescriptionEntity, UUID> {
    List<JobDescriptionEntity> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
