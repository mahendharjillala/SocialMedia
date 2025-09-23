package com.sunless.app.service;

import com.sunless.app.mode.Comment;
import com.sunless.app.mode.Notification;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import com.sunless.app.repo.NotificationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserService userService;

    public Notification createNotification(User user, User fromUser, String message, 
                                         NotificationType type, Post post, Comment comment) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setFromUser(fromUser);
        notification.setMessage(message);
        notification.setType(Notification.NotificationType.valueOf(type.name()));
        notification.setPost(post);
        notification.setComment(comment);
        
        return notificationRepo.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return notificationRepo.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return notificationRepo.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public Long getUnreadCount(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return 0L;
        }
        return notificationRepo.countUnreadByUser(user);
    }

    public boolean markAsRead(Long userId, Long notificationId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Notification notification = notificationRepo.findById(notificationId).orElse(null);
        if (notification == null || !notification.getUser().getId().equals(userId)) {
            return false;
        }

        notification.setIsRead(true);
        notificationRepo.save(notification);
        return true;
    }

    public boolean markAllAsRead(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        List<Notification> unreadNotifications = notificationRepo.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepo.saveAll(unreadNotifications);
        return true;
    }

    public enum NotificationType {
        LIKE, COMMENT, FOLLOW, MENTION, POST_SHARE
    }
}
