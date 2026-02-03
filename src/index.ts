import * as core from '@actions/core';
import axios, { AxiosError } from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';
import FormData = require('form-data');

const resolveWorkspace = (): string => {
  const workspace = process.env.GITHUB_WORKSPACE;
  if (!workspace) {
    throw new Error('GITHUB_WORKSPACE is not set');
  }
  return workspace;
};

const resolveFilesPath = (filesInput: string): string => {
  const workspace = resolveWorkspace();
  const resolvedPath = path.isAbsolute(filesInput)
    ? filesInput
    : path.resolve(workspace, filesInput);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Files directory does not exist: ${resolvedPath}`);
  }
  core.error(`Files directory resolved to ${resolvedPath}`);
  return resolvedPath;
};

async function run() {
  try {
    const enterpriseId = core.getInput('enterpriseId');
    const tenantId = core.getInput('tenantId');
    const apiKey = core.getInput('apiKey');
    const files = core.getInput('files');

    const resolvedPath = resolveFilesPath(files);

    // https://api.esper.io/tag/Application#operation/upload
    const url = `https://${tenantId}-api.esper.cloud/api/enterprise/${enterpriseId}/application/upload`;
    core.debug(`Esper.io endpoint ${url}`);

    let filePaths: string[] = [];
    // if (Array.isArray(files)) {
    //   filePaths = files;
    // } else if (fs.statSync(files)?.isDirectory()) {
    //   filePaths = fs
    //     .readdirSync(files)
    //     .map((fileName: string) => path.join(files, fileName));
    // }
    if (fs.statSync(resolvedPath)?.isDirectory()) {
      filePaths = fs
        .readdirSync(resolvedPath)
        .map((fileName: string) => path.join(resolvedPath, fileName));
    }
    core.error(`Files to upload: ${filePaths.join(', ')}`);

    const formData = new FormData();
    filePaths.forEach((filePath: string) => {
      const fileName = path.basename(filePath);
      formData.append(fileName, fs.createReadStream(filePath));
    });

    // const headers = {
    //   ...formData.getHeaders(),
    //   Authorization: `Bearer ${apiKey}`,
    //   maxBodyLength: 200 * 1024 * 1024,
    //   maxContentLength: 200 * 1024 * 1024,
    // };

    //  core.error(`Form Data Headers: ${JSON.stringify(headers)}`);

    const result = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
      },
    });
    core.error(JSON.stringify(result));
    core.setOutput('uploadResult', result.data);
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      core.error(`Axios error response: ${JSON.stringify(err.response?.data)}`);
    }
    core.error(JSON.stringify(err));
    core.setFailed((err as Error).message);
  }
}

run();
