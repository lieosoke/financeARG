module.exports = {
    apps: [
        {
            name: 'arg-backend',
            cwd: 'd:/xampp/htdocs/finance-arg/server',
            script: 'dist/index.js',
            interpreter: 'node',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        },
        {
            name: 'arg-frontend',
            cwd: 'd:/xampp/htdocs/finance-arg',
            script: 'node_modules/serve/build/main.js',
            args: '-s dist -l 5173',
            interpreter: 'node',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
