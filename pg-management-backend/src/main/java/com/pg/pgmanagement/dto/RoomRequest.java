package com.pg.pgmanagement.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class RoomRequest {
    @NotBlank
    private String roomNumber;

    @NotNull
    private Long pgId;

    @NotNull
    private Long categoryId;

    @NotNull
    private Double rent;

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Long getPgId() {
        return pgId;
    }

    public void setPgId(Long pgId) {
        this.pgId = pgId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Double getRent() {
        return rent;
    }

    public void setRent(Double rent) {
        this.rent = rent;
    }
}
