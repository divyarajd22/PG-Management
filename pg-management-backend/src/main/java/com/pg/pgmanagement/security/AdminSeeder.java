package com.pg.pgmanagement.security;

import com.pg.pgmanagement.entity.Role;
import com.pg.pgmanagement.entity.User;
import com.pg.pgmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${pg.admin.email}")
    private String adminEmail;

    @Value("${pg.admin.password}")
    private String adminPassword;

    @Value("${pg.admin.name}")
    private String adminName;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    adminName,
                    "9999999999",
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            logger.info("Admin user successfully seeded to the database: {}", adminEmail);
        } else {
            User admin = userRepository.findByEmail(adminEmail).get();
            admin.setName(adminName);
            admin.setRole(Role.ROLE_ADMIN);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
            logger.info("Admin user credentials updated/verified: {}", adminEmail);
        }
    }
}
