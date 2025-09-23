package com.sunless.app.repo;

import com.sunless.app.mode.Message;
import com.sunless.app.mode.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {
    
    // Find messages between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    Page<Message> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);
    
    // Find all conversations for a user (get unique users they've messaged with)
    @Query("SELECT DISTINCT CASE " +
           "WHEN m.sender = :user THEN m.receiver " +
           "ELSE m.sender " +
           "END FROM Message m WHERE m.sender = :user OR m.receiver = :user")
    List<User> findConversationPartners(@Param("user") User user);
    
    // Find unread message count for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.isRead = false")
    Long countUnreadMessages(@Param("user") User user);
    
    // Find unread messages for a user
    @Query("SELECT m FROM Message m WHERE m.receiver = :user AND m.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessages(@Param("user") User user);
    
    // Find latest message in each conversation
    @Query("SELECT m FROM Message m WHERE m.id IN (" +
           "SELECT MAX(m2.id) FROM Message m2 WHERE " +
           "(m2.sender = :user OR m2.receiver = :user) " +
           "GROUP BY CASE WHEN m2.sender = :user THEN m2.receiver ELSE m2.sender END" +
           ") ORDER BY m.createdAt DESC")
    List<Message> findLatestMessagesInConversations(@Param("user") User user);
    
    // Mark messages as read between two users
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
}
