package com.pg.pgmanagement.controller;

import com.pg.pgmanagement.entity.User;
import com.pg.pgmanagement.repository.UserRepository;
import com.pg.pgmanagement.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/guest")
@PreAuthorize("hasRole('GUEST')")
public class GuestController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getGuestDashboard(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User guest = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Guest profile not found"));

        return ResponseEntity.ok(guest);
    }
}
