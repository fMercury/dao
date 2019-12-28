# DAO Smart contracts repository

> Development envirnoment is optimized for using with VS Code IDE   
> Related workspace configuration is placed in the file: [./contracts.code-workspace](./contracts.code-workspace).  
> Please use this configuration by `Open Workspace` menu 

## Initial setup  

```bash
npm i
```

## Build contracts artifacts

```bash
npm run build
```
Artifacts for using in the external projects will be placed in `./artifacts` folder.

## Tests

```bash
npm run test
npm run test ./<path_to_test_file>.js
```  

## Tests coverage  

```bash
npm run test:coverage
``` 

## Linting

```bash
npm run lint
```

## Docs
- [Use-cases diagrams](./docs/usecase/README.md)
- [Activity diagrams](./docs/activity/README.md)
- [Dao.sol: generated docs](./docs/Dao.md)