module.exports = {
    apps: [{
        name: 'arg-backend',
        script: 'npx',
        args: 'tsx src/index.ts',
        cwd: 'd:/xampp/htdocs/finance-arg/server',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        }
    }]
};
