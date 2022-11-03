import { parseArrayBuffer } from 'midi-json-parser';
import { encode } from 'json-midi-encoder';
const zlib = require('zlib');

export const compress = async (midiArrayBuffer) => {
    const json = await parseArrayBuffer(midiArrayBuffer);
    console.log("midi json : ", json);

    var jsonStr = JSON.stringify(json);
    console.log("midi json string : ", JSON.stringify(json));

    jsonStr = jsonStr.replaceAll('microsecondsPerQuarter', '_m');
    jsonStr = jsonStr.replaceAll('delta', '_d');
    jsonStr = jsonStr.replaceAll('setTempo', '_s');

    const compressed = zlib.gzipSync(jsonStr).toString('base64');
    console.log("compressed : ", compressed);

    return compressed;
};

export const decompress = async (compressed) => {
    const buffer = Buffer.from(compressed, 'base64');
    var jsonStr = zlib.unzipSync(buffer).toString('utf-8');

    jsonStr = jsonStr.replaceAll('_m', 'microsecondsPerQuarter');
    jsonStr = jsonStr.replaceAll('_d', 'delta');
    jsonStr = jsonStr.replaceAll('_s', 'setTempo');

    const json = JSON.parse(jsonStr);
    
    const midiArrayBuffer = await encode(json);
    
    return midiArrayBuffer;
};
