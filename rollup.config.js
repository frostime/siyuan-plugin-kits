/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-09 21:09:16
 * @FilePath     : /rollup.config.js
 * @LastEditTime : 2024-12-18 22:04:31
 * @Description  : 
 */
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import fs from 'fs';

// 获取 src 目录下所有的 ts 文件
const srcDir = 'src';
const files = fs.readdirSync(srcDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => file.replace('.ts', ''));

// 为每个文件创建配置
const configs = files.map((file, index) => ({
    input: `src/${file}.ts`,
    output: [
        {
            file: `dist/${file}.js`,
            format: 'cjs'
        },
        {
            file: `dist/${file}.esm.js`,
            format: 'es'
        }
    ],
    external: ['siyuan'],
    plugins: [
        // 只在第一个配置中添加清理插件，这样只会在开始打包时清理一次
        ...(index === 0 ? [
            del({ targets: 'dist/*' })
        ] : []),
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
}));

export default configs;