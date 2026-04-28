package com.dev.delta.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "workflow_rule_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowRuleDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String targetModule;

    private String triggerEvent;

    private String conditionExpression;

    private String actionExpression;

    private String description;

    private Boolean active;
}