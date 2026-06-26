import { useState, useEffect } from 'react';
// Если у вас используется официальная либа posthog-js (раскомментируй импорт ниже):
// import posthog from 'posthog-js';

export function useABTest(experimentName: string, variants: string[]): string {
    const [variant, setVariant] = useState<string>(variants[0]);

    useEffect(() => {
        const storageKey = `ab_test_${experimentName}`;
        const storedVariant = localStorage.getItem(storageKey);

        let currentVariant = storedVariant;

        if (!storedVariant || !variants.includes(storedVariant)) {
            const randomIndex = Math.floor(Math.random() * variants.length);
            currentVariant = variants[randomIndex];
            localStorage.setItem(storageKey, currentVariant);
        }

        setVariant(currentVariant!);

        // Отправляем данные в PostHog, чтобы он знал, в какой группе юзер
        try {
            // Проверяем, доступен ли posthog глобально (зависит от того, как вы его ставили)
            if (typeof window !== 'undefined' && (window as any).posthog) {
                (window as any).posthog.capture('$feature_flag_called', {
                    $feature_flag: experimentName,
                    $feature_flag_response: currentVariant
                });
            }
        } catch (e) {
            console.error("PostHog event tracking failed", e);
        }

    }, [experimentName, variants]);

    return variant;
}