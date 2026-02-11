import * as core from '@actions/core';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';
import FormData from 'form-data';

async function run() {
  try {
    core.setCommandEcho(true); // echo command output to CI logs

    const enterpriseId = core.getInput('enterpriseId');
    const tenantId = core.getInput('tenantId');
    const apiKey = core.getInput('apiKey');
    const filesInput = core.getInput('files');

    // https://api.esper.io/tag/Application#operation/upload
    // NOTE: 405 if we don't include trailing slash on the URL!
    const url = `https://${tenantId}-api.esper.cloud/api/enterprise/${enterpriseId}/application/upload/`;
    core.info(`Esper.io endpoint ${url}`);

    let filePaths: string[] = [];

    if (fs.statSync(filesInput)?.isDirectory()) {
      filePaths = fs
        .readdirSync(filesInput)
        .map((fileName: string) => path.join(filesInput, fileName));
    } else {
      throw new Error(`\`files\` input must be a directory: ${filesInput}`);
    }
    core.info(`Files to upload: ${filePaths.join(', ')}`);

    const maxSize = 2_000_000_000;
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      maxBodyLength: maxSize,
      maxContentLength: maxSize,
    };

    const uploadRequests = filePaths.map(async (filePath: string) => {
      const fileName = path.basename(filePath);
      const formData = new FormData();
      formData.append('app_file', fs.createReadStream(filePath), fileName);
      return axios.post(url, formData, config);
    });

    const results = await Promise.all(uploadRequests);

    core.info('Upload operation completed');
    core.info(JSON.stringify(results.map((result) => result.data)));
    core.setOutput(
      'uploadResult',
      results.map((result) => result.data),
    );
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      core.error(`Axios error response: ${JSON.stringify(err.response?.data)}`);
    }
    try {
      core.error(JSON.stringify(err));
    } catch (error) {
      core.error(error as string);
    }
    core.setFailed((err as Error)?.message);
  }
}

run();
