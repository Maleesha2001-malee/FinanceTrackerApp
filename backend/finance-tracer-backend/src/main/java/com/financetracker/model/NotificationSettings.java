package com.financetracker.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class NotificationSettings {
    private boolean emailNotifications = true;
    private boolean budgetAlerts = true;
    private boolean goalProgress = true;
    private boolean weeklySummary = false;
    

    public boolean isEmailNotifications() {
        return emailNotifications;
    }
    
    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }
    
    public boolean isBudgetAlerts() {
        return budgetAlerts;
    }
    
    public void setBudgetAlerts(boolean budgetAlerts) {
        this.budgetAlerts = budgetAlerts;
    }
    
    public boolean isGoalProgress() {
        return goalProgress;
    }
    
    public void setGoalProgress(boolean goalProgress) {
        this.goalProgress = goalProgress;
    }
    
    public boolean isWeeklySummary() {
        return weeklySummary;
    }
    
    public void setWeeklySummary(boolean weeklySummary) {
        this.weeklySummary = weeklySummary;
    }
}