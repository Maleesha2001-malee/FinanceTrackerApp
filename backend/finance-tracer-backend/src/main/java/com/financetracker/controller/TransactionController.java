package com.financetracker.controller;

import com.financetracker.dto.MessageResponse;
import com.financetracker.dto.TransactionDto;
import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @GetMapping
    public ResponseEntity<?> getAllTransactions(HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get all transactions for this user
            List<Transaction> transactions = transactionRepository.findByUserOrderByDateDesc(user);
            
            // Map to DTOs
            List<TransactionDto> transactionDtos = transactions.stream()
                    .map(t -> new TransactionDto(
                            t.getId(),
                            t.getTitle(),
                            t.getDescription(),
                            t.getAmount(),
                            t.getType(),
                            t.getCategory(),
                            t.getDate()))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(transactionDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> addTransaction(@RequestBody TransactionDto transactionDto, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create new transaction
            Transaction transaction = new Transaction(
                    transactionDto.getTitle(),
                    transactionDto.getDescription(),
                    transactionDto.getAmount(),
                    transactionDto.getType(),
                    transactionDto.getCategory(),
                    transactionDto.getDate() != null ? transactionDto.getDate() : new Date(),
                    user
            );
            
            transactionRepository.save(transaction);
            
            // Return the created transaction with ID
            transactionDto.setId(transaction.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(transactionDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody TransactionDto transactionDto, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify the transaction belongs to this user and update it
            Transaction transaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));
            
            if (!transaction.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Not authorized to update this transaction"));
            }
            
            // Update transaction fields
            transaction.setTitle(transactionDto.getTitle());
            transaction.setDescription(transactionDto.getDescription());
            transaction.setAmount(transactionDto.getAmount());
            transaction.setType(transactionDto.getType());
            transaction.setCategory(transactionDto.getCategory());
            transaction.setDate(transactionDto.getDate());
            
            transactionRepository.save(transaction);
            
            // Return the updated transaction
            transactionDto.setId(transaction.getId());
            return ResponseEntity.ok(transactionDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Get current user from JWT token
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify the transaction belongs to this user and delete it
            Transaction transaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));
            
            if (!transaction.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Not authorized to delete this transaction"));
            }
            
            transactionRepository.delete(transaction);
            return ResponseEntity.ok(new MessageResponse("Transaction deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}