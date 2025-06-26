package com.financetracker.controller;

import com.financetracker.model.User;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtUtils;
import com.financetracker.security.services.UserDetailsImpl;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;

import com.financetracker.dto.LoginRequest;
import com.financetracker.dto.MessageResponse;
import com.financetracker.dto.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        
        System.out.println("Login request received with username: " + usernameOrEmail);
        System.out.println("Login request received with email: " + loginRequest.getEmail());
        
        
        if (usernameOrEmail == null || usernameOrEmail.isEmpty()) {
            usernameOrEmail = loginRequest.getEmail();
            System.out.println("Using email as username: " + usernameOrEmail);
        }
        
        
        System.out.println("Login attempt with principal: " + usernameOrEmail);
        
        try {
            User user = userRepository.findByUsername(usernameOrEmail).orElse(null);
            
            if (user == null) {
                System.out.println("User not found by username, trying email...");
                user = userRepository.findByEmail(usernameOrEmail).orElse(null);
                
                if (user == null) {
                    System.out.println("User not found by email either");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Error: Invalid credentials"));
                }
                
                usernameOrEmail = user.getUsername();
                System.out.println("Found user by email, using username: " + usernameOrEmail);
            }
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, password));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", userDetails.getId());
            userData.put("username", userDetails.getUsername());
            userData.put("email", userDetails.getEmail());
            userData.put("fullName", user.getFullName()); 
            userData.put("roles", roles);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userData);
            
            System.out.println("Authentication successful for user: " + userDetails.getUsername());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Authentication exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        String username = signUpRequest.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = signUpRequest.getFullName();
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is required!"));
            }
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(
            username,
            signUpRequest.getEmail(),
            encoder.encode(signUpRequest.getPassword())
        );
        
        // Set the full name
        user.setFullName(signUpRequest.getFullName());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
    
 
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameExists(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader == null) {
            response.put("error", "Missing Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        response.put("authHeader", authHeader);
        
        if (!authHeader.startsWith("Bearer ")) {
            response.put("error", "Authorization header does not start with Bearer");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        String token = authHeader.substring(7);
        response.put("tokenLength", token.length());
        response.put("tokenStart", token.substring(0, Math.min(token.length(), 20)) + "...");
        
        try {
            boolean isValid = jwtUtils.validateJwtToken(token);
            response.put("tokenValid", isValid);
            
            if (isValid) {
                String username = jwtUtils.getUserNameFromJwtToken(token);
                response.put("username", username);
                
                User user = userRepository.findByUsername(username).orElse(null);
                response.put("userExists", user != null);
                
                if (user != null) {
                    response.put("userId", user.getId());
                    response.put("userEmail", user.getEmail());
                    response.put("userFullName", user.getFullName());
                }
                
                try {
                    Claims claims = jwtUtils.getAllClaimsFromToken(token);
                    response.put("issueDate", claims.getIssuedAt());
                    response.put("expirationDate", claims.getExpiration());
                    response.put("isExpired", claims.getExpiration().before(new Date()));
                    
                    // Add any custom claims
                    if (claims.get("userId") != null) {
                        response.put("userIdFromClaim", claims.get("userId"));
                    }
                } catch (Exception e) {
                    response.put("claimsError", e.getMessage());
                }
            }
        } catch (Exception e) {
            response.put("validationError", e.getMessage());
            response.put("errorType", e.getClass().getName());
            response.put("errorStackTrace", Arrays.toString(e.getStackTrace()));
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(HttpServletRequest request) {
        try {
            
            String headerAuth = request.getHeader("Authorization");
            
            if (headerAuth == null || !headerAuth.startsWith("Bearer ")) {
                System.out.println("Invalid or missing Authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Authorization header missing or invalid format"));
            }
            
            String token = headerAuth.substring(7);
            
            if (!jwtUtils.validateJwtToken(token)) {
                System.out.println("Token validation failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid authentication token"));
            }
            
            String username = jwtUtils.getUserNameFromJwtToken(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow();
            
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Authentication error: " + e.getMessage()));
        }
    }
}
