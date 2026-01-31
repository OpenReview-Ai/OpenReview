package com.openreview.persistence.entity;

import com.openreview.persistence.enums.FindingType;
import com.openreview.persistence.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single code issue found during review
 */

@Entity
@Table(name = "findings", indexes = {
        @Index(name = "idx_finding_review_id", columnList = "review_id"),
        @Index(name = "idx_finding_type", columnList = "type"),
        @Index(name = "idx_finding_severity", columnList = "severity")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Finding {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FindingType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeverityLevel severity;

    @Column(nullable = false)
    private String file;

    @Column(nullable = false)
    private String line;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String suggestion;

    @ElementCollection
    @CollectionTable(name = "finding_resources", joinColumns = @JoinColumn(name = "finding_id"))
    @Column(name = "resource_url")
    @Builder.Default
    private List<String> resources = new ArrayList<>();

    @Column(name = "comment_id")
    private Long commentId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
