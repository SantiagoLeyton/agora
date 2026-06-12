package com.agora.modules.metrics.dto;

import java.time.Instant;
import java.util.List;

public record TeacherMetricsResponse(
        OverviewMetrics overview,
        List<EmotionalProfileMetric> emotionalProfile,
        List<GroupMetrics> byGroup,
        SemesterSummaryMetrics semesterSummary,
        ParticipationMetrics participation,
        MetricsMetadata metadata) {

    public record OverviewMetrics(
            int enrolledParticipants,
            int activeSchedules,
            double completionRate,
            int pendingFeedback,
            int elevatedIndicators,
            int completedAttempts,
            int inProgressAttempts,
            int abandonedAttempts) {
    }

    public record EmotionalProfileMetric(String name, double average, int sampleSize) {
    }

    public record GroupMetrics(
            long groupId,
            String groupName,
            int studentsCount,
            double participationRate,
            double completionRate,
            String strength,
            String attentionArea) {
    }

    public record MostPracticedCase(long id, String titulo, int count) {
    }

    public record SemesterSummaryMetrics(
            int completedSessions,
            long averageSessionDurationSeconds,
            MostPracticedCase mostPracticedCase) {
    }

    public record ParticipationMetrics(int responsesCount, int journalsCount, int aiSummariesCount) {
    }

    public record MetricsMetadata(
            String period,
            Instant generatedAt,
            int sampleSize,
            String academicNotice) {
    }
}
