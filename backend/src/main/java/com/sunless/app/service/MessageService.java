package com.sunless.app.service;

import com.sunless.app.mode.Message;
import com.sunless.app.mode.User;
import com.sunless.app.repo.MessageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MessageService {

    @Autowired
    private MessageRepo messageRepo;

    @Autowired
    private UserService userService;

    public Message sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userService.findById(senderId);
        User receiver = userService.findById(receiverId);
        
        if (sender == null || receiver == null) {
            throw new RuntimeException("Sender or receiver not found");
        }
        
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Cannot send message to yourself");
        }
        
        Message message = new Message(sender, receiver, content);
        return messageRepo.save(message);
    }

    public Page<Message> getMessagesBetweenUsers(Long userId1, Long userId2, int page, int size) {
        User user1 = userService.findById(userId1);
        User user2 = userService.findById(userId2);
        
        if (user1 == null || user2 == null) {
            throw new RuntimeException("One or both users not found");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        return messageRepo.findMessagesBetweenUsers(user1, user2, pageable);
    }

    public List<User> getConversationPartners(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return messageRepo.findConversationPartners(user);
    }

    public Long getUnreadMessageCount(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return messageRepo.countUnreadMessages(user);
    }

    public List<Message> getUnreadMessages(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return messageRepo.findUnreadMessages(user);
    }

    public List<Message> getLatestMessagesInConversations(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return messageRepo.findLatestMessagesInConversations(user);
    }

    public void markMessagesAsRead(Long senderId, Long receiverId) {
        User sender = userService.findById(senderId);
        User receiver = userService.findById(receiverId);
        
        if (sender == null || receiver == null) {
            throw new RuntimeException("Sender or receiver not found");
        }
        
        messageRepo.markMessagesAsRead(sender, receiver);
    }

    public Optional<Message> getMessageById(Long messageId) {
        return messageRepo.findById(messageId);
    }

    public void deleteMessage(Long messageId, Long userId) {
        Optional<Message> messageOpt = messageRepo.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            // Only allow sender to delete their own messages
            if (message.getSender().getId().equals(userId)) {
                messageRepo.delete(message);
            } else {
                throw new RuntimeException("You can only delete your own messages");
            }
        } else {
            throw new RuntimeException("Message not found");
        }
    }
}
