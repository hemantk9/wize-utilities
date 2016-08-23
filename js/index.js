"use strict";
function objectDiff(a, b) {
    if (a === b) {
        return { changed: 'equal', value: a };
    }
    if (typeof a == 'object' && typeof b == 'object' && (JSON.stringify(a) === JSON.stringify(b))) {
        return { changed: 'equal', value: a };
    }
    var diff = {};
    var equal = true;
    var keys = Object.keys(a);
    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        if (b.hasOwnProperty(key)) {
            if (a[key] === b[key]) {
                diff[key] = { changed: 'equal', value: a[key] };
            }
            else {
                var typeA = typeof a[key];
                var typeB = typeof b[key];
                if (a[key] && b[key] && (typeA == 'object' || typeA == 'function') && (typeB == 'object' || typeB == 'function')) {
                    var valueDiff = objectDiff(a[key], b[key]);
                    if (valueDiff.changed == 'equal') {
                        diff[key] = { changed: 'equal', value: a[key] };
                    }
                    else {
                        equal = false;
                        diff[key] = valueDiff;
                    }
                }
                else {
                    equal = false;
                    diff[key] = { changed: 'primitive change', removed: a[key], added: b[key] };
                }
            }
        }
        else if (a[key] !== null && a[key] !== 'undefined' && a[key] !== '') {
            equal = false;
            diff[key] = { changed: 'removed', value: a[key] };
        }
        else {
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
    }
    else {
        var diffObject = { changed: 'object change', value: diff };
        for (let i in diffObject.value) {
            if (diffObject.value[i].changed == "equal") {
                delete diffObject.value[i];
            }
        }
        return diffObject;
    }
}
exports.objectDiff = objectDiff;
function generateProperKey(key) {
    if (key) {
        var _newKey = key.replace(/\W+/g, "");
        if (!isNaN(_newKey[0]))
            _newKey = '_' + _newKey;
        return _newKey;
    }
    return key;
}
function parse_date_code(v) {
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
    var out = { D: date, T: time, u: 86400 * (v - date) - time, y: 0, m: 0, d: 0, H: 0, M: 0, S: 0, q: 0 };
    if (Math.abs(out.u) < 1e-6)
        out.u = 0;
    if (out.u > 0.999) {
        out.u = 0;
        if (++time == 86400) {
            time = 0;
            ++date;
        }
    }
    if (date > 60)
        --date;
    var d = new Date(1900, 0, 1);
    d.setDate(d.getDate() + date - 1);
    dout = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    dow = d.getDay();
    if (date < 60)
        dow = (dow + 6) % 7;
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
//# sourceMappingURL=index.js.map