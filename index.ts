export function objectDiff(a: any, b: any): {changed: string, value: any} {
    if (a===b) {
        return { changed: 'equal', value: a }
    }
    if (typeof a =='object' && typeof b == 'object' && (JSON.stringify(a) === JSON.stringify(b))) {
        return { changed: 'equal', value: a }
    }
    var diff: any = {};
    var equal = true;
    var keys = Object.keys(a);
    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        if (b.hasOwnProperty(key)) {
            if (a[key] === b[key]) {
                diff[key] = { changed: 'equal', value: a[key] };
            } else {
                var typeA = typeof a[key];
                var typeB = typeof b[key];
                if (a[key] && b[key] && (typeA == 'object' || typeA == 'function') && (typeB == 'object' || typeB == 'function')) {
                    var valueDiff = objectDiff(a[key], b[key]);
                    if (valueDiff.changed == 'equal') {
                        diff[key] = { changed: 'equal', value: a[key] };
                    } else {
                        equal = false;
                        diff[key] = valueDiff;
                    }
                } else {
                    equal = false;
                    diff[key] = { changed: 'primitive change', removed: a[key], added: b[key] };
                }
            }
        } else if(a[key] !== null && a[key] !== 'undefined' && a[key] !== '') {
            equal = false;
            diff[key] = { changed: 'removed', value: a[key] };
        } else {
            diff[key] = { changed: 'equal', value: a[key] };
        }
    }
    keys = Object.keys(b);
    for (i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (!a.hasOwnProperty(key)) {
            equal = false;
            diff[key] = { changed: 'added', value: b[key] };
        }
    }

    if (equal) {
        return { value: a, changed: 'equal' };
    } else {
        var diffObject = { changed: 'object change', value: diff }
        for (let i in diffObject.value) {
            if (diffObject.value[i].changed == "equal") {
                delete diffObject.value[i];
            }
        }
        return diffObject;
    }
}
function generateProperKey (key) {
    if (key) {
        var _newKey = key.replace(/\W+/g, "");
        if (!isNaN(_newKey[0])) _newKey = '_' + _newKey;
        return _newKey;
    }
    return key;
}
function parse_date_code (v) {
    if (isNaN(v)) {
        return null;
    }
    ;
    if (v > 2958465 || v < 0) {
        return null;
    }
    ;
    var date = (v | 0), time = Math.floor(86400 * (v - date)), dow = 0;
    var dout = [];
    var out = {D: date, T: time, u: 86400 * (v - date) - time, y: 0, m: 0, d: 0, H: 0, M: 0, S: 0, q: 0};
    if (Math.abs(out.u) < 1e-6) out.u = 0;
    if (out.u > 0.999) {
        out.u = 0;
        if (++time == 86400) {
            time = 0;
            ++date;
        }
    }

    if (date > 60) --date;
    /* 1 = Jan 1 1900 */
    var d = new Date(1900, 0, 1);
    d.setDate(d.getDate() + date - 1);
    dout = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    dow = d.getDay();
    if (date < 60) dow = (dow + 6) % 7;

    out.y = dout[0];
    out.m = dout[1];
    out.d = dout[2];
    out.S = time % 60;
    time = Math.floor(time / 60);
    out.M = time % 60;
    time = Math.floor(time / 60);
    out.H = time;
    out.q = dow;
    return new Date(out.y, out.m - 1, out.d, out.H, out.M, out.S);
}
// function parseExcelData(filePath, colsData) {
//     var self = this;
//     let json = xlsx.parse(filePath);
//     let data = json[0] && json[0].data ? json[0].data : [];
//     let cols = {};
//     let saveData = [];
//     colsData = colsData && colsData.length > 0 ? _.indexBy(colsData, 'name') : {};
//     if (data.length > 0) {
//         for (var j in data[0]) {
//             let colName = data[0][j];
//             if (colsData && colsData[colName]) {
//                 cols[j] = colsData[colName];
//             }
//         }
//     }
//     for (var key in data) {
//         if (key != 0) {
//             let _dataItem = {};
//             for (var j in data[key]) {
//                 if (cols[j] && cols[j].type) {
//                     switch (cols[j].type) {
//                         case 'Date':
//                             if (typeof data[key][j] === 'number') {
//                                 data[key][j] = this.parse_date_code(data[key][j]);
//                             } else {
//                                 let _dateVal = Date.parse(String(data[key][j]).replace(/[TZ]/g, " "));
//                                 if (!isNaN(_dateVal)) {
//                                     data[key][j] = new Date(_dateVal).toISOString();
//                                 } else {
//                                     delete data[key][j];
//                                 }
//                             }
//                             break;
//                         case 'Boolean':
//                             if (typeof data[key][j] === 'boolean' || data[key][j] !== '') {
//                                 data[key][j] = String(data[key][j]).toLowerCase() == 'false' || String(data[key][j]).toLowerCase() == "0" ? false : Boolean(String(data[key][j]).toLowerCase());
//                             } else {
//                                 delete data[key][j];
//                             }
//                             break;
//                         case 'Array':
//                         case 'Ref_Many':
//                             if (data[key][j] !== '') {
//                                 let _val = String(data[key][j]).replace(/ /g, '').split(',');
//                                 data[key][j] = _val ? _val : [];
//                             } else {
//                                 delete data[key][j];
//                             }
//                             break;
//                         case 'Object':
//                             if (data[key][j] !== '') {
//                                 let _val = this.parseValidJson(data[key][j]);
//                                 data[key][j] = _val.value ? _val.value : {};
//                             } else {
//                                 delete data[key][j];
//                             }
//                             break;
//                         case 'Number':
//                             if (data[key][j] === null || data[key][j] === '') {
//                                 delete data[key][j];
//                             }
//                             break;
//                         case 'CODE':
//                         case 'String':
//                         case 'Ref_One':
//                             if (data[key][j] === '') {
//                                 delete data[key][j];
//                             }
//                     }
//                     if (data[key][j] != undefined) {
//                         _dataItem[cols[j].name] = data[key][j];
//                     }
//                 }
//             }
//             if (Object.keys(_dataItem).length > 0)
//                 saveData.push(_dataItem);
//         }
//     }
//     return {"columns": cols, data: saveData};
// }
// function parseCsvData(filePath, colsData, cb) {
//     var converter = new Converter({});
//     var cols = {};
//     //end_parsed will be emitted once parsing finished
//     converter.on("end_parsed", function (jsonArray) {
//         //here is your result jsonArray
//         if (jsonArray && jsonArray.length > 0) {
//             _.each(Object.keys(jsonArray[0]), function (key) {
//                 if (colsData && colsData[key]) {
//                     cols[key] = colsData[key];
//                 } else {
//                     cols[key] = {
//                         name: key,
//                         displayName: key,
//                         type: "String",
//                         trim: false,
//                         required: false,
//                         unique: false,
//                         index: false,
//                         readRoles: [],
//                         writeRoles: []
//                     };
//                 }
//             });
//         }
//         cb({"columns": cols, data: jsonArray});
//     });

//     //read from file
//     fs.createReadStream(filePath).pipe(converter);
// }