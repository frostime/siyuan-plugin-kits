/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:45:39
 * @FilePath     : /src/settings/utils.ts
 * @LastEditTime : 2025-12-12 17:03:31
 * @Description  : 
 */

/**
 * Deep merges two objects, handling arrays and nested objects
 * Uses structuredClone to ensure immutability
 * @param source The original object
 * @param target The object to merge in
 * @returns The merged object (completely new instance)
 */
export function deepMerge<T extends object>(source: T, target: Partial<T> | any): T {
    // Handle null/undefined cases
    if (!source) return target as T;
    if (!target) return source;

    // Clone source to ensure immutability
    const result = structuredClone(source);

    Object.keys(target).forEach(key => {
        const sourceValue = result[key];
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
                            : structuredClone(targetValue[index])
                        : item;
                }).concat(structuredClone(targetValue.slice(sourceValue?.length || 0)))
                : structuredClone(targetValue);
            return;
        }

        // Handle objects
        if (typeof targetValue === 'object' && Object.keys(targetValue).length > 0) {
            result[key] = typeof sourceValue === 'object'
                ? deepMerge(sourceValue, targetValue)
                : structuredClone(targetValue);
            return;
        }

        // Handle primitive values
        result[key] = targetValue;
    });

    return result;
}
