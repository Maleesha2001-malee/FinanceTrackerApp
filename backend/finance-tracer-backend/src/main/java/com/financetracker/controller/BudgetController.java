package com.financetracker.controller;

import com.financetracker.dto.MessageResponse;
import com.financetracker.model.Budget;
import com.financetracker.model.User;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @GetMapping
    public ResponseEntity<?> getAllBudgets(HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get all budgets for this user
            List<Budget> budgets = budgetRepository.findByUser(user);
            
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> addBudget(@RequestBody Budget budget, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Set the user for this budget
            budget.setUser(user);
            
            // Set default period if not provided
            if (budget.getPeriod() == null) {
                budget.setPeriod("monthly");
            }
            
            budgetRepository.save(budget);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(budget);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Budget budgetDetails, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Find and update the budget
            Budget budget = budgetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Budget not found"));
            
            // Verify the budget belongs to this user
            if (!budget.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Not authorized to update this budget"));
            }
            
            budget.setCategory(budgetDetails.getCategory());
            budget.setLimit(budgetDetails.getLimit());
            budget.setSpent(budgetDetails.getSpent());
            budget.setPeriod(budgetDetails.getPeriod());
            budget.setDescription(budgetDetails.getDescription());
            
            budgetRepository.save(budget);
            
            return ResponseEntity.ok(budget);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Find and delete the budget
            Budget budget = budgetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Budget not found"));
            
            // Verify the budget belongs to this user
            if (!budget.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Not authorized to delete this budget"));
            }
            
            budgetRepository.delete(budget);
            
            return ResponseEntity.ok(new MessageResponse("Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}