package com.sunless.app.controller;

import com.sunless.app.dto.PostDTO;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import com.sunless.app.service.FeedService;
import com.sunless.app.service.PostService;
import com.sunless.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/post")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private FeedService feedService;

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            Post post = new Post();
            post.setContent(request.get("content"));
            post.setLocation(request.get("location"));
            
            if (request.containsKey("type")) {
                post.setType(Post.PostType.valueOf(request.get("type").toUpperCase()));
            }
            if (request.containsKey("privacy")) {
                post.setPrivacy(Post.PostPrivacy.valueOf(request.get("privacy").toUpperCase()));
            }
            if (request.containsKey("imageUrl")) {
                post.setImageUrl(request.get("imageUrl"));
            }
            if (request.containsKey("videoUrl")) {
                post.setVideoUrl(request.get("videoUrl"));
            }
            
            Post savedPost = postService.createPost(currentUser.getId(), post);
            
            // Convert to DTO to avoid circular references
            PostDTO postDTO = PostDTO.fromEntity(savedPost);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Post created successfully");
            response.put("data", postDTO);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable Long postId) {
        try {
            Post post = postService.getPostById(postId);
            if (post == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Post not found");
                return ResponseEntity.status(404).body(error);
            }
            
            // Convert to DTO to avoid circular references
            PostDTO postDTO = PostDTO.fromEntity(post);
            return ResponseEntity.ok(postDTO);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(@PathVariable Long postId, 
                                      @RequestBody Map<String, String> request,
                                      Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            Post post = postService.getPostById(postId);
            if (post == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Post not found");
                return ResponseEntity.status(404).body(error);
            }
            
            if (!post.getUser().getId().equals(currentUser.getId())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Not authorized to update this post");
                return ResponseEntity.status(403).body(error);
            }
            
            if (request.containsKey("content")) {
                post.setContent(request.get("content"));
            }
            if (request.containsKey("location")) {
                post.setLocation(request.get("location"));
            }
            if (request.containsKey("privacy")) {
                post.setPrivacy(Post.PostPrivacy.valueOf(request.get("privacy").toUpperCase()));
            }
            
            Post updatedPost = postService.updatePost(post);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Post updated successfully");
            response.put("data", updatedPost);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            Post post = postService.getPostById(postId);
            if (post == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Post not found");
                return ResponseEntity.status(404).body(error);
            }
            
            if (!post.getUser().getId().equals(currentUser.getId())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Not authorized to delete this post");
                return ResponseEntity.status(403).body(error);
            }
            
            boolean deleted = postService.deletePost(postId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", deleted);
            response.put("message", "Post deleted successfully");
            response.put("data", deleted);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        try {
            List<Post> posts = postService.getAllPosts(page, size);
            return ResponseEntity.ok(posts);
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
}
