import { patchFile } from "./utils/patchFile.mjs";

patchFile(process.argv[2] ?? '001_hello');