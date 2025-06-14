package com.financetracker.controller;

import com.financetracker.dto.MessageResponse;
import com.financetracker.dto.NotificationSettingsRequest;
import com.financetracker.dto.PasswordUpdateRequest;
import com.financetracker.dto.UserPreferencesRequest;
import com.financetracker.dto.UserProfileRequest;
import com.financetracker.model.NotificationSettings;
import com.financetracker.model.User;
import com.financetracker.model.UserPreferences;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserPreferencesRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtUtils;
import com.financetracker.security.services.UserDetailsImpl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserPreferencesRepository preferencesRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    // Get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    // Update user profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileRequest profileRequest) {
        try {
            User currentUser = getCurrentUser();
            
            // Update fields
            if (profileRequest.getFullName() != null && !profileRequest.getFullName().isEmpty()) {
                currentUser.setFullName(profileRequest.getFullName());
            }
            
            // For email, verify it's not already taken by another user
            if (profileRequest.getEmail() != null && !profileRequest.getEmail().isEmpty() 
                    && !profileRequest.getEmail().equals(currentUser.getEmail())) {
                
                if (userRepository.existsByEmail(profileRequest.getEmail())) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Error: Email is already in use!"));
                }
                
                currentUser.setEmail(profileRequest.getEmail());
            }
            
            userRepository.save(currentUser);
            
            return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating profile: " + e.getMessage()));
        }
    }
    
    // Get user preferences
    @GetMapping("/preferences")
    public ResponseEntity<?> getUserPreferences() {
        try {
            User currentUser = getCurrentUser();
            
            // Find or create preferences
            UserPreferences preferences = preferencesRepository.findByUserId(currentUser.getId())
                    .orElseGet(() -> {
                        UserPreferences newPrefs = new UserPreferences(currentUser);
                        return preferencesRepository.save(newPrefs);
                    });
            
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching preferences: " + e.getMessage()));
        }
    }
    
    // Update user preferences
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@Valid @RequestBody UserPreferencesRequest preferencesRequest) {
        try {
            User currentUser = getCurrentUser();
            
            // Find or create preferences
            UserPreferences preferences = preferencesRepository.findByUserId(currentUser.getId())
                    .orElseGet(() -> new UserPreferences(currentUser));
            
            // Update fields if provided
            if (preferencesRequest.getCurrency() != null) {
                preferences.setCurrency(preferencesRequest.getCurrency());
            }
            
            if (preferencesRequest.getDateFormat() != null) {
                preferences.setDateFormat(preferencesRequest.getDateFormat());
            }
            
            if (preferencesRequest.getTheme() != null) {
                preferences.setTheme(preferencesRequest.getTheme());
            }
            
            if (preferencesRequest.getColorTheme() != null) {
                preferences.setColorTheme(preferencesRequest.getColorTheme());
            }
            
            preferencesRepository.save(preferences);
            
            return ResponseEntity.ok(new MessageResponse("Preferences updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating preferences: " + e.getMessage()));
        }
    }
    
    // Update notification settings
    @PutMapping("/notifications")
    public ResponseEntity<?> updateNotificationSettings(@Valid @RequestBody NotificationSettingsRequest notificationRequest) {
        try {
            User currentUser = getCurrentUser();
            
            // Find or create preferences
            UserPreferences preferences = preferencesRepository.findByUserId(currentUser.getId())
                    .orElseGet(() -> new UserPreferences(currentUser));
            
            // Create notification settings if not exists
            NotificationSettings notificationSettings = new NotificationSettings();
            
            // Update notification settings
            notificationSettings.setEmailNotifications(notificationRequest.isEmailNotifications());
            notificationSettings.setBudgetAlerts(notificationRequest.isBudgetAlerts());
            notificationSettings.setGoalProgress(notificationRequest.isGoalProgress());
            notificationSettings.setWeeklySummary(notificationRequest.isWeeklySummary());
            
            // Set notification settings to preferences
            preferences.setNotificationSettings(notificationSettings);
            
            preferencesRepository.save(preferences);
            
            return ResponseEntity.ok(new MessageResponse("Notification settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating notification settings: " + e.getMessage()));
        }
    }
    
    // Update password
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody PasswordUpdateRequest passwordRequest) {
        try {
            User currentUser = getCurrentUser();
            
            // Verify current password
            if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), currentUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Error: Current password is incorrect"));
            }
            
            // Update to new password
            currentUser.setPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
            userRepository.save(currentUser);
            
            return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating password: " + e.getMessage()));
        }
    }
    
    // Delete user account
    @DeleteMapping("/delete-account")
    @Transactional
    public ResponseEntity<?> deleteAccount() {
        try {
            User currentUser = getCurrentUser();
            
            // Delete all transactions for this user first
            transactionRepository.deleteByUser(currentUser);
            
            // Delete user preferences
            preferencesRepository.findByUserId(currentUser.getId())
                    .ifPresent(preferences -> preferencesRepository.delete(preferences));
            
            // Delete the user account
            userRepository.delete(currentUser);
            
            return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting account: " + e.getMessage()));
        }
    }
    
 // Get user profile
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            User currentUser = getCurrentUser();
            
            // Create a response object with only the data we need
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("fullName", currentUser.getFullName());
            profileData.put("email", currentUser.getEmail());
            profileData.put("username", currentUser.getUsername());
            
            return ResponseEntity.ok(profileData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching profile: " + e.getMessage()));
        }
    }
}