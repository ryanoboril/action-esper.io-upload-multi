# action-esper.io-upload-multi

This action uploads one or more APKs to esper.io using [Esper.io API](https://api.esper.io/#section/Introduction)

## Inputs

### `enterpriseId`

**Required** Esper.io Enterprise ID

### `apiKey`

**Required** Esper.io API Key

### `tenantId`

**Required** Esper.io tenant name

### `files`

**Required** Folder containing APK files to upload

## Outputs

### `uploadResult`

Result data from Esper.io APK upload operation

## Example usage

```
uses: ryanoboril/action-esper.io-upload-multi@v1
with:
  enterpriseId: 'ESPER_IO_ENTERPRISE_ID'
  apiKey: 'ESPER_IO_API_KEY'
  tenantId: 'ESPER_IO_TENANT_ID'
  files: './artifacts'
```

## References

- [https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#introduction]
- [https://github.com/vercel/ncc]
