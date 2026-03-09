import * as toxicity from '@tensorflow-models/toxicity';

// Toxicity threshold — higher = more strict (0.0 to 1.0)
const TOXICITY_THRESHOLD = 0.8;

// Labels to check for
const TOXICITY_LABELS = [
    'identity_attack',
    'insult',
    'obscene',
    'severe_toxicity',
    'threat',
    'toxicity',
];

// Module-level cache for the loaded model
let cachedModel: toxicity.ToxicityClassifier | null = null;
let isLoading = false;
let loadPromise: Promise<toxicity.ToxicityClassifier> | null = null;

export interface ToxicityResult {
    isToxic: boolean;
    reason: string;
    labels: string[];
    scores: Record<string, number>;
}

/**
 * Lazily load the TensorFlow.js toxicity model.
 * Caches the model after first load so subsequent calls are instant.
 */
async function getModel(): Promise<toxicity.ToxicityClassifier | null> {
    if (cachedModel) return cachedModel;

    if (isLoading && loadPromise) {
        return loadPromise;
    }

    try {
        isLoading = true;
        loadPromise = toxicity.load(TOXICITY_THRESHOLD, TOXICITY_LABELS);
        cachedModel = await loadPromise;
        return cachedModel;
    } catch (error) {
        console.error('Failed to load toxicity model:', error);
        return null;
    } finally {
        isLoading = false;
        loadPromise = null;
    }
}

/**
 * Pre-load the model (call this on ChatPage mount for better UX).
 */
export async function preloadModel(): Promise<void> {
    await getModel();
}

/**
 * Check a message for toxicity using TensorFlow.js.
 * Returns detected toxic categories and their scores.
 */
export async function checkToxicity(message: string): Promise<ToxicityResult> {
    try {
        const model = await getModel();

        if (!model) {
            // If model fails to load, allow the message (fail-open)
            return { isToxic: false, reason: '', labels: [], scores: {} };
        }

        const predictions = await model.classify([message]);

        const detectedLabels: string[] = [];
        const scores: Record<string, number> = {};

        for (const prediction of predictions) {
            const match = prediction.results[0]?.match;
            const probability = prediction.results[0]?.probabilities[1]; // probability of being toxic

            if (probability !== undefined) {
                scores[prediction.label] = Math.round(probability * 100) / 100;
            }

            if (match) {
                detectedLabels.push(prediction.label);
            }
        }

        if (detectedLabels.length > 0) {
            const labelText = detectedLabels.join(', ');
            return {
                isToxic: true,
                reason: `Message flagged for: ${labelText}`,
                labels: detectedLabels,
                scores,
            };
        }

        return { isToxic: false, reason: '', labels: [], scores };
    } catch (error) {
        console.error('Toxicity check error:', error);
        // Fail-open: allow message if model errors
        return { isToxic: false, reason: '', labels: [], scores: {} };
    }
}
