package com.openreview.persistence.repository;

import com.openreview.persistence.entity.Repository;
import com.openreview.persistence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Repository entity
 */

@org.springframework.stereotype.Repository
public interface RepositoryRepository extends JpaRepository<Repository, String> {

    /**
     * Find repository by GitHub id
     * @param githubId GitHub repository ID
     * @return Optional containing repository if found
     */
    Optional<Repository> findByGithubId(Long githubId);

    /**
     * Find repository by full name (owner / repo)
     * @param fullName Full repository name
     * @return Optional containing repository if found
     */
    Optional<Repository> findByFullName(String fullName);

    /**
     * Find all repositories for a user
     * @param user User entity
     * @return List of repositories
     */
    List<Repository> findByUser(User user);

    /**
     * Find all repositories for a user ID
     * @param userId User ID
     * @return List of repositories
     */
    List<Repository> findByUserId(String userId);

    /**
     * Check if repository exist by GitHub ID
     * @param githubId GitHub repository ID
     * @return true if repository exist
     */
    boolean existByGithubId(Long githubId);
}
