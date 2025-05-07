package com.financetracker.security.jwt;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import com.financetracker.security.services.UserDetailsServiceImpl;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Print all headers for debugging
            java.util.Enumeration<String> headerNames = request.getHeaderNames();
            logger.info("Request headers for {}: ", request.getRequestURI());
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                logger.info("{}: {}", headerName, request.getHeader(headerName));
            }
            
            String jwt = parseJwt(request);
            if (jwt != null) {
                logger.info("JWT found in request, validating...");
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    logger.info("Valid JWT token for user: {}", username);
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    logger.info("User loaded: {}, authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("Authentication set in SecurityContext");
                } else {
                    logger.warn("Invalid JWT token");
                }
            } else {
                logger.warn("No JWT token found in request to {}", request.getRequestURI());
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        logger.info("Authorization header: {}", headerAuth);
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            logger.info("Extracted token length: {}", token.length());
            return token;
        }
        return null;
    }
}