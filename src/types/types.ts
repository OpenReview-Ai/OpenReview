export interface Repository {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  webhook_secret?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CodeReview {
  id: string;
  repository_id: string;
  commit_sha: string;
  commit_message?: string | null;
  commit_author?: string | null;
  file_path: string;
  review_comment: string;
  code_diff?: string | null;
  github_comment_id?: bigint | null;
  status: "pending" | "posted" | "failed";
  created_at: Date;
}

export interface GitHubCommit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

export interface GitHubWebhookPayload {
  ref: string;
  repository: {
    full_name: string;
    owner: {
      login: string;
    };
    name: string;
  };
  commits: GitHubCommit[];
}

export interface FileDiff {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}
