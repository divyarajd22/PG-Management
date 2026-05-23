package com.pg.pgmanagement.entity;

import javax.persistence.*;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "room_number")
    private String roomNumber;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pg_id", nullable = false)
    private PG pg;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private RoomCategory roomCategory;

    @Column(nullable = false)
    private Double rent;

    public Room() {}

    public Room(String roomNumber, PG pg, RoomCategory roomCategory, Double rent) {
        this.roomNumber = roomNumber;
        this.pg = pg;
        this.roomCategory = roomCategory;
        this.rent = rent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public PG getPg() {
        return pg;
    }

    public void setPg(PG pg) {
        this.pg = pg;
    }

    public RoomCategory getRoomCategory() {
        return roomCategory;
    }

    public void setRoomCategory(RoomCategory roomCategory) {
        this.roomCategory = roomCategory;
    }

    public Double getRent() {
        return rent;
    }

    public void setRent(Double rent) {
        this.rent = rent;
    }
}
