import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const emptyDatabase = {
  transactions: []
};

export class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const content = await readFile(this.filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      await this.write(emptyDatabase);
      return structuredClone(emptyDatabase);
    }
  }

  async write(database) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(database, null, 2)}\n`);
  }
}
