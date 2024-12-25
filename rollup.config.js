/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-09 21:09:16
 * @FilePath     : /rollup.config.js
 * @LastEditTime : 2024-12-25 19:35:50
 * @Description  : 
 */
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';

export default {
    input: ['src/index.ts', 'src/api.ts'],
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
    external: ['siyuan'],
    plugins: [
        del({ targets: 'dist/*' }),
        resolve(),
        typescript({
            tsconfig: './tsconfig.json',
            include: ['src/**/*'],
            exclude: ['node_modules/**'],
            inlineSources: true,
            declaration: true,
            declarationDir: './dist/types'
        })
    ]
};