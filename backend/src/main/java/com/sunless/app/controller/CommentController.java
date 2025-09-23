package com.sunless.app.controller;

import com.sunless.app.mode.Comment;
import com.sunless.app.mode.User;
import com.sunless.app.service.CommentService;
import com.sunless.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<?> createComment(@PathVariable Long postId, 
                                         @RequestBody Map<String, String> request,
                                         Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            String content = request.get("content");
            Long parentCommentId = request.containsKey("parentCommentId") ? 
                Long.parseLong(request.get("parentCommentId")) : null;
            
            Comment comment = commentService.createComment(currentUser.getId(), postId, content, parentCommentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comment created successfully");
            response.put("data", comment);
            response.put("commentCount", commentService.getCommentCount(postId));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPost(@PathVariable Long postId) {
        try {
            List<Comment> comments = commentService.getCommentsByPost(postId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<?> getRepliesToComment(@PathVariable Long commentId) {
        try {
            List<Comment> replies = commentService.getRepliesToComment(commentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", replies);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId,
                                         @RequestBody Map<String, String> request,
                                         Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            String content = request.get("content");
            Comment updatedComment = commentService.updateComment(currentUser.getId(), commentId, content);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comment updated successfully");
            response.put("data", updatedComment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            boolean deleted = commentService.deleteComment(currentUser.getId(), commentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", deleted);
            response.put("message", "Comment deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
