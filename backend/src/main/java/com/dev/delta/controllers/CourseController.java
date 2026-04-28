
package com.dev.delta.controllers;


import com.dev.delta.entities.Course;
import com.dev.delta.services.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@Tag(name = "Course", description = "Course management APIs")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @Operation(summary = "Get all courses")
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }

    @Operation(summary = "Get course by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Optional<Course> course = courseService.findById(id);
        return course.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new course")
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.save(course);
    }

    @Operation(summary = "Update course by ID")
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        Optional<Course> courseOptional = courseService.findById(id);
        if (!courseOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Course course = courseOptional.get();

        Course updated = courseService.save(courseDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete course by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        if (!courseService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        courseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
