package com.openreview.persistence.entity;

import com.openreview.persistence.enums.PRStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a GitHub Pull Request that has been or will be review
 */

@Entity
@Table(name = "pull_requests", indexes = {
        @Index(name = "idx_pr_github_id", columnList = "github_id"),
        @Index(name = "idx_pr_repository_id", columnList = "repository_id"),
        @Index(name = "idx_pr_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PullRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;

    @Column(nullable = false)
    private Integer number;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PRStatus status = PRStatus.PENDING;

    @Column(name = "files_changed", nullable = false)
    @Builder.Default
    private Integer filesChanged = 0;

    @OneToMany(mappedBy = "pull_request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
