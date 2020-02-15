const readHeader = require('./utils/readHeader');

const { 
    bufferFromLocalFile, 
    bufferFlipper,
    bufferFromUrl,
    fileObjToBuffer,
 } = require('./utils/helper');

const assertInput = (options) => {    
    if (!options.input) {
        throw new Error('las-header: Input required');   
    }  
};

const fromLocalFile = (options = {}) => { 
    assertInput(options);
    const input = options.input;
    const buffer = bufferFromLocalFile({input});
    return parseHeaders({buffer}); 
};

const fromUrl = async (options = {}) => { 
    assertInput(options);
    const input = options.input;
    //const inpuBuffer = await bufferFromUrl({input});            
    const {buffer, arrayBuffer} = await bufferFromUrl({input});
    return parseHeaders({buffer, arrayBuffer});   
};

const fromFileObject = async (options = {}) => {
    assertInput(options);
    const input = options.input;
    //const inpuBuffer = await fileObjToBuffer({input});
    const {buffer, arrayBuffer} = await fileObjToBuffer({input});
    return parseHeaders({buffer, arrayBuffer}); 
}

const parseHeaders = (options = {}) => {
    const inputArrayBuffer = options.arrayBuffer ? 
        options.arrayBuffer : bufferFlipper(options.buffer);      
    const inputDataView = new DataView(inputArrayBuffer);            
    const header = new readHeader({
        inpuBuffer: options.buffer, 
        inputArrayBuffer, 
        inputDataView,
    });      
    return header.getValues();      
}

module.exports = {
    fromLocalFile,
    fromUrl,
    fromFileObject,
};