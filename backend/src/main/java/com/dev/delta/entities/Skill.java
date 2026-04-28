package com.dev.delta.entities;

 

import lombok.*;
import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String proficiencyLevel; // e.g., Beginner, Intermediate, Expert

    @ManyToMany(mappedBy = "skills")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Employee> employees;
}



