package com.dev.delta.controllers;

import com.dev.delta.entities.Pipeline;
import com.dev.delta.entities.Pipeline.PipelineStage;
import com.dev.delta.services.PipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pipelines")
@Tag(name = "Pipeline", description = "Recruitment pipeline management APIs")
public class PipelineController {

    @Autowired
    private PipelineService pipelineService;

    @Operation(summary = "Get all pipeline entries")
    @GetMapping
    public List<Pipeline> getAll() {
        return pipelineService.findAll();
    }

    @Operation(summary = "Get pipeline entries by stage")
    @GetMapping("/stage/{stage}")
    public List<Pipeline> getByStage(@PathVariable PipelineStage stage) {
        return pipelineService.findByStage(stage);
    }

    @Operation(summary = "Get pipeline entries for a candidate")
    @GetMapping("/candidate/{candidateId}")
    public List<Pipeline> getByCandidate(@PathVariable Long candidateId) {
        return pipelineService.findByCandidateId(candidateId);
    }

    @Operation(summary = "Create pipeline entry")
    @PostMapping
    public Pipeline create(@RequestBody Pipeline pipeline) {
        return pipelineService.save(pipeline);
    }

    @Operation(summary = "Move candidate to a different stage")
    @PatchMapping("/{id}/stage")
    public ResponseEntity<Pipeline> moveStage(@PathVariable Long id,
                                               @RequestParam("stage") PipelineStage stage) {
        Optional<Pipeline> opt = pipelineService.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Pipeline pipeline = opt.get();
        pipeline.setStage(stage);
        return ResponseEntity.ok(pipelineService.save(pipeline));
    }

    @Operation(summary = "Update pipeline entry")
    @PutMapping("/{id}")
    public ResponseEntity<Pipeline> update(@PathVariable Long id, @RequestBody Pipeline details) {
        Optional<Pipeline> opt = pipelineService.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        details.setId(id);
        return ResponseEntity.ok(pipelineService.save(details));
    }

    @Operation(summary = "Delete pipeline entry")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!pipelineService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        pipelineService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
