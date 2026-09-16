package com.example.demo.speech.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================================
 * DTO: SpeechSettingDTO
 * ============================================================================
 * Carries user speech customization parameters.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechSettingDTO {
    private String voiceName;
    private Double speechRate;
    private Double pitch;
    private Double volume;
    private Boolean autoPlayAudio;
}
