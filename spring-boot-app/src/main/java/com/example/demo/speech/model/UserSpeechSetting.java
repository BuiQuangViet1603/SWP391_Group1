package com.example.demo.speech.model;

import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================================
 * Entity: UserSpeechSetting
 * ============================================================================
 * Stores personalized speech preferences such as voice name, speed (rate),
 * pitch, volume, and auto-play behavior.
 */
@Entity
@Table(name = "user_speech_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSpeechSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /** Chosen synthesis voice identifier, e.g., 'en-US' or 'Google US English' */
    private String voiceName;

    /** Speech rate: 0.5 (slow) to 2.0 (fast). Default 1.0 */
    @Builder.Default
    private Double speechRate = 1.0;

    /** Speech pitch: 0.5 to 1.5. Default 1.0 */
    @Builder.Default
    private Double pitch = 1.0;

    /** Speech volume: 0.0 to 1.0. Default 1.0 */
    @Builder.Default
    private Double volume = 1.0;

    /** Whether flashcard audio plays automatically on card flip */
    @Builder.Default
    private Boolean autoPlayAudio = true;
}
