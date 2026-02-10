package com.openreview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ObjectMapper objectMapper;
    private final GitHubService gitHubService;
    private final OllamaService ollamaService;

    public void processWebhook(String event, String payload) throws Exception {
        JsonNode json = objectMapper.readTree(payload);

        String repoFullName = json.get("repository").get("full_name").asText();
        log.info("Processing event '{}' for repository: {}", event, repoFullName);

        if ("push".equals(event)) {
            processPushEvent(json, repoFullName);
        } else if ("pull_request".equals(event)) {
            processPullRequestEvent(json, repoFullName);
        }
    }

    private void processPushEvent(JsonNode json, String repoFullName) throws Exception {
        String commitSha = json.get("after").asText();
        String commitUrl = json.get("commits").get(0).get("url").asText();

        log.info("Processing commit: {}", commitSha);

        // Get the diff from GitHub
        String diff = gitHubService.getCommitDiff(repoFullName, commitSha);

        if (diff == null || diff.trim().isEmpty()) {
            log.info("No changes to review");
            return;
        }

        // Send to AI for review
        String review = ollamaService.reviewCode(diff);

        // Post comment on commit
        gitHubService.postCommitComment(repoFullName, commitSha, review);

        log.info("Review posted successfully");
    }

    private void processPullRequestEvent(JsonNode json, String repoFullName) throws Exception {
        String action = json.get("action").asText();

        // Only review when PR is opened or synchronized (new commits)
        if (!"opened".equals(action) && !"synchronize".equals(action)) {
            log.info("Ignoring PR action: {}", action);
            return;
        }

        int prNumber = json.get("number").asInt();
        log.info("Processing PR #{}", prNumber);

        // Get the diff
        String diff = gitHubService.getPullRequestDiff(repoFullName, prNumber);

        if (diff == null || diff.trim().isEmpty()) {
            log.info("No changes to review");
            return;
        }

        // Send to AI for review
        String review = ollamaService.reviewCode(diff);

        // Post comment on PR
        gitHubService.postPullRequestComment(repoFullName, prNumber, review);

        log.info("Review posted successfully on PR #{}", prNumber);
    }
}