import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            ecma: 2015,
            passes: 2
          },
          mangle: {
            properties: true
          }
        }
      }),
    ],
  },
};

export default [webConfig];