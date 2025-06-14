package com.financetracker.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "financial_goals")
public class FinancialGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private BigDecimal target;
    
    @Column(nullable = false)
    private BigDecimal saved;
    
    @Column(nullable = false)
    private BigDecimal currentAmount;
    
    @Column
    private String description;
    
    @Column
    private LocalDate deadline;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference // This tells Jackson to stop serialization here and avoid circular reference
    private User user;
    
    // Default constructor
    public FinancialGoal() {
        // Initialize with default values to avoid null pointer exceptions
        this.saved = BigDecimal.ZERO;
        this.currentAmount = BigDecimal.ZERO;
    }
    
    // Constructor with fields
    public FinancialGoal(String name, BigDecimal target, BigDecimal saved, User user) {
        this.name = name;
        this.target = target;
        this.saved = saved;
        this.currentAmount = saved; // Set currentAmount to the same as saved if they're meant to be the same
        this.user = user;
    }
    
    // Alternative constructor that includes currentAmount
    public FinancialGoal(String name, BigDecimal target, BigDecimal saved, BigDecimal currentAmount, User user) {
        this.name = name;
        this.target = target;
        this.saved = saved;
        this.currentAmount = currentAmount;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public BigDecimal getTarget() {
        return target;
    }
    
    public void setTarget(BigDecimal target) {
        this.target = target;
    }
    
    public BigDecimal getSaved() {
        return saved;
    }
    
    public void setSaved(BigDecimal saved) {
        this.saved = saved;
    }
    
    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }
    
    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getDeadline() {
        return deadline;
    }
    
    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }
}