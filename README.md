# action-esper.io-upload-multi

This action uploads one or more APKs to esper.io using [Esper.io API](https://api.esper.io/#section/Introduction)

## Inputs

### `enterpriseId`

**Required** Esper.io Enterprise ID

### `apiKey`

**Required** API key to interact with esper.io API

### `tenantId`

**Required** Esper.io tenant name

### `files`

**Required** APK file(s) to upload, can be a directory or a string array of file paths

## Outputs

### `uploadResult`

Result data from Esper.io APK upload operation

## Example usage

```
uses: actions/action-esper.io-upload-multi@v0.1
with:
  enterpriseId: 'ESPER_IO_ENTERPRISE_ID'
  apiKey: 'ESPER_IO_API_KEY'
  tenantId: 'ESPER_IO_TENANT_ID'
  files: './artifacts'
```

### OR

```
uses: actions/action-esper.io-upload-multi@v0.1
with:
  enterpriseId: 'ESPER_IO_ENTERPRISE_ID'
  apiKey: 'ESPER_IO_API_KEY'
  tenantId: 'ESPER_IO_TENANT_ID'
  files: ['./artifacts/my-app-beta.apk', './artifacts/my-app-uat.apk']
```

## References

- [https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#introduction]
- [https://github.com/vercel/ncc]
