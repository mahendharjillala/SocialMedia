package com.sunless.app.dto;

import com.sunless.app.mode.Like;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeDTO {
    private Long id;
    private UserDTO user;
    private LocalDateTime createdAt;

    public static LikeDTO fromEntity(Like like) {
        if (like == null) return null;
        
        LikeDTO dto = new LikeDTO();
        dto.setId(like.getId());
        dto.setUser(UserDTO.fromEntity(like.getUser()));
        dto.setCreatedAt(like.getCreatedAt());
        
        return dto;
    }
}

