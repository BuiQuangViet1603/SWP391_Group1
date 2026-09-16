package com.example.demo.speech.service;

import com.example.demo.speech.dto.PronunciationEvaluationRequestDTO;
import com.example.demo.speech.dto.PronunciationEvaluationResultDTO;
import com.example.demo.speech.dto.WordEvaluationDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ============================================================================
 * Service: PronunciationEvaluatorService
 * ============================================================================
 * Provides algorithmic pronunciation assessment comparing a learner's spoken
 * transcription against the expected target text.
 *
 * Algorithm Overview:
 * 1. Text Normalization: Strips punctuation, trims whitespace, converts to lowercase.
 * 2. Word Tokenization: Splits target and spoken sentences into individual words.
 * 3. Alignment & Similarity: Computes Levenshtein Distance similarity ratio for each word.
 * 4. Word Classification:
 *    - Similarity >= 0.90 -> CORRECT (100 pts)
 *    - Similarity >= 0.65 -> PARTIAL (70 pts)
 *    - Otherwise          -> MISSED (0 pts)
 * 5. Aggregate Metrics: Calculates Overall Score, Completeness %, and Fluency estimation.
 */
@Service
public class PronunciationEvaluatorService {

    /**
     * Evaluate pronunciation accuracy given target and spoken text.
     *
     * @param request target text and spoken text from speech recognition
     * @return PronunciationEvaluationResultDTO containing scores and word breakdown
     */
    public PronunciationEvaluationResultDTO evaluate(PronunciationEvaluationRequestDTO request) {
        String target = request.getTargetText() == null ? "" : request.getTargetText().trim();
        String spoken = request.getSpokenText() == null ? "" : request.getSpokenText().trim();

        if (target.isEmpty()) {
            return PronunciationEvaluationResultDTO.builder()
                    .overallScore(0.0)
                    .fluencyScore(0.0)
                    .completenessScore(0.0)
                    .wordEvaluations(new ArrayList<>())
                    .feedback("No target text provided for evaluation.")
                    .build();
        }

        List<String> targetWords = tokenize(target);
        List<String> spokenWords = tokenize(spoken);

        if (spokenWords.isEmpty()) {
            List<WordEvaluationDTO> allMissed = targetWords.stream()
                    .map(w -> WordEvaluationDTO.builder().word(w).status("MISSED").score(0.0).build())
                    .collect(Collectors.toList());

            return PronunciationEvaluationResultDTO.builder()
                    .overallScore(0.0)
                    .fluencyScore(0.0)
                    .completenessScore(0.0)
                    .wordEvaluations(allMissed)
                    .feedback("No speech was detected. Please check your microphone and try again.")
                    .build();
        }

        List<WordEvaluationDTO> evaluations = new ArrayList<>();
        double totalScoreSum = 0.0;
        int matchedWordCount = 0;

        // Compare each target word against the closest spoken word
        for (int i = 0; i < targetWords.size(); i++) {
            String targetWord = targetWords.get(i);
            double bestSimilarity = 0.0;

            // Search in a sliding window around the current word index
            int windowStart = Math.max(0, i - 2);
            int windowEnd = Math.min(spokenWords.size(), i + 3);

            for (int j = windowStart; j < windowEnd; j++) {
                double sim = calculateSimilarity(targetWord, spokenWords.get(j));
                if (sim > bestSimilarity) {
                    bestSimilarity = sim;
                }
            }

            // Also check anywhere in the spoken sentence if not found nearby
            if (bestSimilarity < 0.65) {
                for (String spk : spokenWords) {
                    double sim = calculateSimilarity(targetWord, spk);
                    if (sim > bestSimilarity) {
                        bestSimilarity = sim;
                    }
                }
            }

            // Classify word status based on similarity threshold
            String status;
            double wordScore;
            if (bestSimilarity >= 0.88) {
                status = "CORRECT";
                wordScore = 100.0;
                matchedWordCount++;
            } else if (bestSimilarity >= 0.60) {
                status = "PARTIAL";
                wordScore = Math.round(bestSimilarity * 100.0);
                matchedWordCount++;
            } else {
                status = "MISSED";
                wordScore = 0.0;
            }

            totalScoreSum += wordScore;
            evaluations.add(WordEvaluationDTO.builder()
                    .word(targetWord)
                    .status(status)
                    .score(wordScore)
                    .build());
        }

        // Calculate aggregate metrics
        double overallScore = Math.round(totalScoreSum / targetWords.size());
        double completeness = Math.round(((double) matchedWordCount / targetWords.size()) * 100.0);
        
        // Fluency estimation based on completeness and word count ratio
        double lengthRatio = Math.min(1.0, (double) spokenWords.size() / targetWords.size());
        double fluency = Math.round((overallScore * 0.7 + lengthRatio * 30.0));

        // Generate student feedback tip
        String feedback;
        if (overallScore >= 90) {
            feedback = "🌟 Outstanding pronunciation! Clear, accurate, and fluent.";
        } else if (overallScore >= 75) {
            feedback = "👍 Good job! Most words were clear. Pay attention to the highlighted yellow/red words.";
        } else if (overallScore >= 50) {
            feedback = "⚠️ Keep practicing! Focus on pronouncing word endings and speaking at a steady pace.";
        } else {
            feedback = "💪 Needs improvement. Listen to the audio model again, then repeat carefully.";
        }

        return PronunciationEvaluationResultDTO.builder()
                .overallScore(overallScore)
                .fluencyScore(fluency)
                .completenessScore(completeness)
                .wordEvaluations(evaluations)
                .feedback(feedback)
                .build();
    }

    /**
     * Clean and split a string into an array of lowercase alphanumeric tokens.
     */
    private List<String> tokenize(String text) {
        if (text == null) return new ArrayList<>();
        // Remove punctuation marks and symbols
        String clean = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        if (clean.isEmpty()) return new ArrayList<>();
        return Arrays.stream(clean.split("\\s+"))
                .filter(w -> !w.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Calculate similarity ratio (0.0 to 1.0) between two strings using Levenshtein distance.
     */
    private double calculateSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;
        int distance = computeLevenshteinDistance(s1, s2);
        return 1.0 - ((double) distance / maxLen);
    }

    /**
     * Standard iterative Levenshtein distance algorithm.
     */
    private int computeLevenshteinDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int j = 0; j <= s2.length(); j++) {
            costs[j] = j;
        }
        for (int i = 1; i <= s1.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= s2.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                        s1.charAt(i - 1) == s2.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[s2.length()];
    }
}
