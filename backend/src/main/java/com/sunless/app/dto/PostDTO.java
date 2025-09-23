package com.sunless.app.dto;

import com.sunless.app.mode.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String type;
    private String privacy;
    private String imageUrl;
    private String videoUrl;
    private String location;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private boolean isActive;
    private UserDTO author;
    private List<LikeDTO> likes;
    private List<CommentDTO> comments;

    public static PostDTO fromEntity(Post post) {
        if (post == null) return null;
        
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setType(post.getType().toString());
        dto.setPrivacy(post.getPrivacy().toString());
        dto.setImageUrl(post.getImageUrl());
        dto.setVideoUrl(post.getVideoUrl());
        dto.setLocation(post.getLocation());
        dto.setLikeCount(post.getLikeCount());
        dto.setCommentCount(post.getCommentCount());
        dto.setShareCount(post.getShareCount());
        dto.setActive(post.getIsActive());
        
        // Convert author to UserDTO (without posts to avoid circular reference)
        if (post.getUser() != null) {
            dto.setAuthor(UserDTO.fromEntity(post.getUser()));
        }
        
        // Convert likes to LikeDTOs
        if (post.getLikes() != null) {
            dto.setLikes(post.getLikes().stream()
                .map(LikeDTO::fromEntity)
                .collect(Collectors.toList()));
        }
        
        // Convert comments to CommentDTOs
        if (post.getComments() != null) {
            dto.setComments(post.getComments().stream()
                .map(CommentDTO::fromEntity)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
