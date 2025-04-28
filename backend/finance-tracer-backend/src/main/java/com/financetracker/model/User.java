package com.financetracker.model;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column
    private String fullName;
    
    // Bidirectional relationship with Financial Goals
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // This marks User as the parent side of the relationship
    private Set<FinancialGoal> goals = new HashSet<>();
    
    // Default constructor
    public User() {
    }
    
    // Constructor with fields
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    
    // Constructor with full name
    public User(String username, String email, String password, String fullName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }
    
    // Getters and Setters
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Set<FinancialGoal> getGoals() {
        return goals;
    }
    
    public void setGoals(Set<FinancialGoal> goals) {
        this.goals = goals;
    }
    
    // Helper methods for bidirectional relationship management
    public void addGoal(FinancialGoal goal) {
        goals.add(goal);
        goal.setUser(this);
    }
    
    public void removeGoal(FinancialGoal goal) {
        goals.remove(goal);
        goal.setUser(null);
    }
}