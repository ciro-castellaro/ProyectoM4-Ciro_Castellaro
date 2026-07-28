import type { Result } from "./result.js";

export interface TaskSummary {
  total: number;
  pending: number;
  completed: number;
  pendingTitles: string[];
  completedTitles: string[];
}

export interface SendSummaryRequest {
  idToken: string;
  summary: TaskSummary;
}

export type SendSummaryResponse = Result<{ message: string }>;
