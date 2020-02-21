const headerBlock = require('./headerBlock');

const { 
    validateEpsg,
    bufferFlipper,
    uint8arrayToString,
  } = require('./helper');

class readHeader {
    constructor(options = {}) {
        this.inpuBuffer = options.inpuBuffer;
        this.inputArrayBuffer = options.inputArrayBuffer;
        this.inputDataView = options.inputDataView;
        this.currentByte = 0;
        this.numOfVarLenRecords = 0;
        this.projectionStart = 0;
    }

    getValues() {
        let publicHeaderBlock = {};
        headerBlock.publicHeaderBlock.forEach((obj) => {
            let myObj = this.getValue({...obj});             
            if (myObj !== undefined)  {
                if (myObj[0] === 'FileSignature' && myObj[1] !== 'LASF') {
                    throw new Error('Ivalid FileSignature. Is this a LAS/LAZ file');   
                }
                publicHeaderBlock[myObj[0]] = myObj[1];
            } 
        });

        let variableRecords = [];
        let variableLengthRecords = this.numOfVarLenRecords;
        
        while (variableLengthRecords--) {            
            let variableObj = {};            
            headerBlock.variableLengthRecord.forEach((obj) => {
                let myObj = this.getValue({...obj});
                variableObj[myObj[0]] = myObj[1];

                if (myObj[0] === 'UserId' && myObj[1] === 'LASF_Projection') {
                    this.projectionStart = this.currentByte - 18 + 54;
                } 
            });
            variableRecords.push(variableObj);
        }
        
        const geoRecord = variableRecords.find(x => x.UserId === 'LASF_Projection');
        const epsg = this.getGeoKeys(geoRecord);
        publicHeaderBlock['epsg'] = epsg;
        return publicHeaderBlock;
    }

    getGeoKeys(geoRecord) {
        
        if (geoRecord === undefined) {
            return undefined;
        }

        const projectionEnd = this.projectionStart + geoRecord.RecordLengthAfterHeader;                    
        const geoTag = this.inpuBuffer.slice(this.projectionStart, projectionEnd);        
        
        const inputArrayBuffer = bufferFlipper(geoTag);           
        const dataView = new DataView(inputArrayBuffer);
        
        let byteCount = 6;
        let numberOfKeys = Number(dataView.getUint16(byteCount, true));

        let geoKeys = [];

        while (numberOfKeys--) {
            let keyTmp = {};            
            keyTmp.key = dataView.getUint16(byteCount += 2, true);
            keyTmp.tiffTagLocation  = dataView.getUint16(byteCount += 2, true);
            keyTmp.count = dataView.getUint16(byteCount += 2, true);
            keyTmp.valueOffset  = dataView.getUint16(byteCount += 2, true);
            geoKeys.push(keyTmp);
        }

        const projRecord = geoKeys.find(x => x.key === 3072);        
        if (projRecord && projRecord.hasOwnProperty('valueOffset')) {
            const epsg = projRecord.valueOffset;
            if (validateEpsg(epsg)) {
                return epsg;
            }
            return undefined
        }
        return undefined;        
    }    
    
    getValue({item, format, size}) {        
        let str, array;        
        switch(format) {
            case 'char':
                array = new Uint8Array(this.inputArrayBuffer, this.currentByte, size);
                this.currentByte += size;
                str = uint8arrayToString(array);
                return [item, str];
            case 'uShort':
                str = this.inputDataView.getUint16(this.currentByte, true);
                this.currentByte += size;
                return [item, str];
            case 'uLong':
                str = this.inputDataView.getUint32(this.currentByte, true);
                if (item === 'NumberOfVariableLengthRecords') {
                    this.numOfVarLenRecords = str;
                }
                this.currentByte += size;
                return [item, str];
            case 'uChar':
                str = this.inputDataView.getUint8(this.currentByte);                
                this.currentByte += size;
                return [item, str];
            case 'double':
                str = this.inputDataView.getFloat64(this.currentByte, true);                
                this.currentByte += size;
                return [item, str];
            default:
                this.currentByte += size;
          }    
    }

};

module.exports = readHeader;
