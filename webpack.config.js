module.exports = {
    entry: {
        popup: './src/popup/popup.js',
        leetcode: './src/script/leetcode.js',
        leetcodecn: './src/script/leetcodecn.js'
    },
    output: {
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    mode: 'production'
}