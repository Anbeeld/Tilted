import path from 'path';

const webConfig = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
            '.js': ['.js', '.ts'],
        },
    },
    target: 'web',
    entry: './src/index.ts',
    output: {
        path: path.resolve('./dist'),
        filename: 'tilted.js',
        library: {
            name: 'Tilted',
            type: 'var',
            export: 'default',
        },
    },
};

export default [webConfig];