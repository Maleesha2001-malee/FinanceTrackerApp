package com.financetracker.dto;

public class NotificationSettingsRequest {
    private boolean emailNotifications;
    private boolean budgetAlerts;
    private boolean goalProgress;
    private boolean weeklySummary;
    
    // Getters and Setters
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
