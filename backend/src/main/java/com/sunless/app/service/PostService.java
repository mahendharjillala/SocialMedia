package com.sunless.app.service;

import com.sunless.app.repo.PostRepo;
import com.sunless.app.repo.UserRepo;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PostService {

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private UserRepo userRepo;

    public Post createPost(Long userId, Post post) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        return postRepo.save(post);
    }

    public Post getPostById(Long postId) {
        return postRepo.findById(postId).orElse(null);
    }

    public Post updatePost(Post post) {
        return postRepo.save(post);
    }

    public boolean deletePost(Long postId) {
        Post post = postRepo.findById(postId).orElse(null);
        if (post == null) {
            return false;
        }
        post.setIsActive(false);
        postRepo.save(post);
        return true;
    }

    public List<Post> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepo.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        return postPage.getContent();
    }

    public List<Post> getPostsByUser(Long userId, int page, int size) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepo.findByUserAndIsActiveTrueOrderByCreatedAtDesc(user, pageable);
        return postPage.getContent();
    }

    public List<Post> getAllPosts() {
        return postRepo.findAllActivePosts();
    }

    public List<Post> getPostsByUser(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return postRepo.findActivePostsByUser(user);
    }
}
