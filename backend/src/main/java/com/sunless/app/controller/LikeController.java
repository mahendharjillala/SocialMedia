package com.sunless.app.controller;

import com.sunless.app.mode.User;
import com.sunless.app.service.LikeService;
import com.sunless.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/like")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @Autowired
    private UserService userService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<?> likePost(@PathVariable Long postId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean liked = likeService.likePost(currentUser.getId(), postId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "success", liked,
                "likeCount", likeService.getLikeCount(postId)
            ));
            response.put("message", liked ? "Post liked successfully" : "Already liked this post");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<?> unlikePost(@PathVariable Long postId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean unliked = likeService.unlikePost(currentUser.getId(), postId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "success", unliked,
                "likeCount", likeService.getLikeCount(postId)
            ));
            response.put("message", "Post unliked successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/post/{postId}/status")
    public ResponseEntity<?> getLikeStatus(@PathVariable Long postId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean isLiked = likeService.isLiked(currentUser.getId(), postId);
            Long likeCount = likeService.getLikeCount(postId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "isLiked", isLiked,
                "likeCount", likeCount
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
