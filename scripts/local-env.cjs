const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { parse } = require('dotenv');

const moduleDirectory = resolve(__dirname, '..');
const workspaceDirectory = resolve(moduleDirectory, '../..');

const readEnvFile = (path) => {
  try {
    return parse(readFileSync(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

function readWorkspaceEnv() {
  const mountedFile = process.env.POKEGO_BREEZE_WORKSPACE_ENV_PATH;
  const inWorkspace =
    existsSync(resolve(workspaceDirectory, '.gitmodules')) && existsSync(resolve(workspaceDirectory, 'compose.yml'));
  if (!mountedFile && !inWorkspace) {
    return {};
  }
  return {
    REACT_APP_DATA_API_URL: 'http://localhost:3001',
    ...readEnvFile(mountedFile || resolve(workspaceDirectory, '.env')),
  };
}

function readLocalEnv(mode) {
  return {
    ...readWorkspaceEnv(),
    ...readEnvFile(resolve(moduleDirectory, '.env')),
    ...readEnvFile(resolve(moduleDirectory, '.env.local')),
    ...(mode && readEnvFile(resolve(moduleDirectory, `.env.${mode}`))),
    ...(mode && readEnvFile(resolve(moduleDirectory, `.env.${mode}.local`))),
    ...process.env,
  };
}

module.exports = { readWorkspaceEnv, readLocalEnv };
