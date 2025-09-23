package com.sunless.app.service;

import com.sunless.app.mode.Comment;
import com.sunless.app.mode.Post;
import com.sunless.app.mode.User;
import com.sunless.app.repo.CommentRepo;
import com.sunless.app.repo.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    public Comment createComment(Long userId, Long postId, String content, Long parentCommentId) {
        User user = userService.findById(userId);
        Post post = postRepo.findById(postId).orElse(null);

        if (user == null || post == null) {
            throw new RuntimeException("User or post not found");
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);

        if (parentCommentId != null) {
            Comment parentComment = commentRepo.findById(parentCommentId).orElse(null);
            if (parentComment != null) {
                comment.setParentComment(parentComment);
            }
        }

        Comment savedComment = commentRepo.save(comment);

        // Update post comment count
        post.setCommentCount(post.getCommentCount() + 1);
        postRepo.save(post);

        // Create notification (don't notify if user comments on their own post)
        if (!user.getId().equals(post.getUser().getId())) {
            notificationService.createNotification(
                post.getUser(),
                user,
                "commented on your post",
                NotificationService.NotificationType.COMMENT,
                post,
                savedComment
            );
        }

        return savedComment;
    }

    public List<Comment> getCommentsByPost(Long postId) {
        Post post = postRepo.findById(postId).orElse(null);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        return commentRepo.findTopLevelCommentsByPost(post);
    }

    public List<Comment> getRepliesToComment(Long commentId) {
        Comment parentComment = commentRepo.findById(commentId).orElse(null);
        if (parentComment == null) {
            throw new RuntimeException("Comment not found");
        }
        return commentRepo.findByParentCommentAndIsActiveTrueOrderByCreatedAtDesc(parentComment);
    }

    public Comment updateComment(Long userId, Long commentId, String content) {
        Comment comment = commentRepo.findById(commentId).orElse(null);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this comment");
        }

        comment.setContent(content);
        return commentRepo.save(comment);
    }

    public boolean deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepo.findById(commentId).orElse(null);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        comment.setIsActive(false);
        commentRepo.save(comment);

        // Update post comment count
        Post post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepo.save(post);

        return true;
    }

    public Long getCommentCount(Long postId) {
        Post post = postRepo.findById(postId).orElse(null);
        if (post == null) {
            return 0L;
        }
        return commentRepo.countByPost(post);
    }
}
