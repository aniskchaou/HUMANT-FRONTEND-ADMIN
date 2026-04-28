package com.dev.delta.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

 

import lombok.*;
import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @JsonIgnore
    @OneToMany(mappedBy = "role")
    private List<Employee> employees;
}

