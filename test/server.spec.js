const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

// initial precondition for all tests
function getPreCondition() {
    return helpers
        .run('generator-jhipster/generators/server')
        .withOptions({
            'from-cli': true,
            skipInstall: true,
            blueprints: 'nodejs',
            skipChecks: true
        })
        .withGenerators([
            [
                require('../generators/server/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:server',
                path.join(__dirname, '../generators/server/index.js')
            ]
        ]);
}

function commonAssertion() {
    assert.file(`${SERVER_NODEJS_DIR}src/app.module.ts`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/app.e2e-spec.ts`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/user.e2e-spec.ts`);
    assert.file(`${SERVER_NODEJS_DIR}e2e/jest.e2e.config.json`);
    assert.file('src/main/docker/app.yml');
    assert.file('src/main/docker/mysql.yml');
    assert.noFile('src/main/docker/mssql.yml');
    assert.noFile('src/main/docker/postgresql.yml');
    assert.noFile('src/main/resources/i18n/messages_en.properties');
}

const commonPrompt = {
    baseName: 'sampleMysql',
    applicationType: 'monolith',
    prodDatabaseType: 'mysql'
};

describe('Subgenerator server of nodejs JHipster blueprint', () => {
    describe('1-JWT test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    authenticationType: 'jwt'
                })
                .on('end', done);
        });

        it('app exists with jwt files', () => {
            commonAssertion();
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/user.jwt.controller.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/service/dto/user-login.dto.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/passport.jwt.strategy.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/payload.interface.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/web/rest/user.oauth2.controller.ts`);
        });
    });

    describe('2-OAUTH2 test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    commonPrompt,
                    authenticationType: 'oauth2'
                })
                .on('end', done);
        });

        it('app exists with oauth2 files', () => {
            commonAssertion();
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/user.oauth2.controller.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/security/passport.oauth2.strategy.ts`);
            assert.noFile(`${SERVER_NODEJS_DIR}src/security/payload.interface.ts`);
        });
    });

    describe('3-Database mssql test', () => {
        before(done => {
            getPreCondition()
                .withPrompts({
                    baseName: 'sampleMSsql',
                    applicationType: 'monolith',
                    prodDatabaseType: 'mssql',
                    authenticationType: 'jwt'
                })
                .on('end', done);
        });

        it('app exists with docker mssql.yml', () => {
            assert.noFile('src/main/docker/mysql.yml');
            assert.noFile('src/main/docker/postgresql.yml');
            assert.file('src/main/docker/mssql.yml');
        });
    });
});
