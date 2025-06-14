package com.financetracker;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Base64;

public class JwtSecretGenerator {
    public static void main(String[] args) {
        // Generate a secure key
        var key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String newSecretKey = Base64.getEncoder().encodeToString(key.getEncoded());
        System.out.println("New JWT Secret: " + newSecretKey);
    }
}