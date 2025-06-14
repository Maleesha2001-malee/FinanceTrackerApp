package com.financetracker.dto;

import java.math.BigDecimal;
import java.util.Date;

public class TransactionDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private String type;
    private String category;
    private Date date;

    // Default constructor
    public TransactionDto() {
    }

    // Constructor with fields
    public TransactionDto(Long id, String title, String description, BigDecimal amount, String type, String category, Date date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.date = date;
    }

    // Getters and setters
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
}