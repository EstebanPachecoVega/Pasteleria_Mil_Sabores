module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'src/**/*.test.js',
            'src/**/*.test.jsx',
            'src/test/**/*.js',
            'src/test/**/*.jsx'
        ],
        
        preprocessors: {
            'src/**/*.test.js': ['webpack'],
            'src/**/*.test.jsx': ['webpack'],
            'src/test/**/*.js': ['webpack'],
            'src/test/**/*.jsx': ['webpack']
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-react', { runtime: 'automatic' }],
                                    ['@babel/preset-env', { targets: { node: 'current' } }]
                                ]
                            }
                        }
                    },
                    // Agrega estas reglas para CSS
                    {
                        test: /\.css$/,
                        use: [
                            'style-loader',
                            'css-loader'
                        ]
                    },
                    // Para archivos de assets (opcional)
                    {
                        test: /\.(png|jpg|jpeg|gif|svg)$/,
                        type: 'asset/resource'
                    }
                ]
            },
            resolve: {
                extensions: ['.js', '.jsx', '.css']
            }
        },

        browsers: ['Chrome'],
        reporters: ['progress'],
        logLevel: config.LOG_INFO,
        autowatch: true,
        singleRun: process.env.CI === 'true',
        concurrency: Infinity,
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-webpack'
        ]
    });
};