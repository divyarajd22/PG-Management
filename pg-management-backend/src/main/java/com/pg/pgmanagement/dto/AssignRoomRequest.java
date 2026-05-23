package com.pg.pgmanagement.dto;

import javax.validation.constraints.NotNull;

public class AssignRoomRequest {
    @NotNull
    private Long guestId;

    @NotNull
    private Long roomId;

    public Long getGuestId() {
        return guestId;
    }

    public void setGuestId(Long guestId) {
        this.guestId = guestId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
}
