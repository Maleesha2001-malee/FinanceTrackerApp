package com.financetracker.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = true)
    private String title;
    
    @Column(nullable = true)
    private String description;
    
    @Column(nullable = true)
    private BigDecimal amount;
    
    @Column(nullable = false)
    private String type; // 'income' or 'expense'
    
    // Add the missing expense field
    @Column(nullable = false)
    private boolean expense;
    
    @Column(nullable = true)
    private String category;
    
    @Column(nullable = true)
    @Temporal(TemporalType.DATE)
    private Date date;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Default constructor
    public Transaction() {
    }
    
    // Constructor with fields
    public Transaction(String title, String description, BigDecimal amount, String type, 
                       String category, Date date, User user) {
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.expense = "expense".equalsIgnoreCase(type); 
        this.category = category;
        this.date = date;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
        this.expense = "expense".equalsIgnoreCase(type); // Update expense when type changes
    }
    
    public boolean isExpense() {
        return expense;
    }
    
    public void setExpense(boolean expense) {
        this.expense = expense;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Date getDate() {
        return date;
    }
    
    public void setDate(Date date) {
        this.date = date;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
}