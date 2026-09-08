/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Description : 思源内核版本解析与比较。
 * 独立成无依赖的叶子模块, 供 api 等底层模块引用而不引入循环依赖。
 */

/**
 * Parses and compares SiYuan kernel versions.
 *
 * @returns An object containing:
 *   - major: The major version number
 *   - minor: The minor version number
 *   - patch: The patch version number
 *   - version: The full version string
 *   - compare: A function to compare against another version string
 */
export const siyuanVersion = () => {
    const version = window.siyuan.config.system.kernelVersion;
    const [major, minor, patch] = version.split('.').map(Number);

    const cmp = (n1: number, n2: number) => {
        if (n1 > n2) {
            return 1;
        } else if (n1 < n2) {
            return -1;
        } else {
            return 0;
        }
    };

    return {
        major, minor, patch, version,
        /**
         * Compare the current version against another version string.
         * @param anotherVersion
         * @returns -1 if current version is less, 1 if greater, 0 if equal
         */
        compare: (anotherVersion: string) => {
            const [amajor, aminor, apatch] = anotherVersion.split('.').map(Number);
            return cmp(major, amajor) || cmp(minor, aminor) || cmp(patch, apatch);
        }
    };
}
