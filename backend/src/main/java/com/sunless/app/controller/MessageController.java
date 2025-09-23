package com.sunless.app.controller;

import com.sunless.app.mode.Message;
import com.sunless.app.mode.User;
import com.sunless.app.service.MessageService;
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
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String content = request.get("content").toString();
            
            if (content == null || content.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Message content cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }
            
            Message message = messageService.sendMessage(currentUser.getId(), receiverId, content.trim());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", message);
            response.put("message", "Message sent successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            Page<Message> messages = messageService.getMessagesBetweenUsers(currentUser.getId(), userId, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", messages);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            List<Message> latestMessages = messageService.getLatestMessagesInConversations(currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", latestMessages);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            Long unreadCount = messageService.getUnreadMessageCount(currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of("unreadCount", unreadCount));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadMessages(Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            List<Message> unreadMessages = messageService.getUnreadMessages(currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", unreadMessages);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/mark-read/{userId}")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long userId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            messageService.markMessagesAsRead(userId, currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Messages marked as read");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId, Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            messageService.deleteMessage(messageId, currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
