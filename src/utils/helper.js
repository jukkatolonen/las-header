const fs = require('fs');
const epsgCheck = require('epsg-index/all.json');
const fetch = require('node-fetch');
const bufferLib = require('buffer/').Buffer

const bufferFromLocalFile = ({input, start = 0, end = 2000}) => {
  const buffer = new Buffer.alloc(end - start);
  const fileD = fs.openSync(input, 'r');
  fs.readSync(fileD, buffer, 0, end - start, start);
  fs.closeSync(fileD);  
  return buffer;
}

const bufferFromUrl = async ({input}) => {    
    return await fetch(input)
        .then(async (res) => {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = bufferLib.from(arrayBuffer);             
            return {buffer, arrayBuffer};
        });
};

const validateEpsg = (epsg) => {    
    if (epsgCheck[epsg.toString()]) {
        return true;
    };
    return false;
};

const bufferFlipper = (buf) => {    
    let ab = new ArrayBuffer(buf.length);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
};

const uint8arrayToString = (array) => {
    let str = ''
    array.forEach((item) => {
        let c = String.fromCharCode(item);
        if (c !== '\u0000') {
            str += c;
        }
    });
    return str.trim();
};

const fileObjToBuffer = async ({input, start = 0, end = 2000}) => {
    const arrayBuffer = await fileObjToArrBuffer({input, start, end});
    const buffer = bufferLib.from(arrayBuffer);
    return {buffer, arrayBuffer}; 
};

const fileObjToArrBuffer = async ({input, start, end}) => {
    return new Promise((resolve, reject) => {
        const blob = input.slice(start, end);
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
};

module.exports = {
    bufferFromLocalFile,
    bufferFromUrl,
    validateEpsg,
    bufferFlipper,
    uint8arrayToString,
    fileObjToBuffer,
};