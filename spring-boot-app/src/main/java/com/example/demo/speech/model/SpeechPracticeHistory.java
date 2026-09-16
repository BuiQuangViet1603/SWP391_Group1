package com.example.demo.speech.model;

import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * Entity: SpeechPracticeHistory
 * ============================================================================
 * Records each practice drill attempt made by a student, including the target
 * sentence, speech transcription, scores, and timestamp.
 */
@Entity
@Table(name = "speech_practice_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechPracticeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Optional association with the authenticated User.
     * Nullable to allow local/guest practice sessions during development.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /** The category of speech practice (READING, SHADOWING, LISTENING, SPEAKING, CONVERSATION) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PracticeType practiceType;

    /** The expected sentence or phrase */
    @Column(columnDefinition = "TEXT")
    private String targetText;

    /** The transcribed text produced by Speech-to-Text */
    @Column(columnDefinition = "TEXT")
    private String recognizedText;

    /** Overall score achieved (0 - 100) */
    private Double score;

    /** Fluency assessment score */
    private Double fluencyScore;

    /** Pronunciation accuracy assessment score */
    private Double accuracyScore;

    /** Timestamp of the practice attempt */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
