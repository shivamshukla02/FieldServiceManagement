package com.FieldServiceManagement.controller;

import com.FieldServiceManagement.domain.Organization;
import com.FieldServiceManagement.domain.User;
import com.FieldServiceManagement.dto.LoginRequest;
import com.FieldServiceManagement.dto.LoginResponse;
import com.FieldServiceManagement.dto.RegisterRequest;
import com.FieldServiceManagement.repository.UserRepository;
import com.FieldServiceManagement.security.JwtUtil;
import com.FieldServiceManagement.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationService organizationService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          JwtUtil jwtUtil,
                          PasswordEncoder passwordEncoder,
                          OrganizationService organizationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.organizationService = organizationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        List<String> validRoles = List.of("DISPATCHER", "TECHNICIAN", "MANAGER", "CUSTOMER");
        if (!validRoles.contains(request.getRole().toUpperCase())) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        Organization org = null;

        if (request.getRole().equalsIgnoreCase("MANAGER")) {
            if (request.getOrganizationName() == null || request.getOrganizationName().isBlank()) {
                return ResponseEntity.badRequest().body("Managers must provide an organization name");
            }
            org = organizationService.createOrganization(request.getOrganizationName());
        } else if (!request.getRole().equalsIgnoreCase("CUSTOMER")) {
            if (request.getInviteCode() == null || request.getInviteCode().isBlank()) {
                return ResponseEntity.badRequest().body("Please provide an invite code to join your team");
            }
            try {
                org = organizationService.findByInviteCode(request.getInviteCode());
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body("Invalid invite code");
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().toUpperCase());
        user.setOrganization(org);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(buildLoginResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(buildLoginResponse(token, user));
    }

    private LoginResponse buildLoginResponse(String token, User user) {
        Organization org = user.getOrganization();
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole(),
                org != null ? org.getId() : null,
                org != null ? org.getName() : null,
                org != null && user.getRole().equals("MANAGER") ? org.getInviteCode() : null
        );
    }
}