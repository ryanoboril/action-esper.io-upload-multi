import * as core from '@actions/core';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';
import FormData from 'form-data';

async function run() {
  try {
    const enterpriseId = core.getInput('enterpriseId');
    const tenantId = core.getInput('tenantId');
    const apiKey = core.getInput('apiKey');
    const filesInput = core.getInput('files');

    // https://api.esper.io/tag/Application#operation/upload
    // NOTE: 405 if we don't include trailing slash on the URL!
    const url = `https://${tenantId}-api.esper.cloud/api/enterprise/${enterpriseId}/application/upload/`;
    core.debug(`Esper.io endpoint ${url}`);

    let filePaths: string[] = [];

    if (fs.statSync(filesInput)?.isDirectory()) {
      filePaths = fs
        .readdirSync(filesInput)
        .map((fileName: string) => path.join(filesInput, fileName));
      // handle array of file paths input
    } else {
      throw new Error(`Files input must be a directory: ${filesInput}`);
    }
    core.error(`Files to upload: ${filePaths.join(', ')}`);

    // This assumes up to 4 build variants, apps should be much smaller than this.
    const maxSize = 4 * 256 * 1024 * 1024; // max size is 256MB * 4 files = 1GB

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      maxBodyLength: maxSize,
      maxContentLength: maxSize,
    };

    const formData = new FormData();
    filePaths.forEach(async (filePath: string) => {
      const fileName = path.basename(filePath);
      formData.append('app_file', fs.createReadStream(filePath), fileName);
    });

    const result = await axios.post(url, formData, config);
    core.debug(JSON.stringify(result));
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
