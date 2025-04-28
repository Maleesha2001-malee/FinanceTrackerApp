package com.financetracker.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.financetracker.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by their username
     * @param username The username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find a user by their email
     * @param email The email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a username already exists
     * @param username The username to check
     * @return true if the username exists, false otherwise
     */
    Boolean existsByUsername(String username);
    
    /**
     * Check if an email already exists
     * @param email The email to check
     * @return true if the email exists, false otherwise
     */
    Boolean existsByEmail(String email);
}