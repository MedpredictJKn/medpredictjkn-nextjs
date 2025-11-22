import { useEffect, useState } from "react";

export function useCounterAnimation(targetValue: number, duration: number = 1500) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (targetValue === 0) {
            return;
        }

        let currentValue = 0;
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            currentValue = Math.floor(targetValue * progress);
            setDisplayValue(currentValue);

            if (progress === 1) {
                clearInterval(interval);
                setDisplayValue(targetValue);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [targetValue, duration]);

    return displayValue;
}

export function useProgressAnimation(targetValue: number, duration: number = 1500) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (targetValue === 0) {
            return;
        }

        let currentValue = 0;
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            currentValue = targetValue * progress;
            setDisplayValue(currentValue);

            if (progress === 1) {
                clearInterval(interval);
                setDisplayValue(targetValue);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [targetValue, duration]);

    return displayValue;
}
