package com.sunless.app.service;

import com.sunless.app.mode.Like;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import com.sunless.app.repo.LikeRepo;
import com.sunless.app.repo.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LikeService {

    @Autowired
    private LikeRepo likeRepo;

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    public boolean likePost(Long userId, Long postId) {
        User user = userService.findById(userId);
        Post post = postRepo.findById(postId).orElse(null);

        if (user == null || post == null) {
            throw new RuntimeException("User or post not found");
        }

        if (likeRepo.existsByUserAndPost(user, post)) {
            return false; // Already liked
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        likeRepo.save(like);

        // Update post like count
        post.setLikeCount(post.getLikeCount() + 1);
        postRepo.save(post);

        // Create notification (don't notify if user likes their own post)
        if (!user.getId().equals(post.getUser().getId())) {
            notificationService.createNotification(
                post.getUser(),
                user,
                "liked your post",
                NotificationService.NotificationType.LIKE,
                post,
                null
            );
        }

        return true;
    }

    public boolean unlikePost(Long userId, Long postId) {
        User user = userService.findById(userId);
        Post post = postRepo.findById(postId).orElse(null);

        if (user == null || post == null) {
            throw new RuntimeException("User or post not found");
        }

        likeRepo.deleteByUserAndPost(user, post);

        // Update post like count
        post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        postRepo.save(post);

        return true;
    }

    public boolean isLiked(Long userId, Long postId) {
        User user = userService.findById(userId);
        Post post = postRepo.findById(postId).orElse(null);

        if (user == null || post == null) {
            return false;
        }

        return likeRepo.existsByUserAndPost(user, post);
    }

    public Long getLikeCount(Long postId) {
        Post post = postRepo.findById(postId).orElse(null);
        if (post == null) {
            return 0L;
        }
        return likeRepo.countByPost(post);
    }
}
