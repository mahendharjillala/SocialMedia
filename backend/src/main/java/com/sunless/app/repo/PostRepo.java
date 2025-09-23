package com.sunless.app.repo;

import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepo extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);
    
    List<Post> findByUserAndIsActiveTrueOrderByCreatedAtDesc(User user);
    
    Page<Post> findByUserAndIsActiveTrueOrderByCreatedAtDesc(User user, Pageable pageable);
    
    Page<Post> findByUserInAndIsActiveTrueOrderByCreatedAtDesc(List<User> users, Pageable pageable);
    
    Page<Post> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    Page<Post> findByIsActiveTrueOrderByLikeCountDesc(Pageable pageable);
    
    Page<Post> findByContentContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(String content, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Post> findAllActivePosts();
    
    @Query("SELECT p FROM Post p WHERE p.user = :user AND p.isActive = true ORDER BY p.createdAt DESC")
    List<Post> findActivePostsByUser(@Param("user") User user);
}
