package com.financetracker.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String fullName;
    private String email;
    
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
    
    
}
