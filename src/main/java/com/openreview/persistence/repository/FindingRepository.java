package com.openreview.persistence.repository;

import com.openreview.persistence.entity.Finding;
import com.openreview.persistence.entity.Review;
import com.openreview.persistence.enums.FindingType;
import com.openreview.persistence.enums.SeverityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Finding entity.
 */

@Repository
public interface FindingRepository extends JpaRepository<Finding, String> {

    /**
     * Find all findings for a review.
     * @param review Review entity
     * @return List of findings
     */
    List<Finding> findByReview(Review review);

    /**
     * Find findings by type.
     * @param type Finding type
     * @return List of Findings
     */
    List<Finding> findByType(FindingType type);

    /**
     * Find findings by severity.
     * @param severity Severity level
     * @return List of findings
     */
    List<Finding> findBySeverity(SeverityLevel severity);

    /**
     * Find findings by file path.
     * @param file File path
     * @return List of findings
     */
    List<Finding> findByFile(String file);

    /**
     * Find findings for a review by severity.
     * @param review Review entity
     * @param severity Severity level
     * @return List of findings
     */
    List<Finding> findByReviewAndSeverity(Review review, SeverityLevel severity);

    /**
     * Count findings by type for a review.
     * @param reviewId Review ID
     * @param type Finding type
     * @return count of findings
     */
    @Query("SELECT COUNT(f) FROM Finding f WHERE f.review.id = :reviewId AND f.type = :type")
    Long countByReviewAndType(@Param("reviewId") String reviewId, @Param("type") FindingType type);

    /**
     * Get most common finding types across all reviews.
     * @return List of finding types ordered by frequency
     */
    @Query("SELECT f.type, COUNT(f) as cnt FROM Finding f GROUP BY f.type ORDER BY cnt DESC")
    List<Object[]> getMostCommonFindingTypes();

    /**
     * Get findings that haven't been posted as comments yet.
     * @return List of findings without comment IDs
     */
    List<Finding> findByCommentIdIsNull();
}
