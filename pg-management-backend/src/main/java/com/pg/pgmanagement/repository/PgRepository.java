package com.pg.pgmanagement.repository;

import com.pg.pgmanagement.entity.PG;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PgRepository extends JpaRepository<PG, Long> {
}
