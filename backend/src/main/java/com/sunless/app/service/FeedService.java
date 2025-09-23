package com.sunless.app.service;

import com.sunless.app.dto.PostDTO;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import com.sunless.app.repo.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedService {

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private FollowService followService;

    @Autowired
    private UserService userService;

    public Page<PostDTO> getNewsFeed(Long userId, int page, int size) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found for id: " + userId);
        }

        // Get list of users that the current user follows
        // Note: streams toList() may be unmodifiable; copy into a mutable list before adding
        List<User> following = new java.util.ArrayList<>(followService.getFollowing(userId));
        following.add(user); // Include user's own posts

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Post> posts = postRepo.findByUserInAndIsActiveTrueOrderByCreatedAtDesc(following, pageable);
        return posts.map(PostDTO::fromEntity);
    }

    public Page<PostDTO> getExploreFeed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepo.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        return posts.map(PostDTO::fromEntity);
    }

    public Page<PostDTO> getTrendingPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("likeCount").descending());
        Page<Post> posts = postRepo.findByIsActiveTrueOrderByLikeCountDesc(pageable);
        return posts.map(PostDTO::fromEntity);
    }

    public Page<PostDTO> getPostsByUser(Long userId, int page, int size) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepo.findByUserAndIsActiveTrueOrderByCreatedAtDesc(user, pageable);
        return posts.map(PostDTO::fromEntity);
    }

    public Page<PostDTO> searchPosts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepo.findByContentContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(query, pageable);
        return posts.map(PostDTO::fromEntity);
    }

    public Long getCurrentUserId(String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username));
        return user.getId();
    }
}
