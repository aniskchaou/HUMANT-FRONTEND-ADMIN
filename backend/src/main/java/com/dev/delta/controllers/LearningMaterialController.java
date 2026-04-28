
package com.dev.delta.controllers;


import com.dev.delta.entities.LearningMaterial;
import com.dev.delta.services.LearningMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-materials")
@Tag(name = "LearningMaterial", description = "Learning material management APIs")
public class LearningMaterialController {
    @Autowired
    private LearningMaterialService learningMaterialService;

    @Operation(summary = "Get all learning materials")
    @GetMapping
    public List<LearningMaterial> getAllLearningMaterials() {
        return learningMaterialService.findAll();
    }

    @Operation(summary = "Get learning material by ID")
    @GetMapping("/{id}")
    public ResponseEntity<LearningMaterial> getLearningMaterialById(@PathVariable Long id) {
        Optional<LearningMaterial> learningMaterial = learningMaterialService.findById(id);
        return learningMaterial.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new learning material")
    @PostMapping
    public LearningMaterial createLearningMaterial(@RequestBody LearningMaterial learningMaterial) {
        return learningMaterialService.save(learningMaterial);
    }

    @Operation(summary = "Update learning material by ID")
    @PutMapping("/{id}")
    public ResponseEntity<LearningMaterial> updateLearningMaterial(@PathVariable Long id, @RequestBody LearningMaterial learningMaterialDetails) {
        Optional<LearningMaterial> learningMaterialOptional = learningMaterialService.findById(id);
        if (!learningMaterialOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        LearningMaterial learningMaterial = learningMaterialOptional.get();

        LearningMaterial updated = learningMaterialService.save(learningMaterialDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete learning material by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningMaterial(@PathVariable Long id) {
        if (!learningMaterialService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        learningMaterialService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
