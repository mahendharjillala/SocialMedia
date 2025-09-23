package com.sunless.app.service;

import com.sunless.app.mode.Follow;
import com.sunless.app.mode.User;
import com.sunless.app.repo.FollowRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FollowService {

    @Autowired
    private FollowRepo followRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    public boolean followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Cannot follow yourself");
        }

        User follower = userService.findById(followerId);
        User following = userService.findById(followingId);

        if (follower == null || following == null) {
            throw new RuntimeException("User not found");
        }

        if (followRepo.existsByFollowerAndFollowing(follower, following)) {
            return false; // Already following
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepo.save(follow);

        // Create notification
        notificationService.createNotification(
            following,
            follower,
            "started following you",
            NotificationService.NotificationType.FOLLOW,
            null,
            null
        );

        return true;
    }

    public boolean unfollowUser(Long followerId, Long followingId) {
        User follower = userService.findById(followerId);
        User following = userService.findById(followingId);

        if (follower == null || following == null) {
            throw new RuntimeException("User not found");
        }

        followRepo.deleteByFollowerAndFollowing(follower, following);
        return true;
    }

    public List<User> getFollowers(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return followRepo.findByFollowing(user).stream()
                .map(Follow::getFollower)
                .toList();
    }

    public List<User> getFollowing(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return followRepo.findByFollower(user).stream()
                .map(Follow::getFollowing)
                .toList();
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        User follower = userService.findById(followerId);
        User following = userService.findById(followingId);

        if (follower == null || following == null) {
            return false;
        }

        return followRepo.existsByFollowerAndFollowing(follower, following);
    }

    public Long getFollowerCount(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return 0L;
        }
        return followRepo.countFollowers(user);
    }

    public Long getFollowingCount(Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return 0L;
        }
        return followRepo.countFollowing(user);
    }
}
