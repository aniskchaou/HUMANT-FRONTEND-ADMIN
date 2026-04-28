
package com.dev.delta.controllers;


import com.dev.delta.entities.Team;
import com.dev.delta.services.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin
@Tag(name = "Team", description = "Team management APIs")
public class TeamController {
    @Autowired
    private TeamService teamService;

    @Operation(summary = "Get all teams")
    @GetMapping
    public List<Team> getAllTeams() {
        return teamService.findAll();
    }

    @Operation(summary = "Get team by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        Optional<Team> team = teamService.findById(id);
        return team.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new team")
    @PostMapping
    public Team createTeam(@RequestBody Team team) {
        return teamService.save(team);
    }

    @Operation(summary = "Update team by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable Long id, @RequestBody Team teamDetails) {
        Optional<Team> teamOptional = teamService.findById(id);
        if (!teamOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Team team = teamOptional.get();

		team.setName(teamDetails.getName());
		team.setDescription(teamDetails.getDescription());
		team.setManager(teamDetails.getManager());
		team.setMembers(teamDetails.getMembers());

		Team updated = teamService.save(team);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete team by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        if (!teamService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        teamService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
