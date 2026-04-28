package com.dev.delta.repositories;

import com.dev.delta.entities.Document;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByOrderByUploadedAtDescIdDesc();

    Optional<Document> findTopByVersionGroupOrderByVersionNumberDesc(String versionGroup);

    List<Document> findAllByVersionGroupOrderByVersionNumberDesc(String versionGroup);
}
