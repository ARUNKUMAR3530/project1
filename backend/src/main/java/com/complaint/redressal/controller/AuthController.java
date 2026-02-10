package com.complaint.redressal.controller;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.User;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.UserRepository;
import com.complaint.redressal.security.JwtUtils;
import com.complaint.redressal.service.UserService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final UserRepository userRepository; // For simple lookup, use service in prod
    private final AdminRepository adminRepository;

    public AuthController(AuthenticationManager authenticationManager, UserDetailsService userDetailsService, JwtUtils jwtUtils, UserService userService, UserRepository userRepository, AdminRepository adminRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (Exception e) {
            throw new Exception("Incorrect username or password", e);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());

        String role = "USER";
        // Check if admin to assign role
        Optional<Admin> admin = adminRepository.findByUsername(authenticationRequest.getUsername());
        if(admin.isPresent()) {
            role = "ADMIN";
        }

        final String jwt = jwtUtils.generateToken(userDetails, role);

        return ResponseEntity.ok(new AuthenticationResponse(jwt, role));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> createAdminAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws Exception {
        // Reuse same logic but verify admin role strictly if needed
        return createAuthenticationToken(authenticationRequest);
    }
}

@Data
class AuthenticationRequest {
    private String username;
    private String password;
}

@Data
class AuthenticationResponse {
    private final String jwt;
    private final String role;
}
