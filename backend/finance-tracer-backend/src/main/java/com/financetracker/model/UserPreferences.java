package com.financetracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_preferences")
@Data
public class UserPreferences {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String currency = "USD ($)";
    private String dateFormat = "MM/DD/YYYY";
    private String theme = "light";
    private String colorTheme = "blue";
    
    @Embedded
    private NotificationSettings notificationSettings = new NotificationSettings();

    public UserPreferences() {
    }

    public UserPreferences(User user) {
        this.user = user;
    }

    

    public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public String getDateFormat() {
		return dateFormat;
	}

	public void setDateFormat(String dateFormat) {
		this.dateFormat = dateFormat;
	}

	public String getTheme() {
		return theme;
	}

	public void setTheme(String theme) {
		this.theme = theme;
	}

	public String getColorTheme() {
		return colorTheme;
	}

	public void setColorTheme(String colorTheme) {
		this.colorTheme = colorTheme;
	}

	public NotificationSettings getNotificationSettings() {
        return notificationSettings;
    }

    public void setNotificationSettings(NotificationSettings notificationSettings) {
        this.notificationSettings = notificationSettings;
    }
}