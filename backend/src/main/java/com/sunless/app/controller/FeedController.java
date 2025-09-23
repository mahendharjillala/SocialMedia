package com.sunless.app.controller;

import com.sunless.app.dto.PostDTO;
import com.sunless.app.service.FeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    @Autowired
    private FeedService feedService;

    @GetMapping("/news")
    public ResponseEntity<?> getNewsFeed(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            Long userId = feedService.getCurrentUserId(currentUsername);
            
            Page<PostDTO> posts = feedService.getNewsFeed(userId, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalPages", posts.getTotalPages());
            response.put("totalElements", posts.getTotalElements());
            response.put("hasNext", posts.hasNext());
            response.put("hasPrevious", posts.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/explore")
    public ResponseEntity<?> getExploreFeed(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostDTO> posts = feedService.getExploreFeed(page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalPages", posts.getTotalPages());
            response.put("totalElements", posts.getTotalElements());
            response.put("hasNext", posts.hasNext());
            response.put("hasPrevious", posts.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingPosts(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostDTO> posts = feedService.getTrendingPosts(page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalPages", posts.getTotalPages());
            response.put("totalElements", posts.getTotalElements());
            response.put("hasNext", posts.hasNext());
            response.put("hasPrevious", posts.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(@PathVariable Long userId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostDTO> posts = feedService.getPostsByUser(userId, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalPages", posts.getTotalPages());
            response.put("totalElements", posts.getTotalElements());
            response.put("hasNext", posts.hasNext());
            response.put("hasPrevious", posts.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam String query,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostDTO> posts = feedService.searchPosts(query, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalPages", posts.getTotalPages());
            response.put("totalElements", posts.getTotalElements());
            response.put("hasNext", posts.hasNext());
            response.put("hasPrevious", posts.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
