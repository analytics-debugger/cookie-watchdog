import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';



export default {
    input: 'src/index.js',
    output: [
        // UMD Format (with ES5 transpilation)
        {
            file: 'dist/cookie-watchdog.js',
            format: 'umd',
            name: 'CookieWatchdog',
            sourcemap: true,
        },
        {
            file: 'dist/cookie-watchdog-min.js',
            format: 'umd',
            name: 'CookieWatchdog',
            plugins: [terser()],
        },
        // ESM Format (no transpilation, ES6+)
        {
            file: 'dist/cookie-watchdog.esm.js',
            format: 'esm',
            sourcemap: true,
        },
        // CJS Format (no transpilation, ES6+)
        {
            file: 'dist/cookie-watchdog.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
        // IIFE Format (with ES5 transpilation)
        {
            file: 'dist/cookie-watchdog.iife.js',
            format: 'iife',
            name: 'CookieWatchdog',
            sourcemap: true,
        },
        // IIFE Format Minified (with ES5 transpilation)
        {
            file: 'dist/cookie-watchdog.iife-min.js',
            format: 'iife',
            name: 'CookieWatchdog',
            plugins: [terser()],
        },
    ],
    plugins: [
        // Apply Babel globally for ES5 transpilation
        babel({
            exclude: 'node_modules/**', // Only transpile files not in node_modules
            presets: [
                ['@babel/preset-env', {
                    targets: '> 0.25%, not dead', // Target modern browsers for ESM/CJS
                    useBuiltIns: false, // Do not include polyfills automatically
                    corejs: false, // We won't handle polyfills here
                }],
            ],
            babelHelpers: 'bundled', // Use bundled Babel helpers for transpiling
        }),
        resolve(),  // Helps resolve node modules in browser builds

    ],
};
