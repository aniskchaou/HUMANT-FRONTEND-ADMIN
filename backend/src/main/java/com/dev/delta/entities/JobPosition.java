package com.dev.delta.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "job_positions")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
public class JobPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String location;

    private boolean open;

    @JsonIgnore
    @OneToMany(mappedBy = "jobPosition")
    private List<Employee> employees;
}
