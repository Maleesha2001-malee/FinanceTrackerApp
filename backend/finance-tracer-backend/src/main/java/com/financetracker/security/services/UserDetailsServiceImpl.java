package com.financetracker.security.services;

import com.financetracker.model.User;
import com.financetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        System.out.println("Loading user by username/email: " + usernameOrEmail);
        
        // First try to find by username
        User user = userRepository.findByUsername(usernameOrEmail)
            .orElse(null);

        // If not found by username, try email
        if (user == null) {
            System.out.println("User not found by username, trying email");
            user = userRepository.findByEmail(usernameOrEmail)
                .orElseThrow(() -> {
                    System.out.println("User not found with username or email: " + usernameOrEmail);
                    return new UsernameNotFoundException("User Not Found with username or email: " + usernameOrEmail);
                });
            System.out.println("User found by email: " + user.getUsername());
        } else {
            System.out.println("User found by username: " + user.getUsername());
        }

        return UserDetailsImpl.build(user);
    }
}