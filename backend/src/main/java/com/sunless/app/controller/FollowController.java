package com.sunless.app.controller;

import com.sunless.app.dto.UserResponse;
import com.sunless.app.mode.User;
import com.sunless.app.service.FollowService;
import com.sunless.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowService followService;

    @Autowired
    private UserService userService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> followUser(@PathVariable Long userId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean followed = followService.followUser(currentUser.getId(), userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of("success", followed));
            response.put("message", followed ? "Successfully followed user" : "Already following this user");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unfollowUser(@PathVariable Long userId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean unfollowed = followService.unfollowUser(currentUser.getId(), userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of("success", unfollowed));
            response.put("message", "Successfully unfollowed user");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable Long userId) {
        try {
            List<User> followers = followService.getFollowers(userId);
            List<UserResponse> userResponses = followers.stream()
                    .map(this::createUserResponse)
                    .toList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userResponses);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable Long userId) {
        try {
            List<User> following = followService.getFollowing(userId);
            List<UserResponse> userResponses = following.stream()
                    .map(this::createUserResponse)
                    .toList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userResponses);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<?> getFollowStatus(@PathVariable Long userId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean isFollowing = followService.isFollowing(currentUser.getId(), userId);
            Long followerCount = followService.getFollowerCount(userId);
            Long followingCount = followService.getFollowingCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "isFollowing", isFollowing,
                "followerCount", followerCount,
                "followingCount", followingCount
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private UserResponse createUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setBio(user.getBio());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setCreatedAt(user.getCreatedAt());
        response.setIsVerified(user.getIsVerified());
        return response;
    }
}
