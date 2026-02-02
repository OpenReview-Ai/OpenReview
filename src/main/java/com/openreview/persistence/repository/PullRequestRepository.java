package com.openreview.persistence.repository;

import com.openreview.persistence.entity.PullRequest;
import com.openreview.persistence.entity.Repository;
import com.openreview.persistence.enums.PRStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PullRequest entity
 */

@org.springframework.stereotype.Repository
public interface PullRequestRepository extends JpaRepository<PullRequest, String> {

    /**
     * Find pull request by GitHub ID
     * @param githubId GitHub PR ID
     * @return Optional containing PR if found
     */
    Optional<PullRequest> findByGithubId(Long githubId);

    /**
     * Find pull request by repository and PR number
     * @param repository Repository entity
     * @param number PR number
     * @return Optional containing PR if found
     */
    Optional<PullRequest> findByRepositoryAndNumber(Repository repository, Integer number);

    /**
     * Find all PRs for a repository
     * @param repository Repository entity
     * @return List of pull requests
     */
    List<PullRequest> findByRepository(Repository repository);

    /**
     * Find all PRs with a specific status
     * @param status PR status
     * @return List of pull requests
     */
    List<PullRequest> findByStatus(PRStatus status);

    /**
     * Find all PRs for a repository with a specific status
     * @param repository Repository entity
     * @param status PR status
     * @return List of pull requests
     */
    List<PullRequest> findByRepositoryAndStatus(Repository repository, PRStatus status);

    /**
     * Count PRs by status for a repository
     * @param repositoryId Repository ID
     * @param status PR status
     * @return count of PRs
     */
    @Query("SELECT COUNT(pr) FROM PullRequest pr WHERE pr.repository.id = :repositoryId AND pr.status = :status")
    Long countByRepositoryIdAndStatus(@Param("repositoryId") String repositoryId, @Param("status") PRStatus status);
}
