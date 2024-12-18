/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-09 21:09:16
 * @FilePath     : /rollup.config.js
 * @LastEditTime : 2024-12-18 20:27:59
 * @Description  : 
 */
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs'
        },
        {
            file: 'dist/index.esm.js',
            format: 'es'
        }
    ],
    external: ['siyuan'],
    plugins: [
        resolve(),
        typescript({
            tsconfig: './tsconfig.json',
            // Add these options to handle type imports
            include: ['src/**/*'],
            exclude: ['node_modules/**'],
            // sourceMap: true,
            inlineSources: true,
            declaration: true, // 生成声明文件
            declarationDir: './dist/types' // 声明文件输出目录
        })
    ]
};