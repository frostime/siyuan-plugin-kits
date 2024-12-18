/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:45:39
 * @FilePath     : /src/settings/utils.ts
 * @LastEditTime : 2024-12-18 20:45:49
 * @Description  : 
 */
/**
 * Deep merges two objects, handling arrays and nested objects
 * @param source The original object
 * @param target The object to merge in
 * @returns The merged object
 */
export function deepMerge<T extends object>(source: T, target: Partial<T> | any): T {
    // Handle null/undefined cases
    if (!source) return target as T;
    if (!target) return source;

    const result = { ...source };

    Object.keys(target).forEach(key => {
        const sourceValue = source[key];
        const targetValue = target[key];

        // Skip undefined values
        if (targetValue === undefined) return;

        // Handle null values
        if (targetValue === null) {
            result[key] = null;
            return;
        }

        // Handle arrays
        if (Array.isArray(targetValue)) {
            result[key] = Array.isArray(sourceValue)
                ? sourceValue.map((item, index) => {
                    return targetValue[index] !== undefined
                        ? (typeof item === 'object' && typeof targetValue[index] === 'object')
                            ? deepMerge(item, targetValue[index])
                            : targetValue[index]
                        : item;
                  }).concat(targetValue.slice(sourceValue?.length || 0))
                : [...targetValue];
            return;
        }

        // Handle objects
        if (typeof targetValue === 'object' && Object.keys(targetValue).length > 0) {
            result[key] = typeof sourceValue === 'object'
                ? deepMerge(sourceValue, targetValue)
                : targetValue;
            return;
        }

        // Handle primitive values
        result[key] = targetValue;
    });

    return result;
}
