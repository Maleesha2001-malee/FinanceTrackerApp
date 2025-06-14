package com.financetracker.controller;

import com.financetracker.dto.MessageResponse;
import com.financetracker.model.FinancialGoal;
import com.financetracker.model.User;
import com.financetracker.repository.FinancialGoalRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    @Autowired
    private FinancialGoalRepository goalRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @GetMapping
    public ResponseEntity<?> getAllGoals(HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get all goals for this user
            List<FinancialGoal> goals = goalRepository.findByUser(user);
            
            // Important: To avoid circular references, we can detach the user from each goal 
            // before returning them in the response
            goals.forEach(goal -> {
                // Clear the user reference to break the circular reference
                User detachedUser = new User();
                detachedUser.setId(user.getId());
                detachedUser.setUsername(user.getUsername());
                
                // Set this minimal user object without its goals collection
                goal.setUser(detachedUser);
            });
            
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> addGoal(@RequestBody FinancialGoal goal, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Set the user for this goal
            goal.setUser(user);
            
            // Ensure saved field is also set
            if (goal.getSaved() == null) {
                goal.setSaved(goal.getCurrentAmount());
            }
            
            FinancialGoal savedGoal = goalRepository.save(goal);
            
            // Clear the user reference before sending response
            User detachedUser = new User();
            detachedUser.setId(user.getId());
            detachedUser.setUsername(user.getUsername());
            savedGoal.setUser(detachedUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedGoal);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody FinancialGoal goalDetails, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Find and update the goal
            FinancialGoal goal = goalRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            
            // Verify the goal belongs to this user
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Not authorized to update this goal"));
            }
            
            goal.setName(goalDetails.getName());
            goal.setTarget(goalDetails.getTarget());
            goal.setSaved(goalDetails.getSaved());
            goal.setCurrentAmount(goalDetails.getCurrentAmount());
            goal.setDescription(goalDetails.getDescription());
            if (goalDetails.getDeadline() != null) {
                goal.setDeadline(goalDetails.getDeadline());
            }
            
            FinancialGoal updatedGoal = goalRepository.save(goal);
            
            // Clear the user reference before sending response
            User detachedUser = new User();
            detachedUser.setId(user.getId());
            detachedUser.setUsername(user.getUsername());
            updatedGoal.setUser(detachedUser);
            
            return ResponseEntity.ok(updatedGoal);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Find and delete the goal
            FinancialGoal goal = goalRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            
            // Verify the goal belongs to this user
            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Not authorized to delete this goal"));
            }
            
            goalRepository.delete(goal);
            
            return ResponseEntity.ok(new MessageResponse("Goal deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}