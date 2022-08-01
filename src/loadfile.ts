
import { AbstractLevel } from 'abstract-level';
import fs from 'fs-extra';
import path from 'path';
import { Quadstore } from 'quadstore';
import { DataFactory, StreamParser } from 'n3';
import { disk, time } from './utils.js';

(async () => {

  const args = process.argv.slice(2);

  const filePath = args[0];
  const format = args[1] || 'text/turtle';

  if (!filePath) {
    console.log('\n\n  USAGE: node loadfile.js <filePath> [mimeType]\n\n');
    return;
  }

  await disk(async (backend: AbstractLevel<any, any, any>, checkDiskUsage) => {

    const store = new Quadstore({
      backend,
      dataFactory: DataFactory,
    });

    await store.open();
    const scope = await store.initScope();

    const absFilePath = path.resolve(process.cwd(), filePath);

    const fileReader = fs.createReadStream(absFilePath);
    const streamParser = new StreamParser({ format });

    // const { time: putTime } = await time(() => store.putStream(fileReader.pipe(streamParser), { scope }));
    const { time: putTime } = await time(() => store.putStream(fileReader.pipe(streamParser), { batchSize: 100 }));

    const diskUsage = await checkDiskUsage();

    console.log(`TIME: ${putTime} s`);
    console.log(`DISK: ${diskUsage}`);

    await store.close();

  });

})();
