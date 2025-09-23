package com.sunless.app.controller;

import com.sunless.app.mode.User;
import com.sunless.app.service.FileStorageService;
import com.sunless.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file,
                                                Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }

            String fileName = fileStorageService.storeFile(file, "profile-pictures");
            String fileUrl = "/uploads/" + fileName;
            
            currentUser.setProfilePictureUrl(fileUrl);
            userService.updateUser(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile picture uploaded successfully");
            response.put("data", Map.of("fileUrl", fileUrl));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/cover-picture")
    public ResponseEntity<?> uploadCoverPicture(@RequestParam("file") MultipartFile file,
                                              Authentication authentication) {
        try {
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername).orElseThrow();
            
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }

            String fileName = fileStorageService.storeFile(file, "cover-pictures");
            String fileUrl = "/uploads/" + fileName;
            
            currentUser.setCoverPictureUrl(fileUrl);
            userService.updateUser(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cover picture uploaded successfully");
            response.put("data", Map.of("fileUrl", fileUrl));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/post-image")
    public ResponseEntity<?> uploadPostImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }

            String fileName = fileStorageService.storeFile(file, "post-images");
            String fileUrl = "/uploads/" + fileName;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("data", Map.of("fileUrl", fileUrl));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
