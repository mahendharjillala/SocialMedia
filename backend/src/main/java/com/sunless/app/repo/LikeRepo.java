package com.sunless.app.repo;

import com.sunless.app.mode.Like;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepo extends JpaRepository<Like, Long> {
    
    Optional<Like> findByUserAndPost(User user, Post post);
    
    boolean existsByUserAndPost(User user, Post post);
    
    List<Like> findByPost(Post post);
    
    List<Like> findByUser(User user);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.post = :post")
    Long countByPost(@Param("post") Post post);
    
    void deleteByUserAndPost(User user, Post post);
}
