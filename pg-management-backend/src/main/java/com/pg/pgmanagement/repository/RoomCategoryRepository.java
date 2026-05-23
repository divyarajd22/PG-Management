package com.pg.pgmanagement.repository;

import com.pg.pgmanagement.entity.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoomCategoryRepository extends JpaRepository<RoomCategory, Long> {
    Optional<RoomCategory> findByName(String name);
    Boolean existsByName(String name);
}
