package com.pg.pgmanagement.controller;

import java.util.List;
import javax.validation.Valid;
import com.pg.pgmanagement.dto.AssignRoomRequest;
import com.pg.pgmanagement.dto.MessageResponse;
import com.pg.pgmanagement.dto.RoomRequest;
import com.pg.pgmanagement.entity.PG;
import com.pg.pgmanagement.entity.Role;
import com.pg.pgmanagement.entity.Room;
import com.pg.pgmanagement.entity.RoomCategory;
import com.pg.pgmanagement.entity.User;
import com.pg.pgmanagement.repository.PgRepository;
import com.pg.pgmanagement.repository.RoomCategoryRepository;
import com.pg.pgmanagement.repository.RoomRepository;
import com.pg.pgmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private PgRepository pgRepository;

    @Autowired
    private RoomCategoryRepository roomCategoryRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    // ==========================================
    // PG Management
    // ==========================================
    @GetMapping("/pgs")
    public List<PG> getAllPgs() {
        return pgRepository.findAll();
    }

    @PostMapping("/pgs")
    public ResponseEntity<?> createPg(@Valid @RequestBody PG pg) {
        if (pg.getName() == null || pg.getName().trim().isEmpty() ||
            pg.getLocation() == null || pg.getLocation().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Name and location are required"));
        }
        PG savedPg = pgRepository.save(pg);
        return ResponseEntity.ok(savedPg);
    }

    @DeleteMapping("/pgs/{id}")
    public ResponseEntity<?> deletePg(@PathVariable Long id) {
        if (!pgRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: PG not found"));
        }
        
        // Remove room association for users in rooms of this PG first
        List<Room> pgRooms = roomRepository.findAll();
        for (Room r : pgRooms) {
            if (r.getPg().getId().equals(id)) {
                List<User> users = userRepository.findByRole(Role.ROLE_GUEST);
                for (User u : users) {
                    if (u.getRoom() != null && u.getRoom().getId().equals(r.getId())) {
                        u.setRoom(null);
                        u.setRentPaid(false);
                        userRepository.save(u);
                    }
                }
                roomRepository.delete(r);
            }
        }

        pgRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("PG deleted successfully"));
    }

    // ==========================================
    // Room Category Management
    // ==========================================
    @GetMapping("/categories")
    public List<RoomCategory> getAllCategories() {
        return roomCategoryRepository.findAll();
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@Valid @RequestBody RoomCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Category name is required"));
        }
        if (roomCategoryRepository.existsByName(category.getName())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Category name already exists"));
        }
        RoomCategory savedCategory = roomCategoryRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!roomCategoryRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Category not found"));
        }

        // Remove room association for users in rooms of this Category first
        List<Room> catRooms = roomRepository.findAll();
        for (Room r : catRooms) {
            if (r.getRoomCategory().getId().equals(id)) {
                List<User> users = userRepository.findByRole(Role.ROLE_GUEST);
                for (User u : users) {
                    if (u.getRoom() != null && u.getRoom().getId().equals(r.getId())) {
                        u.setRoom(null);
                        u.setRentPaid(false);
                        userRepository.save(u);
                    }
                }
                roomRepository.delete(r);
            }
        }

        roomCategoryRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Room Category deleted successfully"));
    }

    // ==========================================
    // Room Management
    // ==========================================
    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(@Valid @RequestBody RoomRequest roomRequest) {
        PG pg = pgRepository.findById(roomRequest.getPgId())
                .orElseThrow(() -> new RuntimeException("Error: PG not found"));
        RoomCategory category = roomCategoryRepository.findById(roomRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Error: Room Category not found"));

        if (roomRepository.existsByRoomNumberAndPgId(roomRequest.getRoomNumber(), roomRequest.getPgId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Room number already exists in this PG"));
        }

        Room room = new Room(roomRequest.getRoomNumber(), pg, category, roomRequest.getRent());
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.ok(savedRoom);
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Room not found"));
        }
        
        // Unassign guests assigned to this room
        List<User> users = userRepository.findByRole(Role.ROLE_GUEST);
        for (User u : users) {
            if (u.getRoom() != null && u.getRoom().getId().equals(id)) {
                u.setRoom(null);
                u.setRentPaid(false);
                userRepository.save(u);
            }
        }

        roomRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Room deleted successfully"));
    }

    // ==========================================
    // Member / Guest Management
    // ==========================================
    @GetMapping("/guests")
    public List<User> getAllGuests() {
        return userRepository.findByRole(Role.ROLE_GUEST);
    }

    @PostMapping("/assign-room")
    public ResponseEntity<?> assignRoom(@Valid @RequestBody AssignRoomRequest request) {
        User guest = userRepository.findById(request.getGuestId())
                .orElseThrow(() -> new RuntimeException("Error: Guest not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Error: Room not found"));

        if (guest.getRole() != Role.ROLE_GUEST) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Cannot assign rooms to admin users"));
        }

        guest.setRoom(room);
        userRepository.save(guest);
        return ResponseEntity.ok(new MessageResponse("Room assigned to guest successfully"));
    }

    @PostMapping("/remove-member/{guestId}")
    public ResponseEntity<?> removeMember(@PathVariable Long guestId) {
        User guest = userRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Error: Guest not found"));

        guest.setRoom(null);
        guest.setRentPaid(false);
        userRepository.save(guest);
        return ResponseEntity.ok(new MessageResponse("Member removed from PG room successfully"));
    }

    @PostMapping("/toggle-rent/{guestId}")
    public ResponseEntity<?> toggleRent(@PathVariable Long guestId) {
        User guest = userRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Error: Guest not found"));

        guest.setRentPaid(!guest.getRentPaid());
        User updatedGuest = userRepository.save(guest);
        return ResponseEntity.ok(updatedGuest);
    }
}
