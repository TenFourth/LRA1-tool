const MODE = 'development';  // 'production' or 'development'

// development に設定するとソースマップ有効でJSファイルが出力される
const enabledSourceMap = (MODE === 'development');

const baseConfig = {
    mode: MODE,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            }, {
                test: /\.(s)?css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: true,
                            sourceMap: enabledSourceMap,

                            // 0 => no loaders (default);
                            // 1 => postcss-loader;
                            // 2 => postcss-loader, sass-loader
                            importLoaders: 2
                        },
                    }, {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: enabledSourceMap,
                        }
                    }
                ]
            }, {
                test: /\.(gif|png|jpg)$/,
                loader: 'url-loader', // Base64化
                options: {
                    esModule: false
                }
            }, {
                test: /\.(ttf|eot|svg|woff(2)?)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader',
                options: {
                    esModule: false
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'  // see https://jp.vuejs.org/v2/guide/installation.html
        },
        extensions: [
            '.ts', '.js',
        ]
    }
};

const mainPackConfig = {
    ...baseConfig,
    target: 'electron-main',
    entry: './src/main.ts',
    output: {
        path: __dirname,
        filename: 'build/main.js'
    },
    externals: [
        require('webpack-node-externals')()
    ]
};

const rendererPackConfig = {
    ...baseConfig,
    target: 'electron-renderer',
    entry: './app/renderer/index.js',
    output: {
        path: __dirname,
        filename: 'build/renderer.js'
    }
};

module.exports = [mainPackConfig, rendererPackConfig];
