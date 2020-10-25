import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import cleanup from 'rollup-plugin-cleanup';
import cleaner from 'rollup-plugin-cleaner';

export default [
    {
        input: './src/index.ts',
        plugins: [
            cleaner(),
            typescript({
                outDir: './lib'
            }),
            commonjs({ extensions: ['.js', '.ts'] })
        ],
        output: [
            {
                dir: './lib',
                format: 'umd',
                name: 'jsObservableQueue'
            }
        ]
    },
    {
        input: './src/index.ts',
        plugins: [
            typescript({
                declaration: false,
                target: 'es2015'
            }),
            commonjs({ extensions: ['.js', '.ts'] }),
            cleanup({
                comments: 'none'
            }),
            terser()
        ],
        output: {
            file: './lib/index.iife.js',
            format: 'iife',
            name: 'jsObservableQueue'
        }
    }
]