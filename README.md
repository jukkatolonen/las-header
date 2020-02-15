# las-header

Lightweight JavaScript library for reading the header of LAS/LAZ files

# Install
```
$ npm i las-header
```

# Usage
```
const lasHeader = require('las-header');
or
import lasHeader from 'las-header';
```

**From File object**
```
const header = await lasHeader.readFileObject({input: files[0]});
```

**From URL**
```
const header = await lasHeader.readUrl({input: myUrl});
```

**From local LAS/LAZ file (Node only)**
```
const header = lasHeader.readLocalFile({input: path/to/file.laz});
```

Sample output:
```
{ 
  FileSignature: 'LASF',
  FileSoureceID: 0,
  GlobalEncoding: 0,
  VersionMajor: 1,
  VersionMinor: 2,
  SystemIdentifier: 'PDAL',
  GeneratingSoftware: 'PDAL 1.5.0 (424c25)',
  CreationDay: 50,
  CreationYear: 2018,
  HeaderSize: 227,
  OffsetToPointData: 621,
  NumberOfVariableLengthRecords: 4,
  PointDataFormatID: 131,
  PointDataRecordLength: 34,
  NumberOfPoints: 24318764,
  NumberOfPointByReturn: 0,
  ScaleFactorX: 0.001,
  ScaleFactorY: 0.001,
  ScaleFactorZ: 0.001,
  OffsetX: 475000,
  OffsetY: 7212000,
  OffsetZ: 0,
  MaxX: 475111.573,
  MinX: 474773.203,
  MaxY: 7212849.161,
  MinY: 7212550.753,
  MaxZ: 38.608000000000004,
  MinZ: -195.541,
  epsg: 3133 
}
```
