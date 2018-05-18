import nodepath from "path";

export const makeClassNameFromPath = (path) => path.split(nodepath.sep)
    .reverse()
    .find((x) => x !== "index.js")
    .replace(/(^.*)\.\w+$/, '$1')
    .replace(/\W+/g, '_');
