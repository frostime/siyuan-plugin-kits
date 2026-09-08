/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-09 21:09:16
 * @FilePath     : /rollup.config.js
 * @LastEditTime : 2026-09-08 15:15:38
 * @Description  :
 */
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';

export default defineConfig({
    input: {
        index: 'src/index.ts',
        api: 'src/api.ts',
        element: 'src/element.ts'
    },
    output: [
        {
            dir: 'dist',
            format: 'es',
            preserveModules: true,
            entryFileNames: '[name].mjs',
            exports: 'named'
        },
        {
            dir: 'dist',
            format: 'cjs',
            preserveModules: true,
            entryFileNames: '[name].cjs',
            exports: 'named'
        }
    ],
    external: id => id === 'siyuan' || id.startsWith('siyuan/'),
    plugins: [
        del({
            targets: 'dist/*',
            runOnce: true
        }),
        resolve(),
        typescript({
            tsconfig: './tsconfig.json'
        })
    ]
});
