package com.openreview.persistence.repository;

import com.openreview.persistence.entity.PullRequest;
import com.openreview.persistence.entity.Review;
import com.openreview.persistence.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Review entity
 */

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    /**
     * Find all reviews for a pull request
     * @param pullRequest PullRequest entity
     * @return List of reviews
     */
    List<Review> findByPullRequest(PullRequest pullRequest);

    /**
     * Find all reviews with a specific status
     * @param status Review status
     * @return List of reviews
     */
    List<Review> findByStatus(ReviewStatus status);

    /**
     * Find the latest review for a PR.
     * @param pullRequest PullRequest entity
     * @return Optional containing the latest review
     */
    Optional<Review> findFirstByPullRequestOrderByCreatedAtDesc(PullRequest pullRequest);

    /**
     * Find all reviews created within a time range.
     * @param start Start time
     * @param end End time
     * @return List of reviews
     */
    List<Review> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Count reviews by status.
     * @param status Review status
     * @return Count of reviews
     */
    Long countByStatus(ReviewStatus status);

    /**
     * Get average review duration in milliseconds.
     * @return Average duration
     */
    @Query("SELECT AVG(r.durationMs) FROM Review r WHERE r.durationMs IS NOT NULL")
    Double getAverageDuration();

    /**
     * Find reviews that have been in progress longer than specified duration.
     * @param threshold Time threshold
     * @return List of stuck reviews
     */
    @Query("SELECT r FROM Review r WHERE r.status = 'IN_PROGRESS' AND r.startedAt < :threshold")
    List<Review> findStuckReviews(@Param("threshold") LocalDateTime threshold);
}
