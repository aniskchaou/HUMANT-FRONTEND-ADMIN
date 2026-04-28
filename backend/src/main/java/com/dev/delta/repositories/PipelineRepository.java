package com.dev.delta.repositories;

import com.dev.delta.entities.Pipeline;
import com.dev.delta.entities.Pipeline.PipelineStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipelineRepository extends JpaRepository<Pipeline, Long> {
    List<Pipeline> findByStage(PipelineStage stage);
    List<Pipeline> findByCandidateId(Long candidateId);
}
