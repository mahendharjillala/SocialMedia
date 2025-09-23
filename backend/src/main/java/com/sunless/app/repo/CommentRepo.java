package com.sunless.app.repo;

import com.sunless.app.mode.Comment;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Long> {
    
    List<Comment> findByPostAndIsActiveTrueOrderByCreatedAtDesc(Post post);
    
    List<Comment> findByUserAndIsActiveTrueOrderByCreatedAtDesc(User user);
    
    List<Comment> findByParentCommentAndIsActiveTrueOrderByCreatedAtDesc(Comment parentComment);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post = :post AND c.isActive = true")
    Long countByPost(@Param("post") Post post);
    
    @Query("SELECT c FROM Comment c WHERE c.post = :post AND c.parentComment IS NULL AND c.isActive = true ORDER BY c.createdAt DESC")
    List<Comment> findTopLevelCommentsByPost(@Param("post") Post post);
}
