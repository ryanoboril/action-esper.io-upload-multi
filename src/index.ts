import * as core from '@actions/core';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';
import FormData = require('form-data');

const resolveWorkspace = (): string => {
  core.error(`RYAN ACTION FUCKING PLUGIN:   INSIDE FUCKING RESOLVE WORKSPACE`);
  const workspace = process.env.GITHUB_WORKSPACE;
  if (!workspace) {
    throw new Error('GITHUB_WORKSPACE is not set');
  }
  core.error(
    `RYAN ACTION FUCKING PLUGIN:   Workspace resolved to ${workspace}`,
  );
  return workspace;
};

const resolveFilesPath = (filesInput: string): string => {
  core.error(`RYAN ACTION FUCKING PLUGIN:   INSIDE FUCKING RESOLVE FILES PATH`);
  const workspace = resolveWorkspace();
  core.error(
    `RYAN ACTION FUCKING PLUGIN:   Workspace resolved to ${workspace}`,
  );
  const resolvedPath = path.isAbsolute(filesInput)
    ? filesInput
    : path.resolve(workspace, filesInput);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `RYAN GITHUB ACTION FUCKING PLUGIN:     Files directory does not exist: ${resolvedPath}`,
    );
  }
  core.error(
    `RYAN ACTION FUCKING PLUGIN:   Files directory resolved to ${resolvedPath}`,
  );
  return resolvedPath;
};

async function run() {
  try {
    const enterpriseId = core.getInput('enterpriseId');
    const tenantId = core.getInput('tenantId');
    const apiKey = core.getInput('apiKey');
    const files = core.getInput('files');

    core.error(`RYAN ACTION FUCKING PLUGIN:   FUCKING FILES INPUT: ${files}`);

    const resolvedPath = resolveFilesPath(files);

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
    core.debug(`Files to upload: ${filePaths.join(', ')}`);

    const formData = new FormData();
    filePaths.forEach((filePath: string) =>
      formData.append('app_file', fs.createReadStream(filePath)),
    );

    // https://api.esper.io/tag/Application#operation/upload
    const result = await axios.post<{
      application: Record<string, string> | { id: string };
    }>(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
        maxBodyLength: 200 * 1024 * 1024,
        maxContentLength: 200 * 1024 * 1024,
      },
    });
    core.debug(JSON.stringify(result.data, null, 2));
    core.setOutput('uploadResult', result.data);
  } catch (err: any) {
    core.error(err);
    core.setFailed(err.message);
  }
}

run();
