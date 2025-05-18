package com.financetracker.model;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false, name= "`limit`")
    private Double limit;
    
    @Column(nullable = false)
    private BigDecimal spent;
    
    @Column(nullable = false)
    private String period = "monthly"; // Default value is monthly
    
    @Column
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Default constructor
    public Budget() {
    }
    
    // Constructor with fields
    public Budget(String category, Double limit, BigDecimal spent, String period, String description, User user) {
        this.category = category;
        this.limit = limit;
        this.spent = spent;
        this.period = period;
        this.description = description;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Double getLimit() {
        return limit;
    }
    
    public void setLimit(Double limit) {
        this.limit = limit;
    }
    
    public BigDecimal getSpent() {
        return spent;
    }
    
    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
}