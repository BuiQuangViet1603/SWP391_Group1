package com.example.demo.speech.repository;

import com.example.demo.speech.model.UserSpeechSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================================
 * Repository: UserSpeechSettingRepository
 * ============================================================================
 * Data access operations for user speech settings.
 */
@Repository
public interface UserSpeechSettingRepository extends JpaRepository<UserSpeechSetting, Long> {

    /**
     * Retrieve latest active speech configuration.
     */
    Optional<UserSpeechSetting> findTopByOrderByIdDesc();
}
