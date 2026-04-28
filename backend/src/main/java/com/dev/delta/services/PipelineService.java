package com.dev.delta.services;

import com.dev.delta.entities.Pipeline;
import com.dev.delta.entities.Pipeline.PipelineStage;
import com.dev.delta.repositories.PipelineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PipelineService {
    @Autowired
    private PipelineRepository pipelineRepository;

    public List<Pipeline> findAll() {
        return pipelineRepository.findAll();
    }

    public Optional<Pipeline> findById(Long id) {
        return pipelineRepository.findById(id);
    }

    public List<Pipeline> findByStage(PipelineStage stage) {
        return pipelineRepository.findByStage(stage);
    }

    public List<Pipeline> findByCandidateId(Long candidateId) {
        return pipelineRepository.findByCandidateId(candidateId);
    }

    public Pipeline save(Pipeline pipeline) {
        return pipelineRepository.save(pipeline);
    }

    public void deleteById(Long id) {
        pipelineRepository.deleteById(id);
    }
}
