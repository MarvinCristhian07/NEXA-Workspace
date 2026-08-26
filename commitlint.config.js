export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // Nova funcionalidade
                'fix',      // Correção de bug
                'docs',     // Documentação
                'style',    // Formatação (não muda lógica)
                'refactor', // Refatoração
                'test',     // Testes
                'chore',    // Tarefas de manutenção
                'ci',       // CI/CD
                'perf',     // Performance
                'revert'    // Reversão de commit
            ]
        ],
        'subject-case': [2, 'always', 'lower-case'],
        'subject-max-length': [2, 'always', 72],
        'body-max-line-length': [2, 'always', 100]
    }
};