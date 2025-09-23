package com.sunless.app.dto;

import com.sunless.app.mode.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private String coverPictureUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String role;
    private boolean isActive;
    private boolean isVerified;

    public static UserDTO fromEntity(User user) {
        if (user == null) return null;
        
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setBio(user.getBio());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setCoverPictureUrl(user.getCoverPictureUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setRole(user.getRole().toString());
        dto.setActive(user.getIsActive());
        dto.setVerified(user.getIsVerified());
        
        return dto;
    }
}
