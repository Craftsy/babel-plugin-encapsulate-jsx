import {expect} from 'chai';
import {makeClassNameFromPath} from "../src/utils";

describe("makeClassNameFromPath", () => {
  it("trims /index.js", () => {
    expect(makeClassNameFromPath("/Folder/index.js")).to.equal("Folder");
  });
  it("trims file extension", () => {
    expect(makeClassNameFromPath("/Filename.js")).to.equal("Filename");
  });
  it("replaces non-word characters", () => {
    expect(makeClassNameFromPath("/multi word 123.js")).to.equal("multi_word_123");
  });
});
