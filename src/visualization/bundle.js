(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {exports: {}};
                e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }

        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }

    return r
})()({
    1: [function (require, module, exports) {
        module.exports = after;

        function after(count, callback, err_cb) {
            var bail = false;
            err_cb = err_cb || noop;
            proxy.count = count;

            return (count === 0) ? callback() : proxy;

            function proxy(err, result) {
                if (proxy.count <= 0) {
                    throw new Error('after called too many times')
                }
                --proxy.count;

                // after first error, rest are passed to err_cb
                if (err) {
                    bail = true;
                    callback(err);
                    // future error callbacks will go to error handler
                    callback = err_cb
                } else if (proxy.count === 0 && !bail) {
                    callback(null, result)
                }
            }
        }

        function noop() {
        }

    }, {}],
    2: [function (require, module, exports) {
        /**
         * An abstraction for slicing an arraybuffer even when
         * ArrayBuffer.prototype.slice is not supported
         *
         * @api public
         */

        module.exports = function (arraybuffer, start, end) {
            var bytes = arraybuffer.byteLength;
            start = start || 0;
            end = end || bytes;

            if (arraybuffer.slice) {
                return arraybuffer.slice(start, end);
            }

            if (start < 0) {
                start += bytes;
            }
            if (end < 0) {
                end += bytes;
            }
            if (end > bytes) {
                end = bytes;
            }

            if (start >= bytes || start >= end || bytes === 0) {
                return new ArrayBuffer(0);
            }

            var abv = new Uint8Array(arraybuffer);
            var result = new Uint8Array(end - start);
            for (var i = start, ii = 0; i < end; i++, ii++) {
                result[ii] = abv[i];
            }
            return result.buffer;
        };

    }, {}],
    3: [function (require, module, exports) {

        /**
         * Expose `Backoff`.
         */

        module.exports = Backoff;

        /**
         * Initialize backoff timer with `opts`.
         *
         * - `min` initial timeout in milliseconds [100]
         * - `max` max timeout [10000]
         * - `jitter` [0]
         * - `factor` [2]
         *
         * @param {Object} opts
         * @api public
         */

        function Backoff(opts) {
            opts = opts || {};
            this.ms = opts.min || 100;
            this.max = opts.max || 10000;
            this.factor = opts.factor || 2;
            this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
            this.attempts = 0;
        }

        /**
         * Return the backoff duration.
         *
         * @return {Number}
         * @api public
         */

        Backoff.prototype.duration = function () {
            var ms = this.ms * Math.pow(this.factor, this.attempts++);
            if (this.jitter) {
                var rand = Math.random();
                var deviation = Math.floor(rand * this.jitter * ms);
                ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
            }
            return Math.min(ms, this.max) | 0;
        };

        /**
         * Reset the number of attempts.
         *
         * @api public
         */

        Backoff.prototype.reset = function () {
            this.attempts = 0;
        };

        /**
         * Set the minimum duration
         *
         * @api public
         */

        Backoff.prototype.setMin = function (min) {
            this.ms = min;
        };

        /**
         * Set the maximum duration
         *
         * @api public
         */

        Backoff.prototype.setMax = function (max) {
            this.max = max;
        };

        /**
         * Set the jitter
         *
         * @api public
         */

        Backoff.prototype.setJitter = function (jitter) {
            this.jitter = jitter;
        };


    }, {}],
    4: [function (require, module, exports) {
        /*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
        (function () {
            "use strict";

            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

            // Use a lookup table to find the index.
            var lookup = new Uint8Array(256);
            for (var i = 0; i < chars.length; i++) {
                lookup[chars.charCodeAt(i)] = i;
            }

            exports.encode = function (arraybuffer) {
                var bytes = new Uint8Array(arraybuffer),
                    i, len = bytes.length, base64 = "";

                for (i = 0; i < len; i += 3) {
                    base64 += chars[bytes[i] >> 2];
                    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                    base64 += chars[bytes[i + 2] & 63];
                }

                if ((len % 3) === 2) {
                    base64 = base64.substring(0, base64.length - 1) + "=";
                } else if (len % 3 === 1) {
                    base64 = base64.substring(0, base64.length - 2) + "==";
                }

                return base64;
            };

            exports.decode = function (base64) {
                var bufferLength = base64.length * 0.75,
                    len = base64.length, i, p = 0,
                    encoded1, encoded2, encoded3, encoded4;

                if (base64[base64.length - 1] === "=") {
                    bufferLength--;
                    if (base64[base64.length - 2] === "=") {
                        bufferLength--;
                    }
                }

                var arraybuffer = new ArrayBuffer(bufferLength),
                    bytes = new Uint8Array(arraybuffer);

                for (i = 0; i < len; i += 4) {
                    encoded1 = lookup[base64.charCodeAt(i)];
                    encoded2 = lookup[base64.charCodeAt(i + 1)];
                    encoded3 = lookup[base64.charCodeAt(i + 2)];
                    encoded4 = lookup[base64.charCodeAt(i + 3)];

                    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
                }

                return arraybuffer;
            };
        })();

    }, {}],
    5: [function (require, module, exports) {
        (function (global) {
            /**
             * Create a blob builder even when vendor prefixes exist
             */

            var BlobBuilder = global.BlobBuilder
                || global.WebKitBlobBuilder
                || global.MSBlobBuilder
                || global.MozBlobBuilder;

            /**
             * Check if Blob constructor is supported
             */

            var blobSupported = (function () {
                try {
                    var a = new Blob(['hi']);
                    return a.size === 2;
                } catch (e) {
                    return false;
                }
            })();

            /**
             * Check if Blob constructor supports ArrayBufferViews
             * Fails in Safari 6, so we need to map to ArrayBuffers there.
             */

            var blobSupportsArrayBufferView = blobSupported && (function () {
                try {
                    var b = new Blob([new Uint8Array([1, 2])]);
                    return b.size === 2;
                } catch (e) {
                    return false;
                }
            })();

            /**
             * Check if BlobBuilder is supported
             */

            var blobBuilderSupported = BlobBuilder
                && BlobBuilder.prototype.append
                && BlobBuilder.prototype.getBlob;

            /**
             * Helper function that maps ArrayBufferViews to ArrayBuffers
             * Used by BlobBuilder constructor and old browsers that didn't
             * support it in the Blob constructor.
             */

            function mapArrayBufferViews(ary) {
                for (var i = 0; i < ary.length; i++) {
                    var chunk = ary[i];
                    if (chunk.buffer instanceof ArrayBuffer) {
                        var buf = chunk.buffer;

                        // if this is a subarray, make a copy so we only
                        // include the subarray region from the underlying buffer
                        if (chunk.byteLength !== buf.byteLength) {
                            var copy = new Uint8Array(chunk.byteLength);
                            copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
                            buf = copy.buffer;
                        }

                        ary[i] = buf;
                    }
                }
            }

            function BlobBuilderConstructor(ary, options) {
                options = options || {};

                var bb = new BlobBuilder();
                mapArrayBufferViews(ary);

                for (var i = 0; i < ary.length; i++) {
                    bb.append(ary[i]);
                }

                return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
            }

            function BlobConstructor(ary, options) {
                mapArrayBufferViews(ary);
                return new Blob(ary, options || {});
            }

            module.exports = (function () {
                if (blobSupported) {
                    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
                } else if (blobBuilderSupported) {
                    return BlobBuilderConstructor;
                } else {
                    return undefined;
                }
            })();

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    6: [function (require, module, exports) {
        /**
         * Slice reference.
         */

        var slice = [].slice;

        /**
         * Bind `obj` to `fn`.
         *
         * @param {Object} obj
         * @param {Function|String} fn or string
         * @return {Function}
         * @api public
         */

        module.exports = function (obj, fn) {
            if ('string' == typeof fn) fn = obj[fn];
            if ('function' != typeof fn) throw new Error('bind() requires a function');
            var args = slice.call(arguments, 2);
            return function () {
                return fn.apply(obj, args.concat(slice.call(arguments)));
            }
        };

    }, {}],
    7: [function (require, module, exports) {

        /**
         * Expose `Emitter`.
         */

        if (typeof module !== 'undefined') {
            module.exports = Emitter;
        }

        /**
         * Initialize a new `Emitter`.
         *
         * @api public
         */

        function Emitter(obj) {
            if (obj) return mixin(obj);
        }

        /**
         * Mixin the emitter properties.
         *
         * @param {Object} obj
         * @return {Object}
         * @api private
         */

        function mixin(obj) {
            for (var key in Emitter.prototype) {
                obj[key] = Emitter.prototype[key];
            }
            return obj;
        }

        /**
         * Listen on the given `event` with `fn`.
         *
         * @param {String} event
         * @param {Function} fn
         * @return {Emitter}
         * @api public
         */

        Emitter.prototype.on =
            Emitter.prototype.addEventListener = function (event, fn) {
                this._callbacks = this._callbacks || {};
                (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
                    .push(fn);
                return this;
            };

        /**
         * Adds an `event` listener that will be invoked a single
         * time then automatically removed.
         *
         * @param {String} event
         * @param {Function} fn
         * @return {Emitter}
         * @api public
         */

        Emitter.prototype.once = function (event, fn) {
            function on() {
                this.off(event, on);
                fn.apply(this, arguments);
            }

            on.fn = fn;
            this.on(event, on);
            return this;
        };

        /**
         * Remove the given callback for `event` or all
         * registered callbacks.
         *
         * @param {String} event
         * @param {Function} fn
         * @return {Emitter}
         * @api public
         */

        Emitter.prototype.off =
            Emitter.prototype.removeListener =
                Emitter.prototype.removeAllListeners =
                    Emitter.prototype.removeEventListener = function (event, fn) {
                        this._callbacks = this._callbacks || {};

                        // all
                        if (0 == arguments.length) {
                            this._callbacks = {};
                            return this;
                        }

                        // specific event
                        var callbacks = this._callbacks['$' + event];
                        if (!callbacks) return this;

                        // remove all handlers
                        if (1 == arguments.length) {
                            delete this._callbacks['$' + event];
                            return this;
                        }

                        // remove specific handler
                        var cb;
                        for (var i = 0; i < callbacks.length; i++) {
                            cb = callbacks[i];
                            if (cb === fn || cb.fn === fn) {
                                callbacks.splice(i, 1);
                                break;
                            }
                        }
                        return this;
                    };

        /**
         * Emit `event` with the given args.
         *
         * @param {String} event
         * @param {Mixed} ...
         * @return {Emitter}
         */

        Emitter.prototype.emit = function (event) {
            this._callbacks = this._callbacks || {};
            var args = [].slice.call(arguments, 1)
                , callbacks = this._callbacks['$' + event];

            if (callbacks) {
                callbacks = callbacks.slice(0);
                for (var i = 0, len = callbacks.length; i < len; ++i) {
                    callbacks[i].apply(this, args);
                }
            }

            return this;
        };

        /**
         * Return array of callbacks for `event`.
         *
         * @param {String} event
         * @return {Array}
         * @api public
         */

        Emitter.prototype.listeners = function (event) {
            this._callbacks = this._callbacks || {};
            return this._callbacks['$' + event] || [];
        };

        /**
         * Check if this emitter has `event` handlers.
         *
         * @param {String} event
         * @return {Boolean}
         * @api public
         */

        Emitter.prototype.hasListeners = function (event) {
            return !!this.listeners(event).length;
        };

    }, {}],
    8: [function (require, module, exports) {

        module.exports = function (a, b) {
            var fn = function () {
            };
            fn.prototype = b.prototype;
            a.prototype = new fn;
            a.prototype.constructor = a;
        };
    }, {}],
    9: [function (require, module, exports) {
        !function () {
            var d3 = {
                version: "3.5.17"
            };
            var d3_arraySlice = [].slice, d3_array = function (list) {
                return d3_arraySlice.call(list);
            };
            var d3_document = this.document;

            function d3_documentElement(node) {
                return node && (node.ownerDocument || node.document || node).documentElement;
            }

            function d3_window(node) {
                return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
            }

            if (d3_document) {
                try {
                    d3_array(d3_document.documentElement.childNodes)[0].nodeType;
                } catch (e) {
                    d3_array = function (list) {
                        var i = list.length, array = new Array(i);
                        while (i--) array[i] = list[i];
                        return array;
                    };
                }
            }
            if (!Date.now) Date.now = function () {
                return +new Date();
            };
            if (d3_document) {
                try {
                    d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
                } catch (error) {
                    var d3_element_prototype = this.Element.prototype,
                        d3_element_setAttribute = d3_element_prototype.setAttribute,
                        d3_element_setAttributeNS = d3_element_prototype.setAttributeNS,
                        d3_style_prototype = this.CSSStyleDeclaration.prototype,
                        d3_style_setProperty = d3_style_prototype.setProperty;
                    d3_element_prototype.setAttribute = function (name, value) {
                        d3_element_setAttribute.call(this, name, value + "");
                    };
                    d3_element_prototype.setAttributeNS = function (space, local, value) {
                        d3_element_setAttributeNS.call(this, space, local, value + "");
                    };
                    d3_style_prototype.setProperty = function (name, value, priority) {
                        d3_style_setProperty.call(this, name, value + "", priority);
                    };
                }
            }
            d3.ascending = d3_ascending;

            function d3_ascending(a, b) {
                return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
            }

            d3.descending = function (a, b) {
                return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
            };
            d3.min = function (array, f) {
                var i = -1, n = array.length, a, b;
                if (arguments.length === 1) {
                    while (++i < n) if ((b = array[i]) != null && b >= b) {
                        a = b;
                        break;
                    }
                    while (++i < n) if ((b = array[i]) != null && a > b) a = b;
                } else {
                    while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
                        a = b;
                        break;
                    }
                    while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
                }
                return a;
            };
            d3.max = function (array, f) {
                var i = -1, n = array.length, a, b;
                if (arguments.length === 1) {
                    while (++i < n) if ((b = array[i]) != null && b >= b) {
                        a = b;
                        break;
                    }
                    while (++i < n) if ((b = array[i]) != null && b > a) a = b;
                } else {
                    while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
                        a = b;
                        break;
                    }
                    while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
                }
                return a;
            };
            d3.extent = function (array, f) {
                var i = -1, n = array.length, a, b, c;
                if (arguments.length === 1) {
                    while (++i < n) if ((b = array[i]) != null && b >= b) {
                        a = c = b;
                        break;
                    }
                    while (++i < n) if ((b = array[i]) != null) {
                        if (a > b) a = b;
                        if (c < b) c = b;
                    }
                } else {
                    while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
                        a = c = b;
                        break;
                    }
                    while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
                        if (a > b) a = b;
                        if (c < b) c = b;
                    }
                }
                return [a, c];
            };

            function d3_number(x) {
                return x === null ? NaN : +x;
            }

            function d3_numeric(x) {
                return !isNaN(x);
            }

            d3.sum = function (array, f) {
                var s = 0, n = array.length, a, i = -1;
                if (arguments.length === 1) {
                    while (++i < n) if (d3_numeric(a = +array[i])) s += a;
                } else {
                    while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
                }
                return s;
            };
            d3.mean = function (array, f) {
                var s = 0, n = array.length, a, i = -1, j = n;
                if (arguments.length === 1) {
                    while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
                } else {
                    while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
                }
                if (j) return s / j;
            };
            d3.quantile = function (values, p) {
                var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
                return e ? v + e * (values[h] - v) : v;
            };
            d3.median = function (array, f) {
                var numbers = [], n = array.length, a, i = -1;
                if (arguments.length === 1) {
                    while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
                } else {
                    while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
                }
                if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
            };
            d3.variance = function (array, f) {
                var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
                if (arguments.length === 1) {
                    while (++i < n) {
                        if (d3_numeric(a = d3_number(array[i]))) {
                            d = a - m;
                            m += d / ++j;
                            s += d * (a - m);
                        }
                    }
                } else {
                    while (++i < n) {
                        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
                            d = a - m;
                            m += d / ++j;
                            s += d * (a - m);
                        }
                    }
                }
                if (j > 1) return s / (j - 1);
            };
            d3.deviation = function () {
                var v = d3.variance.apply(this, arguments);
                return v ? Math.sqrt(v) : v;
            };

            function d3_bisector(compare) {
                return {
                    left: function (a, x, lo, hi) {
                        if (arguments.length < 3) lo = 0;
                        if (arguments.length < 4) hi = a.length;
                        while (lo < hi) {
                            var mid = lo + hi >>> 1;
                            if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
                        }
                        return lo;
                    },
                    right: function (a, x, lo, hi) {
                        if (arguments.length < 3) lo = 0;
                        if (arguments.length < 4) hi = a.length;
                        while (lo < hi) {
                            var mid = lo + hi >>> 1;
                            if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
                        }
                        return lo;
                    }
                };
            }

            var d3_bisect = d3_bisector(d3_ascending);
            d3.bisectLeft = d3_bisect.left;
            d3.bisect = d3.bisectRight = d3_bisect.right;
            d3.bisector = function (f) {
                return d3_bisector(f.length === 1 ? function (d, x) {
                    return d3_ascending(f(d), x);
                } : f);
            };
            d3.shuffle = function (array, i0, i1) {
                if ((m = arguments.length) < 3) {
                    i1 = array.length;
                    if (m < 2) i0 = 0;
                }
                var m = i1 - i0, t, i;
                while (m) {
                    i = Math.random() * m-- | 0;
                    t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
                }
                return array;
            };
            d3.permute = function (array, indexes) {
                var i = indexes.length, permutes = new Array(i);
                while (i--) permutes[i] = array[indexes[i]];
                return permutes;
            };
            d3.pairs = function (array) {
                var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
                while (i < n) pairs[i] = [p0 = p1, p1 = array[++i]];
                return pairs;
            };
            d3.transpose = function (matrix) {
                if (!(n = matrix.length)) return [];
                for (var i = -1, m = d3.min(matrix, d3_transposeLength), transpose = new Array(m); ++i < m;) {
                    for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
                        row[j] = matrix[j][i];
                    }
                }
                return transpose;
            };

            function d3_transposeLength(d) {
                return d.length;
            }

            d3.zip = function () {
                return d3.transpose(arguments);
            };
            d3.keys = function (map) {
                var keys = [];
                for (var key in map) keys.push(key);
                return keys;
            };
            d3.values = function (map) {
                var values = [];
                for (var key in map) values.push(map[key]);
                return values;
            };
            d3.entries = function (map) {
                var entries = [];
                for (var key in map) entries.push({
                    key: key,
                    value: map[key]
                });
                return entries;
            };
            d3.merge = function (arrays) {
                var n = arrays.length, m, i = -1, j = 0, merged, array;
                while (++i < n) j += arrays[i].length;
                merged = new Array(j);
                while (--n >= 0) {
                    array = arrays[n];
                    m = array.length;
                    while (--m >= 0) {
                        merged[--j] = array[m];
                    }
                }
                return merged;
            };
            var abs = Math.abs;
            d3.range = function (start, stop, step) {
                if (arguments.length < 3) {
                    step = 1;
                    if (arguments.length < 2) {
                        stop = start;
                        start = 0;
                    }
                }
                if ((stop - start) / step === Infinity) throw new Error("infinite range");
                var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
                start *= k, stop *= k, step *= k;
                if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
                return range;
            };

            function d3_range_integerScale(x) {
                var k = 1;
                while (x * k % 1) k *= 10;
                return k;
            }

            function d3_class(ctor, properties) {
                for (var key in properties) {
                    Object.defineProperty(ctor.prototype, key, {
                        value: properties[key],
                        enumerable: false
                    });
                }
            }

            d3.map = function (object, f) {
                var map = new d3_Map();
                if (object instanceof d3_Map) {
                    object.forEach(function (key, value) {
                        map.set(key, value);
                    });
                } else if (Array.isArray(object)) {
                    var i = -1, n = object.length, o;
                    if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
                } else {
                    for (var key in object) map.set(key, object[key]);
                }
                return map;
            };

            function d3_Map() {
                this._ = Object.create(null);
            }

            var d3_map_proto = "__proto__", d3_map_zero = "\x00";
            d3_class(d3_Map, {
                has: d3_map_has,
                get: function (key) {
                    return this._[d3_map_escape(key)];
                },
                set: function (key, value) {
                    return this._[d3_map_escape(key)] = value;
                },
                remove: d3_map_remove,
                keys: d3_map_keys,
                values: function () {
                    var values = [];
                    for (var key in this._) values.push(this._[key]);
                    return values;
                },
                entries: function () {
                    var entries = [];
                    for (var key in this._) entries.push({
                        key: d3_map_unescape(key),
                        value: this._[key]
                    });
                    return entries;
                },
                size: d3_map_size,
                empty: d3_map_empty,
                forEach: function (f) {
                    for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
                }
            });

            function d3_map_escape(key) {
                return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
            }

            function d3_map_unescape(key) {
                return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
            }

            function d3_map_has(key) {
                return d3_map_escape(key) in this._;
            }

            function d3_map_remove(key) {
                return (key = d3_map_escape(key)) in this._ && delete this._[key];
            }

            function d3_map_keys() {
                var keys = [];
                for (var key in this._) keys.push(d3_map_unescape(key));
                return keys;
            }

            function d3_map_size() {
                var size = 0;
                for (var key in this._) ++size;
                return size;
            }

            function d3_map_empty() {
                for (var key in this._) return false;
                return true;
            }

            d3.nest = function () {
                var nest = {}, keys = [], sortKeys = [], sortValues, rollup;

                function map(mapType, array, depth) {
                    if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
                    var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter,
                        valuesByKey = new d3_Map(), values;
                    while (++i < n) {
                        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
                            values.push(object);
                        } else {
                            valuesByKey.set(keyValue, [object]);
                        }
                    }
                    if (mapType) {
                        object = mapType();
                        setter = function (keyValue, values) {
                            object.set(keyValue, map(mapType, values, depth));
                        };
                    } else {
                        object = {};
                        setter = function (keyValue, values) {
                            object[keyValue] = map(mapType, values, depth);
                        };
                    }
                    valuesByKey.forEach(setter);
                    return object;
                }

                function entries(map, depth) {
                    if (depth >= keys.length) return map;
                    var array = [], sortKey = sortKeys[depth++];
                    map.forEach(function (key, keyMap) {
                        array.push({
                            key: key,
                            values: entries(keyMap, depth)
                        });
                    });
                    return sortKey ? array.sort(function (a, b) {
                        return sortKey(a.key, b.key);
                    }) : array;
                }

                nest.map = function (array, mapType) {
                    return map(mapType, array, 0);
                };
                nest.entries = function (array) {
                    return entries(map(d3.map, array, 0), 0);
                };
                nest.key = function (d) {
                    keys.push(d);
                    return nest;
                };
                nest.sortKeys = function (order) {
                    sortKeys[keys.length - 1] = order;
                    return nest;
                };
                nest.sortValues = function (order) {
                    sortValues = order;
                    return nest;
                };
                nest.rollup = function (f) {
                    rollup = f;
                    return nest;
                };
                return nest;
            };
            d3.set = function (array) {
                var set = new d3_Set();
                if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
                return set;
            };

            function d3_Set() {
                this._ = Object.create(null);
            }

            d3_class(d3_Set, {
                has: d3_map_has,
                add: function (key) {
                    this._[d3_map_escape(key += "")] = true;
                    return key;
                },
                remove: d3_map_remove,
                values: d3_map_keys,
                size: d3_map_size,
                empty: d3_map_empty,
                forEach: function (f) {
                    for (var key in this._) f.call(this, d3_map_unescape(key));
                }
            });
            d3.behavior = {};

            function d3_identity(d) {
                return d;
            }

            d3.rebind = function (target, source) {
                var i = 1, n = arguments.length, method;
                while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
                return target;
            };

            function d3_rebind(target, source, method) {
                return function () {
                    var value = method.apply(source, arguments);
                    return value === source ? target : value;
                };
            }

            function d3_vendorSymbol(object, name) {
                if (name in object) return name;
                name = name.charAt(0).toUpperCase() + name.slice(1);
                for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
                    var prefixName = d3_vendorPrefixes[i] + name;
                    if (prefixName in object) return prefixName;
                }
            }

            var d3_vendorPrefixes = ["webkit", "ms", "moz", "Moz", "o", "O"];

            function d3_noop() {
            }

            d3.dispatch = function () {
                var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
                while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
                return dispatch;
            };

            function d3_dispatch() {
            }

            d3_dispatch.prototype.on = function (type, listener) {
                var i = type.indexOf("."), name = "";
                if (i >= 0) {
                    name = type.slice(i + 1);
                    type = type.slice(0, i);
                }
                if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
                if (arguments.length === 2) {
                    if (listener == null) for (type in this) {
                        if (this.hasOwnProperty(type)) this[type].on(name, null);
                    }
                    return this;
                }
            };

            function d3_dispatch_event(dispatch) {
                var listeners = [], listenerByName = new d3_Map();

                function event() {
                    var z = listeners, i = -1, n = z.length, l;
                    while (++i < n) if (l = z[i].on) l.apply(this, arguments);
                    return dispatch;
                }

                event.on = function (name, listener) {
                    var l = listenerByName.get(name), i;
                    if (arguments.length < 2) return l && l.on;
                    if (l) {
                        l.on = null;
                        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
                        listenerByName.remove(name);
                    }
                    if (listener) listeners.push(listenerByName.set(name, {
                        on: listener
                    }));
                    return dispatch;
                };
                return event;
            }

            d3.event = null;

            function d3_eventPreventDefault() {
                d3.event.preventDefault();
            }

            function d3_eventSource() {
                var e = d3.event, s;
                while (s = e.sourceEvent) e = s;
                return e;
            }

            function d3_eventDispatch(target) {
                var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
                while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
                dispatch.of = function (thiz, argumentz) {
                    return function (e1) {
                        try {
                            var e0 = e1.sourceEvent = d3.event;
                            e1.target = target;
                            d3.event = e1;
                            dispatch[e1.type].apply(thiz, argumentz);
                        } finally {
                            d3.event = e0;
                        }
                    };
                };
                return dispatch;
            }

            d3.requote = function (s) {
                return s.replace(d3_requote_re, "\\$&");
            };
            var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
            var d3_subclass = {}.__proto__ ? function (object, prototype) {
                object.__proto__ = prototype;
            } : function (object, prototype) {
                for (var property in prototype) object[property] = prototype[property];
            };

            function d3_selection(groups) {
                d3_subclass(groups, d3_selectionPrototype);
                return groups;
            }

            var d3_select = function (s, n) {
                return n.querySelector(s);
            }, d3_selectAll = function (s, n) {
                return n.querySelectorAll(s);
            }, d3_selectMatches = function (n, s) {
                var d3_selectMatcher = n.matches || n[d3_vendorSymbol(n, "matchesSelector")];
                d3_selectMatches = function (n, s) {
                    return d3_selectMatcher.call(n, s);
                };
                return d3_selectMatches(n, s);
            };
            if (typeof Sizzle === "function") {
                d3_select = function (s, n) {
                    return Sizzle(s, n)[0] || null;
                };
                d3_selectAll = Sizzle;
                d3_selectMatches = Sizzle.matchesSelector;
            }
            d3.selection = function () {
                return d3.select(d3_document.documentElement);
            };
            var d3_selectionPrototype = d3.selection.prototype = [];
            d3_selectionPrototype.select = function (selector) {
                var subgroups = [], subgroup, subnode, group, node;
                selector = d3_selection_selector(selector);
                for (var j = -1, m = this.length; ++j < m;) {
                    subgroups.push(subgroup = []);
                    subgroup.parentNode = (group = this[j]).parentNode;
                    for (var i = -1, n = group.length; ++i < n;) {
                        if (node = group[i]) {
                            subgroup.push(subnode = selector.call(node, node.__data__, i, j));
                            if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
                        } else {
                            subgroup.push(null);
                        }
                    }
                }
                return d3_selection(subgroups);
            };

            function d3_selection_selector(selector) {
                return typeof selector === "function" ? selector : function () {
                    return d3_select(selector, this);
                };
            }

            d3_selectionPrototype.selectAll = function (selector) {
                var subgroups = [], subgroup, node;
                selector = d3_selection_selectorAll(selector);
                for (var j = -1, m = this.length; ++j < m;) {
                    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
                        if (node = group[i]) {
                            subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
                            subgroup.parentNode = node;
                        }
                    }
                }
                return d3_selection(subgroups);
            };

            function d3_selection_selectorAll(selector) {
                return typeof selector === "function" ? selector : function () {
                    return d3_selectAll(selector, this);
                };
            }

            var d3_nsXhtml = "http://www.w3.org/1999/xhtml";
            var d3_nsPrefix = {
                svg: "http://www.w3.org/2000/svg",
                xhtml: d3_nsXhtml,
                xlink: "http://www.w3.org/1999/xlink",
                xml: "http://www.w3.org/XML/1998/namespace",
                xmlns: "http://www.w3.org/2000/xmlns/"
            };
            d3.ns = {
                prefix: d3_nsPrefix,
                qualify: function (name) {
                    var i = name.indexOf(":"), prefix = name;
                    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
                    return d3_nsPrefix.hasOwnProperty(prefix) ? {
                        space: d3_nsPrefix[prefix],
                        local: name
                    } : name;
                }
            };
            d3_selectionPrototype.attr = function (name, value) {
                if (arguments.length < 2) {
                    if (typeof name === "string") {
                        var node = this.node();
                        name = d3.ns.qualify(name);
                        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
                    }
                    for (value in name) this.each(d3_selection_attr(value, name[value]));
                    return this;
                }
                return this.each(d3_selection_attr(name, value));
            };

            function d3_selection_attr(name, value) {
                name = d3.ns.qualify(name);

                function attrNull() {
                    this.removeAttribute(name);
                }

                function attrNullNS() {
                    this.removeAttributeNS(name.space, name.local);
                }

                function attrConstant() {
                    this.setAttribute(name, value);
                }

                function attrConstantNS() {
                    this.setAttributeNS(name.space, name.local, value);
                }

                function attrFunction() {
                    var x = value.apply(this, arguments);
                    if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
                }

                function attrFunctionNS() {
                    var x = value.apply(this, arguments);
                    if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
                }

                return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
            }

            function d3_collapse(s) {
                return s.trim().replace(/\s+/g, " ");
            }

            d3_selectionPrototype.classed = function (name, value) {
                if (arguments.length < 2) {
                    if (typeof name === "string") {
                        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
                        if (value = node.classList) {
                            while (++i < n) if (!value.contains(name[i])) return false;
                        } else {
                            value = node.getAttribute("class");
                            while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
                        }
                        return true;
                    }
                    for (value in name) this.each(d3_selection_classed(value, name[value]));
                    return this;
                }
                return this.each(d3_selection_classed(name, value));
            };

            function d3_selection_classedRe(name) {
                return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
            }

            function d3_selection_classes(name) {
                return (name + "").trim().split(/^|\s+/);
            }

            function d3_selection_classed(name, value) {
                name = d3_selection_classes(name).map(d3_selection_classedName);
                var n = name.length;

                function classedConstant() {
                    var i = -1;
                    while (++i < n) name[i](this, value);
                }

                function classedFunction() {
                    var i = -1, x = value.apply(this, arguments);
                    while (++i < n) name[i](this, x);
                }

                return typeof value === "function" ? classedFunction : classedConstant;
            }

            function d3_selection_classedName(name) {
                var re = d3_selection_classedRe(name);
                return function (node, value) {
                    if (c = node.classList) return value ? c.add(name) : c.remove(name);
                    var c = node.getAttribute("class") || "";
                    if (value) {
                        re.lastIndex = 0;
                        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
                    } else {
                        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
                    }
                };
            }

            d3_selectionPrototype.style = function (name, value, priority) {
                var n = arguments.length;
                if (n < 3) {
                    if (typeof name !== "string") {
                        if (n < 2) value = "";
                        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
                        return this;
                    }
                    if (n < 2) {
                        var node = this.node();
                        return d3_window(node).getComputedStyle(node, null).getPropertyValue(name);
                    }
                    priority = "";
                }
                return this.each(d3_selection_style(name, value, priority));
            };

            function d3_selection_style(name, value, priority) {
                function styleNull() {
                    this.style.removeProperty(name);
                }

                function styleConstant() {
                    this.style.setProperty(name, value, priority);
                }

                function styleFunction() {
                    var x = value.apply(this, arguments);
                    if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
                }

                return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
            }

            d3_selectionPrototype.property = function (name, value) {
                if (arguments.length < 2) {
                    if (typeof name === "string") return this.node()[name];
                    for (value in name) this.each(d3_selection_property(value, name[value]));
                    return this;
                }
                return this.each(d3_selection_property(name, value));
            };

            function d3_selection_property(name, value) {
                function propertyNull() {
                    delete this[name];
                }

                function propertyConstant() {
                    this[name] = value;
                }

                function propertyFunction() {
                    var x = value.apply(this, arguments);
                    if (x == null) delete this[name]; else this[name] = x;
                }

                return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
            }

            d3_selectionPrototype.text = function (value) {
                return arguments.length ? this.each(typeof value === "function" ? function () {
                    var v = value.apply(this, arguments);
                    this.textContent = v == null ? "" : v;
                } : value == null ? function () {
                    this.textContent = "";
                } : function () {
                    this.textContent = value;
                }) : this.node().textContent;
            };
            d3_selectionPrototype.html = function (value) {
                return arguments.length ? this.each(typeof value === "function" ? function () {
                    var v = value.apply(this, arguments);
                    this.innerHTML = v == null ? "" : v;
                } : value == null ? function () {
                    this.innerHTML = "";
                } : function () {
                    this.innerHTML = value;
                }) : this.node().innerHTML;
            };
            d3_selectionPrototype.append = function (name) {
                name = d3_selection_creator(name);
                return this.select(function () {
                    return this.appendChild(name.apply(this, arguments));
                });
            };

            function d3_selection_creator(name) {
                function create() {
                    var document = this.ownerDocument, namespace = this.namespaceURI;
                    return namespace === d3_nsXhtml && document.documentElement.namespaceURI === d3_nsXhtml ? document.createElement(name) : document.createElementNS(namespace, name);
                }

                function createNS() {
                    return this.ownerDocument.createElementNS(name.space, name.local);
                }

                return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? createNS : create;
            }

            d3_selectionPrototype.insert = function (name, before) {
                name = d3_selection_creator(name);
                before = d3_selection_selector(before);
                return this.select(function () {
                    return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
                });
            };
            d3_selectionPrototype.remove = function () {
                return this.each(d3_selectionRemove);
            };

            function d3_selectionRemove() {
                var parent = this.parentNode;
                if (parent) parent.removeChild(this);
            }

            d3_selectionPrototype.data = function (value, key) {
                var i = -1, n = this.length, group, node;
                if (!arguments.length) {
                    value = new Array(n = (group = this[0]).length);
                    while (++i < n) {
                        if (node = group[i]) {
                            value[i] = node.__data__;
                        }
                    }
                    return value;
                }

                function bind(group, groupData) {
                    var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m),
                        enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
                    if (key) {
                        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
                        for (i = -1; ++i < n;) {
                            if (node = group[i]) {
                                if (nodeByKeyValue.has(keyValue = key.call(node, node.__data__, i))) {
                                    exitNodes[i] = node;
                                } else {
                                    nodeByKeyValue.set(keyValue, node);
                                }
                                keyValues[i] = keyValue;
                            }
                        }
                        for (i = -1; ++i < m;) {
                            if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
                                enterNodes[i] = d3_selection_dataNode(nodeData);
                            } else if (node !== true) {
                                updateNodes[i] = node;
                                node.__data__ = nodeData;
                            }
                            nodeByKeyValue.set(keyValue, true);
                        }
                        for (i = -1; ++i < n;) {
                            if (i in keyValues && nodeByKeyValue.get(keyValues[i]) !== true) {
                                exitNodes[i] = group[i];
                            }
                        }
                    } else {
                        for (i = -1; ++i < n0;) {
                            node = group[i];
                            nodeData = groupData[i];
                            if (node) {
                                node.__data__ = nodeData;
                                updateNodes[i] = node;
                            } else {
                                enterNodes[i] = d3_selection_dataNode(nodeData);
                            }
                        }
                        for (; i < m; ++i) {
                            enterNodes[i] = d3_selection_dataNode(groupData[i]);
                        }
                        for (; i < n; ++i) {
                            exitNodes[i] = group[i];
                        }
                    }
                    enterNodes.update = updateNodes;
                    enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
                    enter.push(enterNodes);
                    update.push(updateNodes);
                    exit.push(exitNodes);
                }

                var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
                if (typeof value === "function") {
                    while (++i < n) {
                        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
                    }
                } else {
                    while (++i < n) {
                        bind(group = this[i], value);
                    }
                }
                update.enter = function () {
                    return enter;
                };
                update.exit = function () {
                    return exit;
                };
                return update;
            };

            function d3_selection_dataNode(data) {
                return {
                    __data__: data
                };
            }

            d3_selectionPrototype.datum = function (value) {
                return arguments.length ? this.property("__data__", value) : this.property("__data__");
            };
            d3_selectionPrototype.filter = function (filter) {
                var subgroups = [], subgroup, group, node;
                if (typeof filter !== "function") filter = d3_selection_filter(filter);
                for (var j = 0, m = this.length; j < m; j++) {
                    subgroups.push(subgroup = []);
                    subgroup.parentNode = (group = this[j]).parentNode;
                    for (var i = 0, n = group.length; i < n; i++) {
                        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
                            subgroup.push(node);
                        }
                    }
                }
                return d3_selection(subgroups);
            };

            function d3_selection_filter(selector) {
                return function () {
                    return d3_selectMatches(this, selector);
                };
            }

            d3_selectionPrototype.order = function () {
                for (var j = -1, m = this.length; ++j < m;) {
                    for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
                        if (node = group[i]) {
                            if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
                            next = node;
                        }
                    }
                }
                return this;
            };
            d3_selectionPrototype.sort = function (comparator) {
                comparator = d3_selection_sortComparator.apply(this, arguments);
                for (var j = -1, m = this.length; ++j < m;) this[j].sort(comparator);
                return this.order();
            };

            function d3_selection_sortComparator(comparator) {
                if (!arguments.length) comparator = d3_ascending;
                return function (a, b) {
                    return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
                };
            }

            d3_selectionPrototype.each = function (callback) {
                return d3_selection_each(this, function (node, i, j) {
                    callback.call(node, node.__data__, i, j);
                });
            };

            function d3_selection_each(groups, callback) {
                for (var j = 0, m = groups.length; j < m; j++) {
                    for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
                        if (node = group[i]) callback(node, i, j);
                    }
                }
                return groups;
            }

            d3_selectionPrototype.call = function (callback) {
                var args = d3_array(arguments);
                callback.apply(args[0] = this, args);
                return this;
            };
            d3_selectionPrototype.empty = function () {
                return !this.node();
            };
            d3_selectionPrototype.node = function () {
                for (var j = 0, m = this.length; j < m; j++) {
                    for (var group = this[j], i = 0, n = group.length; i < n; i++) {
                        var node = group[i];
                        if (node) return node;
                    }
                }
                return null;
            };
            d3_selectionPrototype.size = function () {
                var n = 0;
                d3_selection_each(this, function () {
                    ++n;
                });
                return n;
            };

            function d3_selection_enter(selection) {
                d3_subclass(selection, d3_selection_enterPrototype);
                return selection;
            }

            var d3_selection_enterPrototype = [];
            d3.selection.enter = d3_selection_enter;
            d3.selection.enter.prototype = d3_selection_enterPrototype;
            d3_selection_enterPrototype.append = d3_selectionPrototype.append;
            d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
            d3_selection_enterPrototype.node = d3_selectionPrototype.node;
            d3_selection_enterPrototype.call = d3_selectionPrototype.call;
            d3_selection_enterPrototype.size = d3_selectionPrototype.size;
            d3_selection_enterPrototype.select = function (selector) {
                var subgroups = [], subgroup, subnode, upgroup, group, node;
                for (var j = -1, m = this.length; ++j < m;) {
                    upgroup = (group = this[j]).update;
                    subgroups.push(subgroup = []);
                    subgroup.parentNode = group.parentNode;
                    for (var i = -1, n = group.length; ++i < n;) {
                        if (node = group[i]) {
                            subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
                            subnode.__data__ = node.__data__;
                        } else {
                            subgroup.push(null);
                        }
                    }
                }
                return d3_selection(subgroups);
            };
            d3_selection_enterPrototype.insert = function (name, before) {
                if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
                return d3_selectionPrototype.insert.call(this, name, before);
            };

            function d3_selection_enterInsertBefore(enter) {
                var i0, j0;
                return function (d, i, j) {
                    var group = enter[j].update, n = group.length, node;
                    if (j != j0) j0 = j, i0 = 0;
                    if (i >= i0) i0 = i + 1;
                    while (!(node = group[i0]) && ++i0 < n) ;
                    return node;
                };
            }

            d3.select = function (node) {
                var group;
                if (typeof node === "string") {
                    group = [d3_select(node, d3_document)];
                    group.parentNode = d3_document.documentElement;
                } else {
                    group = [node];
                    group.parentNode = d3_documentElement(node);
                }
                return d3_selection([group]);
            };
            d3.selectAll = function (nodes) {
                var group;
                if (typeof nodes === "string") {
                    group = d3_array(d3_selectAll(nodes, d3_document));
                    group.parentNode = d3_document.documentElement;
                } else {
                    group = d3_array(nodes);
                    group.parentNode = null;
                }
                return d3_selection([group]);
            };
            d3_selectionPrototype.on = function (type, listener, capture) {
                var n = arguments.length;
                if (n < 3) {
                    if (typeof type !== "string") {
                        if (n < 2) listener = false;
                        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
                        return this;
                    }
                    if (n < 2) return (n = this.node()["__on" + type]) && n._;
                    capture = false;
                }
                return this.each(d3_selection_on(type, listener, capture));
            };

            function d3_selection_on(type, listener, capture) {
                var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
                if (i > 0) type = type.slice(0, i);
                var filter = d3_selection_onFilters.get(type);
                if (filter) type = filter, wrap = d3_selection_onFilter;

                function onRemove() {
                    var l = this[name];
                    if (l) {
                        this.removeEventListener(type, l, l.$);
                        delete this[name];
                    }
                }

                function onAdd() {
                    var l = wrap(listener, d3_array(arguments));
                    onRemove.call(this);
                    this.addEventListener(type, this[name] = l, l.$ = capture);
                    l._ = listener;
                }

                function removeAll() {
                    var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
                    for (var name in this) {
                        if (match = name.match(re)) {
                            var l = this[name];
                            this.removeEventListener(match[1], l, l.$);
                            delete this[name];
                        }
                    }
                }

                return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
            }

            var d3_selection_onFilters = d3.map({
                mouseenter: "mouseover",
                mouseleave: "mouseout"
            });
            if (d3_document) {
                d3_selection_onFilters.forEach(function (k) {
                    if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
                });
            }

            function d3_selection_onListener(listener, argumentz) {
                return function (e) {
                    var o = d3.event;
                    d3.event = e;
                    argumentz[0] = this.__data__;
                    try {
                        listener.apply(this, argumentz);
                    } finally {
                        d3.event = o;
                    }
                };
            }

            function d3_selection_onFilter(listener, argumentz) {
                var l = d3_selection_onListener(listener, argumentz);
                return function (e) {
                    var target = this, related = e.relatedTarget;
                    if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
                        l.call(target, e);
                    }
                };
            }

            var d3_event_dragSelect, d3_event_dragId = 0;

            function d3_event_dragSuppress(node) {
                var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name,
                    w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
                if (d3_event_dragSelect == null) {
                    d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
                }
                if (d3_event_dragSelect) {
                    var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
                    style[d3_event_dragSelect] = "none";
                }
                return function (suppressClick) {
                    w.on(name, null);
                    if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
                    if (suppressClick) {
                        var off = function () {
                            w.on(click, null);
                        };
                        w.on(click, function () {
                            d3_eventPreventDefault();
                            off();
                        }, true);
                        setTimeout(off, 0);
                    }
                };
            }

            d3.mouse = function (container) {
                return d3_mousePoint(container, d3_eventSource());
            };
            var d3_mouse_bug44083 = this.navigator && /WebKit/.test(this.navigator.userAgent) ? -1 : 0;

            function d3_mousePoint(container, e) {
                if (e.changedTouches) e = e.changedTouches[0];
                var svg = container.ownerSVGElement || container;
                if (svg.createSVGPoint) {
                    var point = svg.createSVGPoint();
                    if (d3_mouse_bug44083 < 0) {
                        var window = d3_window(container);
                        if (window.scrollX || window.scrollY) {
                            svg = d3.select("body").append("svg").style({
                                position: "absolute",
                                top: 0,
                                left: 0,
                                margin: 0,
                                padding: 0,
                                border: "none"
                            }, "important");
                            var ctm = svg[0][0].getScreenCTM();
                            d3_mouse_bug44083 = !(ctm.f || ctm.e);
                            svg.remove();
                        }
                    }
                    if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX,
                        point.y = e.clientY;
                    point = point.matrixTransform(container.getScreenCTM().inverse());
                    return [point.x, point.y];
                }
                var rect = container.getBoundingClientRect();
                return [e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop];
            }

            d3.touch = function (container, touches, identifier) {
                if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
                if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
                    if ((touch = touches[i]).identifier === identifier) {
                        return d3_mousePoint(container, touch);
                    }
                }
            };
            d3.behavior.drag = function () {
                var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null,
                    mousedown = dragstart(d3_noop, d3.mouse, d3_window, "mousemove", "mouseup"),
                    touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_identity, "touchmove", "touchend");

                function drag() {
                    this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
                }

                function dragstart(id, position, subject, move, end) {
                    return function () {
                        var that = this, target = d3.event.target.correspondingElement || d3.event.target,
                            parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(),
                            dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset,
                            dragSubject = d3.select(subject(target)).on(move + dragName, moved).on(end + dragName, ended),
                            dragRestore = d3_event_dragSuppress(target), position0 = position(parent, dragId);
                        if (origin) {
                            dragOffset = origin.apply(that, arguments);
                            dragOffset = [dragOffset.x - position0[0], dragOffset.y - position0[1]];
                        } else {
                            dragOffset = [0, 0];
                        }
                        dispatch({
                            type: "dragstart"
                        });

                        function moved() {
                            var position1 = position(parent, dragId), dx, dy;
                            if (!position1) return;
                            dx = position1[0] - position0[0];
                            dy = position1[1] - position0[1];
                            dragged |= dx | dy;
                            position0 = position1;
                            dispatch({
                                type: "drag",
                                x: position1[0] + dragOffset[0],
                                y: position1[1] + dragOffset[1],
                                dx: dx,
                                dy: dy
                            });
                        }

                        function ended() {
                            if (!position(parent, dragId)) return;
                            dragSubject.on(move + dragName, null).on(end + dragName, null);
                            dragRestore(dragged);
                            dispatch({
                                type: "dragend"
                            });
                        }
                    };
                }

                drag.origin = function (x) {
                    if (!arguments.length) return origin;
                    origin = x;
                    return drag;
                };
                return d3.rebind(drag, event, "on");
            };

            function d3_behavior_dragTouchId() {
                return d3.event.changedTouches[0].identifier;
            }

            d3.touches = function (container, touches) {
                if (arguments.length < 2) touches = d3_eventSource().touches;
                return touches ? d3_array(touches).map(function (touch) {
                    var point = d3_mousePoint(container, touch);
                    point.identifier = touch.identifier;
                    return point;
                }) : [];
            };
            var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180,
                d3_degrees = 180 / π;

            function d3_sgn(x) {
                return x > 0 ? 1 : x < 0 ? -1 : 0;
            }

            function d3_cross2d(a, b, c) {
                return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
            }

            function d3_acos(x) {
                return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
            }

            function d3_asin(x) {
                return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
            }

            function d3_sinh(x) {
                return ((x = Math.exp(x)) - 1 / x) / 2;
            }

            function d3_cosh(x) {
                return ((x = Math.exp(x)) + 1 / x) / 2;
            }

            function d3_tanh(x) {
                return ((x = Math.exp(2 * x)) - 1) / (x + 1);
            }

            function d3_haversin(x) {
                return (x = Math.sin(x / 2)) * x;
            }

            var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
            d3.interpolateZoom = function (p0, p1) {
                var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0,
                    dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
                if (d2 < ε2) {
                    S = Math.log(w1 / w0) / ρ;
                    i = function (t) {
                        return [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * t * S)];
                    };
                } else {
                    var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1),
                        b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1),
                        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
                    S = (r1 - r0) / ρ;
                    i = function (t) {
                        var s = t * S, coshr0 = d3_cosh(r0),
                            u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
                        return [ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0)];
                    };
                }
                i.duration = S * 1e3;
                return i;
            };
            d3.behavior.zoom = function () {
                var view = {
                        x: 0,
                        y: 0,
                        k: 1
                    }, translate0, center0, center, size = [960, 500], scaleExtent = d3_behavior_zoomInfinity,
                    duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom",
                    mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime,
                    event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
                if (!d3_behavior_zoomWheel) {
                    d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function () {
                        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
                    }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function () {
                        return d3.event.wheelDelta;
                    }, "mousewheel") : (d3_behavior_zoomDelta = function () {
                        return -d3.event.detail;
                    }, "MozMousePixelScroll");
                }

                function zoom(g) {
                    g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
                }

                zoom.event = function (g) {
                    g.each(function () {
                        var dispatch = event.of(this, arguments), view1 = view;
                        if (d3_transitionInheritId) {
                            d3.select(this).transition().each("start.zoom", function () {
                                view = this.__chart__ || {
                                    x: 0,
                                    y: 0,
                                    k: 1
                                };
                                zoomstarted(dispatch);
                            }).tween("zoom:zoom", function () {
                                var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2,
                                    cy = center0 ? center0[1] : dy / 2,
                                    i = d3.interpolateZoom([(cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k], [(cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k]);
                                return function (t) {
                                    var l = i(t), k = dx / l[2];
                                    this.__chart__ = view = {
                                        x: cx - l[0] * k,
                                        y: cy - l[1] * k,
                                        k: k
                                    };
                                    zoomed(dispatch);
                                };
                            }).each("interrupt.zoom", function () {
                                zoomended(dispatch);
                            }).each("end.zoom", function () {
                                zoomended(dispatch);
                            });
                        } else {
                            this.__chart__ = view;
                            zoomstarted(dispatch);
                            zoomed(dispatch);
                            zoomended(dispatch);
                        }
                    });
                };
                zoom.translate = function (_) {
                    if (!arguments.length) return [view.x, view.y];
                    view = {
                        x: +_[0],
                        y: +_[1],
                        k: view.k
                    };
                    rescale();
                    return zoom;
                };
                zoom.scale = function (_) {
                    if (!arguments.length) return view.k;
                    view = {
                        x: view.x,
                        y: view.y,
                        k: null
                    };
                    scaleTo(+_);
                    rescale();
                    return zoom;
                };
                zoom.scaleExtent = function (_) {
                    if (!arguments.length) return scaleExtent;
                    scaleExtent = _ == null ? d3_behavior_zoomInfinity : [+_[0], +_[1]];
                    return zoom;
                };
                zoom.center = function (_) {
                    if (!arguments.length) return center;
                    center = _ && [+_[0], +_[1]];
                    return zoom;
                };
                zoom.size = function (_) {
                    if (!arguments.length) return size;
                    size = _ && [+_[0], +_[1]];
                    return zoom;
                };
                zoom.duration = function (_) {
                    if (!arguments.length) return duration;
                    duration = +_;
                    return zoom;
                };
                zoom.x = function (z) {
                    if (!arguments.length) return x1;
                    x1 = z;
                    x0 = z.copy();
                    view = {
                        x: 0,
                        y: 0,
                        k: 1
                    };
                    return zoom;
                };
                zoom.y = function (z) {
                    if (!arguments.length) return y1;
                    y1 = z;
                    y0 = z.copy();
                    view = {
                        x: 0,
                        y: 0,
                        k: 1
                    };
                    return zoom;
                };

                function location(p) {
                    return [(p[0] - view.x) / view.k, (p[1] - view.y) / view.k];
                }

                function point(l) {
                    return [l[0] * view.k + view.x, l[1] * view.k + view.y];
                }

                function scaleTo(s) {
                    view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
                }

                function translateTo(p, l) {
                    l = point(l);
                    view.x += p[0] - l[0];
                    view.y += p[1] - l[1];
                }

                function zoomTo(that, p, l, k) {
                    that.__chart__ = {
                        x: view.x,
                        y: view.y,
                        k: view.k
                    };
                    scaleTo(Math.pow(2, k));
                    translateTo(center0 = p, l);
                    that = d3.select(that);
                    if (duration > 0) that = that.transition().duration(duration);
                    that.call(zoom.event);
                }

                function rescale() {
                    if (x1) x1.domain(x0.range().map(function (x) {
                        return (x - view.x) / view.k;
                    }).map(x0.invert));
                    if (y1) y1.domain(y0.range().map(function (y) {
                        return (y - view.y) / view.k;
                    }).map(y0.invert));
                }

                function zoomstarted(dispatch) {
                    if (!zooming++) dispatch({
                        type: "zoomstart"
                    });
                }

                function zoomed(dispatch) {
                    rescale();
                    dispatch({
                        type: "zoom",
                        scale: view.k,
                        translate: [view.x, view.y]
                    });
                }

                function zoomended(dispatch) {
                    if (!--zooming) dispatch({
                        type: "zoomend"
                    }), center0 = null;
                }

                function mousedowned() {
                    var that = this, dispatch = event.of(that, arguments), dragged = 0,
                        subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended),
                        location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress(that);
                    d3_selection_interrupt.call(that);
                    zoomstarted(dispatch);

                    function moved() {
                        dragged = 1;
                        translateTo(d3.mouse(that), location0);
                        zoomed(dispatch);
                    }

                    function ended() {
                        subject.on(mousemove, null).on(mouseup, null);
                        dragRestore(dragged);
                        zoomended(dispatch);
                    }
                }

                function touchstarted() {
                    var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0,
                        zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName,
                        touchend = "touchend" + zoomName, targets = [], subject = d3.select(that),
                        dragRestore = d3_event_dragSuppress(that);
                    started();
                    zoomstarted(dispatch);
                    subject.on(mousedown, null).on(touchstart, started);

                    function relocate() {
                        var touches = d3.touches(that);
                        scale0 = view.k;
                        touches.forEach(function (t) {
                            if (t.identifier in locations0) locations0[t.identifier] = location(t);
                        });
                        return touches;
                    }

                    function started() {
                        var target = d3.event.target;
                        d3.select(target).on(touchmove, moved).on(touchend, ended);
                        targets.push(target);
                        var changed = d3.event.changedTouches;
                        for (var i = 0, n = changed.length; i < n; ++i) {
                            locations0[changed[i].identifier] = null;
                        }
                        var touches = relocate(), now = Date.now();
                        if (touches.length === 1) {
                            if (now - touchtime < 500) {
                                var p = touches[0];
                                zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
                                d3_eventPreventDefault();
                            }
                            touchtime = now;
                        } else if (touches.length > 1) {
                            var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
                            distance0 = dx * dx + dy * dy;
                        }
                    }

                    function moved() {
                        var touches = d3.touches(that), p0, l0, p1, l1;
                        d3_selection_interrupt.call(that);
                        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
                            p1 = touches[i];
                            if (l1 = locations0[p1.identifier]) {
                                if (l0) break;
                                p0 = p1, l0 = l1;
                            }
                        }
                        if (l1) {
                            var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1,
                                scale1 = distance0 && Math.sqrt(distance1 / distance0);
                            p0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
                            l0 = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
                            scaleTo(scale1 * scale0);
                        }
                        touchtime = null;
                        translateTo(p0, l0);
                        zoomed(dispatch);
                    }

                    function ended() {
                        if (d3.event.touches.length) {
                            var changed = d3.event.changedTouches;
                            for (var i = 0, n = changed.length; i < n; ++i) {
                                delete locations0[changed[i].identifier];
                            }
                            for (var identifier in locations0) {
                                return void relocate();
                            }
                        }
                        d3.selectAll(targets).on(zoomName, null);
                        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
                        dragRestore();
                        zoomended(dispatch);
                    }
                }

                function mousewheeled() {
                    var dispatch = event.of(this, arguments);
                    if (mousewheelTimer) clearTimeout(mousewheelTimer); else d3_selection_interrupt.call(this),
                        translate0 = location(center0 = center || d3.mouse(this)), zoomstarted(dispatch);
                    mousewheelTimer = setTimeout(function () {
                        mousewheelTimer = null;
                        zoomended(dispatch);
                    }, 50);
                    d3_eventPreventDefault();
                    scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
                    translateTo(center0, translate0);
                    zoomed(dispatch);
                }

                function dblclicked() {
                    var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
                    zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
                }

                return d3.rebind(zoom, event, "on");
            };
            var d3_behavior_zoomInfinity = [0, Infinity], d3_behavior_zoomDelta, d3_behavior_zoomWheel;
            d3.color = d3_color;

            function d3_color() {
            }

            d3_color.prototype.toString = function () {
                return this.rgb() + "";
            };
            d3.hsl = d3_hsl;

            function d3_hsl(h, s, l) {
                return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
            }

            var d3_hslPrototype = d3_hsl.prototype = new d3_color();
            d3_hslPrototype.brighter = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new d3_hsl(this.h, this.s, this.l / k);
            };
            d3_hslPrototype.darker = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new d3_hsl(this.h, this.s, k * this.l);
            };
            d3_hslPrototype.rgb = function () {
                return d3_hsl_rgb(this.h, this.s, this.l);
            };

            function d3_hsl_rgb(h, s, l) {
                var m1, m2;
                h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
                s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
                l = l < 0 ? 0 : l > 1 ? 1 : l;
                m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
                m1 = 2 * l - m2;

                function v(h) {
                    if (h > 360) h -= 360; else if (h < 0) h += 360;
                    if (h < 60) return m1 + (m2 - m1) * h / 60;
                    if (h < 180) return m2;
                    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
                    return m1;
                }

                function vv(h) {
                    return Math.round(v(h) * 255);
                }

                return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
            }

            d3.hcl = d3_hcl;

            function d3_hcl(h, c, l) {
                return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
            }

            var d3_hclPrototype = d3_hcl.prototype = new d3_color();
            d3_hclPrototype.brighter = function (k) {
                return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
            };
            d3_hclPrototype.darker = function (k) {
                return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
            };
            d3_hclPrototype.rgb = function () {
                return d3_hcl_lab(this.h, this.c, this.l).rgb();
            };

            function d3_hcl_lab(h, c, l) {
                if (isNaN(h)) h = 0;
                if (isNaN(c)) c = 0;
                return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
            }

            d3.lab = d3_lab;

            function d3_lab(l, a, b) {
                return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
            }

            var d3_lab_K = 18;
            var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
            var d3_labPrototype = d3_lab.prototype = new d3_color();
            d3_labPrototype.brighter = function (k) {
                return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
            };
            d3_labPrototype.darker = function (k) {
                return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
            };
            d3_labPrototype.rgb = function () {
                return d3_lab_rgb(this.l, this.a, this.b);
            };

            function d3_lab_rgb(l, a, b) {
                var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
                x = d3_lab_xyz(x) * d3_lab_X;
                y = d3_lab_xyz(y) * d3_lab_Y;
                z = d3_lab_xyz(z) * d3_lab_Z;
                return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
            }

            function d3_lab_hcl(l, a, b) {
                return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
            }

            function d3_lab_xyz(x) {
                return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
            }

            function d3_xyz_lab(x) {
                return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
            }

            function d3_xyz_rgb(r) {
                return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
            }

            d3.rgb = d3_rgb;

            function d3_rgb(r, g, b) {
                return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
            }

            function d3_rgbNumber(value) {
                return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
            }

            function d3_rgbString(value) {
                return d3_rgbNumber(value) + "";
            }

            var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
            d3_rgbPrototype.brighter = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                var r = this.r, g = this.g, b = this.b, i = 30;
                if (!r && !g && !b) return new d3_rgb(i, i, i);
                if (r && r < i) r = i;
                if (g && g < i) g = i;
                if (b && b < i) b = i;
                return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
            };
            d3_rgbPrototype.darker = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new d3_rgb(k * this.r, k * this.g, k * this.b);
            };
            d3_rgbPrototype.hsl = function () {
                return d3_rgb_hsl(this.r, this.g, this.b);
            };
            d3_rgbPrototype.toString = function () {
                return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
            };

            function d3_rgb_hex(v) {
                return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
            }

            function d3_rgb_parse(format, rgb, hsl) {
                var r = 0, g = 0, b = 0, m1, m2, color;
                m1 = /([a-z]+)\((.*)\)/.exec(format = format.toLowerCase());
                if (m1) {
                    m2 = m1[2].split(",");
                    switch (m1[1]) {
                        case "hsl": {
                            return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
                        }

                        case "rgb": {
                            return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
                        }
                    }
                }
                if (color = d3_rgb_names.get(format)) {
                    return rgb(color.r, color.g, color.b);
                }
                if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
                    if (format.length === 4) {
                        r = (color & 3840) >> 4;
                        r = r >> 4 | r;
                        g = color & 240;
                        g = g >> 4 | g;
                        b = color & 15;
                        b = b << 4 | b;
                    } else if (format.length === 7) {
                        r = (color & 16711680) >> 16;
                        g = (color & 65280) >> 8;
                        b = color & 255;
                    }
                }
                return rgb(r, g, b);
            }

            function d3_rgb_hsl(r, g, b) {
                var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s,
                    l = (max + min) / 2;
                if (d) {
                    s = l < .5 ? d / (max + min) : d / (2 - max - min);
                    if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
                    h *= 60;
                } else {
                    h = NaN;
                    s = l > 0 && l < 1 ? 0 : h;
                }
                return new d3_hsl(h, s, l);
            }

            function d3_rgb_lab(r, g, b) {
                r = d3_rgb_xyz(r);
                g = d3_rgb_xyz(g);
                b = d3_rgb_xyz(b);
                var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X),
                    y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y),
                    z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
                return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
            }

            function d3_rgb_xyz(r) {
                return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
            }

            function d3_rgb_parseNumber(c) {
                var f = parseFloat(c);
                return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
            }

            var d3_rgb_names = d3.map({
                aliceblue: 15792383,
                antiquewhite: 16444375,
                aqua: 65535,
                aquamarine: 8388564,
                azure: 15794175,
                beige: 16119260,
                bisque: 16770244,
                black: 0,
                blanchedalmond: 16772045,
                blue: 255,
                blueviolet: 9055202,
                brown: 10824234,
                burlywood: 14596231,
                cadetblue: 6266528,
                chartreuse: 8388352,
                chocolate: 13789470,
                coral: 16744272,
                cornflowerblue: 6591981,
                cornsilk: 16775388,
                crimson: 14423100,
                cyan: 65535,
                darkblue: 139,
                darkcyan: 35723,
                darkgoldenrod: 12092939,
                darkgray: 11119017,
                darkgreen: 25600,
                darkgrey: 11119017,
                darkkhaki: 12433259,
                darkmagenta: 9109643,
                darkolivegreen: 5597999,
                darkorange: 16747520,
                darkorchid: 10040012,
                darkred: 9109504,
                darksalmon: 15308410,
                darkseagreen: 9419919,
                darkslateblue: 4734347,
                darkslategray: 3100495,
                darkslategrey: 3100495,
                darkturquoise: 52945,
                darkviolet: 9699539,
                deeppink: 16716947,
                deepskyblue: 49151,
                dimgray: 6908265,
                dimgrey: 6908265,
                dodgerblue: 2003199,
                firebrick: 11674146,
                floralwhite: 16775920,
                forestgreen: 2263842,
                fuchsia: 16711935,
                gainsboro: 14474460,
                ghostwhite: 16316671,
                gold: 16766720,
                goldenrod: 14329120,
                gray: 8421504,
                green: 32768,
                greenyellow: 11403055,
                grey: 8421504,
                honeydew: 15794160,
                hotpink: 16738740,
                indianred: 13458524,
                indigo: 4915330,
                ivory: 16777200,
                khaki: 15787660,
                lavender: 15132410,
                lavenderblush: 16773365,
                lawngreen: 8190976,
                lemonchiffon: 16775885,
                lightblue: 11393254,
                lightcoral: 15761536,
                lightcyan: 14745599,
                lightgoldenrodyellow: 16448210,
                lightgray: 13882323,
                lightgreen: 9498256,
                lightgrey: 13882323,
                lightpink: 16758465,
                lightsalmon: 16752762,
                lightseagreen: 2142890,
                lightskyblue: 8900346,
                lightslategray: 7833753,
                lightslategrey: 7833753,
                lightsteelblue: 11584734,
                lightyellow: 16777184,
                lime: 65280,
                limegreen: 3329330,
                linen: 16445670,
                magenta: 16711935,
                maroon: 8388608,
                mediumaquamarine: 6737322,
                mediumblue: 205,
                mediumorchid: 12211667,
                mediumpurple: 9662683,
                mediumseagreen: 3978097,
                mediumslateblue: 8087790,
                mediumspringgreen: 64154,
                mediumturquoise: 4772300,
                mediumvioletred: 13047173,
                midnightblue: 1644912,
                mintcream: 16121850,
                mistyrose: 16770273,
                moccasin: 16770229,
                navajowhite: 16768685,
                navy: 128,
                oldlace: 16643558,
                olive: 8421376,
                olivedrab: 7048739,
                orange: 16753920,
                orangered: 16729344,
                orchid: 14315734,
                palegoldenrod: 15657130,
                palegreen: 10025880,
                paleturquoise: 11529966,
                palevioletred: 14381203,
                papayawhip: 16773077,
                peachpuff: 16767673,
                peru: 13468991,
                pink: 16761035,
                plum: 14524637,
                powderblue: 11591910,
                purple: 8388736,
                rebeccapurple: 6697881,
                red: 16711680,
                rosybrown: 12357519,
                royalblue: 4286945,
                saddlebrown: 9127187,
                salmon: 16416882,
                sandybrown: 16032864,
                seagreen: 3050327,
                seashell: 16774638,
                sienna: 10506797,
                silver: 12632256,
                skyblue: 8900331,
                slateblue: 6970061,
                slategray: 7372944,
                slategrey: 7372944,
                snow: 16775930,
                springgreen: 65407,
                steelblue: 4620980,
                tan: 13808780,
                teal: 32896,
                thistle: 14204888,
                tomato: 16737095,
                turquoise: 4251856,
                violet: 15631086,
                wheat: 16113331,
                white: 16777215,
                whitesmoke: 16119285,
                yellow: 16776960,
                yellowgreen: 10145074
            });
            d3_rgb_names.forEach(function (key, value) {
                d3_rgb_names.set(key, d3_rgbNumber(value));
            });

            function d3_functor(v) {
                return typeof v === "function" ? v : function () {
                    return v;
                };
            }

            d3.functor = d3_functor;
            d3.xhr = d3_xhrType(d3_identity);

            function d3_xhrType(response) {
                return function (url, mimeType, callback) {
                    if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType,
                        mimeType = null;
                    return d3_xhr(url, mimeType, response, callback);
                };
            }

            function d3_xhr(url, mimeType, response, callback) {
                var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {},
                    request = new XMLHttpRequest(), responseType = null;
                if (this.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
                "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function () {
                    request.readyState > 3 && respond();
                };

                function respond() {
                    var status = request.status, result;
                    if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
                        try {
                            result = response.call(xhr, request);
                        } catch (e) {
                            dispatch.error.call(xhr, e);
                            return;
                        }
                        dispatch.load.call(xhr, result);
                    } else {
                        dispatch.error.call(xhr, request);
                    }
                }

                request.onprogress = function (event) {
                    var o = d3.event;
                    d3.event = event;
                    try {
                        dispatch.progress.call(xhr, request);
                    } finally {
                        d3.event = o;
                    }
                };
                xhr.header = function (name, value) {
                    name = (name + "").toLowerCase();
                    if (arguments.length < 2) return headers[name];
                    if (value == null) delete headers[name]; else headers[name] = value + "";
                    return xhr;
                };
                xhr.mimeType = function (value) {
                    if (!arguments.length) return mimeType;
                    mimeType = value == null ? null : value + "";
                    return xhr;
                };
                xhr.responseType = function (value) {
                    if (!arguments.length) return responseType;
                    responseType = value;
                    return xhr;
                };
                xhr.response = function (value) {
                    response = value;
                    return xhr;
                };
                ["get", "post"].forEach(function (method) {
                    xhr[method] = function () {
                        return xhr.send.apply(xhr, [method].concat(d3_array(arguments)));
                    };
                });
                xhr.send = function (method, data, callback) {
                    if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
                    request.open(method, url, true);
                    if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
                    if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
                    if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
                    if (responseType != null) request.responseType = responseType;
                    if (callback != null) xhr.on("error", callback).on("load", function (request) {
                        callback(null, request);
                    });
                    dispatch.beforesend.call(xhr, request);
                    request.send(data == null ? null : data);
                    return xhr;
                };
                xhr.abort = function () {
                    request.abort();
                    return xhr;
                };
                d3.rebind(xhr, dispatch, "on");
                return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
            }

            function d3_xhr_fixCallback(callback) {
                return callback.length === 1 ? function (error, request) {
                    callback(error == null ? request : null);
                } : callback;
            }

            function d3_xhrHasResponse(request) {
                var type = request.responseType;
                return type && type !== "text" ? request.response : request.responseText;
            }

            d3.dsv = function (delimiter, mimeType) {
                var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);

                function dsv(url, row, callback) {
                    if (arguments.length < 3) callback = row, row = null;
                    var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
                    xhr.row = function (_) {
                        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
                    };
                    return xhr;
                }

                function response(request) {
                    return dsv.parse(request.responseText);
                }

                function typedResponse(f) {
                    return function (request) {
                        return dsv.parse(request.responseText, f);
                    };
                }

                dsv.parse = function (text, f) {
                    var o;
                    return dsv.parseRows(text, function (row, i) {
                        if (o) return o(row, i - 1);
                        var a = new Function("d", "return {" + row.map(function (name, i) {
                            return JSON.stringify(name) + ": d[" + i + "]";
                        }).join(",") + "}");
                        o = f ? function (row, i) {
                            return f(a(row), i);
                        } : a;
                    });
                };
                dsv.parseRows = function (text, f) {
                    var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;

                    function token() {
                        if (I >= N) return EOF;
                        if (eol) return eol = false, EOL;
                        var j = I;
                        if (text.charCodeAt(j) === 34) {
                            var i = j;
                            while (i++ < N) {
                                if (text.charCodeAt(i) === 34) {
                                    if (text.charCodeAt(i + 1) !== 34) break;
                                    ++i;
                                }
                            }
                            I = i + 2;
                            var c = text.charCodeAt(i + 1);
                            if (c === 13) {
                                eol = true;
                                if (text.charCodeAt(i + 2) === 10) ++I;
                            } else if (c === 10) {
                                eol = true;
                            }
                            return text.slice(j + 1, i).replace(/""/g, '"');
                        }
                        while (I < N) {
                            var c = text.charCodeAt(I++), k = 1;
                            if (c === 10) eol = true; else if (c === 13) {
                                eol = true;
                                if (text.charCodeAt(I) === 10) ++I, ++k;
                            } else if (c !== delimiterCode) continue;
                            return text.slice(j, I - k);
                        }
                        return text.slice(j);
                    }

                    while ((t = token()) !== EOF) {
                        var a = [];
                        while (t !== EOL && t !== EOF) {
                            a.push(t);
                            t = token();
                        }
                        if (f && (a = f(a, n++)) == null) continue;
                        rows.push(a);
                    }
                    return rows;
                };
                dsv.format = function (rows) {
                    if (Array.isArray(rows[0])) return dsv.formatRows(rows);
                    var fieldSet = new d3_Set(), fields = [];
                    rows.forEach(function (row) {
                        for (var field in row) {
                            if (!fieldSet.has(field)) {
                                fields.push(fieldSet.add(field));
                            }
                        }
                    });
                    return [fields.map(formatValue).join(delimiter)].concat(rows.map(function (row) {
                        return fields.map(function (field) {
                            return formatValue(row[field]);
                        }).join(delimiter);
                    })).join("\n");
                };
                dsv.formatRows = function (rows) {
                    return rows.map(formatRow).join("\n");
                };

                function formatRow(row) {
                    return row.map(formatValue).join(delimiter);
                }

                function formatValue(text) {
                    return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
                }

                return dsv;
            };
            d3.csv = d3.dsv(",", "text/csv");
            d3.tsv = d3.dsv("	", "text/tab-separated-values");
            var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout,
                d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function (callback) {
                    setTimeout(callback, 17);
                };
            d3.timer = function () {
                d3_timer.apply(this, arguments);
            };

            function d3_timer(callback, delay, then) {
                var n = arguments.length;
                if (n < 2) delay = 0;
                if (n < 3) then = Date.now();
                var time = then + delay, timer = {
                    c: callback,
                    t: time,
                    n: null
                };
                if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
                d3_timer_queueTail = timer;
                if (!d3_timer_interval) {
                    d3_timer_timeout = clearTimeout(d3_timer_timeout);
                    d3_timer_interval = 1;
                    d3_timer_frame(d3_timer_step);
                }
                return timer;
            }

            function d3_timer_step() {
                var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
                if (delay > 24) {
                    if (isFinite(delay)) {
                        clearTimeout(d3_timer_timeout);
                        d3_timer_timeout = setTimeout(d3_timer_step, delay);
                    }
                    d3_timer_interval = 0;
                } else {
                    d3_timer_interval = 1;
                    d3_timer_frame(d3_timer_step);
                }
            }

            d3.timer.flush = function () {
                d3_timer_mark();
                d3_timer_sweep();
            };

            function d3_timer_mark() {
                var now = Date.now(), timer = d3_timer_queueHead;
                while (timer) {
                    if (now >= timer.t && timer.c(now - timer.t)) timer.c = null;
                    timer = timer.n;
                }
                return now;
            }

            function d3_timer_sweep() {
                var t0, t1 = d3_timer_queueHead, time = Infinity;
                while (t1) {
                    if (t1.c) {
                        if (t1.t < time) time = t1.t;
                        t1 = (t0 = t1).n;
                    } else {
                        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
                    }
                }
                d3_timer_queueTail = t0;
                return time;
            }

            function d3_format_precision(x, p) {
                return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
            }

            d3.round = function (x, n) {
                return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
            };
            var d3_formatPrefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"].map(d3_formatPrefix);
            d3.formatPrefix = function (value, precision) {
                var i = 0;
                if (value = +value) {
                    if (value < 0) value *= -1;
                    if (precision) value = d3.round(value, d3_format_precision(value, precision));
                    i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
                    i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
                }
                return d3_formatPrefixes[8 + i / 3];
            };

            function d3_formatPrefix(d, i) {
                var k = Math.pow(10, abs(8 - i) * 3);
                return {
                    scale: i > 8 ? function (d) {
                        return d / k;
                    } : function (d) {
                        return d * k;
                    },
                    symbol: d
                };
            }

            function d3_locale_numberFormat(locale) {
                var locale_decimal = locale.decimal, locale_thousands = locale.thousands,
                    locale_grouping = locale.grouping, locale_currency = locale.currency,
                    formatGroup = locale_grouping && locale_thousands ? function (value, width) {
                        var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
                        while (i > 0 && g > 0) {
                            if (length + g + 1 > width) g = Math.max(1, width - length);
                            t.push(value.substring(i -= g, i + g));
                            if ((length += g + 1) > width) break;
                            g = locale_grouping[j = (j + 1) % locale_grouping.length];
                        }
                        return t.reverse().join(locale_thousands);
                    } : d3_identity;
                return function (specifier) {
                    var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">",
                        sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6],
                        comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "",
                        integer = false, exponent = true;
                    if (precision) precision = +precision.substring(1);
                    if (zfill || fill === "0" && align === "=") {
                        zfill = fill = "0";
                        align = "=";
                    }
                    switch (type) {
                        case "n":
                            comma = true;
                            type = "g";
                            break;

                        case "%":
                            scale = 100;
                            suffix = "%";
                            type = "f";
                            break;

                        case "p":
                            scale = 100;
                            suffix = "%";
                            type = "r";
                            break;

                        case "b":
                        case "o":
                        case "x":
                        case "X":
                            if (symbol === "#") prefix = "0" + type.toLowerCase();

                        case "c":
                            exponent = false;

                        case "d":
                            integer = true;
                            precision = 0;
                            break;

                        case "s":
                            scale = -1;
                            type = "r";
                            break;
                    }
                    if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
                    if (type == "r" && !precision) type = "g";
                    if (precision != null) {
                        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
                    }
                    type = d3_format_types.get(type) || d3_format_typeDefault;
                    var zcomma = zfill && comma;
                    return function (value) {
                        var fullSuffix = suffix;
                        if (integer && value % 1) return "";
                        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
                        if (scale < 0) {
                            var unit = d3.formatPrefix(value, precision);
                            value = unit.scale(value);
                            fullSuffix = unit.symbol + suffix;
                        } else {
                            value *= scale;
                        }
                        value = type(value, precision);
                        var i = value.lastIndexOf("."), before, after;
                        if (i < 0) {
                            var j = exponent ? value.lastIndexOf("e") : -1;
                            if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
                        } else {
                            before = value.substring(0, i);
                            after = locale_decimal + value.substring(i + 1);
                        }
                        if (!zfill && comma) before = formatGroup(before, Infinity);
                        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length),
                            padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
                        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
                        negative += prefix;
                        value = before + after;
                        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
                    };
                };
            }

            var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
            var d3_format_types = d3.map({
                b: function (x) {
                    return x.toString(2);
                },
                c: function (x) {
                    return String.fromCharCode(x);
                },
                o: function (x) {
                    return x.toString(8);
                },
                x: function (x) {
                    return x.toString(16);
                },
                X: function (x) {
                    return x.toString(16).toUpperCase();
                },
                g: function (x, p) {
                    return x.toPrecision(p);
                },
                e: function (x, p) {
                    return x.toExponential(p);
                },
                f: function (x, p) {
                    return x.toFixed(p);
                },
                r: function (x, p) {
                    return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
                }
            });

            function d3_format_typeDefault(x) {
                return x + "";
            }

            var d3_time = d3.time = {}, d3_date = Date;

            function d3_date_utc() {
                this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
            }

            d3_date_utc.prototype = {
                getDate: function () {
                    return this._.getUTCDate();
                },
                getDay: function () {
                    return this._.getUTCDay();
                },
                getFullYear: function () {
                    return this._.getUTCFullYear();
                },
                getHours: function () {
                    return this._.getUTCHours();
                },
                getMilliseconds: function () {
                    return this._.getUTCMilliseconds();
                },
                getMinutes: function () {
                    return this._.getUTCMinutes();
                },
                getMonth: function () {
                    return this._.getUTCMonth();
                },
                getSeconds: function () {
                    return this._.getUTCSeconds();
                },
                getTime: function () {
                    return this._.getTime();
                },
                getTimezoneOffset: function () {
                    return 0;
                },
                valueOf: function () {
                    return this._.valueOf();
                },
                setDate: function () {
                    d3_time_prototype.setUTCDate.apply(this._, arguments);
                },
                setDay: function () {
                    d3_time_prototype.setUTCDay.apply(this._, arguments);
                },
                setFullYear: function () {
                    d3_time_prototype.setUTCFullYear.apply(this._, arguments);
                },
                setHours: function () {
                    d3_time_prototype.setUTCHours.apply(this._, arguments);
                },
                setMilliseconds: function () {
                    d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
                },
                setMinutes: function () {
                    d3_time_prototype.setUTCMinutes.apply(this._, arguments);
                },
                setMonth: function () {
                    d3_time_prototype.setUTCMonth.apply(this._, arguments);
                },
                setSeconds: function () {
                    d3_time_prototype.setUTCSeconds.apply(this._, arguments);
                },
                setTime: function () {
                    d3_time_prototype.setTime.apply(this._, arguments);
                }
            };
            var d3_time_prototype = Date.prototype;

            function d3_time_interval(local, step, number) {
                function round(date) {
                    var d0 = local(date), d1 = offset(d0, 1);
                    return date - d0 < d1 - date ? d0 : d1;
                }

                function ceil(date) {
                    step(date = local(new d3_date(date - 1)), 1);
                    return date;
                }

                function offset(date, k) {
                    step(date = new d3_date(+date), k);
                    return date;
                }

                function range(t0, t1, dt) {
                    var time = ceil(t0), times = [];
                    if (dt > 1) {
                        while (time < t1) {
                            if (!(number(time) % dt)) times.push(new Date(+time));
                            step(time, 1);
                        }
                    } else {
                        while (time < t1) times.push(new Date(+time)), step(time, 1);
                    }
                    return times;
                }

                function range_utc(t0, t1, dt) {
                    try {
                        d3_date = d3_date_utc;
                        var utc = new d3_date_utc();
                        utc._ = t0;
                        return range(utc, t1, dt);
                    } finally {
                        d3_date = Date;
                    }
                }

                local.floor = local;
                local.round = round;
                local.ceil = ceil;
                local.offset = offset;
                local.range = range;
                var utc = local.utc = d3_time_interval_utc(local);
                utc.floor = utc;
                utc.round = d3_time_interval_utc(round);
                utc.ceil = d3_time_interval_utc(ceil);
                utc.offset = d3_time_interval_utc(offset);
                utc.range = range_utc;
                return local;
            }

            function d3_time_interval_utc(method) {
                return function (date, k) {
                    try {
                        d3_date = d3_date_utc;
                        var utc = new d3_date_utc();
                        utc._ = date;
                        return method(utc, k)._;
                    } finally {
                        d3_date = Date;
                    }
                };
            }

            d3_time.year = d3_time_interval(function (date) {
                date = d3_time.day(date);
                date.setMonth(0, 1);
                return date;
            }, function (date, offset) {
                date.setFullYear(date.getFullYear() + offset);
            }, function (date) {
                return date.getFullYear();
            });
            d3_time.years = d3_time.year.range;
            d3_time.years.utc = d3_time.year.utc.range;
            d3_time.day = d3_time_interval(function (date) {
                var day = new d3_date(2e3, 0);
                day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                return day;
            }, function (date, offset) {
                date.setDate(date.getDate() + offset);
            }, function (date) {
                return date.getDate() - 1;
            });
            d3_time.days = d3_time.day.range;
            d3_time.days.utc = d3_time.day.utc.range;
            d3_time.dayOfYear = function (date) {
                var year = d3_time.year(date);
                return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
            };
            ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].forEach(function (day, i) {
                i = 7 - i;
                var interval = d3_time[day] = d3_time_interval(function (date) {
                    (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
                    return date;
                }, function (date, offset) {
                    date.setDate(date.getDate() + Math.floor(offset) * 7);
                }, function (date) {
                    var day = d3_time.year(date).getDay();
                    return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
                });
                d3_time[day + "s"] = interval.range;
                d3_time[day + "s"].utc = interval.utc.range;
                d3_time[day + "OfYear"] = function (date) {
                    var day = d3_time.year(date).getDay();
                    return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
                };
            });
            d3_time.week = d3_time.sunday;
            d3_time.weeks = d3_time.sunday.range;
            d3_time.weeks.utc = d3_time.sunday.utc.range;
            d3_time.weekOfYear = d3_time.sundayOfYear;

            function d3_locale_timeFormat(locale) {
                var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time,
                    locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays,
                    locale_months = locale.months, locale_shortMonths = locale.shortMonths;

                function d3_time_format(template) {
                    var n = template.length;

                    function format(date) {
                        var string = [], i = -1, j = 0, c, p, f;
                        while (++i < n) {
                            if (template.charCodeAt(i) === 37) {
                                string.push(template.slice(j, i));
                                if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
                                if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
                                string.push(c);
                                j = i + 1;
                            }
                        }
                        string.push(template.slice(j, i));
                        return string.join("");
                    }

                    format.parse = function (string) {
                        var d = {
                            y: 1900,
                            m: 0,
                            d: 1,
                            H: 0,
                            M: 0,
                            S: 0,
                            L: 0,
                            Z: null
                        }, i = d3_time_parse(d, template, string, 0);
                        if (i != string.length) return null;
                        if ("p" in d) d.H = d.H % 12 + d.p * 12;
                        var localZ = d.Z != null && d3_date !== d3_date_utc,
                            date = new (localZ ? d3_date_utc : d3_date)();
                        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("W" in d || "U" in d) {
                            if (!("w" in d)) d.w = "W" in d ? 1 : 0;
                            date.setFullYear(d.y, 0, 1);
                            date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
                        } else date.setFullYear(d.y, d.m, d.d);
                        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
                        return localZ ? date._ : date;
                    };
                    format.toString = function () {
                        return template;
                    };
                    return format;
                }

                function d3_time_parse(date, template, string, j) {
                    var c, p, t, i = 0, n = template.length, m = string.length;
                    while (i < n) {
                        if (j >= m) return -1;
                        c = template.charCodeAt(i++);
                        if (c === 37) {
                            t = template.charAt(i++);
                            p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
                            if (!p || (j = p(date, string, j)) < 0) return -1;
                        } else if (c != string.charCodeAt(j++)) {
                            return -1;
                        }
                    }
                    return j;
                }

                d3_time_format.utc = function (template) {
                    var local = d3_time_format(template);

                    function format(date) {
                        try {
                            d3_date = d3_date_utc;
                            var utc = new d3_date();
                            utc._ = date;
                            return local(utc);
                        } finally {
                            d3_date = Date;
                        }
                    }

                    format.parse = function (string) {
                        try {
                            d3_date = d3_date_utc;
                            var date = local.parse(string);
                            return date && date._;
                        } finally {
                            d3_date = Date;
                        }
                    };
                    format.toString = local.toString;
                    return format;
                };
                d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
                var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days),
                    d3_time_dayLookup = d3_time_formatLookup(locale_days),
                    d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays),
                    d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays),
                    d3_time_monthRe = d3_time_formatRe(locale_months),
                    d3_time_monthLookup = d3_time_formatLookup(locale_months),
                    d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths),
                    d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
                locale_periods.forEach(function (p, i) {
                    d3_time_periodLookup.set(p.toLowerCase(), i);
                });
                var d3_time_formats = {
                    a: function (d) {
                        return locale_shortDays[d.getDay()];
                    },
                    A: function (d) {
                        return locale_days[d.getDay()];
                    },
                    b: function (d) {
                        return locale_shortMonths[d.getMonth()];
                    },
                    B: function (d) {
                        return locale_months[d.getMonth()];
                    },
                    c: d3_time_format(locale_dateTime),
                    d: function (d, p) {
                        return d3_time_formatPad(d.getDate(), p, 2);
                    },
                    e: function (d, p) {
                        return d3_time_formatPad(d.getDate(), p, 2);
                    },
                    H: function (d, p) {
                        return d3_time_formatPad(d.getHours(), p, 2);
                    },
                    I: function (d, p) {
                        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
                    },
                    j: function (d, p) {
                        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
                    },
                    L: function (d, p) {
                        return d3_time_formatPad(d.getMilliseconds(), p, 3);
                    },
                    m: function (d, p) {
                        return d3_time_formatPad(d.getMonth() + 1, p, 2);
                    },
                    M: function (d, p) {
                        return d3_time_formatPad(d.getMinutes(), p, 2);
                    },
                    p: function (d) {
                        return locale_periods[+(d.getHours() >= 12)];
                    },
                    S: function (d, p) {
                        return d3_time_formatPad(d.getSeconds(), p, 2);
                    },
                    U: function (d, p) {
                        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
                    },
                    w: function (d) {
                        return d.getDay();
                    },
                    W: function (d, p) {
                        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
                    },
                    x: d3_time_format(locale_date),
                    X: d3_time_format(locale_time),
                    y: function (d, p) {
                        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
                    },
                    Y: function (d, p) {
                        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
                    },
                    Z: d3_time_zone,
                    "%": function () {
                        return "%";
                    }
                };
                var d3_time_parsers = {
                    a: d3_time_parseWeekdayAbbrev,
                    A: d3_time_parseWeekday,
                    b: d3_time_parseMonthAbbrev,
                    B: d3_time_parseMonth,
                    c: d3_time_parseLocaleFull,
                    d: d3_time_parseDay,
                    e: d3_time_parseDay,
                    H: d3_time_parseHour24,
                    I: d3_time_parseHour24,
                    j: d3_time_parseDayOfYear,
                    L: d3_time_parseMilliseconds,
                    m: d3_time_parseMonthNumber,
                    M: d3_time_parseMinutes,
                    p: d3_time_parseAmPm,
                    S: d3_time_parseSeconds,
                    U: d3_time_parseWeekNumberSunday,
                    w: d3_time_parseWeekdayNumber,
                    W: d3_time_parseWeekNumberMonday,
                    x: d3_time_parseLocaleDate,
                    X: d3_time_parseLocaleTime,
                    y: d3_time_parseYear,
                    Y: d3_time_parseFullYear,
                    Z: d3_time_parseZone,
                    "%": d3_time_parseLiteralPercent
                };

                function d3_time_parseWeekdayAbbrev(date, string, i) {
                    d3_time_dayAbbrevRe.lastIndex = 0;
                    var n = d3_time_dayAbbrevRe.exec(string.slice(i));
                    return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
                }

                function d3_time_parseWeekday(date, string, i) {
                    d3_time_dayRe.lastIndex = 0;
                    var n = d3_time_dayRe.exec(string.slice(i));
                    return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
                }

                function d3_time_parseMonthAbbrev(date, string, i) {
                    d3_time_monthAbbrevRe.lastIndex = 0;
                    var n = d3_time_monthAbbrevRe.exec(string.slice(i));
                    return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
                }

                function d3_time_parseMonth(date, string, i) {
                    d3_time_monthRe.lastIndex = 0;
                    var n = d3_time_monthRe.exec(string.slice(i));
                    return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
                }

                function d3_time_parseLocaleFull(date, string, i) {
                    return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
                }

                function d3_time_parseLocaleDate(date, string, i) {
                    return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
                }

                function d3_time_parseLocaleTime(date, string, i) {
                    return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
                }

                function d3_time_parseAmPm(date, string, i) {
                    var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
                    return n == null ? -1 : (date.p = n, i);
                }

                return d3_time_format;
            }

            var d3_time_formatPads = {
                "-": "",
                _: " ",
                "0": "0"
            }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;

            function d3_time_formatPad(value, fill, width) {
                var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
                return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
            }

            function d3_time_formatRe(names) {
                return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
            }

            function d3_time_formatLookup(names) {
                var map = new d3_Map(), i = -1, n = names.length;
                while (++i < n) map.set(names[i].toLowerCase(), i);
                return map;
            }

            function d3_time_parseWeekdayNumber(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 1));
                return n ? (date.w = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseWeekNumberSunday(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i));
                return n ? (date.U = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseWeekNumberMonday(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i));
                return n ? (date.W = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseFullYear(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 4));
                return n ? (date.y = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseYear(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 2));
                return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
            }

            function d3_time_parseZone(date, string, i) {
                return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string,
                i + 5) : -1;
            }

            function d3_time_expandYear(d) {
                return d + (d > 68 ? 1900 : 2e3);
            }

            function d3_time_parseMonthNumber(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 2));
                return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
            }

            function d3_time_parseDay(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 2));
                return n ? (date.d = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseDayOfYear(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 3));
                return n ? (date.j = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseHour24(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 2));
                return n ? (date.H = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseMinutes(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 2));
                return n ? (date.M = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseSeconds(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 2));
                return n ? (date.S = +n[0], i + n[0].length) : -1;
            }

            function d3_time_parseMilliseconds(date, string, i) {
                d3_time_numberRe.lastIndex = 0;
                var n = d3_time_numberRe.exec(string.slice(i, i + 3));
                return n ? (date.L = +n[0], i + n[0].length) : -1;
            }

            function d3_time_zone(d) {
                var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
                return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
            }

            function d3_time_parseLiteralPercent(date, string, i) {
                d3_time_percentRe.lastIndex = 0;
                var n = d3_time_percentRe.exec(string.slice(i, i + 1));
                return n ? i + n[0].length : -1;
            }

            function d3_time_formatMulti(formats) {
                var n = formats.length, i = -1;
                while (++i < n) formats[i][0] = this(formats[i][0]);
                return function (date) {
                    var i = 0, f = formats[i];
                    while (!f[1](date)) f = formats[++i];
                    return f[0](date);
                };
            }

            d3.locale = function (locale) {
                return {
                    numberFormat: d3_locale_numberFormat(locale),
                    timeFormat: d3_locale_timeFormat(locale)
                };
            };
            var d3_locale_enUS = d3.locale({
                decimal: ".",
                thousands: ",",
                grouping: [3],
                currency: ["$", ""],
                dateTime: "%a %b %e %X %Y",
                date: "%m/%d/%Y",
                time: "%H:%M:%S",
                periods: ["AM", "PM"],
                days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            });
            d3.format = d3_locale_enUS.numberFormat;
            d3.geo = {};

            function d3_adder() {
            }

            d3_adder.prototype = {
                s: 0,
                t: 0,
                add: function (y) {
                    d3_adderSum(y, this.t, d3_adderTemp);
                    d3_adderSum(d3_adderTemp.s, this.s, this);
                    if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
                },
                reset: function () {
                    this.s = this.t = 0;
                },
                valueOf: function () {
                    return this.s;
                }
            };
            var d3_adderTemp = new d3_adder();

            function d3_adderSum(a, b, o) {
                var x = o.s = a + b, bv = x - a, av = x - bv;
                o.t = a - av + (b - bv);
            }

            d3.geo.stream = function (object, listener) {
                if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
                    d3_geo_streamObjectType[object.type](object, listener);
                } else {
                    d3_geo_streamGeometry(object, listener);
                }
            };

            function d3_geo_streamGeometry(geometry, listener) {
                if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
                    d3_geo_streamGeometryType[geometry.type](geometry, listener);
                }
            }

            var d3_geo_streamObjectType = {
                Feature: function (feature, listener) {
                    d3_geo_streamGeometry(feature.geometry, listener);
                },
                FeatureCollection: function (object, listener) {
                    var features = object.features, i = -1, n = features.length;
                    while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
                }
            };
            var d3_geo_streamGeometryType = {
                Sphere: function (object, listener) {
                    listener.sphere();
                },
                Point: function (object, listener) {
                    object = object.coordinates;
                    listener.point(object[0], object[1], object[2]);
                },
                MultiPoint: function (object, listener) {
                    var coordinates = object.coordinates, i = -1, n = coordinates.length;
                    while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
                },
                LineString: function (object, listener) {
                    d3_geo_streamLine(object.coordinates, listener, 0);
                },
                MultiLineString: function (object, listener) {
                    var coordinates = object.coordinates, i = -1, n = coordinates.length;
                    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
                },
                Polygon: function (object, listener) {
                    d3_geo_streamPolygon(object.coordinates, listener);
                },
                MultiPolygon: function (object, listener) {
                    var coordinates = object.coordinates, i = -1, n = coordinates.length;
                    while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
                },
                GeometryCollection: function (object, listener) {
                    var geometries = object.geometries, i = -1, n = geometries.length;
                    while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
                }
            };

            function d3_geo_streamLine(coordinates, listener, closed) {
                var i = -1, n = coordinates.length - closed, coordinate;
                listener.lineStart();
                while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
                listener.lineEnd();
            }

            function d3_geo_streamPolygon(coordinates, listener) {
                var i = -1, n = coordinates.length;
                listener.polygonStart();
                while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
                listener.polygonEnd();
            }

            d3.geo.area = function (object) {
                d3_geo_areaSum = 0;
                d3.geo.stream(object, d3_geo_area);
                return d3_geo_areaSum;
            };
            var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
            var d3_geo_area = {
                sphere: function () {
                    d3_geo_areaSum += 4 * π;
                },
                point: d3_noop,
                lineStart: d3_noop,
                lineEnd: d3_noop,
                polygonStart: function () {
                    d3_geo_areaRingSum.reset();
                    d3_geo_area.lineStart = d3_geo_areaRingStart;
                },
                polygonEnd: function () {
                    var area = 2 * d3_geo_areaRingSum;
                    d3_geo_areaSum += area < 0 ? 4 * π + area : area;
                    d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
                }
            };

            function d3_geo_areaRingStart() {
                var λ00, φ00, λ0, cosφ0, sinφ0;
                d3_geo_area.point = function (λ, φ) {
                    d3_geo_area.point = nextPoint;
                    λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4),
                        sinφ0 = Math.sin(φ);
                };

                function nextPoint(λ, φ) {
                    λ *= d3_radians;
                    φ = φ * d3_radians / 2 + π / 4;
                    var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ),
                        k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
                    d3_geo_areaRingSum.add(Math.atan2(v, u));
                    λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
                }

                d3_geo_area.lineEnd = function () {
                    nextPoint(λ00, φ00);
                };
            }

            function d3_geo_cartesian(spherical) {
                var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
                return [cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ)];
            }

            function d3_geo_cartesianDot(a, b) {
                return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
            }

            function d3_geo_cartesianCross(a, b) {
                return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
            }

            function d3_geo_cartesianAdd(a, b) {
                a[0] += b[0];
                a[1] += b[1];
                a[2] += b[2];
            }

            function d3_geo_cartesianScale(vector, k) {
                return [vector[0] * k, vector[1] * k, vector[2] * k];
            }

            function d3_geo_cartesianNormalize(d) {
                var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
                d[0] /= l;
                d[1] /= l;
                d[2] /= l;
            }

            function d3_geo_spherical(cartesian) {
                return [Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2])];
            }

            function d3_geo_sphericalEqual(a, b) {
                return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
            }

            d3.geo.bounds = function () {
                var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
                var bound = {
                    point: point,
                    lineStart: lineStart,
                    lineEnd: lineEnd,
                    polygonStart: function () {
                        bound.point = ringPoint;
                        bound.lineStart = ringStart;
                        bound.lineEnd = ringEnd;
                        dλSum = 0;
                        d3_geo_area.polygonStart();
                    },
                    polygonEnd: function () {
                        d3_geo_area.polygonEnd();
                        bound.point = point;
                        bound.lineStart = lineStart;
                        bound.lineEnd = lineEnd;
                        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
                        range[0] = λ0, range[1] = λ1;
                    }
                };

                function point(λ, φ) {
                    ranges.push(range = [λ0 = λ, λ1 = λ]);
                    if (φ < φ0) φ0 = φ;
                    if (φ > φ1) φ1 = φ;
                }

                function linePoint(λ, φ) {
                    var p = d3_geo_cartesian([λ * d3_radians, φ * d3_radians]);
                    if (p0) {
                        var normal = d3_geo_cartesianCross(p0, p), equatorial = [normal[1], -normal[0], 0],
                            inflection = d3_geo_cartesianCross(equatorial, normal);
                        d3_geo_cartesianNormalize(inflection);
                        inflection = d3_geo_spherical(inflection);
                        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s,
                            antimeridian = abs(dλ) > 180;
                        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
                            var φi = inflection[1] * d3_degrees;
                            if (φi > φ1) φ1 = φi;
                        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
                            var φi = -inflection[1] * d3_degrees;
                            if (φi < φ0) φ0 = φi;
                        } else {
                            if (φ < φ0) φ0 = φ;
                            if (φ > φ1) φ1 = φ;
                        }
                        if (antimeridian) {
                            if (λ < λ_) {
                                if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
                            } else {
                                if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
                            }
                        } else {
                            if (λ1 >= λ0) {
                                if (λ < λ0) λ0 = λ;
                                if (λ > λ1) λ1 = λ;
                            } else {
                                if (λ > λ_) {
                                    if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
                                } else {
                                    if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
                                }
                            }
                        }
                    } else {
                        point(λ, φ);
                    }
                    p0 = p, λ_ = λ;
                }

                function lineStart() {
                    bound.point = linePoint;
                }

                function lineEnd() {
                    range[0] = λ0, range[1] = λ1;
                    bound.point = point;
                    p0 = null;
                }

                function ringPoint(λ, φ) {
                    if (p0) {
                        var dλ = λ - λ_;
                        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
                    } else λ__ = λ, φ__ = φ;
                    d3_geo_area.point(λ, φ);
                    linePoint(λ, φ);
                }

                function ringStart() {
                    d3_geo_area.lineStart();
                }

                function ringEnd() {
                    ringPoint(λ__, φ__);
                    d3_geo_area.lineEnd();
                    if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
                    range[0] = λ0, range[1] = λ1;
                    p0 = null;
                }

                function angle(λ0, λ1) {
                    return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
                }

                function compareRanges(a, b) {
                    return a[0] - b[0];
                }

                function withinRange(x, range) {
                    return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
                }

                return function (feature) {
                    φ1 = λ1 = -(λ0 = φ0 = Infinity);
                    ranges = [];
                    d3.geo.stream(feature, bound);
                    var n = ranges.length;
                    if (n) {
                        ranges.sort(compareRanges);
                        for (var i = 1, a = ranges[0], b, merged = [a]; i < n; ++i) {
                            b = ranges[i];
                            if (withinRange(b[0], a) || withinRange(b[1], a)) {
                                if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
                                if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
                            } else {
                                merged.push(a = b);
                            }
                        }
                        var best = -Infinity, dλ;
                        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
                            b = merged[i];
                            if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
                        }
                    }
                    ranges = range = null;
                    return λ0 === Infinity || φ0 === Infinity ? [[NaN, NaN], [NaN, NaN]] : [[λ0, φ0], [λ1, φ1]];
                };
            }();
            d3.geo.centroid = function (object) {
                d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
                d3.geo.stream(object, d3_geo_centroid);
                var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
                if (m < ε2) {
                    x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
                    if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
                    m = x * x + y * y + z * z;
                    if (m < ε2) return [NaN, NaN];
                }
                return [Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees];
            };
            var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0,
                d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2,
                d3_geo_centroidZ2;
            var d3_geo_centroid = {
                sphere: d3_noop,
                point: d3_geo_centroidPoint,
                lineStart: d3_geo_centroidLineStart,
                lineEnd: d3_geo_centroidLineEnd,
                polygonStart: function () {
                    d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
                },
                polygonEnd: function () {
                    d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
                }
            };

            function d3_geo_centroidPoint(λ, φ) {
                λ *= d3_radians;
                var cosφ = Math.cos(φ *= d3_radians);
                d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
            }

            function d3_geo_centroidPointXYZ(x, y, z) {
                ++d3_geo_centroidW0;
                d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
                d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
                d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
            }

            function d3_geo_centroidLineStart() {
                var x0, y0, z0;
                d3_geo_centroid.point = function (λ, φ) {
                    λ *= d3_radians;
                    var cosφ = Math.cos(φ *= d3_radians);
                    x0 = cosφ * Math.cos(λ);
                    y0 = cosφ * Math.sin(λ);
                    z0 = Math.sin(φ);
                    d3_geo_centroid.point = nextPoint;
                    d3_geo_centroidPointXYZ(x0, y0, z0);
                };

                function nextPoint(λ, φ) {
                    λ *= d3_radians;
                    var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ),
                        z = Math.sin(φ),
                        w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
                    d3_geo_centroidW1 += w;
                    d3_geo_centroidX1 += w * (x0 + (x0 = x));
                    d3_geo_centroidY1 += w * (y0 + (y0 = y));
                    d3_geo_centroidZ1 += w * (z0 + (z0 = z));
                    d3_geo_centroidPointXYZ(x0, y0, z0);
                }
            }

            function d3_geo_centroidLineEnd() {
                d3_geo_centroid.point = d3_geo_centroidPoint;
            }

            function d3_geo_centroidRingStart() {
                var λ00, φ00, x0, y0, z0;
                d3_geo_centroid.point = function (λ, φ) {
                    λ00 = λ, φ00 = φ;
                    d3_geo_centroid.point = nextPoint;
                    λ *= d3_radians;
                    var cosφ = Math.cos(φ *= d3_radians);
                    x0 = cosφ * Math.cos(λ);
                    y0 = cosφ * Math.sin(λ);
                    z0 = Math.sin(φ);
                    d3_geo_centroidPointXYZ(x0, y0, z0);
                };
                d3_geo_centroid.lineEnd = function () {
                    nextPoint(λ00, φ00);
                    d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
                    d3_geo_centroid.point = d3_geo_centroidPoint;
                };

                function nextPoint(λ, φ) {
                    λ *= d3_radians;
                    var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ),
                        z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x,
                        m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z,
                        v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
                    d3_geo_centroidX2 += v * cx;
                    d3_geo_centroidY2 += v * cy;
                    d3_geo_centroidZ2 += v * cz;
                    d3_geo_centroidW1 += w;
                    d3_geo_centroidX1 += w * (x0 + (x0 = x));
                    d3_geo_centroidY1 += w * (y0 + (y0 = y));
                    d3_geo_centroidZ1 += w * (z0 + (z0 = z));
                    d3_geo_centroidPointXYZ(x0, y0, z0);
                }
            }

            function d3_geo_compose(a, b) {
                function compose(x, y) {
                    return x = a(x, y), b(x[0], x[1]);
                }

                if (a.invert && b.invert) compose.invert = function (x, y) {
                    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
                };
                return compose;
            }

            function d3_true() {
                return true;
            }

            function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
                var subject = [], clip = [];
                segments.forEach(function (segment) {
                    if ((n = segment.length - 1) <= 0) return;
                    var n, p0 = segment[0], p1 = segment[n];
                    if (d3_geo_sphericalEqual(p0, p1)) {
                        listener.lineStart();
                        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
                        listener.lineEnd();
                        return;
                    }
                    var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true),
                        b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
                    a.o = b;
                    subject.push(a);
                    clip.push(b);
                    a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
                    b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
                    a.o = b;
                    subject.push(a);
                    clip.push(b);
                });
                clip.sort(compare);
                d3_geo_clipPolygonLinkCircular(subject);
                d3_geo_clipPolygonLinkCircular(clip);
                if (!subject.length) return;
                for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
                    clip[i].e = entry = !entry;
                }
                var start = subject[0], points, point;
                while (1) {
                    var current = start, isSubject = true;
                    while (current.v) if ((current = current.n) === start) return;
                    points = current.z;
                    listener.lineStart();
                    do {
                        current.v = current.o.v = true;
                        if (current.e) {
                            if (isSubject) {
                                for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
                            } else {
                                interpolate(current.x, current.n.x, 1, listener);
                            }
                            current = current.n;
                        } else {
                            if (isSubject) {
                                points = current.p.z;
                                for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
                            } else {
                                interpolate(current.x, current.p.x, -1, listener);
                            }
                            current = current.p;
                        }
                        current = current.o;
                        points = current.z;
                        isSubject = !isSubject;
                    } while (!current.v);
                    listener.lineEnd();
                }
            }

            function d3_geo_clipPolygonLinkCircular(array) {
                if (!(n = array.length)) return;
                var n, i = 0, a = array[0], b;
                while (++i < n) {
                    a.n = b = array[i];
                    b.p = a;
                    a = b;
                }
                a.n = b = array[0];
                b.p = a;
            }

            function d3_geo_clipPolygonIntersection(point, points, other, entry) {
                this.x = point;
                this.z = points;
                this.o = other;
                this.e = entry;
                this.v = false;
                this.n = this.p = null;
            }

            function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
                return function (rotate, listener) {
                    var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
                    var clip = {
                        point: point,
                        lineStart: lineStart,
                        lineEnd: lineEnd,
                        polygonStart: function () {
                            clip.point = pointRing;
                            clip.lineStart = ringStart;
                            clip.lineEnd = ringEnd;
                            segments = [];
                            polygon = [];
                        },
                        polygonEnd: function () {
                            clip.point = point;
                            clip.lineStart = lineStart;
                            clip.lineEnd = lineEnd;
                            segments = d3.merge(segments);
                            var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
                            if (segments.length) {
                                if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
                                d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
                            } else if (clipStartInside) {
                                if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
                                listener.lineStart();
                                interpolate(null, null, 1, listener);
                                listener.lineEnd();
                            }
                            if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
                            segments = polygon = null;
                        },
                        sphere: function () {
                            listener.polygonStart();
                            listener.lineStart();
                            interpolate(null, null, 1, listener);
                            listener.lineEnd();
                            listener.polygonEnd();
                        }
                    };

                    function point(λ, φ) {
                        var point = rotate(λ, φ);
                        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
                    }

                    function pointLine(λ, φ) {
                        var point = rotate(λ, φ);
                        line.point(point[0], point[1]);
                    }

                    function lineStart() {
                        clip.point = pointLine;
                        line.lineStart();
                    }

                    function lineEnd() {
                        clip.point = point;
                        line.lineEnd();
                    }

                    var segments;
                    var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false,
                        polygon, ring;

                    function pointRing(λ, φ) {
                        ring.push([λ, φ]);
                        var point = rotate(λ, φ);
                        ringListener.point(point[0], point[1]);
                    }

                    function ringStart() {
                        ringListener.lineStart();
                        ring = [];
                    }

                    function ringEnd() {
                        pointRing(ring[0][0], ring[0][1]);
                        ringListener.lineEnd();
                        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment,
                            n = ringSegments.length;
                        ring.pop();
                        polygon.push(ring);
                        ring = null;
                        if (!n) return;
                        if (clean & 1) {
                            segment = ringSegments[0];
                            var n = segment.length - 1, i = -1, point;
                            if (n > 0) {
                                if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
                                listener.lineStart();
                                while (++i < n) listener.point((point = segment[i])[0], point[1]);
                                listener.lineEnd();
                            }
                            return;
                        }
                        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
                        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
                    }

                    return clip;
                };
            }

            function d3_geo_clipSegmentLength1(segment) {
                return segment.length > 1;
            }

            function d3_geo_clipBufferListener() {
                var lines = [], line;
                return {
                    lineStart: function () {
                        lines.push(line = []);
                    },
                    point: function (λ, φ) {
                        line.push([λ, φ]);
                    },
                    lineEnd: d3_noop,
                    buffer: function () {
                        var buffer = lines;
                        lines = [];
                        line = null;
                        return buffer;
                    },
                    rejoin: function () {
                        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
                    }
                };
            }

            function d3_geo_clipSort(a, b) {
                return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
            }

            var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [-π, -π / 2]);

            function d3_geo_clipAntimeridianLine(listener) {
                var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
                return {
                    lineStart: function () {
                        listener.lineStart();
                        clean = 1;
                    },
                    point: function (λ1, φ1) {
                        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
                        if (abs(dλ - π) < ε) {
                            listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
                            listener.point(sλ0, φ0);
                            listener.lineEnd();
                            listener.lineStart();
                            listener.point(sλ1, φ0);
                            listener.point(λ1, φ0);
                            clean = 0;
                        } else if (sλ0 !== sλ1 && dλ >= π) {
                            if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
                            if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
                            φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
                            listener.point(sλ0, φ0);
                            listener.lineEnd();
                            listener.lineStart();
                            listener.point(sλ1, φ0);
                            clean = 0;
                        }
                        listener.point(λ0 = λ1, φ0 = φ1);
                        sλ0 = sλ1;
                    },
                    lineEnd: function () {
                        listener.lineEnd();
                        λ0 = φ0 = NaN;
                    },
                    clean: function () {
                        return 2 - clean;
                    }
                };
            }

            function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
                var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
                return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
            }

            function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
                var φ;
                if (from == null) {
                    φ = direction * halfπ;
                    listener.point(-π, φ);
                    listener.point(0, φ);
                    listener.point(π, φ);
                    listener.point(π, 0);
                    listener.point(π, -φ);
                    listener.point(0, -φ);
                    listener.point(-π, -φ);
                    listener.point(-π, 0);
                    listener.point(-π, φ);
                } else if (abs(from[0] - to[0]) > ε) {
                    var s = from[0] < to[0] ? π : -π;
                    φ = direction * s / 2;
                    listener.point(-s, φ);
                    listener.point(0, φ);
                    listener.point(s, φ);
                } else {
                    listener.point(to[0], to[1]);
                }
            }

            function d3_geo_pointInPolygon(point, polygon) {
                var meridian = point[0], parallel = point[1],
                    meridianNormal = [Math.sin(meridian), -Math.cos(meridian), 0], polarAngle = 0, winding = 0;
                d3_geo_areaRingSum.reset();
                for (var i = 0, n = polygon.length; i < n; ++i) {
                    var ring = polygon[i], m = ring.length;
                    if (!m) continue;
                    var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0),
                        cosφ0 = Math.cos(φ0), j = 1;
                    while (true) {
                        if (j === m) j = 0;
                        point = ring[j];
                        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0,
                            sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
                        d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
                        polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
                        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
                            var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
                            d3_geo_cartesianNormalize(arc);
                            var intersection = d3_geo_cartesianCross(meridianNormal, arc);
                            d3_geo_cartesianNormalize(intersection);
                            var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
                            if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
                                winding += antimeridian ^ dλ >= 0 ? 1 : -1;
                            }
                        }
                        if (!j++) break;
                        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
                    }
                }
                return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < -ε) ^ winding & 1;
            }

            function d3_geo_clipCircle(radius) {
                var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε,
                    interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
                return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-π, radius - π]);

                function visible(λ, φ) {
                    return Math.cos(λ) * Math.cos(φ) > cr;
                }

                function clipLine(listener) {
                    var point0, c0, v0, v00, clean;
                    return {
                        lineStart: function () {
                            v00 = v0 = false;
                            clean = 1;
                        },
                        point: function (λ, φ) {
                            var point1 = [λ, φ], point2, v = visible(λ, φ),
                                c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
                            if (!point0 && (v00 = v0 = v)) listener.lineStart();
                            if (v !== v0) {
                                point2 = intersect(point0, point1);
                                if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
                                    point1[0] += ε;
                                    point1[1] += ε;
                                    v = visible(point1[0], point1[1]);
                                }
                            }
                            if (v !== v0) {
                                clean = 0;
                                if (v) {
                                    listener.lineStart();
                                    point2 = intersect(point1, point0);
                                    listener.point(point2[0], point2[1]);
                                } else {
                                    point2 = intersect(point0, point1);
                                    listener.point(point2[0], point2[1]);
                                    listener.lineEnd();
                                }
                                point0 = point2;
                            } else if (notHemisphere && point0 && smallRadius ^ v) {
                                var t;
                                if (!(c & c0) && (t = intersect(point1, point0, true))) {
                                    clean = 0;
                                    if (smallRadius) {
                                        listener.lineStart();
                                        listener.point(t[0][0], t[0][1]);
                                        listener.point(t[1][0], t[1][1]);
                                        listener.lineEnd();
                                    } else {
                                        listener.point(t[1][0], t[1][1]);
                                        listener.lineEnd();
                                        listener.lineStart();
                                        listener.point(t[0][0], t[0][1]);
                                    }
                                }
                            }
                            if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
                                listener.point(point1[0], point1[1]);
                            }
                            point0 = point1, v0 = v, c0 = c;
                        },
                        lineEnd: function () {
                            if (v0) listener.lineEnd();
                            point0 = null;
                        },
                        clean: function () {
                            return clean | (v00 && v0) << 1;
                        }
                    };
                }

                function intersect(a, b, two) {
                    var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
                    var n1 = [1, 0, 0], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2),
                        n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
                    if (!determinant) return !two && a;
                    var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant,
                        n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1),
                        B = d3_geo_cartesianScale(n2, c2);
                    d3_geo_cartesianAdd(A, B);
                    var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u),
                        t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
                    if (t2 < 0) return;
                    var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
                    d3_geo_cartesianAdd(q, A);
                    q = d3_geo_spherical(q);
                    if (!two) return q;
                    var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
                    if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
                    var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
                    if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
                    if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
                        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
                        d3_geo_cartesianAdd(q1, A);
                        return [q, d3_geo_spherical(q1)];
                    }
                }

                function code(λ, φ) {
                    var r = smallRadius ? radius : π - radius, code = 0;
                    if (λ < -r) code |= 1; else if (λ > r) code |= 2;
                    if (φ < -r) code |= 4; else if (φ > r) code |= 8;
                    return code;
                }
            }

            function d3_geom_clipLine(x0, y0, x1, y1) {
                return function (line) {
                    var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax,
                        dy = by - ay, r;
                    r = x0 - ax;
                    if (!dx && r > 0) return;
                    r /= dx;
                    if (dx < 0) {
                        if (r < t0) return;
                        if (r < t1) t1 = r;
                    } else if (dx > 0) {
                        if (r > t1) return;
                        if (r > t0) t0 = r;
                    }
                    r = x1 - ax;
                    if (!dx && r < 0) return;
                    r /= dx;
                    if (dx < 0) {
                        if (r > t1) return;
                        if (r > t0) t0 = r;
                    } else if (dx > 0) {
                        if (r < t0) return;
                        if (r < t1) t1 = r;
                    }
                    r = y0 - ay;
                    if (!dy && r > 0) return;
                    r /= dy;
                    if (dy < 0) {
                        if (r < t0) return;
                        if (r < t1) t1 = r;
                    } else if (dy > 0) {
                        if (r > t1) return;
                        if (r > t0) t0 = r;
                    }
                    r = y1 - ay;
                    if (!dy && r < 0) return;
                    r /= dy;
                    if (dy < 0) {
                        if (r > t1) return;
                        if (r > t0) t0 = r;
                    } else if (dy > 0) {
                        if (r < t0) return;
                        if (r < t1) t1 = r;
                    }
                    if (t0 > 0) line.a = {
                        x: ax + t0 * dx,
                        y: ay + t0 * dy
                    };
                    if (t1 < 1) line.b = {
                        x: ax + t1 * dx,
                        y: ay + t1 * dy
                    };
                    return line;
                };
            }

            var d3_geo_clipExtentMAX = 1e9;
            d3.geo.clipExtent = function () {
                var x0, y0, x1, y1, stream, clip, clipExtent = {
                    stream: function (output) {
                        if (stream) stream.valid = false;
                        stream = clip(output);
                        stream.valid = true;
                        return stream;
                    },
                    extent: function (_) {
                        if (!arguments.length) return [[x0, y0], [x1, y1]];
                        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
                        if (stream) stream.valid = false, stream = null;
                        return clipExtent;
                    }
                };
                return clipExtent.extent([[0, 0], [960, 500]]);
            };

            function d3_geo_clipExtent(x0, y0, x1, y1) {
                return function (listener) {
                    var listener_ = listener, bufferListener = d3_geo_clipBufferListener(),
                        clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
                    var clip = {
                        point: point,
                        lineStart: lineStart,
                        lineEnd: lineEnd,
                        polygonStart: function () {
                            listener = bufferListener;
                            segments = [];
                            polygon = [];
                            clean = true;
                        },
                        polygonEnd: function () {
                            listener = listener_;
                            segments = d3.merge(segments);
                            var clipStartInside = insidePolygon([x0, y1]), inside = clean && clipStartInside,
                                visible = segments.length;
                            if (inside || visible) {
                                listener.polygonStart();
                                if (inside) {
                                    listener.lineStart();
                                    interpolate(null, null, 1, listener);
                                    listener.lineEnd();
                                }
                                if (visible) {
                                    d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
                                }
                                listener.polygonEnd();
                            }
                            segments = polygon = ring = null;
                        }
                    };

                    function insidePolygon(p) {
                        var wn = 0, n = polygon.length, y = p[1];
                        for (var i = 0; i < n; ++i) {
                            for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
                                b = v[j];
                                if (a[1] <= y) {
                                    if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
                                } else {
                                    if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
                                }
                                a = b;
                            }
                        }
                        return wn !== 0;
                    }

                    function interpolate(from, to, direction, listener) {
                        var a = 0, a1 = 0;
                        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
                            do {
                                listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
                            } while ((a = (a + direction + 4) % 4) !== a1);
                        } else {
                            listener.point(to[0], to[1]);
                        }
                    }

                    function pointVisible(x, y) {
                        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                    }

                    function point(x, y) {
                        if (pointVisible(x, y)) listener.point(x, y);
                    }

                    var x__, y__, v__, x_, y_, v_, first, clean;

                    function lineStart() {
                        clip.point = linePoint;
                        if (polygon) polygon.push(ring = []);
                        first = true;
                        v_ = false;
                        x_ = y_ = NaN;
                    }

                    function lineEnd() {
                        if (segments) {
                            linePoint(x__, y__);
                            if (v__ && v_) bufferListener.rejoin();
                            segments.push(bufferListener.buffer());
                        }
                        clip.point = point;
                        if (v_) listener.lineEnd();
                    }

                    function linePoint(x, y) {
                        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
                        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
                        var v = pointVisible(x, y);
                        if (polygon) ring.push([x, y]);
                        if (first) {
                            x__ = x, y__ = y, v__ = v;
                            first = false;
                            if (v) {
                                listener.lineStart();
                                listener.point(x, y);
                            }
                        } else {
                            if (v && v_) listener.point(x, y); else {
                                var l = {
                                    a: {
                                        x: x_,
                                        y: y_
                                    },
                                    b: {
                                        x: x,
                                        y: y
                                    }
                                };
                                if (clipLine(l)) {
                                    if (!v_) {
                                        listener.lineStart();
                                        listener.point(l.a.x, l.a.y);
                                    }
                                    listener.point(l.b.x, l.b.y);
                                    if (!v) listener.lineEnd();
                                    clean = false;
                                } else if (v) {
                                    listener.lineStart();
                                    listener.point(x, y);
                                    clean = false;
                                }
                            }
                        }
                        x_ = x, y_ = y, v_ = v;
                    }

                    return clip;
                };

                function corner(p, direction) {
                    return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
                }

                function compare(a, b) {
                    return comparePoints(a.x, b.x);
                }

                function comparePoints(a, b) {
                    var ca = corner(a, 1), cb = corner(b, 1);
                    return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
                }
            }

            function d3_geo_conic(projectAt) {
                var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
                p.parallels = function (_) {
                    if (!arguments.length) return [φ0 / π * 180, φ1 / π * 180];
                    return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
                };
                return p;
            }

            function d3_geo_conicEqualArea(φ0, φ1) {
                var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0),
                    ρ0 = Math.sqrt(C) / n;

                function forward(λ, φ) {
                    var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
                    return [ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ)];
                }

                forward.invert = function (x, y) {
                    var ρ0_y = ρ0 - y;
                    return [Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n))];
                };
                return forward;
            }

            (d3.geo.conicEqualArea = function () {
                return d3_geo_conic(d3_geo_conicEqualArea);
            }).raw = d3_geo_conicEqualArea;
            d3.geo.albers = function () {
                return d3.geo.conicEqualArea().rotate([96, 0]).center([-.6, 38.7]).parallels([29.5, 45.5]).scale(1070);
            };
            d3.geo.albersUsa = function () {
                var lower48 = d3.geo.albers();
                var alaska = d3.geo.conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]);
                var hawaii = d3.geo.conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]);
                var point, pointStream = {
                    point: function (x, y) {
                        point = [x, y];
                    }
                }, lower48Point, alaskaPoint, hawaiiPoint;

                function albersUsa(coordinates) {
                    var x = coordinates[0], y = coordinates[1];
                    point = null;
                    (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
                    return point;
                }

                albersUsa.invert = function (coordinates) {
                    var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k,
                        y = (coordinates[1] - t[1]) / k;
                    return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
                };
                albersUsa.stream = function (stream) {
                    var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream),
                        hawaiiStream = hawaii.stream(stream);
                    return {
                        point: function (x, y) {
                            lower48Stream.point(x, y);
                            alaskaStream.point(x, y);
                            hawaiiStream.point(x, y);
                        },
                        sphere: function () {
                            lower48Stream.sphere();
                            alaskaStream.sphere();
                            hawaiiStream.sphere();
                        },
                        lineStart: function () {
                            lower48Stream.lineStart();
                            alaskaStream.lineStart();
                            hawaiiStream.lineStart();
                        },
                        lineEnd: function () {
                            lower48Stream.lineEnd();
                            alaskaStream.lineEnd();
                            hawaiiStream.lineEnd();
                        },
                        polygonStart: function () {
                            lower48Stream.polygonStart();
                            alaskaStream.polygonStart();
                            hawaiiStream.polygonStart();
                        },
                        polygonEnd: function () {
                            lower48Stream.polygonEnd();
                            alaskaStream.polygonEnd();
                            hawaiiStream.polygonEnd();
                        }
                    };
                };
                albersUsa.precision = function (_) {
                    if (!arguments.length) return lower48.precision();
                    lower48.precision(_);
                    alaska.precision(_);
                    hawaii.precision(_);
                    return albersUsa;
                };
                albersUsa.scale = function (_) {
                    if (!arguments.length) return lower48.scale();
                    lower48.scale(_);
                    alaska.scale(_ * .35);
                    hawaii.scale(_);
                    return albersUsa.translate(lower48.translate());
                };
                albersUsa.translate = function (_) {
                    if (!arguments.length) return lower48.translate();
                    var k = lower48.scale(), x = +_[0], y = +_[1];
                    lower48Point = lower48.translate(_).clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]]).stream(pointStream).point;
                    alaskaPoint = alaska.translate([x - .307 * k, y + .201 * k]).clipExtent([[x - .425 * k + ε, y + .12 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]]).stream(pointStream).point;
                    hawaiiPoint = hawaii.translate([x - .205 * k, y + .212 * k]).clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]]).stream(pointStream).point;
                    return albersUsa;
                };
                return albersUsa.scale(1070);
            };
            var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
                point: d3_noop,
                lineStart: d3_noop,
                lineEnd: d3_noop,
                polygonStart: function () {
                    d3_geo_pathAreaPolygon = 0;
                    d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
                },
                polygonEnd: function () {
                    d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
                    d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
                }
            };

            function d3_geo_pathAreaRingStart() {
                var x00, y00, x0, y0;
                d3_geo_pathArea.point = function (x, y) {
                    d3_geo_pathArea.point = nextPoint;
                    x00 = x0 = x, y00 = y0 = y;
                };

                function nextPoint(x, y) {
                    d3_geo_pathAreaPolygon += y0 * x - x0 * y;
                    x0 = x, y0 = y;
                }

                d3_geo_pathArea.lineEnd = function () {
                    nextPoint(x00, y00);
                };
            }

            var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
            var d3_geo_pathBounds = {
                point: d3_geo_pathBoundsPoint,
                lineStart: d3_noop,
                lineEnd: d3_noop,
                polygonStart: d3_noop,
                polygonEnd: d3_noop
            };

            function d3_geo_pathBoundsPoint(x, y) {
                if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
                if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
                if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
                if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
            }

            function d3_geo_pathBuffer() {
                var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
                var stream = {
                    point: point,
                    lineStart: function () {
                        stream.point = pointLineStart;
                    },
                    lineEnd: lineEnd,
                    polygonStart: function () {
                        stream.lineEnd = lineEndPolygon;
                    },
                    polygonEnd: function () {
                        stream.lineEnd = lineEnd;
                        stream.point = point;
                    },
                    pointRadius: function (_) {
                        pointCircle = d3_geo_pathBufferCircle(_);
                        return stream;
                    },
                    result: function () {
                        if (buffer.length) {
                            var result = buffer.join("");
                            buffer = [];
                            return result;
                        }
                    }
                };

                function point(x, y) {
                    buffer.push("M", x, ",", y, pointCircle);
                }

                function pointLineStart(x, y) {
                    buffer.push("M", x, ",", y);
                    stream.point = pointLine;
                }

                function pointLine(x, y) {
                    buffer.push("L", x, ",", y);
                }

                function lineEnd() {
                    stream.point = point;
                }

                function lineEndPolygon() {
                    buffer.push("Z");
                }

                return stream;
            }

            function d3_geo_pathBufferCircle(radius) {
                return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
            }

            var d3_geo_pathCentroid = {
                point: d3_geo_pathCentroidPoint,
                lineStart: d3_geo_pathCentroidLineStart,
                lineEnd: d3_geo_pathCentroidLineEnd,
                polygonStart: function () {
                    d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
                },
                polygonEnd: function () {
                    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
                    d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
                    d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
                }
            };

            function d3_geo_pathCentroidPoint(x, y) {
                d3_geo_centroidX0 += x;
                d3_geo_centroidY0 += y;
                ++d3_geo_centroidZ0;
            }

            function d3_geo_pathCentroidLineStart() {
                var x0, y0;
                d3_geo_pathCentroid.point = function (x, y) {
                    d3_geo_pathCentroid.point = nextPoint;
                    d3_geo_pathCentroidPoint(x0 = x, y0 = y);
                };

                function nextPoint(x, y) {
                    var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
                    d3_geo_centroidX1 += z * (x0 + x) / 2;
                    d3_geo_centroidY1 += z * (y0 + y) / 2;
                    d3_geo_centroidZ1 += z;
                    d3_geo_pathCentroidPoint(x0 = x, y0 = y);
                }
            }

            function d3_geo_pathCentroidLineEnd() {
                d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
            }

            function d3_geo_pathCentroidRingStart() {
                var x00, y00, x0, y0;
                d3_geo_pathCentroid.point = function (x, y) {
                    d3_geo_pathCentroid.point = nextPoint;
                    d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
                };

                function nextPoint(x, y) {
                    var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
                    d3_geo_centroidX1 += z * (x0 + x) / 2;
                    d3_geo_centroidY1 += z * (y0 + y) / 2;
                    d3_geo_centroidZ1 += z;
                    z = y0 * x - x0 * y;
                    d3_geo_centroidX2 += z * (x0 + x);
                    d3_geo_centroidY2 += z * (y0 + y);
                    d3_geo_centroidZ2 += z * 3;
                    d3_geo_pathCentroidPoint(x0 = x, y0 = y);
                }

                d3_geo_pathCentroid.lineEnd = function () {
                    nextPoint(x00, y00);
                };
            }

            function d3_geo_pathContext(context) {
                var pointRadius = 4.5;
                var stream = {
                    point: point,
                    lineStart: function () {
                        stream.point = pointLineStart;
                    },
                    lineEnd: lineEnd,
                    polygonStart: function () {
                        stream.lineEnd = lineEndPolygon;
                    },
                    polygonEnd: function () {
                        stream.lineEnd = lineEnd;
                        stream.point = point;
                    },
                    pointRadius: function (_) {
                        pointRadius = _;
                        return stream;
                    },
                    result: d3_noop
                };

                function point(x, y) {
                    context.moveTo(x + pointRadius, y);
                    context.arc(x, y, pointRadius, 0, τ);
                }

                function pointLineStart(x, y) {
                    context.moveTo(x, y);
                    stream.point = pointLine;
                }

                function pointLine(x, y) {
                    context.lineTo(x, y);
                }

                function lineEnd() {
                    stream.point = point;
                }

                function lineEndPolygon() {
                    context.closePath();
                }

                return stream;
            }

            function d3_geo_resample(project) {
                var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;

                function resample(stream) {
                    return (maxDepth ? resampleRecursive : resampleNone)(stream);
                }

                function resampleNone(stream) {
                    return d3_geo_transformPoint(stream, function (x, y) {
                        x = project(x, y);
                        stream.point(x[0], x[1]);
                    });
                }

                function resampleRecursive(stream) {
                    var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
                    var resample = {
                        point: point,
                        lineStart: lineStart,
                        lineEnd: lineEnd,
                        polygonStart: function () {
                            stream.polygonStart();
                            resample.lineStart = ringStart;
                        },
                        polygonEnd: function () {
                            stream.polygonEnd();
                            resample.lineStart = lineStart;
                        }
                    };

                    function point(x, y) {
                        x = project(x, y);
                        stream.point(x[0], x[1]);
                    }

                    function lineStart() {
                        x0 = NaN;
                        resample.point = linePoint;
                        stream.lineStart();
                    }

                    function linePoint(λ, φ) {
                        var c = d3_geo_cartesian([λ, φ]), p = project(λ, φ);
                        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
                        stream.point(x0, y0);
                    }

                    function lineEnd() {
                        resample.point = point;
                        stream.lineEnd();
                    }

                    function ringStart() {
                        lineStart();
                        resample.point = ringPoint;
                        resample.lineEnd = ringEnd;
                    }

                    function ringPoint(λ, φ) {
                        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
                        resample.point = linePoint;
                    }

                    function ringEnd() {
                        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
                        resample.lineEnd = lineEnd;
                        lineEnd();
                    }

                    return resample;
                }

                function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
                    var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
                    if (d2 > 4 * δ2 && depth--) {
                        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c),
                            φ2 = Math.asin(c /= m),
                            λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a),
                            p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0,
                            dz = dy * dx2 - dx * dy2;
                        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
                            resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
                            stream.point(x2, y2);
                            resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
                        }
                    }
                }

                resample.precision = function (_) {
                    if (!arguments.length) return Math.sqrt(δ2);
                    maxDepth = (δ2 = _ * _) > 0 && 16;
                    return resample;
                };
                return resample;
            }

            d3.geo.path = function () {
                var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;

                function path(object) {
                    if (object) {
                        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
                        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
                        d3.geo.stream(object, cacheStream);
                    }
                    return contextStream.result();
                }

                path.area = function (object) {
                    d3_geo_pathAreaSum = 0;
                    d3.geo.stream(object, projectStream(d3_geo_pathArea));
                    return d3_geo_pathAreaSum;
                };
                path.centroid = function (object) {
                    d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
                    d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
                    return d3_geo_centroidZ2 ? [d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2] : d3_geo_centroidZ1 ? [d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1] : d3_geo_centroidZ0 ? [d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0] : [NaN, NaN];
                };
                path.bounds = function (object) {
                    d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
                    d3.geo.stream(object, projectStream(d3_geo_pathBounds));
                    return [[d3_geo_pathBoundsX0, d3_geo_pathBoundsY0], [d3_geo_pathBoundsX1, d3_geo_pathBoundsY1]];
                };
                path.projection = function (_) {
                    if (!arguments.length) return projection;
                    projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
                    return reset();
                };
                path.context = function (_) {
                    if (!arguments.length) return context;
                    contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
                    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
                    return reset();
                };
                path.pointRadius = function (_) {
                    if (!arguments.length) return pointRadius;
                    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
                    return path;
                };

                function reset() {
                    cacheStream = null;
                    return path;
                }

                return path.projection(d3.geo.albersUsa()).context(null);
            };

            function d3_geo_pathProjectStream(project) {
                var resample = d3_geo_resample(function (x, y) {
                    return project([x * d3_degrees, y * d3_degrees]);
                });
                return function (stream) {
                    return d3_geo_projectionRadians(resample(stream));
                };
            }

            d3.geo.transform = function (methods) {
                return {
                    stream: function (stream) {
                        var transform = new d3_geo_transform(stream);
                        for (var k in methods) transform[k] = methods[k];
                        return transform;
                    }
                };
            };

            function d3_geo_transform(stream) {
                this.stream = stream;
            }

            d3_geo_transform.prototype = {
                point: function (x, y) {
                    this.stream.point(x, y);
                },
                sphere: function () {
                    this.stream.sphere();
                },
                lineStart: function () {
                    this.stream.lineStart();
                },
                lineEnd: function () {
                    this.stream.lineEnd();
                },
                polygonStart: function () {
                    this.stream.polygonStart();
                },
                polygonEnd: function () {
                    this.stream.polygonEnd();
                }
            };

            function d3_geo_transformPoint(stream, point) {
                return {
                    point: point,
                    sphere: function () {
                        stream.sphere();
                    },
                    lineStart: function () {
                        stream.lineStart();
                    },
                    lineEnd: function () {
                        stream.lineEnd();
                    },
                    polygonStart: function () {
                        stream.polygonStart();
                    },
                    polygonEnd: function () {
                        stream.polygonEnd();
                    }
                };
            }

            d3.geo.projection = d3_geo_projection;
            d3.geo.projectionMutator = d3_geo_projectionMutator;

            function d3_geo_projection(project) {
                return d3_geo_projectionMutator(function () {
                    return project;
                })();
            }

            function d3_geo_projectionMutator(projectAt) {
                var project, rotate, projectRotate, projectResample = d3_geo_resample(function (x, y) {
                        x = project(x, y);
                        return [x[0] * k + δx, δy - x[1] * k];
                    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy,
                    preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null,
                    stream;

                function projection(point) {
                    point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
                    return [point[0] * k + δx, δy - point[1] * k];
                }

                function invert(point) {
                    point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
                    return point && [point[0] * d3_degrees, point[1] * d3_degrees];
                }

                projection.stream = function (output) {
                    if (stream) stream.valid = false;
                    stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
                    stream.valid = true;
                    return stream;
                };
                projection.clipAngle = function (_) {
                    if (!arguments.length) return clipAngle;
                    preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
                    return invalidate();
                };
                projection.clipExtent = function (_) {
                    if (!arguments.length) return clipExtent;
                    clipExtent = _;
                    postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
                    return invalidate();
                };
                projection.scale = function (_) {
                    if (!arguments.length) return k;
                    k = +_;
                    return reset();
                };
                projection.translate = function (_) {
                    if (!arguments.length) return [x, y];
                    x = +_[0];
                    y = +_[1];
                    return reset();
                };
                projection.center = function (_) {
                    if (!arguments.length) return [λ * d3_degrees, φ * d3_degrees];
                    λ = _[0] % 360 * d3_radians;
                    φ = _[1] % 360 * d3_radians;
                    return reset();
                };
                projection.rotate = function (_) {
                    if (!arguments.length) return [δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees];
                    δλ = _[0] % 360 * d3_radians;
                    δφ = _[1] % 360 * d3_radians;
                    δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
                    return reset();
                };
                d3.rebind(projection, projectResample, "precision");

                function reset() {
                    projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
                    var center = project(λ, φ);
                    δx = x - center[0] * k;
                    δy = y + center[1] * k;
                    return invalidate();
                }

                function invalidate() {
                    if (stream) stream.valid = false, stream = null;
                    return projection;
                }

                return function () {
                    project = projectAt.apply(this, arguments);
                    projection.invert = project.invert && invert;
                    return reset();
                };
            }

            function d3_geo_projectionRadians(stream) {
                return d3_geo_transformPoint(stream, function (x, y) {
                    stream.point(x * d3_radians, y * d3_radians);
                });
            }

            function d3_geo_equirectangular(λ, φ) {
                return [λ, φ];
            }

            (d3.geo.equirectangular = function () {
                return d3_geo_projection(d3_geo_equirectangular);
            }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
            d3.geo.rotation = function (rotate) {
                rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);

                function forward(coordinates) {
                    coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
                    return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
                }

                forward.invert = function (coordinates) {
                    coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
                    return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
                };
                return forward;
            };

            function d3_geo_identityRotation(λ, φ) {
                return [λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ];
            }

            d3_geo_identityRotation.invert = d3_geo_equirectangular;

            function d3_geo_rotation(δλ, δφ, δγ) {
                return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
            }

            function d3_geo_forwardRotationλ(δλ) {
                return function (λ, φ) {
                    return λ += δλ, [λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ];
                };
            }

            function d3_geo_rotationλ(δλ) {
                var rotation = d3_geo_forwardRotationλ(δλ);
                rotation.invert = d3_geo_forwardRotationλ(-δλ);
                return rotation;
            }

            function d3_geo_rotationφγ(δφ, δγ) {
                var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);

                function rotation(λ, φ) {
                    var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ),
                        k = z * cosδφ + x * sinδφ;
                    return [Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ)];
                }

                rotation.invert = function (λ, φ) {
                    var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ),
                        k = z * cosδγ - y * sinδγ;
                    return [Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ)];
                };
                return rotation;
            }

            d3.geo.circle = function () {
                var origin = [0, 0], angle, precision = 6, interpolate;

                function circle() {
                    var center = typeof origin === "function" ? origin.apply(this, arguments) : origin,
                        rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
                    interpolate(null, null, 1, {
                        point: function (x, y) {
                            ring.push(x = rotate(x, y));
                            x[0] *= d3_degrees, x[1] *= d3_degrees;
                        }
                    });
                    return {
                        type: "Polygon",
                        coordinates: [ring]
                    };
                }

                circle.origin = function (x) {
                    if (!arguments.length) return origin;
                    origin = x;
                    return circle;
                };
                circle.angle = function (x) {
                    if (!arguments.length) return angle;
                    interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
                    return circle;
                };
                circle.precision = function (_) {
                    if (!arguments.length) return precision;
                    interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
                    return circle;
                };
                return circle.angle(90);
            };

            function d3_geo_circleInterpolate(radius, precision) {
                var cr = Math.cos(radius), sr = Math.sin(radius);
                return function (from, to, direction, listener) {
                    var step = direction * precision;
                    if (from != null) {
                        from = d3_geo_circleAngle(cr, from);
                        to = d3_geo_circleAngle(cr, to);
                        if (direction > 0 ? from < to : from > to) from += direction * τ;
                    } else {
                        from = radius + direction * τ;
                        to = radius - .5 * step;
                    }
                    for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
                        listener.point((point = d3_geo_spherical([cr, -sr * Math.cos(t), -sr * Math.sin(t)]))[0], point[1]);
                    }
                };
            }

            function d3_geo_circleAngle(cr, point) {
                var a = d3_geo_cartesian(point);
                a[0] -= cr;
                d3_geo_cartesianNormalize(a);
                var angle = d3_acos(-a[1]);
                return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
            }

            d3.geo.distance = function (a, b) {
                var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians,
                    sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0),
                    sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
                return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
            };
            d3.geo.graticule = function () {
                var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;

                function graticule() {
                    return {
                        type: "MultiLineString",
                        coordinates: lines()
                    };
                }

                function lines() {
                    return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function (x) {
                        return abs(x % DX) > ε;
                    }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function (y) {
                        return abs(y % DY) > ε;
                    }).map(y));
                }

                graticule.lines = function () {
                    return lines().map(function (coordinates) {
                        return {
                            type: "LineString",
                            coordinates: coordinates
                        };
                    });
                };
                graticule.outline = function () {
                    return {
                        type: "Polygon",
                        coordinates: [X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1))]
                    };
                };
                graticule.extent = function (_) {
                    if (!arguments.length) return graticule.minorExtent();
                    return graticule.majorExtent(_).minorExtent(_);
                };
                graticule.majorExtent = function (_) {
                    if (!arguments.length) return [[X0, Y0], [X1, Y1]];
                    X0 = +_[0][0], X1 = +_[1][0];
                    Y0 = +_[0][1], Y1 = +_[1][1];
                    if (X0 > X1) _ = X0, X0 = X1, X1 = _;
                    if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
                    return graticule.precision(precision);
                };
                graticule.minorExtent = function (_) {
                    if (!arguments.length) return [[x0, y0], [x1, y1]];
                    x0 = +_[0][0], x1 = +_[1][0];
                    y0 = +_[0][1], y1 = +_[1][1];
                    if (x0 > x1) _ = x0, x0 = x1, x1 = _;
                    if (y0 > y1) _ = y0, y0 = y1, y1 = _;
                    return graticule.precision(precision);
                };
                graticule.step = function (_) {
                    if (!arguments.length) return graticule.minorStep();
                    return graticule.majorStep(_).minorStep(_);
                };
                graticule.majorStep = function (_) {
                    if (!arguments.length) return [DX, DY];
                    DX = +_[0], DY = +_[1];
                    return graticule;
                };
                graticule.minorStep = function (_) {
                    if (!arguments.length) return [dx, dy];
                    dx = +_[0], dy = +_[1];
                    return graticule;
                };
                graticule.precision = function (_) {
                    if (!arguments.length) return precision;
                    precision = +_;
                    x = d3_geo_graticuleX(y0, y1, 90);
                    y = d3_geo_graticuleY(x0, x1, precision);
                    X = d3_geo_graticuleX(Y0, Y1, 90);
                    Y = d3_geo_graticuleY(X0, X1, precision);
                    return graticule;
                };
                return graticule.majorExtent([[-180, -90 + ε], [180, 90 - ε]]).minorExtent([[-180, -80 - ε], [180, 80 + ε]]);
            };

            function d3_geo_graticuleX(y0, y1, dy) {
                var y = d3.range(y0, y1 - ε, dy).concat(y1);
                return function (x) {
                    return y.map(function (y) {
                        return [x, y];
                    });
                };
            }

            function d3_geo_graticuleY(x0, x1, dx) {
                var x = d3.range(x0, x1 - ε, dx).concat(x1);
                return function (y) {
                    return x.map(function (x) {
                        return [x, y];
                    });
                };
            }

            function d3_source(d) {
                return d.source;
            }

            function d3_target(d) {
                return d.target;
            }

            d3.geo.greatArc = function () {
                var source = d3_source, source_, target = d3_target, target_;

                function greatArc() {
                    return {
                        type: "LineString",
                        coordinates: [source_ || source.apply(this, arguments), target_ || target.apply(this, arguments)]
                    };
                }

                greatArc.distance = function () {
                    return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
                };
                greatArc.source = function (_) {
                    if (!arguments.length) return source;
                    source = _, source_ = typeof _ === "function" ? null : _;
                    return greatArc;
                };
                greatArc.target = function (_) {
                    if (!arguments.length) return target;
                    target = _, target_ = typeof _ === "function" ? null : _;
                    return greatArc;
                };
                greatArc.precision = function () {
                    return arguments.length ? greatArc : 0;
                };
                return greatArc;
            };
            d3.geo.interpolate = function (source, target) {
                return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
            };

            function d3_geo_interpolate(x0, y0, x1, y1) {
                var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1),
                    kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1),
                    ky1 = cy1 * Math.sin(x1),
                    d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))),
                    k = 1 / Math.sin(d);
                var interpolate = d ? function (t) {
                    var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1,
                        z = A * sy0 + B * sy1;
                    return [Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees];
                } : function () {
                    return [x0 * d3_degrees, y0 * d3_degrees];
                };
                interpolate.distance = d;
                return interpolate;
            }

            d3.geo.length = function (object) {
                d3_geo_lengthSum = 0;
                d3.geo.stream(object, d3_geo_length);
                return d3_geo_lengthSum;
            };
            var d3_geo_lengthSum;
            var d3_geo_length = {
                sphere: d3_noop,
                point: d3_noop,
                lineStart: d3_geo_lengthLineStart,
                lineEnd: d3_noop,
                polygonStart: d3_noop,
                polygonEnd: d3_noop
            };

            function d3_geo_lengthLineStart() {
                var λ0, sinφ0, cosφ0;
                d3_geo_length.point = function (λ, φ) {
                    λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
                    d3_geo_length.point = nextPoint;
                };
                d3_geo_length.lineEnd = function () {
                    d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
                };

                function nextPoint(λ, φ) {
                    var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0),
                        cosΔλ = Math.cos(t);
                    d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
                    λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
                }
            }

            function d3_geo_azimuthal(scale, angle) {
                function azimuthal(λ, φ) {
                    var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
                    return [k * cosφ * Math.sin(λ), k * Math.sin(φ)];
                }

                azimuthal.invert = function (x, y) {
                    var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
                    return [Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ)];
                };
                return azimuthal;
            }

            var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function (cosλcosφ) {
                return Math.sqrt(2 / (1 + cosλcosφ));
            }, function (ρ) {
                return 2 * Math.asin(ρ / 2);
            });
            (d3.geo.azimuthalEqualArea = function () {
                return d3_geo_projection(d3_geo_azimuthalEqualArea);
            }).raw = d3_geo_azimuthalEqualArea;
            var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function (cosλcosφ) {
                var c = Math.acos(cosλcosφ);
                return c && c / Math.sin(c);
            }, d3_identity);
            (d3.geo.azimuthalEquidistant = function () {
                return d3_geo_projection(d3_geo_azimuthalEquidistant);
            }).raw = d3_geo_azimuthalEquidistant;

            function d3_geo_conicConformal(φ0, φ1) {
                var cosφ0 = Math.cos(φ0), t = function (φ) {
                        return Math.tan(π / 4 + φ / 2);
                    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)),
                    F = cosφ0 * Math.pow(t(φ0), n) / n;
                if (!n) return d3_geo_mercator;

                function forward(λ, φ) {
                    if (F > 0) {
                        if (φ < -halfπ + ε) φ = -halfπ + ε;
                    } else {
                        if (φ > halfπ - ε) φ = halfπ - ε;
                    }
                    var ρ = F / Math.pow(t(φ), n);
                    return [ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ)];
                }

                forward.invert = function (x, y) {
                    var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
                    return [Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ];
                };
                return forward;
            }

            (d3.geo.conicConformal = function () {
                return d3_geo_conic(d3_geo_conicConformal);
            }).raw = d3_geo_conicConformal;

            function d3_geo_conicEquidistant(φ0, φ1) {
                var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0),
                    G = cosφ0 / n + φ0;
                if (abs(n) < ε) return d3_geo_equirectangular;

                function forward(λ, φ) {
                    var ρ = G - φ;
                    return [ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ)];
                }

                forward.invert = function (x, y) {
                    var ρ0_y = G - y;
                    return [Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y)];
                };
                return forward;
            }

            (d3.geo.conicEquidistant = function () {
                return d3_geo_conic(d3_geo_conicEquidistant);
            }).raw = d3_geo_conicEquidistant;
            var d3_geo_gnomonic = d3_geo_azimuthal(function (cosλcosφ) {
                return 1 / cosλcosφ;
            }, Math.atan);
            (d3.geo.gnomonic = function () {
                return d3_geo_projection(d3_geo_gnomonic);
            }).raw = d3_geo_gnomonic;

            function d3_geo_mercator(λ, φ) {
                return [λ, Math.log(Math.tan(π / 4 + φ / 2))];
            }

            d3_geo_mercator.invert = function (x, y) {
                return [x, 2 * Math.atan(Math.exp(y)) - halfπ];
            };

            function d3_geo_mercatorProjection(project) {
                var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent,
                    clipAuto;
                m.scale = function () {
                    var v = scale.apply(m, arguments);
                    return v === m ? clipAuto ? m.clipExtent(null) : m : v;
                };
                m.translate = function () {
                    var v = translate.apply(m, arguments);
                    return v === m ? clipAuto ? m.clipExtent(null) : m : v;
                };
                m.clipExtent = function (_) {
                    var v = clipExtent.apply(m, arguments);
                    if (v === m) {
                        if (clipAuto = _ == null) {
                            var k = π * scale(), t = translate();
                            clipExtent([[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]]);
                        }
                    } else if (clipAuto) {
                        v = null;
                    }
                    return v;
                };
                return m.clipExtent(null);
            }

            (d3.geo.mercator = function () {
                return d3_geo_mercatorProjection(d3_geo_mercator);
            }).raw = d3_geo_mercator;
            var d3_geo_orthographic = d3_geo_azimuthal(function () {
                return 1;
            }, Math.asin);
            (d3.geo.orthographic = function () {
                return d3_geo_projection(d3_geo_orthographic);
            }).raw = d3_geo_orthographic;
            var d3_geo_stereographic = d3_geo_azimuthal(function (cosλcosφ) {
                return 1 / (1 + cosλcosφ);
            }, function (ρ) {
                return 2 * Math.atan(ρ);
            });
            (d3.geo.stereographic = function () {
                return d3_geo_projection(d3_geo_stereographic);
            }).raw = d3_geo_stereographic;

            function d3_geo_transverseMercator(λ, φ) {
                return [Math.log(Math.tan(π / 4 + φ / 2)), -λ];
            }

            d3_geo_transverseMercator.invert = function (x, y) {
                return [-y, 2 * Math.atan(Math.exp(x)) - halfπ];
            };
            (d3.geo.transverseMercator = function () {
                var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center,
                    rotate = projection.rotate;
                projection.center = function (_) {
                    return _ ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
                };
                projection.rotate = function (_) {
                    return _ ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(),
                        [_[0], _[1], _[2] - 90]);
                };
                return rotate([0, 0, 90]);
            }).raw = d3_geo_transverseMercator;
            d3.geom = {};

            function d3_geom_pointX(d) {
                return d[0];
            }

            function d3_geom_pointY(d) {
                return d[1];
            }

            d3.geom.hull = function (vertices) {
                var x = d3_geom_pointX, y = d3_geom_pointY;
                if (arguments.length) return hull(vertices);

                function hull(data) {
                    if (data.length < 3) return [];
                    var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
                    for (i = 0; i < n; i++) {
                        points.push([+fx.call(this, data[i], i), +fy.call(this, data[i], i), i]);
                    }
                    points.sort(d3_geom_hullOrder);
                    for (i = 0; i < n; i++) flippedPoints.push([points[i][0], -points[i][1]]);
                    var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
                    var skipLeft = lower[0] === upper[0],
                        skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
                    for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
                    for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
                    return polygon;
                }

                hull.x = function (_) {
                    return arguments.length ? (x = _, hull) : x;
                };
                hull.y = function (_) {
                    return arguments.length ? (y = _, hull) : y;
                };
                return hull;
            };

            function d3_geom_hullUpper(points) {
                var n = points.length, hull = [0, 1], hs = 2;
                for (var i = 2; i < n; i++) {
                    while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
                    hull[hs++] = i;
                }
                return hull.slice(0, hs);
            }

            function d3_geom_hullOrder(a, b) {
                return a[0] - b[0] || a[1] - b[1];
            }

            d3.geom.polygon = function (coordinates) {
                d3_subclass(coordinates, d3_geom_polygonPrototype);
                return coordinates;
            };
            var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
            d3_geom_polygonPrototype.area = function () {
                var i = -1, n = this.length, a, b = this[n - 1], area = 0;
                while (++i < n) {
                    a = b;
                    b = this[i];
                    area += a[1] * b[0] - a[0] * b[1];
                }
                return area * .5;
            };
            d3_geom_polygonPrototype.centroid = function (k) {
                var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
                if (!arguments.length) k = -1 / (6 * this.area());
                while (++i < n) {
                    a = b;
                    b = this[i];
                    c = a[0] * b[1] - b[0] * a[1];
                    x += (a[0] + b[0]) * c;
                    y += (a[1] + b[1]) * c;
                }
                return [x * k, y * k];
            };
            d3_geom_polygonPrototype.clip = function (subject) {
                var input, closed = d3_geom_polygonClosed(subject), i = -1,
                    n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
                while (++i < n) {
                    input = subject.slice();
                    subject.length = 0;
                    b = this[i];
                    c = input[(m = input.length - closed) - 1];
                    j = -1;
                    while (++j < m) {
                        d = input[j];
                        if (d3_geom_polygonInside(d, a, b)) {
                            if (!d3_geom_polygonInside(c, a, b)) {
                                subject.push(d3_geom_polygonIntersect(c, d, a, b));
                            }
                            subject.push(d);
                        } else if (d3_geom_polygonInside(c, a, b)) {
                            subject.push(d3_geom_polygonIntersect(c, d, a, b));
                        }
                        c = d;
                    }
                    if (closed) subject.push(subject[0]);
                    a = b;
                }
                return subject;
            };

            function d3_geom_polygonInside(p, a, b) {
                return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
            }

            function d3_geom_polygonIntersect(c, d, a, b) {
                var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1,
                    y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
                return [x1 + ua * x21, y1 + ua * y21];
            }

            function d3_geom_polygonClosed(coordinates) {
                var a = coordinates[0], b = coordinates[coordinates.length - 1];
                return !(a[0] - b[0] || a[1] - b[1]);
            }

            var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [],
                d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];

            function d3_geom_voronoiBeach() {
                d3_geom_voronoiRedBlackNode(this);
                this.edge = this.site = this.circle = null;
            }

            function d3_geom_voronoiCreateBeach(site) {
                var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
                beach.site = site;
                return beach;
            }

            function d3_geom_voronoiDetachBeach(beach) {
                d3_geom_voronoiDetachCircle(beach);
                d3_geom_voronoiBeaches.remove(beach);
                d3_geom_voronoiBeachPool.push(beach);
                d3_geom_voronoiRedBlackNode(beach);
            }

            function d3_geom_voronoiRemoveBeach(beach) {
                var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
                    x: x,
                    y: y
                }, previous = beach.P, next = beach.N, disappearing = [beach];
                d3_geom_voronoiDetachBeach(beach);
                var lArc = previous;
                while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
                    previous = lArc.P;
                    disappearing.unshift(lArc);
                    d3_geom_voronoiDetachBeach(lArc);
                    lArc = previous;
                }
                disappearing.unshift(lArc);
                d3_geom_voronoiDetachCircle(lArc);
                var rArc = next;
                while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
                    next = rArc.N;
                    disappearing.push(rArc);
                    d3_geom_voronoiDetachBeach(rArc);
                    rArc = next;
                }
                disappearing.push(rArc);
                d3_geom_voronoiDetachCircle(rArc);
                var nArcs = disappearing.length, iArc;
                for (iArc = 1; iArc < nArcs; ++iArc) {
                    rArc = disappearing[iArc];
                    lArc = disappearing[iArc - 1];
                    d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
                }
                lArc = disappearing[0];
                rArc = disappearing[nArcs - 1];
                rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
                d3_geom_voronoiAttachCircle(lArc);
                d3_geom_voronoiAttachCircle(rArc);
            }

            function d3_geom_voronoiAddBeach(site) {
                var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
                while (node) {
                    dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
                    if (dxl > ε) node = node.L; else {
                        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
                        if (dxr > ε) {
                            if (!node.R) {
                                lArc = node;
                                break;
                            }
                            node = node.R;
                        } else {
                            if (dxl > -ε) {
                                lArc = node.P;
                                rArc = node;
                            } else if (dxr > -ε) {
                                lArc = node;
                                rArc = node.N;
                            } else {
                                lArc = rArc = node;
                            }
                            break;
                        }
                    }
                }
                var newArc = d3_geom_voronoiCreateBeach(site);
                d3_geom_voronoiBeaches.insert(lArc, newArc);
                if (!lArc && !rArc) return;
                if (lArc === rArc) {
                    d3_geom_voronoiDetachCircle(lArc);
                    rArc = d3_geom_voronoiCreateBeach(lArc.site);
                    d3_geom_voronoiBeaches.insert(newArc, rArc);
                    newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
                    d3_geom_voronoiAttachCircle(lArc);
                    d3_geom_voronoiAttachCircle(rArc);
                    return;
                }
                if (!rArc) {
                    newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
                    return;
                }
                d3_geom_voronoiDetachCircle(lArc);
                d3_geom_voronoiDetachCircle(rArc);
                var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay,
                    rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx),
                    hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
                        x: (cy * hb - by * hc) / d + ax,
                        y: (bx * hc - cx * hb) / d + ay
                    };
                d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
                newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
                rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
                d3_geom_voronoiAttachCircle(lArc);
                d3_geom_voronoiAttachCircle(rArc);
            }

            function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
                var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
                if (!pby2) return rfocx;
                var lArc = arc.P;
                if (!lArc) return -Infinity;
                site = lArc.site;
                var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
                if (!plby2) return lfocx;
                var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
                if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
                return (rfocx + lfocx) / 2;
            }

            function d3_geom_voronoiRightBreakPoint(arc, directrix) {
                var rArc = arc.N;
                if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
                var site = arc.site;
                return site.y === directrix ? site.x : Infinity;
            }

            function d3_geom_voronoiCell(site) {
                this.site = site;
                this.edges = [];
            }

            d3_geom_voronoiCell.prototype.prepare = function () {
                var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
                while (iHalfEdge--) {
                    edge = halfEdges[iHalfEdge].edge;
                    if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
                }
                halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
                return halfEdges.length;
            };

            function d3_geom_voronoiCloseCells(extent) {
                var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3,
                    cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start,
                    end;
                while (iCell--) {
                    cell = cells[iCell];
                    if (!cell || !cell.prepare()) continue;
                    halfEdges = cell.edges;
                    nHalfEdges = halfEdges.length;
                    iHalfEdge = 0;
                    while (iHalfEdge < nHalfEdges) {
                        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
                        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
                        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
                            halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
                                x: x0,
                                y: abs(x2 - x0) < ε ? y2 : y1
                            } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
                                x: abs(y2 - y1) < ε ? x2 : x1,
                                y: y1
                            } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
                                x: x1,
                                y: abs(x2 - x1) < ε ? y2 : y0
                            } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
                                x: abs(y2 - y0) < ε ? x2 : x0,
                                y: y0
                            } : null), cell.site, null));
                            ++nHalfEdges;
                        }
                    }
                }
            }

            function d3_geom_voronoiHalfEdgeOrder(a, b) {
                return b.angle - a.angle;
            }

            function d3_geom_voronoiCircle() {
                d3_geom_voronoiRedBlackNode(this);
                this.x = this.y = this.arc = this.site = this.cy = null;
            }

            function d3_geom_voronoiAttachCircle(arc) {
                var lArc = arc.P, rArc = arc.N;
                if (!lArc || !rArc) return;
                var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
                if (lSite === rSite) return;
                var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx,
                    cy = rSite.y - by;
                var d = 2 * (ax * cy - ay * cx);
                if (d >= -ε2) return;
                var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d,
                    y = (ax * hc - cx * ha) / d, cy = y + by;
                var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
                circle.arc = arc;
                circle.site = cSite;
                circle.x = x + bx;
                circle.y = cy + Math.sqrt(x * x + y * y);
                circle.cy = cy;
                arc.circle = circle;
                var before = null, node = d3_geom_voronoiCircles._;
                while (node) {
                    if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
                        if (node.L) node = node.L; else {
                            before = node.P;
                            break;
                        }
                    } else {
                        if (node.R) node = node.R; else {
                            before = node;
                            break;
                        }
                    }
                }
                d3_geom_voronoiCircles.insert(before, circle);
                if (!before) d3_geom_voronoiFirstCircle = circle;
            }

            function d3_geom_voronoiDetachCircle(arc) {
                var circle = arc.circle;
                if (circle) {
                    if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
                    d3_geom_voronoiCircles.remove(circle);
                    d3_geom_voronoiCirclePool.push(circle);
                    d3_geom_voronoiRedBlackNode(circle);
                    arc.circle = null;
                }
            }

            function d3_geom_voronoiClipEdges(extent) {
                var edges = d3_geom_voronoiEdges,
                    clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length,
                    e;
                while (i--) {
                    e = edges[i];
                    if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
                        e.a = e.b = null;
                        edges.splice(i, 1);
                    }
                }
            }

            function d3_geom_voronoiConnectEdge(edge, extent) {
                var vb = edge.b;
                if (vb) return true;
                var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1],
                    lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y,
                    fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
                if (ry === ly) {
                    if (fx < x0 || fx >= x1) return;
                    if (lx > rx) {
                        if (!va) va = {
                            x: fx,
                            y: y0
                        }; else if (va.y >= y1) return;
                        vb = {
                            x: fx,
                            y: y1
                        };
                    } else {
                        if (!va) va = {
                            x: fx,
                            y: y1
                        }; else if (va.y < y0) return;
                        vb = {
                            x: fx,
                            y: y0
                        };
                    }
                } else {
                    fm = (lx - rx) / (ry - ly);
                    fb = fy - fm * fx;
                    if (fm < -1 || fm > 1) {
                        if (lx > rx) {
                            if (!va) va = {
                                x: (y0 - fb) / fm,
                                y: y0
                            }; else if (va.y >= y1) return;
                            vb = {
                                x: (y1 - fb) / fm,
                                y: y1
                            };
                        } else {
                            if (!va) va = {
                                x: (y1 - fb) / fm,
                                y: y1
                            }; else if (va.y < y0) return;
                            vb = {
                                x: (y0 - fb) / fm,
                                y: y0
                            };
                        }
                    } else {
                        if (ly < ry) {
                            if (!va) va = {
                                x: x0,
                                y: fm * x0 + fb
                            }; else if (va.x >= x1) return;
                            vb = {
                                x: x1,
                                y: fm * x1 + fb
                            };
                        } else {
                            if (!va) va = {
                                x: x1,
                                y: fm * x1 + fb
                            }; else if (va.x < x0) return;
                            vb = {
                                x: x0,
                                y: fm * x0 + fb
                            };
                        }
                    }
                }
                edge.a = va;
                edge.b = vb;
                return true;
            }

            function d3_geom_voronoiEdge(lSite, rSite) {
                this.l = lSite;
                this.r = rSite;
                this.a = this.b = null;
            }

            function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
                var edge = new d3_geom_voronoiEdge(lSite, rSite);
                d3_geom_voronoiEdges.push(edge);
                if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
                if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
                d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
                d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
                return edge;
            }

            function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
                var edge = new d3_geom_voronoiEdge(lSite, null);
                edge.a = va;
                edge.b = vb;
                d3_geom_voronoiEdges.push(edge);
                return edge;
            }

            function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
                if (!edge.a && !edge.b) {
                    edge.a = vertex;
                    edge.l = lSite;
                    edge.r = rSite;
                } else if (edge.l === rSite) {
                    edge.b = vertex;
                } else {
                    edge.a = vertex;
                }
            }

            function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
                var va = edge.a, vb = edge.b;
                this.edge = edge;
                this.site = lSite;
                this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
            }

            d3_geom_voronoiHalfEdge.prototype = {
                start: function () {
                    return this.edge.l === this.site ? this.edge.a : this.edge.b;
                },
                end: function () {
                    return this.edge.l === this.site ? this.edge.b : this.edge.a;
                }
            };

            function d3_geom_voronoiRedBlackTree() {
                this._ = null;
            }

            function d3_geom_voronoiRedBlackNode(node) {
                node.U = node.C = node.L = node.R = node.P = node.N = null;
            }

            d3_geom_voronoiRedBlackTree.prototype = {
                insert: function (after, node) {
                    var parent, grandpa, uncle;
                    if (after) {
                        node.P = after;
                        node.N = after.N;
                        if (after.N) after.N.P = node;
                        after.N = node;
                        if (after.R) {
                            after = after.R;
                            while (after.L) after = after.L;
                            after.L = node;
                        } else {
                            after.R = node;
                        }
                        parent = after;
                    } else if (this._) {
                        after = d3_geom_voronoiRedBlackFirst(this._);
                        node.P = null;
                        node.N = after;
                        after.P = after.L = node;
                        parent = after;
                    } else {
                        node.P = node.N = null;
                        this._ = node;
                        parent = null;
                    }
                    node.L = node.R = null;
                    node.U = parent;
                    node.C = true;
                    after = node;
                    while (parent && parent.C) {
                        grandpa = parent.U;
                        if (parent === grandpa.L) {
                            uncle = grandpa.R;
                            if (uncle && uncle.C) {
                                parent.C = uncle.C = false;
                                grandpa.C = true;
                                after = grandpa;
                            } else {
                                if (after === parent.R) {
                                    d3_geom_voronoiRedBlackRotateLeft(this, parent);
                                    after = parent;
                                    parent = after.U;
                                }
                                parent.C = false;
                                grandpa.C = true;
                                d3_geom_voronoiRedBlackRotateRight(this, grandpa);
                            }
                        } else {
                            uncle = grandpa.L;
                            if (uncle && uncle.C) {
                                parent.C = uncle.C = false;
                                grandpa.C = true;
                                after = grandpa;
                            } else {
                                if (after === parent.L) {
                                    d3_geom_voronoiRedBlackRotateRight(this, parent);
                                    after = parent;
                                    parent = after.U;
                                }
                                parent.C = false;
                                grandpa.C = true;
                                d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
                            }
                        }
                        parent = after.U;
                    }
                    this._.C = false;
                },
                remove: function (node) {
                    if (node.N) node.N.P = node.P;
                    if (node.P) node.P.N = node.N;
                    node.N = node.P = null;
                    var parent = node.U, sibling, left = node.L, right = node.R, next, red;
                    if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
                    if (parent) {
                        if (parent.L === node) parent.L = next; else parent.R = next;
                    } else {
                        this._ = next;
                    }
                    if (left && right) {
                        red = next.C;
                        next.C = node.C;
                        next.L = left;
                        left.U = next;
                        if (next !== right) {
                            parent = next.U;
                            next.U = node.U;
                            node = next.R;
                            parent.L = node;
                            next.R = right;
                            right.U = next;
                        } else {
                            next.U = parent;
                            parent = next;
                            node = next.R;
                        }
                    } else {
                        red = node.C;
                        node = next;
                    }
                    if (node) node.U = parent;
                    if (red) return;
                    if (node && node.C) {
                        node.C = false;
                        return;
                    }
                    do {
                        if (node === this._) break;
                        if (node === parent.L) {
                            sibling = parent.R;
                            if (sibling.C) {
                                sibling.C = false;
                                parent.C = true;
                                d3_geom_voronoiRedBlackRotateLeft(this, parent);
                                sibling = parent.R;
                            }
                            if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
                                if (!sibling.R || !sibling.R.C) {
                                    sibling.L.C = false;
                                    sibling.C = true;
                                    d3_geom_voronoiRedBlackRotateRight(this, sibling);
                                    sibling = parent.R;
                                }
                                sibling.C = parent.C;
                                parent.C = sibling.R.C = false;
                                d3_geom_voronoiRedBlackRotateLeft(this, parent);
                                node = this._;
                                break;
                            }
                        } else {
                            sibling = parent.L;
                            if (sibling.C) {
                                sibling.C = false;
                                parent.C = true;
                                d3_geom_voronoiRedBlackRotateRight(this, parent);
                                sibling = parent.L;
                            }
                            if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
                                if (!sibling.L || !sibling.L.C) {
                                    sibling.R.C = false;
                                    sibling.C = true;
                                    d3_geom_voronoiRedBlackRotateLeft(this, sibling);
                                    sibling = parent.L;
                                }
                                sibling.C = parent.C;
                                parent.C = sibling.L.C = false;
                                d3_geom_voronoiRedBlackRotateRight(this, parent);
                                node = this._;
                                break;
                            }
                        }
                        sibling.C = true;
                        node = parent;
                        parent = parent.U;
                    } while (!node.C);
                    if (node) node.C = false;
                }
            };

            function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
                var p = node, q = node.R, parent = p.U;
                if (parent) {
                    if (parent.L === p) parent.L = q; else parent.R = q;
                } else {
                    tree._ = q;
                }
                q.U = parent;
                p.U = q;
                p.R = q.L;
                if (p.R) p.R.U = p;
                q.L = p;
            }

            function d3_geom_voronoiRedBlackRotateRight(tree, node) {
                var p = node, q = node.L, parent = p.U;
                if (parent) {
                    if (parent.L === p) parent.L = q; else parent.R = q;
                } else {
                    tree._ = q;
                }
                q.U = parent;
                p.U = q;
                p.L = q.R;
                if (p.L) p.L.U = p;
                q.R = p;
            }

            function d3_geom_voronoiRedBlackFirst(node) {
                while (node.L) node = node.L;
                return node;
            }

            function d3_geom_voronoi(sites, bbox) {
                var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
                d3_geom_voronoiEdges = [];
                d3_geom_voronoiCells = new Array(sites.length);
                d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
                d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
                while (true) {
                    circle = d3_geom_voronoiFirstCircle;
                    if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
                        if (site.x !== x0 || site.y !== y0) {
                            d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
                            d3_geom_voronoiAddBeach(site);
                            x0 = site.x, y0 = site.y;
                        }
                        site = sites.pop();
                    } else if (circle) {
                        d3_geom_voronoiRemoveBeach(circle.arc);
                    } else {
                        break;
                    }
                }
                if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
                var diagram = {
                    cells: d3_geom_voronoiCells,
                    edges: d3_geom_voronoiEdges
                };
                d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
                return diagram;
            }

            function d3_geom_voronoiVertexOrder(a, b) {
                return b.y - a.y || b.x - a.x;
            }

            d3.geom.voronoi = function (points) {
                var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
                if (points) return voronoi(points);

                function voronoi(data) {
                    var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1],
                        x1 = clipExtent[1][0], y1 = clipExtent[1][1];
                    d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function (cell, i) {
                        var edges = cell.edges, site = cell.site,
                            polygon = polygons[i] = edges.length ? edges.map(function (e) {
                                var s = e.start();
                                return [s.x, s.y];
                            }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [[x0, y1], [x1, y1], [x1, y0], [x0, y0]] : [];
                        polygon.point = data[i];
                    });
                    return polygons;
                }

                function sites(data) {
                    return data.map(function (d, i) {
                        return {
                            x: Math.round(fx(d, i) / ε) * ε,
                            y: Math.round(fy(d, i) / ε) * ε,
                            i: i
                        };
                    });
                }

                voronoi.links = function (data) {
                    return d3_geom_voronoi(sites(data)).edges.filter(function (edge) {
                        return edge.l && edge.r;
                    }).map(function (edge) {
                        return {
                            source: data[edge.l.i],
                            target: data[edge.r.i]
                        };
                    });
                };
                voronoi.triangles = function (data) {
                    var triangles = [];
                    d3_geom_voronoi(sites(data)).cells.forEach(function (cell, i) {
                        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1,
                            m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
                        while (++j < m) {
                            e0 = e1;
                            s0 = s1;
                            e1 = edges[j].edge;
                            s1 = e1.l === site ? e1.r : e1.l;
                            if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
                                triangles.push([data[i], data[s0.i], data[s1.i]]);
                            }
                        }
                    });
                    return triangles;
                };
                voronoi.x = function (_) {
                    return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
                };
                voronoi.y = function (_) {
                    return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
                };
                voronoi.clipExtent = function (_) {
                    if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
                    clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
                    return voronoi;
                };
                voronoi.size = function (_) {
                    if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
                    return voronoi.clipExtent(_ && [[0, 0], _]);
                };
                return voronoi;
            };
            var d3_geom_voronoiClipExtent = [[-1e6, -1e6], [1e6, 1e6]];

            function d3_geom_voronoiTriangleArea(a, b, c) {
                return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
            }

            d3.geom.delaunay = function (vertices) {
                return d3.geom.voronoi().triangles(vertices);
            };
            d3.geom.quadtree = function (points, x1, y1, x2, y2) {
                var x = d3_geom_pointX, y = d3_geom_pointY, compat;
                if (compat = arguments.length) {
                    x = d3_geom_quadtreeCompatX;
                    y = d3_geom_quadtreeCompatY;
                    if (compat === 3) {
                        y2 = y1;
                        x2 = x1;
                        y1 = x1 = 0;
                    }
                    return quadtree(points);
                }

                function quadtree(data) {
                    var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
                    if (x1 != null) {
                        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
                    } else {
                        x2_ = y2_ = -(x1_ = y1_ = Infinity);
                        xs = [], ys = [];
                        n = data.length;
                        if (compat) for (i = 0; i < n; ++i) {
                            d = data[i];
                            if (d.x < x1_) x1_ = d.x;
                            if (d.y < y1_) y1_ = d.y;
                            if (d.x > x2_) x2_ = d.x;
                            if (d.y > y2_) y2_ = d.y;
                            xs.push(d.x);
                            ys.push(d.y);
                        } else for (i = 0; i < n; ++i) {
                            var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
                            if (x_ < x1_) x1_ = x_;
                            if (y_ < y1_) y1_ = y_;
                            if (x_ > x2_) x2_ = x_;
                            if (y_ > y2_) y2_ = y_;
                            xs.push(x_);
                            ys.push(y_);
                        }
                    }
                    var dx = x2_ - x1_, dy = y2_ - y1_;
                    if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;

                    function insert(n, d, x, y, x1, y1, x2, y2) {
                        if (isNaN(x) || isNaN(y)) return;
                        if (n.leaf) {
                            var nx = n.x, ny = n.y;
                            if (nx != null) {
                                if (abs(nx - x) + abs(ny - y) < .01) {
                                    insertChild(n, d, x, y, x1, y1, x2, y2);
                                } else {
                                    var nPoint = n.point;
                                    n.x = n.y = n.point = null;
                                    insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
                                    insertChild(n, d, x, y, x1, y1, x2, y2);
                                }
                            } else {
                                n.x = x, n.y = y, n.point = d;
                            }
                        } else {
                            insertChild(n, d, x, y, x1, y1, x2, y2);
                        }
                    }

                    function insertChild(n, d, x, y, x1, y1, x2, y2) {
                        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym,
                            i = below << 1 | right;
                        n.leaf = false;
                        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
                        if (right) x1 = xm; else x2 = xm;
                        if (below) y1 = ym; else y2 = ym;
                        insert(n, d, x, y, x1, y1, x2, y2);
                    }

                    var root = d3_geom_quadtreeNode();
                    root.add = function (d) {
                        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
                    };
                    root.visit = function (f) {
                        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
                    };
                    root.find = function (point) {
                        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
                    };
                    i = -1;
                    if (x1 == null) {
                        while (++i < n) {
                            insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
                        }
                        --i;
                    } else data.forEach(root.add);
                    xs = ys = data = d = null;
                    return root;
                }

                quadtree.x = function (_) {
                    return arguments.length ? (x = _, quadtree) : x;
                };
                quadtree.y = function (_) {
                    return arguments.length ? (y = _, quadtree) : y;
                };
                quadtree.extent = function (_) {
                    if (!arguments.length) return x1 == null ? null : [[x1, y1], [x2, y2]];
                    if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0],
                        y2 = +_[1][1];
                    return quadtree;
                };
                quadtree.size = function (_) {
                    if (!arguments.length) return x1 == null ? null : [x2 - x1, y2 - y1];
                    if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
                    return quadtree;
                };
                return quadtree;
            };

            function d3_geom_quadtreeCompatX(d) {
                return d.x;
            }

            function d3_geom_quadtreeCompatY(d) {
                return d.y;
            }

            function d3_geom_quadtreeNode() {
                return {
                    leaf: true,
                    nodes: [],
                    point: null,
                    x: null,
                    y: null
                };
            }

            function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
                if (!f(node, x1, y1, x2, y2)) {
                    var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
                    if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
                    if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
                    if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
                    if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
                }
            }

            function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
                var minDistance2 = Infinity, closestPoint;
                (function find(node, x1, y1, x2, y2) {
                    if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
                    if (point = node.point) {
                        var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
                        if (distance2 < minDistance2) {
                            var distance = Math.sqrt(minDistance2 = distance2);
                            x0 = x - distance, y0 = y - distance;
                            x3 = x + distance, y3 = y + distance;
                            closestPoint = point;
                        }
                    }
                    var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm,
                        below = y >= ym;
                    for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
                        if (node = children[i & 3]) switch (i & 3) {
                            case 0:
                                find(node, x1, y1, xm, ym);
                                break;

                            case 1:
                                find(node, xm, y1, x2, ym);
                                break;

                            case 2:
                                find(node, x1, ym, xm, y2);
                                break;

                            case 3:
                                find(node, xm, ym, x2, y2);
                                break;
                        }
                    }
                })(root, x0, y0, x3, y3);
                return closestPoint;
            }

            d3.interpolateRgb = d3_interpolateRgb;

            function d3_interpolateRgb(a, b) {
                a = d3.rgb(a);
                b = d3.rgb(b);
                var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
                return function (t) {
                    return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
                };
            }

            d3.interpolateObject = d3_interpolateObject;

            function d3_interpolateObject(a, b) {
                var i = {}, c = {}, k;
                for (k in a) {
                    if (k in b) {
                        i[k] = d3_interpolate(a[k], b[k]);
                    } else {
                        c[k] = a[k];
                    }
                }
                for (k in b) {
                    if (!(k in a)) {
                        c[k] = b[k];
                    }
                }
                return function (t) {
                    for (k in i) c[k] = i[k](t);
                    return c;
                };
            }

            d3.interpolateNumber = d3_interpolateNumber;

            function d3_interpolateNumber(a, b) {
                a = +a, b = +b;
                return function (t) {
                    return a * (1 - t) + b * t;
                };
            }

            d3.interpolateString = d3_interpolateString;

            function d3_interpolateString(a, b) {
                var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1,
                    s = [], q = [];
                a = a + "", b = b + "";
                while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
                    if ((bs = bm.index) > bi) {
                        bs = b.slice(bi, bs);
                        if (s[i]) s[i] += bs; else s[++i] = bs;
                    }
                    if ((am = am[0]) === (bm = bm[0])) {
                        if (s[i]) s[i] += bm; else s[++i] = bm;
                    } else {
                        s[++i] = null;
                        q.push({
                            i: i,
                            x: d3_interpolateNumber(am, bm)
                        });
                    }
                    bi = d3_interpolate_numberB.lastIndex;
                }
                if (bi < b.length) {
                    bs = b.slice(bi);
                    if (s[i]) s[i] += bs; else s[++i] = bs;
                }
                return s.length < 2 ? q[0] ? (b = q[0].x, function (t) {
                    return b(t) + "";
                }) : function () {
                    return b;
                } : (b = q.length, function (t) {
                    for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
                    return s.join("");
                });
            }

            var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
                d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
            d3.interpolate = d3_interpolate;

            function d3_interpolate(a, b) {
                var i = d3.interpolators.length, f;
                while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
                return f;
            }

            d3.interpolators = [function (a, b) {
                var t = typeof b;
                return (t === "string" ? d3_rgb_names.has(b.toLowerCase()) || /^(#|rgb\(|hsl\()/i.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
            }];
            d3.interpolateArray = d3_interpolateArray;

            function d3_interpolateArray(a, b) {
                var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
                for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
                for (; i < na; ++i) c[i] = a[i];
                for (; i < nb; ++i) c[i] = b[i];
                return function (t) {
                    for (i = 0; i < n0; ++i) c[i] = x[i](t);
                    return c;
                };
            }

            var d3_ease_default = function () {
                return d3_identity;
            };
            var d3_ease = d3.map({
                linear: d3_ease_default,
                poly: d3_ease_poly,
                quad: function () {
                    return d3_ease_quad;
                },
                cubic: function () {
                    return d3_ease_cubic;
                },
                sin: function () {
                    return d3_ease_sin;
                },
                exp: function () {
                    return d3_ease_exp;
                },
                circle: function () {
                    return d3_ease_circle;
                },
                elastic: d3_ease_elastic,
                back: d3_ease_back,
                bounce: function () {
                    return d3_ease_bounce;
                }
            });
            var d3_ease_mode = d3.map({
                "in": d3_identity,
                out: d3_ease_reverse,
                "in-out": d3_ease_reflect,
                "out-in": function (f) {
                    return d3_ease_reflect(d3_ease_reverse(f));
                }
            });
            d3.ease = function (name) {
                var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
                t = d3_ease.get(t) || d3_ease_default;
                m = d3_ease_mode.get(m) || d3_identity;
                return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
            };

            function d3_ease_clamp(f) {
                return function (t) {
                    return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
                };
            }

            function d3_ease_reverse(f) {
                return function (t) {
                    return 1 - f(1 - t);
                };
            }

            function d3_ease_reflect(f) {
                return function (t) {
                    return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
                };
            }

            function d3_ease_quad(t) {
                return t * t;
            }

            function d3_ease_cubic(t) {
                return t * t * t;
            }

            function d3_ease_cubicInOut(t) {
                if (t <= 0) return 0;
                if (t >= 1) return 1;
                var t2 = t * t, t3 = t2 * t;
                return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
            }

            function d3_ease_poly(e) {
                return function (t) {
                    return Math.pow(t, e);
                };
            }

            function d3_ease_sin(t) {
                return 1 - Math.cos(t * halfπ);
            }

            function d3_ease_exp(t) {
                return Math.pow(2, 10 * (t - 1));
            }

            function d3_ease_circle(t) {
                return 1 - Math.sqrt(1 - t * t);
            }

            function d3_ease_elastic(a, p) {
                var s;
                if (arguments.length < 2) p = .45;
                if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
                return function (t) {
                    return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
                };
            }

            function d3_ease_back(s) {
                if (!s) s = 1.70158;
                return function (t) {
                    return t * t * ((s + 1) * t - s);
                };
            }

            function d3_ease_bounce(t) {
                return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
            }

            d3.interpolateHcl = d3_interpolateHcl;

            function d3_interpolateHcl(a, b) {
                a = d3.hcl(a);
                b = d3.hcl(b);
                var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
                if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
                if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
                return function (t) {
                    return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
                };
            }

            d3.interpolateHsl = d3_interpolateHsl;

            function d3_interpolateHsl(a, b) {
                a = d3.hsl(a);
                b = d3.hsl(b);
                var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
                if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
                if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
                return function (t) {
                    return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
                };
            }

            d3.interpolateLab = d3_interpolateLab;

            function d3_interpolateLab(a, b) {
                a = d3.lab(a);
                b = d3.lab(b);
                var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
                return function (t) {
                    return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
                };
            }

            d3.interpolateRound = d3_interpolateRound;

            function d3_interpolateRound(a, b) {
                b -= a;
                return function (t) {
                    return Math.round(a + b * t);
                };
            }

            d3.transform = function (string) {
                var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
                return (d3.transform = function (string) {
                    if (string != null) {
                        g.setAttribute("transform", string);
                        var t = g.transform.baseVal.consolidate();
                    }
                    return new d3_transform(t ? t.matrix : d3_transformIdentity);
                })(string);
            };

            function d3_transform(m) {
                var r0 = [m.a, m.b], r1 = [m.c, m.d], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1),
                    ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
                if (r0[0] * r1[1] < r1[0] * r0[1]) {
                    r0[0] *= -1;
                    r0[1] *= -1;
                    kx *= -1;
                    kz *= -1;
                }
                this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
                this.translate = [m.e, m.f];
                this.scale = [kx, ky];
                this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
            }

            d3_transform.prototype.toString = function () {
                return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
            };

            function d3_transformDot(a, b) {
                return a[0] * b[0] + a[1] * b[1];
            }

            function d3_transformNormalize(a) {
                var k = Math.sqrt(d3_transformDot(a, a));
                if (k) {
                    a[0] /= k;
                    a[1] /= k;
                }
                return k;
            }

            function d3_transformCombine(a, b, k) {
                a[0] += k * b[0];
                a[1] += k * b[1];
                return a;
            }

            var d3_transformIdentity = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: 0,
                f: 0
            };
            d3.interpolateTransform = d3_interpolateTransform;

            function d3_interpolateTransformPop(s) {
                return s.length ? s.pop() + "," : "";
            }

            function d3_interpolateTranslate(ta, tb, s, q) {
                if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
                    var i = s.push("translate(", null, ",", null, ")");
                    q.push({
                        i: i - 4,
                        x: d3_interpolateNumber(ta[0], tb[0])
                    }, {
                        i: i - 2,
                        x: d3_interpolateNumber(ta[1], tb[1])
                    });
                } else if (tb[0] || tb[1]) {
                    s.push("translate(" + tb + ")");
                }
            }

            function d3_interpolateRotate(ra, rb, s, q) {
                if (ra !== rb) {
                    if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
                    q.push({
                        i: s.push(d3_interpolateTransformPop(s) + "rotate(", null, ")") - 2,
                        x: d3_interpolateNumber(ra, rb)
                    });
                } else if (rb) {
                    s.push(d3_interpolateTransformPop(s) + "rotate(" + rb + ")");
                }
            }

            function d3_interpolateSkew(wa, wb, s, q) {
                if (wa !== wb) {
                    q.push({
                        i: s.push(d3_interpolateTransformPop(s) + "skewX(", null, ")") - 2,
                        x: d3_interpolateNumber(wa, wb)
                    });
                } else if (wb) {
                    s.push(d3_interpolateTransformPop(s) + "skewX(" + wb + ")");
                }
            }

            function d3_interpolateScale(ka, kb, s, q) {
                if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
                    var i = s.push(d3_interpolateTransformPop(s) + "scale(", null, ",", null, ")");
                    q.push({
                        i: i - 4,
                        x: d3_interpolateNumber(ka[0], kb[0])
                    }, {
                        i: i - 2,
                        x: d3_interpolateNumber(ka[1], kb[1])
                    });
                } else if (kb[0] !== 1 || kb[1] !== 1) {
                    s.push(d3_interpolateTransformPop(s) + "scale(" + kb + ")");
                }
            }

            function d3_interpolateTransform(a, b) {
                var s = [], q = [];
                a = d3.transform(a), b = d3.transform(b);
                d3_interpolateTranslate(a.translate, b.translate, s, q);
                d3_interpolateRotate(a.rotate, b.rotate, s, q);
                d3_interpolateSkew(a.skew, b.skew, s, q);
                d3_interpolateScale(a.scale, b.scale, s, q);
                a = b = null;
                return function (t) {
                    var i = -1, n = q.length, o;
                    while (++i < n) s[(o = q[i]).i] = o.x(t);
                    return s.join("");
                };
            }

            function d3_uninterpolateNumber(a, b) {
                b = (b -= a = +a) || 1 / b;
                return function (x) {
                    return (x - a) / b;
                };
            }

            function d3_uninterpolateClamp(a, b) {
                b = (b -= a = +a) || 1 / b;
                return function (x) {
                    return Math.max(0, Math.min(1, (x - a) / b));
                };
            }

            d3.layout = {};
            d3.layout.bundle = function () {
                return function (links) {
                    var paths = [], i = -1, n = links.length;
                    while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
                    return paths;
                };
            };

            function d3_layout_bundlePath(link) {
                var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end),
                    points = [start];
                while (start !== lca) {
                    start = start.parent;
                    points.push(start);
                }
                var k = points.length;
                while (end !== lca) {
                    points.splice(k, 0, end);
                    end = end.parent;
                }
                return points;
            }

            function d3_layout_bundleAncestors(node) {
                var ancestors = [], parent = node.parent;
                while (parent != null) {
                    ancestors.push(node);
                    node = parent;
                    parent = parent.parent;
                }
                ancestors.push(node);
                return ancestors;
            }

            function d3_layout_bundleLeastCommonAncestor(a, b) {
                if (a === b) return a;
                var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(),
                    bNode = bNodes.pop(), sharedNode = null;
                while (aNode === bNode) {
                    sharedNode = aNode;
                    aNode = aNodes.pop();
                    bNode = bNodes.pop();
                }
                return sharedNode;
            }

            d3.layout.chord = function () {
                var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;

                function relayout() {
                    var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
                    chords = [];
                    groups = [];
                    k = 0, i = -1;
                    while (++i < n) {
                        x = 0, j = -1;
                        while (++j < n) {
                            x += matrix[i][j];
                        }
                        groupSums.push(x);
                        subgroupIndex.push(d3.range(n));
                        k += x;
                    }
                    if (sortGroups) {
                        groupIndex.sort(function (a, b) {
                            return sortGroups(groupSums[a], groupSums[b]);
                        });
                    }
                    if (sortSubgroups) {
                        subgroupIndex.forEach(function (d, i) {
                            d.sort(function (a, b) {
                                return sortSubgroups(matrix[i][a], matrix[i][b]);
                            });
                        });
                    }
                    k = (τ - padding * n) / k;
                    x = 0, i = -1;
                    while (++i < n) {
                        x0 = x, j = -1;
                        while (++j < n) {
                            var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x,
                                a1 = x += v * k;
                            subgroups[di + "-" + dj] = {
                                index: di,
                                subindex: dj,
                                startAngle: a0,
                                endAngle: a1,
                                value: v
                            };
                        }
                        groups[di] = {
                            index: di,
                            startAngle: x0,
                            endAngle: x,
                            value: groupSums[di]
                        };
                        x += padding;
                    }
                    i = -1;
                    while (++i < n) {
                        j = i - 1;
                        while (++j < n) {
                            var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
                            if (source.value || target.value) {
                                chords.push(source.value < target.value ? {
                                    source: target,
                                    target: source
                                } : {
                                    source: source,
                                    target: target
                                });
                            }
                        }
                    }
                    if (sortChords) resort();
                }

                function resort() {
                    chords.sort(function (a, b) {
                        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
                    });
                }

                chord.matrix = function (x) {
                    if (!arguments.length) return matrix;
                    n = (matrix = x) && matrix.length;
                    chords = groups = null;
                    return chord;
                };
                chord.padding = function (x) {
                    if (!arguments.length) return padding;
                    padding = x;
                    chords = groups = null;
                    return chord;
                };
                chord.sortGroups = function (x) {
                    if (!arguments.length) return sortGroups;
                    sortGroups = x;
                    chords = groups = null;
                    return chord;
                };
                chord.sortSubgroups = function (x) {
                    if (!arguments.length) return sortSubgroups;
                    sortSubgroups = x;
                    chords = null;
                    return chord;
                };
                chord.sortChords = function (x) {
                    if (!arguments.length) return sortChords;
                    sortChords = x;
                    if (chords) resort();
                    return chord;
                };
                chord.chords = function () {
                    if (!chords) relayout();
                    return chords;
                };
                chord.groups = function () {
                    if (!groups) relayout();
                    return groups;
                };
                return chord;
            };
            d3.layout.force = function () {
                var force = {}, event = d3.dispatch("start", "tick", "end"), timer, size = [1, 1], drag, alpha,
                    friction = .9, linkDistance = d3_layout_forceLinkDistance,
                    linkStrength = d3_layout_forceLinkStrength, charge = -30,
                    chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [],
                    links = [], distances, strengths, charges;

                function repulse(node) {
                    return function (quad, x1, _, x2) {
                        if (quad.point !== node) {
                            var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
                            if (dw * dw / theta2 < dn) {
                                if (dn < chargeDistance2) {
                                    var k = quad.charge / dn;
                                    node.px -= dx * k;
                                    node.py -= dy * k;
                                }
                                return true;
                            }
                            if (quad.point && dn && dn < chargeDistance2) {
                                var k = quad.pointCharge / dn;
                                node.px -= dx * k;
                                node.py -= dy * k;
                            }
                        }
                        return !quad.charge;
                    };
                }

                force.tick = function () {
                    if ((alpha *= .99) < .005) {
                        timer = null;
                        event.end({
                            type: "end",
                            alpha: alpha = 0
                        });
                        return true;
                    }
                    var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
                    for (i = 0; i < m; ++i) {
                        o = links[i];
                        s = o.source;
                        t = o.target;
                        x = t.x - s.x;
                        y = t.y - s.y;
                        if (l = x * x + y * y) {
                            l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
                            x *= l;
                            y *= l;
                            t.x -= x * (k = s.weight + t.weight ? s.weight / (s.weight + t.weight) : .5);
                            t.y -= y * k;
                            s.x += x * (k = 1 - k);
                            s.y += y * k;
                        }
                    }
                    if (k = alpha * gravity) {
                        x = size[0] / 2;
                        y = size[1] / 2;
                        i = -1;
                        if (k) while (++i < n) {
                            o = nodes[i];
                            o.x += (x - o.x) * k;
                            o.y += (y - o.y) * k;
                        }
                    }
                    if (charge) {
                        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
                        i = -1;
                        while (++i < n) {
                            if (!(o = nodes[i]).fixed) {
                                q.visit(repulse(o));
                            }
                        }
                    }
                    i = -1;
                    while (++i < n) {
                        o = nodes[i];
                        if (o.fixed) {
                            o.x = o.px;
                            o.y = o.py;
                        } else {
                            o.x -= (o.px - (o.px = o.x)) * friction;
                            o.y -= (o.py - (o.py = o.y)) * friction;
                        }
                    }
                    event.tick({
                        type: "tick",
                        alpha: alpha
                    });
                };
                force.nodes = function (x) {
                    if (!arguments.length) return nodes;
                    nodes = x;
                    return force;
                };
                force.links = function (x) {
                    if (!arguments.length) return links;
                    links = x;
                    return force;
                };
                force.size = function (x) {
                    if (!arguments.length) return size;
                    size = x;
                    return force;
                };
                force.linkDistance = function (x) {
                    if (!arguments.length) return linkDistance;
                    linkDistance = typeof x === "function" ? x : +x;
                    return force;
                };
                force.distance = force.linkDistance;
                force.linkStrength = function (x) {
                    if (!arguments.length) return linkStrength;
                    linkStrength = typeof x === "function" ? x : +x;
                    return force;
                };
                force.friction = function (x) {
                    if (!arguments.length) return friction;
                    friction = +x;
                    return force;
                };
                force.charge = function (x) {
                    if (!arguments.length) return charge;
                    charge = typeof x === "function" ? x : +x;
                    return force;
                };
                force.chargeDistance = function (x) {
                    if (!arguments.length) return Math.sqrt(chargeDistance2);
                    chargeDistance2 = x * x;
                    return force;
                };
                force.gravity = function (x) {
                    if (!arguments.length) return gravity;
                    gravity = +x;
                    return force;
                };
                force.theta = function (x) {
                    if (!arguments.length) return Math.sqrt(theta2);
                    theta2 = x * x;
                    return force;
                };
                force.alpha = function (x) {
                    if (!arguments.length) return alpha;
                    x = +x;
                    if (alpha) {
                        if (x > 0) {
                            alpha = x;
                        } else {
                            timer.c = null, timer.t = NaN, timer = null;
                            event.end({
                                type: "end",
                                alpha: alpha = 0
                            });
                        }
                    } else if (x > 0) {
                        event.start({
                            type: "start",
                            alpha: alpha = x
                        });
                        timer = d3_timer(force.tick);
                    }
                    return force;
                };
                force.start = function () {
                    var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
                    for (i = 0; i < n; ++i) {
                        (o = nodes[i]).index = i;
                        o.weight = 0;
                    }
                    for (i = 0; i < m; ++i) {
                        o = links[i];
                        if (typeof o.source == "number") o.source = nodes[o.source];
                        if (typeof o.target == "number") o.target = nodes[o.target];
                        ++o.source.weight;
                        ++o.target.weight;
                    }
                    for (i = 0; i < n; ++i) {
                        o = nodes[i];
                        if (isNaN(o.x)) o.x = position("x", w);
                        if (isNaN(o.y)) o.y = position("y", h);
                        if (isNaN(o.px)) o.px = o.x;
                        if (isNaN(o.py)) o.py = o.y;
                    }
                    distances = [];
                    if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
                    strengths = [];
                    if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
                    charges = [];
                    if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;

                    function position(dimension, size) {
                        if (!neighbors) {
                            neighbors = new Array(n);
                            for (j = 0; j < n; ++j) {
                                neighbors[j] = [];
                            }
                            for (j = 0; j < m; ++j) {
                                var o = links[j];
                                neighbors[o.source.index].push(o.target);
                                neighbors[o.target.index].push(o.source);
                            }
                        }
                        var candidates = neighbors[i], j = -1, l = candidates.length, x;
                        while (++j < l) if (!isNaN(x = candidates[j][dimension])) return x;
                        return Math.random() * size;
                    }

                    return force.resume();
                };
                force.resume = function () {
                    return force.alpha(.1);
                };
                force.stop = function () {
                    return force.alpha(0);
                };
                force.drag = function () {
                    if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
                    if (!arguments.length) return drag;
                    this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
                };

                function dragmove(d) {
                    d.px = d3.event.x, d.py = d3.event.y;
                    force.resume();
                }

                return d3.rebind(force, event, "on");
            };

            function d3_layout_forceDragstart(d) {
                d.fixed |= 2;
            }

            function d3_layout_forceDragend(d) {
                d.fixed &= ~6;
            }

            function d3_layout_forceMouseover(d) {
                d.fixed |= 4;
                d.px = d.x, d.py = d.y;
            }

            function d3_layout_forceMouseout(d) {
                d.fixed &= ~4;
            }

            function d3_layout_forceAccumulate(quad, alpha, charges) {
                var cx = 0, cy = 0;
                quad.charge = 0;
                if (!quad.leaf) {
                    var nodes = quad.nodes, n = nodes.length, i = -1, c;
                    while (++i < n) {
                        c = nodes[i];
                        if (c == null) continue;
                        d3_layout_forceAccumulate(c, alpha, charges);
                        quad.charge += c.charge;
                        cx += c.charge * c.cx;
                        cy += c.charge * c.cy;
                    }
                }
                if (quad.point) {
                    if (!quad.leaf) {
                        quad.point.x += Math.random() - .5;
                        quad.point.y += Math.random() - .5;
                    }
                    var k = alpha * charges[quad.point.index];
                    quad.charge += quad.pointCharge = k;
                    cx += k * quad.point.x;
                    cy += k * quad.point.y;
                }
                quad.cx = cx / quad.charge;
                quad.cy = cy / quad.charge;
            }

            var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1,
                d3_layout_forceChargeDistance2 = Infinity;
            d3.layout.hierarchy = function () {
                var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren,
                    value = d3_layout_hierarchyValue;

                function hierarchy(root) {
                    var stack = [root], nodes = [], node;
                    root.depth = 0;
                    while ((node = stack.pop()) != null) {
                        nodes.push(node);
                        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
                            var n, childs, child;
                            while (--n >= 0) {
                                stack.push(child = childs[n]);
                                child.parent = node;
                                child.depth = node.depth + 1;
                            }
                            if (value) node.value = 0;
                            node.children = childs;
                        } else {
                            if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
                            delete node.children;
                        }
                    }
                    d3_layout_hierarchyVisitAfter(root, function (node) {
                        var childs, parent;
                        if (sort && (childs = node.children)) childs.sort(sort);
                        if (value && (parent = node.parent)) parent.value += node.value;
                    });
                    return nodes;
                }

                hierarchy.sort = function (x) {
                    if (!arguments.length) return sort;
                    sort = x;
                    return hierarchy;
                };
                hierarchy.children = function (x) {
                    if (!arguments.length) return children;
                    children = x;
                    return hierarchy;
                };
                hierarchy.value = function (x) {
                    if (!arguments.length) return value;
                    value = x;
                    return hierarchy;
                };
                hierarchy.revalue = function (root) {
                    if (value) {
                        d3_layout_hierarchyVisitBefore(root, function (node) {
                            if (node.children) node.value = 0;
                        });
                        d3_layout_hierarchyVisitAfter(root, function (node) {
                            var parent;
                            if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
                            if (parent = node.parent) parent.value += node.value;
                        });
                    }
                    return root;
                };
                return hierarchy;
            };

            function d3_layout_hierarchyRebind(object, hierarchy) {
                d3.rebind(object, hierarchy, "sort", "children", "value");
                object.nodes = object;
                object.links = d3_layout_hierarchyLinks;
                return object;
            }

            function d3_layout_hierarchyVisitBefore(node, callback) {
                var nodes = [node];
                while ((node = nodes.pop()) != null) {
                    callback(node);
                    if ((children = node.children) && (n = children.length)) {
                        var n, children;
                        while (--n >= 0) nodes.push(children[n]);
                    }
                }
            }

            function d3_layout_hierarchyVisitAfter(node, callback) {
                var nodes = [node], nodes2 = [];
                while ((node = nodes.pop()) != null) {
                    nodes2.push(node);
                    if ((children = node.children) && (n = children.length)) {
                        var i = -1, n, children;
                        while (++i < n) nodes.push(children[i]);
                    }
                }
                while ((node = nodes2.pop()) != null) {
                    callback(node);
                }
            }

            function d3_layout_hierarchyChildren(d) {
                return d.children;
            }

            function d3_layout_hierarchyValue(d) {
                return d.value;
            }

            function d3_layout_hierarchySort(a, b) {
                return b.value - a.value;
            }

            function d3_layout_hierarchyLinks(nodes) {
                return d3.merge(nodes.map(function (parent) {
                    return (parent.children || []).map(function (child) {
                        return {
                            source: parent,
                            target: child
                        };
                    });
                }));
            }

            d3.layout.partition = function () {
                var hierarchy = d3.layout.hierarchy(), size = [1, 1];

                function position(node, x, dx, dy) {
                    var children = node.children;
                    node.x = x;
                    node.y = node.depth * dy;
                    node.dx = dx;
                    node.dy = dy;
                    if (children && (n = children.length)) {
                        var i = -1, n, c, d;
                        dx = node.value ? dx / node.value : 0;
                        while (++i < n) {
                            position(c = children[i], x, d = c.value * dx, dy);
                            x += d;
                        }
                    }
                }

                function depth(node) {
                    var children = node.children, d = 0;
                    if (children && (n = children.length)) {
                        var i = -1, n;
                        while (++i < n) d = Math.max(d, depth(children[i]));
                    }
                    return 1 + d;
                }

                function partition(d, i) {
                    var nodes = hierarchy.call(this, d, i);
                    position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
                    return nodes;
                }

                partition.size = function (x) {
                    if (!arguments.length) return size;
                    size = x;
                    return partition;
                };
                return d3_layout_hierarchyRebind(partition, hierarchy);
            };
            d3.layout.pie = function () {
                var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ, padAngle = 0;

                function pie(data) {
                    var n = data.length, values = data.map(function (d, i) {
                            return +value.call(pie, d, i);
                        }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle),
                        da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a,
                        p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)),
                        pa = p * (da < 0 ? -1 : 1), sum = d3.sum(values), k = sum ? (da - n * pa) / sum : 0,
                        index = d3.range(n), arcs = [], v;
                    if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function (i, j) {
                        return values[j] - values[i];
                    } : function (i, j) {
                        return sort(data[i], data[j]);
                    });
                    index.forEach(function (i) {
                        arcs[i] = {
                            data: data[i],
                            value: v = values[i],
                            startAngle: a,
                            endAngle: a += v * k + pa,
                            padAngle: p
                        };
                    });
                    return arcs;
                }

                pie.value = function (_) {
                    if (!arguments.length) return value;
                    value = _;
                    return pie;
                };
                pie.sort = function (_) {
                    if (!arguments.length) return sort;
                    sort = _;
                    return pie;
                };
                pie.startAngle = function (_) {
                    if (!arguments.length) return startAngle;
                    startAngle = _;
                    return pie;
                };
                pie.endAngle = function (_) {
                    if (!arguments.length) return endAngle;
                    endAngle = _;
                    return pie;
                };
                pie.padAngle = function (_) {
                    if (!arguments.length) return padAngle;
                    padAngle = _;
                    return pie;
                };
                return pie;
            };
            var d3_layout_pieSortByValue = {};
            d3.layout.stack = function () {
                var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero,
                    out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;

                function stack(data, index) {
                    if (!(n = data.length)) return data;
                    var series = data.map(function (d, i) {
                        return values.call(stack, d, i);
                    });
                    var points = series.map(function (d) {
                        return d.map(function (v, i) {
                            return [x.call(stack, v, i), y.call(stack, v, i)];
                        });
                    });
                    var orders = order.call(stack, points, index);
                    series = d3.permute(series, orders);
                    points = d3.permute(points, orders);
                    var offsets = offset.call(stack, points, index);
                    var m = series[0].length, n, i, j, o;
                    for (j = 0; j < m; ++j) {
                        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
                        for (i = 1; i < n; ++i) {
                            out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
                        }
                    }
                    return data;
                }

                stack.values = function (x) {
                    if (!arguments.length) return values;
                    values = x;
                    return stack;
                };
                stack.order = function (x) {
                    if (!arguments.length) return order;
                    order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
                    return stack;
                };
                stack.offset = function (x) {
                    if (!arguments.length) return offset;
                    offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
                    return stack;
                };
                stack.x = function (z) {
                    if (!arguments.length) return x;
                    x = z;
                    return stack;
                };
                stack.y = function (z) {
                    if (!arguments.length) return y;
                    y = z;
                    return stack;
                };
                stack.out = function (z) {
                    if (!arguments.length) return out;
                    out = z;
                    return stack;
                };
                return stack;
            };

            function d3_layout_stackX(d) {
                return d.x;
            }

            function d3_layout_stackY(d) {
                return d.y;
            }

            function d3_layout_stackOut(d, y0, y) {
                d.y0 = y0;
                d.y = y;
            }

            var d3_layout_stackOrders = d3.map({
                "inside-out": function (data) {
                    var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex),
                        sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function (a, b) {
                            return max[a] - max[b];
                        }), top = 0, bottom = 0, tops = [], bottoms = [];
                    for (i = 0; i < n; ++i) {
                        j = index[i];
                        if (top < bottom) {
                            top += sums[j];
                            tops.push(j);
                        } else {
                            bottom += sums[j];
                            bottoms.push(j);
                        }
                    }
                    return bottoms.reverse().concat(tops);
                },
                reverse: function (data) {
                    return d3.range(data.length).reverse();
                },
                "default": d3_layout_stackOrderDefault
            });
            var d3_layout_stackOffsets = d3.map({
                silhouette: function (data) {
                    var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
                    for (j = 0; j < m; ++j) {
                        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
                        if (o > max) max = o;
                        sums.push(o);
                    }
                    for (j = 0; j < m; ++j) {
                        y0[j] = (max - sums[j]) / 2;
                    }
                    return y0;
                },
                wiggle: function (data) {
                    var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
                    y0[0] = o = o0 = 0;
                    for (j = 1; j < m; ++j) {
                        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
                        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
                            for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
                                s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
                            }
                            s2 += s3 * data[i][j][1];
                        }
                        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
                        if (o < o0) o0 = o;
                    }
                    for (j = 0; j < m; ++j) y0[j] -= o0;
                    return y0;
                },
                expand: function (data) {
                    var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
                    for (j = 0; j < m; ++j) {
                        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
                        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
                    }
                    for (j = 0; j < m; ++j) y0[j] = 0;
                    return y0;
                },
                zero: d3_layout_stackOffsetZero
            });

            function d3_layout_stackOrderDefault(data) {
                return d3.range(data.length);
            }

            function d3_layout_stackOffsetZero(data) {
                var j = -1, m = data[0].length, y0 = [];
                while (++j < m) y0[j] = 0;
                return y0;
            }

            function d3_layout_stackMaxIndex(array) {
                var i = 1, j = 0, v = array[0][1], k, n = array.length;
                for (; i < n; ++i) {
                    if ((k = array[i][1]) > v) {
                        j = i;
                        v = k;
                    }
                }
                return j;
            }

            function d3_layout_stackReduceSum(d) {
                return d.reduce(d3_layout_stackSum, 0);
            }

            function d3_layout_stackSum(p, d) {
                return p + d[1];
            }

            d3.layout.histogram = function () {
                var frequency = true, valuer = Number, ranger = d3_layout_histogramRange,
                    binner = d3_layout_histogramBinSturges;

                function histogram(data, i) {
                    var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i),
                        thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length,
                        m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
                    while (++i < m) {
                        bin = bins[i] = [];
                        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
                        bin.y = 0;
                    }
                    if (m > 0) {
                        i = -1;
                        while (++i < n) {
                            x = values[i];
                            if (x >= range[0] && x <= range[1]) {
                                bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
                                bin.y += k;
                                bin.push(data[i]);
                            }
                        }
                    }
                    return bins;
                }

                histogram.value = function (x) {
                    if (!arguments.length) return valuer;
                    valuer = x;
                    return histogram;
                };
                histogram.range = function (x) {
                    if (!arguments.length) return ranger;
                    ranger = d3_functor(x);
                    return histogram;
                };
                histogram.bins = function (x) {
                    if (!arguments.length) return binner;
                    binner = typeof x === "number" ? function (range) {
                        return d3_layout_histogramBinFixed(range, x);
                    } : d3_functor(x);
                    return histogram;
                };
                histogram.frequency = function (x) {
                    if (!arguments.length) return frequency;
                    frequency = !!x;
                    return histogram;
                };
                return histogram;
            };

            function d3_layout_histogramBinSturges(range, values) {
                return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
            }

            function d3_layout_histogramBinFixed(range, n) {
                var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
                while (++x <= n) f[x] = m * x + b;
                return f;
            }

            function d3_layout_histogramRange(values) {
                return [d3.min(values), d3.max(values)];
            }

            d3.layout.pack = function () {
                var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [1, 1], radius;

                function pack(d, i) {
                    var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1],
                        r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function () {
                            return radius;
                        };
                    root.x = root.y = 0;
                    d3_layout_hierarchyVisitAfter(root, function (d) {
                        d.r = +r(d.value);
                    });
                    d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
                    if (padding) {
                        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
                        d3_layout_hierarchyVisitAfter(root, function (d) {
                            d.r += dr;
                        });
                        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
                        d3_layout_hierarchyVisitAfter(root, function (d) {
                            d.r -= dr;
                        });
                    }
                    d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
                    return nodes;
                }

                pack.size = function (_) {
                    if (!arguments.length) return size;
                    size = _;
                    return pack;
                };
                pack.radius = function (_) {
                    if (!arguments.length) return radius;
                    radius = _ == null || typeof _ === "function" ? _ : +_;
                    return pack;
                };
                pack.padding = function (_) {
                    if (!arguments.length) return padding;
                    padding = +_;
                    return pack;
                };
                return d3_layout_hierarchyRebind(pack, hierarchy);
            };

            function d3_layout_packSort(a, b) {
                return a.value - b.value;
            }

            function d3_layout_packInsert(a, b) {
                var c = a._pack_next;
                a._pack_next = b;
                b._pack_prev = a;
                b._pack_next = c;
                c._pack_prev = b;
            }

            function d3_layout_packSplice(a, b) {
                a._pack_next = b;
                b._pack_prev = a;
            }

            function d3_layout_packIntersects(a, b) {
                var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
                return .999 * dr * dr > dx * dx + dy * dy;
            }

            function d3_layout_packSiblings(node) {
                if (!(nodes = node.children) || !(n = nodes.length)) return;
                var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;

                function bound(node) {
                    xMin = Math.min(node.x - node.r, xMin);
                    xMax = Math.max(node.x + node.r, xMax);
                    yMin = Math.min(node.y - node.r, yMin);
                    yMax = Math.max(node.y + node.r, yMax);
                }

                nodes.forEach(d3_layout_packLink);
                a = nodes[0];
                a.x = -a.r;
                a.y = 0;
                bound(a);
                if (n > 1) {
                    b = nodes[1];
                    b.x = b.r;
                    b.y = 0;
                    bound(b);
                    if (n > 2) {
                        c = nodes[2];
                        d3_layout_packPlace(a, b, c);
                        bound(c);
                        d3_layout_packInsert(a, c);
                        a._pack_prev = c;
                        d3_layout_packInsert(c, b);
                        b = a._pack_next;
                        for (i = 3; i < n; i++) {
                            d3_layout_packPlace(a, b, c = nodes[i]);
                            var isect = 0, s1 = 1, s2 = 1;
                            for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
                                if (d3_layout_packIntersects(j, c)) {
                                    isect = 1;
                                    break;
                                }
                            }
                            if (isect == 1) {
                                for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
                                    if (d3_layout_packIntersects(k, c)) {
                                        break;
                                    }
                                }
                            }
                            if (isect) {
                                if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
                                i--;
                            } else {
                                d3_layout_packInsert(a, c);
                                b = c;
                                bound(c);
                            }
                        }
                    }
                }
                var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
                for (i = 0; i < n; i++) {
                    c = nodes[i];
                    c.x -= cx;
                    c.y -= cy;
                    cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
                }
                node.r = cr;
                nodes.forEach(d3_layout_packUnlink);
            }

            function d3_layout_packLink(node) {
                node._pack_next = node._pack_prev = node;
            }

            function d3_layout_packUnlink(node) {
                delete node._pack_next;
                delete node._pack_prev;
            }

            function d3_layout_packTransform(node, x, y, k) {
                var children = node.children;
                node.x = x += k * node.x;
                node.y = y += k * node.y;
                node.r *= k;
                if (children) {
                    var i = -1, n = children.length;
                    while (++i < n) d3_layout_packTransform(children[i], x, y, k);
                }
            }

            function d3_layout_packPlace(a, b, c) {
                var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
                if (db && (dx || dy)) {
                    var da = b.r + c.r, dc = dx * dx + dy * dy;
                    da *= da;
                    db *= db;
                    var x = .5 + (db - da) / (2 * dc),
                        y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
                    c.x = a.x + x * dx + y * dy;
                    c.y = a.y + x * dy - y * dx;
                } else {
                    c.x = a.x + db;
                    c.y = a.y;
                }
            }

            d3.layout.tree = function () {
                var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation,
                    size = [1, 1], nodeSize = null;

                function tree(d, i) {
                    var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
                    d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
                    d3_layout_hierarchyVisitBefore(root1, secondWalk);
                    if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
                        var left = root0, right = root0, bottom = root0;
                        d3_layout_hierarchyVisitBefore(root0, function (node) {
                            if (node.x < left.x) left = node;
                            if (node.x > right.x) right = node;
                            if (node.depth > bottom.depth) bottom = node;
                        });
                        var tx = separation(left, right) / 2 - left.x,
                            kx = size[0] / (right.x + separation(right, left) / 2 + tx),
                            ky = size[1] / (bottom.depth || 1);
                        d3_layout_hierarchyVisitBefore(root0, function (node) {
                            node.x = (node.x + tx) * kx;
                            node.y = node.depth * ky;
                        });
                    }
                    return nodes;
                }

                function wrapTree(root0) {
                    var root1 = {
                        A: null,
                        children: [root0]
                    }, queue = [root1], node1;
                    while ((node1 = queue.pop()) != null) {
                        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
                            queue.push((children[i] = child = {
                                _: children[i],
                                parent: node1,
                                children: (child = children[i].children) && child.slice() || [],
                                A: null,
                                a: null,
                                z: 0,
                                m: 0,
                                c: 0,
                                s: 0,
                                t: null,
                                i: i
                            }).a = child);
                        }
                    }
                    return root1.children[0];
                }

                function firstWalk(v) {
                    var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
                    if (children.length) {
                        d3_layout_treeShift(v);
                        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
                        if (w) {
                            v.z = w.z + separation(v._, w._);
                            v.m = v.z - midpoint;
                        } else {
                            v.z = midpoint;
                        }
                    } else if (w) {
                        v.z = w.z + separation(v._, w._);
                    }
                    v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
                }

                function secondWalk(v) {
                    v._.x = v.z + v.parent.m;
                    v.m += v.parent.m;
                }

                function apportion(v, w, ancestor) {
                    if (w) {
                        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m,
                            sim = vim.m, som = vom.m, shift;
                        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
                            vom = d3_layout_treeLeft(vom);
                            vop = d3_layout_treeRight(vop);
                            vop.a = v;
                            shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
                            if (shift > 0) {
                                d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
                                sip += shift;
                                sop += shift;
                            }
                            sim += vim.m;
                            sip += vip.m;
                            som += vom.m;
                            sop += vop.m;
                        }
                        if (vim && !d3_layout_treeRight(vop)) {
                            vop.t = vim;
                            vop.m += sim - sop;
                        }
                        if (vip && !d3_layout_treeLeft(vom)) {
                            vom.t = vip;
                            vom.m += sip - som;
                            ancestor = v;
                        }
                    }
                    return ancestor;
                }

                function sizeNode(node) {
                    node.x *= size[0];
                    node.y = node.depth * size[1];
                }

                tree.separation = function (x) {
                    if (!arguments.length) return separation;
                    separation = x;
                    return tree;
                };
                tree.size = function (x) {
                    if (!arguments.length) return nodeSize ? null : size;
                    nodeSize = (size = x) == null ? sizeNode : null;
                    return tree;
                };
                tree.nodeSize = function (x) {
                    if (!arguments.length) return nodeSize ? size : null;
                    nodeSize = (size = x) == null ? null : sizeNode;
                    return tree;
                };
                return d3_layout_hierarchyRebind(tree, hierarchy);
            };

            function d3_layout_treeSeparation(a, b) {
                return a.parent == b.parent ? 1 : 2;
            }

            function d3_layout_treeLeft(v) {
                var children = v.children;
                return children.length ? children[0] : v.t;
            }

            function d3_layout_treeRight(v) {
                var children = v.children, n;
                return (n = children.length) ? children[n - 1] : v.t;
            }

            function d3_layout_treeMove(wm, wp, shift) {
                var change = shift / (wp.i - wm.i);
                wp.c -= change;
                wp.s += shift;
                wm.c += change;
                wp.z += shift;
                wp.m += shift;
            }

            function d3_layout_treeShift(v) {
                var shift = 0, change = 0, children = v.children, i = children.length, w;
                while (--i >= 0) {
                    w = children[i];
                    w.z += shift;
                    w.m += shift;
                    shift += w.s + (change += w.c);
                }
            }

            function d3_layout_treeAncestor(vim, v, ancestor) {
                return vim.a.parent === v.parent ? vim.a : ancestor;
            }

            d3.layout.cluster = function () {
                var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation,
                    size = [1, 1], nodeSize = false;

                function cluster(d, i) {
                    var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
                    d3_layout_hierarchyVisitAfter(root, function (node) {
                        var children = node.children;
                        if (children && children.length) {
                            node.x = d3_layout_clusterX(children);
                            node.y = d3_layout_clusterY(children);
                        } else {
                            node.x = previousNode ? x += separation(node, previousNode) : 0;
                            node.y = 0;
                            previousNode = node;
                        }
                    });
                    var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root),
                        x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
                    d3_layout_hierarchyVisitAfter(root, nodeSize ? function (node) {
                        node.x = (node.x - root.x) * size[0];
                        node.y = (root.y - node.y) * size[1];
                    } : function (node) {
                        node.x = (node.x - x0) / (x1 - x0) * size[0];
                        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
                    });
                    return nodes;
                }

                cluster.separation = function (x) {
                    if (!arguments.length) return separation;
                    separation = x;
                    return cluster;
                };
                cluster.size = function (x) {
                    if (!arguments.length) return nodeSize ? null : size;
                    nodeSize = (size = x) == null;
                    return cluster;
                };
                cluster.nodeSize = function (x) {
                    if (!arguments.length) return nodeSize ? size : null;
                    nodeSize = (size = x) != null;
                    return cluster;
                };
                return d3_layout_hierarchyRebind(cluster, hierarchy);
            };

            function d3_layout_clusterY(children) {
                return 1 + d3.max(children, function (child) {
                    return child.y;
                });
            }

            function d3_layout_clusterX(children) {
                return children.reduce(function (x, child) {
                    return x + child.x;
                }, 0) / children.length;
            }

            function d3_layout_clusterLeft(node) {
                var children = node.children;
                return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
            }

            function d3_layout_clusterRight(node) {
                var children = node.children, n;
                return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
            }

            d3.layout.treemap = function () {
                var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [1, 1], padding = null,
                    pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify",
                    ratio = .5 * (1 + Math.sqrt(5));

                function scale(children, k) {
                    var i = -1, n = children.length, child, area;
                    while (++i < n) {
                        area = (child = children[i]).value * (k < 0 ? 0 : k);
                        child.area = isNaN(area) || area <= 0 ? 0 : area;
                    }
                }

                function squarify(node) {
                    var children = node.children;
                    if (children && children.length) {
                        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score,
                            u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy),
                            n;
                        scale(remaining, rect.dx * rect.dy / node.value);
                        row.area = 0;
                        while ((n = remaining.length) > 0) {
                            row.push(child = remaining[n - 1]);
                            row.area += child.area;
                            if (mode !== "squarify" || (score = worst(row, u)) <= best) {
                                remaining.pop();
                                best = score;
                            } else {
                                row.area -= row.pop().area;
                                position(row, u, rect, false);
                                u = Math.min(rect.dx, rect.dy);
                                row.length = row.area = 0;
                                best = Infinity;
                            }
                        }
                        if (row.length) {
                            position(row, u, rect, true);
                            row.length = row.area = 0;
                        }
                        children.forEach(squarify);
                    }
                }

                function stickify(node) {
                    var children = node.children;
                    if (children && children.length) {
                        var rect = pad(node), remaining = children.slice(), child, row = [];
                        scale(remaining, rect.dx * rect.dy / node.value);
                        row.area = 0;
                        while (child = remaining.pop()) {
                            row.push(child);
                            row.area += child.area;
                            if (child.z != null) {
                                position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
                                row.length = row.area = 0;
                            }
                        }
                        children.forEach(stickify);
                    }
                }

                function worst(row, u) {
                    var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
                    while (++i < n) {
                        if (!(r = row[i].area)) continue;
                        if (r < rmin) rmin = r;
                        if (r > rmax) rmax = r;
                    }
                    s *= s;
                    u *= u;
                    return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
                }

                function position(row, u, rect, flush) {
                    var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
                    if (u == rect.dx) {
                        if (flush || v > rect.dy) v = rect.dy;
                        while (++i < n) {
                            o = row[i];
                            o.x = x;
                            o.y = y;
                            o.dy = v;
                            x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
                        }
                        o.z = true;
                        o.dx += rect.x + rect.dx - x;
                        rect.y += v;
                        rect.dy -= v;
                    } else {
                        if (flush || v > rect.dx) v = rect.dx;
                        while (++i < n) {
                            o = row[i];
                            o.x = x;
                            o.y = y;
                            o.dx = v;
                            y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
                        }
                        o.z = false;
                        o.dy += rect.y + rect.dy - y;
                        rect.x += v;
                        rect.dx -= v;
                    }
                }

                function treemap(d) {
                    var nodes = stickies || hierarchy(d), root = nodes[0];
                    root.x = root.y = 0;
                    if (root.value) root.dx = size[0], root.dy = size[1]; else root.dx = root.dy = 0;
                    if (stickies) hierarchy.revalue(root);
                    scale([root], root.dx * root.dy / root.value);
                    (stickies ? stickify : squarify)(root);
                    if (sticky) stickies = nodes;
                    return nodes;
                }

                treemap.size = function (x) {
                    if (!arguments.length) return size;
                    size = x;
                    return treemap;
                };
                treemap.padding = function (x) {
                    if (!arguments.length) return padding;

                    function padFunction(node) {
                        var p = x.call(treemap, node, node.depth);
                        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [p, p, p, p] : p);
                    }

                    function padConstant(node) {
                        return d3_layout_treemapPad(node, x);
                    }

                    var type;
                    pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [x, x, x, x],
                        padConstant) : padConstant;
                    return treemap;
                };
                treemap.round = function (x) {
                    if (!arguments.length) return round != Number;
                    round = x ? Math.round : Number;
                    return treemap;
                };
                treemap.sticky = function (x) {
                    if (!arguments.length) return sticky;
                    sticky = x;
                    stickies = null;
                    return treemap;
                };
                treemap.ratio = function (x) {
                    if (!arguments.length) return ratio;
                    ratio = x;
                    return treemap;
                };
                treemap.mode = function (x) {
                    if (!arguments.length) return mode;
                    mode = x + "";
                    return treemap;
                };
                return d3_layout_hierarchyRebind(treemap, hierarchy);
            };

            function d3_layout_treemapPadNull(node) {
                return {
                    x: node.x,
                    y: node.y,
                    dx: node.dx,
                    dy: node.dy
                };
            }

            function d3_layout_treemapPad(node, padding) {
                var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3],
                    dy = node.dy - padding[0] - padding[2];
                if (dx < 0) {
                    x += dx / 2;
                    dx = 0;
                }
                if (dy < 0) {
                    y += dy / 2;
                    dy = 0;
                }
                return {
                    x: x,
                    y: y,
                    dx: dx,
                    dy: dy
                };
            }

            d3.random = {
                normal: function (µ, σ) {
                    var n = arguments.length;
                    if (n < 2) σ = 1;
                    if (n < 1) µ = 0;
                    return function () {
                        var x, y, r;
                        do {
                            x = Math.random() * 2 - 1;
                            y = Math.random() * 2 - 1;
                            r = x * x + y * y;
                        } while (!r || r > 1);
                        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
                    };
                },
                logNormal: function () {
                    var random = d3.random.normal.apply(d3, arguments);
                    return function () {
                        return Math.exp(random());
                    };
                },
                bates: function (m) {
                    var random = d3.random.irwinHall(m);
                    return function () {
                        return random() / m;
                    };
                },
                irwinHall: function (m) {
                    return function () {
                        for (var s = 0, j = 0; j < m; j++) s += Math.random();
                        return s;
                    };
                }
            };
            d3.scale = {};

            function d3_scaleExtent(domain) {
                var start = domain[0], stop = domain[domain.length - 1];
                return start < stop ? [start, stop] : [stop, start];
            }

            function d3_scaleRange(scale) {
                return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
            }

            function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
                var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
                return function (x) {
                    return i(u(x));
                };
            }

            function d3_scale_nice(domain, nice) {
                var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
                if (x1 < x0) {
                    dx = i0, i0 = i1, i1 = dx;
                    dx = x0, x0 = x1, x1 = dx;
                }
                domain[i0] = nice.floor(x0);
                domain[i1] = nice.ceil(x1);
                return domain;
            }

            function d3_scale_niceStep(step) {
                return step ? {
                    floor: function (x) {
                        return Math.floor(x / step) * step;
                    },
                    ceil: function (x) {
                        return Math.ceil(x / step) * step;
                    }
                } : d3_scale_niceIdentity;
            }

            var d3_scale_niceIdentity = {
                floor: d3_identity,
                ceil: d3_identity
            };

            function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
                var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
                if (domain[k] < domain[0]) {
                    domain = domain.slice().reverse();
                    range = range.slice().reverse();
                }
                while (++j <= k) {
                    u.push(uninterpolate(domain[j - 1], domain[j]));
                    i.push(interpolate(range[j - 1], range[j]));
                }
                return function (x) {
                    var j = d3.bisect(domain, x, 1, k) - 1;
                    return i[j](u[j](x));
                };
            }

            d3.scale.linear = function () {
                return d3_scale_linear([0, 1], [0, 1], d3_interpolate, false);
            };

            function d3_scale_linear(domain, range, interpolate, clamp) {
                var output, input;

                function rescale() {
                    var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear,
                        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
                    output = linear(domain, range, uninterpolate, interpolate);
                    input = linear(range, domain, uninterpolate, d3_interpolate);
                    return scale;
                }

                function scale(x) {
                    return output(x);
                }

                scale.invert = function (y) {
                    return input(y);
                };
                scale.domain = function (x) {
                    if (!arguments.length) return domain;
                    domain = x.map(Number);
                    return rescale();
                };
                scale.range = function (x) {
                    if (!arguments.length) return range;
                    range = x;
                    return rescale();
                };
                scale.rangeRound = function (x) {
                    return scale.range(x).interpolate(d3_interpolateRound);
                };
                scale.clamp = function (x) {
                    if (!arguments.length) return clamp;
                    clamp = x;
                    return rescale();
                };
                scale.interpolate = function (x) {
                    if (!arguments.length) return interpolate;
                    interpolate = x;
                    return rescale();
                };
                scale.ticks = function (m) {
                    return d3_scale_linearTicks(domain, m);
                };
                scale.tickFormat = function (m, format) {
                    return d3_scale_linearTickFormat(domain, m, format);
                };
                scale.nice = function (m) {
                    d3_scale_linearNice(domain, m);
                    return rescale();
                };
                scale.copy = function () {
                    return d3_scale_linear(domain, range, interpolate, clamp);
                };
                return rescale();
            }

            function d3_scale_linearRebind(scale, linear) {
                return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
            }

            function d3_scale_linearNice(domain, m) {
                d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
                d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
                return domain;
            }

            function d3_scale_linearTickRange(domain, m) {
                if (m == null) m = 10;
                var extent = d3_scaleExtent(domain), span = extent[1] - extent[0],
                    step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
                if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
                extent[0] = Math.ceil(extent[0] / step) * step;
                extent[1] = Math.floor(extent[1] / step) * step + step * .5;
                extent[2] = step;
                return extent;
            }

            function d3_scale_linearTicks(domain, m) {
                return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
            }

            function d3_scale_linearTickFormat(domain, m, format) {
                var range = d3_scale_linearTickRange(domain, m);
                if (format) {
                    var match = d3_format_re.exec(format);
                    match.shift();
                    if (match[8] === "s") {
                        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
                        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
                        match[8] = "f";
                        format = d3.format(match.join(""));
                        return function (d) {
                            return format(prefix.scale(d)) + prefix.symbol;
                        };
                    }
                    if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
                    format = match.join("");
                } else {
                    format = ",." + d3_scale_linearPrecision(range[2]) + "f";
                }
                return d3.format(format);
            }

            var d3_scale_linearFormatSignificant = {
                s: 1,
                g: 1,
                p: 1,
                r: 1,
                e: 1
            };

            function d3_scale_linearPrecision(value) {
                return -Math.floor(Math.log(value) / Math.LN10 + .01);
            }

            function d3_scale_linearFormatPrecision(type, range) {
                var p = d3_scale_linearPrecision(range[2]);
                return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
            }

            d3.scale.log = function () {
                return d3_scale_log(d3.scale.linear().domain([0, 1]), 10, true, [1, 10]);
            };

            function d3_scale_log(linear, base, positive, domain) {
                function log(x) {
                    return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
                }

                function pow(x) {
                    return positive ? Math.pow(base, x) : -Math.pow(base, -x);
                }

                function scale(x) {
                    return linear(log(x));
                }

                scale.invert = function (x) {
                    return pow(linear.invert(x));
                };
                scale.domain = function (x) {
                    if (!arguments.length) return domain;
                    positive = x[0] >= 0;
                    linear.domain((domain = x.map(Number)).map(log));
                    return scale;
                };
                scale.base = function (_) {
                    if (!arguments.length) return base;
                    base = +_;
                    linear.domain(domain.map(log));
                    return scale;
                };
                scale.nice = function () {
                    var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
                    linear.domain(niced);
                    domain = niced.map(pow);
                    return scale;
                };
                scale.ticks = function () {
                    var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1],
                        i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
                    if (isFinite(j - i)) {
                        if (positive) {
                            for (; i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
                            ticks.push(pow(i));
                        } else {
                            ticks.push(pow(i));
                            for (; i++ < j;) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
                        }
                        for (i = 0; ticks[i] < u; i++) {
                        }
                        for (j = ticks.length; ticks[j - 1] > v; j--) {
                        }
                        ticks = ticks.slice(i, j);
                    }
                    return ticks;
                };
                scale.tickFormat = function (n, format) {
                    if (!arguments.length) return d3_scale_logFormat;
                    if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
                    var k = Math.max(1, base * n / scale.ticks().length);
                    return function (d) {
                        var i = d / pow(Math.round(log(d)));
                        if (i * base < base - .5) i *= base;
                        return i <= k ? format(d) : "";
                    };
                };
                scale.copy = function () {
                    return d3_scale_log(linear.copy(), base, positive, domain);
                };
                return d3_scale_linearRebind(scale, linear);
            }

            var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
                floor: function (x) {
                    return -Math.ceil(-x);
                },
                ceil: function (x) {
                    return -Math.floor(-x);
                }
            };
            d3.scale.pow = function () {
                return d3_scale_pow(d3.scale.linear(), 1, [0, 1]);
            };

            function d3_scale_pow(linear, exponent, domain) {
                var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);

                function scale(x) {
                    return linear(powp(x));
                }

                scale.invert = function (x) {
                    return powb(linear.invert(x));
                };
                scale.domain = function (x) {
                    if (!arguments.length) return domain;
                    linear.domain((domain = x.map(Number)).map(powp));
                    return scale;
                };
                scale.ticks = function (m) {
                    return d3_scale_linearTicks(domain, m);
                };
                scale.tickFormat = function (m, format) {
                    return d3_scale_linearTickFormat(domain, m, format);
                };
                scale.nice = function (m) {
                    return scale.domain(d3_scale_linearNice(domain, m));
                };
                scale.exponent = function (x) {
                    if (!arguments.length) return exponent;
                    powp = d3_scale_powPow(exponent = x);
                    powb = d3_scale_powPow(1 / exponent);
                    linear.domain(domain.map(powp));
                    return scale;
                };
                scale.copy = function () {
                    return d3_scale_pow(linear.copy(), exponent, domain);
                };
                return d3_scale_linearRebind(scale, linear);
            }

            function d3_scale_powPow(e) {
                return function (x) {
                    return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
                };
            }

            d3.scale.sqrt = function () {
                return d3.scale.pow().exponent(.5);
            };
            d3.scale.ordinal = function () {
                return d3_scale_ordinal([], {
                    t: "range",
                    a: [[]]
                });
            };

            function d3_scale_ordinal(domain, ranger) {
                var index, range, rangeBand;

                function scale(x) {
                    return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
                }

                function steps(start, step) {
                    return d3.range(domain.length).map(function (i) {
                        return start + step * i;
                    });
                }

                scale.domain = function (x) {
                    if (!arguments.length) return domain;
                    domain = [];
                    index = new d3_Map();
                    var i = -1, n = x.length, xi;
                    while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
                    return scale[ranger.t].apply(scale, ranger.a);
                };
                scale.range = function (x) {
                    if (!arguments.length) return range;
                    range = x;
                    rangeBand = 0;
                    ranger = {
                        t: "range",
                        a: arguments
                    };
                    return scale;
                };
                scale.rangePoints = function (x, padding) {
                    if (arguments.length < 2) padding = 0;
                    var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2,
                        0) : (stop - start) / (domain.length - 1 + padding);
                    range = steps(start + step * padding / 2, step);
                    rangeBand = 0;
                    ranger = {
                        t: "rangePoints",
                        a: arguments
                    };
                    return scale;
                };
                scale.rangeRoundPoints = function (x, padding) {
                    if (arguments.length < 2) padding = 0;
                    var start = x[0], stop = x[1],
                        step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2),
                            0) : (stop - start) / (domain.length - 1 + padding) | 0;
                    range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
                    rangeBand = 0;
                    ranger = {
                        t: "rangeRoundPoints",
                        a: arguments
                    };
                    return scale;
                };
                scale.rangeBands = function (x, padding, outerPadding) {
                    if (arguments.length < 2) padding = 0;
                    if (arguments.length < 3) outerPadding = padding;
                    var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse],
                        step = (stop - start) / (domain.length - padding + 2 * outerPadding);
                    range = steps(start + step * outerPadding, step);
                    if (reverse) range.reverse();
                    rangeBand = step * (1 - padding);
                    ranger = {
                        t: "rangeBands",
                        a: arguments
                    };
                    return scale;
                };
                scale.rangeRoundBands = function (x, padding, outerPadding) {
                    if (arguments.length < 2) padding = 0;
                    if (arguments.length < 3) outerPadding = padding;
                    var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse],
                        step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
                    range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
                    if (reverse) range.reverse();
                    rangeBand = Math.round(step * (1 - padding));
                    ranger = {
                        t: "rangeRoundBands",
                        a: arguments
                    };
                    return scale;
                };
                scale.rangeBand = function () {
                    return rangeBand;
                };
                scale.rangeExtent = function () {
                    return d3_scaleExtent(ranger.a[0]);
                };
                scale.copy = function () {
                    return d3_scale_ordinal(domain, ranger);
                };
                return scale.domain(domain);
            }

            d3.scale.category10 = function () {
                return d3.scale.ordinal().range(d3_category10);
            };
            d3.scale.category20 = function () {
                return d3.scale.ordinal().range(d3_category20);
            };
            d3.scale.category20b = function () {
                return d3.scale.ordinal().range(d3_category20b);
            };
            d3.scale.category20c = function () {
                return d3.scale.ordinal().range(d3_category20c);
            };
            var d3_category10 = [2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175].map(d3_rgbString);
            var d3_category20 = [2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725].map(d3_rgbString);
            var d3_category20b = [3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654].map(d3_rgbString);
            var d3_category20c = [3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081].map(d3_rgbString);
            d3.scale.quantile = function () {
                return d3_scale_quantile([], []);
            };

            function d3_scale_quantile(domain, range) {
                var thresholds;

                function rescale() {
                    var k = 0, q = range.length;
                    thresholds = [];
                    while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
                    return scale;
                }

                function scale(x) {
                    if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
                }

                scale.domain = function (x) {
                    if (!arguments.length) return domain;
                    domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
                    return rescale();
                };
                scale.range = function (x) {
                    if (!arguments.length) return range;
                    range = x;
                    return rescale();
                };
                scale.quantiles = function () {
                    return thresholds;
                };
                scale.invertExtent = function (y) {
                    y = range.indexOf(y);
                    return y < 0 ? [NaN, NaN] : [y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1]];
                };
                scale.copy = function () {
                    return d3_scale_quantile(domain, range);
                };
                return rescale();
            }

            d3.scale.quantize = function () {
                return d3_scale_quantize(0, 1, [0, 1]);
            };

            function d3_scale_quantize(x0, x1, range) {
                var kx, i;

                function scale(x) {
                    return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
                }

                function rescale() {
                    kx = range.length / (x1 - x0);
                    i = range.length - 1;
                    return scale;
                }

                scale.domain = function (x) {
                    if (!arguments.length) return [x0, x1];
                    x0 = +x[0];
                    x1 = +x[x.length - 1];
                    return rescale();
                };
                scale.range = function (x) {
                    if (!arguments.length) return range;
                    range = x;
                    return rescale();
                };
                scale.invertExtent = function (y) {
                    y = range.indexOf(y);
                    y = y < 0 ? NaN : y / kx + x0;
                    return [y, y + 1 / kx];
                };
                scale.copy = function () {
                    return d3_scale_quantize(x0, x1, range);
                };
                return rescale();
            }

            d3.scale.threshold = function () {
                return d3_scale_threshold([.5], [0, 1]);
            };

            function d3_scale_threshold(domain, range) {
                function scale(x) {
                    if (x <= x) return range[d3.bisect(domain, x)];
                }

                scale.domain = function (_) {
                    if (!arguments.length) return domain;
                    domain = _;
                    return scale;
                };
                scale.range = function (_) {
                    if (!arguments.length) return range;
                    range = _;
                    return scale;
                };
                scale.invertExtent = function (y) {
                    y = range.indexOf(y);
                    return [domain[y - 1], domain[y]];
                };
                scale.copy = function () {
                    return d3_scale_threshold(domain, range);
                };
                return scale;
            }

            d3.scale.identity = function () {
                return d3_scale_identity([0, 1]);
            };

            function d3_scale_identity(domain) {
                function identity(x) {
                    return +x;
                }

                identity.invert = identity;
                identity.domain = identity.range = function (x) {
                    if (!arguments.length) return domain;
                    domain = x.map(identity);
                    return identity;
                };
                identity.ticks = function (m) {
                    return d3_scale_linearTicks(domain, m);
                };
                identity.tickFormat = function (m, format) {
                    return d3_scale_linearTickFormat(domain, m, format);
                };
                identity.copy = function () {
                    return d3_scale_identity(domain);
                };
                return identity;
            }

            d3.svg = {};

            function d3_zero() {
                return 0;
            }

            d3.svg.arc = function () {
                var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero,
                    padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle,
                    padAngle = d3_svg_arcPadAngle;

                function arc() {
                    var r0 = Math.max(0, +innerRadius.apply(this, arguments)),
                        r1 = Math.max(0, +outerRadius.apply(this, arguments)),
                        a0 = startAngle.apply(this, arguments) - halfπ, a1 = endAngle.apply(this, arguments) - halfπ,
                        da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
                    if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
                    if (da >= τε) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
                    var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
                    if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
                        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
                        if (!cw) p1 *= -1;
                        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
                        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
                    }
                    if (r1) {
                        x0 = r1 * Math.cos(a0 + p1);
                        y0 = r1 * Math.sin(a0 + p1);
                        x1 = r1 * Math.cos(a1 - p1);
                        y1 = r1 * Math.sin(a1 - p1);
                        var l1 = Math.abs(a1 - a0 - 2 * p1) <= π ? 0 : 1;
                        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
                            var h1 = (a0 + a1) / 2;
                            x0 = r1 * Math.cos(h1);
                            y0 = r1 * Math.sin(h1);
                            x1 = y1 = null;
                        }
                    } else {
                        x0 = y0 = 0;
                    }
                    if (r0) {
                        x2 = r0 * Math.cos(a1 - p0);
                        y2 = r0 * Math.sin(a1 - p0);
                        x3 = r0 * Math.cos(a0 + p0);
                        y3 = r0 * Math.sin(a0 + p0);
                        var l0 = Math.abs(a0 - a1 + 2 * p0) <= π ? 0 : 1;
                        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
                            var h0 = (a0 + a1) / 2;
                            x2 = r0 * Math.cos(h0);
                            y2 = r0 * Math.sin(h0);
                            x3 = y3 = null;
                        }
                    } else {
                        x2 = y2 = 0;
                    }
                    if (da > ε && (rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
                        cr = r0 < r1 ^ cw ? 0 : 1;
                        var rc1 = rc, rc0 = rc;
                        if (da < π) {
                            var oc = x3 == null ? [x2, y2] : x1 == null ? [x0, y0] : d3_geom_polygonIntersect([x0, y0], [x3, y3], [x1, y1], [x2, y2]),
                                ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1],
                                kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2),
                                lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
                            rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
                            rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
                        }
                        if (x1 != null) {
                            var t30 = d3_svg_arcCornerTangents(x3 == null ? [x2, y2] : [x3, y3], [x0, y0], r1, rc1, cw),
                                t12 = d3_svg_arcCornerTangents([x1, y1], [x2, y2], r1, rc1, cw);
                            if (rc === rc1) {
                                path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
                            } else {
                                path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
                            }
                        } else {
                            path.push("M", x0, ",", y0);
                        }
                        if (x3 != null) {
                            var t03 = d3_svg_arcCornerTangents([x0, y0], [x3, y3], r0, -rc0, cw),
                                t21 = d3_svg_arcCornerTangents([x2, y2], x1 == null ? [x0, y0] : [x1, y1], r0, -rc0, cw);
                            if (rc === rc0) {
                                path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
                            } else {
                                path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
                            }
                        } else {
                            path.push("L", x2, ",", y2);
                        }
                    } else {
                        path.push("M", x0, ",", y0);
                        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
                        path.push("L", x2, ",", y2);
                        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
                    }
                    path.push("Z");
                    return path.join("");
                }

                function circleSegment(r1, cw) {
                    return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
                }

                arc.innerRadius = function (v) {
                    if (!arguments.length) return innerRadius;
                    innerRadius = d3_functor(v);
                    return arc;
                };
                arc.outerRadius = function (v) {
                    if (!arguments.length) return outerRadius;
                    outerRadius = d3_functor(v);
                    return arc;
                };
                arc.cornerRadius = function (v) {
                    if (!arguments.length) return cornerRadius;
                    cornerRadius = d3_functor(v);
                    return arc;
                };
                arc.padRadius = function (v) {
                    if (!arguments.length) return padRadius;
                    padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
                    return arc;
                };
                arc.startAngle = function (v) {
                    if (!arguments.length) return startAngle;
                    startAngle = d3_functor(v);
                    return arc;
                };
                arc.endAngle = function (v) {
                    if (!arguments.length) return endAngle;
                    endAngle = d3_functor(v);
                    return arc;
                };
                arc.padAngle = function (v) {
                    if (!arguments.length) return padAngle;
                    padAngle = d3_functor(v);
                    return arc;
                };
                arc.centroid = function () {
                    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
                        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - halfπ;
                    return [Math.cos(a) * r, Math.sin(a) * r];
                };
                return arc;
            };
            var d3_svg_arcAuto = "auto";

            function d3_svg_arcInnerRadius(d) {
                return d.innerRadius;
            }

            function d3_svg_arcOuterRadius(d) {
                return d.outerRadius;
            }

            function d3_svg_arcStartAngle(d) {
                return d.startAngle;
            }

            function d3_svg_arcEndAngle(d) {
                return d.endAngle;
            }

            function d3_svg_arcPadAngle(d) {
                return d && d.padAngle;
            }

            function d3_svg_arcSweep(x0, y0, x1, y1) {
                return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
            }

            function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
                var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01),
                    ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy,
                    x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy,
                    r = r1 - rc, D = x1 * y2 - x2 * y1,
                    d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2,
                    cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2,
                    dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
                if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
                return [[cx0 - ox, cy0 - oy], [cx0 * r1 / r, cy0 * r1 / r]];
            }

            function d3_svg_line(projection) {
                var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear,
                    interpolateKey = interpolate.key, tension = .7;

                function line(data) {
                    var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);

                    function segment() {
                        segments.push("M", interpolate(projection(points), tension));
                    }

                    while (++i < n) {
                        if (defined.call(this, d = data[i], i)) {
                            points.push([+fx.call(this, d, i), +fy.call(this, d, i)]);
                        } else if (points.length) {
                            segment();
                            points = [];
                        }
                    }
                    if (points.length) segment();
                    return segments.length ? segments.join("") : null;
                }

                line.x = function (_) {
                    if (!arguments.length) return x;
                    x = _;
                    return line;
                };
                line.y = function (_) {
                    if (!arguments.length) return y;
                    y = _;
                    return line;
                };
                line.defined = function (_) {
                    if (!arguments.length) return defined;
                    defined = _;
                    return line;
                };
                line.interpolate = function (_) {
                    if (!arguments.length) return interpolateKey;
                    if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
                    return line;
                };
                line.tension = function (_) {
                    if (!arguments.length) return tension;
                    tension = _;
                    return line;
                };
                return line;
            }

            d3.svg.line = function () {
                return d3_svg_line(d3_identity);
            };
            var d3_svg_lineInterpolators = d3.map({
                linear: d3_svg_lineLinear,
                "linear-closed": d3_svg_lineLinearClosed,
                step: d3_svg_lineStep,
                "step-before": d3_svg_lineStepBefore,
                "step-after": d3_svg_lineStepAfter,
                basis: d3_svg_lineBasis,
                "basis-open": d3_svg_lineBasisOpen,
                "basis-closed": d3_svg_lineBasisClosed,
                bundle: d3_svg_lineBundle,
                cardinal: d3_svg_lineCardinal,
                "cardinal-open": d3_svg_lineCardinalOpen,
                "cardinal-closed": d3_svg_lineCardinalClosed,
                monotone: d3_svg_lineMonotone
            });
            d3_svg_lineInterpolators.forEach(function (key, value) {
                value.key = key;
                value.closed = /-closed$/.test(key);
            });

            function d3_svg_lineLinear(points) {
                return points.length > 1 ? points.join("L") : points + "Z";
            }

            function d3_svg_lineLinearClosed(points) {
                return points.join("L") + "Z";
            }

            function d3_svg_lineStep(points) {
                var i = 0, n = points.length, p = points[0], path = [p[0], ",", p[1]];
                while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
                if (n > 1) path.push("H", p[0]);
                return path.join("");
            }

            function d3_svg_lineStepBefore(points) {
                var i = 0, n = points.length, p = points[0], path = [p[0], ",", p[1]];
                while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
                return path.join("");
            }

            function d3_svg_lineStepAfter(points) {
                var i = 0, n = points.length, p = points[0], path = [p[0], ",", p[1]];
                while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
                return path.join("");
            }

            function d3_svg_lineCardinalOpen(points, tension) {
                return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
            }

            function d3_svg_lineCardinalClosed(points, tension) {
                return points.length < 3 ? d3_svg_lineLinearClosed(points) : points[0] + d3_svg_lineHermite((points.push(points[0]),
                    points), d3_svg_lineCardinalTangents([points[points.length - 2]].concat(points, [points[1]]), tension));
            }

            function d3_svg_lineCardinal(points, tension) {
                return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
            }

            function d3_svg_lineHermite(points, tangents) {
                if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
                    return d3_svg_lineLinear(points);
                }
                var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0],
                    t = t0, pi = 1;
                if (quad) {
                    path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
                    p0 = points[1];
                    pi = 2;
                }
                if (tangents.length > 1) {
                    t = tangents[1];
                    p = points[pi];
                    pi++;
                    path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
                    for (var i = 2; i < tangents.length; i++, pi++) {
                        p = points[pi];
                        t = tangents[i];
                        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
                    }
                }
                if (quad) {
                    var lp = points[pi];
                    path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
                }
                return path;
            }

            function d3_svg_lineCardinalTangents(points, tension) {
                var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
                while (++i < n) {
                    p0 = p1;
                    p1 = p2;
                    p2 = points[i];
                    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
                }
                return tangents;
            }

            function d3_svg_lineBasis(points) {
                if (points.length < 3) return d3_svg_lineLinear(points);
                var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1],
                    px = [x0, x0, x0, (pi = points[1])[0]], py = [y0, y0, y0, pi[1]],
                    path = [x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)];
                points.push(points[n - 1]);
                while (++i <= n) {
                    pi = points[i];
                    px.shift();
                    px.push(pi[0]);
                    py.shift();
                    py.push(pi[1]);
                    d3_svg_lineBasisBezier(path, px, py);
                }
                points.pop();
                path.push("L", pi);
                return path.join("");
            }

            function d3_svg_lineBasisOpen(points) {
                if (points.length < 4) return d3_svg_lineLinear(points);
                var path = [], i = -1, n = points.length, pi, px = [0], py = [0];
                while (++i < 3) {
                    pi = points[i];
                    px.push(pi[0]);
                    py.push(pi[1]);
                }
                path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
                --i;
                while (++i < n) {
                    pi = points[i];
                    px.shift();
                    px.push(pi[0]);
                    py.shift();
                    py.push(pi[1]);
                    d3_svg_lineBasisBezier(path, px, py);
                }
                return path.join("");
            }

            function d3_svg_lineBasisClosed(points) {
                var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
                while (++i < 4) {
                    pi = points[i % n];
                    px.push(pi[0]);
                    py.push(pi[1]);
                }
                path = [d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)];
                --i;
                while (++i < m) {
                    pi = points[i % n];
                    px.shift();
                    px.push(pi[0]);
                    py.shift();
                    py.push(pi[1]);
                    d3_svg_lineBasisBezier(path, px, py);
                }
                return path.join("");
            }

            function d3_svg_lineBundle(points, tension) {
                var n = points.length - 1;
                if (n) {
                    var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p,
                        t;
                    while (++i <= n) {
                        p = points[i];
                        t = i / n;
                        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
                        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
                    }
                }
                return d3_svg_lineBasis(points);
            }

            function d3_svg_lineDot4(a, b) {
                return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
            }

            var d3_svg_lineBasisBezier1 = [0, 2 / 3, 1 / 3, 0], d3_svg_lineBasisBezier2 = [0, 1 / 3, 2 / 3, 0],
                d3_svg_lineBasisBezier3 = [0, 1 / 6, 2 / 3, 1 / 6];

            function d3_svg_lineBasisBezier(path, x, y) {
                path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
            }

            function d3_svg_lineSlope(p0, p1) {
                return (p1[1] - p0[1]) / (p1[0] - p0[0]);
            }

            function d3_svg_lineFiniteDifferences(points) {
                var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1],
                    d = m[0] = d3_svg_lineSlope(p0, p1);
                while (++i < j) {
                    m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
                }
                m[i] = d;
                return m;
            }

            function d3_svg_lineMonotoneTangents(points) {
                var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
                while (++i < j) {
                    d = d3_svg_lineSlope(points[i], points[i + 1]);
                    if (abs(d) < ε) {
                        m[i] = m[i + 1] = 0;
                    } else {
                        a = m[i] / d;
                        b = m[i + 1] / d;
                        s = a * a + b * b;
                        if (s > 9) {
                            s = d * 3 / Math.sqrt(s);
                            m[i] = s * a;
                            m[i + 1] = s * b;
                        }
                    }
                }
                i = -1;
                while (++i <= j) {
                    s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
                    tangents.push([s || 0, m[i] * s || 0]);
                }
                return tangents;
            }

            function d3_svg_lineMonotone(points) {
                return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
            }

            d3.svg.line.radial = function () {
                var line = d3_svg_line(d3_svg_lineRadial);
                line.radius = line.x, delete line.x;
                line.angle = line.y, delete line.y;
                return line;
            };

            function d3_svg_lineRadial(points) {
                var point, i = -1, n = points.length, r, a;
                while (++i < n) {
                    point = points[i];
                    r = point[0];
                    a = point[1] - halfπ;
                    point[0] = r * Math.cos(a);
                    point[1] = r * Math.sin(a);
                }
                return points;
            }

            function d3_svg_area(projection) {
                var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true,
                    interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate,
                    L = "L", tension = .7;

                function area(data) {
                    var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0),
                        fy0 = d3_functor(y0), fx1 = x0 === x1 ? function () {
                            return x;
                        } : d3_functor(x1), fy1 = y0 === y1 ? function () {
                            return y;
                        } : d3_functor(y1), x, y;

                    function segment() {
                        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
                    }

                    while (++i < n) {
                        if (defined.call(this, d = data[i], i)) {
                            points0.push([x = +fx0.call(this, d, i), y = +fy0.call(this, d, i)]);
                            points1.push([+fx1.call(this, d, i), +fy1.call(this, d, i)]);
                        } else if (points0.length) {
                            segment();
                            points0 = [];
                            points1 = [];
                        }
                    }
                    if (points0.length) segment();
                    return segments.length ? segments.join("") : null;
                }

                area.x = function (_) {
                    if (!arguments.length) return x1;
                    x0 = x1 = _;
                    return area;
                };
                area.x0 = function (_) {
                    if (!arguments.length) return x0;
                    x0 = _;
                    return area;
                };
                area.x1 = function (_) {
                    if (!arguments.length) return x1;
                    x1 = _;
                    return area;
                };
                area.y = function (_) {
                    if (!arguments.length) return y1;
                    y0 = y1 = _;
                    return area;
                };
                area.y0 = function (_) {
                    if (!arguments.length) return y0;
                    y0 = _;
                    return area;
                };
                area.y1 = function (_) {
                    if (!arguments.length) return y1;
                    y1 = _;
                    return area;
                };
                area.defined = function (_) {
                    if (!arguments.length) return defined;
                    defined = _;
                    return area;
                };
                area.interpolate = function (_) {
                    if (!arguments.length) return interpolateKey;
                    if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
                    interpolateReverse = interpolate.reverse || interpolate;
                    L = interpolate.closed ? "M" : "L";
                    return area;
                };
                area.tension = function (_) {
                    if (!arguments.length) return tension;
                    tension = _;
                    return area;
                };
                return area;
            }

            d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
            d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
            d3.svg.area = function () {
                return d3_svg_area(d3_identity);
            };
            d3.svg.area.radial = function () {
                var area = d3_svg_area(d3_svg_lineRadial);
                area.radius = area.x, delete area.x;
                area.innerRadius = area.x0, delete area.x0;
                area.outerRadius = area.x1, delete area.x1;
                area.angle = area.y, delete area.y;
                area.startAngle = area.y0, delete area.y0;
                area.endAngle = area.y1, delete area.y1;
                return area;
            };
            d3.svg.chord = function () {
                var source = d3_source, target = d3_target, radius = d3_svg_chordRadius,
                    startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;

                function chord(d, i) {
                    var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
                    return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
                }

                function subgroup(self, f, d, i) {
                    var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i),
                        a0 = startAngle.call(self, subgroup, i) - halfπ, a1 = endAngle.call(self, subgroup, i) - halfπ;
                    return {
                        r: r,
                        a0: a0,
                        a1: a1,
                        p0: [r * Math.cos(a0), r * Math.sin(a0)],
                        p1: [r * Math.cos(a1), r * Math.sin(a1)]
                    };
                }

                function equals(a, b) {
                    return a.a0 == b.a0 && a.a1 == b.a1;
                }

                function arc(r, p, a) {
                    return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
                }

                function curve(r0, p0, r1, p1) {
                    return "Q 0,0 " + p1;
                }

                chord.radius = function (v) {
                    if (!arguments.length) return radius;
                    radius = d3_functor(v);
                    return chord;
                };
                chord.source = function (v) {
                    if (!arguments.length) return source;
                    source = d3_functor(v);
                    return chord;
                };
                chord.target = function (v) {
                    if (!arguments.length) return target;
                    target = d3_functor(v);
                    return chord;
                };
                chord.startAngle = function (v) {
                    if (!arguments.length) return startAngle;
                    startAngle = d3_functor(v);
                    return chord;
                };
                chord.endAngle = function (v) {
                    if (!arguments.length) return endAngle;
                    endAngle = d3_functor(v);
                    return chord;
                };
                return chord;
            };

            function d3_svg_chordRadius(d) {
                return d.radius;
            }

            d3.svg.diagonal = function () {
                var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;

                function diagonal(d, i) {
                    var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [p0, {
                        x: p0.x,
                        y: m
                    }, {
                        x: p3.x,
                        y: m
                    }, p3];
                    p = p.map(projection);
                    return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
                }

                diagonal.source = function (x) {
                    if (!arguments.length) return source;
                    source = d3_functor(x);
                    return diagonal;
                };
                diagonal.target = function (x) {
                    if (!arguments.length) return target;
                    target = d3_functor(x);
                    return diagonal;
                };
                diagonal.projection = function (x) {
                    if (!arguments.length) return projection;
                    projection = x;
                    return diagonal;
                };
                return diagonal;
            };

            function d3_svg_diagonalProjection(d) {
                return [d.x, d.y];
            }

            d3.svg.diagonal.radial = function () {
                var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection,
                    projection_ = diagonal.projection;
                diagonal.projection = function (x) {
                    return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
                };
                return diagonal;
            };

            function d3_svg_diagonalRadialProjection(projection) {
                return function () {
                    var d = projection.apply(this, arguments), r = d[0], a = d[1] - halfπ;
                    return [r * Math.cos(a), r * Math.sin(a)];
                };
            }

            d3.svg.symbol = function () {
                var type = d3_svg_symbolType, size = d3_svg_symbolSize;

                function symbol(d, i) {
                    return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
                }

                symbol.type = function (x) {
                    if (!arguments.length) return type;
                    type = d3_functor(x);
                    return symbol;
                };
                symbol.size = function (x) {
                    if (!arguments.length) return size;
                    size = d3_functor(x);
                    return symbol;
                };
                return symbol;
            };

            function d3_svg_symbolSize() {
                return 64;
            }

            function d3_svg_symbolType() {
                return "circle";
            }

            function d3_svg_symbolCircle(size) {
                var r = Math.sqrt(size / π);
                return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
            }

            var d3_svg_symbols = d3.map({
                circle: d3_svg_symbolCircle,
                cross: function (size) {
                    var r = Math.sqrt(size / 5) / 2;
                    return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
                },
                diamond: function (size) {
                    var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
                    return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
                },
                square: function (size) {
                    var r = Math.sqrt(size) / 2;
                    return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
                },
                "triangle-down": function (size) {
                    var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
                    return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
                },
                "triangle-up": function (size) {
                    var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
                    return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
                }
            });
            d3.svg.symbolTypes = d3_svg_symbols.keys();
            var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
            d3_selectionPrototype.transition = function (name) {
                var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [],
                    subgroup, node, transition = d3_transitionInherit || {
                        time: Date.now(),
                        ease: d3_ease_cubicInOut,
                        delay: 0,
                        duration: 250
                    };
                for (var j = -1, m = this.length; ++j < m;) {
                    subgroups.push(subgroup = []);
                    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
                        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
                        subgroup.push(node);
                    }
                }
                return d3_transition(subgroups, ns, id);
            };
            d3_selectionPrototype.interrupt = function (name) {
                return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
            };
            var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());

            function d3_selection_interruptNS(ns) {
                return function () {
                    var lock, activeId, active;
                    if ((lock = this[ns]) && (active = lock[activeId = lock.active])) {
                        active.timer.c = null;
                        active.timer.t = NaN;
                        if (--lock.count) delete lock[activeId]; else delete this[ns];
                        lock.active += .5;
                        active.event && active.event.interrupt.call(this, this.__data__, active.index);
                    }
                };
            }

            function d3_transition(groups, ns, id) {
                d3_subclass(groups, d3_transitionPrototype);
                groups.namespace = ns;
                groups.id = id;
                return groups;
            }

            var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
            d3_transitionPrototype.call = d3_selectionPrototype.call;
            d3_transitionPrototype.empty = d3_selectionPrototype.empty;
            d3_transitionPrototype.node = d3_selectionPrototype.node;
            d3_transitionPrototype.size = d3_selectionPrototype.size;
            d3.transition = function (selection, name) {
                return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3.selection().transition(selection);
            };
            d3.transition.prototype = d3_transitionPrototype;
            d3_transitionPrototype.select = function (selector) {
                var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
                selector = d3_selection_selector(selector);
                for (var j = -1, m = this.length; ++j < m;) {
                    subgroups.push(subgroup = []);
                    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
                        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
                            if ("__data__" in node) subnode.__data__ = node.__data__;
                            d3_transitionNode(subnode, i, ns, id, node[ns][id]);
                            subgroup.push(subnode);
                        } else {
                            subgroup.push(null);
                        }
                    }
                }
                return d3_transition(subgroups, ns, id);
            };
            d3_transitionPrototype.selectAll = function (selector) {
                var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
                selector = d3_selection_selectorAll(selector);
                for (var j = -1, m = this.length; ++j < m;) {
                    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
                        if (node = group[i]) {
                            transition = node[ns][id];
                            subnodes = selector.call(node, node.__data__, i, j);
                            subgroups.push(subgroup = []);
                            for (var k = -1, o = subnodes.length; ++k < o;) {
                                if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
                                subgroup.push(subnode);
                            }
                        }
                    }
                }
                return d3_transition(subgroups, ns, id);
            };
            d3_transitionPrototype.filter = function (filter) {
                var subgroups = [], subgroup, group, node;
                if (typeof filter !== "function") filter = d3_selection_filter(filter);
                for (var j = 0, m = this.length; j < m; j++) {
                    subgroups.push(subgroup = []);
                    for (var group = this[j], i = 0, n = group.length; i < n; i++) {
                        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
                            subgroup.push(node);
                        }
                    }
                }
                return d3_transition(subgroups, this.namespace, this.id);
            };
            d3_transitionPrototype.tween = function (name, tween) {
                var id = this.id, ns = this.namespace;
                if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
                return d3_selection_each(this, tween == null ? function (node) {
                    node[ns][id].tween.remove(name);
                } : function (node) {
                    node[ns][id].tween.set(name, tween);
                });
            };

            function d3_transition_tween(groups, name, value, tween) {
                var id = groups.id, ns = groups.namespace;
                return d3_selection_each(groups, typeof value === "function" ? function (node, i, j) {
                    node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
                } : (value = tween(value), function (node) {
                    node[ns][id].tween.set(name, value);
                }));
            }

            d3_transitionPrototype.attr = function (nameNS, value) {
                if (arguments.length < 2) {
                    for (value in nameNS) this.attr(value, nameNS[value]);
                    return this;
                }
                var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate,
                    name = d3.ns.qualify(nameNS);

                function attrNull() {
                    this.removeAttribute(name);
                }

                function attrNullNS() {
                    this.removeAttributeNS(name.space, name.local);
                }

                function attrTween(b) {
                    return b == null ? attrNull : (b += "", function () {
                        var a = this.getAttribute(name), i;
                        return a !== b && (i = interpolate(a, b), function (t) {
                            this.setAttribute(name, i(t));
                        });
                    });
                }

                function attrTweenNS(b) {
                    return b == null ? attrNullNS : (b += "", function () {
                        var a = this.getAttributeNS(name.space, name.local), i;
                        return a !== b && (i = interpolate(a, b), function (t) {
                            this.setAttributeNS(name.space, name.local, i(t));
                        });
                    });
                }

                return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
            };
            d3_transitionPrototype.attrTween = function (nameNS, tween) {
                var name = d3.ns.qualify(nameNS);

                function attrTween(d, i) {
                    var f = tween.call(this, d, i, this.getAttribute(name));
                    return f && function (t) {
                        this.setAttribute(name, f(t));
                    };
                }

                function attrTweenNS(d, i) {
                    var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
                    return f && function (t) {
                        this.setAttributeNS(name.space, name.local, f(t));
                    };
                }

                return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
            };
            d3_transitionPrototype.style = function (name, value, priority) {
                var n = arguments.length;
                if (n < 3) {
                    if (typeof name !== "string") {
                        if (n < 2) value = "";
                        for (priority in name) this.style(priority, name[priority], value);
                        return this;
                    }
                    priority = "";
                }

                function styleNull() {
                    this.style.removeProperty(name);
                }

                function styleString(b) {
                    return b == null ? styleNull : (b += "", function () {
                        var a = d3_window(this).getComputedStyle(this, null).getPropertyValue(name), i;
                        return a !== b && (i = d3_interpolate(a, b), function (t) {
                            this.style.setProperty(name, i(t), priority);
                        });
                    });
                }

                return d3_transition_tween(this, "style." + name, value, styleString);
            };
            d3_transitionPrototype.styleTween = function (name, tween, priority) {
                if (arguments.length < 3) priority = "";

                function styleTween(d, i) {
                    var f = tween.call(this, d, i, d3_window(this).getComputedStyle(this, null).getPropertyValue(name));
                    return f && function (t) {
                        this.style.setProperty(name, f(t), priority);
                    };
                }

                return this.tween("style." + name, styleTween);
            };
            d3_transitionPrototype.text = function (value) {
                return d3_transition_tween(this, "text", value, d3_transition_text);
            };

            function d3_transition_text(b) {
                if (b == null) b = "";
                return function () {
                    this.textContent = b;
                };
            }

            d3_transitionPrototype.remove = function () {
                var ns = this.namespace;
                return this.each("end.transition", function () {
                    var p;
                    if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
                });
            };
            d3_transitionPrototype.ease = function (value) {
                var id = this.id, ns = this.namespace;
                if (arguments.length < 1) return this.node()[ns][id].ease;
                if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
                return d3_selection_each(this, function (node) {
                    node[ns][id].ease = value;
                });
            };
            d3_transitionPrototype.delay = function (value) {
                var id = this.id, ns = this.namespace;
                if (arguments.length < 1) return this.node()[ns][id].delay;
                return d3_selection_each(this, typeof value === "function" ? function (node, i, j) {
                    node[ns][id].delay = +value.call(node, node.__data__, i, j);
                } : (value = +value, function (node) {
                    node[ns][id].delay = value;
                }));
            };
            d3_transitionPrototype.duration = function (value) {
                var id = this.id, ns = this.namespace;
                if (arguments.length < 1) return this.node()[ns][id].duration;
                return d3_selection_each(this, typeof value === "function" ? function (node, i, j) {
                    node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
                } : (value = Math.max(1, value), function (node) {
                    node[ns][id].duration = value;
                }));
            };
            d3_transitionPrototype.each = function (type, listener) {
                var id = this.id, ns = this.namespace;
                if (arguments.length < 2) {
                    var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
                    try {
                        d3_transitionInheritId = id;
                        d3_selection_each(this, function (node, i, j) {
                            d3_transitionInherit = node[ns][id];
                            type.call(node, node.__data__, i, j);
                        });
                    } finally {
                        d3_transitionInherit = inherit;
                        d3_transitionInheritId = inheritId;
                    }
                } else {
                    d3_selection_each(this, function (node) {
                        var transition = node[ns][id];
                        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
                    });
                }
                return this;
            };
            d3_transitionPrototype.transition = function () {
                var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node,
                    transition;
                for (var j = 0, m = this.length; j < m; j++) {
                    subgroups.push(subgroup = []);
                    for (var group = this[j], i = 0, n = group.length; i < n; i++) {
                        if (node = group[i]) {
                            transition = node[ns][id0];
                            d3_transitionNode(node, i, ns, id1, {
                                time: transition.time,
                                ease: transition.ease,
                                delay: transition.delay + transition.duration,
                                duration: transition.duration
                            });
                        }
                        subgroup.push(node);
                    }
                }
                return d3_transition(subgroups, ns, id1);
            };

            function d3_transitionNamespace(name) {
                return name == null ? "__transition__" : "__transition_" + name + "__";
            }

            function d3_transitionNode(node, i, ns, id, inherit) {
                var lock = node[ns] || (node[ns] = {
                    active: 0,
                    count: 0
                }), transition = lock[id], time, timer, duration, ease, tweens;

                function schedule(elapsed) {
                    var delay = transition.delay;
                    timer.t = delay + time;
                    if (delay <= elapsed) return start(elapsed - delay);
                    timer.c = start;
                }

                function start(elapsed) {
                    var activeId = lock.active, active = lock[activeId];
                    if (active) {
                        active.timer.c = null;
                        active.timer.t = NaN;
                        --lock.count;
                        delete lock[activeId];
                        active.event && active.event.interrupt.call(node, node.__data__, active.index);
                    }
                    for (var cancelId in lock) {
                        if (+cancelId < id) {
                            var cancel = lock[cancelId];
                            cancel.timer.c = null;
                            cancel.timer.t = NaN;
                            --lock.count;
                            delete lock[cancelId];
                        }
                    }
                    timer.c = tick;
                    d3_timer(function () {
                        if (timer.c && tick(elapsed || 1)) {
                            timer.c = null;
                            timer.t = NaN;
                        }
                        return 1;
                    }, 0, time);
                    lock.active = id;
                    transition.event && transition.event.start.call(node, node.__data__, i);
                    tweens = [];
                    transition.tween.forEach(function (key, value) {
                        if (value = value.call(node, node.__data__, i)) {
                            tweens.push(value);
                        }
                    });
                    ease = transition.ease;
                    duration = transition.duration;
                }

                function tick(elapsed) {
                    var t = elapsed / duration, e = ease(t), n = tweens.length;
                    while (n > 0) {
                        tweens[--n].call(node, e);
                    }
                    if (t >= 1) {
                        transition.event && transition.event.end.call(node, node.__data__, i);
                        if (--lock.count) delete lock[id]; else delete node[ns];
                        return 1;
                    }
                }

                if (!transition) {
                    time = inherit.time;
                    timer = d3_timer(schedule, 0, time);
                    transition = lock[id] = {
                        tween: new d3_Map(),
                        time: time,
                        timer: timer,
                        delay: inherit.delay,
                        duration: inherit.duration,
                        ease: inherit.ease,
                        index: i
                    };
                    inherit = null;
                    ++lock.count;
                }
            }

            d3.svg.axis = function () {
                var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6,
                    tickPadding = 3, tickArguments_ = [10], tickValues = null, tickFormat_;

                function axis(g) {
                    g.each(function () {
                        var g = d3.select(this);
                        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
                        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues,
                            tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_,
                            tick = g.selectAll(".tick").data(ticks, scale1),
                            tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε),
                            tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(),
                            tickUpdate = d3.transition(tick.order()).style("opacity", 1),
                            tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
                        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([0]),
                            pathUpdate = (path.enter().append("path").attr("class", "domain"),
                                d3.transition(path));
                        tickEnter.append("line");
                        tickEnter.append("text");
                        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"),
                            text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"),
                            textUpdate = tickUpdate.select("text"),
                            sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
                        if (orient === "bottom" || orient === "top") {
                            tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
                            text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
                            pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
                        } else {
                            tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
                            text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
                            pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
                        }
                        lineEnter.attr(y2, sign * innerTickSize);
                        textEnter.attr(y1, sign * tickSpacing);
                        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
                        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
                        if (scale1.rangeBand) {
                            var x = scale1, dx = x.rangeBand() / 2;
                            scale0 = scale1 = function (d) {
                                return x(d) + dx;
                            };
                        } else if (scale0.rangeBand) {
                            scale0 = scale1;
                        } else {
                            tickExit.call(tickTransform, scale1, scale0);
                        }
                        tickEnter.call(tickTransform, scale0, scale1);
                        tickUpdate.call(tickTransform, scale1, scale1);
                    });
                }

                axis.scale = function (x) {
                    if (!arguments.length) return scale;
                    scale = x;
                    return axis;
                };
                axis.orient = function (x) {
                    if (!arguments.length) return orient;
                    orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
                    return axis;
                };
                axis.ticks = function () {
                    if (!arguments.length) return tickArguments_;
                    tickArguments_ = d3_array(arguments);
                    return axis;
                };
                axis.tickValues = function (x) {
                    if (!arguments.length) return tickValues;
                    tickValues = x;
                    return axis;
                };
                axis.tickFormat = function (x) {
                    if (!arguments.length) return tickFormat_;
                    tickFormat_ = x;
                    return axis;
                };
                axis.tickSize = function (x) {
                    var n = arguments.length;
                    if (!n) return innerTickSize;
                    innerTickSize = +x;
                    outerTickSize = +arguments[n - 1];
                    return axis;
                };
                axis.innerTickSize = function (x) {
                    if (!arguments.length) return innerTickSize;
                    innerTickSize = +x;
                    return axis;
                };
                axis.outerTickSize = function (x) {
                    if (!arguments.length) return outerTickSize;
                    outerTickSize = +x;
                    return axis;
                };
                axis.tickPadding = function (x) {
                    if (!arguments.length) return tickPadding;
                    tickPadding = +x;
                    return axis;
                };
                axis.tickSubdivide = function () {
                    return arguments.length && axis;
                };
                return axis;
            };
            var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
                top: 1,
                right: 1,
                bottom: 1,
                left: 1
            };

            function d3_svg_axisX(selection, x0, x1) {
                selection.attr("transform", function (d) {
                    var v0 = x0(d);
                    return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
                });
            }

            function d3_svg_axisY(selection, y0, y1) {
                selection.attr("transform", function (d) {
                    var v0 = y0(d);
                    return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
                });
            }

            d3.svg.brush = function () {
                var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null,
                    xExtent = [0, 0], yExtent = [0, 0], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true,
                    resizes = d3_svg_brushResizes[0];

                function brush(g) {
                    g.each(function () {
                        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
                        var background = g.selectAll(".background").data([0]);
                        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
                        g.selectAll(".extent").data([0]).enter().append("rect").attr("class", "extent").style("cursor", "move");
                        var resize = g.selectAll(".resize").data(resizes, d3_identity);
                        resize.exit().remove();
                        resize.enter().append("g").attr("class", function (d) {
                            return "resize " + d;
                        }).style("cursor", function (d) {
                            return d3_svg_brushCursor[d];
                        }).append("rect").attr("x", function (d) {
                            return /[ew]$/.test(d) ? -3 : null;
                        }).attr("y", function (d) {
                            return /^[ns]/.test(d) ? -3 : null;
                        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
                        resize.style("display", brush.empty() ? "none" : null);
                        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
                        if (x) {
                            range = d3_scaleRange(x);
                            backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
                            redrawX(gUpdate);
                        }
                        if (y) {
                            range = d3_scaleRange(y);
                            backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
                            redrawY(gUpdate);
                        }
                        redraw(gUpdate);
                    });
                }

                brush.event = function (g) {
                    g.each(function () {
                        var event_ = event.of(this, arguments), extent1 = {
                            x: xExtent,
                            y: yExtent,
                            i: xExtentDomain,
                            j: yExtentDomain
                        }, extent0 = this.__chart__ || extent1;
                        this.__chart__ = extent1;
                        if (d3_transitionInheritId) {
                            d3.select(this).transition().each("start.brush", function () {
                                xExtentDomain = extent0.i;
                                yExtentDomain = extent0.j;
                                xExtent = extent0.x;
                                yExtent = extent0.y;
                                event_({
                                    type: "brushstart"
                                });
                            }).tween("brush:brush", function () {
                                var xi = d3_interpolateArray(xExtent, extent1.x),
                                    yi = d3_interpolateArray(yExtent, extent1.y);
                                xExtentDomain = yExtentDomain = null;
                                return function (t) {
                                    xExtent = extent1.x = xi(t);
                                    yExtent = extent1.y = yi(t);
                                    event_({
                                        type: "brush",
                                        mode: "resize"
                                    });
                                };
                            }).each("end.brush", function () {
                                xExtentDomain = extent1.i;
                                yExtentDomain = extent1.j;
                                event_({
                                    type: "brush",
                                    mode: "resize"
                                });
                                event_({
                                    type: "brushend"
                                });
                            });
                        } else {
                            event_({
                                type: "brushstart"
                            });
                            event_({
                                type: "brush",
                                mode: "resize"
                            });
                            event_({
                                type: "brushend"
                            });
                        }
                    });
                };

                function redraw(g) {
                    g.selectAll(".resize").attr("transform", function (d) {
                        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
                    });
                }

                function redrawX(g) {
                    g.select(".extent").attr("x", xExtent[0]);
                    g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
                }

                function redrawY(g) {
                    g.select(".extent").attr("y", yExtent[0]);
                    g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
                }

                function brushstart() {
                    var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments),
                        g = d3.select(target), resizing = eventTarget.datum(),
                        resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y,
                        dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(target), center,
                        origin = d3.mouse(target), offset;
                    var w = d3.select(d3_window(target)).on("keydown.brush", keydown).on("keyup.brush", keyup);
                    if (d3.event.changedTouches) {
                        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
                    } else {
                        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
                    }
                    g.interrupt().selectAll("*").interrupt();
                    if (dragging) {
                        origin[0] = xExtent[0] - origin[0];
                        origin[1] = yExtent[0] - origin[1];
                    } else if (resizing) {
                        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
                        offset = [xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1]];
                        origin[0] = xExtent[ex];
                        origin[1] = yExtent[ey];
                    } else if (d3.event.altKey) center = origin.slice();
                    g.style("pointer-events", "none").selectAll(".resize").style("display", null);
                    d3.select("body").style("cursor", eventTarget.style("cursor"));
                    event_({
                        type: "brushstart"
                    });
                    brushmove();

                    function keydown() {
                        if (d3.event.keyCode == 32) {
                            if (!dragging) {
                                center = null;
                                origin[0] -= xExtent[1];
                                origin[1] -= yExtent[1];
                                dragging = 2;
                            }
                            d3_eventPreventDefault();
                        }
                    }

                    function keyup() {
                        if (d3.event.keyCode == 32 && dragging == 2) {
                            origin[0] += xExtent[1];
                            origin[1] += yExtent[1];
                            dragging = 0;
                            d3_eventPreventDefault();
                        }
                    }

                    function brushmove() {
                        var point = d3.mouse(target), moved = false;
                        if (offset) {
                            point[0] += offset[0];
                            point[1] += offset[1];
                        }
                        if (!dragging) {
                            if (d3.event.altKey) {
                                if (!center) center = [(xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2];
                                origin[0] = xExtent[+(point[0] < center[0])];
                                origin[1] = yExtent[+(point[1] < center[1])];
                            } else center = null;
                        }
                        if (resizingX && move1(point, x, 0)) {
                            redrawX(g);
                            moved = true;
                        }
                        if (resizingY && move1(point, y, 1)) {
                            redrawY(g);
                            moved = true;
                        }
                        if (moved) {
                            redraw(g);
                            event_({
                                type: "brush",
                                mode: dragging ? "move" : "resize"
                            });
                        }
                    }

                    function move1(point, scale, i) {
                        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i],
                            extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
                        if (dragging) {
                            r0 -= position;
                            r1 -= size + position;
                        }
                        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
                        if (dragging) {
                            max = (min += position) + size;
                        } else {
                            if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
                            if (position < min) {
                                max = min;
                                min = position;
                            } else {
                                max = position;
                            }
                        }
                        if (extent[0] != min || extent[1] != max) {
                            if (i) yExtentDomain = null; else xExtentDomain = null;
                            extent[0] = min;
                            extent[1] = max;
                            return true;
                        }
                    }

                    function brushend() {
                        brushmove();
                        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
                        d3.select("body").style("cursor", null);
                        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
                        dragRestore();
                        event_({
                            type: "brushend"
                        });
                    }
                }

                brush.x = function (z) {
                    if (!arguments.length) return x;
                    x = z;
                    resizes = d3_svg_brushResizes[!x << 1 | !y];
                    return brush;
                };
                brush.y = function (z) {
                    if (!arguments.length) return y;
                    y = z;
                    resizes = d3_svg_brushResizes[!x << 1 | !y];
                    return brush;
                };
                brush.clamp = function (z) {
                    if (!arguments.length) return x && y ? [xClamp, yClamp] : x ? xClamp : y ? yClamp : null;
                    if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
                    return brush;
                };
                brush.extent = function (z) {
                    var x0, x1, y0, y1, t;
                    if (!arguments.length) {
                        if (x) {
                            if (xExtentDomain) {
                                x0 = xExtentDomain[0], x1 = xExtentDomain[1];
                            } else {
                                x0 = xExtent[0], x1 = xExtent[1];
                                if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
                                if (x1 < x0) t = x0, x0 = x1, x1 = t;
                            }
                        }
                        if (y) {
                            if (yExtentDomain) {
                                y0 = yExtentDomain[0], y1 = yExtentDomain[1];
                            } else {
                                y0 = yExtent[0], y1 = yExtent[1];
                                if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
                                if (y1 < y0) t = y0, y0 = y1, y1 = t;
                            }
                        }
                        return x && y ? [[x0, y0], [x1, y1]] : x ? [x0, x1] : y && [y0, y1];
                    }
                    if (x) {
                        x0 = z[0], x1 = z[1];
                        if (y) x0 = x0[0], x1 = x1[0];
                        xExtentDomain = [x0, x1];
                        if (x.invert) x0 = x(x0), x1 = x(x1);
                        if (x1 < x0) t = x0, x0 = x1, x1 = t;
                        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [x0, x1];
                    }
                    if (y) {
                        y0 = z[0], y1 = z[1];
                        if (x) y0 = y0[1], y1 = y1[1];
                        yExtentDomain = [y0, y1];
                        if (y.invert) y0 = y(y0), y1 = y(y1);
                        if (y1 < y0) t = y0, y0 = y1, y1 = t;
                        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [y0, y1];
                    }
                    return brush;
                };
                brush.clear = function () {
                    if (!brush.empty()) {
                        xExtent = [0, 0], yExtent = [0, 0];
                        xExtentDomain = yExtentDomain = null;
                    }
                    return brush;
                };
                brush.empty = function () {
                    return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
                };
                return d3.rebind(brush, event, "on");
            };
            var d3_svg_brushCursor = {
                n: "ns-resize",
                e: "ew-resize",
                s: "ns-resize",
                w: "ew-resize",
                nw: "nwse-resize",
                ne: "nesw-resize",
                se: "nwse-resize",
                sw: "nesw-resize"
            };
            var d3_svg_brushResizes = [["n", "e", "s", "w", "nw", "ne", "se", "sw"], ["e", "w"], ["n", "s"], []];
            var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
            var d3_time_formatUtc = d3_time_format.utc;
            var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
            d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;

            function d3_time_formatIsoNative(date) {
                return date.toISOString();
            }

            d3_time_formatIsoNative.parse = function (string) {
                var date = new Date(string);
                return isNaN(date) ? null : date;
            };
            d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
            d3_time.second = d3_time_interval(function (date) {
                return new d3_date(Math.floor(date / 1e3) * 1e3);
            }, function (date, offset) {
                date.setTime(date.getTime() + Math.floor(offset) * 1e3);
            }, function (date) {
                return date.getSeconds();
            });
            d3_time.seconds = d3_time.second.range;
            d3_time.seconds.utc = d3_time.second.utc.range;
            d3_time.minute = d3_time_interval(function (date) {
                return new d3_date(Math.floor(date / 6e4) * 6e4);
            }, function (date, offset) {
                date.setTime(date.getTime() + Math.floor(offset) * 6e4);
            }, function (date) {
                return date.getMinutes();
            });
            d3_time.minutes = d3_time.minute.range;
            d3_time.minutes.utc = d3_time.minute.utc.range;
            d3_time.hour = d3_time_interval(function (date) {
                var timezone = date.getTimezoneOffset() / 60;
                return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
            }, function (date, offset) {
                date.setTime(date.getTime() + Math.floor(offset) * 36e5);
            }, function (date) {
                return date.getHours();
            });
            d3_time.hours = d3_time.hour.range;
            d3_time.hours.utc = d3_time.hour.utc.range;
            d3_time.month = d3_time_interval(function (date) {
                date = d3_time.day(date);
                date.setDate(1);
                return date;
            }, function (date, offset) {
                date.setMonth(date.getMonth() + offset);
            }, function (date) {
                return date.getMonth();
            });
            d3_time.months = d3_time.month.range;
            d3_time.months.utc = d3_time.month.utc.range;

            function d3_time_scale(linear, methods, format) {
                function scale(x) {
                    return linear(x);
                }

                scale.invert = function (x) {
                    return d3_time_scaleDate(linear.invert(x));
                };
                scale.domain = function (x) {
                    if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
                    linear.domain(x);
                    return scale;
                };

                function tickMethod(extent, count) {
                    var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
                    return i == d3_time_scaleSteps.length ? [methods.year, d3_scale_linearTickRange(extent.map(function (d) {
                        return d / 31536e6;
                    }), count)[2]] : !i ? [d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2]] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
                }

                scale.nice = function (interval, skip) {
                    var domain = scale.domain(), extent = d3_scaleExtent(domain),
                        method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
                    if (method) interval = method[0], skip = method[1];

                    function skipped(date) {
                        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
                    }

                    return scale.domain(d3_scale_nice(domain, skip > 1 ? {
                        floor: function (date) {
                            while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
                            return date;
                        },
                        ceil: function (date) {
                            while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
                            return date;
                        }
                    } : interval));
                };
                scale.ticks = function (interval, skip) {
                    var extent = d3_scaleExtent(scale.domain()),
                        method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [{
                            range: interval
                        }, skip];
                    if (method) interval = method[0], skip = method[1];
                    return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
                };
                scale.tickFormat = function () {
                    return format;
                };
                scale.copy = function () {
                    return d3_time_scale(linear.copy(), methods, format);
                };
                return d3_scale_linearRebind(scale, linear);
            }

            function d3_time_scaleDate(t) {
                return new Date(t);
            }

            var d3_time_scaleSteps = [1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6];
            var d3_time_scaleLocalMethods = [[d3_time.second, 1], [d3_time.second, 5], [d3_time.second, 15], [d3_time.second, 30], [d3_time.minute, 1], [d3_time.minute, 5], [d3_time.minute, 15], [d3_time.minute, 30], [d3_time.hour, 1], [d3_time.hour, 3], [d3_time.hour, 6], [d3_time.hour, 12], [d3_time.day, 1], [d3_time.day, 2], [d3_time.week, 1], [d3_time.month, 1], [d3_time.month, 3], [d3_time.year, 1]];
            var d3_time_scaleLocalFormat = d3_time_format.multi([[".%L", function (d) {
                return d.getMilliseconds();
            }], [":%S", function (d) {
                return d.getSeconds();
            }], ["%I:%M", function (d) {
                return d.getMinutes();
            }], ["%I %p", function (d) {
                return d.getHours();
            }], ["%a %d", function (d) {
                return d.getDay() && d.getDate() != 1;
            }], ["%b %d", function (d) {
                return d.getDate() != 1;
            }], ["%B", function (d) {
                return d.getMonth();
            }], ["%Y", d3_true]]);
            var d3_time_scaleMilliseconds = {
                range: function (start, stop, step) {
                    return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
                },
                floor: d3_identity,
                ceil: d3_identity
            };
            d3_time_scaleLocalMethods.year = d3_time.year;
            d3_time.scale = function () {
                return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
            };
            var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function (m) {
                return [m[0].utc, m[1]];
            });
            var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([[".%L", function (d) {
                return d.getUTCMilliseconds();
            }], [":%S", function (d) {
                return d.getUTCSeconds();
            }], ["%I:%M", function (d) {
                return d.getUTCMinutes();
            }], ["%I %p", function (d) {
                return d.getUTCHours();
            }], ["%a %d", function (d) {
                return d.getUTCDay() && d.getUTCDate() != 1;
            }], ["%b %d", function (d) {
                return d.getUTCDate() != 1;
            }], ["%B", function (d) {
                return d.getUTCMonth();
            }], ["%Y", d3_true]]);
            d3_time_scaleUtcMethods.year = d3_time.year.utc;
            d3_time.scale.utc = function () {
                return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
            };
            d3.text = d3_xhrType(function (request) {
                return request.responseText;
            });
            d3.json = function (url, callback) {
                return d3_xhr(url, "application/json", d3_json, callback);
            };

            function d3_json(request) {
                return JSON.parse(request.responseText);
            }

            d3.html = function (url, callback) {
                return d3_xhr(url, "text/html", d3_html, callback);
            };

            function d3_html(request) {
                var range = d3_document.createRange();
                range.selectNode(d3_document.body);
                return range.createContextualFragment(request.responseText);
            }

            d3.xml = d3_xhrType(function (request) {
                return request.responseXML;
            });
            if (typeof define === "function" && define.amd) this.d3 = d3, define(d3); else if (typeof module === "object" && module.exports) module.exports = d3; else this.d3 = d3;
        }();
    }, {}],
    10: [function (require, module, exports) {
        (function (process) {
            /**
             * This is the web browser implementation of `debug()`.
             *
             * Expose `debug()` as the module.
             */

            exports = module.exports = require('./debug');
            exports.log = log;
            exports.formatArgs = formatArgs;
            exports.save = save;
            exports.load = load;
            exports.useColors = useColors;
            exports.storage = 'undefined' != typeof chrome
            && 'undefined' != typeof chrome.storage
                ? chrome.storage.local
                : localstorage();

            /**
             * Colors.
             */

            exports.colors = [
                '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
                '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
                '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
                '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
                '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
                '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
                '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
                '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
                '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
                '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
                '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
            ];

            /**
             * Currently only WebKit-based Web Inspectors, Firefox >= v31,
             * and the Firebug extension (any Firefox version) are known
             * to support "%c" CSS customizations.
             *
             * TODO: add a `localStorage` variable to explicitly enable/disable colors
             */

            function useColors() {
                // NB: In an Electron preload script, document will be defined but not fully
                // initialized. Since we know we're in Chrome, we'll just detect this case
                // explicitly
                if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
                    return true;
                }

                // Internet Explorer and Edge do not support colors.
                if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
                    return false;
                }

                // is webkit? http://stackoverflow.com/a/16459606/376773
                // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
                return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
                    // is firebug? http://stackoverflow.com/a/398120/376773
                    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
                    // is firefox >= v31?
                    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
                    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
                    // double check webkit in userAgent just in case we are in a worker
                    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
            }

            /**
             * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
             */

            exports.formatters.j = function (v) {
                try {
                    return JSON.stringify(v);
                } catch (err) {
                    return '[UnexpectedJSONParseError]: ' + err.message;
                }
            };


            /**
             * Colorize log arguments if enabled.
             *
             * @api public
             */

            function formatArgs(args) {
                var useColors = this.useColors;

                args[0] = (useColors ? '%c' : '')
                    + this.namespace
                    + (useColors ? ' %c' : ' ')
                    + args[0]
                    + (useColors ? '%c ' : ' ')
                    + '+' + exports.humanize(this.diff);

                if (!useColors) return;

                var c = 'color: ' + this.color;
                args.splice(1, 0, c, 'color: inherit');

                // the final "%c" is somewhat tricky, because there could be other
                // arguments passed either before or after the %c, so we need to
                // figure out the correct index to insert the CSS into
                var index = 0;
                var lastC = 0;
                args[0].replace(/%[a-zA-Z%]/g, function (match) {
                    if ('%%' === match) return;
                    index++;
                    if ('%c' === match) {
                        // we only are interested in the *last* %c
                        // (the user may have provided their own)
                        lastC = index;
                    }
                });

                args.splice(lastC, 0, c);
            }

            /**
             * Invokes `console.log()` when available.
             * No-op when `console.log` is not a "function".
             *
             * @api public
             */

            function log() {
                // this hackery is required for IE8/9, where
                // the `console.log` function doesn't have 'apply'
                return 'object' === typeof console
                    && console.log
                    && Function.prototype.apply.call(console.log, console, arguments);
            }

            /**
             * Save `namespaces`.
             *
             * @param {String} namespaces
             * @api private
             */

            function save(namespaces) {
                try {
                    if (null == namespaces) {
                        exports.storage.removeItem('debug');
                    } else {
                        exports.storage.debug = namespaces;
                    }
                } catch (e) {
                }
            }

            /**
             * Load `namespaces`.
             *
             * @return {String} returns the previously persisted debug modes
             * @api private
             */

            function load() {
                var r;
                try {
                    r = exports.storage.debug;
                } catch (e) {
                }

                // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
                if (!r && typeof process !== 'undefined' && 'env' in process) {
                    r = process.env.DEBUG;
                }

                return r;
            }

            /**
             * Enable namespaces listed in `localStorage.debug` initially.
             */

            exports.enable(load());

            /**
             * Localstorage attempts to return the localstorage.
             *
             * This is necessary because safari throws
             * when a user disables cookies/localstorage
             * and you attempt to access it.
             *
             * @return {LocalStorage}
             * @api private
             */

            function localstorage() {
                try {
                    return window.localStorage;
                } catch (e) {
                }
            }

        }).call(this, require('_process'))
    }, {"./debug": 11, "_process": 51}],
    11: [function (require, module, exports) {

        /**
         * This is the common logic for both the Node.js and web browser
         * implementations of `debug()`.
         *
         * Expose `debug()` as the module.
         */

        exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
        exports.coerce = coerce;
        exports.disable = disable;
        exports.enable = enable;
        exports.enabled = enabled;
        exports.humanize = require('ms');

        /**
         * Active `debug` instances.
         */
        exports.instances = [];

        /**
         * The currently active debug mode names, and names to skip.
         */

        exports.names = [];
        exports.skips = [];

        /**
         * Map of special "%n" handling functions, for the debug "format" argument.
         *
         * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
         */

        exports.formatters = {};

        /**
         * Select a color.
         * @param {String} namespace
         * @return {Number}
         * @api private
         */

        function selectColor(namespace) {
            var hash = 0, i;

            for (i in namespace) {
                hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
            }

            return exports.colors[Math.abs(hash) % exports.colors.length];
        }

        /**
         * Create a debugger with the given `namespace`.
         *
         * @param {String} namespace
         * @return {Function}
         * @api public
         */

        function createDebug(namespace) {

            var prevTime;

            function debug() {
                // disabled?
                if (!debug.enabled) return;

                var self = debug;

                // set `diff` timestamp
                var curr = +new Date();
                var ms = curr - (prevTime || curr);
                self.diff = ms;
                self.prev = prevTime;
                self.curr = curr;
                prevTime = curr;

                // turn the `arguments` into a proper Array
                var args = new Array(arguments.length);
                for (var i = 0; i < args.length; i++) {
                    args[i] = arguments[i];
                }

                args[0] = exports.coerce(args[0]);

                if ('string' !== typeof args[0]) {
                    // anything else let's inspect with %O
                    args.unshift('%O');
                }

                // apply any `formatters` transformations
                var index = 0;
                args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
                    // if we encounter an escaped % then don't increase the array index
                    if (match === '%%') return match;
                    index++;
                    var formatter = exports.formatters[format];
                    if ('function' === typeof formatter) {
                        var val = args[index];
                        match = formatter.call(self, val);

                        // now we need to remove `args[index]` since it's inlined in the `format`
                        args.splice(index, 1);
                        index--;
                    }
                    return match;
                });

                // apply env-specific formatting (colors, etc.)
                exports.formatArgs.call(self, args);

                var logFn = debug.log || exports.log || console.log.bind(console);
                logFn.apply(self, args);
            }

            debug.namespace = namespace;
            debug.enabled = exports.enabled(namespace);
            debug.useColors = exports.useColors();
            debug.color = selectColor(namespace);
            debug.destroy = destroy;

            // env-specific initialization logic for debug instances
            if ('function' === typeof exports.init) {
                exports.init(debug);
            }

            exports.instances.push(debug);

            return debug;
        }

        function destroy() {
            var index = exports.instances.indexOf(this);
            if (index !== -1) {
                exports.instances.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }

        /**
         * Enables a debug mode by namespaces. This can include modes
         * separated by a colon and wildcards.
         *
         * @param {String} namespaces
         * @api public
         */

        function enable(namespaces) {
            exports.save(namespaces);

            exports.names = [];
            exports.skips = [];

            var i;
            var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
            var len = split.length;

            for (i = 0; i < len; i++) {
                if (!split[i]) continue; // ignore empty strings
                namespaces = split[i].replace(/\*/g, '.*?');
                if (namespaces[0] === '-') {
                    exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
                } else {
                    exports.names.push(new RegExp('^' + namespaces + '$'));
                }
            }

            for (i = 0; i < exports.instances.length; i++) {
                var instance = exports.instances[i];
                instance.enabled = exports.enabled(instance.namespace);
            }
        }

        /**
         * Disable debug output.
         *
         * @api public
         */

        function disable() {
            exports.enable('');
        }

        /**
         * Returns true if the given mode name is enabled, false otherwise.
         *
         * @param {String} name
         * @return {Boolean}
         * @api public
         */

        function enabled(name) {
            if (name[name.length - 1] === '*') {
                return true;
            }
            var i, len;
            for (i = 0, len = exports.skips.length; i < len; i++) {
                if (exports.skips[i].test(name)) {
                    return false;
                }
            }
            for (i = 0, len = exports.names.length; i < len; i++) {
                if (exports.names[i].test(name)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Coerce `val`.
         *
         * @param {Mixed} val
         * @return {Mixed}
         * @api private
         */

        function coerce(val) {
            if (val instanceof Error) return val.stack || val.message;
            return val;
        }

    }, {"ms": 29}],
    12: [function (require, module, exports) {

        module.exports = require('./socket');

        /**
         * Exports parser
         *
         * @api public
         *
         */
        module.exports.parser = require('engine.io-parser');

    }, {"./socket": 13, "engine.io-parser": 21}],
    13: [function (require, module, exports) {
        (function (global) {
            /**
             * Module dependencies.
             */

            var transports = require('./transports/index');
            var Emitter = require('component-emitter');
            var debug = require('debug')('engine.io-client:socket');
            var index = require('indexof');
            var parser = require('engine.io-parser');
            var parseuri = require('parseuri');
            var parseqs = require('parseqs');

            /**
             * Module exports.
             */

            module.exports = Socket;

            /**
             * Socket constructor.
             *
             * @param {String|Object} uri or options
             * @param {Object} options
             * @api public
             */

            function Socket(uri, opts) {
                if (!(this instanceof Socket)) return new Socket(uri, opts);

                opts = opts || {};

                if (uri && 'object' === typeof uri) {
                    opts = uri;
                    uri = null;
                }

                if (uri) {
                    uri = parseuri(uri);
                    opts.hostname = uri.host;
                    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
                    opts.port = uri.port;
                    if (uri.query) opts.query = uri.query;
                } else if (opts.host) {
                    opts.hostname = parseuri(opts.host).host;
                }

                this.secure = null != opts.secure ? opts.secure
                    : (global.location && 'https:' === location.protocol);

                if (opts.hostname && !opts.port) {
                    // if no port is specified manually, use the protocol default
                    opts.port = this.secure ? '443' : '80';
                }

                this.agent = opts.agent || false;
                this.hostname = opts.hostname ||
                    (global.location ? location.hostname : 'localhost');
                this.port = opts.port || (global.location && location.port
                    ? location.port
                    : (this.secure ? 443 : 80));
                this.query = opts.query || {};
                if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
                this.upgrade = false !== opts.upgrade;
                this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
                this.forceJSONP = !!opts.forceJSONP;
                this.jsonp = false !== opts.jsonp;
                this.forceBase64 = !!opts.forceBase64;
                this.enablesXDR = !!opts.enablesXDR;
                this.timestampParam = opts.timestampParam || 't';
                this.timestampRequests = opts.timestampRequests;
                this.transports = opts.transports || ['polling', 'websocket'];
                this.transportOptions = opts.transportOptions || {};
                this.readyState = '';
                this.writeBuffer = [];
                this.prevBufferLen = 0;
                this.policyPort = opts.policyPort || 843;
                this.rememberUpgrade = opts.rememberUpgrade || false;
                this.binaryType = null;
                this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
                this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

                if (true === this.perMessageDeflate) this.perMessageDeflate = {};
                if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
                    this.perMessageDeflate.threshold = 1024;
                }

                // SSL options for Node.js client
                this.pfx = opts.pfx || null;
                this.key = opts.key || null;
                this.passphrase = opts.passphrase || null;
                this.cert = opts.cert || null;
                this.ca = opts.ca || null;
                this.ciphers = opts.ciphers || null;
                this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
                this.forceNode = !!opts.forceNode;

                // other options for Node.js client
                var freeGlobal = typeof global === 'object' && global;
                if (freeGlobal.global === freeGlobal) {
                    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
                        this.extraHeaders = opts.extraHeaders;
                    }

                    if (opts.localAddress) {
                        this.localAddress = opts.localAddress;
                    }
                }

                // set on handshake
                this.id = null;
                this.upgrades = null;
                this.pingInterval = null;
                this.pingTimeout = null;

                // set on heartbeat
                this.pingIntervalTimer = null;
                this.pingTimeoutTimer = null;

                this.open();
            }

            Socket.priorWebsocketSuccess = false;

            /**
             * Mix in `Emitter`.
             */

            Emitter(Socket.prototype);

            /**
             * Protocol version.
             *
             * @api public
             */

            Socket.protocol = parser.protocol; // this is an int

            /**
             * Expose deps for legacy compatibility
             * and standalone browser access.
             */

            Socket.Socket = Socket;
            Socket.Transport = require('./transport');
            Socket.transports = require('./transports/index');
            Socket.parser = require('engine.io-parser');

            /**
             * Creates transport of the given type.
             *
             * @param {String} transport name
             * @return {Transport}
             * @api private
             */

            Socket.prototype.createTransport = function (name) {
                debug('creating transport "%s"', name);
                var query = clone(this.query);

                // append engine.io protocol identifier
                query.EIO = parser.protocol;

                // transport name
                query.transport = name;

                // per-transport options
                var options = this.transportOptions[name] || {};

                // session id if we already have one
                if (this.id) query.sid = this.id;

                var transport = new transports[name]({
                    query: query,
                    socket: this,
                    agent: options.agent || this.agent,
                    hostname: options.hostname || this.hostname,
                    port: options.port || this.port,
                    secure: options.secure || this.secure,
                    path: options.path || this.path,
                    forceJSONP: options.forceJSONP || this.forceJSONP,
                    jsonp: options.jsonp || this.jsonp,
                    forceBase64: options.forceBase64 || this.forceBase64,
                    enablesXDR: options.enablesXDR || this.enablesXDR,
                    timestampRequests: options.timestampRequests || this.timestampRequests,
                    timestampParam: options.timestampParam || this.timestampParam,
                    policyPort: options.policyPort || this.policyPort,
                    pfx: options.pfx || this.pfx,
                    key: options.key || this.key,
                    passphrase: options.passphrase || this.passphrase,
                    cert: options.cert || this.cert,
                    ca: options.ca || this.ca,
                    ciphers: options.ciphers || this.ciphers,
                    rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
                    perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
                    extraHeaders: options.extraHeaders || this.extraHeaders,
                    forceNode: options.forceNode || this.forceNode,
                    localAddress: options.localAddress || this.localAddress,
                    requestTimeout: options.requestTimeout || this.requestTimeout,
                    protocols: options.protocols || void (0)
                });

                return transport;
            };

            function clone(obj) {
                var o = {};
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        o[i] = obj[i];
                    }
                }
                return o;
            }

            /**
             * Initializes transport to use and starts probe.
             *
             * @api private
             */
            Socket.prototype.open = function () {
                var transport;
                if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
                    transport = 'websocket';
                } else if (0 === this.transports.length) {
                    // Emit error on next tick so it can be listened to
                    var self = this;
                    setTimeout(function () {
                        self.emit('error', 'No transports available');
                    }, 0);
                    return;
                } else {
                    transport = this.transports[0];
                }
                this.readyState = 'opening';

                // Retry with the next transport if the transport is disabled (jsonp: false)
                try {
                    transport = this.createTransport(transport);
                } catch (e) {
                    this.transports.shift();
                    this.open();
                    return;
                }

                transport.open();
                this.setTransport(transport);
            };

            /**
             * Sets the current transport. Disables the existing one (if any).
             *
             * @api private
             */

            Socket.prototype.setTransport = function (transport) {
                debug('setting transport %s', transport.name);
                var self = this;

                if (this.transport) {
                    debug('clearing existing transport %s', this.transport.name);
                    this.transport.removeAllListeners();
                }

                // set up transport
                this.transport = transport;

                // set up transport listeners
                transport
                    .on('drain', function () {
                        self.onDrain();
                    })
                    .on('packet', function (packet) {
                        self.onPacket(packet);
                    })
                    .on('error', function (e) {
                        self.onError(e);
                    })
                    .on('close', function () {
                        self.onClose('transport close');
                    });
            };

            /**
             * Probes a transport.
             *
             * @param {String} transport name
             * @api private
             */

            Socket.prototype.probe = function (name) {
                debug('probing transport "%s"', name);
                var transport = this.createTransport(name, {probe: 1});
                var failed = false;
                var self = this;

                Socket.priorWebsocketSuccess = false;

                function onTransportOpen() {
                    if (self.onlyBinaryUpgrades) {
                        var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
                        failed = failed || upgradeLosesBinary;
                    }
                    if (failed) return;

                    debug('probe transport "%s" opened', name);
                    transport.send([{type: 'ping', data: 'probe'}]);
                    transport.once('packet', function (msg) {
                        if (failed) return;
                        if ('pong' === msg.type && 'probe' === msg.data) {
                            debug('probe transport "%s" pong', name);
                            self.upgrading = true;
                            self.emit('upgrading', transport);
                            if (!transport) return;
                            Socket.priorWebsocketSuccess = 'websocket' === transport.name;

                            debug('pausing current transport "%s"', self.transport.name);
                            self.transport.pause(function () {
                                if (failed) return;
                                if ('closed' === self.readyState) return;
                                debug('changing transport and sending upgrade packet');

                                cleanup();

                                self.setTransport(transport);
                                transport.send([{type: 'upgrade'}]);
                                self.emit('upgrade', transport);
                                transport = null;
                                self.upgrading = false;
                                self.flush();
                            });
                        } else {
                            debug('probe transport "%s" failed', name);
                            var err = new Error('probe error');
                            err.transport = transport.name;
                            self.emit('upgradeError', err);
                        }
                    });
                }

                function freezeTransport() {
                    if (failed) return;

                    // Any callback called by transport should be ignored since now
                    failed = true;

                    cleanup();

                    transport.close();
                    transport = null;
                }

                // Handle any error that happens while probing
                function onerror(err) {
                    var error = new Error('probe error: ' + err);
                    error.transport = transport.name;

                    freezeTransport();

                    debug('probe transport "%s" failed because of error: %s', name, err);

                    self.emit('upgradeError', error);
                }

                function onTransportClose() {
                    onerror('transport closed');
                }

                // When the socket is closed while we're probing
                function onclose() {
                    onerror('socket closed');
                }

                // When the socket is upgraded while we're probing
                function onupgrade(to) {
                    if (transport && to.name !== transport.name) {
                        debug('"%s" works - aborting "%s"', to.name, transport.name);
                        freezeTransport();
                    }
                }

                // Remove all listeners on the transport and on self
                function cleanup() {
                    transport.removeListener('open', onTransportOpen);
                    transport.removeListener('error', onerror);
                    transport.removeListener('close', onTransportClose);
                    self.removeListener('close', onclose);
                    self.removeListener('upgrading', onupgrade);
                }

                transport.once('open', onTransportOpen);
                transport.once('error', onerror);
                transport.once('close', onTransportClose);

                this.once('close', onclose);
                this.once('upgrading', onupgrade);

                transport.open();
            };

            /**
             * Called when connection is deemed open.
             *
             * @api public
             */

            Socket.prototype.onOpen = function () {
                debug('socket open');
                this.readyState = 'open';
                Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
                this.emit('open');
                this.flush();

                // we check for `readyState` in case an `open`
                // listener already closed the socket
                if ('open' === this.readyState && this.upgrade && this.transport.pause) {
                    debug('starting upgrade probes');
                    for (var i = 0, l = this.upgrades.length; i < l; i++) {
                        this.probe(this.upgrades[i]);
                    }
                }
            };

            /**
             * Handles a packet.
             *
             * @api private
             */

            Socket.prototype.onPacket = function (packet) {
                if ('opening' === this.readyState || 'open' === this.readyState ||
                    'closing' === this.readyState) {
                    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

                    this.emit('packet', packet);

                    // Socket is live - any packet counts
                    this.emit('heartbeat');

                    switch (packet.type) {
                        case 'open':
                            this.onHandshake(JSON.parse(packet.data));
                            break;

                        case 'pong':
                            this.setPing();
                            this.emit('pong');
                            break;

                        case 'error':
                            var err = new Error('server error');
                            err.code = packet.data;
                            this.onError(err);
                            break;

                        case 'message':
                            this.emit('data', packet.data);
                            this.emit('message', packet.data);
                            break;
                    }
                } else {
                    debug('packet received with socket readyState "%s"', this.readyState);
                }
            };

            /**
             * Called upon handshake completion.
             *
             * @param {Object} handshake obj
             * @api private
             */

            Socket.prototype.onHandshake = function (data) {
                this.emit('handshake', data);
                this.id = data.sid;
                this.transport.query.sid = data.sid;
                this.upgrades = this.filterUpgrades(data.upgrades);
                this.pingInterval = data.pingInterval;
                this.pingTimeout = data.pingTimeout;
                this.onOpen();
                // In case open handler closes socket
                if ('closed' === this.readyState) return;
                this.setPing();

                // Prolong liveness of socket on heartbeat
                this.removeListener('heartbeat', this.onHeartbeat);
                this.on('heartbeat', this.onHeartbeat);
            };

            /**
             * Resets ping timeout.
             *
             * @api private
             */

            Socket.prototype.onHeartbeat = function (timeout) {
                clearTimeout(this.pingTimeoutTimer);
                var self = this;
                self.pingTimeoutTimer = setTimeout(function () {
                    if ('closed' === self.readyState) return;
                    self.onClose('ping timeout');
                }, timeout || (self.pingInterval + self.pingTimeout));
            };

            /**
             * Pings server every `this.pingInterval` and expects response
             * within `this.pingTimeout` or closes connection.
             *
             * @api private
             */

            Socket.prototype.setPing = function () {
                var self = this;
                clearTimeout(self.pingIntervalTimer);
                self.pingIntervalTimer = setTimeout(function () {
                    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
                    self.ping();
                    self.onHeartbeat(self.pingTimeout);
                }, self.pingInterval);
            };

            /**
             * Sends a ping packet.
             *
             * @api private
             */

            Socket.prototype.ping = function () {
                var self = this;
                this.sendPacket('ping', function () {
                    self.emit('ping');
                });
            };

            /**
             * Called on `drain` event
             *
             * @api private
             */

            Socket.prototype.onDrain = function () {
                this.writeBuffer.splice(0, this.prevBufferLen);

                // setting prevBufferLen = 0 is very important
                // for example, when upgrading, upgrade packet is sent over,
                // and a nonzero prevBufferLen could cause problems on `drain`
                this.prevBufferLen = 0;

                if (0 === this.writeBuffer.length) {
                    this.emit('drain');
                } else {
                    this.flush();
                }
            };

            /**
             * Flush write buffers.
             *
             * @api private
             */

            Socket.prototype.flush = function () {
                if ('closed' !== this.readyState && this.transport.writable &&
                    !this.upgrading && this.writeBuffer.length) {
                    debug('flushing %d packets in socket', this.writeBuffer.length);
                    this.transport.send(this.writeBuffer);
                    // keep track of current length of writeBuffer
                    // splice writeBuffer and callbackBuffer on `drain`
                    this.prevBufferLen = this.writeBuffer.length;
                    this.emit('flush');
                }
            };

            /**
             * Sends a message.
             *
             * @param {String} message.
             * @param {Function} callback function.
             * @param {Object} options.
             * @return {Socket} for chaining.
             * @api public
             */

            Socket.prototype.write =
                Socket.prototype.send = function (msg, options, fn) {
                    this.sendPacket('message', msg, options, fn);
                    return this;
                };

            /**
             * Sends a packet.
             *
             * @param {String} packet type.
             * @param {String} data.
             * @param {Object} options.
             * @param {Function} callback function.
             * @api private
             */

            Socket.prototype.sendPacket = function (type, data, options, fn) {
                if ('function' === typeof data) {
                    fn = data;
                    data = undefined;
                }

                if ('function' === typeof options) {
                    fn = options;
                    options = null;
                }

                if ('closing' === this.readyState || 'closed' === this.readyState) {
                    return;
                }

                options = options || {};
                options.compress = false !== options.compress;

                var packet = {
                    type: type,
                    data: data,
                    options: options
                };
                this.emit('packetCreate', packet);
                this.writeBuffer.push(packet);
                if (fn) this.once('flush', fn);
                this.flush();
            };

            /**
             * Closes the connection.
             *
             * @api private
             */

            Socket.prototype.close = function () {
                if ('opening' === this.readyState || 'open' === this.readyState) {
                    this.readyState = 'closing';

                    var self = this;

                    if (this.writeBuffer.length) {
                        this.once('drain', function () {
                            if (this.upgrading) {
                                waitForUpgrade();
                            } else {
                                close();
                            }
                        });
                    } else if (this.upgrading) {
                        waitForUpgrade();
                    } else {
                        close();
                    }
                }

                function close() {
                    self.onClose('forced close');
                    debug('socket closing - telling transport to close');
                    self.transport.close();
                }

                function cleanupAndClose() {
                    self.removeListener('upgrade', cleanupAndClose);
                    self.removeListener('upgradeError', cleanupAndClose);
                    close();
                }

                function waitForUpgrade() {
                    // wait for upgrade to finish since we can't send packets while pausing a transport
                    self.once('upgrade', cleanupAndClose);
                    self.once('upgradeError', cleanupAndClose);
                }

                return this;
            };

            /**
             * Called upon transport error
             *
             * @api private
             */

            Socket.prototype.onError = function (err) {
                debug('socket error %j', err);
                Socket.priorWebsocketSuccess = false;
                this.emit('error', err);
                this.onClose('transport error', err);
            };

            /**
             * Called upon transport close.
             *
             * @api private
             */

            Socket.prototype.onClose = function (reason, desc) {
                if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
                    debug('socket close with reason: "%s"', reason);
                    var self = this;

                    // clear timers
                    clearTimeout(this.pingIntervalTimer);
                    clearTimeout(this.pingTimeoutTimer);

                    // stop event from firing again for transport
                    this.transport.removeAllListeners('close');

                    // ensure transport won't stay open
                    this.transport.close();

                    // ignore further transport communication
                    this.transport.removeAllListeners();

                    // set ready state
                    this.readyState = 'closed';

                    // clear session id
                    this.id = null;

                    // emit close event
                    this.emit('close', reason, desc);

                    // clean buffers after, so users can still
                    // grab the buffers on `close` event
                    self.writeBuffer = [];
                    self.prevBufferLen = 0;
                }
            };

            /**
             * Filters upgrades, returning only those matching client transports.
             *
             * @param {Array} server upgrades
             * @api private
             *
             */

            Socket.prototype.filterUpgrades = function (upgrades) {
                var filteredUpgrades = [];
                for (var i = 0, j = upgrades.length; i < j; i++) {
                    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
                }
                return filteredUpgrades;
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
        "./transport": 14,
        "./transports/index": 15,
        "component-emitter": 7,
        "debug": 10,
        "engine.io-parser": 21,
        "indexof": 27,
        "parseqs": 31,
        "parseuri": 32
    }],
    14: [function (require, module, exports) {
        /**
         * Module dependencies.
         */

        var parser = require('engine.io-parser');
        var Emitter = require('component-emitter');

        /**
         * Module exports.
         */

        module.exports = Transport;

        /**
         * Transport abstract constructor.
         *
         * @param {Object} options.
         * @api private
         */

        function Transport(opts) {
            this.path = opts.path;
            this.hostname = opts.hostname;
            this.port = opts.port;
            this.secure = opts.secure;
            this.query = opts.query;
            this.timestampParam = opts.timestampParam;
            this.timestampRequests = opts.timestampRequests;
            this.readyState = '';
            this.agent = opts.agent || false;
            this.socket = opts.socket;
            this.enablesXDR = opts.enablesXDR;

            // SSL options for Node.js client
            this.pfx = opts.pfx;
            this.key = opts.key;
            this.passphrase = opts.passphrase;
            this.cert = opts.cert;
            this.ca = opts.ca;
            this.ciphers = opts.ciphers;
            this.rejectUnauthorized = opts.rejectUnauthorized;
            this.forceNode = opts.forceNode;

            // other options for Node.js client
            this.extraHeaders = opts.extraHeaders;
            this.localAddress = opts.localAddress;
        }

        /**
         * Mix in `Emitter`.
         */

        Emitter(Transport.prototype);

        /**
         * Emits an error.
         *
         * @param {String} str
         * @return {Transport} for chaining
         * @api public
         */

        Transport.prototype.onError = function (msg, desc) {
            var err = new Error(msg);
            err.type = 'TransportError';
            err.description = desc;
            this.emit('error', err);
            return this;
        };

        /**
         * Opens the transport.
         *
         * @api public
         */

        Transport.prototype.open = function () {
            if ('closed' === this.readyState || '' === this.readyState) {
                this.readyState = 'opening';
                this.doOpen();
            }

            return this;
        };

        /**
         * Closes the transport.
         *
         * @api private
         */

        Transport.prototype.close = function () {
            if ('opening' === this.readyState || 'open' === this.readyState) {
                this.doClose();
                this.onClose();
            }

            return this;
        };

        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         * @api private
         */

        Transport.prototype.send = function (packets) {
            if ('open' === this.readyState) {
                this.write(packets);
            } else {
                throw new Error('Transport not open');
            }
        };

        /**
         * Called upon open
         *
         * @api private
         */

        Transport.prototype.onOpen = function () {
            this.readyState = 'open';
            this.writable = true;
            this.emit('open');
        };

        /**
         * Called with data.
         *
         * @param {String} data
         * @api private
         */

        Transport.prototype.onData = function (data) {
            var packet = parser.decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
        };

        /**
         * Called with a decoded packet.
         */

        Transport.prototype.onPacket = function (packet) {
            this.emit('packet', packet);
        };

        /**
         * Called upon close.
         *
         * @api private
         */

        Transport.prototype.onClose = function () {
            this.readyState = 'closed';
            this.emit('close');
        };

    }, {"component-emitter": 7, "engine.io-parser": 21}],
    15: [function (require, module, exports) {
        (function (global) {
            /**
             * Module dependencies
             */

            var XMLHttpRequest = require('xmlhttprequest-ssl');
            var XHR = require('./polling-xhr');
            var JSONP = require('./polling-jsonp');
            var websocket = require('./websocket');

            /**
             * Export transports.
             */

            exports.polling = polling;
            exports.websocket = websocket;

            /**
             * Polling transport polymorphic constructor.
             * Decides on xhr vs jsonp based on feature detection.
             *
             * @api private
             */

            function polling(opts) {
                var xhr;
                var xd = false;
                var xs = false;
                var jsonp = false !== opts.jsonp;

                if (global.location) {
                    var isSSL = 'https:' === location.protocol;
                    var port = location.port;

                    // some user agents have empty `location.port`
                    if (!port) {
                        port = isSSL ? 443 : 80;
                    }

                    xd = opts.hostname !== location.hostname || port !== opts.port;
                    xs = opts.secure !== isSSL;
                }

                opts.xdomain = xd;
                opts.xscheme = xs;
                xhr = new XMLHttpRequest(opts);

                if ('open' in xhr && !opts.forceJSONP) {
                    return new XHR(opts);
                } else {
                    if (!jsonp) throw new Error('JSONP disabled');
                    return new JSONP(opts);
                }
            }

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {"./polling-jsonp": 16, "./polling-xhr": 17, "./websocket": 19, "xmlhttprequest-ssl": 20}],
    16: [function (require, module, exports) {
        (function (global) {

            /**
             * Module requirements.
             */

            var Polling = require('./polling');
            var inherit = require('component-inherit');

            /**
             * Module exports.
             */

            module.exports = JSONPPolling;

            /**
             * Cached regular expressions.
             */

            var rNewline = /\n/g;
            var rEscapedNewline = /\\n/g;

            /**
             * Global JSONP callbacks.
             */

            var callbacks;

            /**
             * Noop.
             */

            function empty() {
            }

            /**
             * JSONP Polling constructor.
             *
             * @param {Object} opts.
             * @api public
             */

            function JSONPPolling(opts) {
                Polling.call(this, opts);

                this.query = this.query || {};

                // define global callbacks array if not present
                // we do this here (lazily) to avoid unneeded global pollution
                if (!callbacks) {
                    // we need to consider multiple engines in the same page
                    if (!global.___eio) global.___eio = [];
                    callbacks = global.___eio;
                }

                // callback identifier
                this.index = callbacks.length;

                // add callback to jsonp global
                var self = this;
                callbacks.push(function (msg) {
                    self.onData(msg);
                });

                // append to query string
                this.query.j = this.index;

                // prevent spurious errors from being emitted when the window is unloaded
                if (global.document && global.addEventListener) {
                    global.addEventListener('beforeunload', function () {
                        if (self.script) self.script.onerror = empty;
                    }, false);
                }
            }

            /**
             * Inherits from Polling.
             */

            inherit(JSONPPolling, Polling);

            /*
 * JSONP only supports binary as base64 encoded strings
 */

            JSONPPolling.prototype.supportsBinary = false;

            /**
             * Closes the socket.
             *
             * @api private
             */

            JSONPPolling.prototype.doClose = function () {
                if (this.script) {
                    this.script.parentNode.removeChild(this.script);
                    this.script = null;
                }

                if (this.form) {
                    this.form.parentNode.removeChild(this.form);
                    this.form = null;
                    this.iframe = null;
                }

                Polling.prototype.doClose.call(this);
            };

            /**
             * Starts a poll cycle.
             *
             * @api private
             */

            JSONPPolling.prototype.doPoll = function () {
                var self = this;
                var script = document.createElement('script');

                if (this.script) {
                    this.script.parentNode.removeChild(this.script);
                    this.script = null;
                }

                script.async = true;
                script.src = this.uri();
                script.onerror = function (e) {
                    self.onError('jsonp poll error', e);
                };

                var insertAt = document.getElementsByTagName('script')[0];
                if (insertAt) {
                    insertAt.parentNode.insertBefore(script, insertAt);
                } else {
                    (document.head || document.body).appendChild(script);
                }
                this.script = script;

                var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

                if (isUAgecko) {
                    setTimeout(function () {
                        var iframe = document.createElement('iframe');
                        document.body.appendChild(iframe);
                        document.body.removeChild(iframe);
                    }, 100);
                }
            };

            /**
             * Writes with a hidden iframe.
             *
             * @param {String} data to send
             * @param {Function} called upon flush.
             * @api private
             */

            JSONPPolling.prototype.doWrite = function (data, fn) {
                var self = this;

                if (!this.form) {
                    var form = document.createElement('form');
                    var area = document.createElement('textarea');
                    var id = this.iframeId = 'eio_iframe_' + this.index;
                    var iframe;

                    form.className = 'socketio';
                    form.style.position = 'absolute';
                    form.style.top = '-1000px';
                    form.style.left = '-1000px';
                    form.target = id;
                    form.method = 'POST';
                    form.setAttribute('accept-charset', 'utf-8');
                    area.name = 'd';
                    form.appendChild(area);
                    document.body.appendChild(form);

                    this.form = form;
                    this.area = area;
                }

                this.form.action = this.uri();

                function complete() {
                    initIframe();
                    fn();
                }

                function initIframe() {
                    if (self.iframe) {
                        try {
                            self.form.removeChild(self.iframe);
                        } catch (e) {
                            self.onError('jsonp polling iframe removal error', e);
                        }
                    }

                    try {
                        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
                        var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
                        iframe = document.createElement(html);
                    } catch (e) {
                        iframe = document.createElement('iframe');
                        iframe.name = self.iframeId;
                        iframe.src = 'javascript:0';
                    }

                    iframe.id = self.iframeId;

                    self.form.appendChild(iframe);
                    self.iframe = iframe;
                }

                initIframe();

                // escape \n to prevent it from being converted into \r\n by some UAs
                // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
                data = data.replace(rEscapedNewline, '\\\n');
                this.area.value = data.replace(rNewline, '\\n');

                try {
                    this.form.submit();
                } catch (e) {
                }

                if (this.iframe.attachEvent) {
                    this.iframe.onreadystatechange = function () {
                        if (self.iframe.readyState === 'complete') {
                            complete();
                        }
                    };
                } else {
                    this.iframe.onload = complete;
                }
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {"./polling": 18, "component-inherit": 8}],
    17: [function (require, module, exports) {
        (function (global) {
            /**
             * Module requirements.
             */

            var XMLHttpRequest = require('xmlhttprequest-ssl');
            var Polling = require('./polling');
            var Emitter = require('component-emitter');
            var inherit = require('component-inherit');
            var debug = require('debug')('engine.io-client:polling-xhr');

            /**
             * Module exports.
             */

            module.exports = XHR;
            module.exports.Request = Request;

            /**
             * Empty function
             */

            function empty() {
            }

            /**
             * XHR Polling constructor.
             *
             * @param {Object} opts
             * @api public
             */

            function XHR(opts) {
                Polling.call(this, opts);
                this.requestTimeout = opts.requestTimeout;
                this.extraHeaders = opts.extraHeaders;

                if (global.location) {
                    var isSSL = 'https:' === location.protocol;
                    var port = location.port;

                    // some user agents have empty `location.port`
                    if (!port) {
                        port = isSSL ? 443 : 80;
                    }

                    this.xd = opts.hostname !== global.location.hostname ||
                        port !== opts.port;
                    this.xs = opts.secure !== isSSL;
                }
            }

            /**
             * Inherits from Polling.
             */

            inherit(XHR, Polling);

            /**
             * XHR supports binary
             */

            XHR.prototype.supportsBinary = true;

            /**
             * Creates a request.
             *
             * @param {String} method
             * @api private
             */

            XHR.prototype.request = function (opts) {
                opts = opts || {};
                opts.uri = this.uri();
                opts.xd = this.xd;
                opts.xs = this.xs;
                opts.agent = this.agent || false;
                opts.supportsBinary = this.supportsBinary;
                opts.enablesXDR = this.enablesXDR;

                // SSL options for Node.js client
                opts.pfx = this.pfx;
                opts.key = this.key;
                opts.passphrase = this.passphrase;
                opts.cert = this.cert;
                opts.ca = this.ca;
                opts.ciphers = this.ciphers;
                opts.rejectUnauthorized = this.rejectUnauthorized;
                opts.requestTimeout = this.requestTimeout;

                // other options for Node.js client
                opts.extraHeaders = this.extraHeaders;

                return new Request(opts);
            };

            /**
             * Sends data.
             *
             * @param {String} data to send.
             * @param {Function} called upon flush.
             * @api private
             */

            XHR.prototype.doWrite = function (data, fn) {
                var isBinary = typeof data !== 'string' && data !== undefined;
                var req = this.request({method: 'POST', data: data, isBinary: isBinary});
                var self = this;
                req.on('success', fn);
                req.on('error', function (err) {
                    self.onError('xhr post error', err);
                });
                this.sendXhr = req;
            };

            /**
             * Starts a poll cycle.
             *
             * @api private
             */

            XHR.prototype.doPoll = function () {
                debug('xhr poll');
                var req = this.request();
                var self = this;
                req.on('data', function (data) {
                    self.onData(data);
                });
                req.on('error', function (err) {
                    self.onError('xhr poll error', err);
                });
                this.pollXhr = req;
            };

            /**
             * Request constructor
             *
             * @param {Object} options
             * @api public
             */

            function Request(opts) {
                this.method = opts.method || 'GET';
                this.uri = opts.uri;
                this.xd = !!opts.xd;
                this.xs = !!opts.xs;
                this.async = false !== opts.async;
                this.data = undefined !== opts.data ? opts.data : null;
                this.agent = opts.agent;
                this.isBinary = opts.isBinary;
                this.supportsBinary = opts.supportsBinary;
                this.enablesXDR = opts.enablesXDR;
                this.requestTimeout = opts.requestTimeout;

                // SSL options for Node.js client
                this.pfx = opts.pfx;
                this.key = opts.key;
                this.passphrase = opts.passphrase;
                this.cert = opts.cert;
                this.ca = opts.ca;
                this.ciphers = opts.ciphers;
                this.rejectUnauthorized = opts.rejectUnauthorized;

                // other options for Node.js client
                this.extraHeaders = opts.extraHeaders;

                this.create();
            }

            /**
             * Mix in `Emitter`.
             */

            Emitter(Request.prototype);

            /**
             * Creates the XHR object and sends the request.
             *
             * @api private
             */

            Request.prototype.create = function () {
                var opts = {agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR};

                // SSL options for Node.js client
                opts.pfx = this.pfx;
                opts.key = this.key;
                opts.passphrase = this.passphrase;
                opts.cert = this.cert;
                opts.ca = this.ca;
                opts.ciphers = this.ciphers;
                opts.rejectUnauthorized = this.rejectUnauthorized;

                var xhr = this.xhr = new XMLHttpRequest(opts);
                var self = this;

                try {
                    debug('xhr open %s: %s', this.method, this.uri);
                    xhr.open(this.method, this.uri, this.async);
                    try {
                        if (this.extraHeaders) {
                            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                            for (var i in this.extraHeaders) {
                                if (this.extraHeaders.hasOwnProperty(i)) {
                                    xhr.setRequestHeader(i, this.extraHeaders[i]);
                                }
                            }
                        }
                    } catch (e) {
                    }

                    if ('POST' === this.method) {
                        try {
                            if (this.isBinary) {
                                xhr.setRequestHeader('Content-type', 'application/octet-stream');
                            } else {
                                xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
                            }
                        } catch (e) {
                        }
                    }

                    try {
                        xhr.setRequestHeader('Accept', '*/*');
                    } catch (e) {
                    }

                    // ie6 check
                    if ('withCredentials' in xhr) {
                        xhr.withCredentials = true;
                    }

                    if (this.requestTimeout) {
                        xhr.timeout = this.requestTimeout;
                    }

                    if (this.hasXDR()) {
                        xhr.onload = function () {
                            self.onLoad();
                        };
                        xhr.onerror = function () {
                            self.onError(xhr.responseText);
                        };
                    } else {
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 2) {
                                try {
                                    var contentType = xhr.getResponseHeader('Content-Type');
                                    if (self.supportsBinary && contentType === 'application/octet-stream') {
                                        xhr.responseType = 'arraybuffer';
                                    }
                                } catch (e) {
                                }
                            }
                            if (4 !== xhr.readyState) return;
                            if (200 === xhr.status || 1223 === xhr.status) {
                                self.onLoad();
                            } else {
                                // make sure the `error` event handler that's user-set
                                // does not throw in the same tick and gets caught here
                                setTimeout(function () {
                                    self.onError(xhr.status);
                                }, 0);
                            }
                        };
                    }

                    debug('xhr data %s', this.data);
                    xhr.send(this.data);
                } catch (e) {
                    // Need to defer since .create() is called directly fhrom the constructor
                    // and thus the 'error' event can only be only bound *after* this exception
                    // occurs.  Therefore, also, we cannot throw here at all.
                    setTimeout(function () {
                        self.onError(e);
                    }, 0);
                    return;
                }

                if (global.document) {
                    this.index = Request.requestsCount++;
                    Request.requests[this.index] = this;
                }
            };

            /**
             * Called upon successful response.
             *
             * @api private
             */

            Request.prototype.onSuccess = function () {
                this.emit('success');
                this.cleanup();
            };

            /**
             * Called if we have data.
             *
             * @api private
             */

            Request.prototype.onData = function (data) {
                this.emit('data', data);
                this.onSuccess();
            };

            /**
             * Called upon error.
             *
             * @api private
             */

            Request.prototype.onError = function (err) {
                this.emit('error', err);
                this.cleanup(true);
            };

            /**
             * Cleans up house.
             *
             * @api private
             */

            Request.prototype.cleanup = function (fromError) {
                if ('undefined' === typeof this.xhr || null === this.xhr) {
                    return;
                }
                // xmlhttprequest
                if (this.hasXDR()) {
                    this.xhr.onload = this.xhr.onerror = empty;
                } else {
                    this.xhr.onreadystatechange = empty;
                }

                if (fromError) {
                    try {
                        this.xhr.abort();
                    } catch (e) {
                    }
                }

                if (global.document) {
                    delete Request.requests[this.index];
                }

                this.xhr = null;
            };

            /**
             * Called upon load.
             *
             * @api private
             */

            Request.prototype.onLoad = function () {
                var data;
                try {
                    var contentType;
                    try {
                        contentType = this.xhr.getResponseHeader('Content-Type');
                    } catch (e) {
                    }
                    if (contentType === 'application/octet-stream') {
                        data = this.xhr.response || this.xhr.responseText;
                    } else {
                        data = this.xhr.responseText;
                    }
                } catch (e) {
                    this.onError(e);
                }
                if (null != data) {
                    this.onData(data);
                }
            };

            /**
             * Check if it has XDomainRequest.
             *
             * @api private
             */

            Request.prototype.hasXDR = function () {
                return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
            };

            /**
             * Aborts the request.
             *
             * @api public
             */

            Request.prototype.abort = function () {
                this.cleanup();
            };

            /**
             * Aborts pending requests when unloading the window. This is needed to prevent
             * memory leaks (e.g. when using IE) and to ensure that no spurious error is
             * emitted.
             */

            Request.requestsCount = 0;
            Request.requests = {};

            if (global.document) {
                if (global.attachEvent) {
                    global.attachEvent('onunload', unloadHandler);
                } else if (global.addEventListener) {
                    global.addEventListener('beforeunload', unloadHandler, false);
                }
            }

            function unloadHandler() {
                for (var i in Request.requests) {
                    if (Request.requests.hasOwnProperty(i)) {
                        Request.requests[i].abort();
                    }
                }
            }

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {"./polling": 18, "component-emitter": 7, "component-inherit": 8, "debug": 10, "xmlhttprequest-ssl": 20}],
    18: [function (require, module, exports) {
        /**
         * Module dependencies.
         */

        var Transport = require('../transport');
        var parseqs = require('parseqs');
        var parser = require('engine.io-parser');
        var inherit = require('component-inherit');
        var yeast = require('yeast');
        var debug = require('debug')('engine.io-client:polling');

        /**
         * Module exports.
         */

        module.exports = Polling;

        /**
         * Is XHR2 supported?
         */

        var hasXHR2 = (function () {
            var XMLHttpRequest = require('xmlhttprequest-ssl');
            var xhr = new XMLHttpRequest({xdomain: false});
            return null != xhr.responseType;
        })();

        /**
         * Polling interface.
         *
         * @param {Object} opts
         * @api private
         */

        function Polling(opts) {
            var forceBase64 = (opts && opts.forceBase64);
            if (!hasXHR2 || forceBase64) {
                this.supportsBinary = false;
            }
            Transport.call(this, opts);
        }

        /**
         * Inherits from Transport.
         */

        inherit(Polling, Transport);

        /**
         * Transport name.
         */

        Polling.prototype.name = 'polling';

        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @api private
         */

        Polling.prototype.doOpen = function () {
            this.poll();
        };

        /**
         * Pauses polling.
         *
         * @param {Function} callback upon buffers are flushed and transport is paused
         * @api private
         */

        Polling.prototype.pause = function (onPause) {
            var self = this;

            this.readyState = 'pausing';

            function pause() {
                debug('paused');
                self.readyState = 'paused';
                onPause();
            }

            if (this.polling || !this.writable) {
                var total = 0;

                if (this.polling) {
                    debug('we are currently polling - waiting to pause');
                    total++;
                    this.once('pollComplete', function () {
                        debug('pre-pause polling complete');
                        --total || pause();
                    });
                }

                if (!this.writable) {
                    debug('we are currently writing - waiting to pause');
                    total++;
                    this.once('drain', function () {
                        debug('pre-pause writing complete');
                        --total || pause();
                    });
                }
            } else {
                pause();
            }
        };

        /**
         * Starts polling cycle.
         *
         * @api public
         */

        Polling.prototype.poll = function () {
            debug('polling');
            this.polling = true;
            this.doPoll();
            this.emit('poll');
        };

        /**
         * Overloads onData to detect payloads.
         *
         * @api private
         */

        Polling.prototype.onData = function (data) {
            var self = this;
            debug('polling got data %s', data);
            var callback = function (packet, index, total) {
                // if its the first message we consider the transport open
                if ('opening' === self.readyState) {
                    self.onOpen();
                }

                // if its a close packet, we close the ongoing requests
                if ('close' === packet.type) {
                    self.onClose();
                    return false;
                }

                // otherwise bypass onData and handle the message
                self.onPacket(packet);
            };

            // decode payload
            parser.decodePayload(data, this.socket.binaryType, callback);

            // if an event did not trigger closing
            if ('closed' !== this.readyState) {
                // if we got data we're not polling
                this.polling = false;
                this.emit('pollComplete');

                if ('open' === this.readyState) {
                    this.poll();
                } else {
                    debug('ignoring poll - transport state "%s"', this.readyState);
                }
            }
        };

        /**
         * For polling, send a close packet.
         *
         * @api private
         */

        Polling.prototype.doClose = function () {
            var self = this;

            function close() {
                debug('writing close packet');
                self.write([{type: 'close'}]);
            }

            if ('open' === this.readyState) {
                debug('transport open - closing');
                close();
            } else {
                // in case we're trying to close while
                // handshaking is in progress (GH-164)
                debug('transport not open - deferring close');
                this.once('open', close);
            }
        };

        /**
         * Writes a packets payload.
         *
         * @param {Array} data packets
         * @param {Function} drain callback
         * @api private
         */

        Polling.prototype.write = function (packets) {
            var self = this;
            this.writable = false;
            var callbackfn = function () {
                self.writable = true;
                self.emit('drain');
            };

            parser.encodePayload(packets, this.supportsBinary, function (data) {
                self.doWrite(data, callbackfn);
            });
        };

        /**
         * Generates uri for connection.
         *
         * @api private
         */

        Polling.prototype.uri = function () {
            var query = this.query || {};
            var schema = this.secure ? 'https' : 'http';
            var port = '';

            // cache busting is forced
            if (false !== this.timestampRequests) {
                query[this.timestampParam] = yeast();
            }

            if (!this.supportsBinary && !query.sid) {
                query.b64 = 1;
            }

            query = parseqs.encode(query);

            // avoid port if default for schema
            if (this.port && (('https' === schema && Number(this.port) !== 443) ||
                ('http' === schema && Number(this.port) !== 80))) {
                port = ':' + this.port;
            }

            // prepend ? to query
            if (query.length) {
                query = '?' + query;
            }

            var ipv6 = this.hostname.indexOf(':') !== -1;
            return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
        };

    }, {
        "../transport": 14,
        "component-inherit": 8,
        "debug": 10,
        "engine.io-parser": 21,
        "parseqs": 31,
        "xmlhttprequest-ssl": 20,
        "yeast": 44
    }],
    19: [function (require, module, exports) {
        (function (global) {
            /**
             * Module dependencies.
             */

            var Transport = require('../transport');
            var parser = require('engine.io-parser');
            var parseqs = require('parseqs');
            var inherit = require('component-inherit');
            var yeast = require('yeast');
            var debug = require('debug')('engine.io-client:websocket');
            var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
            var NodeWebSocket;
            if (typeof window === 'undefined') {
                try {
                    NodeWebSocket = require('ws');
                } catch (e) {
                }
            }

            /**
             * Get either the `WebSocket` or `MozWebSocket` globals
             * in the browser or try to resolve WebSocket-compatible
             * interface exposed by `ws` for Node-like environment.
             */

            var WebSocket = BrowserWebSocket;
            if (!WebSocket && typeof window === 'undefined') {
                WebSocket = NodeWebSocket;
            }

            /**
             * Module exports.
             */

            module.exports = WS;

            /**
             * WebSocket transport constructor.
             *
             * @api {Object} connection options
             * @api public
             */

            function WS(opts) {
                var forceBase64 = (opts && opts.forceBase64);
                if (forceBase64) {
                    this.supportsBinary = false;
                }
                this.perMessageDeflate = opts.perMessageDeflate;
                this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
                this.protocols = opts.protocols;
                if (!this.usingBrowserWebSocket) {
                    WebSocket = NodeWebSocket;
                }
                Transport.call(this, opts);
            }

            /**
             * Inherits from Transport.
             */

            inherit(WS, Transport);

            /**
             * Transport name.
             *
             * @api public
             */

            WS.prototype.name = 'websocket';

            /*
 * WebSockets support binary
 */

            WS.prototype.supportsBinary = true;

            /**
             * Opens socket.
             *
             * @api private
             */

            WS.prototype.doOpen = function () {
                if (!this.check()) {
                    // let probe timeout
                    return;
                }

                var uri = this.uri();
                var protocols = this.protocols;
                var opts = {
                    agent: this.agent,
                    perMessageDeflate: this.perMessageDeflate
                };

                // SSL options for Node.js client
                opts.pfx = this.pfx;
                opts.key = this.key;
                opts.passphrase = this.passphrase;
                opts.cert = this.cert;
                opts.ca = this.ca;
                opts.ciphers = this.ciphers;
                opts.rejectUnauthorized = this.rejectUnauthorized;
                if (this.extraHeaders) {
                    opts.headers = this.extraHeaders;
                }
                if (this.localAddress) {
                    opts.localAddress = this.localAddress;
                }

                try {
                    this.ws = this.usingBrowserWebSocket ? (protocols ? new WebSocket(uri, protocols) : new WebSocket(uri)) : new WebSocket(uri, protocols, opts);
                } catch (err) {
                    return this.emit('error', err);
                }

                if (this.ws.binaryType === undefined) {
                    this.supportsBinary = false;
                }

                if (this.ws.supports && this.ws.supports.binary) {
                    this.supportsBinary = true;
                    this.ws.binaryType = 'nodebuffer';
                } else {
                    this.ws.binaryType = 'arraybuffer';
                }

                this.addEventListeners();
            };

            /**
             * Adds event listeners to the socket
             *
             * @api private
             */

            WS.prototype.addEventListeners = function () {
                var self = this;

                this.ws.onopen = function () {
                    self.onOpen();
                };
                this.ws.onclose = function () {
                    self.onClose();
                };
                this.ws.onmessage = function (ev) {
                    self.onData(ev.data);
                };
                this.ws.onerror = function (e) {
                    self.onError('websocket error', e);
                };
            };

            /**
             * Writes data to socket.
             *
             * @param {Array} array of packets.
             * @api private
             */

            WS.prototype.write = function (packets) {
                var self = this;
                this.writable = false;

                // encodePacket efficient as it uses WS framing
                // no need for encodePayload
                var total = packets.length;
                for (var i = 0, l = total; i < l; i++) {
                    (function (packet) {
                        parser.encodePacket(packet, self.supportsBinary, function (data) {
                            if (!self.usingBrowserWebSocket) {
                                // always create a new object (GH-437)
                                var opts = {};
                                if (packet.options) {
                                    opts.compress = packet.options.compress;
                                }

                                if (self.perMessageDeflate) {
                                    var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
                                    if (len < self.perMessageDeflate.threshold) {
                                        opts.compress = false;
                                    }
                                }
                            }

                            // Sometimes the websocket has already been closed but the browser didn't
                            // have a chance of informing us about it yet, in that case send will
                            // throw an error
                            try {
                                if (self.usingBrowserWebSocket) {
                                    // TypeError is thrown when passing the second argument on Safari
                                    self.ws.send(data);
                                } else {
                                    self.ws.send(data, opts);
                                }
                            } catch (e) {
                                debug('websocket closed before onclose event');
                            }

                            --total || done();
                        });
                    })(packets[i]);
                }

                function done() {
                    self.emit('flush');

                    // fake drain
                    // defer to next tick to allow Socket to clear writeBuffer
                    setTimeout(function () {
                        self.writable = true;
                        self.emit('drain');
                    }, 0);
                }
            };

            /**
             * Called upon close
             *
             * @api private
             */

            WS.prototype.onClose = function () {
                Transport.prototype.onClose.call(this);
            };

            /**
             * Closes socket.
             *
             * @api private
             */

            WS.prototype.doClose = function () {
                if (typeof this.ws !== 'undefined') {
                    this.ws.close();
                }
            };

            /**
             * Generates uri for connection.
             *
             * @api private
             */

            WS.prototype.uri = function () {
                var query = this.query || {};
                var schema = this.secure ? 'wss' : 'ws';
                var port = '';

                // avoid port if default for schema
                if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
                    ('ws' === schema && Number(this.port) !== 80))) {
                    port = ':' + this.port;
                }

                // append timestamp to URI
                if (this.timestampRequests) {
                    query[this.timestampParam] = yeast();
                }

                // communicate binary support capabilities
                if (!this.supportsBinary) {
                    query.b64 = 1;
                }

                query = parseqs.encode(query);

                // prepend ? to query
                if (query.length) {
                    query = '?' + query;
                }

                var ipv6 = this.hostname.indexOf(':') !== -1;
                return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
            };

            /**
             * Feature detection for WebSocket.
             *
             * @return {Boolean} whether this transport is available.
             * @api public
             */

            WS.prototype.check = function () {
                return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
        "../transport": 14,
        "component-inherit": 8,
        "debug": 10,
        "engine.io-parser": 21,
        "parseqs": 31,
        "ws": 47,
        "yeast": 44
    }],
    20: [function (require, module, exports) {
        (function (global) {
// browser shim for xmlhttprequest module

            var hasCORS = require('has-cors');

            module.exports = function (opts) {
                var xdomain = opts.xdomain;

                // scheme must be same when usign XDomainRequest
                // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
                var xscheme = opts.xscheme;

                // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
                // https://github.com/Automattic/engine.io-client/pull/217
                var enablesXDR = opts.enablesXDR;

                // XMLHttpRequest can be disabled on IE
                try {
                    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
                        return new XMLHttpRequest();
                    }
                } catch (e) {
                }

                // Use XDomainRequest for IE8 if enablesXDR is true
                // because loading bar keeps flashing when using jsonp-polling
                // https://github.com/yujiosaka/socke.io-ie8-loading-example
                try {
                    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
                        return new XDomainRequest();
                    }
                } catch (e) {
                }

                if (!xdomain) {
                    try {
                        return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
                    } catch (e) {
                    }
                }
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {"has-cors": 26}],
    21: [function (require, module, exports) {
        (function (global) {
            /**
             * Module dependencies.
             */

            var keys = require('./keys');
            var hasBinary = require('has-binary2');
            var sliceBuffer = require('arraybuffer.slice');
            var after = require('after');
            var utf8 = require('./utf8');

            var base64encoder;
            if (global && global.ArrayBuffer) {
                base64encoder = require('base64-arraybuffer');
            }

            /**
             * Check if we are running an android browser. That requires us to use
             * ArrayBuffer with polling transports...
             *
             * http://ghinda.net/jpeg-blob-ajax-android/
             */

            var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

            /**
             * Check if we are running in PhantomJS.
             * Uploading a Blob with PhantomJS does not work correctly, as reported here:
             * https://github.com/ariya/phantomjs/issues/11395
             * @type boolean
             */
            var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

            /**
             * When true, avoids using Blobs to encode payloads.
             * @type boolean
             */
            var dontSendBlobs = isAndroid || isPhantomJS;

            /**
             * Current protocol version.
             */

            exports.protocol = 3;

            /**
             * Packet types.
             */

            var packets = exports.packets = {
                open: 0    // non-ws
                , close: 1    // non-ws
                , ping: 2
                , pong: 3
                , message: 4
                , upgrade: 5
                , noop: 6
            };

            var packetslist = keys(packets);

            /**
             * Premade error packet.
             */

            var err = {type: 'error', data: 'parser error'};

            /**
             * Create a blob api even for blob builder when vendor prefixes exist
             */

            var Blob = require('blob');

            /**
             * Encodes a packet.
             *
             *     <packet type id> [ <data> ]
             *
             * Example:
             *
             *     5hello world
             *     3
             *     4
             *
             * Binary is encoded in an identical principle
             *
             * @api private
             */

            exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
                if (typeof supportsBinary === 'function') {
                    callback = supportsBinary;
                    supportsBinary = false;
                }

                if (typeof utf8encode === 'function') {
                    callback = utf8encode;
                    utf8encode = null;
                }

                var data = (packet.data === undefined)
                    ? undefined
                    : packet.data.buffer || packet.data;

                if (global.ArrayBuffer && data instanceof ArrayBuffer) {
                    return encodeArrayBuffer(packet, supportsBinary, callback);
                } else if (Blob && data instanceof global.Blob) {
                    return encodeBlob(packet, supportsBinary, callback);
                }

                // might be an object with { base64: true, data: dataAsBase64String }
                if (data && data.base64) {
                    return encodeBase64Object(packet, callback);
                }

                // Sending data as a utf-8 string
                var encoded = packets[packet.type];

                // data fragment is optional
                if (undefined !== packet.data) {
                    encoded += utf8encode ? utf8.encode(String(packet.data), {strict: false}) : String(packet.data);
                }

                return callback('' + encoded);

            };

            function encodeBase64Object(packet, callback) {
                // packet data is an object { base64: true, data: dataAsBase64String }
                var message = 'b' + exports.packets[packet.type] + packet.data.data;
                return callback(message);
            }

            /**
             * Encode packet helpers for binary types
             */

            function encodeArrayBuffer(packet, supportsBinary, callback) {
                if (!supportsBinary) {
                    return exports.encodeBase64Packet(packet, callback);
                }

                var data = packet.data;
                var contentArray = new Uint8Array(data);
                var resultBuffer = new Uint8Array(1 + data.byteLength);

                resultBuffer[0] = packets[packet.type];
                for (var i = 0; i < contentArray.length; i++) {
                    resultBuffer[i + 1] = contentArray[i];
                }

                return callback(resultBuffer.buffer);
            }

            function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
                if (!supportsBinary) {
                    return exports.encodeBase64Packet(packet, callback);
                }

                var fr = new FileReader();
                fr.onload = function () {
                    packet.data = fr.result;
                    exports.encodePacket(packet, supportsBinary, true, callback);
                };
                return fr.readAsArrayBuffer(packet.data);
            }

            function encodeBlob(packet, supportsBinary, callback) {
                if (!supportsBinary) {
                    return exports.encodeBase64Packet(packet, callback);
                }

                if (dontSendBlobs) {
                    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
                }

                var length = new Uint8Array(1);
                length[0] = packets[packet.type];
                var blob = new Blob([length.buffer, packet.data]);

                return callback(blob);
            }

            /**
             * Encodes a packet with binary data in a base64 string
             *
             * @param {Object} packet, has `type` and `data`
             * @return {String} base64 encoded message
             */

            exports.encodeBase64Packet = function (packet, callback) {
                var message = 'b' + exports.packets[packet.type];
                if (Blob && packet.data instanceof global.Blob) {
                    var fr = new FileReader();
                    fr.onload = function () {
                        var b64 = fr.result.split(',')[1];
                        callback(message + b64);
                    };
                    return fr.readAsDataURL(packet.data);
                }

                var b64data;
                try {
                    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
                } catch (e) {
                    // iPhone Safari doesn't let you apply with typed arrays
                    var typed = new Uint8Array(packet.data);
                    var basic = new Array(typed.length);
                    for (var i = 0; i < typed.length; i++) {
                        basic[i] = typed[i];
                    }
                    b64data = String.fromCharCode.apply(null, basic);
                }
                message += global.btoa(b64data);
                return callback(message);
            };

            /**
             * Decodes a packet. Changes format to Blob if requested.
             *
             * @return {Object} with `type` and `data` (if any)
             * @api private
             */

            exports.decodePacket = function (data, binaryType, utf8decode) {
                if (data === undefined) {
                    return err;
                }
                // String data
                if (typeof data === 'string') {
                    if (data.charAt(0) === 'b') {
                        return exports.decodeBase64Packet(data.substr(1), binaryType);
                    }

                    if (utf8decode) {
                        data = tryDecode(data);
                        if (data === false) {
                            return err;
                        }
                    }
                    var type = data.charAt(0);

                    if (Number(type) != type || !packetslist[type]) {
                        return err;
                    }

                    if (data.length > 1) {
                        return {type: packetslist[type], data: data.substring(1)};
                    } else {
                        return {type: packetslist[type]};
                    }
                }

                var asArray = new Uint8Array(data);
                var type = asArray[0];
                var rest = sliceBuffer(data, 1);
                if (Blob && binaryType === 'blob') {
                    rest = new Blob([rest]);
                }
                return {type: packetslist[type], data: rest};
            };

            function tryDecode(data) {
                try {
                    data = utf8.decode(data, {strict: false});
                } catch (e) {
                    return false;
                }
                return data;
            }

            /**
             * Decodes a packet encoded in a base64 string
             *
             * @param {String} base64 encoded message
             * @return {Object} with `type` and `data` (if any)
             */

            exports.decodeBase64Packet = function (msg, binaryType) {
                var type = packetslist[msg.charAt(0)];
                if (!base64encoder) {
                    return {type: type, data: {base64: true, data: msg.substr(1)}};
                }

                var data = base64encoder.decode(msg.substr(1));

                if (binaryType === 'blob' && Blob) {
                    data = new Blob([data]);
                }

                return {type: type, data: data};
            };

            /**
             * Encodes multiple messages (payload).
             *
             *     <length>:data
             *
             * Example:
             *
             *     11:hello world2:hi
             *
             * If any contents are binary, they will be encoded as base64 strings. Base64
             * encoded strings are marked with a b before the length specifier
             *
             * @param {Array} packets
             * @api private
             */

            exports.encodePayload = function (packets, supportsBinary, callback) {
                if (typeof supportsBinary === 'function') {
                    callback = supportsBinary;
                    supportsBinary = null;
                }

                var isBinary = hasBinary(packets);

                if (supportsBinary && isBinary) {
                    if (Blob && !dontSendBlobs) {
                        return exports.encodePayloadAsBlob(packets, callback);
                    }

                    return exports.encodePayloadAsArrayBuffer(packets, callback);
                }

                if (!packets.length) {
                    return callback('0:');
                }

                function setLengthHeader(message) {
                    return message.length + ':' + message;
                }

                function encodeOne(packet, doneCallback) {
                    exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function (message) {
                        doneCallback(null, setLengthHeader(message));
                    });
                }

                map(packets, encodeOne, function (err, results) {
                    return callback(results.join(''));
                });
            };

            /**
             * Async array map using after
             */

            function map(ary, each, done) {
                var result = new Array(ary.length);
                var next = after(ary.length, done);

                var eachWithIndex = function (i, el, cb) {
                    each(el, function (error, msg) {
                        result[i] = msg;
                        cb(error, result);
                    });
                };

                for (var i = 0; i < ary.length; i++) {
                    eachWithIndex(i, ary[i], next);
                }
            }

            /*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

            exports.decodePayload = function (data, binaryType, callback) {
                if (typeof data !== 'string') {
                    return exports.decodePayloadAsBinary(data, binaryType, callback);
                }

                if (typeof binaryType === 'function') {
                    callback = binaryType;
                    binaryType = null;
                }

                var packet;
                if (data === '') {
                    // parser error - ignoring payload
                    return callback(err, 0, 1);
                }

                var length = '', n, msg;

                for (var i = 0, l = data.length; i < l; i++) {
                    var chr = data.charAt(i);

                    if (chr !== ':') {
                        length += chr;
                        continue;
                    }

                    if (length === '' || (length != (n = Number(length)))) {
                        // parser error - ignoring payload
                        return callback(err, 0, 1);
                    }

                    msg = data.substr(i + 1, n);

                    if (length != msg.length) {
                        // parser error - ignoring payload
                        return callback(err, 0, 1);
                    }

                    if (msg.length) {
                        packet = exports.decodePacket(msg, binaryType, false);

                        if (err.type === packet.type && err.data === packet.data) {
                            // parser error in individual packet - ignoring payload
                            return callback(err, 0, 1);
                        }

                        var ret = callback(packet, i + n, l);
                        if (false === ret) return;
                    }

                    // advance cursor
                    i += n;
                    length = '';
                }

                if (length !== '') {
                    // parser error - ignoring payload
                    return callback(err, 0, 1);
                }

            };

            /**
             * Encodes multiple messages (payload) as binary.
             *
             * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
             * 255><data>
             *
             * Example:
             * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
             *
             * @param {Array} packets
             * @return {ArrayBuffer} encoded payload
             * @api private
             */

            exports.encodePayloadAsArrayBuffer = function (packets, callback) {
                if (!packets.length) {
                    return callback(new ArrayBuffer(0));
                }

                function encodeOne(packet, doneCallback) {
                    exports.encodePacket(packet, true, true, function (data) {
                        return doneCallback(null, data);
                    });
                }

                map(packets, encodeOne, function (err, encodedPackets) {
                    var totalLength = encodedPackets.reduce(function (acc, p) {
                        var len;
                        if (typeof p === 'string') {
                            len = p.length;
                        } else {
                            len = p.byteLength;
                        }
                        return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
                    }, 0);

                    var resultArray = new Uint8Array(totalLength);

                    var bufferIndex = 0;
                    encodedPackets.forEach(function (p) {
                        var isString = typeof p === 'string';
                        var ab = p;
                        if (isString) {
                            var view = new Uint8Array(p.length);
                            for (var i = 0; i < p.length; i++) {
                                view[i] = p.charCodeAt(i);
                            }
                            ab = view.buffer;
                        }

                        if (isString) { // not true binary
                            resultArray[bufferIndex++] = 0;
                        } else { // true binary
                            resultArray[bufferIndex++] = 1;
                        }

                        var lenStr = ab.byteLength.toString();
                        for (var i = 0; i < lenStr.length; i++) {
                            resultArray[bufferIndex++] = parseInt(lenStr[i]);
                        }
                        resultArray[bufferIndex++] = 255;

                        var view = new Uint8Array(ab);
                        for (var i = 0; i < view.length; i++) {
                            resultArray[bufferIndex++] = view[i];
                        }
                    });

                    return callback(resultArray.buffer);
                });
            };

            /**
             * Encode as Blob
             */

            exports.encodePayloadAsBlob = function (packets, callback) {
                function encodeOne(packet, doneCallback) {
                    exports.encodePacket(packet, true, true, function (encoded) {
                        var binaryIdentifier = new Uint8Array(1);
                        binaryIdentifier[0] = 1;
                        if (typeof encoded === 'string') {
                            var view = new Uint8Array(encoded.length);
                            for (var i = 0; i < encoded.length; i++) {
                                view[i] = encoded.charCodeAt(i);
                            }
                            encoded = view.buffer;
                            binaryIdentifier[0] = 0;
                        }

                        var len = (encoded instanceof ArrayBuffer)
                            ? encoded.byteLength
                            : encoded.size;

                        var lenStr = len.toString();
                        var lengthAry = new Uint8Array(lenStr.length + 1);
                        for (var i = 0; i < lenStr.length; i++) {
                            lengthAry[i] = parseInt(lenStr[i]);
                        }
                        lengthAry[lenStr.length] = 255;

                        if (Blob) {
                            var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
                            doneCallback(null, blob);
                        }
                    });
                }

                map(packets, encodeOne, function (err, results) {
                    return callback(new Blob(results));
                });
            };

            /*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

            exports.decodePayloadAsBinary = function (data, binaryType, callback) {
                if (typeof binaryType === 'function') {
                    callback = binaryType;
                    binaryType = null;
                }

                var bufferTail = data;
                var buffers = [];

                while (bufferTail.byteLength > 0) {
                    var tailArray = new Uint8Array(bufferTail);
                    var isString = tailArray[0] === 0;
                    var msgLength = '';

                    for (var i = 1; ; i++) {
                        if (tailArray[i] === 255) break;

                        // 310 = char length of Number.MAX_VALUE
                        if (msgLength.length > 310) {
                            return callback(err, 0, 1);
                        }

                        msgLength += tailArray[i];
                    }

                    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
                    msgLength = parseInt(msgLength);

                    var msg = sliceBuffer(bufferTail, 0, msgLength);
                    if (isString) {
                        try {
                            msg = String.fromCharCode.apply(null, new Uint8Array(msg));
                        } catch (e) {
                            // iPhone Safari doesn't let you apply to typed arrays
                            var typed = new Uint8Array(msg);
                            msg = '';
                            for (var i = 0; i < typed.length; i++) {
                                msg += String.fromCharCode(typed[i]);
                            }
                        }
                    }

                    buffers.push(msg);
                    bufferTail = sliceBuffer(bufferTail, msgLength);
                }

                var total = buffers.length;
                buffers.forEach(function (buffer, i) {
                    callback(exports.decodePacket(buffer, binaryType, true), i, total);
                });
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
        "./keys": 22,
        "./utf8": 23,
        "after": 1,
        "arraybuffer.slice": 2,
        "base64-arraybuffer": 4,
        "blob": 5,
        "has-binary2": 24
    }],
    22: [function (require, module, exports) {

        /**
         * Gets the keys for an object.
         *
         * @return {Array} keys
         * @api private
         */

        module.exports = Object.keys || function keys(obj) {
            var arr = [];
            var has = Object.prototype.hasOwnProperty;

            for (var i in obj) {
                if (has.call(obj, i)) {
                    arr.push(i);
                }
            }
            return arr;
        };

    }, {}],
    23: [function (require, module, exports) {
        (function (global) {
            /*! https://mths.be/utf8js v2.1.2 by @mathias */
            (function (root) {

                // Detect free variables `exports`
                var freeExports = typeof exports == 'object' && exports;

                // Detect free variable `module`
                var freeModule = typeof module == 'object' && module &&
                    module.exports == freeExports && module;

                // Detect free variable `global`, from Node.js or Browserified code,
                // and use it as `root`
                var freeGlobal = typeof global == 'object' && global;
                if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
                    root = freeGlobal;
                }

                /*--------------------------------------------------------------------------*/

                var stringFromCharCode = String.fromCharCode;

                // Taken from https://mths.be/punycode
                function ucs2decode(string) {
                    var output = [];
                    var counter = 0;
                    var length = string.length;
                    var value;
                    var extra;
                    while (counter < length) {
                        value = string.charCodeAt(counter++);
                        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                            // high surrogate, and there is a next character
                            extra = string.charCodeAt(counter++);
                            if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                            } else {
                                // unmatched surrogate; only append this code unit, in case the next
                                // code unit is the high surrogate of a surrogate pair
                                output.push(value);
                                counter--;
                            }
                        } else {
                            output.push(value);
                        }
                    }
                    return output;
                }

                // Taken from https://mths.be/punycode
                function ucs2encode(array) {
                    var length = array.length;
                    var index = -1;
                    var value;
                    var output = '';
                    while (++index < length) {
                        value = array[index];
                        if (value > 0xFFFF) {
                            value -= 0x10000;
                            output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                            value = 0xDC00 | value & 0x3FF;
                        }
                        output += stringFromCharCode(value);
                    }
                    return output;
                }

                function checkScalarValue(codePoint, strict) {
                    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
                        if (strict) {
                            throw Error(
                                'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
                                ' is not a scalar value'
                            );
                        }
                        return false;
                    }
                    return true;
                }

                /*--------------------------------------------------------------------------*/

                function createByte(codePoint, shift) {
                    return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
                }

                function encodeCodePoint(codePoint, strict) {
                    if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
                        return stringFromCharCode(codePoint);
                    }
                    var symbol = '';
                    if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
                        symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
                    }
                    else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
                        if (!checkScalarValue(codePoint, strict)) {
                            codePoint = 0xFFFD;
                        }
                        symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
                        symbol += createByte(codePoint, 6);
                    }
                    else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
                        symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
                        symbol += createByte(codePoint, 12);
                        symbol += createByte(codePoint, 6);
                    }
                    symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
                    return symbol;
                }

                function utf8encode(string, opts) {
                    opts = opts || {};
                    var strict = false !== opts.strict;

                    var codePoints = ucs2decode(string);
                    var length = codePoints.length;
                    var index = -1;
                    var codePoint;
                    var byteString = '';
                    while (++index < length) {
                        codePoint = codePoints[index];
                        byteString += encodeCodePoint(codePoint, strict);
                    }
                    return byteString;
                }

                /*--------------------------------------------------------------------------*/

                function readContinuationByte() {
                    if (byteIndex >= byteCount) {
                        throw Error('Invalid byte index');
                    }

                    var continuationByte = byteArray[byteIndex] & 0xFF;
                    byteIndex++;

                    if ((continuationByte & 0xC0) == 0x80) {
                        return continuationByte & 0x3F;
                    }

                    // If we end up here, it’s not a continuation byte
                    throw Error('Invalid continuation byte');
                }

                function decodeSymbol(strict) {
                    var byte1;
                    var byte2;
                    var byte3;
                    var byte4;
                    var codePoint;

                    if (byteIndex > byteCount) {
                        throw Error('Invalid byte index');
                    }

                    if (byteIndex == byteCount) {
                        return false;
                    }

                    // Read first byte
                    byte1 = byteArray[byteIndex] & 0xFF;
                    byteIndex++;

                    // 1-byte sequence (no continuation bytes)
                    if ((byte1 & 0x80) == 0) {
                        return byte1;
                    }

                    // 2-byte sequence
                    if ((byte1 & 0xE0) == 0xC0) {
                        byte2 = readContinuationByte();
                        codePoint = ((byte1 & 0x1F) << 6) | byte2;
                        if (codePoint >= 0x80) {
                            return codePoint;
                        } else {
                            throw Error('Invalid continuation byte');
                        }
                    }

                    // 3-byte sequence (may include unpaired surrogates)
                    if ((byte1 & 0xF0) == 0xE0) {
                        byte2 = readContinuationByte();
                        byte3 = readContinuationByte();
                        codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
                        if (codePoint >= 0x0800) {
                            return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
                        } else {
                            throw Error('Invalid continuation byte');
                        }
                    }

                    // 4-byte sequence
                    if ((byte1 & 0xF8) == 0xF0) {
                        byte2 = readContinuationByte();
                        byte3 = readContinuationByte();
                        byte4 = readContinuationByte();
                        codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
                            (byte3 << 0x06) | byte4;
                        if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
                            return codePoint;
                        }
                    }

                    throw Error('Invalid UTF-8 detected');
                }

                var byteArray;
                var byteCount;
                var byteIndex;

                function utf8decode(byteString, opts) {
                    opts = opts || {};
                    var strict = false !== opts.strict;

                    byteArray = ucs2decode(byteString);
                    byteCount = byteArray.length;
                    byteIndex = 0;
                    var codePoints = [];
                    var tmp;
                    while ((tmp = decodeSymbol(strict)) !== false) {
                        codePoints.push(tmp);
                    }
                    return ucs2encode(codePoints);
                }

                /*--------------------------------------------------------------------------*/

                var utf8 = {
                    'version': '2.1.2',
                    'encode': utf8encode,
                    'decode': utf8decode
                };

                // Some AMD build optimizers, like r.js, check for specific condition patterns
                // like the following:
                if (
                    typeof define == 'function' &&
                    typeof define.amd == 'object' &&
                    define.amd
                ) {
                    define(function () {
                        return utf8;
                    });
                } else if (freeExports && !freeExports.nodeType) {
                    if (freeModule) { // in Node.js or RingoJS v0.8.0+
                        freeModule.exports = utf8;
                    } else { // in Narwhal or RingoJS v0.7.0-
                        var object = {};
                        var hasOwnProperty = object.hasOwnProperty;
                        for (var key in utf8) {
                            hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
                        }
                    }
                } else { // in Rhino or a web browser
                    root.utf8 = utf8;
                }

            }(this));

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    24: [function (require, module, exports) {
        (function (Buffer) {
            /* global Blob File */

            /*
 * Module requirements.
 */

            var isArray = require('isarray');

            var toString = Object.prototype.toString;
            var withNativeBlob = typeof Blob === 'function' ||
                typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]';
            var withNativeFile = typeof File === 'function' ||
                typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]';

            /**
             * Module exports.
             */

            module.exports = hasBinary;

            /**
             * Checks for binary data.
             *
             * Supports Buffer, ArrayBuffer, Blob and File.
             *
             * @param {Object} anything
             * @api public
             */

            function hasBinary(obj) {
                if (!obj || typeof obj !== 'object') {
                    return false;
                }

                if (isArray(obj)) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        if (hasBinary(obj[i])) {
                            return true;
                        }
                    }
                    return false;
                }

                if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) ||
                    (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) ||
                    (withNativeBlob && obj instanceof Blob) ||
                    (withNativeFile && obj instanceof File)
                ) {
                    return true;
                }

                // see: https://github.com/Automattic/has-binary/pull/4
                if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
                    return hasBinary(obj.toJSON(), true);
                }

                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
                        return true;
                    }
                }

                return false;
            }

        }).call(this, require("buffer").Buffer)
    }, {"buffer": 48, "isarray": 25}],
    25: [function (require, module, exports) {
        var toString = {}.toString;

        module.exports = Array.isArray || function (arr) {
            return toString.call(arr) == '[object Array]';
        };

    }, {}],
    26: [function (require, module, exports) {

        /**
         * Module exports.
         *
         * Logic borrowed from Modernizr:
         *
         *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
         */

        try {
            module.exports = typeof XMLHttpRequest !== 'undefined' &&
                'withCredentials' in new XMLHttpRequest();
        } catch (err) {
            // if XMLHttp support is disabled in IE then it will throw
            // when trying to create
            module.exports = false;
        }

    }, {}],
    27: [function (require, module, exports) {

        var indexOf = [].indexOf;

        module.exports = function (arr, obj) {
            if (indexOf) return arr.indexOf(obj);
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] === obj) return i;
            }
            return -1;
        };
    }, {}],
    28: [function (require, module, exports) {
        if (typeof Object.create === 'function') {
            // implementation from standard node.js 'util' module
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            };
        } else {
            // old school shim for old browsers
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function () {
                };
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor
            }
        }

    }, {}],
    29: [function (require, module, exports) {
        /**
         * Helpers.
         */

        var s = 1000;
        var m = s * 60;
        var h = m * 60;
        var d = h * 24;
        var y = d * 365.25;

        /**
         * Parse or format the given `val`.
         *
         * Options:
         *
         *  - `long` verbose formatting [false]
         *
         * @param {String|Number} val
         * @param {Object} [options]
         * @throws {Error} throw an error if val is not a non-empty string or a number
         * @return {String|Number}
         * @api public
         */

        module.exports = function (val, options) {
            options = options || {};
            var type = typeof val;
            if (type === 'string' && val.length > 0) {
                return parse(val);
            } else if (type === 'number' && isNaN(val) === false) {
                return options.long ? fmtLong(val) : fmtShort(val);
            }
            throw new Error(
                'val is not a non-empty string or a valid number. val=' +
                JSON.stringify(val)
            );
        };

        /**
         * Parse the given `str` and return milliseconds.
         *
         * @param {String} str
         * @return {Number}
         * @api private
         */

        function parse(str) {
            str = String(str);
            if (str.length > 100) {
                return;
            }
            var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                str
            );
            if (!match) {
                return;
            }
            var n = parseFloat(match[1]);
            var type = (match[2] || 'ms').toLowerCase();
            switch (type) {
                case 'years':
                case 'year':
                case 'yrs':
                case 'yr':
                case 'y':
                    return n * y;
                case 'days':
                case 'day':
                case 'd':
                    return n * d;
                case 'hours':
                case 'hour':
                case 'hrs':
                case 'hr':
                case 'h':
                    return n * h;
                case 'minutes':
                case 'minute':
                case 'mins':
                case 'min':
                case 'm':
                    return n * m;
                case 'seconds':
                case 'second':
                case 'secs':
                case 'sec':
                case 's':
                    return n * s;
                case 'milliseconds':
                case 'millisecond':
                case 'msecs':
                case 'msec':
                case 'ms':
                    return n;
                default:
                    return undefined;
            }
        }

        /**
         * Short format for `ms`.
         *
         * @param {Number} ms
         * @return {String}
         * @api private
         */

        function fmtShort(ms) {
            if (ms >= d) {
                return Math.round(ms / d) + 'd';
            }
            if (ms >= h) {
                return Math.round(ms / h) + 'h';
            }
            if (ms >= m) {
                return Math.round(ms / m) + 'm';
            }
            if (ms >= s) {
                return Math.round(ms / s) + 's';
            }
            return ms + 'ms';
        }

        /**
         * Long format for `ms`.
         *
         * @param {Number} ms
         * @return {String}
         * @api private
         */

        function fmtLong(ms) {
            return plural(ms, d, 'day') ||
                plural(ms, h, 'hour') ||
                plural(ms, m, 'minute') ||
                plural(ms, s, 'second') ||
                ms + ' ms';
        }

        /**
         * Pluralization helper.
         */

        function plural(ms, n, name) {
            if (ms < n) {
                return;
            }
            if (ms < n * 1.5) {
                return Math.floor(ms / n) + ' ' + name;
            }
            return Math.ceil(ms / n) + ' ' + name + 's';
        }

    }, {}],
    30: [function (require, module, exports) {
        module.exports = P2PGraph;

        var d3 = require('d3');
        var debug = require('debug')('p2p-graph');
        var EventEmitter = require('events');
        var inherits = require('inherits');
        var throttle = require('throttleit');

        var STYLE = {
            links: {
                width: 0.7, // default link thickness
                maxWidth: 5.0, // max thickness
                maxBytes: 2097152 // link max thickness at 2MB
            }
        };

        var COLORS = {
            links: {
                color: '#C8C8C8'
            },
            text: {
                subtitle: '#C8C8C8'
            },
            nodes: {
                method: function (d, i) {
                    return d.me
                        ? d3.hsl(210, 0.7, 0.725) // blue
                        : d.seeder
                            ? d3.hsl(120, 0.7, 0.725) // green
                            : d3.hsl(55, 0.7, 0.725) // yellow
                },
                hover: '#A9A9A9',
                dep: '#252929'
            }
        };

        inherits(P2PGraph, EventEmitter);

        function P2PGraph(root) {
            var self = this;
            if (!(self instanceof P2PGraph)) return new P2PGraph(root);

            EventEmitter.call(self);

            if (typeof root === 'string') root = document.querySelector(root);
            self._root = root;

            self._model = {
                nodes: [],
                links: [],
                focused: null
            };

            self._model.links.forEach(function (link) {
                var source = self._model.nodes[link.source];
                var target = self._model.nodes[link.target];

                source.children = source.children || [];
                source.children.push(link.target);

                target.parents = target.parents || [];
                target.parents.push(link.source)
            });

            self._svg = d3.select(self._root).append('svg');

            self._resize();

            self._force = d3.layout.force()
                .size([self._width, self._height])
                .nodes(self._model.nodes)
                .links(self._model.links)
                .on('tick', function () {
                    self._link
                        .attr('x1', function (d) {
                            return d.source.x
                        })
                        .attr('y1', function (d) {
                            return d.source.y
                        })
                        .attr('x2', function (d) {
                            return d.target.x
                        })
                        .attr('y2', function (d) {
                            return d.target.y
                        });

                    self._node
                        .attr('cx', function (d) {
                            return d.x
                        })
                        .attr('cy', function (d) {
                            return d.y
                        });

                    self._node.attr('transform', function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')'
                    })
                });

            self._node = self._svg.selectAll('.node');
            self._link = self._svg.selectAll('.link');

            self._update();

            self._resizeThrottled = throttle(function () {
                self._resize()
            }, 500);
            window.addEventListener('resize', self._resizeThrottled)
        }

        P2PGraph.prototype.list = function () {
            var self = this;
            debug('list');
            return self._model.nodes
        };

        P2PGraph.prototype.add = function (node) {
            var self = this;
            debug('add %s %o', node.id, node);
            if (self._getNode(node.id)) throw new Error('add: cannot add duplicate node');
            self._model.nodes.push(node);
            self._update()
        };

        P2PGraph.prototype.remove = function (id) {
            var self = this;
            debug('remove %s', id);
            var index = self._getNodeIndex(id);
            if (index === -1) throw new Error('remove: node does not exist');

            if (self._model.focused && self._model.focused.id === id) {
                self._model.focused = null;
                self.emit('select', false)
            }

            self._model.nodes.splice(index, 1);
            self._update()
        };

        P2PGraph.prototype.connect = function (sourceId, targetId) {
            var self = this;
            debug('connect %s %s', sourceId, targetId);

            var sourceNode = self._getNode(sourceId);
            if (!sourceNode) throw new Error('connect: invalid source id');
            var targetNode = self._getNode(targetId);
            if (!targetNode) throw new Error('connect: invalid target id');

            if (self.getLink(sourceNode.index, targetNode.index)) {
                throw new Error('connect: cannot make duplicate connection')
            }

            self._model.links.push({
                source: sourceNode.index,
                target: targetNode.index
            });
            self._update()
        };

        P2PGraph.prototype.disconnect = function (sourceId, targetId) {
            var self = this;
            debug('disconnect %s %s', sourceId, targetId);

            var sourceNode = self._getNode(sourceId);
            if (!sourceNode) throw new Error('disconnect: invalid source id');
            var targetNode = self._getNode(targetId);
            if (!targetNode) throw new Error('disconnect: invalid target id');

            var index = self.getLinkIndex(sourceNode.index, targetNode.index);
            if (index === -1) throw new Error('disconnect: connection does not exist');

            self._model.links.splice(index, 1);
            self._update()
        };

        P2PGraph.prototype.hasPeer = function () {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0);
            debug('Checking for peers:', args);
            return args.every(function (nodeId) {
                return self._getNode(nodeId)
            })
        };

        P2PGraph.prototype.hasLink = function (sourceId, targetId) {
            var self = this;
            var sourceNode = self._getNode(sourceId);
            if (!sourceNode) throw new Error('hasLink: invalid source id');
            var targetNode = self._getNode(targetId);
            if (!targetNode) throw new Error('hasLink: invalid target id');
            return !!self.getLink(sourceNode.index, targetNode.index)
        };

        P2PGraph.prototype.areConnected = function (sourceId, targetId) {
            var self = this;
            var sourceNode = self._getNode(sourceId);
            if (!sourceNode) throw new Error('areConnected: invalid source id');
            var targetNode = self._getNode(targetId);
            if (!targetNode) throw new Error('areConnected: invalid target id');
            return self.getLink(sourceNode.index, targetNode.index) ||
                self.getLink(targetNode.index, sourceNode.index)
        };

        P2PGraph.prototype.unchoke = function (sourceId, targetId) {
            debug('unchoke %s %s', sourceId, targetId)
            // TODO: resume opacity
        };

        P2PGraph.prototype.choke = function (sourceId, targetId) {
            debug('choke %s %s', sourceId, targetId)
            // TODO: lower opacity
        };

        P2PGraph.prototype.seed = function (id, isSeeding) {
            var self = this;
            debug(id, 'isSeeding:', isSeeding);
            if (typeof isSeeding !== 'boolean') throw new Error('seed: 2nd param must be a boolean');
            var index = self._getNodeIndex(id);
            if (index === -1) throw new Error('seed: node does not exist');
            self._model.nodes[index].seeder = isSeeding;
            self._update()
        };

        P2PGraph.prototype.rate = function (sourceId, targetId, bytesRate) {
            var self = this;
            debug('rate update:', sourceId + '<->' + targetId, 'at', bytesRate);
            if (typeof bytesRate !== 'number' || bytesRate < 0) throw new Error('rate: 3th param must be a positive number');
            var sourceNode = self._getNode(sourceId);
            if (!sourceNode) throw new Error('rate: invalid source id');
            var targetNode = self._getNode(targetId);
            if (!targetNode) throw new Error('rate: invalid target id');
            var index = self.getLinkIndex(sourceNode.index, targetNode.index);
            if (index === -1) throw new Error('rate: connection does not exist');
            self._model.links[index].rate = speedRange(bytesRate);
            debug('rate:', self._model.links[index].rate);
            self._update();

            function speedRange(bytes) {
                return Math.min(bytes, STYLE.links.maxBytes) *
                    STYLE.links.maxWidth / STYLE.links.maxBytes
            }
        };

        P2PGraph.prototype.getLink = function (source, target) {
            var self = this;
            for (var i = 0, len = self._model.links.length; i < len; i += 1) {
                var link = self._model.links[i];
                if (link.source === self._model.nodes[source] &&
                    link.target === self._model.nodes[target]) {
                    return link
                }
            }
            return null
        };

        P2PGraph.prototype.destroy = function () {
            var self = this;
            debug('destroy');

            self._root.remove();
            window.removeEventListener('resize', self._resizeThrottled);

            self._root = null;
            self._resizeThrottled = null
        };

        P2PGraph.prototype._update = function () {
            var self = this;

            self._link = self._link.data(self._model.links);
            self._node = self._node.data(self._model.nodes, function (d) {
                return d.id
            });

            self._link.enter()
                .insert('line', '.node')
                .attr('class', 'link')
                .style('stroke', COLORS.links.color)
                .style('opacity', 0.5);

            self._link
                .exit()
                .remove();

            self._link.style('stroke-width', function (d) {
                // setting thickness
                return d.rate
                    ? d.rate < STYLE.links.width ? STYLE.links.width : d.rate
                    : STYLE.links.width
            });

            var g = self._node.enter()
                .append('g')
                .attr('class', 'node');

            g.call(self._force.drag);

            g.append('circle')
                .on('mouseover', function (d) {
                    d3.select(this)
                        .style('fill', COLORS.nodes.hover);

                    d3.selectAll(self._childNodes(d))
                        .style('fill', COLORS.nodes.hover)
                        .style('stroke', COLORS.nodes.method)
                        .style('stroke-width', 2);

                    d3.selectAll(self._parentNodes(d))
                        .style('fill', COLORS.nodes.dep)
                        .style('stroke', COLORS.nodes.method)
                        .style('stroke-width', 2)
                })
                .on('mouseout', function (d) {
                    d3.select(this)
                        .style('fill', COLORS.nodes.method);

                    d3.selectAll(self._childNodes(d))
                        .style('fill', COLORS.nodes.method)
                        .style('stroke', null);

                    d3.selectAll(self._parentNodes(d))
                        .style('fill', COLORS.nodes.method)
                        .style('stroke', null)
                })
                .on('click', function (d) {
                    if (self._model.focused === d) {
                        self._force
                            .charge(-200 * self._scale())
                            .linkDistance(100 * self._scale())
                            .linkStrength(1)
                            .start();

                        self._node.style('opacity', 1);
                        self._link.style('opacity', 0.3);

                        self._model.focused = null;
                        self.emit('select', false);
                        return
                    }

                    self._model.focused = d;
                    self.emit('select', d.id);

                    self._node.style('opacity', function (o) {
                        o.active = self._connected(d, o);
                        return o.active ? 1 : 0.2
                    });

                    self._force.charge(function (o) {
                        return (o.active ? -100 : -5) * self._scale()
                    }).linkDistance(function (l) {
                        return (l.source.active && l.target.active ? 100 : 60) * self._scale()
                    }).linkStrength(function (l) {
                        return (l.source === d || l.target === d ? 1 : 0) * self._scale()
                    }).start();

                    self._link.style('opacity', function (l, i) {
                        return l.source.active && l.target.active ? 1 : 0.02
                    })
                });

            self._node
                .select('circle')
                .attr('r', function (d) {
                    return self._scale() * (d.me ? 15 : 10)
                })
                .style('fill', COLORS.nodes.method);

            g.append('text')
                .attr('class', 'text')
                .text(function (d) {
                    return d.name
                });

            self._node
                .select('text')
                .attr('font-size', function (d) {
                    return d.me ? 16 * self._scale() : 12 * self._scale()
                })
                .attr('dx', 0)
                .attr('dy', function (d) {
                    return d.me ? -22 * self._scale() : -15 * self._scale()
                });

            self._node
                .exit()
                .remove();

            self._force
                .linkDistance(100 * self._scale())
                .charge(-200 * self._scale())
                .start()
        };

        P2PGraph.prototype._childNodes = function (d) {
            var self = this;
            if (!d.children) return [];

            return d.children
                .map(function (child) {
                    return self._node[0][child]
                }).filter(function (child) {
                    return child
                })
        };

        P2PGraph.prototype._parentNodes = function (d) {
            var self = this;
            if (!d.parents) return [];

            return d.parents
                .map(function (parent) {
                    return self._node[0][parent]
                }).filter(function (parent) {
                    return parent
                })
        };

        P2PGraph.prototype._connected = function (d, o) {
            return o.id === d.id ||
                (d.children && d.children.indexOf(o.id) !== -1) ||
                (o.children && o.children.indexOf(d.id) !== -1) ||
                (o.parents && o.parents.indexOf(d.id) !== -1) ||
                (d.parents && d.parents.indexOf(o.id) !== -1)
        };

        P2PGraph.prototype._getNode = function (id) {
            var self = this;
            for (var i = 0, len = self._model.nodes.length; i < len; i += 1) {
                var node = self._model.nodes[i];
                if (node.id === id) return node
            }
            return null
        };

        P2PGraph.prototype._scale = function () {
            var self = this;
            var len = self._model.nodes.length;
            return len < 10
                ? 1
                : Math.max(0.2, 1 - ((len - 10) / 100))
        };

        P2PGraph.prototype._resize = function (e) {
            var self = this;
            self._width = self._root.offsetWidth;
            self._height = window.innerWidth >= 900 ? 400 : 250;

            self._svg
                .attr('width', self._width)
                .attr('height', self._height);

            if (self._force) {
                self._force
                    .size([self._width, self._height])
                    .resume()
            }
        };

        P2PGraph.prototype._getNodeIndex = function (id) {
            var self = this;
            for (var i = 0, len = self._model.nodes.length; i < len; i += 1) {
                var node = self._model.nodes[i];
                if (node.id === id) return i
            }
            return -1
        };

        P2PGraph.prototype.getLinkIndex = function (source, target) {
            var self = this;
            for (var i = 0, len = self._model.links.length; i < len; i += 1) {
                var link = self._model.links[i];
                if (link.source === self._model.nodes[source] &&
                    link.target === self._model.nodes[target]) {
                    return i
                }
            }
            return -1
        }

    }, {"d3": 9, "debug": 10, "events": 49, "inherits": 28, "throttleit": 42}],
    31: [function (require, module, exports) {
        /**
         * Compiles a querystring
         * Returns string representation of the object
         *
         * @param {Object}
         * @api private
         */

        exports.encode = function (obj) {
            var str = '';

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (str.length) str += '&';
                    str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
                }
            }

            return str;
        };

        /**
         * Parses a simple querystring into an object
         *
         * @param {String} qs
         * @api private
         */

        exports.decode = function (qs) {
            var qry = {};
            var pairs = qs.split('&');
            for (var i = 0, l = pairs.length; i < l; i++) {
                var pair = pairs[i].split('=');
                qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
            return qry;
        };

    }, {}],
    32: [function (require, module, exports) {
        /**
         * Parses an URI
         *
         * @author Steven Levithan <stevenlevithan.com> (MIT license)
         * @api private
         */

        var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

        var parts = [
            'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
        ];

        module.exports = function parseuri(str) {
            var src = str,
                b = str.indexOf('['),
                e = str.indexOf(']');

            if (b != -1 && e != -1) {
                str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
            }

            var m = re.exec(str || ''),
                uri = {},
                i = 14;

            while (i--) {
                uri[parts[i]] = m[i] || '';
            }

            if (b != -1 && e != -1) {
                uri.source = src;
                uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
                uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
                uri.ipv6uri = true;
            }

            return uri;
        };

    }, {}],
    33: [function (require, module, exports) {

        /**
         * Module dependencies.
         */

        var url = require('./url');
        var parser = require('socket.io-parser');
        var Manager = require('./manager');
        var debug = require('debug')('socket.io-client');

        /**
         * Module exports.
         */

        module.exports = exports = lookup;

        /**
         * Managers cache.
         */

        var cache = exports.managers = {};

        /**
         * Looks up an existing `Manager` for multiplexing.
         * If the user summons:
         *
         *   `io('http://localhost/a');`
         *   `io('http://localhost/b');`
         *
         * We reuse the existing instance based on same scheme/port/host,
         * and we initialize sockets for each namespace.
         *
         * @api public
         */

        function lookup(uri, opts) {
            if (typeof uri === 'object') {
                opts = uri;
                uri = undefined;
            }

            opts = opts || {};

            var parsed = url(uri);
            var source = parsed.source;
            var id = parsed.id;
            var path = parsed.path;
            var sameNamespace = cache[id] && path in cache[id].nsps;
            var newConnection = opts.forceNew || opts['force new connection'] ||
                false === opts.multiplex || sameNamespace;

            var io;

            if (newConnection) {
                debug('ignoring socket cache for %s', source);
                io = Manager(source, opts);
            } else {
                if (!cache[id]) {
                    debug('new io instance for %s', source);
                    cache[id] = Manager(source, opts);
                }
                io = cache[id];
            }
            if (parsed.query && !opts.query) {
                opts.query = parsed.query;
            }
            return io.socket(parsed.path, opts);
        }

        /**
         * Protocol version.
         *
         * @api public
         */

        exports.protocol = parser.protocol;

        /**
         * `connect`.
         *
         * @param {String} uri
         * @api public
         */

        exports.connect = lookup;

        /**
         * Expose constructors for standalone build.
         *
         * @api public
         */

        exports.Manager = require('./manager');
        exports.Socket = require('./socket');

    }, {"./manager": 34, "./socket": 36, "./url": 37, "debug": 10, "socket.io-parser": 39}],
    34: [function (require, module, exports) {

        /**
         * Module dependencies.
         */

        var eio = require('engine.io-client');
        var Socket = require('./socket');
        var Emitter = require('component-emitter');
        var parser = require('socket.io-parser');
        var on = require('./on');
        var bind = require('component-bind');
        var debug = require('debug')('socket.io-client:manager');
        var indexOf = require('indexof');
        var Backoff = require('backo2');

        /**
         * IE6+ hasOwnProperty
         */

        var has = Object.prototype.hasOwnProperty;

        /**
         * Module exports
         */

        module.exports = Manager;

        /**
         * `Manager` constructor.
         *
         * @param {String} engine instance or engine uri/opts
         * @param {Object} options
         * @api public
         */

        function Manager(uri, opts) {
            if (!(this instanceof Manager)) return new Manager(uri, opts);
            if (uri && ('object' === typeof uri)) {
                opts = uri;
                uri = undefined;
            }
            opts = opts || {};

            opts.path = opts.path || '/socket.io';
            this.nsps = {};
            this.subs = [];
            this.opts = opts;
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1000);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
            this.randomizationFactor(opts.randomizationFactor || 0.5);
            this.backoff = new Backoff({
                min: this.reconnectionDelay(),
                max: this.reconnectionDelayMax(),
                jitter: this.randomizationFactor()
            });
            this.timeout(null == opts.timeout ? 20000 : opts.timeout);
            this.readyState = 'closed';
            this.uri = uri;
            this.connecting = [];
            this.lastPing = null;
            this.encoding = false;
            this.packetBuffer = [];
            var _parser = opts.parser || parser;
            this.encoder = new _parser.Encoder();
            this.decoder = new _parser.Decoder();
            this.autoConnect = opts.autoConnect !== false;
            if (this.autoConnect) this.open();
        }

        /**
         * Propagate given event to sockets and emit on `this`
         *
         * @api private
         */

        Manager.prototype.emitAll = function () {
            this.emit.apply(this, arguments);
            for (var nsp in this.nsps) {
                if (has.call(this.nsps, nsp)) {
                    this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
                }
            }
        };

        /**
         * Update `socket.id` of all sockets
         *
         * @api private
         */

        Manager.prototype.updateSocketIds = function () {
            for (var nsp in this.nsps) {
                if (has.call(this.nsps, nsp)) {
                    this.nsps[nsp].id = this.generateId(nsp);
                }
            }
        };

        /**
         * generate `socket.id` for the given `nsp`
         *
         * @param {String} nsp
         * @return {String}
         * @api private
         */

        Manager.prototype.generateId = function (nsp) {
            return (nsp === '/' ? '' : (nsp + '#')) + this.engine.id;
        };

        /**
         * Mix in `Emitter`.
         */

        Emitter(Manager.prototype);

        /**
         * Sets the `reconnection` config.
         *
         * @param {Boolean} true/false if it should automatically reconnect
         * @return {Manager} self or value
         * @api public
         */

        Manager.prototype.reconnection = function (v) {
            if (!arguments.length) return this._reconnection;
            this._reconnection = !!v;
            return this;
        };

        /**
         * Sets the reconnection attempts config.
         *
         * @param {Number} max reconnection attempts before giving up
         * @return {Manager} self or value
         * @api public
         */

        Manager.prototype.reconnectionAttempts = function (v) {
            if (!arguments.length) return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
        };

        /**
         * Sets the delay between reconnections.
         *
         * @param {Number} delay
         * @return {Manager} self or value
         * @api public
         */

        Manager.prototype.reconnectionDelay = function (v) {
            if (!arguments.length) return this._reconnectionDelay;
            this._reconnectionDelay = v;
            this.backoff && this.backoff.setMin(v);
            return this;
        };

        Manager.prototype.randomizationFactor = function (v) {
            if (!arguments.length) return this._randomizationFactor;
            this._randomizationFactor = v;
            this.backoff && this.backoff.setJitter(v);
            return this;
        };

        /**
         * Sets the maximum delay between reconnections.
         *
         * @param {Number} delay
         * @return {Manager} self or value
         * @api public
         */

        Manager.prototype.reconnectionDelayMax = function (v) {
            if (!arguments.length) return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            this.backoff && this.backoff.setMax(v);
            return this;
        };

        /**
         * Sets the connection timeout. `false` to disable
         *
         * @return {Manager} self or value
         * @api public
         */

        Manager.prototype.timeout = function (v) {
            if (!arguments.length) return this._timeout;
            this._timeout = v;
            return this;
        };

        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @api private
         */

        Manager.prototype.maybeReconnectOnOpen = function () {
            // Only try to reconnect if it's the first time we're connecting
            if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
                // keeps reconnection from firing twice for the same reconnection loop
                this.reconnect();
            }
        };

        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} optional, callback
         * @return {Manager} self
         * @api public
         */

        Manager.prototype.open =
            Manager.prototype.connect = function (fn, opts) {
                debug('readyState %s', this.readyState);
                if (~this.readyState.indexOf('open')) return this;

                debug('opening %s', this.uri);
                this.engine = eio(this.uri, this.opts);
                var socket = this.engine;
                var self = this;
                this.readyState = 'opening';
                this.skipReconnect = false;

                // emit `open`
                var openSub = on(socket, 'open', function () {
                    self.onopen();
                    fn && fn();
                });

                // emit `connect_error`
                var errorSub = on(socket, 'error', function (data) {
                    debug('connect_error');
                    self.cleanup();
                    self.readyState = 'closed';
                    self.emitAll('connect_error', data);
                    if (fn) {
                        var err = new Error('Connection error');
                        err.data = data;
                        fn(err);
                    } else {
                        // Only do this if there is no fn to handle the error
                        self.maybeReconnectOnOpen();
                    }
                });

                // emit `connect_timeout`
                if (false !== this._timeout) {
                    var timeout = this._timeout;
                    debug('connect attempt will timeout after %d', timeout);

                    // set timer
                    var timer = setTimeout(function () {
                        debug('connect attempt timed out after %d', timeout);
                        openSub.destroy();
                        socket.close();
                        socket.emit('error', 'timeout');
                        self.emitAll('connect_timeout', timeout);
                    }, timeout);

                    this.subs.push({
                        destroy: function () {
                            clearTimeout(timer);
                        }
                    });
                }

                this.subs.push(openSub);
                this.subs.push(errorSub);

                return this;
            };

        /**
         * Called upon transport open.
         *
         * @api private
         */

        Manager.prototype.onopen = function () {
            debug('open');

            // clear old subs
            this.cleanup();

            // mark as open
            this.readyState = 'open';
            this.emit('open');

            // add new subs
            var socket = this.engine;
            this.subs.push(on(socket, 'data', bind(this, 'ondata')));
            this.subs.push(on(socket, 'ping', bind(this, 'onping')));
            this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
            this.subs.push(on(socket, 'error', bind(this, 'onerror')));
            this.subs.push(on(socket, 'close', bind(this, 'onclose')));
            this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
        };

        /**
         * Called upon a ping.
         *
         * @api private
         */

        Manager.prototype.onping = function () {
            this.lastPing = new Date();
            this.emitAll('ping');
        };

        /**
         * Called upon a packet.
         *
         * @api private
         */

        Manager.prototype.onpong = function () {
            this.emitAll('pong', new Date() - this.lastPing);
        };

        /**
         * Called with data.
         *
         * @api private
         */

        Manager.prototype.ondata = function (data) {
            this.decoder.add(data);
        };

        /**
         * Called when parser fully decodes a packet.
         *
         * @api private
         */

        Manager.prototype.ondecoded = function (packet) {
            this.emit('packet', packet);
        };

        /**
         * Called upon socket error.
         *
         * @api private
         */

        Manager.prototype.onerror = function (err) {
            debug('error', err);
            this.emitAll('error', err);
        };

        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @api public
         */

        Manager.prototype.socket = function (nsp, opts) {
            var socket = this.nsps[nsp];
            if (!socket) {
                socket = new Socket(this, nsp, opts);
                this.nsps[nsp] = socket;
                var self = this;
                socket.on('connecting', onConnecting);
                socket.on('connect', function () {
                    socket.id = self.generateId(nsp);
                });

                if (this.autoConnect) {
                    // manually call here since connecting event is fired before listening
                    onConnecting();
                }
            }

            function onConnecting() {
                if (!~indexOf(self.connecting, socket)) {
                    self.connecting.push(socket);
                }
            }

            return socket;
        };

        /**
         * Called upon a socket close.
         *
         * @param {Socket} socket
         */

        Manager.prototype.destroy = function (socket) {
            var index = indexOf(this.connecting, socket);
            if (~index) this.connecting.splice(index, 1);
            if (this.connecting.length) return;

            this.close();
        };

        /**
         * Writes a packet.
         *
         * @param {Object} packet
         * @api private
         */

        Manager.prototype.packet = function (packet) {
            debug('writing packet %j', packet);
            var self = this;
            if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

            if (!self.encoding) {
                // encode, then write to engine with result
                self.encoding = true;
                this.encoder.encode(packet, function (encodedPackets) {
                    for (var i = 0; i < encodedPackets.length; i++) {
                        self.engine.write(encodedPackets[i], packet.options);
                    }
                    self.encoding = false;
                    self.processPacketQueue();
                });
            } else { // add packet to the queue
                self.packetBuffer.push(packet);
            }
        };

        /**
         * If packet buffer is non-empty, begins encoding the
         * next packet in line.
         *
         * @api private
         */

        Manager.prototype.processPacketQueue = function () {
            if (this.packetBuffer.length > 0 && !this.encoding) {
                var pack = this.packetBuffer.shift();
                this.packet(pack);
            }
        };

        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @api private
         */

        Manager.prototype.cleanup = function () {
            debug('cleanup');

            var subsLength = this.subs.length;
            for (var i = 0; i < subsLength; i++) {
                var sub = this.subs.shift();
                sub.destroy();
            }

            this.packetBuffer = [];
            this.encoding = false;
            this.lastPing = null;

            this.decoder.destroy();
        };

        /**
         * Close the current socket.
         *
         * @api private
         */

        Manager.prototype.close =
            Manager.prototype.disconnect = function () {
                debug('disconnect');
                this.skipReconnect = true;
                this.reconnecting = false;
                if ('opening' === this.readyState) {
                    // `onclose` will not fire because
                    // an open event never happened
                    this.cleanup();
                }
                this.backoff.reset();
                this.readyState = 'closed';
                if (this.engine) this.engine.close();
            };

        /**
         * Called upon engine close.
         *
         * @api private
         */

        Manager.prototype.onclose = function (reason) {
            debug('onclose');

            this.cleanup();
            this.backoff.reset();
            this.readyState = 'closed';
            this.emit('close', reason);

            if (this._reconnection && !this.skipReconnect) {
                this.reconnect();
            }
        };

        /**
         * Attempt a reconnection.
         *
         * @api private
         */

        Manager.prototype.reconnect = function () {
            if (this.reconnecting || this.skipReconnect) return this;

            var self = this;

            if (this.backoff.attempts >= this._reconnectionAttempts) {
                debug('reconnect failed');
                this.backoff.reset();
                this.emitAll('reconnect_failed');
                this.reconnecting = false;
            } else {
                var delay = this.backoff.duration();
                debug('will wait %dms before reconnect attempt', delay);

                this.reconnecting = true;
                var timer = setTimeout(function () {
                    if (self.skipReconnect) return;

                    debug('attempting reconnect');
                    self.emitAll('reconnect_attempt', self.backoff.attempts);
                    self.emitAll('reconnecting', self.backoff.attempts);

                    // check again for the case socket closed in above events
                    if (self.skipReconnect) return;

                    self.open(function (err) {
                        if (err) {
                            debug('reconnect attempt error');
                            self.reconnecting = false;
                            self.reconnect();
                            self.emitAll('reconnect_error', err.data);
                        } else {
                            debug('reconnect success');
                            self.onreconnect();
                        }
                    });
                }, delay);

                this.subs.push({
                    destroy: function () {
                        clearTimeout(timer);
                    }
                });
            }
        };

        /**
         * Called upon successful reconnect.
         *
         * @api private
         */

        Manager.prototype.onreconnect = function () {
            var attempt = this.backoff.attempts;
            this.reconnecting = false;
            this.backoff.reset();
            this.updateSocketIds();
            this.emitAll('reconnect', attempt);
        };

    }, {
        "./on": 35,
        "./socket": 36,
        "backo2": 3,
        "component-bind": 6,
        "component-emitter": 7,
        "debug": 10,
        "engine.io-client": 12,
        "indexof": 27,
        "socket.io-parser": 39
    }],
    35: [function (require, module, exports) {

        /**
         * Module exports.
         */

        module.exports = on;

        /**
         * Helper for subscriptions.
         *
         * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
         * @param {String} event name
         * @param {Function} callback
         * @api public
         */

        function on(obj, ev, fn) {
            obj.on(ev, fn);
            return {
                destroy: function () {
                    obj.removeListener(ev, fn);
                }
            };
        }

    }, {}],
    36: [function (require, module, exports) {

        /**
         * Module dependencies.
         */

        var parser = require('socket.io-parser');
        var Emitter = require('component-emitter');
        var toArray = require('to-array');
        var on = require('./on');
        var bind = require('component-bind');
        var debug = require('debug')('socket.io-client:socket');
        var parseqs = require('parseqs');
        var hasBin = require('has-binary2');

        /**
         * Module exports.
         */

        module.exports = exports = Socket;

        /**
         * Internal events (blacklisted).
         * These events can't be emitted by the user.
         *
         * @api private
         */

        var events = {
            connect: 1,
            connect_error: 1,
            connect_timeout: 1,
            connecting: 1,
            disconnect: 1,
            error: 1,
            reconnect: 1,
            reconnect_attempt: 1,
            reconnect_failed: 1,
            reconnect_error: 1,
            reconnecting: 1,
            ping: 1,
            pong: 1
        };

        /**
         * Shortcut to `Emitter#emit`.
         */

        var emit = Emitter.prototype.emit;

        /**
         * `Socket` constructor.
         *
         * @api public
         */

        function Socket(io, nsp, opts) {
            this.io = io;
            this.nsp = nsp;
            this.json = this; // compat
            this.ids = 0;
            this.acks = {};
            this.receiveBuffer = [];
            this.sendBuffer = [];
            this.connected = false;
            this.disconnected = true;
            this.flags = {};
            if (opts && opts.query) {
                this.query = opts.query;
            }
            if (this.io.autoConnect) this.open();
        }

        /**
         * Mix in `Emitter`.
         */

        Emitter(Socket.prototype);

        /**
         * Subscribe to open, close and packet events
         *
         * @api private
         */

        Socket.prototype.subEvents = function () {
            if (this.subs) return;

            var io = this.io;
            this.subs = [
                on(io, 'open', bind(this, 'onopen')),
                on(io, 'packet', bind(this, 'onpacket')),
                on(io, 'close', bind(this, 'onclose'))
            ];
        };

        /**
         * "Opens" the socket.
         *
         * @api public
         */

        Socket.prototype.open =
            Socket.prototype.connect = function () {
                if (this.connected) return this;

                this.subEvents();
                this.io.open(); // ensure open
                if ('open' === this.io.readyState) this.onopen();
                this.emit('connecting');
                return this;
            };

        /**
         * Sends a `message` event.
         *
         * @return {Socket} self
         * @api public
         */

        Socket.prototype.send = function () {
            var args = toArray(arguments);
            args.unshift('message');
            this.emit.apply(this, args);
            return this;
        };

        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @param {String} event name
         * @return {Socket} self
         * @api public
         */

        Socket.prototype.emit = function (ev) {
            if (events.hasOwnProperty(ev)) {
                emit.apply(this, arguments);
                return this;
            }

            var args = toArray(arguments);
            var packet = {
                type: (this.flags.binary !== undefined ? this.flags.binary : hasBin(args)) ? parser.BINARY_EVENT : parser.EVENT,
                data: args
            };

            packet.options = {};
            packet.options.compress = !this.flags || false !== this.flags.compress;

            // event ack callback
            if ('function' === typeof args[args.length - 1]) {
                debug('emitting packet with ack id %d', this.ids);
                this.acks[this.ids] = args.pop();
                packet.id = this.ids++;
            }

            if (this.connected) {
                this.packet(packet);
            } else {
                this.sendBuffer.push(packet);
            }

            this.flags = {};

            return this;
        };

        /**
         * Sends a packet.
         *
         * @param {Object} packet
         * @api private
         */

        Socket.prototype.packet = function (packet) {
            packet.nsp = this.nsp;
            this.io.packet(packet);
        };

        /**
         * Called upon engine `open`.
         *
         * @api private
         */

        Socket.prototype.onopen = function () {
            debug('transport is open - connecting');

            // write connect packet if necessary
            if ('/' !== this.nsp) {
                if (this.query) {
                    var query = typeof this.query === 'object' ? parseqs.encode(this.query) : this.query;
                    debug('sending connect packet with query %s', query);
                    this.packet({type: parser.CONNECT, query: query});
                } else {
                    this.packet({type: parser.CONNECT});
                }
            }
        };

        /**
         * Called upon engine `close`.
         *
         * @param {String} reason
         * @api private
         */

        Socket.prototype.onclose = function (reason) {
            debug('close (%s)', reason);
            this.connected = false;
            this.disconnected = true;
            delete this.id;
            this.emit('disconnect', reason);
        };

        /**
         * Called with socket packet.
         *
         * @param {Object} packet
         * @api private
         */

        Socket.prototype.onpacket = function (packet) {
            var sameNamespace = packet.nsp === this.nsp;
            var rootNamespaceError = packet.type === parser.ERROR && packet.nsp === '/';

            if (!sameNamespace && !rootNamespaceError) return;

            switch (packet.type) {
                case parser.CONNECT:
                    this.onconnect();
                    break;

                case parser.EVENT:
                    this.onevent(packet);
                    break;

                case parser.BINARY_EVENT:
                    this.onevent(packet);
                    break;

                case parser.ACK:
                    this.onack(packet);
                    break;

                case parser.BINARY_ACK:
                    this.onack(packet);
                    break;

                case parser.DISCONNECT:
                    this.ondisconnect();
                    break;

                case parser.ERROR:
                    this.emit('error', packet.data);
                    break;
            }
        };

        /**
         * Called upon a server event.
         *
         * @param {Object} packet
         * @api private
         */

        Socket.prototype.onevent = function (packet) {
            var args = packet.data || [];
            debug('emitting event %j', args);

            if (null != packet.id) {
                debug('attaching ack callback to event');
                args.push(this.ack(packet.id));
            }

            if (this.connected) {
                emit.apply(this, args);
            } else {
                this.receiveBuffer.push(args);
            }
        };

        /**
         * Produces an ack callback to emit with an event.
         *
         * @api private
         */

        Socket.prototype.ack = function (id) {
            var self = this;
            var sent = false;
            return function () {
                // prevent double callbacks
                if (sent) return;
                sent = true;
                var args = toArray(arguments);
                debug('sending ack %j', args);

                self.packet({
                    type: hasBin(args) ? parser.BINARY_ACK : parser.ACK,
                    id: id,
                    data: args
                });
            };
        };

        /**
         * Called upon a server acknowlegement.
         *
         * @param {Object} packet
         * @api private
         */

        Socket.prototype.onack = function (packet) {
            var ack = this.acks[packet.id];
            if ('function' === typeof ack) {
                debug('calling ack %s with %j', packet.id, packet.data);
                ack.apply(this, packet.data);
                delete this.acks[packet.id];
            } else {
                debug('bad ack %s', packet.id);
            }
        };

        /**
         * Called upon server connect.
         *
         * @api private
         */

        Socket.prototype.onconnect = function () {
            this.connected = true;
            this.disconnected = false;
            this.emit('connect');
            this.emitBuffered();
        };

        /**
         * Emit buffered events (received and emitted).
         *
         * @api private
         */

        Socket.prototype.emitBuffered = function () {
            var i;
            for (i = 0; i < this.receiveBuffer.length; i++) {
                emit.apply(this, this.receiveBuffer[i]);
            }
            this.receiveBuffer = [];

            for (i = 0; i < this.sendBuffer.length; i++) {
                this.packet(this.sendBuffer[i]);
            }
            this.sendBuffer = [];
        };

        /**
         * Called upon server disconnect.
         *
         * @api private
         */

        Socket.prototype.ondisconnect = function () {
            debug('server disconnect (%s)', this.nsp);
            this.destroy();
            this.onclose('io server disconnect');
        };

        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @api private.
         */

        Socket.prototype.destroy = function () {
            if (this.subs) {
                // clean subscriptions to avoid reconnections
                for (var i = 0; i < this.subs.length; i++) {
                    this.subs[i].destroy();
                }
                this.subs = null;
            }

            this.io.destroy(this);
        };

        /**
         * Disconnects the socket manually.
         *
         * @return {Socket} self
         * @api public
         */

        Socket.prototype.close =
            Socket.prototype.disconnect = function () {
                if (this.connected) {
                    debug('performing disconnect (%s)', this.nsp);
                    this.packet({type: parser.DISCONNECT});
                }

                // remove socket from pool
                this.destroy();

                if (this.connected) {
                    // fire events
                    this.onclose('io client disconnect');
                }
                return this;
            };

        /**
         * Sets the compress flag.
         *
         * @param {Boolean} if `true`, compresses the sending data
         * @return {Socket} self
         * @api public
         */

        Socket.prototype.compress = function (compress) {
            this.flags.compress = compress;
            return this;
        };

        /**
         * Sets the binary flag
         *
         * @param {Boolean} whether the emitted data contains binary
         * @return {Socket} self
         * @api public
         */

        Socket.prototype.binary = function (binary) {
            this.flags.binary = binary;
            return this;
        };

    }, {
        "./on": 35,
        "component-bind": 6,
        "component-emitter": 7,
        "debug": 10,
        "has-binary2": 24,
        "parseqs": 31,
        "socket.io-parser": 39,
        "to-array": 43
    }],
    37: [function (require, module, exports) {
        (function (global) {

            /**
             * Module dependencies.
             */

            var parseuri = require('parseuri');
            var debug = require('debug')('socket.io-client:url');

            /**
             * Module exports.
             */

            module.exports = url;

            /**
             * URL parser.
             *
             * @param {String} url
             * @param {Object} An object meant to mimic window.location.
             *                 Defaults to window.location.
             * @api public
             */

            function url(uri, loc) {
                var obj = uri;

                // default to window.location
                loc = loc || global.location;
                if (null == uri) uri = loc.protocol + '//' + loc.host;

                // relative path support
                if ('string' === typeof uri) {
                    if ('/' === uri.charAt(0)) {
                        if ('/' === uri.charAt(1)) {
                            uri = loc.protocol + uri;
                        } else {
                            uri = loc.host + uri;
                        }
                    }

                    if (!/^(https?|wss?):\/\//.test(uri)) {
                        debug('protocol-less url %s', uri);
                        if ('undefined' !== typeof loc) {
                            uri = loc.protocol + '//' + uri;
                        } else {
                            uri = 'https://' + uri;
                        }
                    }

                    // parse
                    debug('parse %s', uri);
                    obj = parseuri(uri);
                }

                // make sure we treat `localhost:80` and `localhost` equally
                if (!obj.port) {
                    if (/^(http|ws)$/.test(obj.protocol)) {
                        obj.port = '80';
                    } else if (/^(http|ws)s$/.test(obj.protocol)) {
                        obj.port = '443';
                    }
                }

                obj.path = obj.path || '/';

                var ipv6 = obj.host.indexOf(':') !== -1;
                var host = ipv6 ? '[' + obj.host + ']' : obj.host;

                // define unique id
                obj.id = obj.protocol + '://' + host + ':' + obj.port;
                // define href
                obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

                return obj;
            }

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {"debug": 10, "parseuri": 32}],
    38: [function (require, module, exports) {
        (function (global) {
            /*global Blob,File*/

            /**
             * Module requirements
             */

            var isArray = require('isarray');
            var isBuf = require('./is-buffer');
            var toString = Object.prototype.toString;
            var withNativeBlob = typeof global.Blob === 'function' || toString.call(global.Blob) === '[object BlobConstructor]';
            var withNativeFile = typeof global.File === 'function' || toString.call(global.File) === '[object FileConstructor]';

            /**
             * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
             * Anything with blobs or files should be fed through removeBlobs before coming
             * here.
             *
             * @param {Object} packet - socket.io event packet
             * @return {Object} with deconstructed packet and list of buffers
             * @api public
             */

            exports.deconstructPacket = function (packet) {
                var buffers = [];
                var packetData = packet.data;
                var pack = packet;
                pack.data = _deconstructPacket(packetData, buffers);
                pack.attachments = buffers.length; // number of binary 'attachments'
                return {packet: pack, buffers: buffers};
            };

            function _deconstructPacket(data, buffers) {
                if (!data) return data;

                if (isBuf(data)) {
                    var placeholder = {_placeholder: true, num: buffers.length};
                    buffers.push(data);
                    return placeholder;
                } else if (isArray(data)) {
                    var newData = new Array(data.length);
                    for (var i = 0; i < data.length; i++) {
                        newData[i] = _deconstructPacket(data[i], buffers);
                    }
                    return newData;
                } else if (typeof data === 'object' && !(data instanceof Date)) {
                    var newData = {};
                    for (var key in data) {
                        newData[key] = _deconstructPacket(data[key], buffers);
                    }
                    return newData;
                }
                return data;
            }

            /**
             * Reconstructs a binary packet from its placeholder packet and buffers
             *
             * @param {Object} packet - event packet with placeholders
             * @param {Array} buffers - binary buffers to put in placeholder positions
             * @return {Object} reconstructed packet
             * @api public
             */

            exports.reconstructPacket = function (packet, buffers) {
                packet.data = _reconstructPacket(packet.data, buffers);
                packet.attachments = undefined; // no longer useful
                return packet;
            };

            function _reconstructPacket(data, buffers) {
                if (!data) return data;

                if (data && data._placeholder) {
                    return buffers[data.num]; // appropriate buffer (should be natural order anyway)
                } else if (isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        data[i] = _reconstructPacket(data[i], buffers);
                    }
                } else if (typeof data === 'object') {
                    for (var key in data) {
                        data[key] = _reconstructPacket(data[key], buffers);
                    }
                }

                return data;
            }

            /**
             * Asynchronously removes Blobs or Files from data via
             * FileReader's readAsArrayBuffer method. Used before encoding
             * data as msgpack. Calls callback with the blobless data.
             *
             * @param {Object} data
             * @param {Function} callback
             * @api private
             */

            exports.removeBlobs = function (data, callback) {
                function _removeBlobs(obj, curKey, containingObject) {
                    if (!obj) return obj;

                    // convert any blob
                    if ((withNativeBlob && obj instanceof Blob) ||
                        (withNativeFile && obj instanceof File)) {
                        pendingBlobs++;

                        // async filereader
                        var fileReader = new FileReader();
                        fileReader.onload = function () { // this.result == arraybuffer
                            if (containingObject) {
                                containingObject[curKey] = this.result;
                            }
                            else {
                                bloblessData = this.result;
                            }

                            // if nothing pending its callback time
                            if (!--pendingBlobs) {
                                callback(bloblessData);
                            }
                        };

                        fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
                    } else if (isArray(obj)) { // handle array
                        for (var i = 0; i < obj.length; i++) {
                            _removeBlobs(obj[i], i, obj);
                        }
                    } else if (typeof obj === 'object' && !isBuf(obj)) { // and object
                        for (var key in obj) {
                            _removeBlobs(obj[key], key, obj);
                        }
                    }
                }

                var pendingBlobs = 0;
                var bloblessData = data;
                _removeBlobs(bloblessData);
                if (!pendingBlobs) {
                    callback(bloblessData);
                }
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {"./is-buffer": 40, "isarray": 41}],
    39: [function (require, module, exports) {

        /**
         * Module dependencies.
         */

        var debug = require('debug')('socket.io-parser');
        var Emitter = require('component-emitter');
        var binary = require('./binary');
        var isArray = require('isarray');
        var isBuf = require('./is-buffer');

        /**
         * Protocol version.
         *
         * @api public
         */

        exports.protocol = 4;

        /**
         * Packet types.
         *
         * @api public
         */

        exports.types = [
            'CONNECT',
            'DISCONNECT',
            'EVENT',
            'ACK',
            'ERROR',
            'BINARY_EVENT',
            'BINARY_ACK'
        ];

        /**
         * Packet type `connect`.
         *
         * @api public
         */

        exports.CONNECT = 0;

        /**
         * Packet type `disconnect`.
         *
         * @api public
         */

        exports.DISCONNECT = 1;

        /**
         * Packet type `event`.
         *
         * @api public
         */

        exports.EVENT = 2;

        /**
         * Packet type `ack`.
         *
         * @api public
         */

        exports.ACK = 3;

        /**
         * Packet type `error`.
         *
         * @api public
         */

        exports.ERROR = 4;

        /**
         * Packet type 'binary event'
         *
         * @api public
         */

        exports.BINARY_EVENT = 5;

        /**
         * Packet type `binary ack`. For acks with binary arguments.
         *
         * @api public
         */

        exports.BINARY_ACK = 6;

        /**
         * Encoder constructor.
         *
         * @api public
         */

        exports.Encoder = Encoder;

        /**
         * Decoder constructor.
         *
         * @api public
         */

        exports.Decoder = Decoder;

        /**
         * A socket.io Encoder instance
         *
         * @api public
         */

        function Encoder() {
        }

        var ERROR_PACKET = exports.ERROR + '"encode error"';

        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         * @param {Function} callback - function to handle encodings (likely engine.write)
         * @return Calls callback with Array of encodings
         * @api public
         */

        Encoder.prototype.encode = function (obj, callback) {
            debug('encoding packet %j', obj);

            if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
                encodeAsBinary(obj, callback);
            } else {
                var encoding = encodeAsString(obj);
                callback([encoding]);
            }
        };

        /**
         * Encode packet as string.
         *
         * @param {Object} packet
         * @return {String} encoded
         * @api private
         */

        function encodeAsString(obj) {

            // first is type
            var str = '' + obj.type;

            // attachments if we have them
            if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
                str += obj.attachments + '-';
            }

            // if we have a namespace other than `/`
            // we append it followed by a comma `,`
            if (obj.nsp && '/' !== obj.nsp) {
                str += obj.nsp + ',';
            }

            // immediately followed by the id
            if (null != obj.id) {
                str += obj.id;
            }

            // json data
            if (null != obj.data) {
                var payload = tryStringify(obj.data);
                if (payload !== false) {
                    str += payload;
                } else {
                    return ERROR_PACKET;
                }
            }

            debug('encoded %j as %s', obj, str);
            return str;
        }

        function tryStringify(str) {
            try {
                return JSON.stringify(str);
            } catch (e) {
                return false;
            }
        }

        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         *
         * @param {Object} packet
         * @return {Buffer} encoded
         * @api private
         */

        function encodeAsBinary(obj, callback) {

            function writeEncoding(bloblessData) {
                var deconstruction = binary.deconstructPacket(bloblessData);
                var pack = encodeAsString(deconstruction.packet);
                var buffers = deconstruction.buffers;

                buffers.unshift(pack); // add packet info to beginning of data list
                callback(buffers); // write all the buffers
            }

            binary.removeBlobs(obj, writeEncoding);
        }

        /**
         * A socket.io Decoder instance
         *
         * @return {Object} decoder
         * @api public
         */

        function Decoder() {
            this.reconstructor = null;
        }

        /**
         * Mix in `Emitter` with Decoder.
         */

        Emitter(Decoder.prototype);

        /**
         * Decodes an ecoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         * @return {Object} packet
         * @api public
         */

        Decoder.prototype.add = function (obj) {
            var packet;
            if (typeof obj === 'string') {
                packet = decodeString(obj);
                if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
                    this.reconstructor = new BinaryReconstructor(packet);

                    // no attachments, labeled binary but no binary data to follow
                    if (this.reconstructor.reconPack.attachments === 0) {
                        this.emit('decoded', packet);
                    }
                } else { // non-binary full packet
                    this.emit('decoded', packet);
                }
            }
            else if (isBuf(obj) || obj.base64) { // raw binary data
                if (!this.reconstructor) {
                    throw new Error('got binary data when not reconstructing a packet');
                } else {
                    packet = this.reconstructor.takeBinaryData(obj);
                    if (packet) { // received final buffer
                        this.reconstructor = null;
                        this.emit('decoded', packet);
                    }
                }
            }
            else {
                throw new Error('Unknown type: ' + obj);
            }
        };

        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         * @api private
         */

        function decodeString(str) {
            var i = 0;
            // look up type
            var p = {
                type: Number(str.charAt(0))
            };

            if (null == exports.types[p.type]) {
                return error('unknown packet type ' + p.type);
            }

            // look up attachments if type binary
            if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
                var buf = '';
                while (str.charAt(++i) !== '-') {
                    buf += str.charAt(i);
                    if (i == str.length) break;
                }
                if (buf != Number(buf) || str.charAt(i) !== '-') {
                    throw new Error('Illegal attachments');
                }
                p.attachments = Number(buf);
            }

            // look up namespace (if any)
            if ('/' === str.charAt(i + 1)) {
                p.nsp = '';
                while (++i) {
                    var c = str.charAt(i);
                    if (',' === c) break;
                    p.nsp += c;
                    if (i === str.length) break;
                }
            } else {
                p.nsp = '/';
            }

            // look up id
            var next = str.charAt(i + 1);
            if ('' !== next && Number(next) == next) {
                p.id = '';
                while (++i) {
                    var c = str.charAt(i);
                    if (null == c || Number(c) != c) {
                        --i;
                        break;
                    }
                    p.id += str.charAt(i);
                    if (i === str.length) break;
                }
                p.id = Number(p.id);
            }

            // look up json data
            if (str.charAt(++i)) {
                var payload = tryParse(str.substr(i));
                var isPayloadValid = payload !== false && (p.type === exports.ERROR || isArray(payload));
                if (isPayloadValid) {
                    p.data = payload;
                } else {
                    return error('invalid payload');
                }
            }

            debug('decoded %s as %j', str, p);
            return p;
        }

        function tryParse(str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                return false;
            }
        }

        /**
         * Deallocates a parser's resources
         *
         * @api public
         */

        Decoder.prototype.destroy = function () {
            if (this.reconstructor) {
                this.reconstructor.finishedReconstruction();
            }
        };

        /**
         * A manager of a binary event's 'buffer sequence'. Should
         * be constructed whenever a packet of type BINARY_EVENT is
         * decoded.
         *
         * @param {Object} packet
         * @return {BinaryReconstructor} initialized reconstructor
         * @api private
         */

        function BinaryReconstructor(packet) {
            this.reconPack = packet;
            this.buffers = [];
        }

        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         * @api private
         */

        BinaryReconstructor.prototype.takeBinaryData = function (binData) {
            this.buffers.push(binData);
            if (this.buffers.length === this.reconPack.attachments) { // done with buffer list
                var packet = binary.reconstructPacket(this.reconPack, this.buffers);
                this.finishedReconstruction();
                return packet;
            }
            return null;
        };

        /**
         * Cleans up binary packet reconstruction variables.
         *
         * @api private
         */

        BinaryReconstructor.prototype.finishedReconstruction = function () {
            this.reconPack = null;
            this.buffers = [];
        };

        function error(msg) {
            return {
                type: exports.ERROR,
                data: 'parser error: ' + msg
            };
        }

    }, {"./binary": 38, "./is-buffer": 40, "component-emitter": 7, "debug": 10, "isarray": 41}],
    40: [function (require, module, exports) {
        (function (global) {

            module.exports = isBuf;

            var withNativeBuffer = typeof global.Buffer === 'function' && typeof global.Buffer.isBuffer === 'function';
            var withNativeArrayBuffer = typeof global.ArrayBuffer === 'function';

            var isView = (function () {
                if (withNativeArrayBuffer && typeof global.ArrayBuffer.isView === 'function') {
                    return global.ArrayBuffer.isView;
                } else {
                    return function (obj) {
                        return obj.buffer instanceof global.ArrayBuffer;
                    };
                }
            })();

            /**
             * Returns true if obj is a buffer or an arraybuffer.
             *
             * @api private
             */

            function isBuf(obj) {
                return (withNativeBuffer && global.Buffer.isBuffer(obj)) ||
                    (withNativeArrayBuffer && (obj instanceof global.ArrayBuffer || isView(obj)));
            }

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    41: [function (require, module, exports) {
        arguments[4][25][0].apply(exports, arguments)
    }, {"dup": 25}],
    42: [function (require, module, exports) {
        module.exports = throttle;

        /**
         * Returns a new function that, when invoked, invokes `func` at most once per `wait` milliseconds.
         *
         * @param {Function} func Function to wrap.
         * @param {Number} wait Number of milliseconds that must elapse between `func` invocations.
         * @return {Function} A new function that wraps the `func` function passed in.
         */

        function throttle(func, wait) {
            var ctx, args, rtn, timeoutID; // caching
            var last = 0;

            return function throttled() {
                ctx = this;
                args = arguments;
                var delta = new Date() - last;
                if (!timeoutID)
                    if (delta >= wait) call();
                    else timeoutID = setTimeout(call, wait - delta);
                return rtn;
            };

            function call() {
                timeoutID = 0;
                last = +new Date();
                rtn = func.apply(ctx, args);
                ctx = null;
                args = null;
            }
        }

    }, {}],
    43: [function (require, module, exports) {
        module.exports = toArray;

        function toArray(list, index) {
            var array = [];

            index = index || 0;

            for (var i = index || 0; i < list.length; i++) {
                array[i - index] = list[i]
            }

            return array
        }

    }, {}],
    44: [function (require, module, exports) {
        'use strict';

        var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
            , length = 64
            , map = {}
            , seed = 0
            , i = 0
            , prev;

        /**
         * Return a string representing the specified number.
         *
         * @param {Number} num The number to convert.
         * @returns {String} The string representation of the number.
         * @api public
         */
        function encode(num) {
            var encoded = '';

            do {
                encoded = alphabet[num % length] + encoded;
                num = Math.floor(num / length);
            } while (num > 0);

            return encoded;
        }

        /**
         * Return the integer value specified by the given string.
         *
         * @param {String} str The string to convert.
         * @returns {Number} The integer value represented by the string.
         * @api public
         */
        function decode(str) {
            var decoded = 0;

            for (i = 0; i < str.length; i++) {
                decoded = decoded * length + map[str.charAt(i)];
            }

            return decoded;
        }

        /**
         * Yeast: A tiny growing id generator.
         *
         * @returns {String} A unique id.
         * @api public
         */
        function yeast() {
            var now = encode(+new Date());

            if (now !== prev) return seed = 0, prev = now;
            return now + '.' + encode(seed++);
        }

//
// Map each character to its index.
//
        for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
        yeast.encode = encode;
        yeast.decode = decode;
        module.exports = yeast;

    }, {}],
    45: [function (require, module, exports) {
        const Graph = require('p2p-graph');
        var socket = require('socket.io-client')();

        var graph = new Graph('.root');

        var nodeMap = new Set();
        var connectionSet = new Set();

        socket.on('nodeDiscovered', (payload) => {

            if (!connectionSet.has(payload.id + payload.idDiscovered) && !connectionSet.has(payload.idDiscovered + payload.id)) {

                connectionSet.add(payload.id + payload.idDiscovered);
                connectionSet.add(payload.idDiscovered + payload.id);

                connNeeded = false;
                if (!nodeMap.has(payload.id)) {
                    graph.add({
                        id: payload.id,
                        name: payload.id
                    });
                    //graph.seed(payload.id, true);
                    connNeeded = true;
                    nodeMap.add(payload.id);
                }
                if (!nodeMap.has(payload.idDiscovered)) {
                    graph.add({
                        id: payload.idDiscovered,
                        name: payload.idDiscovered
                    });
                    //graph.seed(payload.idDiscovered, true);
                    connNeeded = true;
                    nodeMap.add(payload.idDiscovered);
                }
                graph.connect(payload.id, payload.idDiscovered);
            }

        });

    }, {"p2p-graph": 30, "socket.io-client": 33}],
    46: [function (require, module, exports) {
        'use strict';

        exports.byteLength = byteLength;
        exports.toByteArray = toByteArray;
        exports.fromByteArray = fromByteArray;

        var lookup = [];
        var revLookup = [];
        var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

        var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        for (var i = 0, len = code.length; i < len; ++i) {
            lookup[i] = code[i];
            revLookup[code.charCodeAt(i)] = i
        }

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
        revLookup['-'.charCodeAt(0)] = 62;
        revLookup['_'.charCodeAt(0)] = 63;

        function getLens(b64) {
            var len = b64.length;

            if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
            }

            // Trim off extra bytes after placeholder bytes are found
            // See: https://github.com/beatgammit/base64-js/issues/42
            var validLen = b64.indexOf('=');
            if (validLen === -1) validLen = len;

            var placeHoldersLen = validLen === len
                ? 0
                : 4 - (validLen % 4);

            return [validLen, placeHoldersLen]
        }

// base64 is 4/3 + up to two characters of the original data
        function byteLength(b64) {
            var lens = getLens(b64);
            var validLen = lens[0];
            var placeHoldersLen = lens[1];
            return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
        }

        function _byteLength(b64, validLen, placeHoldersLen) {
            return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
        }

        function toByteArray(b64) {
            var tmp;
            var lens = getLens(b64);
            var validLen = lens[0];
            var placeHoldersLen = lens[1];

            var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

            var curByte = 0;

            // if there are placeholders, only get up to the last complete 4 chars
            var len = placeHoldersLen > 0
                ? validLen - 4
                : validLen;

            for (var i = 0; i < len; i += 4) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 18) |
                    (revLookup[b64.charCodeAt(i + 1)] << 12) |
                    (revLookup[b64.charCodeAt(i + 2)] << 6) |
                    revLookup[b64.charCodeAt(i + 3)];
                arr[curByte++] = (tmp >> 16) & 0xFF;
                arr[curByte++] = (tmp >> 8) & 0xFF;
                arr[curByte++] = tmp & 0xFF
            }

            if (placeHoldersLen === 2) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 2) |
                    (revLookup[b64.charCodeAt(i + 1)] >> 4);
                arr[curByte++] = tmp & 0xFF
            }

            if (placeHoldersLen === 1) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 10) |
                    (revLookup[b64.charCodeAt(i + 1)] << 4) |
                    (revLookup[b64.charCodeAt(i + 2)] >> 2);
                arr[curByte++] = (tmp >> 8) & 0xFF;
                arr[curByte++] = tmp & 0xFF
            }

            return arr
        }

        function tripletToBase64(num) {
            return lookup[num >> 18 & 0x3F] +
                lookup[num >> 12 & 0x3F] +
                lookup[num >> 6 & 0x3F] +
                lookup[num & 0x3F]
        }

        function encodeChunk(uint8, start, end) {
            var tmp;
            var output = [];
            for (var i = start; i < end; i += 3) {
                tmp =
                    ((uint8[i] << 16) & 0xFF0000) +
                    ((uint8[i + 1] << 8) & 0xFF00) +
                    (uint8[i + 2] & 0xFF);
                output.push(tripletToBase64(tmp))
            }
            return output.join('')
        }

        function fromByteArray(uint8) {
            var tmp;
            var len = uint8.length;
            var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
            var parts = [];
            var maxChunkLength = 16383; // must be multiple of 3

            // go through the array every three bytes, we'll deal with trailing stuff later
            for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(
                    uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
                ))
            }

            // pad the end with zeros, but make sure to not forget the extra bytes
            if (extraBytes === 1) {
                tmp = uint8[len - 1];
                parts.push(
                    lookup[tmp >> 2] +
                    lookup[(tmp << 4) & 0x3F] +
                    '=='
                )
            } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                parts.push(
                    lookup[tmp >> 10] +
                    lookup[(tmp >> 4) & 0x3F] +
                    lookup[(tmp << 2) & 0x3F] +
                    '='
                )
            }

            return parts.join('')
        }

    }, {}],
    47: [function (require, module, exports) {

    }, {}],
    48: [function (require, module, exports) {
        /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
        /* eslint-disable no-proto */

        'use strict';

        var base64 = require('base64-js');
        var ieee754 = require('ieee754');

        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;

        var K_MAX_LENGTH = 0x7fffffff;
        exports.kMaxLength = K_MAX_LENGTH;

        /**
         * If `Buffer.TYPED_ARRAY_SUPPORT`:
         *   === true    Use Uint8Array implementation (fastest)
         *   === false   Print warning and recommend using `buffer` v4.x which has an Object
         *               implementation (most compatible, even IE6)
         *
         * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
         * Opera 11.6+, iOS 4.2+.
         *
         * We report that the browser does not support typed arrays if the are not subclassable
         * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
         * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
         * for __proto__ and has a buggy typed array implementation.
         */
        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

        if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
            typeof console.error === 'function') {
            console.error(
                'This browser lacks typed array (Uint8Array) support which is required by ' +
                '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
            )
        }

        function typedArraySupport() {
            // Can typed array instances can be augmented?
            try {
                var arr = new Uint8Array(1);
                arr.__proto__ = {
                    __proto__: Uint8Array.prototype, foo: function () {
                        return 42
                    }
                };
                return arr.foo() === 42
            } catch (e) {
                return false
            }
        }

        Object.defineProperty(Buffer.prototype, 'parent', {
            enumerable: true,
            get: function () {
                if (!Buffer.isBuffer(this)) return undefined;
                return this.buffer
            }
        });

        Object.defineProperty(Buffer.prototype, 'offset', {
            enumerable: true,
            get: function () {
                if (!Buffer.isBuffer(this)) return undefined;
                return this.byteOffset
            }
        });

        function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
                throw new RangeError('The value "' + length + '" is invalid for option "size"')
            }
            // Return an augmented `Uint8Array` instance
            var buf = new Uint8Array(length);
            buf.__proto__ = Buffer.prototype;
            return buf
        }

        /**
         * The Buffer constructor returns instances of `Uint8Array` that have their
         * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
         * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
         * and the `Uint8Array` methods. Square bracket notation works as expected -- it
         * returns a single octet.
         *
         * The `Uint8Array` prototype remains unmodified.
         */

        function Buffer(arg, encodingOrOffset, length) {
            // Common case.
            if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                    throw new TypeError(
                        'The "string" argument must be of type string. Received type number'
                    )
                }
                return allocUnsafe(arg)
            }
            return from(arg, encodingOrOffset, length)
        }

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
        if (typeof Symbol !== 'undefined' && Symbol.species != null &&
            Buffer[Symbol.species] === Buffer) {
            Object.defineProperty(Buffer, Symbol.species, {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            })
        }

        Buffer.poolSize = 8192; // not used by this implementation

        function from(value, encodingOrOffset, length) {
            if (typeof value === 'string') {
                return fromString(value, encodingOrOffset)
            }

            if (ArrayBuffer.isView(value)) {
                return fromArrayLike(value)
            }

            if (value == null) {
                throw TypeError(
                    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
                    'or Array-like Object. Received type ' + (typeof value)
                )
            }

            if (isInstance(value, ArrayBuffer) ||
                (value && isInstance(value.buffer, ArrayBuffer))) {
                return fromArrayBuffer(value, encodingOrOffset, length)
            }

            if (typeof value === 'number') {
                throw new TypeError(
                    'The "value" argument must not be of type number. Received type number'
                )
            }

            var valueOf = value.valueOf && value.valueOf();
            if (valueOf != null && valueOf !== value) {
                return Buffer.from(valueOf, encodingOrOffset, length)
            }

            var b = fromObject(value);
            if (b) return b;

            if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
                typeof value[Symbol.toPrimitive] === 'function') {
                return Buffer.from(
                    value[Symbol.toPrimitive]('string'), encodingOrOffset, length
                )
            }

            throw new TypeError(
                'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
                'or Array-like Object. Received type ' + (typeof value)
            )
        }

        /**
         * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
         * if value is a number.
         * Buffer.from(str[, encoding])
         * Buffer.from(array)
         * Buffer.from(buffer)
         * Buffer.from(arrayBuffer[, byteOffset[, length]])
         **/
        Buffer.from = function (value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length)
        };

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;

        function assertSize(size) {
            if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be of type number')
            } else if (size < 0) {
                throw new RangeError('The value "' + size + '" is invalid for option "size"')
            }
        }

        function alloc(size, fill, encoding) {
            assertSize(size);
            if (size <= 0) {
                return createBuffer(size)
            }
            if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string'
                    ? createBuffer(size).fill(fill, encoding)
                    : createBuffer(size).fill(fill)
            }
            return createBuffer(size)
        }

        /**
         * Creates a new filled Buffer instance.
         * alloc(size[, fill[, encoding]])
         **/
        Buffer.alloc = function (size, fill, encoding) {
            return alloc(size, fill, encoding)
        };

        function allocUnsafe(size) {
            assertSize(size);
            return createBuffer(size < 0 ? 0 : checked(size) | 0)
        }

        /**
         * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
         * */
        Buffer.allocUnsafe = function (size) {
            return allocUnsafe(size)
        };
        /**
         * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
         */
        Buffer.allocUnsafeSlow = function (size) {
            return allocUnsafe(size)
        };

        function fromString(string, encoding) {
            if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8'
            }

            if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('Unknown encoding: ' + encoding)
            }

            var length = byteLength(string, encoding) | 0;
            var buf = createBuffer(length);

            var actual = buf.write(string, encoding);

            if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                buf = buf.slice(0, actual)
            }

            return buf
        }

        function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            var buf = createBuffer(length);
            for (var i = 0; i < length; i += 1) {
                buf[i] = array[i] & 255
            }
            return buf
        }

        function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('"offset" is outside of buffer bounds')
            }

            if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('"length" is outside of buffer bounds')
            }

            var buf;
            if (byteOffset === undefined && length === undefined) {
                buf = new Uint8Array(array)
            } else if (length === undefined) {
                buf = new Uint8Array(array, byteOffset)
            } else {
                buf = new Uint8Array(array, byteOffset, length)
            }

            // Return an augmented `Uint8Array` instance
            buf.__proto__ = Buffer.prototype;
            return buf
        }

        function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
                var len = checked(obj.length) | 0;
                var buf = createBuffer(len);

                if (buf.length === 0) {
                    return buf
                }

                obj.copy(buf, 0, 0, len);
                return buf
            }

            if (obj.length !== undefined) {
                if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
                    return createBuffer(0)
                }
                return fromArrayLike(obj)
            }

            if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
                return fromArrayLike(obj.data)
            }
        }

        function checked(length) {
            // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
            // length is NaN (which is otherwise coerced to zero.)
            if (length >= K_MAX_LENGTH) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                    'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
            }
            return length | 0
        }

        function SlowBuffer(length) {
            if (+length != length) { // eslint-disable-line eqeqeq
                length = 0
            }
            return Buffer.alloc(+length)
        }

        Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true &&
                b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
        };

        Buffer.compare = function compare(a, b) {
            if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
            if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                throw new TypeError(
                    'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
                )
            }

            if (a === b) return 0;

            var x = a.length;
            var y = b.length;

            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                    x = a[i];
                    y = b[i];
                    break
                }
            }

            if (x < y) return -1;
            if (y < x) return 1;
            return 0
        };

        Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                    return true;
                default:
                    return false
            }
        };

        Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers')
            }

            if (list.length === 0) {
                return Buffer.alloc(0)
            }

            var i;
            if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; ++i) {
                    length += list[i].length
                }
            }

            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;
            for (i = 0; i < list.length; ++i) {
                var buf = list[i];
                if (isInstance(buf, Uint8Array)) {
                    buf = Buffer.from(buf)
                }
                if (!Buffer.isBuffer(buf)) {
                    throw new TypeError('"list" argument must be an Array of Buffers')
                }
                buf.copy(buffer, pos);
                pos += buf.length
            }
            return buffer
        };

        function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
                return string.length
            }
            if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
                return string.byteLength
            }
            if (typeof string !== 'string') {
                throw new TypeError(
                    'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
                    'Received type ' + typeof string
                )
            }

            var len = string.length;
            var mustMatch = (arguments.length > 2 && arguments[2] === true);
            if (!mustMatch && len === 0) return 0;

            // Use a for loop to avoid recursion
            var loweredCase = false;
            for (; ;) {
                switch (encoding) {
                    case 'ascii':
                    case 'latin1':
                    case 'binary':
                        return len;
                    case 'utf8':
                    case 'utf-8':
                        return utf8ToBytes(string).length;
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return len * 2;
                    case 'hex':
                        return len >>> 1;
                    case 'base64':
                        return base64ToBytes(string).length;
                    default:
                        if (loweredCase) {
                            return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
                        }
                        encoding = ('' + encoding).toLowerCase();
                        loweredCase = true
                }
            }
        }

        Buffer.byteLength = byteLength;

        function slowToString(encoding, start, end) {
            var loweredCase = false;

            // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
            // property of a typed array.

            // This behaves neither like String nor Uint8Array in that we set start/end
            // to their upper/lower bounds if the value passed is out of range.
            // undefined is handled specially as per ECMA-262 6th Edition,
            // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
            if (start === undefined || start < 0) {
                start = 0
            }
            // Return early if start > this.length. Done here to prevent potential uint32
            // coercion fail below.
            if (start > this.length) {
                return ''
            }

            if (end === undefined || end > this.length) {
                end = this.length
            }

            if (end <= 0) {
                return ''
            }

            // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
            end >>>= 0;
            start >>>= 0;

            if (end <= start) {
                return ''
            }

            if (!encoding) encoding = 'utf8';

            while (true) {
                switch (encoding) {
                    case 'hex':
                        return hexSlice(this, start, end);

                    case 'utf8':
                    case 'utf-8':
                        return utf8Slice(this, start, end);

                    case 'ascii':
                        return asciiSlice(this, start, end);

                    case 'latin1':
                    case 'binary':
                        return latin1Slice(this, start, end);

                    case 'base64':
                        return base64Slice(this, start, end);

                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return utf16leSlice(this, start, end);

                    default:
                        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                        encoding = (encoding + '').toLowerCase();
                        loweredCase = true
                }
            }
        }

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
        Buffer.prototype._isBuffer = true;

        function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i
        }

        Buffer.prototype.swap16 = function swap16() {
            var len = this.length;
            if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits')
            }
            for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1)
            }
            return this
        };

        Buffer.prototype.swap32 = function swap32() {
            var len = this.length;
            if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits')
            }
            for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3);
                swap(this, i + 1, i + 2)
            }
            return this
        };

        Buffer.prototype.swap64 = function swap64() {
            var len = this.length;
            if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits')
            }
            for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7);
                swap(this, i + 1, i + 6);
                swap(this, i + 2, i + 5);
                swap(this, i + 3, i + 4)
            }
            return this
        };

        Buffer.prototype.toString = function toString() {
            var length = this.length;
            if (length === 0) return '';
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments)
        };

        Buffer.prototype.toLocaleString = Buffer.prototype.toString;

        Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
            if (this === b) return true;
            return Buffer.compare(this, b) === 0
        };

        Buffer.prototype.inspect = function inspect() {
            var str = '';
            var max = exports.INSPECT_MAX_BYTES;
            str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
            if (this.length > max) str += ' ... ';
            return '<Buffer ' + str + '>'
        };

        Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (isInstance(target, Uint8Array)) {
                target = Buffer.from(target, target.offset, target.byteLength)
            }
            if (!Buffer.isBuffer(target)) {
                throw new TypeError(
                    'The "target" argument must be one of type Buffer or Uint8Array. ' +
                    'Received type ' + (typeof target)
                )
            }

            if (start === undefined) {
                start = 0
            }
            if (end === undefined) {
                end = target ? target.length : 0
            }
            if (thisStart === undefined) {
                thisStart = 0
            }
            if (thisEnd === undefined) {
                thisEnd = this.length
            }

            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index')
            }

            if (thisStart >= thisEnd && start >= end) {
                return 0
            }
            if (thisStart >= thisEnd) {
                return -1
            }
            if (start >= end) {
                return 1
            }

            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;

            if (this === target) return 0;

            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);

            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);

            for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                    x = thisCopy[i];
                    y = targetCopy[i];
                    break
                }
            }

            if (x < y) return -1;
            if (y < x) return 1;
            return 0
        };

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            // Empty buffer means no match
            if (buffer.length === 0) return -1;

            // Normalize byteOffset
            if (typeof byteOffset === 'string') {
                encoding = byteOffset;
                byteOffset = 0
            } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff
            } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000
            }
            byteOffset = +byteOffset; // Coerce to Number.
            if (numberIsNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : (buffer.length - 1)
            }

            // Normalize byteOffset: negative offsets start from the end of the buffer
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
            if (byteOffset >= buffer.length) {
                if (dir) return -1;
                else byteOffset = buffer.length - 1
            } else if (byteOffset < 0) {
                if (dir) byteOffset = 0;
                else return -1
            }

            // Normalize val
            if (typeof val === 'string') {
                val = Buffer.from(val, encoding)
            }

            // Finally, search either indexOf (if dir is true) or lastIndexOf
            if (Buffer.isBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                    return -1
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
            } else if (typeof val === 'number') {
                val = val & 0xFF; // Search for a byte value [0-255]
                if (typeof Uint8Array.prototype.indexOf === 'function') {
                    if (dir) {
                        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
                    } else {
                        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
                    }
                }
                return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
            }

            throw new TypeError('val must be string, number or Buffer')
        }

        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;

            if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();
                if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                    encoding === 'utf16le' || encoding === 'utf-16le') {
                    if (arr.length < 2 || val.length < 2) {
                        return -1
                    }
                    indexSize = 2;
                    arrLength /= 2;
                    valLength /= 2;
                    byteOffset /= 2
                }
            }

            function read(buf, i) {
                if (indexSize === 1) {
                    return buf[i]
                } else {
                    return buf.readUInt16BE(i * indexSize)
                }
            }

            var i;
            if (dir) {
                var foundIndex = -1;
                for (i = byteOffset; i < arrLength; i++) {
                    if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                        if (foundIndex === -1) foundIndex = i;
                        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
                    } else {
                        if (foundIndex !== -1) i -= i - foundIndex;
                        foundIndex = -1
                    }
                }
            } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                for (i = byteOffset; i >= 0; i--) {
                    var found = true;
                    for (var j = 0; j < valLength; j++) {
                        if (read(arr, i + j) !== read(val, j)) {
                            found = false;
                            break
                        }
                    }
                    if (found) return i
                }
            }

            return -1
        }

        Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1
        };

        Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
        };

        Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
        };

        function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
                length = remaining
            } else {
                length = Number(length);
                if (length > remaining) {
                    length = remaining
                }
            }

            var strLen = string.length;

            if (length > strLen / 2) {
                length = strLen / 2
            }
            for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (numberIsNaN(parsed)) return i;
                buf[offset + i] = parsed
            }
            return i
        }

        function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
        }

        function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length)
        }

        function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length)
        }

        function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length)
        }

        function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
        }

        Buffer.prototype.write = function write(string, offset, length, encoding) {
            // Buffer#write(string)
            if (offset === undefined) {
                encoding = 'utf8';
                length = this.length;
                offset = 0
                // Buffer#write(string, encoding)
            } else if (length === undefined && typeof offset === 'string') {
                encoding = offset;
                length = this.length;
                offset = 0
                // Buffer#write(string, offset[, length][, encoding])
            } else if (isFinite(offset)) {
                offset = offset >>> 0;
                if (isFinite(length)) {
                    length = length >>> 0;
                    if (encoding === undefined) encoding = 'utf8'
                } else {
                    encoding = length;
                    length = undefined
                }
            } else {
                throw new Error(
                    'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                )
            }

            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;

            if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds')
            }

            if (!encoding) encoding = 'utf8';

            var loweredCase = false;
            for (; ;) {
                switch (encoding) {
                    case 'hex':
                        return hexWrite(this, string, offset, length);

                    case 'utf8':
                    case 'utf-8':
                        return utf8Write(this, string, offset, length);

                    case 'ascii':
                        return asciiWrite(this, string, offset, length);

                    case 'latin1':
                    case 'binary':
                        return latin1Write(this, string, offset, length);

                    case 'base64':
                        // Warning: maxLength not taken into account in base64Write
                        return base64Write(this, string, offset, length);

                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return ucs2Write(this, string, offset, length);

                    default:
                        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                        encoding = ('' + encoding).toLowerCase();
                        loweredCase = true
                }
            }
        };

        Buffer.prototype.toJSON = function toJSON() {
            return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        };

        function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
                return base64.fromByteArray(buf)
            } else {
                return base64.fromByteArray(buf.slice(start, end))
            }
        }

        function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];

            var i = start;
            while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = (firstByte > 0xEF) ? 4
                    : (firstByte > 0xDF) ? 3
                        : (firstByte > 0xBF) ? 2
                            : 1;

                if (i + bytesPerSequence <= end) {
                    var secondByte, thirdByte, fourthByte, tempCodePoint;

                    switch (bytesPerSequence) {
                        case 1:
                            if (firstByte < 0x80) {
                                codePoint = firstByte
                            }
                            break;
                        case 2:
                            secondByte = buf[i + 1];
                            if ((secondByte & 0xC0) === 0x80) {
                                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                                if (tempCodePoint > 0x7F) {
                                    codePoint = tempCodePoint
                                }
                            }
                            break;
                        case 3:
                            secondByte = buf[i + 1];
                            thirdByte = buf[i + 2];
                            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                                    codePoint = tempCodePoint
                                }
                            }
                            break;
                        case 4:
                            secondByte = buf[i + 1];
                            thirdByte = buf[i + 2];
                            fourthByte = buf[i + 3];
                            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                                    codePoint = tempCodePoint
                                }
                            }
                    }
                }

                if (codePoint === null) {
                    // we did not generate a valid codePoint so insert a
                    // replacement char (U+FFFD) and advance only 1 byte
                    codePoint = 0xFFFD;
                    bytesPerSequence = 1
                } else if (codePoint > 0xFFFF) {
                    // encode to utf16 (surrogate pair dance)
                    codePoint -= 0x10000;
                    res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                    codePoint = 0xDC00 | codePoint & 0x3FF
                }

                res.push(codePoint);
                i += bytesPerSequence
            }

            return decodeCodePointsArray(res)
        }

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
        var MAX_ARGUMENTS_LENGTH = 0x1000;

        function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;
            if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
            }

            // Decode in chunks to avoid "call stack size exceeded".
            var res = '';
            var i = 0;
            while (i < len) {
                res += String.fromCharCode.apply(
                    String,
                    codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                )
            }
            return res
        }

        function asciiSlice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);

            for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F)
            }
            return ret
        }

        function latin1Slice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);

            for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i])
            }
            return ret
        }

        function hexSlice(buf, start, end) {
            var len = buf.length;

            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;

            var out = '';
            for (var i = start; i < end; ++i) {
                out += toHex(buf[i])
            }
            return out
        }

        function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = '';
            for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
            }
            return res
        }

        Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;

            if (start < 0) {
                start += len;
                if (start < 0) start = 0
            } else if (start > len) {
                start = len
            }

            if (end < 0) {
                end += len;
                if (end < 0) end = 0
            } else if (end > len) {
                end = len
            }

            if (end < start) end = start;

            var newBuf = this.subarray(start, end);
            // Return an augmented `Uint8Array` instance
            newBuf.__proto__ = Buffer.prototype;
            return newBuf
        };

        /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
        function checkOffset(offset, ext, length) {
            if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint');
            if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
        }

        Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);

            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul
            }

            return val
        };

        Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
                checkOffset(offset, byteLength, this.length)
            }

            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul
            }

            return val
        };

        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset]
        };

        Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | (this[offset + 1] << 8)
        };

        Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return (this[offset] << 8) | this[offset + 1]
        };

        Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);

            return ((this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16)) +
                (this[offset + 3] * 0x1000000)
        };

        Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);

            return (this[offset] * 0x1000000) +
                ((this[offset + 1] << 16) |
                    (this[offset + 2] << 8) |
                    this[offset + 3])
        };

        Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);

            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul
            }
            mul *= 0x80;

            if (val >= mul) val -= Math.pow(2, 8 * byteLength);

            return val
        };

        Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);

            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul
            }
            mul *= 0x80;

            if (val >= mul) val -= Math.pow(2, 8 * byteLength);

            return val
        };

        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 0x80)) return (this[offset]);
            return ((0xff - this[offset] + 1) * -1)
        };

        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | (this[offset + 1] << 8);
            return (val & 0x8000) ? val | 0xFFFF0000 : val
        };

        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | (this[offset] << 8);
            return (val & 0x8000) ? val | 0xFFFF0000 : val
        };

        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);

            return (this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16) |
                (this[offset + 3] << 24)
        };

        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);

            return (this[offset] << 24) |
                (this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                (this[offset + 3])
        };

        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4)
        };

        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4)
        };

        Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8)
        };

        Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8)
        };

        function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length) throw new RangeError('Index out of range')
        }

        Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0)
            }

            var mul = 1;
            var i = 0;
            this[offset] = value & 0xFF;
            while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF
            }

            return offset + byteLength
        };

        Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0)
            }

            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 0xFF;
            while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF
            }

            return offset + byteLength
        };

        Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
            this[offset] = (value & 0xff);
            return offset + 1
        };

        Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
            return offset + 2
        };

        Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = (value >>> 8);
            this[offset + 1] = (value & 0xff);
            return offset + 2
        };

        Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset + 3] = (value >>> 24);
            this[offset + 2] = (value >>> 16);
            this[offset + 1] = (value >>> 8);
            this[offset] = (value & 0xff);
            return offset + 4
        };

        Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset] = (value >>> 24);
            this[offset + 1] = (value >>> 16);
            this[offset + 2] = (value >>> 8);
            this[offset + 3] = (value & 0xff);
            return offset + 4
        };

        Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                var limit = Math.pow(2, (8 * byteLength) - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit)
            }

            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 0xFF;
            while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                    sub = 1
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
            }

            return offset + byteLength
        };

        Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                var limit = Math.pow(2, (8 * byteLength) - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit)
            }

            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 0xFF;
            while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                    sub = 1
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
            }

            return offset + byteLength
        };

        Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
            if (value < 0) value = 0xff + value + 1;
            this[offset] = (value & 0xff);
            return offset + 1
        };

        Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
            return offset + 2
        };

        Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = (value >>> 8);
            this[offset + 1] = (value & 0xff);
            return offset + 2
        };

        Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            this[offset] = (value & 0xff);
            this[offset + 1] = (value >>> 8);
            this[offset + 2] = (value >>> 16);
            this[offset + 3] = (value >>> 24);
            return offset + 4
        };

        Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            if (value < 0) value = 0xffffffff + value + 1;
            this[offset] = (value >>> 24);
            this[offset + 1] = (value >>> 16);
            this[offset + 2] = (value >>> 8);
            this[offset + 3] = (value & 0xff);
            return offset + 4
        };

        function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
            if (offset < 0) throw new RangeError('Index out of range')
        }

        function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4
        }

        Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert)
        };

        Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert)
        };

        function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8
        }

        Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert)
        };

        Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert)
        };

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;

            // Copy 0 bytes; we're done
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;

            // Fatal error conditions
            if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds')
            }
            if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
            if (end < 0) throw new RangeError('sourceEnd out of bounds');

            // Are we oob?
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start
            }

            var len = end - start;

            if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
                // Use built-in when available, missing from IE11
                this.copyWithin(targetStart, start, end)
            } else if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (var i = len - 1; i >= 0; --i) {
                    target[i + targetStart] = this[i + start]
                }
            } else {
                Uint8Array.prototype.set.call(
                    target,
                    this.subarray(start, end),
                    targetStart
                )
            }

            return len
        };

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
        Buffer.prototype.fill = function fill(val, start, end, encoding) {
            // Handle string cases:
            if (typeof val === 'string') {
                if (typeof start === 'string') {
                    encoding = start;
                    start = 0;
                    end = this.length
                } else if (typeof end === 'string') {
                    encoding = end;
                    end = this.length
                }
                if (encoding !== undefined && typeof encoding !== 'string') {
                    throw new TypeError('encoding must be a string')
                }
                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                    throw new TypeError('Unknown encoding: ' + encoding)
                }
                if (val.length === 1) {
                    var code = val.charCodeAt(0);
                    if ((encoding === 'utf8' && code < 128) ||
                        encoding === 'latin1') {
                        // Fast path: If `val` fits into a single byte, use that numeric value.
                        val = code
                    }
                }
            } else if (typeof val === 'number') {
                val = val & 255
            }

            // Invalid ranges are not set to a default, so can range check early.
            if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index')
            }

            if (end <= start) {
                return this
            }

            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;

            if (!val) val = 0;

            var i;
            if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                    this[i] = val
                }
            } else {
                var bytes = Buffer.isBuffer(val)
                    ? val
                    : Buffer.from(val, encoding);
                var len = bytes.length;
                if (len === 0) {
                    throw new TypeError('The value "' + val +
                        '" is invalid for argument "value"')
                }
                for (i = 0; i < end - start; ++i) {
                    this[i + start] = bytes[i % len]
                }
            }

            return this
        };

// HELPER FUNCTIONS
// ================

        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

        function base64clean(str) {
            // Node takes equal signs as end of the Base64 encoding
            str = str.split('=')[0];
            // Node strips out invalid characters like \n and \t from the string, base64-js does not
            str = str.trim().replace(INVALID_BASE64_RE, '');
            // Node converts strings with length < 2 to ''
            if (str.length < 2) return '';
            // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
            while (str.length % 4 !== 0) {
                str = str + '='
            }
            return str
        }

        function toHex(n) {
            if (n < 16) return '0' + n.toString(16);
            return n.toString(16)
        }

        function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];

            for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i);

                // is surrogate component
                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                    // last char was a lead
                    if (!leadSurrogate) {
                        // no lead yet
                        if (codePoint > 0xDBFF) {
                            // unexpected trail
                            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                            continue
                        } else if (i + 1 === length) {
                            // unpaired lead
                            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                            continue
                        }

                        // valid lead
                        leadSurrogate = codePoint;

                        continue
                    }

                    // 2 leads in a row
                    if (codePoint < 0xDC00) {
                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                        leadSurrogate = codePoint;
                        continue
                    }

                    // valid surrogate pair
                    codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
                } else if (leadSurrogate) {
                    // valid bmp char, but last char was a lead
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                }

                leadSurrogate = null;

                // encode utf8
                if (codePoint < 0x80) {
                    if ((units -= 1) < 0) break;
                    bytes.push(codePoint)
                } else if (codePoint < 0x800) {
                    if ((units -= 2) < 0) break;
                    bytes.push(
                        codePoint >> 0x6 | 0xC0,
                        codePoint & 0x3F | 0x80
                    )
                } else if (codePoint < 0x10000) {
                    if ((units -= 3) < 0) break;
                    bytes.push(
                        codePoint >> 0xC | 0xE0,
                        codePoint >> 0x6 & 0x3F | 0x80,
                        codePoint & 0x3F | 0x80
                    )
                } else if (codePoint < 0x110000) {
                    if ((units -= 4) < 0) break;
                    bytes.push(
                        codePoint >> 0x12 | 0xF0,
                        codePoint >> 0xC & 0x3F | 0x80,
                        codePoint >> 0x6 & 0x3F | 0x80,
                        codePoint & 0x3F | 0x80
                    )
                } else {
                    throw new Error('Invalid code point')
                }
            }

            return bytes
        }

        function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF)
            }
            return byteArray
        }

        function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break;

                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi)
            }

            return byteArray
        }

        function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str))
        }

        function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
                if ((i + offset >= dst.length) || (i >= src.length)) break;
                dst[i + offset] = src[i]
            }
            return i
        }

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
        function isInstance(obj, type) {
            return obj instanceof type ||
                (obj != null && obj.constructor != null && obj.constructor.name != null &&
                    obj.constructor.name === type.name)
        }

        function numberIsNaN(obj) {
            // For IE11 support
            return obj !== obj // eslint-disable-line no-self-compare
        }

    }, {"base64-js": 46, "ieee754": 50}],
    49: [function (require, module, exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

        var objectCreate = Object.create || objectCreatePolyfill;
        var objectKeys = Object.keys || objectKeysPolyfill;
        var bind = Function.prototype.bind || functionBindPolyfill;

        function EventEmitter() {
            if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
                this._events = objectCreate(null);
                this._eventsCount = 0;
            }

            this._maxListeners = this._maxListeners || undefined;
        }

        module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
        var defaultMaxListeners = 10;

        var hasDefineProperty;
        try {
            var o = {};
            if (Object.defineProperty) Object.defineProperty(o, 'x', {value: 0});
            hasDefineProperty = o.x === 0;
        } catch (err) {
            hasDefineProperty = false
        }
        if (hasDefineProperty) {
            Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
                enumerable: true,
                get: function () {
                    return defaultMaxListeners;
                },
                set: function (arg) {
                    // check whether the input is a positive number (whose value is zero or
                    // greater and not a NaN).
                    if (typeof arg !== 'number' || arg < 0 || arg !== arg)
                        throw new TypeError('"defaultMaxListeners" must be a positive number');
                    defaultMaxListeners = arg;
                }
            });
        } else {
            EventEmitter.defaultMaxListeners = defaultMaxListeners;
        }

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
            if (typeof n !== 'number' || n < 0 || isNaN(n))
                throw new TypeError('"n" argument must be a positive number');
            this._maxListeners = n;
            return this;
        };

        function $getMaxListeners(that) {
            if (that._maxListeners === undefined)
                return EventEmitter.defaultMaxListeners;
            return that._maxListeners;
        }

        EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
            return $getMaxListeners(this);
        };

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
        function emitNone(handler, isFn, self) {
            if (isFn)
                handler.call(self);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self);
            }
        }

        function emitOne(handler, isFn, self, arg1) {
            if (isFn)
                handler.call(self, arg1);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1);
            }
        }

        function emitTwo(handler, isFn, self, arg1, arg2) {
            if (isFn)
                handler.call(self, arg1, arg2);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1, arg2);
            }
        }

        function emitThree(handler, isFn, self, arg1, arg2, arg3) {
            if (isFn)
                handler.call(self, arg1, arg2, arg3);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1, arg2, arg3);
            }
        }

        function emitMany(handler, isFn, self, args) {
            if (isFn)
                handler.apply(self, args);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].apply(self, args);
            }
        }

        EventEmitter.prototype.emit = function emit(type) {
            var er, handler, len, args, i, events;
            var doError = (type === 'error');

            events = this._events;
            if (events)
                doError = (doError && events.error == null);
            else if (!doError)
                return false;

            // If there is no 'error' event listener then throw.
            if (doError) {
                if (arguments.length > 1)
                    er = arguments[1];
                if (er instanceof Error) {
                    throw er; // Unhandled 'error' event
                } else {
                    // At least give some kind of context to the user
                    var err = new Error('Unhandled "error" event. (' + er + ')');
                    err.context = er;
                    throw err;
                }
                return false;
            }

            handler = events[type];

            if (!handler)
                return false;

            var isFn = typeof handler === 'function';
            len = arguments.length;
            switch (len) {
                // fast cases
                case 1:
                    emitNone(handler, isFn, this);
                    break;
                case 2:
                    emitOne(handler, isFn, this, arguments[1]);
                    break;
                case 3:
                    emitTwo(handler, isFn, this, arguments[1], arguments[2]);
                    break;
                case 4:
                    emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
                    break;
                // slower
                default:
                    args = new Array(len - 1);
                    for (i = 1; i < len; i++)
                        args[i - 1] = arguments[i];
                    emitMany(handler, isFn, this, args);
            }

            return true;
        };

        function _addListener(target, type, listener, prepend) {
            var m;
            var events;
            var existing;

            if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');

            events = target._events;
            if (!events) {
                events = target._events = objectCreate(null);
                target._eventsCount = 0;
            } else {
                // To avoid recursion in the case that type === "newListener"! Before
                // adding it to the listeners, first emit "newListener".
                if (events.newListener) {
                    target.emit('newListener', type,
                        listener.listener ? listener.listener : listener);

                    // Re-assign `events` because a newListener handler could have caused the
                    // this._events to be assigned to a new object
                    events = target._events;
                }
                existing = events[type];
            }

            if (!existing) {
                // Optimize the case of one listener. Don't need the extra array object.
                existing = events[type] = listener;
                ++target._eventsCount;
            } else {
                if (typeof existing === 'function') {
                    // Adding the second element, need to change to array.
                    existing = events[type] =
                        prepend ? [listener, existing] : [existing, listener];
                } else {
                    // If we've already got an array, just append.
                    if (prepend) {
                        existing.unshift(listener);
                    } else {
                        existing.push(listener);
                    }
                }

                // Check for listener leak
                if (!existing.warned) {
                    m = $getMaxListeners(target);
                    if (m && m > 0 && existing.length > m) {
                        existing.warned = true;
                        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' "' + String(type) + '" listeners ' +
                            'added. Use emitter.setMaxListeners() to ' +
                            'increase limit.');
                        w.name = 'MaxListenersExceededWarning';
                        w.emitter = target;
                        w.type = type;
                        w.count = existing.length;
                        if (typeof console === 'object' && console.warn) {
                            console.warn('%s: %s', w.name, w.message);
                        }
                    }
                }
            }

            return target;
        }

        EventEmitter.prototype.addListener = function addListener(type, listener) {
            return _addListener(this, type, listener, false);
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.prependListener =
            function prependListener(type, listener) {
                return _addListener(this, type, listener, true);
            };

        function onceWrapper() {
            if (!this.fired) {
                this.target.removeListener(this.type, this.wrapFn);
                this.fired = true;
                switch (arguments.length) {
                    case 0:
                        return this.listener.call(this.target);
                    case 1:
                        return this.listener.call(this.target, arguments[0]);
                    case 2:
                        return this.listener.call(this.target, arguments[0], arguments[1]);
                    case 3:
                        return this.listener.call(this.target, arguments[0], arguments[1],
                            arguments[2]);
                    default:
                        var args = new Array(arguments.length);
                        for (var i = 0; i < args.length; ++i)
                            args[i] = arguments[i];
                        this.listener.apply(this.target, args);
                }
            }
        }

        function _onceWrap(target, type, listener) {
            var state = {fired: false, wrapFn: undefined, target: target, type: type, listener: listener};
            var wrapped = bind.call(onceWrapper, state);
            wrapped.listener = listener;
            state.wrapFn = wrapped;
            return wrapped;
        }

        EventEmitter.prototype.once = function once(type, listener) {
            if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');
            this.on(type, _onceWrap(this, type, listener));
            return this;
        };

        EventEmitter.prototype.prependOnceListener =
            function prependOnceListener(type, listener) {
                if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');
                this.prependListener(type, _onceWrap(this, type, listener));
                return this;
            };

// Emits a 'removeListener' event if and only if the listener was removed.
        EventEmitter.prototype.removeListener =
            function removeListener(type, listener) {
                var list, events, position, i, originalListener;

                if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');

                events = this._events;
                if (!events)
                    return this;

                list = events[type];
                if (!list)
                    return this;

                if (list === listener || list.listener === listener) {
                    if (--this._eventsCount === 0)
                        this._events = objectCreate(null);
                    else {
                        delete events[type];
                        if (events.removeListener)
                            this.emit('removeListener', type, list.listener || listener);
                    }
                } else if (typeof list !== 'function') {
                    position = -1;

                    for (i = list.length - 1; i >= 0; i--) {
                        if (list[i] === listener || list[i].listener === listener) {
                            originalListener = list[i].listener;
                            position = i;
                            break;
                        }
                    }

                    if (position < 0)
                        return this;

                    if (position === 0)
                        list.shift();
                    else
                        spliceOne(list, position);

                    if (list.length === 1)
                        events[type] = list[0];

                    if (events.removeListener)
                        this.emit('removeListener', type, originalListener || listener);
                }

                return this;
            };

        EventEmitter.prototype.removeAllListeners =
            function removeAllListeners(type) {
                var listeners, events, i;

                events = this._events;
                if (!events)
                    return this;

                // not listening for removeListener, no need to emit
                if (!events.removeListener) {
                    if (arguments.length === 0) {
                        this._events = objectCreate(null);
                        this._eventsCount = 0;
                    } else if (events[type]) {
                        if (--this._eventsCount === 0)
                            this._events = objectCreate(null);
                        else
                            delete events[type];
                    }
                    return this;
                }

                // emit removeListener for all listeners on all events
                if (arguments.length === 0) {
                    var keys = objectKeys(events);
                    var key;
                    for (i = 0; i < keys.length; ++i) {
                        key = keys[i];
                        if (key === 'removeListener') continue;
                        this.removeAllListeners(key);
                    }
                    this.removeAllListeners('removeListener');
                    this._events = objectCreate(null);
                    this._eventsCount = 0;
                    return this;
                }

                listeners = events[type];

                if (typeof listeners === 'function') {
                    this.removeListener(type, listeners);
                } else if (listeners) {
                    // LIFO order
                    for (i = listeners.length - 1; i >= 0; i--) {
                        this.removeListener(type, listeners[i]);
                    }
                }

                return this;
            };

        function _listeners(target, type, unwrap) {
            var events = target._events;

            if (!events)
                return [];

            var evlistener = events[type];
            if (!evlistener)
                return [];

            if (typeof evlistener === 'function')
                return unwrap ? [evlistener.listener || evlistener] : [evlistener];

            return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
        }

        EventEmitter.prototype.listeners = function listeners(type) {
            return _listeners(this, type, true);
        };

        EventEmitter.prototype.rawListeners = function rawListeners(type) {
            return _listeners(this, type, false);
        };

        EventEmitter.listenerCount = function (emitter, type) {
            if (typeof emitter.listenerCount === 'function') {
                return emitter.listenerCount(type);
            } else {
                return listenerCount.call(emitter, type);
            }
        };

        EventEmitter.prototype.listenerCount = listenerCount;

        function listenerCount(type) {
            var events = this._events;

            if (events) {
                var evlistener = events[type];

                if (typeof evlistener === 'function') {
                    return 1;
                } else if (evlistener) {
                    return evlistener.length;
                }
            }

            return 0;
        }

        EventEmitter.prototype.eventNames = function eventNames() {
            return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
        };

// About 1.5x faster than the two-arg version of Array#splice().
        function spliceOne(list, index) {
            for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
                list[i] = list[k];
            list.pop();
        }

        function arrayClone(arr, n) {
            var copy = new Array(n);
            for (var i = 0; i < n; ++i)
                copy[i] = arr[i];
            return copy;
        }

        function unwrapListeners(arr) {
            var ret = new Array(arr.length);
            for (var i = 0; i < ret.length; ++i) {
                ret[i] = arr[i].listener || arr[i];
            }
            return ret;
        }

        function objectCreatePolyfill(proto) {
            var F = function () {
            };
            F.prototype = proto;
            return new F;
        }

        function objectKeysPolyfill(obj) {
            var keys = [];
            for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
            return k;
        }

        function functionBindPolyfill(context) {
            var fn = this;
            return function () {
                return fn.apply(context, arguments);
            };
        }

    }, {}],
    50: [function (require, module, exports) {
        exports.read = function (buffer, offset, isLE, mLen, nBytes) {
            var e, m;
            var eLen = (nBytes * 8) - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var nBits = -7;
            var i = isLE ? (nBytes - 1) : 0;
            var d = isLE ? -1 : 1;
            var s = buffer[offset + i];

            i += d;

            e = s & ((1 << (-nBits)) - 1);
            s >>= (-nBits);
            nBits += eLen;
            for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {
            }

            m = e & ((1 << (-nBits)) - 1);
            e >>= (-nBits);
            nBits += mLen;
            for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {
            }

            if (e === 0) {
                e = 1 - eBias
            } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
            } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
        };

        exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c;
            var eLen = (nBytes * 8) - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
            var i = isLE ? 0 : (nBytes - 1);
            var d = isLE ? 1 : -1;
            var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

            value = Math.abs(value);

            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax
            } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--;
                    c *= 2
                }
                if (e + eBias >= 1) {
                    value += rt / c
                } else {
                    value += rt * Math.pow(2, 1 - eBias)
                }
                if (value * c >= 2) {
                    e++;
                    c /= 2
                }

                if (e + eBias >= eMax) {
                    m = 0;
                    e = eMax
                } else if (e + eBias >= 1) {
                    m = ((value * c) - 1) * Math.pow(2, mLen);
                    e = e + eBias
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                    e = 0
                }
            }

            for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {
            }

            e = (e << mLen) | m;
            eLen += mLen;
            for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {
            }

            buffer[offset + i - d] |= s * 128
        }

    }, {}],
    51: [function (require, module, exports) {
// shim for using process in browser
        var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
            throw new Error('setTimeout has not been defined');
        }

        function defaultClearTimeout() {
            throw new Error('clearTimeout has not been defined');
        }

        (function () {
            try {
                if (typeof setTimeout === 'function') {
                    cachedSetTimeout = setTimeout;
                } else {
                    cachedSetTimeout = defaultSetTimout;
                }
            } catch (e) {
                cachedSetTimeout = defaultSetTimout;
            }
            try {
                if (typeof clearTimeout === 'function') {
                    cachedClearTimeout = clearTimeout;
                } else {
                    cachedClearTimeout = defaultClearTimeout;
                }
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
            }
        }());

        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0);
            }
            // if setTimeout wasn't available but was latter defined
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout(fun, 0);
            } catch (e) {
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                    return cachedSetTimeout.call(null, fun, 0);
                } catch (e) {
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }


        }

        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker);
            }
            // if clearTimeout wasn't available but was latter defined
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout(marker);
            } catch (e) {
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                    return cachedClearTimeout.call(null, marker);
                } catch (e) {
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                    // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                    return cachedClearTimeout.call(this, marker);
                }
            }


        }

        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return;
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
        }

        process.nextTick = function (fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
            }
        };

// v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }

        Item.prototype.run = function () {
            this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {
        }

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;

        process.listeners = function (name) {
            return []
        };

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        process.cwd = function () {
            return '/'
        };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
        process.umask = function () {
            return 0;
        };

    }, {}]
}, {}, [45]);
