package com.pg.pgmanagement.repository;

import com.pg.pgmanagement.entity.Room;
import com.pg.pgmanagement.entity.PG;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByPg(PG pg);
    Boolean existsByRoomNumberAndPgId(String roomNumber, Long pgId);
}
