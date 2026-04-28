
package com.dev.delta.controllers;


import com.dev.delta.entities.Skill;
import com.dev.delta.services.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/skills")
@Tag(name = "Skill", description = "Skill management APIs")
public class SkillController {
    @Autowired
    private SkillService skillService;

    @Operation(summary = "Get all skills")
    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.findAll();
    }

    @Operation(summary = "Get skill by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(@PathVariable Long id) {
        Optional<Skill> skill = skillService.findById(id);
        return skill.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new skill")
    @PostMapping
    public Skill createSkill(@RequestBody Skill skill) {
        return skillService.save(skill);
    }

    @Operation(summary = "Update skill by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Skill> updateSkill(@PathVariable Long id, @RequestBody Skill skillDetails) {
        Optional<Skill> skillOptional = skillService.findById(id);
        if (!skillOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Skill skill = skillOptional.get();

        Skill updated = skillService.save(skillDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete skill by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        if (!skillService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        skillService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
