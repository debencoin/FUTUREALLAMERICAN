/* FAA Recruit app. Generated from the published page; edit here going forward. */
{const _ap=Element.prototype.append;Element.prototype.append=function(...k){return _ap.apply(this,k.filter(x=>x!=null&&x!==false))};const _rc=Element.prototype.replaceChildren;Element.prototype.replaceChildren=function(...k){return _rc.apply(this,k.filter(x=>x!=null&&x!==false))}}
/* QR code generator. Copyright (c) 2009 Kazuhiko Arase, MIT license. Bundled from qrcode-terminal 0.12.0. */
const QRLib=(()=>{const M={},C={};function req(n){n=n.replace(/^\.\/QRCode$/,"./index");if(C[n])return C[n].exports;const m={exports:{}};C[n]=m;M[n](m,m.exports);return m.exports}
M['./QRErrorCorrectLevel']=function(module,exports){module.exports = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};


};
M['./QRPolynomial']=function(module,exports){var QRMath = req('./QRMath');

function QRPolynomial(num, shift) {
	if (num.length === undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] === 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var x = 0; x < e.getLength(); x++) {
			num[x] ^= QRMath.gexp(QRMath.glog(e.get(x) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

module.exports = QRPolynomial;

};
M['./QRMaskPattern']=function(module,exports){module.exports = {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

};
M['./QRMode']=function(module,exports){module.exports = {
    MODE_NUMBER :       1 << 0,
    MODE_ALPHA_NUM :    1 << 1,
    MODE_8BIT_BYTE :    1 << 2,
    MODE_KANJI :        1 << 3
};

};
M['./QRUtil']=function(module,exports){var QRMode = req('./QRMode');
var QRPolynomial = req('./QRPolynomial');
var QRMath = req('./QRMath');
var QRMaskPattern = req('./QRMaskPattern');

var QRUtil = {

    PATTERN_POSITION_TABLE : [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],        
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)    | (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) );    
        }
        return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) );    
        }
        return (data << 12) | d;
    },

    getBCHDigit : function(data) {

        var digit = 0;

        while (data !== 0) {
            digit++;
            data >>>= 1;
        }

        return digit;
    },

    getPatternPosition : function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
        
        switch (maskPattern) {
            
        case QRMaskPattern.PATTERN000 : return (i + j) % 2 === 0;
        case QRMaskPattern.PATTERN001 : return i % 2 === 0;
        case QRMaskPattern.PATTERN010 : return j % 3 === 0;
        case QRMaskPattern.PATTERN011 : return (i + j) % 3 === 0;
        case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 === 0;
        case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 === 0;
        case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 === 0;
        case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 === 0;

        default :
            throw new Error("bad maskPattern:" + maskPattern);
        }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

        var a = new QRPolynomial([1], 0);

        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
        }

        return a;
    },

    getLengthInBits : function(mode, type) {

        if (1 <= type && type < 10) {

            // 1 - 9

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 10;
            case QRMode.MODE_ALPHA_NUM  : return 9;
            case QRMode.MODE_8BIT_BYTE  : return 8;
            case QRMode.MODE_KANJI      : return 8;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 27) {

            // 10 - 26

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 12;
            case QRMode.MODE_ALPHA_NUM  : return 11;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 10;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 41) {

            // 27 - 40

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 14;
            case QRMode.MODE_ALPHA_NUM  : return 13;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 12;
            default :
                throw new Error("mode:" + mode);
            }

        } else {
            throw new Error("type:" + type);
        }
    },

    getLostPoint : function(qrCode) {
        
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        var row = 0; 
        var col = 0;

        
        // LEVEL1
        
        for (row = 0; row < moduleCount; row++) {

            for (col = 0; col < moduleCount; col++) {

                var sameCount = 0;
                var dark = qrCode.isDark(row, col);

                for (var r = -1; r <= 1; r++) {

                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }

                    for (var c = -1; c <= 1; c++) {

                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }

                        if (r === 0 && c === 0) {
                            continue;
                        }

                        if (dark === qrCode.isDark(row + r, col + c) ) {
                            sameCount++;
                        }
                    }
                }

                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }

        // LEVEL2

        for (row = 0; row < moduleCount - 1; row++) {
            for (col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row,     col    ) ) count++;
                if (qrCode.isDark(row + 1, col    ) ) count++;
                if (qrCode.isDark(row,     col + 1) ) count++;
                if (qrCode.isDark(row + 1, col + 1) ) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }

        // LEVEL3

        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && 
                        !qrCode.isDark(row, col + 1) && 
                         qrCode.isDark(row, col + 2) && 
                         qrCode.isDark(row, col + 3) && 
                         qrCode.isDark(row, col + 4) && 
                        !qrCode.isDark(row, col + 5) && 
                         qrCode.isDark(row, col + 6) ) {
                    lostPoint += 40;
                }
            }
        }

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) &&
                        !qrCode.isDark(row + 1, col) &&
                         qrCode.isDark(row + 2, col) &&
                         qrCode.isDark(row + 3, col) &&
                         qrCode.isDark(row + 4, col) &&
                        !qrCode.isDark(row + 5, col) &&
                         qrCode.isDark(row + 6, col) ) {
                    lostPoint += 40;
                }
            }
        }

        // LEVEL4
        
        var darkCount = 0;

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col) ) {
                    darkCount++;
                }
            }
        }
        
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;       
    }

};

module.exports = QRUtil;

};
M['./QRMath']=function(module,exports){var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

module.exports = QRMath;

};
M['./QR8bitByte']=function(module,exports){var QRMode = req('./QRMode');

function QR8bitByte(data) {
	this.mode = QRMode.MODE_8BIT_BYTE;
	this.data = data;
}

QR8bitByte.prototype = {

	getLength : function() {
		return this.data.length;
	},
	
	write : function(buffer) {
		for (var i = 0; i < this.data.length; i++) {
			// not JIS ...
			buffer.put(this.data.charCodeAt(i), 8);
		}
	}
};

module.exports = QR8bitByte;

};
M['./index']=function(module,exports){//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of 
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
// Modified to work in node for this project (and some refactoring)
//---------------------------------------------------------------------

var QR8bitByte = req('./QR8bitByte');
var QRUtil = req('./QRUtil');
var QRPolynomial = req('./QRPolynomial');
var QRRSBlock = req('./QRRSBlock');
var QRBitBuffer = req('./QRBitBuffer');

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}

QRCode.prototype = {
	
	addData : function(data) {
		var newData = new QR8bitByte(data);
		this.dataList.push(newData);
		this.dataCache = null;
	},
	
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},

	getModuleCount : function() {
		return this.moduleCount;
	},
	
	make : function() {
		// Calculate automatically typeNumber if provided is < 1
		if (this.typeNumber < 1 ){
			var typeNumber = 1;
			for (typeNumber = 1; typeNumber < 40; typeNumber++) {
				var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);

				var buffer = new QRBitBuffer();
				var totalDataCount = 0;
				for (var i = 0; i < rsBlocks.length; i++) {
					totalDataCount += rsBlocks[i].dataCount;
				}

				for (var x = 0; x < this.dataList.length; x++) {
					var data = this.dataList[x];
					buffer.put(data.mode, 4);
					buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
					data.write(buffer);
				}
				if (buffer.getLengthInBits() <= totalDataCount * 8)
					break;
			}
			this.typeNumber = typeNumber;
		}
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	
	makeImpl : function(test, maskPattern) {
		
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new Array(this.moduleCount);
		
		for (var row = 0; row < this.moduleCount; row++) {
			
			this.modules[row] = new Array(this.moduleCount);
			
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
	
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
	
		if (this.dataCache === null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
	
		this.mapData(this.dataCache, maskPattern);
	},

	setupPositionProbePattern : function(row, col)  {
		
		for (var r = -1; r <= 7; r++) {
			
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			
			for (var c = -1; c <= 7; c++) {
				
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				
				if ( (0 <= r && r <= 6 && (c === 0 || c === 6) ) || 
                     (0 <= c && c <= 6 && (r === 0 || r === 6) ) || 
                     (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	
	getBestMaskPattern : function() {
	
		var minLostPoint = 0;
		var pattern = 0;
	
		for (var i = 0; i < 8; i++) {
			
			this.makeImpl(true, i);
	
			var lostPoint = QRUtil.getLostPoint(this);
	
			if (i === 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
	
		return pattern;
	},
	
	createMovieClip : function(target_mc, instance_name, depth) {
	
		var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
		var cs = 1;
	
		this.make();

		for (var row = 0; row < this.modules.length; row++) {
			
			var y = row * cs;
			
			for (var col = 0; col < this.modules[row].length; col++) {
	
				var x = col * cs;
				var dark = this.modules[row][col];
			
				if (dark) {
					qr_mc.beginFill(0, 100);
					qr_mc.moveTo(x, y);
					qr_mc.lineTo(x + cs, y);
					qr_mc.lineTo(x + cs, y + cs);
					qr_mc.lineTo(x, y + cs);
					qr_mc.endFill();
				}
			}
		}
		
		return qr_mc;
	},

	setupTimingPattern : function() {
		
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] !== null) {
				continue;
			}
			this.modules[r][6] = (r % 2 === 0);
		}
	
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] !== null) {
				continue;
			}
			this.modules[6][c] = (c % 2 === 0);
		}
	},
	
	setupPositionAdjustPattern : function() {
	
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		
		for (var i = 0; i < pos.length; i++) {
		
			for (var j = 0; j < pos.length; j++) {
			
				var row = pos[i];
				var col = pos[j];
				
				if (this.modules[row][col] !== null) {
					continue;
				}
				
				for (var r = -2; r <= 2; r++) {
				
					for (var c = -2; c <= 2; c++) {
					
						if (Math.abs(r) === 2 || 
                            Math.abs(c) === 2 ||
                            (r === 0 && c === 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	
	setupTypeNumber : function(test) {
	
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        var mod;
	
		for (var i = 0; i < 18; i++) {
			mod = (!test && ( (bits >> i) & 1) === 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
	
		for (var x = 0; x < 18; x++) {
			mod = (!test && ( (bits >> x) & 1) === 1);
			this.modules[x % 3 + this.moduleCount - 8 - 3][Math.floor(x / 3)] = mod;
		}
	},
	
	setupTypeInfo : function(test, maskPattern) {
	
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
        var mod;
	
		// vertical		
		for (var v = 0; v < 15; v++) {
	
			mod = (!test && ( (bits >> v) & 1) === 1);
	
			if (v < 6) {
				this.modules[v][8] = mod;
			} else if (v < 8) {
				this.modules[v + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + v][8] = mod;
			}
		}
	
		// horizontal
		for (var h = 0; h < 15; h++) {
	
			mod = (!test && ( (bits >> h) & 1) === 1);
			
			if (h < 8) {
				this.modules[8][this.moduleCount - h - 1] = mod;
			} else if (h < 9) {
				this.modules[8][15 - h - 1 + 1] = mod;
			} else {
				this.modules[8][15 - h - 1] = mod;
			}
		}
	
		// fixed module
		this.modules[this.moduleCount - 8][8] = (!test);
	
	},
	
	mapData : function(data, maskPattern) {
		
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	
			if (col === 6) col--;
	
			while (true) {
	
				for (var c = 0; c < 2; c++) {
					
					if (this.modules[row][col - c] === null) {
						
						var dark = false;
	
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) === 1);
						}
	
						var mask = QRUtil.getMask(maskPattern, row, col - c);
	
						if (mask) {
							dark = !dark;
						}
						
						this.modules[row][col - c] = dark;
						bitIndex--;
	
						if (bitIndex === -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
								
				row += inc;
	
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
		
	}

};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new QRBitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var x = 0; x < rsBlocks.length; x++) {
		totalDataCount += rsBlocks[x].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. (" + 
            buffer.getLengthInBits() + 
            ">" +  
            totalDataCount * 8 + 
            ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 !== 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new Array(rsBlocks.length);
	var ecdata = new Array(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new Array(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (var x = 0; x < ecdata[r].length; x++) {
            var modIndex = x + modPoly.getLength() - ecdata[r].length;
			ecdata[r][x] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var y = 0; y < rsBlocks.length; y++) {
		totalCodeCount += rsBlocks[y].totalCount;
	}

	var data = new Array(totalCodeCount);
	var index = 0;

	for (var z = 0; z < maxDcCount; z++) {
		for (var s = 0; s < rsBlocks.length; s++) {
			if (z < dcdata[s].length) {
				data[index++] = dcdata[s][z];
			}
		}
	}

	for (var xx = 0; xx < maxEcCount; xx++) {
		for (var t = 0; t < rsBlocks.length; t++) {
			if (xx < ecdata[t].length) {
				data[index++] = ecdata[t][xx];
			}
		}
	}

	return data;

};

module.exports = QRCode;

};
M['./QRBitBuffer']=function(module,exports){function QRBitBuffer() {
	this.buffer = [];
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

module.exports = QRBitBuffer;

};
M['./QRRSBlock']=function(module,exports){var QRErrorCorrectLevel = req('./QRErrorCorrectLevel');

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [

	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],
	
	// 2
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// 3
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// 4		
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],
	
	// 5
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],
	
	// 6
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],
	
	// 7		
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],
	
	// 8
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],
	
	// 9
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],
	
	// 10		
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12],

	// 16
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock === undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = [];
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
};

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
};

module.exports = QRRSBlock;

};
const QRCode=req("./index"),EC=req("./QRErrorCorrectLevel");return {make(text,level){const q=new QRCode(-1,EC[level||"M"]);q.addData(text);q.make();return q}}})();
(function(){
const PREFIX='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>';
const HEAD_HTML='<title>FAA Recruit</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:ital,wght@0,700;0,800;0,900;1,800;1,900&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">\n';
const STATIC_HTML='<div id="app"></div>\n<dialog id="dlg"></dialog>\n<div class="toast" id="toast" role="status" hidden></div>\n';
const SC='<'+'/script>';

let STATE=JSON.parse(document.getElementById('state').textContent);
const S={assetsUp:null,user:null,db:null,artifact:null,assets:null,isOwner:false,uid:null,slug:null,draft:null,editSlug:null,etab:'athlete',requests:null,myReq:null};
const $=id=>document.getElementById(id);
function h(tag,attrs,...kids){const el=document.createElement(tag);if(attrs)for(const[k,v]of Object.entries(attrs)){if(v==null||v===false)continue;if(k==='class')el.className=v;else if(k.startsWith('on'))el.addEventListener(k.slice(2),v);else if(k==='html')el.innerHTML=v;else el.setAttribute(k,v===true?'':v)}for(const k of kids.flat(Infinity)){if(k==null||k===false)continue;el.append(k.nodeType?k:document.createTextNode(String(k)))}return el}
function toast(m){const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}
const safeUrl=u=>{try{const x=new URL(String(u||'').trim());return x.protocol==='https:'?x.href:''}catch(e){return ''}};
const initials=n=>(n||'?').split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase();
const rid=()=>Math.random().toString(36).slice(2,9);
const slugify=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||('athlete-'+rid());
const money=v=>{const n=parseFloat(String(v).replace(/[^0-9.]/g,''));return isFinite(n)&&n>0?n:0};
const fmt=n=>'$'+(Math.round(n*100)%100?n.toFixed(2):String(Math.round(n)));
const cleanHandle=v=>{let s=String(v||'').trim();s=s.replace(/^https?:\/\/(www\.)?[^/]+\/(add\/)?@?/i,'').replace(/^@/,'').replace(/[/?#].*$/,'');return /^[A-Za-z0-9._-]{1,30}$/.test(s)?s:''};
async function copy(text,btn){try{await navigator.clipboard.writeText(text);if(btn){const o=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=o,1500)}else toast('Copied')}catch(e){toast('Press and hold to copy: '+text)}}

/* ---------- icons ---------- */
const I={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
 band:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="4"/><rect x="9" y="9.5" width="6" height="5" rx="1.5"/></svg>',
 wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 grid:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="2.2"/><circle cx="12" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="6" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="18" cy="12" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="12" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 nfc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8.5a6 6 0 0 1 0 7"/><path d="M9.5 6a10 10 0 0 1 0 12"/><path d="M13 3.5a14 14 0 0 1 0 17"/><rect x="16" y="5" width="5" height="14" rx="1.5"/></svg>',
 qr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>',
 share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
 copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
 instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none"/></svg>',
 tiktok:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.2 6.2 0 1 0 5.3 6.1V8.6a7.6 7.6 0 0 0 4.4 1.4V6.7a4.5 4.5 0 0 1-4.4-4.7z"/></svg>',
 snapchat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.8c3.1 0 5.2 2.3 5.2 5.4v2.3l1.9-.6c.6-.2 1 .6.4 1l-2 1.2c.5 1.7 1.8 3 3.6 3.6-.3.9-1.6 1.1-2.6 1.3l-.4 1.4c-1-.2-2.2-.2-3.2.5-.9.6-1.7 1.1-2.9 1.1s-2-.5-2.9-1.1c-1-.7-2.2-.7-3.2-.5L5.5 17c-1-.2-2.3-.4-2.6-1.3 1.8-.6 3.1-1.9 3.6-3.6l-2-1.2c-.6-.4-.2-1.2.4-1l1.9.6V8.2C6.8 5.1 8.9 2.8 12 2.8z"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
 check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
 left:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>',
 right:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>',
 play:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>',
 badge:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5l2.6 2 3.2-.3 1 3.1 2.8 1.6-1 3.1 1 3.1-2.8 1.6-1 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-1-3.1L2.4 14l1-3.1-1-3.1 2.8-1.6 1-3.1 3.2.3z"/><path d="M7.6 12.2l3 3 5.8-6" fill="none" stroke="#fff" stroke-width="2.4"/></svg>',
 card:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
 plus:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>'
};
const SOCIALS=[
 {k:'instagram',label:'Instagram',url:x=>'https://www.instagram.com/'+x+'/'},
 {k:'tiktok',label:'TikTok',url:x=>'https://www.tiktok.com/@'+x},
 {k:'snapchat',label:'Snapchat',url:x=>'https://www.snapchat.com/add/'+x},
 {k:'x',label:'X',url:x=>'https://x.com/'+x}];
function gearArt(kind,color){
  const c=/^#[0-9a-f]{6}$/i.test(color||'')?color:'#d8ff2e';
  if(kind==='gloves')return `<svg viewBox="0 0 120 100" aria-hidden="true"><g stroke="#0b1220" stroke-width="2.5" stroke-linejoin="round"><path d="M30 92V58l-9-16c-3-5 3-10 7-6l10 12V18c0-6 9-6 9 0v26V12c0-6 9-6 9 0v32V16c0-6 9-6 9 0v30V24c0-6 9-6 9 0v38c0 16-7 30-20 30z" fill="${c}"/><path d="M30 80h38v12H30z" fill="#0b1220"/><path d="M40 60c6 4 14 4 20 0" fill="none"/></g><g stroke="#0b1220" stroke-width="2.5" stroke-linejoin="round" transform="translate(30 4)"><path d="M58 88V54l9-16c3-5-3-10-7-6l-10 12V14c0-6-9-6-9 0v26V8c0-6-9-6-9 0v32V12c0-6-9-6-9 0v30V20c0-6-9-6-9 0v38c0 16 7 30 20 30z" fill="${c}" opacity=".85"/></g></svg>`;
  if(kind==='cleats')return `<svg viewBox="0 0 140 90" aria-hidden="true"><g stroke="#0b1220" stroke-width="2.5" stroke-linejoin="round"><path d="M12 62c0-10 4-24 10-30 4 6 14 10 24 8l16-6c8-3 14 2 22 8 10 7 30 10 40 14 6 2 8 6 6 12H18c-4 0-6-2-6-6z" fill="${c}"/><path d="M10 68h120v6c0 2-2 4-4 4H14c-2 0-4-2-4-4z" fill="#0b1220"/><path d="M22 78l3 8h8l3-8M52 78l3 8h8l3-8M86 78l3 8h8l3-8M112 78l3 8h8l3-8" fill="#0b1220"/><path d="M46 52c10 2 24 0 34-6M62 40l6 8M72 38l6 8M82 40l5 7" fill="none"/><path d="M84 58c10-4 22-2 32 4" fill="none"/></g></svg>`;
  return `<svg viewBox="0 0 120 100" aria-hidden="true"><g stroke="#0b1220" stroke-width="2.5" stroke-linejoin="round"><path d="M24 34h72l-6 58H30z" fill="${c}"/><path d="M42 34c0-12 8-20 18-20s18 8 18 20" fill="none"/></g></svg>`;
}

/* ---------- data helpers ---------- */
const athletes=()=>STATE.athletes||[];
const mp=()=>String(STATE.pay?.memberPrice||'23.99').replace(/^\$/,'');
const current=()=>athletes().find(a=>a.slug===S.slug)||athletes()[0];
const first=n=>(n||'').split(' ')[0];
const wPhoto=tok=>{const u=(STATE.watch?.photos||{})[tok];return u&&/^(assets\/[0-9a-f]{32}\.(jpg|mp4)|https:\/\/[\w.-]+\/storage\/v1\/object\/public\/[\w\-.\/%]+)$/.test(u)?u:''};
const wClaim=tok=>((STATE.watch||{}).claims||{})[tok]||null;
const isVerified=tok=>!!wPhoto(tok)||wClaim(tok)?.status==='verified';
const vb=()=>h('span',{class:'vb',title:'Verified',html:I.check});
const wAv=(tok,name)=>{const u=wPhoto(tok);return h('span',{class:'wav'+(u?' ph':''),'aria-hidden':'true'},u?h('img',{src:u,alt:''}):initials(name),isVerified(tok)?vb():null)};
const SPORTS=['Football','Girls flag football'];
const PF={q:'',pos:'',cls:'',sport:'',mode:'ours'};
const WF={q:'',pos:'',cls:'2027',state:'',sport:'Football'};
const STAT_GROUPS=[
 {title:'Academics',keys:[['gpa','GPA','',true]]},
 {title:'Combine',keys:[['forty','40-yard dash','s'],['shuttle','Pro shuttle','s'],['lcone','L-cone drill','s'],['broad','Broad jump',''],['vertical','Vertical jump','in']]},
 {title:'Track',keys:[['m100','100 meter','s'],['m200','200 meter','s'],['m400','400 meter','s']]}];

/* ---------- render: public page ---------- */
let gearTimer=null;
function render(){
  const app=$('app');app.replaceChildren();
  if(!S.slug||S.slug==='home'){app.append(topbar(null,false,true),home());document.title='Future All American | FAA Recruit';clearInterval(gearTimer);return}
  if(S.slug==='prospects'){app.append(topbar(null,true),prospects());document.title='Prospect search | FAA Recruit';clearInterval(gearTimer);return}
  if(S.slug==='me'){clearInterval(gearTimer);app.append(topbar(null,false,false,'me'),dashboard());document.title='My dashboard | FAA Recruit';return}
  if(S.slug==='revenue'){clearInterval(gearTimer);app.append(topbar(null,false,false,'admin'),revenuePage());document.title='Revenue | FAA Recruit';return}
  if(S.slug==='admin'){clearInterval(gearTimer);app.append(topbar(null,false,false,'admin'),adminView());document.title='Company | FAA Recruit';return}
  if(S.slug==='chat'){clearInterval(gearTimer);app.append(topbar(null,false,false,'chat'),chatView());document.title='Chat | FAA Recruit';return}
  const shm=/^share(?:-(.+))?$/.exec(S.slug||'');
  if(shm){clearInterval(gearTimer);app.append(topbar(null,false,false,'share'),sharePage(shm[1]||''));document.title='Share & Earn | FAA Recruit';return}
  if(S.slug==='wallet'){clearInterval(gearTimer);app.append(topbar(null,false,false,'wallet'),walletPage());document.title='ATHX Wallet | FAA Recruit';return}
  if(S.slug==='passport'){clearInterval(gearTimer);app.append(topbar(null,false,false,'passport'),h('div',{class:'wrap'},h('section',{class:'dash'},passportCard())));document.title='AthleteX Passport | FAA Recruit';return}
  if(S.slug==='signin'){clearInterval(gearTimer);app.append(topbar(null,false,false,'signin'),signInPage());document.title='Sign In | FAA Recruit';return}
  if(S.slug==='connect'||S.slug==='app'){clearInterval(gearTimer);app.append(topbar(null,false,false,'connect'),appPage());document.title='Connect | FAA Recruit';return}
  const cm=/^code-(.+)$/.exec(S.slug||'');
  if(cm){clearInterval(gearTimer);app.append(topbar(null,false,false,'code'),codePage(cm[1]));return}
  let wm=/^w(20\d\d)-(\d{1,3})$/.exec(S.slug||'')||/^g-(\d{1,3})$/.exec(S.slug||'');
  if(wm){clearInterval(gearTimer);app.append(topbar(null,true),watchProfile(S.slug));return}
  const a=current();
  app.append(topbar(a));
  if(!a){app.append(h('div',{class:'wrap'},h('section',null,h('div',{class:'panel',style:'padding:28px;text-align:center;display:grid;gap:10px'},h('h2',{style:'font-size:2rem'},'No athletes yet'),h('p',{class:'muted'},'The owner adds the first athlete page from Edit page.')))));return}
  document.title=a.name+' | FAA Recruit';
  const w=h('div',{class:'wrap'});
  w.append(hero(a),numbers(a),...(isUnlocked(a)?[nftSection(a),calendarSection(a),gear(a),giftCards(a),sponsors(a),payments(a)]:[lockedCard(a)]));
  w.append(h('footer',null,h('p',null,'Future All American LLC · Tucson, Arizona'),h('p',null,'Recruiting and sponsor inquiries: ',h('b',{style:'user-select:all'},STATE.org?.phone||'(520) 440-0341'),'. Athletes under 18 are contacted through their parent or guardian.'),h('p',null,'Future All American may earn a referral commission on purchases made through links on this page.')));
  app.append(w);startGear();
}
const isMember=()=>!!S.uid&&athletes().some(x=>x.uid===S.uid);
function topbar(a,onSearch,onHome,cur){
  const list=athletes();const lead=athletes()[0];
  return h('header',{class:'top'},h('div',{class:'wrap top-in'},
    h('a',{class:'brand',href:'#home'},h('span',{class:'mark'},'FA'),h('span',null,h('b',null,'FAA Recruit'),h('small',null,'FUTURE ALL AMERICAN'))),
    h('div',{class:'top-actions'},
      a&&list.length>1?h('select',{'aria-label':'Choose athlete',onchange:e=>{location.hash=e.target.value}},list.map(x=>h('option',{value:x.slug,selected:x.slug===a?.slug},x.name))):null,
      S.uid?h('a',{class:'btn ghost sm',href:'#me'},'My Account'):h('a',{class:'btn sm',href:'#signin'},'Sign In'))),
    sponsorStrip(a),
    dock(a,onSearch,onHome,cur));
}
function home(){
  const a=athletes()[0];const W=STATE.watch||{classes:{}};
  const top=((W.classes||{})['2027']||{rows:[]}).rows.slice(0,5);
  const st=a?.stats||{};const offers=(a?.offers||[]).filter(o=>o.school);const r=a?.ratings||{};
  const fortyRaw=String(st.forty||'');const forty=fortyRaw.replace(/e$/i,'');
  const feat=a?h('article',{class:'panel feat'},
    h('a',{class:'feat-photo',href:'#'+a.slug,'aria-label':'Open '+a.name+"'s page"},a.photo?h('img',{src:a.photo,alt:a.name}):null,h('span',{class:'chip red tagline',style:'background:#000a'},'Featured athlete')),
    h('div',{class:'feat-body'},
      h('p',{class:'eyebrow'},[a.pos,a.cls&&'Class of '+a.cls,a.team].filter(Boolean).join(' · ')),
      h('h2',null,first(a.name)+' ',h('span',null,a.name.split(' ').slice(1).join(' '))),
      r.faaStars?starRow(r.faaStars,r.faaStars+'-star athlete'):null,
      h('div',{class:'feat-stats'},[['Height',a.height],['Weight',a.weight&&a.weight+' lb'],['GPA',st.gpa],['40 yd',forty&&forty+'s'],['Shuttle',st.shuttle&&st.shuttle+'s'],['Vertical',st.vertical&&st.vertical+'"'],['Broad',st.broad],['100m',st.m100&&st.m100+'s']].filter(x=>x[1]).slice(0,8).map(([k,v])=>h('div',null,h('b',null,v),h('small',null,k)))),
      offers.length?h('div',{style:'display:grid;gap:6px'},h('small',{class:'eyebrow',style:'color:var(--muted)'},offers.length+' verified offers'),h('div',{class:'mini-offers'},offers.map(o=>h('span',{class:'badge',title:o.school,style:`background:${o.bg||'#1b2f57'};color:${o.fg||'#fff'};border-color:${o.fg||'#fff'};font-size:${(o.abbr||'').length>3?'.55rem':'.7rem'}`},o.logo?h('img',{src:o.logo,alt:o.school}):(o.abbr||initials(o.school)))))):null,
      h('div',{class:'row'},h('a',{class:'btn',href:'#'+a.slug},'Open '+first(a.name)+"'s page"),(a.highlights||[]).length?h('button',{class:'btn ghost',onclick:()=>openHighlights(a)},h('span',{html:I.play,style:'display:grid'}),'Highlights'):null))):null;
  const list=[['Verified numbers','GPA, combine and track times entered only by Future All American.'],['Offers & ratings','College offers with verified checks, plus star rating and NIL links.'],['Highlights','Game film that plays right on the page.'],['Gear wishlist','Fans gift cleats and gloves through our partner links.'],['Sponsors','Local brands get a spot on the athlete\'s page.'],['Socials','Instagram, TikTok, Snapchat and X in one tap.']];
  return h('div',{class:'wrap'},
    h('section',{class:'home-hero'},h('p',{class:'eyebrow'},'Future All American · Tucson, Arizona'),h('h1',null,'Get seen.',h('span',null,'Get supported.')),
      h('p',{class:'lede'},'Every Future All American athlete gets a micro page: measured numbers, verified offers, highlights, a gear wishlist and sponsors. Share one link and let the work speak.'),
      h('div',{class:'row'},a?h('a',{class:'btn',href:'#'+a.slug},'See an example page'):null,h('a',{class:'btn ghost',href:'#prospects'},'Search prospects'))),
    feat?h('section',null,h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'The example'),h('h2',null,'Featured athlete'))),feat):null,
    h('section',null,h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'On every athlete page'),h('h2',null,'What you get'))),
      h('div',{class:'features'},list.map(([t,d])=>h('div',{class:'panel feature'},h('b',null,t),h('span',null,d))))),
    top.length?h('section',null,h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'National watch list · information only'),h('h2',null,'Top of 2027')),h('a',{class:'btn ghost sm',href:'#prospects',onclick:()=>{PF.mode='watch'}},'Full watch list')),
      h('div',{class:'plist',style:'margin-top:0'},top.map(rw=>h('a',{class:'wrow flag',href:'#w2027-'+rw[0]},h('span',{class:'wrank'},rw[0]),wAv('w2027-'+rw[0],rw[1]),h('span',{style:'min-width:0'},h('b',null,rw[1]),h('span',{class:'meta'},[rw[2],rw[3]].join(' · '))),h('span',{class:'wrate'},h('b',null,rw[6]),h('small',null,'RATING'))))),
      h('p',{class:'disclose'},'Rankings from Rivals. These athletes are not affiliated with Future All American.')):null,
    flagTopCard(),
    h('section',null,h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'For athletes'),h('h2',null,'Want a page like this?'))),membershipCard(null,null,true)),
    h('section',null,h('div',{class:'panel',style:'padding:20px;display:grid;gap:10px'},h('h2',{style:'font-size:2rem'},'Questions?'),h('p',{class:'muted'},'Athletes and parents: call or text Future All American at ',h('b',{style:'user-select:all'},STATE.org?.phone||'(520) 440-0341'),'. Brands: sponsor an athlete and your logo rides on their page.'),a?h('button',{class:'btn ghost sm',style:'justify-self:start',onclick:openSponsorInquiry},'Become a sponsor'):null)),
    h('footer',null,h('p',null,'Future All American LLC · Tucson, Arizona'),h('p',null,'Future All American may earn a referral commission on purchases made through links on this site.')));
}
function flagTopCard(){
  const F=STATE.watch?.flag;const r=F?.rows?.[0];if(!r)return null;const tok='g-'+r[0];const ph=wPhoto(tok);
  const mp=r[5]?'https://www.maxpreps.com/'+r[5]:'https://www.maxpreps.com/search/?q='+encodeURIComponent(r[1]);
  return h('section',null,h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Girls Flag Football · MaxPreps Top 100'),h('h2',null,'#1 In The Nation')),
      h('a',{class:'btn ghost sm',href:'#prospects',onclick:()=>{PF.mode='watch';WF.sport='Girls flag football';WF.cls=''}},'Full Top 100')),
    h('div',{class:'panel wp-hero',style:'border-color:#f107a3'},
      h('a',{class:'wp-av',style:'text-decoration:none;color:var(--fg)',href:'#'+tok,'aria-label':'Open '+r[1]+"'s profile"},ph?h('img',{src:ph,alt:''}):h('span',null,initials(r[1])),isVerified(tok)?vb():null),
      h('div',{style:'display:grid;gap:8px;min-width:0'},
        h('span',{class:'freechip',style:'background:linear-gradient(90deg,#7b2ff7,#f107a3);color:#fff'},'#1 · Girls Flag Football'),
        h('h2',{style:'font-size:clamp(2.2rem,8vw,3.2rem);font-style:italic'},r[1]),
        h('p',{class:'muted'},['Class of '+r[2],r[3],r[4]].filter(Boolean).join(' · ')),
        h('div',{class:'row'},h('a',{class:'btn sm',href:'#'+tok},'View Profile'),h('a',{class:'ext maxpreps',href:mp,target:'_blank',rel:'noopener'},'MaxPreps ↗'),h('button',{class:'btn ghost sm',onclick:()=>openConnect(tok)},'QR & NFC')))),
    h('p',{class:'disclose'},'From the '+(F.title||'MaxPreps Top 100 girls flag football players to watch')+'. Not affiliated with Future All American.'));
}
function prospects(){
  const seg=h('div',{class:'seg',role:'group','aria-label':'Which list'},
    h('button',{'aria-pressed':PF.mode==='ours'?'true':'false',onclick:()=>{PF.mode='ours';render()}},'Our athletes'),
    h('button',{'aria-pressed':PF.mode==='watch'?'true':'false',onclick:()=>{PF.mode='watch';render()}},'National watch list'));
  const body=PF.mode==='watch'?watchList():ourProspects();
  return h('div',{class:'wrap'},h('section',null,seg,body));
}
function watchList(){
  const W=STATE.watch||{classes:{}};
  const sportSel=h('label',{for:'wf_sport'},'Category',h('select',{id:'wf_sport',onchange:e=>{WF.sport=e.target.value;WF.cls=WF.sport==='Football'?'2027':'';WF.pos='';WF.state='';render()}},['Football',...(W.flag?['Girls flag football']:[])].map(o=>h('option',{selected:WF.sport===o},o))));
  if(WF.sport!=='Football'&&W.flag)return flagList(W,sportSel);
  const classes=[...new Set([...Object.keys(W.classes||{}),'2030','2031','2032','2033','2034'])].sort();
  if(!classes.includes(WF.cls))WF.cls=classes[0]||'';
  const C=(W.classes||{})[WF.cls]||{rows:[]};
  const rows=(C.rows||[]).map(r=>({rank:r[0],name:r[1],pos:r[2],school:r[3],loc:r[4],hw:r[5],rating:r[6],slug:r[7],url:r[7]?'https://www.on3.com/rivals/'+r[7]+'/':''}));
  const positions=[...new Set(rows.map(r=>r.pos))].sort();const states=[...new Set(rows.map(r=>(r.loc.split(',')[1]||'').trim()).filter(Boolean))].sort();
  const results=h('div',{class:'plist','aria-live':'polite'});const count=h('p',{class:'small muted'});
  const draw=()=>{const q=WF.q.trim().toLowerCase();
    const f=rows.filter(r=>(!WF.pos||r.pos===WF.pos)&&(!WF.state||(r.loc.split(',')[1]||'').trim()===WF.state)&&(!q||[r.name,r.school,r.loc].join(' ').toLowerCase().includes(q)));
    count.textContent=f.length+' of '+rows.length+' prospects';
    results.replaceChildren(...(f.length?f.map(r=>h('a',{class:'wrow flag',href:'#w'+WF.cls+'-'+r.rank,'aria-label':r.name+' profile'},h('span',{class:'wrank'},r.rank),wAv('w'+WF.cls+'-'+r.rank,r.name),
      h('span',{style:'min-width:0'},h('b',null,r.name),h('span',{class:'meta'},[r.pos,r.hw&&r.hw.replace(/\s+/g,'')+' lb',r.school,r.loc].filter(Boolean).join(' · '))),
      h('span',{class:'wrate'},r.rating?h('b',null,r.rating):null,h('small',null,'RATING'),wCommitTag(r.slug)))):[h('p',{class:'muted'},'No prospects match those filters.')]))};
  const sel=(key,label,opts)=>h('label',{for:'wf_'+key},label,h('select',{id:'wf_'+key,onchange:e=>{WF[key]=e.target.value;if(key==='cls'){WF.pos='';WF.state='';render()}else draw()}},key==='cls'?null:h('option',{value:''},'All'),opts.map(o=>h('option',{value:o,selected:WF[key]===o},o))));
  draw();
  const src=safeUrl(C.source);
  return [
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Information only · not Future All American athletes'),h('h2',null,'National watch list')),count),
    h('div',{class:'pfilters'},h('label',{class:'q',for:'wf_q'},'Name, school or city',h('input',{id:'wf_q',type:'search',value:WF.q,placeholder:'Search',oninput:e=>{WF.q=e.target.value;draw()}})),sportSel,sel('cls','Class',classes),sel('pos','Position',positions),sel('state','State',states)),
    rows.length?h('p',{class:'wnote',style:'margin-top:12px'},'Top '+rows.length+' of the Rivals '+WF.cls+' football rankings'+(C.updated?' (updated '+C.updated+')':'')+'. Tap any player for their ratings, offers, commitment and connect code. These athletes are not represented by or affiliated with Future All American. ',src?h('a',{href:src,target:'_blank',rel:'noopener'},'Full rankings on Rivals ↗'):null):null,
    rows.length?results:futureClass(WF.cls),
    rows.length?h('p',{class:'wnote',style:'margin-top:14px'},(W.missing||'')):null];
}
function flagList(W,sportSel){
  const F=W.flag;const rows=F.rows.map(r=>({rank:r[0],name:r[1],cls:r[2],school:r[3],loc:r[4],url:r[5]?'https://www.maxpreps.com/'+r[5]:''}));const src=safeUrl(F.source);
  const classes=[...new Set(rows.map(r=>r.cls))].sort();const states=[...new Set(rows.map(r=>(r.loc.split(',')[1]||'').trim()).filter(Boolean))].sort();
  const results=h('div',{class:'plist','aria-live':'polite'});const count=h('p',{class:'small muted'});
  const draw=()=>{const q=WF.q.trim().toLowerCase();
    const f=rows.filter(r=>(!WF.cls||r.cls===WF.cls)&&(!WF.state||(r.loc.split(',')[1]||'').trim()===WF.state)&&(!q||[r.name,r.school,r.loc].join(' ').toLowerCase().includes(q)));
    count.textContent=f.length+' of '+rows.length+' players';
    results.replaceChildren(...(f.length?f.map(r=>h('a',{class:'wrow flag',href:'#g-'+r.rank,'aria-label':r.name+' profile'},h('span',{class:'wrank'},r.rank),wAv('g-'+r.rank,r.name),
      h('span',{style:'min-width:0'},h('b',null,r.name),h('span',{class:'meta'},['Class of '+r.cls,r.school,r.loc].join(' · '))),
      h('span',{class:'wrate'},h('small',null,'PROFILE ›')))):[h('p',{class:'muted'},'No players match those filters.')]))};
  const sel=(key,label,opts)=>h('label',{for:'wf_'+key},label,h('select',{id:'wf_'+key,onchange:e=>{WF[key]=e.target.value;draw()}},h('option',{value:''},'All'),opts.map(o=>h('option',{value:o,selected:WF[key]===o},o))));
  draw();
  return [
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Information only · not Future All American athletes'),h('h2',null,'National watch list')),count),
    h('div',{class:'pfilters'},h('label',{class:'q',for:'wf_q'},'Name, school or city',h('input',{id:'wf_q',type:'search',value:WF.q,placeholder:'Search',oninput:e=>{WF.q=e.target.value;draw()}})),sportSel,sel('cls','Class',classes),sel('state','State',states)),
    h('p',{class:'wnote',style:'margin-top:12px'},F.title+' (published '+F.updated+'). Classes are for the 2026-27 school year. Tap a player for her profile, with a link to MaxPreps. These athletes are not represented by or affiliated with Future All American. ',src?h('a',{href:src,target:'_blank',rel:'noopener'},'Full list on MaxPreps ↗'):null),
    results];
}
function watchProfile(tok){
  const W=STATE.watch||{classes:{}};let r=null,src='',srcName='',cls='',sport='Football',list='',upd='';
  let m=/^w(20\d\d)-(\d+)$/.exec(tok);
  if(m){const C=(W.classes||{})[m[1]];const row=C&&(C.rows||[]).find(x=>x[0]===m[2]);
    if(row){r={rank:row[0],name:row[1],pos:row[2],school:row[3],loc:row[4],hw:row[5],rating:row[6]};src=row[7]?'https://www.on3.com/rivals/'+row[7]+'/':safeUrl(C.source);srcName='Rivals';cls=m[1];list='Rivals '+m[1]+' football ranking';upd=C.updated;WF.sport='Football';WF.cls=m[1]}}
  else if((m=/^g-(\d+)$/.exec(tok))&&W.flag){const row=W.flag.rows.find(x=>x[0]===m[1]);
    if(row){r={rank:row[0],name:row[1],school:row[3],loc:row[4]};cls=row[2];src=row[5]?'https://www.maxpreps.com/'+row[5]:safeUrl(W.flag.source);srcName='MaxPreps';sport='Girls flag football';list='MaxPreps Top 100 girls flag football players to watch, 2026-27';upd=W.flag.updated;WF.sport='Girls flag football';WF.cls=''}}
  PF.mode='watch';
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  if(!r){sec.append(h('div',{class:'panel',style:'padding:20px'},h('h2',{style:'font-size:2rem'},'Player not found'),h('a',{class:'btn ghost sm',href:'#prospects',style:'margin-top:10px'},'Back to watch list')));return w}
  document.title=r.name+' | FAA Recruit';
  const [ht,wt]=(r.hw||'').split('/');
  const facts=[['National rank','#'+r.rank],['Position',r.pos],['Class',cls],['Height',ht],['Weight',wt&&wt+' lb'],['Rating',r.rating],['School',r.school],['Hometown',r.loc],['Sport',sport]].filter(x=>x[1]);
  sec.append(
    h('a',{class:'btn ghost sm',href:'#prospects',style:'justify-self:start'},h('span',{html:I.left,style:'display:grid'}),'Watch list'),
    h('div',{class:'panel wp-hero'},h('div',{class:'wp-av','aria-hidden':'true'},wPhoto(tok)?h('img',{src:wPhoto(tok),alt:''}):h('span',null,initials(r.name)),isVerified(tok)?vb():null),
      h('div',{style:'display:grid;gap:8px;min-width:0'},h('p',{class:'eyebrow'},'National watch list · information only'),h('h1',null,r.name),
        h('p',{class:'wp-rank'},'#'+r.rank+' · '+[r.pos,cls&&'Class of '+cls,sport].filter(Boolean).join(' · ')),
        isVerified(tok)?h('span',{class:'vtag'},h('span',{html:I.check}),wClaim(tok)?.status==='verified'?'Claimed & Verified':'Verified'):null,
        claimSocials(tok),
        extLinks(tok,r),
        h('div',{class:'row'},connectBtn(tok),claimBtn(tok,r.name)),
        h('p',{class:'muted'},[r.school,r.loc].filter(Boolean).join(' · ')))),
    h('div',{class:'panel',style:'padding:16px'},h('div',{class:'ro'},facts.map(([k,v])=>h('div',null,h('small',null,k),h('b',null,v))))),
    nilCard(tok,r),
    m&&tok[0]==='w'?journey(r,slugOf(tok)):h('div',{class:'panel jr'},h('h3',null,'Offers & commitment'),h('p',{class:'muted'},'MaxPreps does not publish college offers or commitments for girls flag football, so none are listed here. Check '+r.name.split(' ')[0]+"'s MaxPreps profile for her latest stats and news.")),
    officialLink(tok),
    claimPanel(tok,r.name));
  return w;
}
function slugOf(tok){const m=/^w(20\d\d)-(\d+)$/.exec(tok);if(!m)return '';const C=((STATE.watch||{}).classes||{})[m[1]];const row=C&&(C.rows||[]).find(x=>x[0]===m[2]);return row?row[7]:''}
function wDet(slug){return slug&&((STATE.watch||{}).detail||{})[slug]||null}
function wCommitTag(slug){const d=wDet(slug);return d&&d.c?h('span',{class:'wcommit'},(d.sg?'Signed · ':'Committed · ')+d.c):null}
function fmtDate(d){if(!d)return '';const t=new Date(d+'T12:00:00');return isNaN(t)?d:t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
function journey(r,slug){
  const d=wDet(slug);const W=STATE.watch||{};
  if(!d)return h('div',{class:'panel jr'},h('h3',null,'Offers & commitment'),h('p',{class:'muted'},'No offer or commitment data on file yet.'));
  const rk=(x)=>x?h('div',{class:'ranks'},h('span',null,'NATL',h('b',null,x[2]||'–')),h('span',null,'POS',h('b',null,x[3]||'–')),h('span',null,'ST',h('b',null,x[4]||'–'))):null;
  const svc=(name,x)=>h('div',{class:'rate'},h('small',null,name),x?[h('b',null,x[0]),starRow(x[1],x[1]+' stars from '+name),rk(x)]:h('b',{class:'na'},'Not rated'));
  const i=d.i;
  return h('div',{class:'panel jr'},
    h('div',{class:'row between'},h('h3',null,'Rivals industry rating'),h('span',{class:'small muted'},'As of '+(W.detailUpdated||''))),
    i?h('div',{class:'ind'},h('span',{class:'ind-num'},i[0]),h('div',{style:'display:grid;gap:6px'},starRow(i[1],i[1]+'-star industry rating'),rk(i))):h('p',{class:'muted'},'No industry rating yet.'),
    h('div',{class:'svc'},svc('Rivals',d.r),svc('ESPN',d.e),svc('247Sports',d.s)),
    h('h3',null,'The journey'),
    d.c?h('div',{class:'commit'},h('div',{style:'display:grid;gap:4px;min-width:0'},h('span',{class:'pill'},d.sg?'Signed':'Committed'),h('b',null,d.c),h('span',{class:'small muted'},[d.cd&&'Committed '+fmtDate(d.cd),r.school&&'from '+r.school].filter(Boolean).join(' · ')))):
      h('div',{class:'row'},h('span',{class:'pill dim'},'Uncommitted'),h('span',{class:'small muted'},r.school||'')),
    h('div',{class:'row between'},h('h3',null,'Offers'),h('span',{class:'chip ok'},(d.n||d.o.length)+' offer'+((d.n||d.o.length)===1?'':'s'))),
    d.o.length?h('div',{class:'olist'},d.o.map(o=>h('span',{class:o===d.c?'c':''},o))):h('p',{class:'muted'},'No offers listed.'),
    d.o.length&&d.n>d.o.length?h('p',{class:'small muted'},'Showing '+d.o.length+' of '+d.n+' offers. The full list is on Rivals.'):null,
    h('p',{class:'small muted'},'Ratings, rankings, offers and commitment as listed on Rivals/On3. Tap Full profile on Rivals for the latest.'));
}
function top10s(){const W=STATE.watch||{};const have=new Set(athletes().map(a=>a.name.toLowerCase()));const out=[];
  Object.keys(W.classes||{}).sort().forEach(y=>(W.classes[y].rows||[]).slice(0,10).forEach(r=>{const tok='w'+y+'-'+r[0];if(have.has(r[1].toLowerCase()))return;const [ht,wt]=(r[5]||'').split('/');out.push({slug:tok,name:r[1],pos:r[2],cls:y,height:ht,weight:wt,team:r[3],school:r[3],photo:wPhoto(tok),sport:'Football',free:true,rank:r[0]})}));
  return out}
function ourProspects(){
  const list=[...athletes(),...top10s()];
  const classes=[...new Set(['2027','2028','2029','2030','2031','2032','2033','2034',...list.map(x=>x.cls).filter(Boolean)])].sort();
  const positions=[...new Set(['QB','RB','WR','TE','OL','DL','LB','DB','ATH',...list.map(x=>x.pos).filter(Boolean)])];
  const results=h('div',{class:'plist','aria-live':'polite'});const count=h('p',{class:'small muted'});
  const draw=()=>{const q=PF.q.trim().toLowerCase();
    const rows=list.filter(x=>(!PF.pos||String(x.pos||'').toUpperCase().split(/[\s/]+/).includes(PF.pos))&&(!PF.cls||x.cls===PF.cls)&&(!PF.sport||(x.sport||'Football')===PF.sport)&&(!q||[x.name,x.team,x.school].join(' ').toLowerCase().includes(q)));
    count.textContent=rows.length+' prospect'+(rows.length===1?'':'s');
    results.replaceChildren(...(rows.length?rows.map(prow):[h('div',{class:'panel',style:'padding:24px;text-align:center;display:grid;gap:8px'},h('h3',{style:'font-size:1.5rem'},'No prospects match'),h('p',{class:'muted'},'Try another position, class or name.'),S.isOwner?h('button',{class:'btn sm',style:'justify-self:center',onclick:()=>{openEditor();S.draft.athletes.length;}},'Add an athlete'):null)]))};
  const sel=(key,label,opts)=>h('label',{for:'pf_'+key},label,h('select',{id:'pf_'+key,onchange:e=>{PF[key]=e.target.value;draw()}},h('option',{value:''},'All'),opts.map(o=>h('option',{value:o,selected:PF[key]===o},o))));
  const q=h('input',{id:'pf_q',type:'search',placeholder:'Name, team or school',value:PF.q,oninput:e=>{PF.q=e.target.value;draw()}});
  draw();
  return [
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Future All American athletes'),h('h2',null,'Prospect search')),count),
    h('div',{class:'pfilters'},h('label',{class:'q',for:'pf_q'},'Name',q),sel('pos','Position',positions),sel('cls','Class',classes),sel('sport','Category',SPORTS)),
    results,
    h('p',{class:'disclose'},'Future All American athletes, plus every Top 10 player in the 2027, 2028 and 2029 classes with free access. Numbers are measured by Future All American.')];
}
function prow(x){
  const r=x.ratings||{};const offers=(x.offers||[]).filter(o=>o.school).length;
  return h('a',{class:'prow',href:'#'+x.slug},
    h('span',{class:'prow-photo'},x.photo?h('img',{src:x.photo,alt:''}):initials(x.name),x.photo?vb():null),
    h('span',{style:'min-width:0;display:grid;gap:4px'},h('h3',null,x.name),
      h('span',{class:'meta'},[x.pos,x.cls&&('Class of '+x.cls),x.height,x.weight&&(x.weight+' lb')].filter(Boolean).join(' · ')),
      h('span',{class:'meta'},[x.sport||'Football',x.team].filter(Boolean).join(' · '))),
    h('span',{class:'prow-side'},x.free?h('span',{class:'freechip',style:'font-size:.58rem'},'Top 10 · '+x.cls+' #'+x.rank):null,r.faaStars?starRow(r.faaStars):null,offers?h('span',{class:'chip ok'},offers+' offer'+(offers>1?'s':'')):null,x.stats?.gpa?h('span',{class:'small muted'},'GPA '+x.stats.gpa):null));
}
function hero(a){
  const facts=[['Pos',a.pos],['Class',a.cls],['Height',a.height||'—'],['Weight',a.weight?(a.weight+' lb'):'—'],['Grade',a.grade],['Jersey',a.number&&('#'+a.number)]].filter(x=>x[1]);
  const socials=SOCIALS.filter(s=>cleanHandle(a.socials?.[s.k]));
  return h('section',{style:'padding-top:0'},h('article',{class:'panel hero'},
    h('div',{class:'hero-photo'},a.photo?h('img',{src:a.photo,alt:a.name+' in uniform'}):h('span',{class:'ini'},initials(a.name)),a.photo?vb():null,a.number?h('span',{class:'ghost-num','aria-hidden':'true'},a.number):null,
      h('div',{class:'hero-name'},h('div',{class:'row',style:'margin-bottom:8px'},h('span',{class:'chip red',style:'background:#000a'},'Future All American'),a.team?h('span',{class:'chip',style:'background:#000a;color:#fff;border-color:#ffffff40'},a.team):null),
        h('h1',null,first(a.name),h('span',null,a.name.split(' ').slice(1).join(' '))))),
    h('div',{class:'hero-body'},
      h('div',{class:'facts'},facts.map(([k,v])=>h('div',{class:'fact'},h('b',null,v),h('small',null,k)))),
      a.bio?h('p',{class:'muted'},a.bio):null,
      teamBadge(a),
      highlightBtn(a),
      connectBtn(a.slug),
      h('div',{class:'socials'},socials.map(s=>{const hd=cleanHandle(a.socials[s.k]);return h('a',{class:'soc',href:s.url(hd),target:'_blank',rel:'noopener','aria-label':s.label+' @'+hd,title:s.label+' @'+hd,html:I[s.k]})}),
        null))));
}
function numbers(a){
  const st=a.stats||{};
  return h('section',null,
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Measured, not self-reported'),h('h2',null,'The numbers')),
      h('p',{class:'verify'},h('span',{html:I.check,style:'color:var(--ok);display:grid'}),st.verified?('Verified by Future All American · '+st.verified):'Entered only by Future All American')),
    h('div',{class:'groups'},ratingGroup(a),STAT_GROUPS.map((g,gi)=>[h('div',{class:'panel group'},h('h3',null,g.title),
      h('div',{class:'tiles'},g.keys.map(([k,label,unit,big])=>{const v=String(st[k]||'').trim();
        const et=/^([\d.]+)\s*e$/i.exec(v);const shown=et?et[1]:v;const u=et?(unit||'s'):unit;
        return h('div',{class:'tile'+(v?'':' empty')+(big&&v?' big':'')},h('small',null,label+(et?' · electronic':'')),v?h('b',null,shown,u?h('em',null,u):null):h('b',null,'Not tested'))}))),gi===0?offersGroup(a):null])));
}
function starRow(n,label){n=Math.max(0,Math.min(5,Math.round(+n||0)));return h('div',{class:'stars',role:'img','aria-label':label||(n+' out of 5 stars')},[1,2,3,4,5].map(i=>h('span',{class:i<=n?'':'off',html:I.star})))}
function ratingGroup(a){
  const r=a.ratings||{};const rv=+r.rivalsStars||0,rUrl=safeUrl(r.rivalsUrl),oUrl=safeUrl(r.on3Url);
  if(!r.faaStars&&!rv&&!r.on3Nil&&!S.isOwner)return null;
  return h('div',{class:'panel group'},h('h3',null,'Recruiting profile'),h('div',{class:'rate-grid'},
    h('div',{class:'rate'},h('small',null,'Future All American rating'),r.faaStars?[starRow(r.faaStars,r.faaStars+'-star athlete'),h('b',null,(+r.faaStars)+'-star athlete')]:h('b',{class:'na'},'Not rated yet')),
    h(rUrl?'a':'div',{class:'rate',href:rUrl||null,target:rUrl?'_blank':null,rel:rUrl?'noopener':null,style:'text-decoration:none;color:inherit'},h('small',null,'Rivals'),rv?[starRow(rv,rv+' stars on Rivals'),h('b',null,rv+'-star')]:h('b',{class:'na'},'Not on Rivals yet'),rUrl?h('span',{class:'small muted'},'View on Rivals ↗'):null),
    h(oUrl?'a':'div',{class:'rate',href:oUrl||null,target:oUrl?'_blank':null,rel:oUrl?'noopener':null,style:'text-decoration:none;color:inherit'},h('small',null,'On3 NIL valuation'),r.on3Nil?h('b',null,r.on3Nil):h('b',{class:'na'},'Not listed on On3 yet'),oUrl?h('span',{class:'small muted'},'View on On3 ↗'):null)));
}
function offersGroup(a){
  const list=(a.offers||[]).filter(o=>o.school);if(!list.length)return null;
  return h('div',{class:'panel group'},h('h3',null,'Offers',h('span',{class:'small muted',style:'font-family:var(--body);text-transform:none;font-weight:600'},list.length+' school'+(list.length>1?'s':''))),
    h('div',{class:'offers'},list.map(o=>h('div',{class:'offer'},h('span',{class:'badge',style:`background:${/^#[0-9a-f]{6}$/i.test(o.bg||'')?o.bg:'#1b2f57'};color:${/^#[0-9a-f]{6}$/i.test(o.fg||'')?o.fg:'#fff'};border-color:${/^#[0-9a-f]{6}$/i.test(o.fg||'')?o.fg:'#fff'};font-size:${(o.abbr||'').length>3?'.72rem':(o.abbr||'').length>2?'.85rem':'1rem'}`},o.logo?h('img',{src:o.logo,alt:o.school+' logo'}):(o.abbr||initials(o.school))),
      h('span',{style:'min-width:0'},h('b',null,o.school),o.verified?h('span',{class:'vchk',html:I.badge+'Verified'}):h('span',{class:'small muted'},'Pending verification'))))));
}
function gear(a){
  const items=a.wishlist||[];
  const track=h('div',{class:'gear-track',id:'gearTrack'},items.map(it=>itemCard(a,it)));
  if(S.db&&S.uid&&!S.isOwner)track.append(h('article',{class:'panel item'},h('div',{class:'item-art',html:I.plus,style:'color:var(--muted)'}),h('div',{class:'item-body'},h('h3',null,'Need something else?'),h('p',{class:'item-meta'},'Send gear you need. Future All American reviews it before it shows here.'),h('button',{class:'btn ghost sm',onclick:()=>openRequest('gear')},'Suggest gear'))));
  return h('section',null,
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Gear wishlist'),h('h2',null,'Gear up '+first(a.name))),
      h('button',{class:'btn ghost sm',onclick:()=>openBrandPicker(a)},'Pick From Nike, adidas, UA, Puma'),
      items.length>1?h('div',{class:'ctrl'},h('button',{class:'arrow','aria-label':'Previous item',onclick:()=>stepGear(-1),html:I.left}),h('button',{class:'arrow','aria-label':'Next item',onclick:()=>stepGear(1),html:I.right})):null),
    items.length||(S.db&&S.uid)?h('div',{class:'gear',onpointerenter:()=>gearPause=true,onpointerleave:()=>gearPause=false,onfocusin:()=>gearPause=true,onfocusout:()=>gearPause=false,ontouchstart:()=>gearPause=true},track):
      h('div',{class:'panel',style:'padding:20px;text-align:center'},h('p',{class:'muted'},'No gear on the wishlist yet.')),
    h('ol',{class:'steps'},
      h('li',null,h('b',null,'Pick an item'),'Tap Gift it on anything '+first(a.name)+' needs.'),
      h('li',null,h('b',null,'Send the gift'),'Pay Future All American by card, Venmo, Cash App or Zelle.'),
      h('li',null,h('b',null,'We order it'),'Future All American buys it through our partner links and gets it to '+first(a.name)+"'s family.")),
    h('p',{class:'disclose'},'Gifts count as donations received by '+(STATE.org?.nonprofit||'Future All American Academy')+', which buys the item listed. Future All American may earn a referral commission from the retailer.'));
}
function highlightBtn(a){
  const n=(a.highlights||[]).length;
  if(!n&&!(S.db&&S.uid))return null;
  return h('button',{class:'hl-btn',onclick:()=>openHighlights(a)},h('span',{class:'hl-play',html:I.play}),h('span',{style:'flex:1;min-width:0'},h('b',null,n?'Watch highlights':'Highlights coming soon'),h('span',{class:'small muted'},n?(n+' clip'+(n>1?'s':'')):(S.isOwner?'Add clips in Edit page':'Upload your first clip'))),h('span',{html:I.right}));
}
function openHighlights(a,start){
  const list=a.highlights||[];let idx=Math.max(0,list.findIndex(x=>x.id===start));
  const body=h('div',{class:'dlg-body'});
  const draw=()=>{const cur=list[idx];body.replaceChildren(
    cur?(cur.url?h('video',{class:'player',src:cur.url,poster:/^(assets\/[0-9a-f]{32}\.(jpg|mp4)|https:\/\/[\w.-]+\/storage\/v1\/object\/public\/[\w\-.\/%]+)$/.test(cur.poster||'')?cur.poster:null,controls:true,playsinline:true,preload:'metadata'}):h('a',{class:'btn',href:safeUrl(cur.link),target:'_blank',rel:'noopener'},'Watch "'+(cur.title||'Highlight')+'" ↗')):h('p',{class:'muted'},'No highlights yet.'),
    cur?h('b',null,cur.title||'Highlight'):null,
    list.length>1?h('div',{class:'hl-list'},list.map((x,i)=>h('button',{class:'hl-item','aria-current':i===idx?'true':'false',onclick:()=>{idx=i;draw()}},h('span',{class:'hl-play',style:'width:30px;height:30px',html:I.play}),h('span',null,x.title||('Clip '+(i+1)),x.url?'':' ↗')))):null,
    (S.db&&S.uid&&!S.isOwner)?h('button',{class:'btn ghost sm',style:'justify-self:start',onclick:()=>openRequest('video')},'Upload a highlight'):null)};
  draw();openDlg(first(a.name)+"'s highlights",body);
}
function itemCard(a,it){
  const price=money(it.price),link=affLink(it.link);
  return h('article',{class:'panel item'},
    (()=>{const art=h('div',{class:'item-art'},it.photo?h('img',{src:it.photo,alt:it.name}):h('span',{html:gearArt(it.kind,it.swatch),style:'display:grid;place-items:center;width:100%;height:100%'}),it.funded?h('span',{class:'chip ok'},'Gifted ✓'):h('span',{class:'chip'},it.brand||'Gear'),it.funded?null:h('span',{class:'tap'},'Tap to gift'));
      return it.funded?art:h('button',{class:'art-btn','aria-label':'Gift '+it.name,onclick:()=>openGift(a,it)},art)})(),
    h('div',{class:'item-body'},
      h('h3',null,it.name),
      h('p',{class:'item-meta'},[it.color,it.size].filter(Boolean).join(' · ')),
      h('div',{class:'row between'},price?h('span',{class:'price'},fmt(price)):h('span',{class:'muted small'},'Price varies'),link?h('a',{class:'small muted',href:link,target:'_blank',rel:'noopener sponsored'},'View item ↗'):null),
      h('div',{class:'item-actions'},it.funded?h('span',{class:'small',style:'color:var(--ok);font-weight:700'},'Already gifted. Thank you!'):h('button',{class:'btn volt',onclick:()=>openGift(a,it)},'Gift it'))));
}
let gearPause=false;
function stepGear(d){const t=$('gearTrack');if(!t)return;const card=t.firstElementChild;if(!card)return;const w=card.getBoundingClientRect().width+12;const max=t.scrollWidth-t.clientWidth-2;let next=t.scrollLeft+d*w;if(next>max+1)next=0;else if(next<-1)next=max;t.scrollTo({left:next})}
function startGear(){clearInterval(gearTimer);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;gearTimer=setInterval(()=>{const t=$('gearTrack');if(!t||gearPause||document.hidden||$('dlg').open)return;if(t.scrollWidth>t.clientWidth+4)stepGear(1)},3800)}
function sponsors(a){
  const list=[...(STATE.globalSponsors||[]),...activeSponsors(a)];const nOpen=openSpots(a).length;
  const tile=(s,hidden)=>{const url=safeUrl(s.url);const inner=[h('span',{class:'spon-logo'},s.logo?h('img',{src:s.logo,alt:''}):initials(s.name)),h('span',null,h('b',null,s.name),s.tagline?h('small',null,s.tagline):null)];
    return url?h('a',{class:'spon',href:url,target:'_blank',rel:'noopener sponsored','aria-hidden':hidden?'true':null,tabindex:hidden?'-1':null},inner):h('span',{class:'spon','aria-hidden':hidden?'true':null},inner)};
  const open=hidden=>nOpen?h('button',{class:'spon open',onclick:()=>openSponsorInquiry(a,openSpots(a)[0]),'aria-hidden':hidden?'true':null,tabindex:hidden?'-1':null},h('span',{class:'spon-logo',html:I.plus}),h('span',null,h('b',null,'Spot '+openSpots(a)[0]+' Open'),h('small',null,'$'+(STATE.pay?.sponsorPrice||'10')+'/month · '+nOpen+' of '+spotCount()+' spots open'))):null;
  const set=hidden=>[...list.map(s=>tile(s,hidden)),open(hidden)];
  let reps=Math.max(1,Math.ceil(6/(list.length+1)));const base=[];for(let i=0;i<reps;i++)base.push(...set(i>0));
  const dup=[];for(let i=0;i<reps;i++)dup.push(...set(true));
  const trackEl=h('div',{class:'marquee-track',style:'--dur:'+Math.max(18,(list.length+1)*reps*5)+'s'},base,dup);
  return h('section',null,
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Sponsors'),h('h2',null,'Backed by')),h('button',{class:'btn ghost sm',onclick:()=>openSponsorInquiry(a)},'Sponsor · $'+(STATE.pay?.sponsorPrice||'10')+'/Month')),
    h('div',{class:'marquee'},trackEl));
}
function payments(a){
  const p=STATE.pay||{};
  const cards=[
    p.venmo&&{name:'Venmo',color:'#008cff',letter:'V',handle:'@'+p.venmo,link:'https://venmo.com/u/'+encodeURIComponent(p.venmo),copyText:'@'+p.venmo},
    p.cashapp&&{name:'Cash App',color:'#00b244',letter:'$',handle:'$'+p.cashapp,link:'https://cash.app/$'+encodeURIComponent(p.cashapp),copyText:'$'+p.cashapp},
    p.zelle&&{name:'Zelle',color:'#6d1ed4',letter:'Z',handle:fmtPhone(p.zelle),link:'',copyText:p.zelle}].filter(Boolean);
  const stripe=safeUrl(p.stripe);
  return h('section',null,
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Support '+first(a.name)+' · '+(STATE.org?.nonprofit||'Future All American Academy')+' 501(c)(3)'),h('h2',null,'Donate'))),
    h('details',{class:'drop'},h('summary',null,h('span',null,'How to donate to '+first(a.name)),h('span',{class:'chev',html:I.right})),
    h('div',{class:'drop-body'},
    h('p',{class:'muted'},'Donations are received by '+(STATE.org?.nonprofit||'Future All American Academy')+', a 501(c)(3) nonprofit, and support '+a.name+"'s gear, training and travel. Put "+a.name+"'s name in the note."+(STATE.org?.ein?' EIN '+STATE.org.ein+'.':'')),
    stripe?h('a',{class:'btn stripe',href:stripe,target:'_blank',rel:'noopener',html:I.card+' Donate with Apple Pay or card'}):null,
    h('div',{class:'pays'},cards.map(c=>h('div',{class:'panel pay'},h('div',{class:'pay-top'},h('span',{class:'pay-icon',style:'background:'+c.color},c.letter),h('span',null,h('b',null,c.name),h('span',{class:'handle'},c.handle))),
      h('div',{class:'row'},c.link?h('a',{class:'btn sm',href:c.link,target:'_blank',rel:'noopener'},'Open '+c.name):null,h('button',{class:'btn ghost sm',onclick:e=>copy(c.copyText,e.currentTarget)},'Copy'))))))));
}
function fmtPhone(z){const d=String(z).replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:z}

/* ---------- video: shrink large or unsupported clips in the browser ---------- */
const VID_MAX=19*1024*1024;
function pickMime(){const c=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];if(typeof MediaRecorder==='undefined')return '';return c.find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}})||''}
function needsShrink(f){return f.size>VID_MAX||!/^video\/(mp4|webm)$/i.test(f.type||'')}
function shrinkVideo(file,onPct){return new Promise((resolve,reject)=>{
  const mime=pickMime();if(!mime){reject(new Error('no_recorder'));return}
  const v=document.createElement('video');v.playsInline=true;v.preload='auto';v.src=URL.createObjectURL(file);
  v.onerror=()=>reject(new Error('decode'));
  v.onloadedmetadata=async()=>{
    const dur=v.duration;if(!isFinite(dur)||dur<=0){reject(new Error('decode'));return}
    if(dur>180){reject(new Error('too_long'));return}
    const scale=Math.min(1,1280/Math.max(v.videoWidth,v.videoHeight));const W=Math.round(v.videoWidth*scale/2)*2,H=Math.round(v.videoHeight*scale/2)*2;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
    const stream=cv.captureStream(30);
    try{const ac=new (window.AudioContext||window.webkitAudioContext)();const src=ac.createMediaElementSource(v);const dest=ac.createMediaStreamDestination();src.connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t))}catch(e){v.muted=true}
    const vbps=Math.max(600000,Math.min(2500000,Math.floor((17*1024*1024*8)/dur)-128000));
    const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:vbps,audioBitsPerSecond:96000});const chunks=[];
    rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
    rec.onstop=()=>{URL.revokeObjectURL(v.src);const type=mime.split(';')[0];const out=new Blob(chunks,{type});out.name=file.name.replace(/\.[^.]+$/,'')+(type==='video/mp4'?'.mp4':'.webm');resolve(out)};
    let raf;const draw=()=>{ctx.drawImage(v,0,0,W,H);onPct&&onPct(Math.min(99,Math.round(v.currentTime/dur*100)));if(!v.ended)raf=requestAnimationFrame(draw)};
    v.onended=()=>{cancelAnimationFrame(raf);setTimeout(()=>rec.stop(),200)};
    rec.start(1000);try{await v.play()}catch(e){rec.stop();reject(new Error('play'));return}draw();
  };
})}
async function readyVideo(file){
  if(!needsShrink(file))return file;
  toast('Shrinking video for the web… 0%');
  try{const out=await shrinkVideo(file,p=>toast('Shrinking video for the web… '+p+'%'));if(out.size>VID_MAX)throw new Error('still_big');return out}
  catch(e){const m={too_long:'Clips over 3 minutes are too long. Trim it first.',still_big:'Still over 20 MB after shrinking. Trim the clip.',no_recorder:'This browser cannot shrink video. Try Chrome or Safari, or add a link.',play:'Tap upload again and keep this tab open while it shrinks.',decode:'This browser cannot read that video. Export it as MP4 or add a link.'};throw new Error(m[e.message]||'Could not prepare that video.')}
}

/* ---------- membership ---------- */
function membershipCard(a,name,promo){
  const p=STATE.pay||{};const m=a?.membership||{};const nm=name||a?.name||'';const memo='FAA Membership – '+(nm||'athlete name');
  const active=m.status==='Active';
  const stripe=safeUrl(p.memberStripe);
  return h('div',{class:'panel member-card'},
    STATE.org?.bandPhoto?h('img',{class:'band',src:STATE.org.bandPhoto,alt:'Future All American AthleteX Passport NFC wristband'}):null,
    h('div',{class:'row between'},h('div',null,h('p',{class:'eyebrow'},'Future All American membership'),h('p',{class:'price-big'},'$'+mp(),h('small',null,' / year'))),
      a?h('span',{class:'statuspill '+(active?'ok':'wait')},active?('Active'+(m.expires?' through '+m.expires:'')):(m.status||'Not active')):null),
    h('ul',{class:'perks'},h('li',null,'Your own athlete page for a full year'),h('li',null,'AthleteX Passport NFC wristband: tap it to a phone and your page opens'),h('li',null,'Listed in prospect search'),h('li',null,'Access to the FAA athlete chat'),h('li',null,'Combine numbers verified by Future All American')),
    h('span',{class:'athx'},'+ '+Number(STATE.org?.athxReward||10000).toLocaleString()+' ATHX Free Reward'),
    h('p',{class:'small muted'},'Sign up for $'+mp()+' and get '+Number(STATE.org?.athxReward||10000).toLocaleString()+' AthleteCoin (ATHX) tokens free. Connect your wallet on the Wallet tab; Future All American sends the tokens after your payment is confirmed.'),
    promo?h('div',{class:'row'},h('a',{class:'btn',href:'#me'},'Join now')):(active?null:h('div',{style:'display:grid;gap:10px'},
      stripe?h('a',{class:'btn stripe',href:stripe,target:'_blank',rel:'noopener',html:I.card+' Pay $'+mp()+' with Apple Pay or card'}):null,
      h('div',{class:'row'},
        p.venmo?h('a',{class:'btn sm',style:'background:#008cff;color:#fff',href:'https://venmo.com/u/'+encodeURIComponent(p.venmo),target:'_blank',rel:'noopener'},'Venmo @'+p.venmo):null,
        p.cashapp?h('a',{class:'btn sm',style:'background:#00b244;color:#fff',href:'https://cash.app/$'+encodeURIComponent(p.cashapp)+'/'+mp(),target:'_blank',rel:'noopener'},'Cash App $'+p.cashapp):null,
        p.zelle?h('button',{class:'btn sm',style:'background:#6d1ed4;color:#fff',onclick:e=>copy(p.zelle,e.currentTarget)},'Zelle '+fmtPhone(p.zelle)):null),
      h('label',null,'Put this in the payment note',h('div',{class:'copyline'},h('code',null,memo),h('button',{class:'btn ghost sm',onclick:e=>copy(memo,e.currentTarget)},'Copy'))),
      h('p',{class:'small muted'},'After your payment arrives, Future All American activates your membership and ships your wristband programmed with your page link.'))));
}

/* ---------- athlete dashboard ---------- */
const DASH={loaded:false,p:null,busy:false};
const MINOR_GRADES=['6th','7th','8th','9th','10th','11th','12th'];
function dashboard(){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  if(S.isOwner)sec.append(h('a',{class:'panel',href:'#admin',style:'padding:16px;display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:var(--fg)'},h('span',null,h('p',{class:'eyebrow'},'Owner'),h('b',{style:'font:900 1.5rem/1 var(--display);text-transform:uppercase'},'Company Backend')),h('span',{html:I.right,style:'display:grid'})));
  if(!S.db||!S.uid){
    sec.append(h('div',{class:'panel',style:'padding:20px;display:grid;gap:12px'},
      h('p',{class:'eyebrow'},'Athletes & parents'),h('h2',{style:'font-size:2.4rem'},'Join Future All American'),
      h('p',{class:'muted'},'Get your own athlete page with verified numbers, offers, highlights, a gear wishlist and sponsors.'),
      h('a',{class:'btn',href:'#signin',style:'justify-self:start'},'Sign In To Join'),
      h('ol',{class:'perks'},h('li',null,'Sign in with Gmail or email, then connect your Instagram or X.'),h('li',null,'Fill in your profile.'),h('li',null,'Future All American reviews it, adds your measurables and publishes your page.')),
      h('p',{class:'small muted'},'Questions? Call or text ',h('b',null,STATE.org?.phone||'(520) 440-0341'),'.')),membershipCard(null,null,false));
    return w;
  }
  const linked=athletes().find(x=>x.uid===S.uid);
  if(!DASH.loaded){DASH.loaded=true;S.db.doc('profiles/'+S.uid).get().then(d=>{DASH.p=d.exists?structuredClone(d.data()):null;if(S.slug==='me')render()}).catch(()=>{if(S.slug==='me')render()});sec.append(h('p',{class:'muted'},'Loading your profile…'));return w}
  const p=DASH.p||(linked?{name:linked.name,sport:linked.sport,pos:linked.pos,cls:linked.cls,grade:linked.grade,team:linked.team,school:linked.school,bio:linked.bio,socials:{...(linked.socials||{})},photo:linked.photo}:{sport:'Football',socials:{}});
  p.socials=p.socials||{};
  if(linked){sec.append(ubTabs());if(UB.tab!=='profile'){sec.append(ubBody(linked,p));return w}}
  const st=linked?.stats||{};
  const inp=(key,label,attrs={})=>{const id='d_'+key;const el=h(attrs.tag||'input',{id,...attrs,tag:null});el.value=p[key]??'';el.addEventListener('input',()=>{p[key]=el.value});return h('label',{for:id},label,el)};
  const sel=(key,label,opts)=>{const id='d_'+key;const el=h('select',{id,onchange:e=>{p[key]=e.target.value}},opts.map(o=>{const v=o.startsWith('Select ')?'':o;return h('option',{value:v,selected:(p[key]||'')===v},o)}));if(!p[key])p[key]=opts[0].startsWith('Select ')?'':opts[0];return h('label',{for:id},label,el)};
  const adult=h('input',{type:'checkbox',id:'d_adult',checked:!!p.adult,onchange:e=>{p.adult=e.target.checked;gbox.hidden=p.adult}});
  const gbox=h('div',{class:'g2'},inp('guardianName','Parent or guardian name',{maxlength:60}),inp('guardianContact','Parent or guardian phone or email',{maxlength:100}));gbox.hidden=!!p.adult;
  const payout=h('div',{class:'card',style:'border-color:var(--ok)'},h('b',null,'Where We Send Your Money'),
    h('p',{class:'small muted'},'Donations and sponsor money for your page are paid out here. For athletes under 18, use a parent or guardian account. Only Future All American can see this.'),
    inp('payoutName','Account holder name',{maxlength:60,placeholder:'Parent or guardian full name'}),
    h('div',{class:'g2'},inp('payoutVenmo','Venmo @handle',{maxlength:40,placeholder:'@handle'}),inp('payoutCashapp','Cash App $cashtag',{maxlength:40,placeholder:'$cashtag'})));
  const photoIn=S.assetsUp?h('input',{type:'file',accept:'image/*',id:'d_photo',onchange:async e=>{const f=e.target.files[0];if(!f)return;try{toast('Uploading photo…');const up=await S.assetsUp.upload(f);p.photo=up.url;toast('Photo ready. Press Save to send it.');ph.src=up.url;ph.hidden=false}catch(err){toast('Upload failed. Try a smaller photo.')}}}):null;
  const ph=h('img',{src:p.photo||'',alt:'',style:'width:72px;height:90px;object-fit:cover;border-radius:10px'});ph.hidden=!p.photo;
  const form=h('form',{class:'panel',style:'padding:18px;display:grid;gap:12px'},
    h('div',{class:'row between'},h('h2',{style:'font-size:2rem'},linked?'Your profile':'Sign up'),h('span',{class:'statuspill '+(linked?'ok':'wait')},linked?'Live':(DASH.p?'Waiting for review':'Not submitted'))),
    h('div',{class:'row'},ph,photoIn?h('label',{for:'d_photo',style:'flex:1'},'Profile photo',photoIn):h('p',{class:'small muted'},'Photo upload is not available for your account. Send your photo to Future All American.')),
    h('div',{class:'g2'},inp('name','Full name',{maxlength:60,required:true}),sel('sport','Sport',SPORTS)),
    h('div',{class:'g3'},inp('pos','Position',{maxlength:12}),sel('cls','Class of',['Select class','2027','2028','2029','2030','2031','2032','2033','2034']),sel('grade','Grade',['Select grade','6th','7th','8th','9th','10th','11th','12th','College'])),
    h('div',{class:'g2'},inp('team','Team / club',{maxlength:60}),inp('school','School',{maxlength:60})),
    inp('bio','Bio',{tag:'textarea',maxlength:280}),
    inp('highlight','Highlight film link (Hudl, YouTube, Instagram)',{type:'url',maxlength:400}),
    h('div',{class:'card'},h('b',null,'Social handles'),h('div',{class:'g2'},SOCIALS.map(s=>{const id='d_s_'+s.k;const el=h('input',{id,maxlength:60,placeholder:'@handle'});el.value=p.socials[s.k]?'@'+cleanHandle(p.socials[s.k]):'';el.addEventListener('input',()=>{p.socials[s.k]=el.value});return h('label',{for:id},s.label,el)}))),
    h('label',{class:'row',for:'d_adult',style:'display:flex;color:var(--fg);font-weight:500'},adult,' I am 18 or older'),
    gbox,
    h('div',{class:'card'},h('b',null,'7v7 Team'),h('div',{class:'g2'},inp('team7Name','7v7 team name',{maxlength:50,placeholder:'Tucson Showtime'}),inp('team7Handle','Team Instagram @handle',{maxlength:40,placeholder:'@tucsonshowtime'})),h('p',{class:'small muted'},'Future All American adds your team logo to your page.')),
    payout,
    h('p',{class:'small muted'},'Height, weight, GPA, combine and track numbers are measured and entered by Future All American only.'),
    h('button',{class:'btn',type:'submit'},linked?'Send update for review':'Submit sign-up'));
  form.onsubmit=async e=>{e.preventDefault();if(DASH.busy)return;
    if(!String(p.name||'').trim()){toast('Add your full name.');return}
    if(p.cls&&!/^20\d\d$/.test(p.cls)){toast('Class of should be a year like 2031.');return}
    if(!p.adult&&(!String(p.guardianName||'').trim()||!String(p.guardianContact||'').trim())){toast('Athletes under 18 need a parent or guardian name and contact.');return}
    if(p.highlight&&!safeUrl(p.highlight)){toast('Use a full https:// link for your film.');return}
    const out={...p,highlight:safeUrl(p.highlight),socials:Object.fromEntries(SOCIALS.map(s=>[s.k,cleanHandle(p.socials[s.k])])),status:linked?'update':'pending',ts:Date.now()};
    DASH.busy=true;try{await S.db.doc('profiles/'+S.uid).set(out);DASH.p=out;toast(linked?'Update sent. Future All American will review it.':'Signed up! Future All American will review your profile.');render()}
    catch(err){toast(err?.code==='invalid_argument'?'Your account can view this site but not sign up. Text Future All American at '+(STATE.org?.phone||'(520) 440-0341')+'.':'That did not save. Try again.')}finally{DASH.busy=false}};
  sec.append(form);
  if(linked)sec.append(h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px'},h('div',{class:'row between'},h('h3',{style:'font-size:1.5rem'},'Your measurables'),h('span',{class:'small muted'},'Entered by Future All American')),
    h('div',{class:'ro'},[['Height',linked.height],['Weight',linked.weight&&linked.weight+' lb'],['GPA',st.gpa],['40 yd',st.forty],['Shuttle',st.shuttle],['L-cone',st.lcone],['Broad',st.broad],['Vertical',st.vertical],['100m',st.m100],['200m',st.m200],['400m',st.m400]].map(([k,v])=>h('div',null,h('small',null,k),h('b',null,v||'—')))),
    h('div',{class:'row'},h('a',{class:'btn ghost sm',href:'#'+linked.slug},'View my page'),h('button',{class:'btn ghost sm',onclick:()=>{S.slug=linked.slug;openRequest('gear')}},'Suggest gear'),h('button',{class:'btn ghost sm',onclick:()=>{S.slug=linked.slug;openRequest('video')}},'Send a highlight'),h('a',{class:'btn ghost sm',href:'#chat'},'Open chat'))));
  if(linked&&isUnlocked(linked))sec.append(h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px;border-color:#f5b700'},h('p',{class:'eyebrow'},'NFT Drops'),h('h3',{style:'font-size:1.5rem'},'Mint An NFT Of Yourself'),h('p',{class:'muted'},'Create a limited NFT drop priced in ATHX. It goes on your page with a countdown, and fans can pre-order before the drop.'),h('button',{class:'btn',style:'justify-self:start;background:#f5b700;color:#1a1300',onclick:()=>openCreateDrop(linked)},'Create NFT Drop')));
  sec.append(membershipCard(linked,p.name,false));
  sec.append(h('a',{class:'panel',href:'#share',style:'padding:16px;display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:var(--fg);border-color:#d62976'},h('span',null,h('p',{class:'eyebrow'},'Share & Earn'),h('b',{style:'font:900 1.4rem/1 var(--display);text-transform:uppercase'},'Post Your Profile · '+(STATE.org?.postReward||100)+' ATHX')),h('span',{html:I.right,style:'display:grid'})));
  return w;
}

/* ---------- company backend ---------- */
function adminView(){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  if(!S.isOwner){sec.append(h('div',{class:'panel',style:'padding:20px'},h('h2',{style:'font-size:2rem'},'Company access only'),h('p',{class:'muted'},'This area is for Future All American staff.')));return w}
  if(S.profiles==null&&S.db)loadProfiles();
  const pending=(S.profiles||[]).filter(x=>x.status!=='approved').length;
  const active=athletes().filter(x=>x.membership?.status==='Active').length;
  const tile=(n,label,desc,go)=>h('button',{class:'panel admin-tile',onclick:go},h('b',null,n),h('span',{style:'font-weight:700'},label),h('span',{class:'small muted'},desc));
  sec.append(h('div',null,h('p',{class:'eyebrow'},'Company backend'),h('h2',{style:'font-size:clamp(2.2rem,7vw,3rem)'},'Future All American')),
    h('div',{class:'admin-grid'},
      tile(S.profiles==null?'…':pending,'Sign-ups to review','New athletes and profile updates',()=>openEditor('signups')),
      tile(athletes().length,'Athlete pages','Profiles, measurables, offers, gear',()=>openEditor('athlete')),
      tile(active,'Active memberships','$'+mp()+'/yr and NFC wristbands',()=>openEditor('members')),
      tile(S.requests?S.requests.length:'…','Requests','Gear, highlights, sponsor inquiries',()=>openEditor('requests')),
      tile('Chat','Moderate chat','Remove messages that break the rules',()=>{location.hash='chat'})),
    revenueSummary(),
    h('p',{class:'small muted'},'Only you can open this area, change measurables or publish the site.'));
  return w;
}

/* ---------- chat ---------- */
const CHANNELS=[{id:'all',name:'FAA Locker Room',desc:'All Future All American athletes'},{id:'football',name:'Football',desc:'Football athletes'},{id:'flag',name:'Girls flag football',desc:'Flag football athletes'},{id:'staff',name:'Ask FAA staff',desc:'Questions for Future All American'}];
const CHAT={sub:null,docs:{},cur:null,q:Promise.resolve()};
function chatMsgs(){const out=[];for(const[uid,d]of Object.entries(CHAT.docs))for(const m of d.msgs||[])out.push({...m,uid});return out.sort((a,b)=>a.ts-b.ts)}
function senderName(uid){const a=athletes().find(x=>x.uid===uid);return a?.name||PROF[uid]?.name||'Member'}
function senderPic(uid){const a=athletes().find(x=>x.uid===uid);return a?.photo||PROF[uid]?.avatarUrl||''}
const PROF={};
function chatView(){
  const w=h('div',{class:'wrap',style:'padding-block:14px'});
  if(!S.db||!S.uid){w.append(h('div',{class:'panel',style:'padding:20px'},h('h2',{style:'font-size:2rem'},'Athlete chat'),h('p',{class:'muted'},'Sign in to Claude, then join Future All American to chat with other athletes.'),h('a',{class:'btn sm',href:'#me',style:'margin-top:10px'},'Join')));return w}
  if(!S.isOwner&&!isMember()){w.append(h('div',{class:'panel',style:'padding:20px'},h('h2',{style:'font-size:2rem'},'Athlete chat'),h('p',{class:'muted'},'Chat opens once Future All American approves your athlete page.'),h('a',{class:'btn sm',href:'#me',style:'margin-top:10px'},'My dashboard')));return w}
  if(!CHAT.sub)CHAT.sub=S.db.collection('chatmsgs').onSnapshot(async snap=>{const next={};snap.docs.forEach(d=>next[d.id]=d.data());CHAT.docs=next;const ids=Object.keys(next).filter(id=>!PROF[id]);if(ids.length&&S.user){try{Object.assign(PROF,await S.user.profiles(ids))}catch(e){}}drawChat()},()=>{});
  const root=h('div',{class:'panel chat'+(CHAT.cur?' open':''),id:'chatRoot'},
    h('div',{class:'chat-list',id:'chatList'}),
    h('div',{class:'thread'},h('div',{class:'thread-head',id:'chatHead'}),h('div',{class:'msgs',id:'chatMsgs','aria-live':'polite'}),
      (()=>{const inp=h('input',{id:'chatIn',placeholder:'Message…',maxlength:500,autocomplete:'off','aria-label':'Message'});const f=h('form',{class:'composer'},inp,h('button',{class:'btn sm',type:'submit'},'Send'));
        f.onsubmit=e=>{e.preventDefault();const t=inp.value.trim();if(!t||!CHAT.cur)return;inp.value='';sendChat(t)};return f})()));
  w.append(root,h('p',{class:'small muted',style:'margin-top:10px'},'Group chats are seen by all Future All American athletes and staff. Be respectful. Never share your address, phone number or school schedule. Staff remove messages that break these rules.'));
  queueMicrotask(drawChat);
  return w;
}
function drawChat(){
  const list=$('chatList');if(!list)return;const all=chatMsgs();
  list.replaceChildren(h('h3',null,'Messages'),...CHANNELS.map(c=>{const last=[...all].reverse().find(m=>m.ch===c.id);
    return h('button',{class:'chat-item','aria-current':CHAT.cur===c.id?'true':'false',onclick:()=>{CHAT.cur=c.id;$('chatRoot').classList.add('open');drawChat();setTimeout(()=>$('chatIn')?.focus(),50)}},
      h('span',{class:'ring'},h('span',null,initials(c.name))),h('span',{style:'min-width:0'},h('b',null,c.name),h('small',null,last?(senderName(last.uid).split(' ')[0]+': '+last.text):c.desc)))}));
  const head=$('chatHead'),box=$('chatMsgs');const c=CHANNELS.find(x=>x.id===CHAT.cur);
  if(!c){head.replaceChildren(h('b',null,'Pick a chat'));box.replaceChildren(h('p',{class:'muted',style:'margin:auto'},'Choose a group to start chatting.'));return}
  head.replaceChildren(h('button',{class:'back','aria-label':'Back to chats',onclick:()=>{CHAT.cur=null;$('chatRoot').classList.remove('open');drawChat()},html:I.left}),h('span',{class:'ring'},h('span',null,initials(c.name))),h('span',null,h('b',{style:'display:block'},c.name),h('small',{class:'muted'},c.desc)));
  const msgs=all.filter(m=>m.ch===c.id);const kids=[];let lastDay='',lastUid='';
  for(const m of msgs){const day=new Date(m.ts).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});if(day!==lastDay){kids.push(h('span',{class:'daymark'},day));lastDay=day;lastUid=''}
    const mine=m.uid===S.uid;if(!mine&&m.uid!==lastUid)kids.push(h('span',{class:'who'},senderName(m.uid)));lastUid=m.uid;
    const pic=senderPic(m.uid);
    kids.push(h('div',{class:'msg'+(mine?' mine':''),title:new Date(m.ts).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})},mine?null:(pic?h('img',{class:'av',src:pic,alt:''}):h('span',{class:'av wav',style:'width:28px;height:28px;font-size:.7rem'},initials(senderName(m.uid)))),h('span',{class:'bubble'},m.text),(S.isOwner||mine)?h('button',{class:'modx','aria-label':'Delete message',onclick:()=>deleteChat(m)},'✕'):null))}
  if(!msgs.length)kids.push(h('p',{class:'muted',style:'margin:auto'},'No messages yet. Say hi!'));
  const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;box.replaceChildren(...kids);if(atBottom||!box.dataset.init){box.scrollTop=box.scrollHeight;box.dataset.init='1'}
}
function sendChat(text){const ch=CHAT.cur;CHAT.q=CHAT.q.then(async()=>{const ref=S.db.doc('chatmsgs/'+S.uid);const d=await ref.get();const cur=d.exists?structuredClone(d.data()):{msgs:[]};cur.msgs=[...(cur.msgs||[]),{id:rid(),ch,text,ts:Date.now()}].slice(-150);await ref.set(cur)}).catch(e=>toast(e?.code==='invalid_argument'?'Your account can read chat but not post.':'Message did not send. Try again.'))}
function deleteChat(m){CHAT.q=CHAT.q.then(async()=>{const ref=S.db.doc('chatmsgs/'+m.uid);const d=await ref.get();if(!d.exists)return;const cur=structuredClone(d.data());cur.msgs=(cur.msgs||[]).filter(x=>x.id!==m.id);await ref.set(cur);toast('Message removed')}).catch(()=>toast('Could not remove that message.'))}

/* ---------- dialogs ---------- */
function openDlg(title,body,foot,wide){const d=$('dlg');d.className=wide?'wide':'';d.replaceChildren(h('div',{class:'dlg-head'},h('h3',{style:'font-size:1.5rem'},title),h('button',{class:'x','aria-label':'Close',onclick:()=>d.close()},'×')),...(Array.isArray(body)?body:[body]),foot||'');if(!d.open)d.showModal()}
$('dlg').addEventListener('click',e=>{if(e.target===$('dlg'))$('dlg').close()});
function openGift(a,it){
  const p=STATE.pay||{},amt=money(it.gift||it.price);const memo=`Gift for ${a.name}: ${it.name}${it.size?' ('+it.size+')':''}`;
  const venmo=p.venmo?'https://venmo.com/u/'+encodeURIComponent(p.venmo):'',cash=p.cashapp?'https://cash.app/$'+encodeURIComponent(p.cashapp)+(amt?'/'+amt:''):'';
  openDlg('Gift '+(it.kind==='gloves'?'these gloves':it.kind==='cleats'?'these cleats':'this item'),h('div',{class:'dlg-body'},
    h('div',{class:'card',style:'grid-template-columns:90px 1fr;align-items:center'},h('span',{html:it.photo?'':gearArt(it.kind,it.swatch),style:'display:grid;place-items:center'},it.photo?h('img',{src:it.photo,alt:'',style:'border-radius:8px'}):null),h('div',null,h('b',null,it.name),h('p',{class:'small muted'},[it.color,it.size].filter(Boolean).join(' · ')),amt?h('p',{class:'price',style:'margin-top:4px'},fmt(amt)):null)),
    safeUrl(it.stripe||p.stripe)?h('a',{class:'btn stripe',href:safeUrl(it.stripe||p.stripe),target:'_blank',rel:'noopener',html:I.card+(it.stripe?' Pay with Apple Pay or card':' Pay with Apple Pay or card (enter '+(amt?fmt(amt):'the amount')+')')}):null,
    safeUrl(it.stripe||p.stripe)?h('p',{class:'small muted',style:'text-align:center'},'Or pay with an app'):null,
    h('label',null,'Put this in the payment note',h('div',{class:'copyline'},h('code',null,memo),h('button',{class:'btn ghost sm',onclick:e=>copy(memo,e.currentTarget)},'Copy'))),
    h('div',{class:'g3'},
      venmo?h('a',{class:'btn',style:'background:#008cff;color:#fff',href:venmo,target:'_blank',rel:'noopener'},'Venmo @'+p.venmo):null,
      cash?h('a',{class:'btn',style:'background:#00b244;color:#fff',href:cash,target:'_blank',rel:'noopener'},'Cash App $'+p.cashapp):null,
      p.zelle?h('button',{class:'btn',style:'background:#6d1ed4;color:#fff',onclick:e=>copy(p.zelle,e.currentTarget)},'Zelle '+fmtPhone(p.zelle)):null),
    h('p',{class:'small muted'},'Zelle: open your bank app and send to '+fmtPhone(p.zelle||'')+' (Future All American). After your gift arrives, Future All American orders the item through our retail partner and gets it to '+first(a.name)+"'s family."),
    h('p',{class:'disclose'},'Future All American may earn a referral commission on this purchase.')));
}
function openSponsorInquiry(a0,spot0){
  const a=a0&&a0.slug?a0:current();if(!a){toast('Pick an athlete to sponsor.');return}const spots=openSpots(a);if(!spots.length){toast('All sponsor spots on this page are taken.');return}let spot=spots.includes(spot0)?spot0:spots[0];const phone=STATE.org?.phone||'(520) 440-0341';const p=STATE.pay||{};const price=String(p.sponsorPrice||'10').replace(/^\$/,'');
  const memo='FAA Sponsor – '+a.name+' – Spot '+spot+' – monthly';const stripe=safeUrl(p.sponsorStripe);
  const payBlock=h('div',{class:'card'},
    h('label',null,'Choose Your Spot',h('select',{onchange:e=>{spot=+e.target.value}},spots.map(n=>h('option',{value:n,selected:n===spot},'Spot '+n+' of '+spotCount())))),
    h('div',{class:'row between'},h('b',null,'Sponsor Spot'),h('span',{class:'price-big',style:'font-size:2rem'},'$'+price,h('small',null,' / Month'))),
    h('p',{class:'small muted'},'Per athlete, billed monthly. Your logo scrolls in '+first(a.name)+"'s sponsor strip and links to your site while your spot is active. Cancel anytime."),
    stripe?h('a',{class:'btn stripe',href:stripe,target:'_blank',rel:'noopener',html:I.card+' Subscribe $'+price+'/month · Apple Pay or card'}):null,
    h('div',{class:'row'},
      p.venmo?h('a',{class:'btn sm',style:'background:#008cff;color:#fff',href:'https://venmo.com/u/'+encodeURIComponent(p.venmo),target:'_blank',rel:'noopener'},'Venmo @'+p.venmo):null,
      p.cashapp?h('a',{class:'btn sm',style:'background:#00b244;color:#fff',href:'https://cash.app/$'+encodeURIComponent(p.cashapp)+'/'+price,target:'_blank',rel:'noopener'},'Cash App $'+p.cashapp):null,
      p.zelle?h('button',{class:'btn sm',type:'button',style:'background:#6d1ed4;color:#fff',onclick:e=>copy(p.zelle,e.currentTarget)},'Zelle '+fmtPhone(p.zelle)):null),
    h('label',null,'Payment note',h('div',{class:'copyline'},h('code',null,memo),h('button',{class:'btn ghost sm',type:'button',onclick:e=>copy(memo,e.currentTarget)},'Copy'))),
    h('p',{class:'small muted'},stripe?'Card subscriptions renew automatically each month.':'With Venmo, Cash App or Zelle, send $'+price+' each month (or set a repeating payment in your app) to keep your spot active.'));
  if(!(S.db&&S.uid)){openDlg('Sponsor '+a.name,h('div',{class:'dlg-body'},payBlock,h('p',null,'Then call or text Future All American with your logo and website: ',h('b',{style:'user-select:all'},phone)),h('a',{class:'btn ghost',href:'#signin',onclick:()=>$('dlg').close(),style:'justify-self:start'},'Sign In To Upload Your Logo & Details')));return}
  const f=h('form',{class:'dlg-body'},payBlock,
    h('div',{class:'g2'},h('label',{for:'sp_co'},'Company',h('input',{id:'sp_co',required:true,maxlength:60})),h('label',{for:'sp_url'},'Website',h('input',{id:'sp_url',type:'url',placeholder:'https://',maxlength:200}))),
    h('div',{class:'g2'},h('label',{for:'sp_ct'},'How to reach you (phone or email)',h('input',{id:'sp_ct',required:true,maxlength:100})),
      h('label',{for:'sp_paid'},'Paid With',h('select',{id:'sp_paid'},['','Card subscription','Venmo','Cash App','Zelle','Paying later'].map(o=>h('option',{value:o},o||'Choose one'))))),
    h('div',{class:'card'},h('b',null,'Your Logo'),
      h('div',{class:'row'},h('span',{class:'spon-logo',id:'sp_prev',style:'width:64px;height:64px;background:#000'},initials('Logo')),
        S.assetsUp?h('label',{for:'sp_logo',style:'flex:1'},'Upload logo (PNG or JPG, square works best)',h('input',{id:'sp_logo',type:'file',accept:'image/png,image/jpeg,image/webp,image/svg+xml',onchange:async e=>{const fl=e.target.files[0];if(!fl)return;if(fl.size>5*1024*1024){toast('Use a logo under 5 MB.');return}
          const pv=f.querySelector('#sp_prev');pv.textContent='…';try{const up=await S.assetsUp.upload(fl);f.dataset.logo=up.url;pv.replaceChildren(h('img',{src:up.url,alt:'Your logo'}));toast('Logo uploaded.')}catch(err){pv.textContent='!';toast('Logo upload failed. Try a smaller PNG or JPG.')}}})):h('p',{class:'small muted'},'Logo upload is not available here. Text your logo to Future All American.')),
      h('p',{class:'small muted'},'Your logo shows in Spot '+spot+' on '+first(a.name)+"'s page and in the sponsor strip.")),
    h('label',{for:'sp_msg'},'Message (optional)',h('textarea',{id:'sp_msg',maxlength:400})),
    h('button',{class:'btn',type:'submit'},'Start Sponsorship'));
  f.onsubmit=e=>{e.preventDefault();const v=id=>f.querySelector('#'+id).value.trim();saveRequest({sponsor:{athlete:a.slug,spot,company:v('sp_co'),url:safeUrl(v('sp_url')),contact:v('sp_ct'),logo:f.dataset.logo||'',paid:v('sp_paid'),plan:'$'+price+'/month',message:v('sp_msg'),ts:Date.now()}},'Sponsorship sent. Your logo goes live after payment is confirmed.')};
  openDlg('Sponsor '+a.name,f);
}

/* ---------- athlete requests (db, reviewed by owner) ---------- */
async function loadMyReq(){if(!S.db||!S.uid)return null;try{const d=await S.db.doc('requests/'+S.uid).get();S.myReq=d.exists?structuredClone(d.data()):null}catch(e){S.myReq=null}return S.myReq}
let reqBusy=Promise.resolve();
function saveRequest(patch,msg,keep){
  reqBusy=reqBusy.then(async()=>{const cur=(await loadMyReq())||{items:[],socials:{}};
    const next={...cur,ts:Date.now()};if(patch.item)next.items=[...(cur.items||[]),patch.item].slice(-20);if(patch.socials)next.socials={...patch.socials};if(patch.athlete)next.athlete=patch.athlete;if(patch.sponsor)next.sponsor=patch.sponsor;if(patch.claim)next.claim=patch.claim;if(patch.wallet)next.wallet=patch.wallet;if(patch.passport)next.passport=patch.passport;if(patch.giftcard)next.giftcards=[...(cur.giftcards||[]),patch.giftcard].slice(-20);if(patch.cal)next.calendar=[...(cur.calendar||[]),patch.cal].slice(-60);if(patch.drop)next.drops=[...(cur.drops||[]).filter(x=>x.id!==patch.drop.id),patch.drop].slice(-10);if(patch.nft)next.nftOrders=[...(cur.nftOrders||[]),patch.nft].slice(-50);if(patch.post)next.posts=[...(cur.posts||[]),patch.post].slice(-120);if(patch.video)next.videos=[...(cur.videos||[]),patch.video].slice(-10);
    await S.db.doc('requests/'+S.uid).set(next);S.myReq=next;if(!keep)$('dlg').close();toast(msg)}).catch(e=>{toast(e?.code==='invalid_argument'?'Your access is view-only. Text Future All American at '+(STATE.org?.phone||'(520) 440-0341')+'.':'That did not send. Try again.')});
}
async function openRequest(kind,a0){
  const a=a0||current();await loadMyReq();
  const gearForm=h('form',{class:'card'},
    h('b',null,'Suggest gear for '+a.name),
    h('label',{for:'rq_name'},'Item',h('input',{id:'rq_name',required:true,maxlength:80,placeholder:'Nike Vapor Jet 8.0 gloves'})),
    h('label',{for:'rq_link'},'Link to the item',h('input',{id:'rq_link',type:'url',required:true,placeholder:'https://',maxlength:400})),
    h('div',{class:'g3'},h('label',{for:'rq_size'},'Size',h('input',{id:'rq_size',maxlength:20})),h('label',{for:'rq_color'},'Color',h('input',{id:'rq_color',maxlength:30})),h('label',{for:'rq_price'},'Price ($)',h('input',{id:'rq_price',inputmode:'decimal',maxlength:8}))),
    h('button',{class:'btn',type:'submit'},'Send for review'));
  gearForm.onsubmit=e=>{e.preventDefault();const v=id=>gearForm.querySelector('#'+id).value.trim();const link=safeUrl(v('rq_link'));if(!link){toast('Use a full https:// link.');return}
    saveRequest({athlete:a.slug,item:{id:rid(),name:v('rq_name'),link,size:v('rq_size'),color:v('rq_color'),price:v('rq_price')}},'Sent. Future All American will review it.')};
  const soc=S.myReq?.socials||a.socials||{};
  const socForm=h('form',{class:'card'},h('b',null,'Social handles'),h('div',{class:'g2'},SOCIALS.map(s=>h('label',{for:'rq_'+s.k},s.label,h('input',{id:'rq_'+s.k,maxlength:60,placeholder:'@handle',value:soc[s.k]?'@'+cleanHandle(soc[s.k]):''})))),h('button',{class:'btn',type:'submit'},'Send for review'));
  socForm.onsubmit=e=>{e.preventDefault();const o={};SOCIALS.forEach(s=>o[s.k]=cleanHandle(socForm.querySelector('#rq_'+s.k).value));saveRequest({athlete:a.slug,socials:o},'Sent. Your handles show after review.')};
  const vidForm=h('form',{class:'card'},h('b',null,'Upload a highlight'),
    h('label',{for:'rq_vt'},'Title',h('input',{id:'rq_vt',maxlength:60,placeholder:'Week 6 vs. Tucson Titans',required:true})),
    S.assetsUp?h('label',{for:'rq_vf'},'Video file (any phone clip up to 3 minutes)',h('input',{id:'rq_vf',type:'file',accept:'video/*'})):null,
    h('label',{for:'rq_vl'},S.assetsUp?'Or a link (Hudl, YouTube, Instagram)':'Link to the video (Hudl, YouTube, Instagram)',h('input',{id:'rq_vl',type:'url',placeholder:'https://',maxlength:400})),
    h('button',{class:'btn',type:'submit'},'Send for review'));
  vidForm.onsubmit=async e=>{e.preventDefault();const title=vidForm.querySelector('#rq_vt').value.trim();const file=vidForm.querySelector('#rq_vf')?.files?.[0];const link=safeUrl(vidForm.querySelector('#rq_vl').value);
    if(!file&&!link){toast('Add a video file or a link.');return}
    const btn=vidForm.querySelector('button[type=submit]');btn.disabled=true;btn.textContent=file?'Preparing…':'Sending…';
    let ready=file;if(file){try{ready=await readyVideo(file)}catch(err){btn.disabled=false;btn.textContent='Send for review';toast(err.message);return}}
    try{let v={id:rid(),title,link:link||''};if(file){btn.textContent='Uploading…';const up=await S.assetsUp.upload(ready);v.assetId=up.id;v.url=up.url}
      saveRequest({athlete:a.slug,video:v},'Sent. Your clip shows after review.')}catch(err){btn.disabled=false;btn.textContent='Send for review';toast(err?.code==='unsupported_type'?'That file type is not supported. Use MP4.':'Upload failed. Try a shorter clip or a link.')}};
  const pending=(S.myReq?.items||[]).length?h('div',{class:'note'},'Waiting for review: ',(S.myReq.items||[]).map(i=>i.name).join(', ')):null;
  openDlg('Update '+first(a.name)+"'s page",h('div',{class:'dlg-body'},h('p',{class:'small muted'},'Changes go to Future All American for review before they show on the page. Combine and track numbers are entered by Future All American only.'),kind==='socials'?[socForm,gearForm,vidForm]:kind==='video'?[vidForm,gearForm,socForm]:[gearForm,vidForm,socForm],pending));
}

/* ---------- owner editor ---------- */
function openEditor(tab){
  if(!S.isOwner)return;if(tab)S.etab=tab;
  S.draft=structuredClone(STATE);S.editSlug=current()?.slug||S.draft.athletes[0]?.slug;renderEditor();
}
const ED_TABS=[['requests','Claims & requests'],['signups','Sign-ups'],['members','Memberships'],['athlete','Athlete'],['numbers','Numbers'],['recruit','Offers & ratings'],['gear','Gear'],['video','Highlights'],['sponsors','Sponsors'],['pay','Payments'],['ref','Referral links']];
function ea(){return S.draft.athletes.find(x=>x.slug===S.editSlug)}
function bind(obj,key,attrs){const el=h(attrs?.tag||'input',{...attrs,tag:null,value:attrs?.tag==='textarea'?null:(obj[key]??'')});if(attrs?.tag==='textarea')el.value=obj[key]??'';el.addEventListener('input',()=>{obj[key]=el.type==='checkbox'?el.checked:el.value});if(el.type==='checkbox'){el.checked=!!obj[key]}return el}
function field(label,obj,key,attrs){const id='e_'+key+'_'+rid();return h('label',{for:id},label,bind(obj,key,{...attrs,id}))}
function renderEditor(){
  const d=S.draft;const a=ea();
  const tabs=h('div',{class:'etabs',role:'tablist'},ED_TABS.map(([k,l])=>h('button',{class:'etab',role:'tab','aria-selected':S.etab===k?'true':'false',onclick:()=>{S.etab=k;renderEditor()}},l+(k==='requests'&&S.requests?.length?' ('+S.requests.length+')':''))));
  const picker=h('div',{class:'row'},h('label',{for:'e_pick',style:'flex:1;min-width:180px'},'Athlete page',h('select',{id:'e_pick',onchange:e=>{S.editSlug=e.target.value;renderEditor()}},d.athletes.map(x=>h('option',{value:x.slug,selected:x.slug===S.editSlug},x.name||'New athlete')))),
    h('button',{class:'btn ghost sm',style:'align-self:end',type:'button',onclick:()=>{const n={slug:'athlete-'+rid(),name:'New Athlete',pos:'',cls:'',grade:'',height:'',weight:'',number:'',team:'',school:'',bio:'',photo:'',socials:{},stats:{},wishlist:[],sponsors:[]};d.athletes.push(n);S.editSlug=n.slug;S.etab='athlete';renderEditor()}},'Add athlete'));
  let body;
  if(S.etab==='athlete'&&a){a.socials=a.socials||{};
    const photoIn=S.assets?h('input',{type:'file',accept:'image/*',id:'e_photo',onchange:async e=>{const f=e.target.files[0];if(!f)return;toast('Uploading photo…');try{const up=await S.assets.upload(f);a.photo=up.url;toast('Photo ready. Publish to save.');renderEditor()}catch(err){toast('Upload failed. Try a smaller image.')}}}):null;
    body=[picker,
      h('div',{class:'card',style:'grid-template-columns:96px 1fr;align-items:center'},a.photo?h('img',{src:a.photo,alt:'',style:'border-radius:10px;aspect-ratio:3/4;object-fit:cover;object-position:50% 15%'}):h('span',{class:'mark',style:'width:96px;height:120px;font-size:2rem'},initials(a.name)),h('div',{style:'display:grid;gap:8px'},photoIn?h('label',{for:'e_photo'},'Athlete photo',photoIn):h('p',{class:'small muted'},'Photo upload is unavailable in this view.'))),
      h('div',{class:'g2'},field('Full name',a,'name',{maxlength:60}),field('Team / club',a,'team',{maxlength:60})),
      h('div',{class:'g3'},field('Position',a,'pos',{maxlength:12}),field('Class of',a,'cls',{maxlength:4,inputmode:'numeric'}),field('Grade',a,'grade',{maxlength:12})),
      h('div',{class:'g3'},field('Height',a,'height',{maxlength:8}),field('Weight (lb)',a,'weight',{maxlength:4,inputmode:'numeric'}),field('Jersey #',a,'number',{maxlength:3})),
      h('div',{class:'g2'},field('School',a,'school',{maxlength:60}),h('label',null,'Category',h('select',{onchange:e=>{a.sport=e.target.value}},SPORTS.map(x=>h('option',{selected:(a.sport||'Football')===x},x))))),
      field('Bio',a,'bio',{tag:'textarea',maxlength:280}),
      (()=>{a.team7v7=a.team7v7||{};const t=a.team7v7;return h('div',{class:'card'},h('b',null,'7v7 Team'),h('div',{class:'g2'},field('Team name',t,'name',{maxlength:50}),field('Team Instagram @handle',t,'handle',{maxlength:40})),
        h('div',{class:'row'},t.logo?h('img',{src:t.logo,alt:'',style:'width:48px;height:48px;border-radius:50%;object-fit:cover;background:#000'}):null,
          S.assets?h('label',null,'Team logo (shows as a circle)',h('input',{type:'file',accept:'image/*',onchange:async e=>{const f=e.target.files[0];if(!f)return;try{toast('Uploading logo…');const up=await S.assets.upload(f);t.logo=up.url;toast('Logo ready. Publish to save.');renderEditor()}catch(err){toast('Upload failed.')}}})):null))})(),
      h('label',{style:'display:flex;gap:8px;align-items:center;color:var(--fg)'},bind(a,'unlocked',{type:'checkbox'}),'Donations, sponsors and gear carousel unlocked (claimed or paid)'),
      h('div',{class:'card'},h('b',null,'Social handles'),h('div',{class:'g2'},SOCIALS.map(s=>field(s.label+' (@handle)',a.socials,s.k,{maxlength:60,placeholder:'@handle'})))),
      d.athletes.length>1?h('button',{class:'btn ghost sm',type:'button',style:'justify-self:start',onclick:()=>{d.athletes=d.athletes.filter(x=>x!==a);S.editSlug=d.athletes[0].slug;renderEditor()}},'Remove this athlete page'):null];
  }else if(S.etab==='numbers'&&a){a.stats=a.stats||{};
    body=[picker,h('p',{class:'note'},'Only you can enter these. Times in seconds (4.52), broad jump in feet and inches (9\'4"), vertical in inches (32.5).'),
      ...STAT_GROUPS.map(g=>h('div',{class:'card'},h('b',null,g.title),h('div',{class:'g3'},g.keys.map(([k,l,u])=>field(l+(u?' ('+u+')':''),a.stats,k,{maxlength:10}))))),
      field('Verified date (shown on the page)',a.stats,'verified',{maxlength:30,placeholder:'Oct 2026'})];
  }else if(S.etab==='recruit'&&a){a.offers=a.offers||[];a.ratings=a.ratings||{};const r=a.ratings;
    const starSel=(key,label)=>{const s=h('select',{onchange:e=>{r[key]=e.target.value}},['','1','2','3','4','5'].map(k=>h('option',{value:k,selected:String(r[key]||'')===k},k?k+' stars':'Not rated')));return h('label',null,label,s)};
    body=[picker,
      h('div',{class:'card'},h('b',null,'Ratings'),h('div',{class:'g2'},starSel('faaStars','Future All American rating'),starSel('rivalsStars','Rivals stars (only if Rivals lists them)')),
        field('Rivals profile link',r,'rivalsUrl',{type:'url',maxlength:300,placeholder:'https://www.on3.com/rivals/...'}),
        h('div',{class:'g2'},field('On3 NIL valuation (as On3 shows it)',r,'on3Nil',{maxlength:20,placeholder:'$12K'}),field('On3 profile link',r,'on3Url',{type:'url',maxlength:300}))),
      h('p',{class:'note'},'Rivals stars and On3 NIL valuation come from those sites. Enter them only when the athlete appears there, and add the profile link so visitors can check.'),
      ...a.offers.map((o,i)=>h('div',{class:'card'},h('div',{class:'row between'},h('b',null,o.school||'New offer'),h('button',{class:'btn ghost sm',type:'button',onclick:()=>{a.offers.splice(i,1);renderEditor()}},'Remove')),
        h('div',{class:'g3'},field('School',o,'school',{maxlength:40}),field('Badge letters',o,'abbr',{maxlength:5}),h('label',{class:'row',style:'display:flex;color:var(--fg);align-self:end'},bind(o,'verified',{type:'checkbox'}),' Verified')),
        h('div',{class:'g2'},field('Badge color',o,'bg',{type:'color'}),field('Letter color',o,'fg',{type:'color'})),
        h('div',{class:'row'},o.logo?h('img',{src:o.logo,alt:'',style:'width:44px;height:44px;object-fit:contain;background:#fff;border-radius:50%'}):null,
          S.assets?h('label',{style:'flex:1'},'School logo image (upload one you are allowed to use)',h('input',{type:'file',accept:'image/*',onchange:async e=>{const f=e.target.files[0];if(!f)return;try{toast('Uploading logo…');const up=await S.assets.upload(f);o.logo=up.url;toast('Logo ready. Publish to save.');renderEditor()}catch(err){toast('Upload failed.')}}})):null,
          o.logo?h('button',{class:'btn ghost sm',type:'button',onclick:()=>{o.logo='';renderEditor()}},'Use letters'):null))),
      h('button',{class:'btn ghost',type:'button',onclick:()=>{a.offers.push({school:'',abbr:'',bg:'#1b2f57',fg:'#ffffff',verified:false});renderEditor()}},'Add offer')];
  }else if(S.etab==='gear'&&a){a.wishlist=a.wishlist||[];a.giftcards=a.giftcards||[];
    body=[picker,...a.wishlist.map((it,i)=>h('div',{class:'card'},
      h('div',{class:'row between'},h('b',null,(i+1)+'. '+(it.name||'New item')),h('div',{class:'row'},
        i>0?h('button',{class:'btn ghost sm',type:'button',onclick:()=>{[a.wishlist[i-1],a.wishlist[i]]=[a.wishlist[i],a.wishlist[i-1]];renderEditor()}},'Move up'):null,
        h('button',{class:'btn ghost sm',type:'button',onclick:()=>{a.wishlist.splice(i,1);renderEditor()}},'Remove'))),
      h('div',{class:'g2'},field('Item name',it,'name',{maxlength:80}),field('Brand',it,'brand',{maxlength:30})),
      h('div',{class:'g3'},h('label',null,'Type',(()=>{const s=h('select',{onchange:e=>{it.kind=e.target.value}},['gloves','cleats','other'].map(k=>h('option',{value:k,selected:it.kind===k},k)));return s})()),field('Size',it,'size',{maxlength:20}),field('Color',it,'color',{maxlength:30})),
      h('div',{class:'g3'},field('Price ($)',it,'price',{maxlength:8,inputmode:'decimal'}),field('Gift amount ($, optional)',it,'gift',{maxlength:8,inputmode:'decimal'}),field('Card color',it,'swatch',{type:'color'})),
      field('Product link (paste your referral link here)',it,'link',{type:'url',maxlength:600}),
      field('Stripe payment link for this item (optional)',it,'stripe',{type:'url',maxlength:400,placeholder:'https://buy.stripe.com/...'}),
      h('div',{class:'row'},it.photo?h('img',{src:it.photo,alt:'',style:'width:72px;height:72px;object-fit:cover;border-radius:8px'}):null,
        S.assets?h('label',{style:'flex:1'},'Product photo (tapping it starts the gift)',h('input',{type:'file',accept:'image/*',onchange:async e=>{const f=e.target.files[0];if(!f)return;try{toast('Uploading photo…');const up=await S.assets.upload(f);it.photo=up.url;toast('Photo ready. Publish to save.');renderEditor()}catch(err){toast('Upload failed.')}}})):null,
        it.photo?h('button',{class:'btn ghost sm',type:'button',onclick:()=>{it.photo='';renderEditor()}},'Remove photo'):null),
      h('label',{class:'row',style:'display:flex;color:var(--fg)'},stampFunded(it,bind(it,'funded',{type:'checkbox'})),' Already gifted'))),
      h('button',{class:'btn ghost',type:'button',onclick:()=>{a.wishlist.push({id:rid(),name:'',brand:'Nike',kind:'other',size:'',color:'',swatch:'#d8ff2e',price:'',link:'',funded:false});renderEditor()}},'Add gear item')];
    body.push(giftcardEditor(a));
  }else if(S.etab==='video'&&a){a.highlights=a.highlights||[];
    body=[picker,h('p',{class:'note'},'Upload any phone clip up to 3 minutes. Big or Apple (HEVC/MOV) videos are shrunk to web size in your browser first; keep this window open while it works. Or add a Hudl, YouTube or Instagram link.'),
      ...a.highlights.map((v,i)=>h('div',{class:'card'},h('div',{class:'row between'},h('b',null,(i+1)+'. '+(v.title||'Clip')),h('div',{class:'row'},i>0?h('button',{class:'btn ghost sm',type:'button',onclick:()=>{[a.highlights[i-1],a.highlights[i]]=[a.highlights[i],a.highlights[i-1]];renderEditor()}},'Move up'):null,h('button',{class:'btn ghost sm',type:'button',onclick:()=>{a.highlights.splice(i,1);renderEditor()}},'Remove'))),
        field('Title',v,'title',{maxlength:60}),v.url?h('video',{src:v.url,controls:true,preload:'metadata',style:'width:100%;max-height:220px;border-radius:8px;background:#000'}):field('Link',v,'link',{type:'url',maxlength:400}))),
      h('div',{class:'row'},
        S.assets?h('label',{style:'flex:1'},'Upload a clip',h('input',{type:'file',accept:'video/*',onchange:async e=>{const f=e.target.files[0];if(!f)return;let ready;try{ready=await readyVideo(f)}catch(err){toast(err.message);return}try{toast('Uploading clip…');const up=await S.assets.upload(ready);a.highlights.push({id:rid(),title:f.name.replace(/\.[^.]+$/,''),url:up.url,assetId:up.id});toast('Clip ready. Press Publish changes to put it live.');renderEditor()}catch(err){toast(err?.code==='unsupported_type'?'That video type is not supported. Export as MP4.':'Upload failed. Check your connection and try again.')}}})):null,
        h('button',{class:'btn ghost',type:'button',onclick:()=>{a.highlights.push({id:rid(),title:'',link:''});renderEditor()}},'Add a link'))];
  }else if(S.etab==='sponsors'&&a){a.sponsors=a.sponsors||[];
    body=[picker,...a.sponsors.map((s,i)=>h('div',{class:'card'},
      h('div',{class:'row between'},h('b',null,s.name||'New sponsor'),h('button',{class:'btn ghost sm',type:'button',onclick:()=>{a.sponsors.splice(i,1);renderEditor()}},'Remove')),
      h('div',{class:'g2'},field('Company',s,'name',{maxlength:40}),field('Sponsor page link',s,'url',{type:'url',maxlength:300})),
      h('div',{class:'g3'},field('Tagline',s,'tagline',{maxlength:70}),field('Spot #',s,'spot',{inputmode:'numeric',maxlength:2}),field('Paid through (hidden after this date)',s,'until',{type:'date'})),
      S.assets?h('label',null,'Logo',h('input',{type:'file',accept:'image/*',onchange:async e=>{const f=e.target.files[0];if(!f)return;try{toast('Uploading logo…');const up=await S.assets.upload(f);s.logo=up.url;toast('Logo ready. Publish to save.');renderEditor()}catch(err){toast('Upload failed.')}}})):null,
      s.logo?h('img',{src:s.logo,alt:'',style:'max-height:50px;justify-self:start;background:#fff;border-radius:6px'}):null)),
      h('button',{class:'btn ghost',type:'button',onclick:()=>{a.sponsors.push({id:rid(),name:'',url:'',tagline:'',logo:''});renderEditor()}},'Add sponsor')];
  }else if(S.etab==='pay'){d.pay=d.pay||{};d.org=d.org||{};
    body=[h('div',{class:'g3'},field('Venmo (no @)',d.pay,'venmo',{maxlength:40}),field('Cash App (no $)',d.pay,'cashapp',{maxlength:40}),field('Zelle phone or email',d.pay,'zelle',{maxlength:60})),field('Stripe donation link (any amount)',d.pay,'stripe',{type:'url',maxlength:400,placeholder:'https://buy.stripe.com/...'}),field('Stripe link for the membership',d.pay,'memberStripe',{type:'url',maxlength:400,placeholder:'https://buy.stripe.com/...'}),field('Contact phone shown on the page',d.org,'phone',{maxlength:20})];
  }else if(S.etab==='ref'){d.referral=d.referral||{programs:[]};
    body=[h('p',{class:'note'},'Every product link on athlete pages (gear carousel, brand picker shop links) is turned into a referral link automatically. A brand program marked Approved with a deep-link template wins; otherwise Skimlinks or Sovrn covers Nike, adidas, Under Armour, PUMA and most other stores with one account. Apply with ',h('b',{style:'text-transform:none'},d.referral.email||''),'.'),
      h('div',{class:'card',style:'border-color:var(--ok)'},h('b',null,'One account for every brand (recommended)'),
        h('div',{class:'g2'},field('Skimlinks publisher ID',d.referral,'skimlinksId',{maxlength:40,placeholder:'123456X1234567'}),field('Or Sovrn Commerce API key',d.referral,'sovrnKey',{maxlength:64})),
        h('div',{class:'row'},h('a',{class:'btn ghost sm',href:'https://skimlinks.com',target:'_blank',rel:'noopener'},'Apply To Skimlinks ↗'),h('a',{class:'btn ghost sm',href:'https://www.sovrn.com',target:'_blank',rel:'noopener'},'Apply To Sovrn ↗')),
        h('p',{class:'small muted'},'Test: ',(()=>{const t=h('code',{class:'addr'},'');const upd=()=>{STATE_PREVIEW=d;t.textContent=affLinkWith(d.referral,'https://www.nike.com/w/football-gloves')};setTimeout(upd);return h('span',null,t,h('button',{class:'btn ghost sm',type:'button',onclick:upd},'Refresh'))})())),
      ...d.referral.programs.map(p=>h('div',{class:'card'},
        h('div',{class:'row between'},h('b',null,p.brand),h('span',{class:'chip'},p.network)),
        h('p',{class:'small muted'},p.terms),
        h('div',{class:'g2'},h('label',null,'Status',(()=>{const s=h('select',{onchange:e=>{p.status=e.target.value}},['Not applied','Applied','Approved','Declined'].map(k=>h('option',{selected:p.status===k},k)));return s})()),field(p.id==='amazon'?'Associates tag':'Your referral ID or homepage link',p,'link',{maxlength:400})),
        p.id==='amazon'?null:field('Deep-link template (put {url} where the product link goes)',p,'template',{maxlength:400,placeholder:'https://…{url}'}),
        h('p',{class:'small muted'},'Applies to: '+((p.domains||[]).join(', ')||'—')+(p.status==='Approved'?' · Active when a template is set':' · Mark Approved to activate')),
        safeUrl(p.signup)?h('a',{class:'btn ghost sm',style:'justify-self:start',href:safeUrl(p.signup),target:'_blank',rel:'noopener'},'Open signup ↗'):null))];
  }else if(S.etab==='signups'){
    body=[h('p',{class:'note'},'New athletes and profile updates from My dashboard. Approve copies their details into your draft. Measurables (height, weight, GPA, combine, track) are never taken from sign-ups; you enter those. Press Publish changes to put it live.')];
    if(!S.db)body.push(h('p',{class:'muted'},'Sign-ups are unavailable in this view.'));
    else if(S.profiles==null){body.push(h('p',{class:'muted'},'Loading…'));loadProfiles()}
    else if(!S.profiles.length)body.push(h('p',{class:'muted'},'No sign-ups yet.'));
    else for(const pr of S.profiles)body.push(profileCard(pr));
  }else if(S.etab==='members'){d.pay=d.pay||{};d.org=d.org||{};
    body=[h('p',{class:'note'},'Each membership is $'+mp()+' a year and includes the athlete page and an NFC wristband. Program each wristband with the athlete page link below (any NFC writer app works), then mark it shipped.'),
      h('div',{class:'g2'},field('Stripe payment link for the membership',d.pay,'memberStripe',{type:'url',maxlength:400,placeholder:'https://buy.stripe.com/...'}),field('Public link to this site (for wristbands)',d.org,'siteUrl',{type:'url',maxlength:300})),
      h('div',{class:'g2'},field('501(c)(3) that receives donations',d.org,'nonprofit',{maxlength:80}),field('Nonprofit EIN (optional)',d.org,'ein',{maxlength:12})),
      h('div',{class:'g2'},field('Sponsor spot price per athlete ($/month)',d.pay,'sponsorPrice',{maxlength:6,inputmode:'decimal'}),field('Stripe monthly subscription link for sponsors',d.pay,'sponsorStripe',{type:'url',maxlength:400,placeholder:'https://buy.stripe.com/...'})),
      h('details',{class:'card'},h('summary',null,'Stripe payment links for the Donation Calendar ($1 to $31)'),
        h('p',{class:'small muted'},'Paste one Stripe payment link per day amount. Line 1 is the $1 link, line 15 the $15 link, line 31 the $31 link. The page adds the athlete, month and day to each checkout as the client reference.'),
        (()=>{d.pay.calLinks=d.pay.calLinks||[];const t=h('textarea',{rows:8,placeholder:'https://buy.stripe.com/... ($1)\nhttps://buy.stripe.com/... ($2)',style:'font-family:var(--mono);font-size:.78rem'});t.value=(d.pay.calLinks||[]).join('\n');t.addEventListener('input',()=>{d.pay.calLinks=t.value.split('\n').map(x=>x.trim()).slice(0,31)});return t})(),
        h('p',{class:'small muted'},(d.pay.calLinks||[]).filter(Boolean).length+' of 31 links added.')),
      h('div',{class:'g2'},field('ATHX treasury wallet (receives NFT payments)',d.org,'treasury',{maxlength:42,placeholder:'0x…'}),field('Sponsor spots per athlete',d.org,'sponsorSpots',{maxlength:2,inputmode:'numeric'})),
      h('div',{class:'g2'},field('ATHX reward per Instagram post (max 1 a day)',d.org,'postReward',{maxlength:6,inputmode:'numeric'}),field('AthleteCoin Instagram to tag (@handle)',d.org,'athxInstagram',{maxlength:40})),
      h('div',{class:'g2'},field('AthleteX Passport price ($)',d.pay,'passportPrice',{maxlength:8,inputmode:'decimal'}),field('Membership price ($/year)',d.pay,'memberPrice',{maxlength:7,inputmode:'decimal'}),field('ATHX reward for membership sign-up',d.org,'athxReward',{maxlength:9,inputmode:'numeric'})),
      ...d.athletes.map(x=>{x.membership=x.membership||{};const m=x.membership;const link=(safeUrl(d.org.siteUrl)||'').replace(/#.*$/,'')+'#'+x.slug;
        const sel=(key,opts)=>h('select',{onchange:e=>{m[key]=e.target.value}},opts.map(o=>h('option',{selected:(m[key]||opts[0])===o},o)));
        return h('div',{class:'card'},h('div',{class:'row between'},h('b',null,x.name),x.uid?h('span',{class:'chip ok'},'Has an account'):h('span',{class:'chip'},'No account linked')),
          h('div',{class:'g3'},h('label',null,'Membership',sel('status',['None','Pending payment','Active','Expired'])),field('Paid through',m,'expires',{type:'date'}),h('label',null,'Wristband',sel('band',['Not ordered','Programmed','Shipped','Delivered']))),
          h('div',{class:'copyline'},h('code',null,link),h('button',{class:'btn ghost sm',type:'button',onclick:e=>copy(link,e.currentTarget)},'Copy link')))})];
  }else if(S.etab==='requests'){
    body=[h('p',{class:'note'},'Athletes and brands send these from the page. Approving copies the change into your draft; press Publish to put it live.')];
    if(S.db){const slot=h('div',null,h('p',{class:'small muted'},'Loading calendar holds…'));calHoldsReview().then(b=>slot.replaceChildren(b));body.push(slot)}
    if(!S.db)body.push(h('p',{class:'muted'},'Requests are unavailable in this view.'));
    else if(S.requests==null){body.push(h('p',{class:'muted'},'Loading…'));loadRequests()}
    else if(!S.requests.length)body.push(h('p',{class:'muted'},'No requests right now.'));
    else for(const r of S.requests)body.push(requestCard(r));
  }else body=[picker];
  const foot=h('div',{class:'dlg-foot'},h('button',{class:'btn ghost',type:'button',onclick:()=>$('dlg').close()},'Discard'),h('button',{class:'btn',type:'button',id:'pubBtn',onclick:publish},'Publish changes'));
  openDlg('Company backend',[tabs,h('div',{class:'dlg-body'},body)],foot,true);
}
async function loadProfiles(){try{const snap=await S.db.collection('profiles').limit(300).get();S.profiles=snap.docs.map(x=>({id:x.id,...structuredClone(x.data())})).sort((a,b)=>(b.ts||0)-(a.ts||0))}catch(e){S.profiles=[]}if($('dlg').open&&S.etab==='signups')renderEditor();if(S.slug==='admin')render()}
function payoutLine(x){
  const v=cleanHandle(x.payoutVenmo||''),c=String(x.payoutCashapp||'').replace(/^[\s$]+/,'').trim();
  if(!v&&!c)return h('p',{class:'small',style:'color:#f0b537'},'No payout handles yet.');
  return h('div',{class:'card',style:'padding:10px;border-color:var(--ok);text-transform:none'},h('b',{class:'small'},'Payout · '+(x.payoutName||'Account holder not given')),
    h('div',{class:'row'},
      v?h('a',{class:'btn sm',style:'background:#008cff;color:#fff',href:'https://venmo.com/u/'+encodeURIComponent(v),target:'_blank',rel:'noopener'},'Venmo @'+v):null,
      c?h('a',{class:'btn sm',style:'background:#00b244;color:#fff',href:'https://cash.app/$'+encodeURIComponent(c),target:'_blank',rel:'noopener'},'Cash App $'+c):null));
}
function profileCard(pr){
  const tgt=S.draft.athletes.find(x=>x.uid===pr.id);
  const soc=SOCIALS.filter(s=>cleanHandle(pr.socials?.[s.k])).map(s=>s.label+' @'+cleanHandle(pr.socials[s.k])).join(', ');
  return h('div',{class:'card'},
    h('div',{class:'row between'},h('div',{class:'row'},pr.photo?h('img',{src:pr.photo,alt:'',style:'width:48px;height:48px;border-radius:50%;object-fit:cover'}):h('span',{class:'wav'},initials(pr.name)),h('span',null,h('b',null,pr.name||'No name'),h('span',{class:'small muted',style:'display:block'},[pr.sport,pr.pos,pr.cls&&'Class of '+pr.cls,pr.team,pr.school].filter(Boolean).join(' · ')))),
      h('span',{class:'statuspill '+(pr.status==='approved'?'ok':'wait')},pr.status==='approved'?'Approved':tgt?'Update waiting':'New sign-up')),
    pr.bio?h('p',{class:'small'},pr.bio):null,
    soc?h('p',{class:'small muted'},soc):null,
    payoutLine(pr),
    pr.adult?h('p',{class:'small muted'},'Athlete is 18 or older.'):h('p',{class:'small muted'},'Parent/guardian: '+(pr.guardianName||'not given')+' · '+(pr.guardianContact||'no contact')),
    safeUrl(pr.highlight)?h('a',{class:'small',href:safeUrl(pr.highlight),target:'_blank',rel:'noopener'},'Highlight link ↗'):null,
    h('div',{class:'row'},
      h('button',{class:'btn sm',type:'button',onclick:async e=>{const b=e.currentTarget;let a=tgt;
        if(!a){a={slug:slugify(pr.name),uid:pr.id,name:'',stats:{},wishlist:[],sponsors:[],offers:[],ratings:{},highlights:[],socials:{},membership:{status:'Pending payment'}};S.draft.athletes.push(a)}
        for(const k of ['name','sport','pos','cls','grade','team','school','bio'])if(pr[k])a[k]=pr[k];
        a.socials={...(a.socials||{}),...Object.fromEntries(Object.entries(pr.socials||{}).filter(([k,v])=>cleanHandle(v)))};
        if(pr.photo)a.photo=pr.photo;
        if(cleanHandle(pr.team7Handle||'')||pr.team7Name)a.team7v7={...(a.team7v7||{}),name:pr.team7Name||a.team7v7?.name||'',handle:cleanHandle(pr.team7Handle||'')||a.team7v7?.handle||''};
        if(safeUrl(pr.highlight)&&!(a.highlights||[]).some(v=>v.link===safeUrl(pr.highlight))){a.highlights=a.highlights||[];a.highlights.push({id:rid(),title:'Highlights',url:'',link:safeUrl(pr.highlight)})}
        try{await S.db.doc('profiles/'+pr.id).update({status:'approved'});pr.status='approved'}catch(err){}
        b.disabled=true;b.textContent='Added to draft';toast('Added to draft. Press Publish changes to put it live.')}},tgt?'Apply update':'Approve'),
      h('button',{class:'btn ghost sm',type:'button',onclick:async()=>{try{await S.db.doc('profiles/'+pr.id).delete();S.profiles=S.profiles.filter(x=>x!==pr);renderEditor()}catch(e){toast('Could not remove.')}}},'Decline')));
}
async function loadRequests(){try{const snap=await S.db.collection('requests').limit(200).get();S.requests=snap.docs.map(x=>({id:x.id,...structuredClone(x.data())}));let names={};if(S.user&&S.requests.length){try{names=await S.user.profiles(S.requests.map(r=>r.id))}catch(e){}}S.requests.forEach(r=>r.who=names[r.id]?.name||'Someone')}catch(e){S.requests=[]}if($('dlg').open&&S.etab==='requests')renderEditor()}
function requestCard(r){
  const tgt=S.draft.athletes.find(x=>x.slug===r.athlete);const tName=tgt?.name||'an athlete page';
  return h('div',{class:'card'},
    h('div',{class:'row between'},h('b',null,r.who+(r.athlete||!r.claim?' · for '+tName:' · Profile Claim')),h('button',{class:'btn ghost sm',type:'button',onclick:async()=>{try{await S.db.doc('requests/'+r.id).delete();S.requests=S.requests.filter(x=>x!==r);renderEditor()}catch(e){toast('Could not dismiss.')}}},'Dismiss')),
    r.claim?claimReview(r):null,
    r.passport?h('div',{class:'card',style:'border-color:var(--red)'},h('b',null,'AthleteX Passport Order'),h('p',{class:'small'},[r.passport.name,r.passport.size,r.passport.contact,r.passport.paid&&'Paid with '+r.passport.paid].filter(Boolean).join(' · ')),h('p',{class:'small'},'Program with: ',h('span',{class:'addr'},linkFor(r.passport.tok||'')))):null,
    (r.posts||[]).length?postsReview(r):null,
    (r.drops||[]).length?dropsReview(r):null,
    (r.calendar||[]).length?calendarReview(r):null,
    (r.giftcards||[]).length?giftcardReview(r):null,
    (r.nftOrders||[]).length?nftOrdersReview(r):null,
    r.wallet?h('div',{class:'card',style:'border-color:#f5b700'},h('b',null,'ATHX Wallet · '+(r.wallet.kind||'')),h('p',{class:'addr'},r.wallet.address),
      h('div',{class:'row'},h('button',{class:'btn sm',type:'button',style:'background:#f5b700;color:#1a1300',onclick:()=>{$('dlg').close();location.hash='wallet';setTimeout(()=>openSend(r.wallet.address,STATE.org?.athxReward||'10000'),300)}},'Send '+Number(STATE.org?.athxReward||10000).toLocaleString()+' ATHX Reward'),
        h('a',{class:'btn ghost sm',href:'https://etherscan.io/token/'+ATHX.address+'?a='+r.wallet.address,target:'_blank',rel:'noopener'},'Check On Etherscan ↗'))):null,
    ...(r.items||[]).map(it=>h('div',{class:'row between'},h('span',{class:'small'},(it.brand?it.brand+' · ':'')+it.name+' · '+[it.size,it.color,it.price&&('$'+it.price)].filter(Boolean).join(' · ')+' ',safeUrl(it.link)?h('a',{href:safeUrl(it.link),target:'_blank',rel:'noopener'},'link ↗'):null),
      tgt?h('button',{class:'btn sm',type:'button',onclick:e=>{tgt.wishlist=tgt.wishlist||[];tgt.wishlist.push({id:rid(),name:it.name,brand:it.brand||'',kind:/glove/i.test(it.name)?'gloves':/cleat/i.test(it.name)?'cleats':'other',size:it.size,color:it.color,swatch:'#d8ff2e',price:it.price,link:safeUrl(it.link),funded:false});e.currentTarget.disabled=true;e.currentTarget.textContent='Added'}},'Add to wishlist'):null)),
    r.socials&&Object.values(r.socials).some(Boolean)?h('div',{class:'row between'},h('span',{class:'small'},'Socials: '+SOCIALS.filter(s=>r.socials[s.k]).map(s=>s.label+' @'+r.socials[s.k]+(r.socials[s.k+'Code']?' (bio code '+r.socials[s.k+'Code']+')':'')).join(', ')),tgt?h('button',{class:'btn sm',type:'button',onclick:e=>{tgt.socials={...(tgt.socials||{}),...Object.fromEntries(Object.entries(r.socials).filter(([k,v])=>v&&SOCIALS.some(x=>x.k===k)))};e.currentTarget.disabled=true;e.currentTarget.textContent='Applied'}},'Apply'):null):null,
    ...(r.videos||[]).map(v=>h('div',{class:'row between'},h('span',{class:'small'},'Highlight: '+(v.title||'Clip')+' ',v.url?h('a',{href:v.url,target:'_blank',rel:'noopener'},'preview ↗'):(safeUrl(v.link)?h('a',{href:safeUrl(v.link),target:'_blank',rel:'noopener'},'link ↗'):null)),
      tgt?h('button',{class:'btn sm',type:'button',onclick:async e=>{const b=e.currentTarget;b.disabled=true;b.textContent='Adding…';tgt.highlights=tgt.highlights||[];
        try{let url='',assetId='';if(v.assetId&&S.assets){const blob=await (await fetch(v.url)).blob();const up=await S.assets.upload(blob);url=up.url;assetId=up.id;S.assets.delete(v.assetId).catch(()=>{})}
          tgt.highlights.push({id:rid(),title:v.title||'Highlight',url,assetId,link:url?'':safeUrl(v.link)});b.textContent='Added'}catch(err){b.disabled=false;b.textContent='Add highlight';toast('Could not copy that clip. Ask them to send a link.')}}},'Add highlight'):null)),
    r.sponsor?h('div',{class:'row between'},h('span',{class:'small'},(r.sponsor.logo?'🖼 ':'')+'Sponsor (Spot '+(r.sponsor.spot||'?')+'): '+r.sponsor.company+' · '+r.sponsor.contact+(r.sponsor.plan?' · '+r.sponsor.plan:'')+(r.sponsor.paid?' · Paid with '+r.sponsor.paid:'')+(r.sponsor.message?' · “'+r.sponsor.message+'”':'')),(()=>{const t2=S.draft.athletes.find(x=>x.slug===r.sponsor.athlete);return t2?h('button',{class:'btn sm',type:'button',onclick:e=>{t2.sponsors=t2.sponsors||[];const d0=new Date();d0.setMonth(d0.getMonth()+1);t2.sponsors.push({id:rid(),spot:r.sponsor.spot||openSpots(t2)[0]||0,name:r.sponsor.company,url:safeUrl(r.sponsor.url),tagline:'',logo:/^(assets\/[0-9a-f]{32}\.(jpg|mp4)|https:\/\/[\w.-]+\/storage\/v1\/object\/public\/[\w\-.\/%]+)$/.test(r.sponsor.logo||'')?r.sponsor.logo:'',until:d0.toISOString().slice(0,10)});e.currentTarget.disabled=true;e.currentTarget.textContent='Added · 1 Month'}},'Add Sponsor (1 Month)'):null})()):null);
}

/* ---------- publish (owner) ---------- */
function clean(st){
  st.athletes.forEach(a=>{a.slug=a.slug&&!a.slug.startsWith('athlete-')?a.slug:slugify(a.name);a.photo=a.photo||'';a.sport=SPORTS.includes(a.sport)?a.sport:'Football';a.socials=a.socials||{};a.wishlist=a.wishlist||[];a.highlights=(a.highlights||[]).filter(v=>v.url||safeUrl(v.link));a.highlights.forEach(v=>{v.link=safeUrl(v.link)});a.sponsors=a.sponsors||[];a.stats=a.stats||{};
    SOCIALS.forEach(s=>{a.socials[s.k]=cleanHandle(a.socials?.[s.k])});
    (a.wishlist||[]).forEach(it=>{it.link=safeUrl(it.link);it.stripe=safeUrl(it.stripe)});a.ratings=a.ratings||{};a.ratings.rivalsUrl=safeUrl(a.ratings.rivalsUrl);a.ratings.on3Url=safeUrl(a.ratings.on3Url);a.offers=(a.offers||[]).filter(o=>o.school);(a.sponsors||[]).forEach(s=>{s.url=safeUrl(s.url)})});
  const seen=new Set(['prospects','home','me','admin','chat']);st.athletes.forEach(a=>{let s=a.slug,i=2;while(seen.has(s))s=a.slug+'-'+i++;a.slug=s;seen.add(s)});
  st.pay.stripe=safeUrl(st.pay.stripe);st.pay.calLinks=(st.pay.calLinks||[]).slice(0,31).map(u=>safeUrl(u)||'');st.pay.memberStripe=safeUrl(st.pay.memberStripe);st.org=st.org||{};st.org.siteUrl=safeUrl(st.org.siteUrl);st.pay.venmo=String(st.pay.venmo||'').replace(/^@/,'').trim();st.pay.cashapp=String(st.pay.cashapp||'').replace(/^\$/,'').trim();
  return st;
}
function buildDoc(st){
  const json=JSON.stringify(st).replace(/</g,'\\u003c').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
  return PREFIX+'\n'+HEAD_HTML+'<style id="css">'+$('css').textContent+'</style>\n'+STATIC_HTML+'<script type="application/json" id="state">'+json+SC+'\n<script id="app-js">'+$('app-js').textContent+SC+'\n</body></html>';
}
async function publish(){
  if(!S.artifact){toast('Publishing is unavailable in this view.');return}
  const btn=$('pubBtn');btn.disabled=true;btn.textContent='Publishing…';
  const next=clean(structuredClone(S.draft));
  try{await S.artifact.publish(buildDoc(next));toast('Published');}
  catch(e){btn.disabled=false;btn.textContent='Publish changes';
    toast(e?.code==='conflict'?'Someone else published first. The page will reload with their version.':e?.code==='not_writer'||e?.code==='not_granted'?'Only the owner can publish this page.':'Publish failed. Try again.')}
}












/* ---------- affiliate links: every product link earns referral credit ---------- */
let STATE_PREVIEW=null;
function affLinkWith(R,u){
  u=safeUrl(u);if(!u)return '';let host='';try{host=new URL(u).hostname.replace(/^www\./,'').toLowerCase()}catch(e){return u}
  R=R||{};
  for(const p of R.programs||[]){
    if(p.status!=='Approved')continue;const doms=p.domains||[];if(!doms.some(d=>host===d||host.endsWith('.'+d)))continue;
    if(p.id==='amazon'){const tag=String(p.link||'').trim();if(/^[\w-]{3,40}$/.test(tag)){try{const x=new URL(u);x.searchParams.set('tag',tag);return x.toString()}catch(e){}}continue}
    const t=String(p.template||'');if(t.includes('{url}')&&safeUrl(t.replace('{url}','x')))return t.replace('{url}',encodeURIComponent(u));
  }
  const sk=String(R.skimlinksId||'').trim(),sv=String(R.sovrnKey||'').trim();
  if(/^[\w]{4,40}$/.test(sk))return 'https://go.skimresources.com/?id='+encodeURIComponent(sk)+'&xs=1&url='+encodeURIComponent(u);
  if(/^[\w-]{8,64}$/.test(sv))return 'https://redirect.viglink.com?key='+encodeURIComponent(sv)+'&u='+encodeURIComponent(u);
  return u;
}
const affLink=u=>affLinkWith(STATE.referral,u);



/* ---------- owner revenue + donation tracking ---------- */
function stampFunded(obj,el){el.addEventListener('change',()=>{obj.fundedAt=el.checked?dayKey():''});return el}
const REV_COLORS={gear:'#ef3b45',giftcard:'#d8ff2e',calendar:'#35c58a',sponsor:'#1d9bf0',membership:'#a78bfa'};
const REV_LABEL={gear:'Gear donation',giftcard:'Gift card donation',calendar:'Calendar donation',sponsor:'Sponsor (monthly)',membership:'Membership'};
function revenueData(){
  const rows=[];const now=new Date();const mk=monthKey(now);const today=now.toISOString().slice(0,10);
  const sp=+String(STATE.pay?.sponsorPrice||'10').replace(/[^\d.]/g,'')||10,mem=+mp()||0;
  for(const a of athletes()){
    for(const it of a.wishlist||[]){const amt=money(it.gift||it.price)||0;rows.push({athlete:a.name,slug:a.slug,type:'gear',desc:it.name+(it.size?' ('+it.size+')':''),amount:amt,status:it.funded?'Received':'Open',date:it.fundedAt||''})}
    for(const g of a.giftcards||[]){rows.push({athlete:a.name,slug:a.slug,type:'giftcard',desc:gcBrand(g.brand).name+' gift card',amount:+g.amount||0,status:g.funded?'Received':'Open',date:g.fundedAt||''})}
    for(const [m,days] of Object.entries(a.calendar||{}))for(const [d,v] of Object.entries(days||{}))rows.push({athlete:a.name,slug:a.slug,type:'calendar',desc:'Calendar day '+m+'-'+String(d).padStart(2,'0')+(v?.name?' · '+v.name:''),amount:+d,status:'Received',date:v?.ts?dayKey(new Date(v.ts)):m+'-'+String(d).padStart(2,'0')});
    for(const x of a.sponsors||[]){if(!x.name)continue;const active=!x.until||x.until>=today;rows.push({athlete:a.name,slug:a.slug,type:'sponsor',desc:x.name+(x.spot?' · Spot '+x.spot:'')+(x.until?' · through '+x.until:''),amount:sp,status:active?'Active':'Ended',date:''})}
    if(a.membership?.status==='Active')rows.push({athlete:a.name,slug:a.slug,type:'membership',desc:'Membership'+(a.membership.expires?' · through '+a.membership.expires:''),amount:mem,status:'Active',date:''});
  }
  const sum=f=>rows.filter(f).reduce((t,r)=>t+r.amount,0);
  const nftATHX=athletes().flatMap(a=>a.drops||[]).reduce((t,d)=>t+(+d.sold||0)*(+d.price||0),0);
  const k={
    donations:sum(r=>['gear','giftcard','calendar'].includes(r.type)&&r.status==='Received'),
    gear:sum(r=>r.type==='gear'&&r.status==='Received'),giftcard:sum(r=>r.type==='giftcard'&&r.status==='Received'),calendar:sum(r=>r.type==='calendar'),
    calMonth:rows.filter(r=>r.type==='calendar'&&r.desc.includes(mk)).reduce((t,r)=>t+r.amount,0),
    open:sum(r=>['gear','giftcard'].includes(r.type)&&r.status==='Open'),
    mrr:sum(r=>r.type==='sponsor'&&r.status==='Active'),members:sum(r=>r.type==='membership'),nftATHX};
  k.total=k.donations+k.mrr+k.members;
  return {rows,k};
}
const usd=n=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:2});
function revenueSummary(){
  const {k}=revenueData();
  return h('a',{class:'panel',href:'#revenue',style:'padding:16px;display:grid;gap:10px;text-decoration:none;color:var(--fg);border-color:var(--ok)'},
    h('div',{class:'row between'},h('span',null,h('p',{class:'eyebrow'},'Revenue & Donations'),h('b',{style:'font:900 1.6rem/1 var(--display);text-transform:uppercase'},'Open Dashboard')),h('span',{html:I.right,style:'display:grid'})),
    h('div',{class:'rev-kpis'},h('div',{class:'kpi'},h('small',null,'Donations Received'),h('b',null,usd(k.donations))),h('div',{class:'kpi'},h('small',null,'Sponsor MRR'),h('b',null,usd(k.mrr))),h('div',{class:'kpi'},h('small',null,'Memberships'),h('b',null,usd(k.members))),h('div',{class:'kpi'},h('small',null,'Open Wishlists'),h('b',null,usd(k.open)))));
}
const REVF={type:'',athlete:'',status:''};
function revenuePage(){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  if(!S.isOwner){sec.append(h('div',{class:'panel',style:'padding:20px'},h('h2',{style:'font-size:2rem'},'Company access only')));return w}
  const {rows,k}=revenueData();
  const kpi=(l,v,sub)=>h('div',{class:'kpi'},h('small',null,l),h('b',null,v),sub?h('span',null,sub):null);
  // per-athlete stacked bars (received money only)
  const by={};rows.forEach(r=>{if(!['Received','Active'].includes(r.status))return;(by[r.athlete]=by[r.athlete]||{gear:0,giftcard:0,calendar:0,sponsor:0,membership:0})[r.type]+=r.amount});
  const maxT=Math.max(1,...Object.values(by).map(o=>Object.values(o).reduce((t,v)=>t+v,0)));
  const filtered=rows.filter(r=>(!REVF.type||r.type===REVF.type)&&(!REVF.athlete||r.athlete===REVF.athlete)&&(!REVF.status||r.status===REVF.status)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const fsel=(key,label,opts)=>h('label',null,label,h('select',{onchange:e=>{REVF[key]=e.target.value;render()}},h('option',{value:''},'All'),opts.map(([v,t])=>h('option',{value:v,selected:REVF[key]===v},t))));
  const csv=()=>{const esc=x=>'"'+String(x??'').replace(/"/g,'""')+'"';return ['Date,Athlete,Type,Description,Amount (USD),Status',...filtered.map(r=>[r.date,r.athlete,REV_LABEL[r.type],r.desc,r.amount,r.status].map(esc).join(','))].join('\n')};
  sec.append(
    h('div',{class:'row between'},h('div',null,h('p',{class:'eyebrow'},'Owner · Revenue Dashboard'),h('h2',{style:'font-size:clamp(2rem,7vw,2.8rem)'},'Revenue & Donations')),h('a',{class:'btn ghost sm',href:'#admin'},'Back To Company')),
    h('div',{class:'rev-kpis'},
      kpi('Total Revenue',usd(k.total),'Donations + sponsors + memberships'),
      kpi('Donations Received',usd(k.donations),'Gear '+usd(k.gear)+' · Cards '+usd(k.giftcard)+' · Calendar '+usd(k.calendar)),
      kpi('Sponsor MRR',usd(k.mrr),usd(k.mrr*12)+' a year'),
      kpi('Memberships',usd(k.members),'Active, $'+mp()+'/yr each'),
      kpi('Gift Cards Donated',usd(k.giftcard),rows.filter(r=>r.type==='giftcard'&&r.status==='Received').length+' cards'),
      kpi('Calendar This Month',usd(k.calMonth),''),
      kpi('Open Wishlists',usd(k.open),'Items and cards still to fund'),
      kpi('NFT Sales',k.nftATHX.toLocaleString()+' ATHX','Paid in ATHX')),
    h('div',{class:'panel',style:'padding:16px;display:grid;gap:12px'},h('h3',{style:'font-size:1.4rem'},'By Athlete'),
      h('div',{class:'legend'},Object.entries(REV_COLORS).map(([t,c])=>h('span',null,h('i',{style:'background:'+c}),REV_LABEL[t]))),
      Object.keys(by).length?h('div',{class:'bars'},Object.entries(by).sort((a,b)=>Object.values(b[1]).reduce((t,v)=>t+v,0)-Object.values(a[1]).reduce((t,v)=>t+v,0)).map(([name,o])=>{const tot=Object.values(o).reduce((t,v)=>t+v,0);
        return h('div',{class:'barrow'},h('span',{style:'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'},name),h('div',{class:'bar',title:usd(tot)},Object.entries(o).filter(([,v])=>v>0).map(([t,v])=>h('i',{style:'width:'+(v/maxT*100)+'%;background:'+REV_COLORS[t],title:REV_LABEL[t]+': '+usd(v)}))),h('b',null,usd(tot)))})):h('p',{class:'muted'},'No money received yet. Mark items Gifted and confirm calendar days to see them here.')),
    h('div',{class:'panel',style:'padding:16px;display:grid;gap:12px'},
      h('div',{class:'row between'},h('h3',{style:'font-size:1.4rem'},'Items & Donations Tracker'),h('button',{class:'btn ghost sm',onclick:async()=>{const dl=await claude.use('downloads').catch(()=>null);const data=new Blob([csv()],{type:'text/csv'});if(dl){try{await dl.save({filename:'faa-revenue-'+new Date().toISOString().slice(0,10)+'.csv',data})}catch(e){}}else{const u=URL.createObjectURL(data);const a2=h('a',{href:u,download:'faa-revenue.csv'});document.body.append(a2);a2.click();a2.remove()}}},'Download CSV')),
      h('div',{class:'g3'},fsel('type','Type',Object.entries(REV_LABEL)),fsel('athlete','Athlete',[...new Set(rows.map(r=>r.athlete))].map(x=>[x,x])),fsel('status','Status',[['Received','Received'],['Open','Open (not funded)'],['Active','Active'],['Ended','Ended']])),
      h('p',{class:'small muted'},filtered.length+' rows · '+usd(filtered.reduce((t,r)=>t+r.amount,0))),
      h('div',{class:'tblwrap'},h('table',{class:'ledger'},h('thead',null,h('tr',null,['Date','Athlete','Type','Item','Amount','Status'].map(x=>h('th',null,x)))),
        h('tbody',null,filtered.map(r=>h('tr',null,h('td',null,r.date||'—'),h('td',null,r.athlete),h('td',null,h('span',{style:'display:inline-flex;align-items:center;gap:6px'},h('i',{style:'width:8px;height:8px;border-radius:2px;background:'+REV_COLORS[r.type]}),REV_LABEL[r.type])),h('td',null,r.desc),h('td',{class:'num'},usd(r.amount)),h('td',null,h('span',{class:'statuspill '+(r.status==='Received'||r.status==='Active'?'ok':'wait')},r.status))))))),
      h('p',{class:'small muted'},'Money comes in as donations; Future All American buys each item or card for the athlete. Gear and gift cards count once you tick Gifted, calendar days once you Confirm Paid, sponsors while their paid-through date is current. Publish after changes to update this dashboard.')));
  return w;
}

/* ---------- gift card carousel (counts as a donation) ---------- */
const GC_BRANDS=[
  {k:'nike',name:'Nike',bg:'linear-gradient(135deg,#111,#3a3a3a)',buy:'https://www.nike.com/w?q=gift%20card'},
  {k:'adidas',name:'adidas',bg:'linear-gradient(135deg,#1d1d1b,#4a4a48)',buy:'https://www.adidas.com/us/search?q=gift%20card'},
  {k:'ua',name:'Under Armour',bg:'linear-gradient(135deg,#1d1d1d,#c8102e)',buy:'https://www.underarmour.com/en-us/search/?q=gift%20card'},
  {k:'puma',name:'PUMA',bg:'linear-gradient(135deg,#ba2025,#6d0f12)',buy:'https://us.puma.com/us/en/search?q=gift%20card'},
  {k:'dicks',name:"DICK'S",bg:'linear-gradient(135deg,#0b5c38,#063a23)',buy:'https://www.dickssportinggoods.com/search/SearchDisplay?searchTerm=gift%20card'},
  {k:'footlocker',name:'Foot Locker',bg:'linear-gradient(135deg,#222,#5b5b5b)',buy:'https://www.footlocker.com/search?query=gift%20card'},
  {k:'amazon',name:'Amazon',bg:'linear-gradient(135deg,#232f3e,#ff9900)',buy:'https://www.amazon.com/s?k=gift+card'},
  {k:'apple',name:'Apple',bg:'linear-gradient(135deg,#1c1c1e,#8e8e93)',buy:'https://www.apple.com/shop/gift-cards'},
  {k:'visa',name:'Visa Prepaid',bg:'linear-gradient(135deg,#1a1f71,#2e3fbf)',buy:''}];
const gcBrand=k=>GC_BRANDS.find(b=>b.k===k)||{k,name:k,bg:'linear-gradient(135deg,#333,#666)',buy:''};
function gcFace(g){const b=gcBrand(g.brand);return h('div',{class:'gc-face',style:'background:'+b.bg},h('small',null,'GIFT CARD'),g.funded?h('span',{class:'chip'},'Gifted ✓'):null,h('b',null,b.name),h('span',{class:'amt'},'$'+(g.amount||0)))}
function giftCards(a){
  const list=(a.giftcards||[]).filter(g=>g.brand&&+g.amount>0);
  const canAdd=S.db&&S.uid;
  if(!list.length&&!canAdd)return null;
  return h('section',null,
    h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'Gift Cards · Counts As A Donation'),h('h2',null,'Gift Card Wishlist')),canAdd?h('button',{class:'btn ghost sm',onclick:()=>openGiftCardPicker(a)},'Pick Gift Cards'):null),
    list.length?h('div',{class:'gc-track'},list.map(g=>h('button',{class:'gc',type:'button',disabled:!!g.funded,'aria-label':'Gift a $'+g.amount+' '+gcBrand(g.brand).name+' gift card',onclick:()=>openGiftCardGift(a,g)},gcFace(g),h('span',{class:'small'},g.funded?'Gifted · Thank you!':'Tap to gift')))):h('p',{class:'muted'},'No gift cards yet. Pick the ones you want.'),
    h('p',{class:'disclose'},'Gift cards are donations received by '+(STATE.org?.nonprofit||'Future All American Academy')+'. Future All American buys the card and sends it to '+first(a.name)+"'s family."));
}
function openGiftCardGift(a,g){
  const p=STATE.pay||{};const b=gcBrand(g.brand);const amt=+g.amount||0;const memo='FAA Gift Card – '+b.name+' $'+amt+' – '+a.name;
  const stripe=safeUrl(p.stripe);
  openDlg('Gift A '+b.name+' Gift Card',h('div',{class:'dlg-body'},
    gcFace(g),
    h('p',{class:'muted'},'Send $'+amt+' and Future All American buys this '+b.name+' gift card for '+first(a.name)+'. It counts as a donation to '+(STATE.org?.nonprofit||'Future All American Academy')+'.'),
    stripe?h('a',{class:'btn stripe',href:stripe,target:'_blank',rel:'noopener',html:I.card+' Pay $'+amt+' with Apple Pay or card'}):null,
    h('div',{class:'row'},
      p.venmo?h('a',{class:'btn sm',style:'background:#008cff;color:#fff',href:'https://venmo.com/u/'+encodeURIComponent(p.venmo),target:'_blank',rel:'noopener'},'Venmo $'+amt):null,
      p.cashapp?h('a',{class:'btn sm',style:'background:#00b244;color:#fff',href:'https://cash.app/$'+encodeURIComponent(p.cashapp)+'/'+amt,target:'_blank',rel:'noopener'},'Cash App $'+amt):null,
      p.zelle?h('button',{class:'btn sm',type:'button',style:'background:#6d1ed4;color:#fff',onclick:e=>copy(p.zelle,e.currentTarget)},'Zelle '+fmtPhone(p.zelle)):null),
    h('label',null,'Put this in the payment note',h('div',{class:'copyline'},h('code',null,memo),h('button',{class:'btn ghost sm',type:'button',onclick:e=>copy(memo,e.currentTarget)},'Copy')))));
}
function openGiftCardPicker(a){
  const phone=STATE.org?.phone||'(520) 440-0341';
  if(!(S.db&&S.uid)){openDlg('Pick Gift Cards',h('div',{class:'dlg-body'},h('p',null,'Sign in to add gift cards to your page.'),h('a',{class:'btn',href:'#signin',onclick:()=>$('dlg').close(),style:'justify-self:start'},'Sign In'),h('p',{class:'small muted'},'Or text ',h('b',null,phone),'.')));return}
  let brand=GC_BRANDS[0].k,amount=50;const body=h('div',{class:'dlg-body'});
  const draw=()=>{
    const custom=h('input',{inputmode:'numeric',maxlength:4,placeholder:'Other amount',value:[25,50,100,150].includes(amount)?'':amount,oninput:e=>{const v=parseInt(e.target.value.replace(/\D/g,''),10);if(v>0){amount=Math.min(500,v);prev.replaceChildren(gcFace({brand,amount}))}}});
    const prev=h('div',null,gcFace({brand,amount}));
    body.replaceChildren(
      prev,
      h('b',null,'1. Choose A Store'),
      h('div',{class:'gcpick'},GC_BRANDS.map(b=>h('button',{type:'button',style:'background:'+b.bg,'aria-pressed':brand===b.k?'true':'false',onclick:()=>{brand=b.k;draw()}},b.name))),
      h('b',null,'2. Choose An Amount'),
      h('div',{class:'amts'},[25,50,100,150].map(v=>h('button',{type:'button','aria-pressed':amount===v?'true':'false',onclick:()=>{amount=v;draw()}},'$'+v)),custom),
      h('button',{class:'btn',type:'button',onclick:()=>{saveRequest({giftcard:{id:rid(),athlete:a.slug,brand,amount,ts:Date.now()}},'Sent. Your gift card shows on your page after Future All American reviews it.')}},'Add To '+first(a.name)+"'s Gift Cards"),
      h('p',{class:'small muted'},'Future All American reviews each pick before it shows on your page.'));
  };
  draw();openDlg('Pick Gift Cards',body);
}
function giftcardReview(r){
  return h('div',{class:'card',style:'border-color:var(--volt)'},h('b',null,'Gift Card Picks'),
    ...(r.giftcards||[]).slice(-10).reverse().map(g=>{const tgt=S.draft.athletes.find(x=>x.slug===g.athlete);const have=tgt?.giftcards?.some(x=>x.id===g.id);
      return h('div',{class:'row between'},h('span',{class:'small'},(tgt?.name||g.athlete)+' · '+gcBrand(g.brand).name+' $'+g.amount),
        tgt?h('button',{class:'btn sm',type:'button',disabled:!!have,onclick:e=>{tgt.giftcards=tgt.giftcards||[];tgt.giftcards.push({id:g.id,brand:g.brand,amount:g.amount,funded:false});e.currentTarget.disabled=true;e.currentTarget.textContent='Added · Publish'}},have?'On Page':'Add To Page'):null)}));
}
function giftcardEditor(a){
  a.giftcards=a.giftcards||[];
  return h('div',{class:'card',style:'border-color:var(--volt)'},h('b',null,'Gift Cards'),
    ...a.giftcards.map((g,i)=>{const b=gcBrand(g.brand);return h('div',{class:'row between'},h('span',{class:'small'},b.name+' $'+g.amount+(g.funded?' · Gifted':'')),
      h('div',{class:'row'},b.buy?h('a',{class:'btn ghost sm',href:affLink(b.buy),target:'_blank',rel:'noopener'},'Buy Card ↗'):null,
        h('label',{style:'display:flex;gap:6px;align-items:center;color:var(--fg)'},stampFunded(g,bind(g,'funded',{type:'checkbox'})),'Gifted'),
        h('button',{class:'btn ghost sm',type:'button',onclick:()=>{a.giftcards.splice(i,1);renderEditor()}},'Remove')))}),
    h('div',{class:'row'},h('select',{id:'gc_new_b'},GC_BRANDS.map(b=>h('option',{value:b.k},b.name))),h('input',{id:'gc_new_a',inputmode:'numeric',placeholder:'$',style:'max-width:90px'}),
      h('button',{class:'btn ghost sm',type:'button',onclick:()=>{const amt=parseInt(($('gc_new_a').value||'').replace(/\D/g,''),10);if(!(amt>0)){toast('Enter an amount.');return}a.giftcards.push({id:rid(),brand:$('gc_new_b').value,amount:amt,funded:false});renderEditor()}},'Add Gift Card')));
}

/* ---------- user backend (athlete dashboard) ---------- */
const UB={tab:'overview'};
const UB_TABS=[['overview','Overview'],['page','My Page'],['sponsors','Sponsors'],['nfts','NFTs'],['calendar','Calendar'],['earn','Share & Earn'],['payouts','Payouts'],['profile','Profile']];
function ubTabs(){return h('div',{class:'ubtabs',role:'tablist','aria-label':'My backend'},UB_TABS.map(([k,l])=>h('button',{class:'ubtab',role:'tab','aria-selected':UB.tab===k?'true':'false',onclick:()=>{UB.tab=k;render()}},l)))}
function ubBody(a,p){
  const mk=monthKey();const cal=calTaken(a,mk);const raised=Object.keys(cal).reduce((t,d)=>t+(+d),0);
  const sp=activeSponsors(a);const open=openSpots(a);const drops=a.drops||[];const sold=drops.reduce((t,d)=>t+(+d.sold||0),0);
  const posts=S.myReq?.posts||[];const wk=posts.filter(x=>x.date>=dayKey(weekStart())).length;const athxSent=posts.filter(x=>x.paid).reduce((t,x)=>t+(x.reward||0),0);
  const unlocked=isUnlocked(a);const mem=a.membership||{};
  if(!S.myReq&&S.db&&S.uid&&!UB.loading){UB.loading=true;loadMyReq().then(()=>{UB.loading=false;if(S.slug==='me')render()})}
  const kpi=(label,val,sub,tab)=>h(tab?'button':'div',{class:'kpi',type:tab?'button':null,onclick:tab?()=>{UB.tab=tab;render()}:null},h('small',null,label),h('b',null,val),sub?h('span',null,sub):null);
  const panel=(...k)=>h('div',{class:'panel',style:'padding:18px;display:grid;gap:12px'},...k);
  const head=(eb,title)=>[h('p',{class:'eyebrow'},eb),h('h3',{style:'font-size:1.6rem'},title)];
  const wrap=h('div',{class:'dash'});const add=(...k)=>wrap.append(...k.filter(x=>x!=null&&x!==false));
  if(UB.tab==='overview'){
    add(
      h('div',{class:'row between'},h('div',null,h('p',{class:'eyebrow'},'My Backend'),h('h2',{style:'font-size:2.2rem'},'Hi, '+first(a.name))),h('a',{class:'btn ghost sm',href:'#'+a.slug},'View My Page')),
      unlocked?null:h('div',{class:'note'},'Your page is locked. Activate your membership to turn on donations, sponsors, NFT drops and the gear carousel.'),
      h('div',{class:'kpis'},
        kpi('Membership',mem.status||'None',mem.expires?'Through '+mem.expires:'$'+mp()+'/year'),
        kpi('Sponsors',sp.length+' / '+spotCount(),open.length+' spots open','sponsors'),
        kpi('Donations Received',usd(revenueData().rows.filter(r=>r.slug===a.slug&&['gear','giftcard','calendar'].includes(r.type)&&r.status==='Received').reduce((t,r)=>t+r.amount,0)),'Gear, gift cards and calendar'),
        kpi('Calendar',  '$'+raised,Object.keys(cal).length+' days taken this month','calendar'),
        kpi('NFTs Sold',sold,drops.length+' drop'+(drops.length===1?'':'s'),'nfts'),
        kpi('Posts This Week',wk,wk?'Weekly post done':'1 post due','earn'),
        kpi('ATHX Earned',athxSent.toLocaleString(),'From Share & Earn','earn')),
      panel(h('p',{class:'eyebrow'},'Quick Actions'),h('div',{class:'row'},
        h('button',{class:'btn sm',onclick:()=>openConnect(a.slug)},'My QR & NFC'),
        h('a',{class:'btn ghost sm',href:'#share-'+a.slug},'Post On Instagram'),
        unlocked?h('button',{class:'btn ghost sm',onclick:()=>openCreateDrop(a)},'Create NFT Drop'):null,
        unlocked?h('button',{class:'btn ghost sm',onclick:()=>openBrandPicker(a)},'Add Gear'):null,
        unlocked?h('button',{class:'btn ghost sm',onclick:()=>openGiftCardPicker(a)},'Add Gift Card'):null,
        h('button',{class:'btn ghost sm',onclick:()=>openRequest('video',a)},'Upload Highlight'),
        h('a',{class:'btn ghost sm',href:'#wallet'},'ATHX Wallet'))));
  }else if(UB.tab==='page'){
    const items=S.myReq?.items||[],vids=S.myReq?.videos||[];
    add(panel(...head('My Page','Update Your Page'),
      h('p',{class:'small muted'},'Changes go to Future All American for review before they show. Combine and track numbers are entered by Future All American only.'),
      h('div',{class:'row'},h('button',{class:'btn sm',onclick:()=>openRequest('video',a)},'Upload Highlight'),h('button',{class:'btn ghost sm',onclick:()=>openRequest('socials',a)},'Social Handles'),unlocked?h('button',{class:'btn ghost sm',onclick:()=>openBrandPicker(a)},'Add Gear (Nike, adidas, UA, Puma)'):h('button',{class:'btn ghost sm',onclick:()=>openRequest('gear',a)},'Suggest Gear'),h('button',{class:'btn ghost sm',onclick:()=>{UB.tab='profile';render()}},'Edit Profile & Photo')),
      h('div',{class:'card'},h('b',null,'On Your Page Now'),h('p',{class:'small'},(a.wishlist||[]).length+' gear items · '+(a.highlights||[]).length+' highlights · '+(a.offers||[]).filter(o=>o.school).length+' offers'+(a.team7v7?.name?' · 7v7: '+a.team7v7.name:''))),
      items.length||vids.length?h('div',{class:'card'},h('b',null,'Waiting For Review'),...items.map(i=>h('p',{class:'small'},(i.brand?i.brand+' · ':'')+i.name)),...vids.map(v=>h('p',{class:'small'},'Highlight: '+(v.title||'Clip')))):null));
  }else if(UB.tab==='sponsors'){
    const link=linkFor(a.slug);
    add(panel(...head('Sponsors','My Sponsor Spots'),
      h('p',{class:'small muted'},'You have '+spotCount()+' sponsor spots. Each spot is $'+(STATE.pay?.sponsorPrice||'10')+' a month, paid by the sponsor. AthleteCoin is the official sponsor on every athlete page.'),
      ...[...Array(spotCount())].map((_,i)=>{const n=i+1;const s0=sp.find((x,j)=>(+x.spot||j+1)===n);
        return h('div',{class:'card',style:'grid-template-columns:auto 1fr auto;align-items:center'},h('span',{class:'spon-logo',style:'width:44px;height:44px'},s0?.logo?h('img',{src:s0.logo,alt:''}):s0?initials(s0.name):'+'),
          h('span',null,h('b',null,'Spot '+n+' · '+(s0?s0.name:'Open')),h('p',{class:'small muted'},s0?(s0.until?'Paid through '+s0.until:'Active'):'Share your page with local businesses')),
          s0?null:h('button',{class:'btn ghost sm',onclick:()=>copy('Sponsor me on Future All American: '+link,null)},'Copy Pitch'))}),
      h('p',{class:'linkline'},link)));
  }else if(UB.tab==='nfts'){
    const mine=S.myReq?.drops||[];
    add(panel(...head('NFT Drops','My NFTs'),
      unlocked?h('button',{class:'btn',style:'justify-self:start;background:#f5b700;color:#1a1300',onclick:()=>openCreateDrop(a)},'Create NFT Drop'):h('p',{class:'note'},'Activate your membership to create NFT drops.'),
      ...drops.map(d=>h('div',{class:'card'},h('div',{class:'row between'},h('b',null,d.title),h('span',{class:'chip ok'},dropState(d)==='presale'?'Pre-Order':dropState(d)==='live'?'Live':'Sold Out')),
        h('p',{class:'small'},(CHAINS[d.chain]?.name||d.chain)+' · '+Number(d.price).toLocaleString()+' ATHX · '+(+d.sold||0)+' of '+d.supply+' sold · drops '+new Date(d.dropAt).toLocaleString()))),
      ...mine.filter(m=>!drops.some(d=>d.id===m.id)).map(d=>h('div',{class:'card'},h('div',{class:'row between'},h('b',null,d.title),h('span',{class:'statuspill wait'},'In Review')),h('p',{class:'small'},Number(d.price).toLocaleString()+' ATHX × '+d.supply))),
      !drops.length&&!mine.length?h('p',{class:'muted'},'No drops yet.'):null));
  }else if(UB.tab==='calendar'){
    const now=new Date();const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();const start=new Date(now.getFullYear(),now.getMonth(),1).getDay();
    const cells=[];for(let i=0;i<start;i++)cells.push(h('span'));for(let d=1;d<=dim;d++){const t=cal[d];cells.push(h('div',{class:'cday'+(t?' taken':'')},h('b',null,d),h('small',null,t?(t.name||'✓'):'$'+d)))}
    add(panel(...head('Donation Calendar',now.toLocaleString('en-US',{month:'long'})+' · $'+raised+' Raised'),
      h('div',{class:'cal'},['S','M','T','W','T','F','S'].map(x=>h('span',{class:'dow'},x)),cells),
      h('p',{class:'small muted'},Object.keys(cal).length+' of '+dim+' days taken. A full month raises $'+(dim*(dim+1)/2)+'. Share your page so family and fans can take a day.'),
      h('button',{class:'btn ghost sm',style:'justify-self:start',onclick:e=>copy('Take a day on my donation calendar: '+linkFor(a.slug),e.currentTarget)},'Copy Calendar Link')));
  }else if(UB.tab==='earn'){
    add(panel(...head('Share & Earn','Instagram Posts'),
      h('div',{class:'kpis'},kpi('This Week',wk,wk?'Done':'1 post due'),kpi('Total Posts',posts.length,''),kpi('ATHX Sent',athxSent.toLocaleString(),posts.filter(x=>x.reward&&!x.paid).length+' pending')),
      ...posts.slice(-8).reverse().map(x=>h('p',{class:'small'},x.date+' · ',h('a',{href:x.url,target:'_blank',rel:'noopener'},'View Post ↗'),' · '+(x.paid?x.reward+' ATHX sent':x.reward?'Pending':'No reward'))),
      h('a',{class:'btn',href:'#share-'+a.slug,style:'justify-self:start;background:linear-gradient(45deg,#fa7e1e,#d62976,#962fbf);color:#fff'},'Make Today\'s Post')));
  }else if(UB.tab==='payouts'){
    const w0=S.myReq?.wallet;
    add(panel(...head('Payouts','Where Your Money Goes'),
      h('p',{class:'small muted'},'Donations, calendar days and sponsor money for your page are paid out to these accounts. Only Future All American can see them.'),
      payoutLine(p),
      h('button',{class:'btn ghost sm',style:'justify-self:start',onclick:()=>{UB.tab='profile';render()}},'Edit Payout Handles'),
      h('div',{class:'card',style:'border-color:#f5b700'},h('b',null,'ATHX Wallet'),w0?.address?h('p',{class:'addr'},w0.address):h('p',{class:'small muted'},'No wallet connected yet.'),h('a',{class:'btn sm',href:'#wallet',style:'justify-self:start'},w0?.address?'Open Wallet':'Connect Wallet'))));
  }
  return wrap;
}

/* ---------- donation calendar: pick a day, give that day's dollar amount ---------- */
const monthKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
function calTaken(a,mk){return ((a.calendar||{})[mk])||{}}
function calendarSection(a){
  const mk=monthKey();const taken=calTaken(a,mk);const n=Object.keys(taken).length;const dim=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
  const raised=Object.keys(taken).reduce((t,d)=>t+(+d),0);const goal=dim*(dim+1)/2;
  return h('section',null,h('button',{class:'calbtn',onclick:()=>openCalendar(a)},
    h('span',null,h('p',{class:'eyebrow'},'Donation Calendar · '+new Date().toLocaleString('en-US',{month:'long'})),h('b',null,'Take A Day For '+first(a.name)),h('p',{class:'small muted'},'Day 1 is $1, day 15 is $15. '+n+' of '+dim+' days taken · $'+raised+' of $'+goal)),
    h('span',{html:I.right,style:'display:grid'})));
}
const CAL={holds:null,at:0};
const HOLD_MS=30*60*1000;
async function loadCalHolds(force){
  if(!S.db)return [];if(CAL.holds&&!force&&Date.now()-CAL.at<15000)return CAL.holds;
  try{const snap=await S.db.collection('caldays').limit(500).get();CAL.holds=snap.docs.flatMap(d=>((d.data()||{}).holds||[]).map(x=>({...x,uid:d.id})));CAL.at=Date.now()}catch(e){CAL.holds=CAL.holds||[]}
  return CAL.holds;
}
function calDayStatus(a,mk,day){
  if(calTaken(a,mk)[day])return 'taken';
  const hs=(CAL.holds||[]).filter(x=>x.athlete===a.slug&&x.month===mk&&+x.day===+day);
  if(hs.some(x=>x.status==='paid'))return 'taken';
  if(hs.some(x=>x.status==='held'&&Date.now()-x.ts<HOLD_MS))return 'held';
  return 'open';
}
function calLink(day,ref){const u=safeUrl((STATE.pay?.calLinks||[])[day-1]||'');if(!u)return '';return u+(u.includes('?')?'&':'?')+'client_reference_id='+encodeURIComponent(ref)}
async function holdDay(a,mk,day,extra){
  if(!(S.db&&S.uid))return;
  try{const ref=S.db.doc('caldays/'+S.uid);const cur=await ref.get();const holds=((cur.exists?cur.data().holds:[])||[]).filter(x=>!(x.athlete===a.slug&&x.month===mk&&+x.day===+day)&&(x.status==='paid'||Date.now()-x.ts<HOLD_MS));
    holds.push({athlete:a.slug,month:mk,day,amount:day,status:'held',ts:Date.now(),...extra});await ref.set({holds:holds.slice(-40)});CAL.at=0}catch(e){}
}
async function openCalendar(a){
  const now=new Date();const y=now.getFullYear(),mo=now.getMonth();const mk=monthKey(now);const dim=new Date(y,mo+1,0).getDate();const start=new Date(y,mo,1).getDay();
  let pick=0;const p=STATE.pay||{};const body=h('div',{class:'dlg-body'},h('p',{class:'muted'},'Loading open days…'));
  openDlg(first(a.name)+"'s Donation Calendar",body);
  await loadCalHolds(true);
  const draw=()=>{
    const cells=[];for(let i=0;i<start;i++)cells.push(h('span'));
    let open=0;
    for(let d=1;d<=dim;d++){const stt=calDayStatus(a,mk,d);if(stt==='open')open++;
      cells.push(h('button',{type:'button',class:'cday'+(stt!=='open'?' taken':''),disabled:stt!=='open','aria-pressed':pick===d?'true':'false','aria-label':'Day '+d+(stt==='taken'?' taken':stt==='held'?' being paid':' $'+d),onclick:()=>{pick=d;draw()}},h('b',null,d),h('small',null,stt==='taken'?'TAKEN':stt==='held'?'HELD':'$'+d)))}
    const ref=a.slug+'__'+mk+'__'+pick+'__'+(S.uid||'guest');
    const stripe=pick?calLink(pick,ref):'';
    const memo='FAA Calendar – '+a.name+' – '+new Date(y,mo,pick||1).toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const nameIn=h('input',{id:'cal_nm',maxlength:30,placeholder:'Anonymous'});
    body.replaceChildren(
      h('p',{class:'muted'},'Tap any open day this month. Day 1 is $1, day 15 is $15, day 31 is $31. Once a day is bought it is taken off the calendar.'),
      h('p',{class:'small'},open+' of '+dim+' days still open'),
      h('div',{class:'cal'},['S','M','T','W','T','F','S'].map(x=>h('span',{class:'dow'},x)),cells),
      pick?h('div',{class:'card',style:'border-color:var(--volt)'},
        h('div',{class:'row between'},h('b',null,new Date(y,mo,pick).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})),h('span',{class:'price-big',style:'font-size:2rem'},'$'+pick)),
        h('label',{for:'cal_nm'},'Name to show on the day (optional)',nameIn),
        stripe?h('button',{class:'btn stripe',type:'button',html:I.card+' Pay $'+pick+' · Apple Pay Or Card',onclick:async()=>{
            await holdDay(a,mk,pick,{name:nameIn.value.trim(),paid:'Stripe',ref});
            window.open(stripe,'_blank','noopener');
            toast('Day '+pick+' is held for you for 30 minutes while you pay.');await loadCalHolds(true);pick=0;draw()}}):null,
        h('div',{class:'row'},
          p.venmo?h('a',{class:'btn sm',style:'background:#008cff;color:#fff',href:'https://venmo.com/u/'+encodeURIComponent(p.venmo),target:'_blank',rel:'noopener'},'Venmo $'+pick):null,
          p.cashapp?h('a',{class:'btn sm',style:'background:#00b244;color:#fff',href:'https://cash.app/$'+encodeURIComponent(p.cashapp)+'/'+pick,target:'_blank',rel:'noopener'},'Cash App $'+pick):null,
          p.zelle?h('button',{class:'btn sm',type:'button',style:'background:#6d1ed4;color:#fff',onclick:e=>copy(p.zelle,e.currentTarget)},'Zelle '+fmtPhone(p.zelle)):null),
        h('label',null,'Payment note (Venmo, Cash App, Zelle)',h('div',{class:'copyline'},h('code',null,memo),h('button',{class:'btn ghost sm',type:'button',onclick:e=>copy(memo,e.currentTarget)},'Copy'))),
        S.db&&S.uid?h('button',{class:'btn ghost',type:'button',onclick:async()=>{await holdDay(a,mk,pick,{name:nameIn.value.trim(),paid:'Venmo/Cash App/Zelle'});saveRequest({cal:{athlete:a.slug,month:mk,day:pick,amount:pick,name:nameIn.value.trim(),paid:'Venmo/Cash App/Zelle',ts:Date.now()}},'Thank you! Day '+pick+' is held while Future All American confirms your payment.')}},'I Paid With Venmo, Cash App Or Zelle'):
          h('p',{class:'small muted'},'Sign in to hold the day while you pay, or pay by card with Stripe.'),
        h('p',{class:'small muted'},'Donations are received by '+(STATE.org?.nonprofit||'Future All American Academy')+', a 501(c)(3) nonprofit, for '+a.name+'.')):null);
  };
  draw();
}
async function calHoldsReview(){
  const hs=(await loadCalHolds(true)).filter(x=>x.status==='paid'||Date.now()-x.ts<24*3600e3).sort((x,y)=>y.ts-x.ts);
  const box=h('div',{class:'card',style:'border-color:var(--ok)'},h('b',null,'Donation Calendar · Held & Paid Days'),h('p',{class:'small muted'},'Stripe card payments show as HELD until you confirm them in your Stripe dashboard (reference: athlete__month__day__user). Confirming takes the day off the calendar for everyone.'));
  if(!hs.length)box.append(h('p',{class:'small muted'},'No held days right now.'));
  hs.slice(0,30).forEach(x=>{const tgt=S.draft.athletes.find(t=>t.slug===x.athlete);
    const setStatus=async st=>{try{const ref=S.db.doc('caldays/'+x.uid);const cur=await ref.get();const holds=(cur.data()?.holds||[]).map(z=>z.athlete===x.athlete&&z.month===x.month&&+z.day===+x.day?{...z,status:st}:z).filter(z=>z.status!=='released');await ref.set({holds});CAL.at=0}catch(e){toast('Could not save.')}};
    box.append(h('div',{class:'row between'},h('span',{class:'small'},(tgt?.name||x.athlete)+' · '+x.month+'-'+String(x.day).padStart(2,'0')+' · $'+x.day+' · '+(x.paid||'')+(x.name?' · '+x.name:'')+' · '+x.status.toUpperCase()),
      h('div',{class:'row'},x.status!=='paid'?h('button',{class:'btn sm',type:'button',onclick:async e=>{e.currentTarget.disabled=true;await setStatus('paid');if(tgt){tgt.calendar=tgt.calendar||{};tgt.calendar[x.month]=tgt.calendar[x.month]||{};tgt.calendar[x.month][x.day]={name:x.name||'',ts:Date.now()}}e.currentTarget.textContent='Paid · Publish'}},'Confirm Paid'):h('span',{class:'chip ok'},'Paid'),
        x.status!=='paid'?h('button',{class:'btn ghost sm',type:'button',onclick:async e=>{e.currentTarget.disabled=true;await setStatus('released');e.currentTarget.textContent='Released'}},'Release'):null)))});
  return box;
}
function calendarReview(r){
  return h('div',{class:'card',style:'border-color:var(--ok)'},h('b',null,'Donation Calendar Days'),
    ...(r.calendar||[]).slice(-12).reverse().map(c=>{const tgt=S.draft.athletes.find(x=>x.slug===c.athlete);const done=tgt?.calendar?.[c.month]?.[c.day];
      return h('div',{class:'row between'},h('span',{class:'small'},(tgt?.name||c.athlete)+' · '+c.month+'-'+String(c.day).padStart(2,'0')+' · $'+c.amount+' · '+c.paid+(c.name?' · '+c.name:'')),
        tgt?h('button',{class:'btn sm',type:'button',disabled:!!done,onclick:e=>{tgt.calendar=tgt.calendar||{};tgt.calendar[c.month]=tgt.calendar[c.month]||{};tgt.calendar[c.month][c.day]={name:c.name||'',ts:Date.now()};e.currentTarget.disabled=true;e.currentTarget.textContent='Confirmed · Publish'}},done?'Confirmed':'Confirm Payment'):null)}));
}

/* ---------- NFT drops: athletes mint NFTs of themselves, sold in ATHX ---------- */
const CHAINS={ethereum:{name:'Ethereum',sub:'ERC-721 · MetaMask, Trust, Phantom',test:a=>isAddr(a),ph:'0x… Ethereum address'},solana:{name:'Solana',sub:'Metaplex · Phantom, Trust',test:a=>/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a),ph:'Solana address'}};
const uniswapURL=()=>'https://app.uniswap.org/swap?chain=mainnet&outputCurrency='+ATHX.address;
function cdParts(ms){ms=Math.max(0,ms);const d=Math.floor(ms/864e5),hh=Math.floor(ms%864e5/36e5),mm=Math.floor(ms%36e5/6e4),ss=Math.floor(ms%6e4/1e3);return [d,hh,mm,ss]}
let CD_TIMER=null;
function tickCountdowns(){document.querySelectorAll('[data-drop-at]').forEach(el=>{const t=+el.dataset.dropAt-Date.now();const p=cdParts(t);el.querySelectorAll('b').forEach((b,i)=>b.textContent=String(p[i]).padStart(2,'0'));if(t<=0&&!el.dataset.live){el.dataset.live='1';if(document.contains(el))render()}})}
function ensureCountdown(){if(!CD_TIMER)CD_TIMER=setInterval(tickCountdowns,1000)}
function dropState(d){const at=Date.parse(d.dropAt||'');const sold=+d.sold||0,sup=+d.supply||0;if(sup&&sold>=sup)return 'soldout';if(at&&Date.now()<at)return 'presale';return 'live'}
function nftSection(a){
  const drops=(a.drops||[]).filter(d=>d.status==='approved');if(!drops.length)return null;ensureCountdown();
  return h('section',null,h('div',{class:'sec-head'},h('div',null,h('p',{class:'eyebrow'},'NFT Drops · Paid In ATHX'),h('h2',null,first(a.name)+"'s NFTs"))),
    h('div',{class:'dash'},drops.map(d=>dropCard(a,d))));
}
function dropCard(a,d){
  const st=dropState(d);const at=Date.parse(d.dropAt||'');const left=Math.max(0,(+d.supply||0)-(+d.sold||0));const ch=CHAINS[d.chain]||CHAINS.ethereum;
  return h('article',{class:'panel drop-card'},
    h('div',{class:'drop-art'},d.image?h('img',{src:d.image,alt:d.title}):h('span',{style:'font:900 3rem/1 var(--display);color:#ffde59'},initials(a.name)),h('span',{class:'chip chain',style:'background:#000a;color:#fff'},ch.name)),
    h('div',{class:'drop-body'},
      h('span',{class:'athx'},st==='presale'?'Early Access Pre-Order':st==='live'?'Live Now':'Sold Out'),
      h('h3',null,d.title),d.desc?h('p',{class:'muted'},d.desc):null,
      h('div',{class:'row between'},h('span',{class:'price-big',style:'font-size:2rem'},Number(d.price||0).toLocaleString(),h('small',null,' ATHX')),h('span',{class:'small muted'},left+' of '+(d.supply||0)+' left')),
      st==='presale'&&at?h('div',null,h('p',{class:'small muted',style:'margin-bottom:6px'},'Drops '+new Date(at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})),
        h('div',{class:'cd','data-drop-at':String(at)},...['DAYS','HRS','MIN','SEC'].map((l,i)=>h('div',null,h('b',null,String(cdParts(at-Date.now())[i]).padStart(2,'0')),h('small',null,l))))):null,
      st!=='soldout'?h('button',{class:'btn',style:'background:#f5b700;color:#1a1300',onclick:()=>openBuyNft(a,d)},st==='presale'?'Pre-Order Early · Get It At The Drop':'Buy Now'):null,
      h('a',{class:'small',href:uniswapURL(),target:'_blank',rel:'noopener'},'Need ATHX? Swap for ATHX ↗')));
}
function openCreateDrop(a){
  const D={id:rid(),athlete:a.slug,title:a.name+' Rookie Card',desc:'',image:'',chain:'ethereum',price:'1000',supply:'100',dropAt:'',status:'pending'};
  const body=h('form',{class:'dlg-body'});
  const draw=()=>{
    const img=h('img',{src:D.image||'',alt:'',style:'width:120px;height:120px;object-fit:cover;border-radius:12px;background:var(--panel-2)'});img.hidden=!D.image;
    body.replaceChildren(
      h('p',{class:'small muted'},'Upload your NFT artwork, set the price in ATHX, the number of editions and the drop date. Future All American reviews it, mints it and puts it on your page.'),
      h('div',{class:'row'},img,S.assetsUp?h('label',null,'NFT Artwork (image)',h('input',{type:'file',accept:'image/*',onchange:async e=>{const f=e.target.files[0];if(!f)return;try{toast('Uploading artwork…');const up=await S.assetsUp.upload(f);D.image=up.url;draw()}catch(err){toast('Upload failed. Try a smaller image.')}}})):h('p',{class:'small muted'},'Send your artwork to Future All American.')),
      h('label',null,'Title',h('input',{maxlength:60,value:D.title,oninput:e=>D.title=e.target.value,required:true})),
      h('label',null,'Description',h('textarea',{maxlength:240,oninput:e=>D.desc=e.target.value},D.desc)),
      h('b',null,'Blockchain'),
      h('div',{class:'chainpick'},Object.entries(CHAINS).map(([k,c])=>h('button',{type:'button','aria-pressed':D.chain===k?'true':'false',onclick:()=>{D.chain=k;draw()}},c.name,h('small',null,c.sub)))),
      h('div',{class:'g3'},h('label',null,'Price (ATHX)',h('input',{inputmode:'numeric',maxlength:9,value:D.price,oninput:e=>D.price=e.target.value.replace(/[^\d]/g,'')})),
        h('label',null,'Editions',h('input',{inputmode:'numeric',maxlength:5,value:D.supply,oninput:e=>D.supply=e.target.value.replace(/[^\d]/g,'')})),
        h('label',null,'Drop Date & Time',h('input',{type:'datetime-local',value:D.dropAt,oninput:e=>D.dropAt=e.target.value,required:true}))),
      h('p',{class:'small muted'},'Before the drop, fans pre-order and pay in ATHX. Their NFT is sent to them when it drops.'),
      h('button',{class:'btn',type:'submit',style:'background:#f5b700;color:#1a1300'},'Submit Drop For Review'));
  };
  body.onsubmit=e=>{e.preventDefault();if(!D.title.trim()||!(+D.price>0)||!(+D.supply>0)||!D.dropAt){toast('Add a title, price, editions and drop date.');return}
    saveRequest({drop:{...D,dropAt:new Date(D.dropAt).toISOString(),ts:Date.now()}},'Drop sent. Future All American will review and mint it.')};
  draw();openDlg('Create NFT Drop',body);
}
async function openBuyNft(a,d){
  const phone=STATE.org?.phone||'(520) 440-0341';const tre=STATE.org?.treasury||'';const ch=CHAINS[d.chain]||CHAINS.ethereum;const st=dropState(d);
  if(!(S.db&&S.uid)){openDlg('Buy '+d.title,h('div',{class:'dlg-body'},h('p',null,'Sign in to buy NFTs so we know where to send yours.'),h('a',{class:'btn',href:'#signin',onclick:()=>$('dlg').close(),style:'justify-self:start'},'Sign In')));return}
  let qty=1;const body=h('form',{class:'dlg-body'});const msg=h('p',{class:'small muted',role:'status'});
  const recv=h('input',{class:'addr',placeholder:ch.ph,maxlength:44,value:d.chain==='ethereum'?(WAL.account||''):''});
  const draw=()=>{
    const total=BigInt(d.price||0)*BigInt(qty);
    body.replaceChildren(
      h('div',{class:'row'},d.image?h('img',{src:d.image,alt:'',style:'width:72px;height:72px;border-radius:10px;object-fit:cover'}):null,h('span',null,h('b',null,d.title),h('p',{class:'small muted'},ch.name+' NFT · '+(st==='presale'?'Pre-order: sent to you at the drop':'Sent to you after payment')))),
      h('label',null,'Quantity',h('input',{type:'number',min:1,max:5,value:qty,oninput:e=>{qty=Math.max(1,Math.min(5,+e.target.value||1));draw()}})),
      h('div',{class:'wbal'},h('small',null,'TOTAL'),h('b',null,total.toLocaleString()+' ATHX')),
      h('label',null,'Send My NFT To ('+ch.name+' address)',recv),
      d.chain==='solana'?h('button',{class:'btn ghost sm',type:'button',style:'justify-self:start',onclick:async()=>{try{const r=await window.phantom?.solana?.connect();if(r?.publicKey){recv.value=r.publicKey.toString()}else toast('Open this page in the Phantom app to fill your Solana address.')}catch(e){toast('Phantom connection cancelled.')}}},'Use My Phantom Solana Address'):null,
      h('p',{class:'small muted'},'Payment is in ATHX on Ethereum. Connect MetaMask, Trust Wallet or Phantom to pay. Don\'t have ATHX? ',h('a',{href:uniswapURL(),target:'_blank',rel:'noopener'},'Swap ETH for ATHX ↗')),
      WAL.account?h('p',{class:'small'},h('span',{class:'chip ok'},WAL.kind+' connected'),' ',WAL.balance!=null&&WAL.decimals!=null?'Balance: '+fmtUnits(WAL.balance,WAL.decimals)+' ATHX':''):h('div',{class:'wallets'},['metamask','trust','phantom'].map(k=>h('button',{class:'sbtn',type:'button',onclick:async()=>{await connectWallet(k);draw()}},h('span',{class:'ico',style:'background:'+({metamask:'#f6851b',trust:'#0500ff',phantom:'#ab9ff2'})[k]},k[0].toUpperCase()),'Connect '+({metamask:'MetaMask',trust:'Trust Wallet',phantom:'Phantom'})[k]))),
      tre?null:h('p',{class:'note'},'Future All American is setting up ATHX payments. You can reserve now and pay when contacted.'),
      msg,
      h('button',{class:'btn',type:'submit',style:'background:#f5b700;color:#1a1300'},tre?(st==='presale'?'Pay & Pre-Order':'Pay & Buy'):'Reserve'));
  };
  body.onsubmit=async e=>{e.preventDefault();const to=recv.value.trim();
    if(!ch.test(to)){toast('Enter a valid '+ch.name+' address for your NFT.');return}
    const order={athlete:a.slug,drop:d.id,title:d.title,chain:d.chain,qty,price:d.price,receive:to,early:st==='presale',ts:Date.now(),tx:''};
    if(tre&&isAddr(tre)){
      if(!WAL.account){toast('Connect a wallet to pay in ATHX.');return}
      try{const dec=WAL.decimals??18;const units=BigInt(d.price||0)*BigInt(qty)*10n**BigInt(dec);
        if(WAL.balance!=null&&units>WAL.balance){msg.textContent='Not enough ATHX. Swap for ATHX first.';return}
        msg.textContent='Confirm the payment in '+WAL.kind+'…';
        order.tx=await WAL.prov.request({method:'eth_sendTransaction',params:[{from:WAL.account,to:ATHX.address,data:'0xa9059cbb'+pad32(tre)+pad32(units.toString(16))}]});
        order.payer=WAL.account}
      catch(err){msg.textContent=err?.code===4001?'Payment cancelled.':(err?.message||'Payment failed.');return}}
    saveRequest({nft:order},order.tx?(order.early?'Pre-order paid. Your NFT is sent at the drop.':'Paid. Your NFT is on the way.'):'Reserved. Future All American will contact you to pay in ATHX.');
    setTimeout(refreshBalance,8000)};
  draw();openDlg('Buy '+d.title,body);
}
function dropsReview(r){
  return h('div',{class:'card',style:'border-color:#f5b700'},h('b',null,'NFT Drop Submissions'),
    ...(r.drops||[]).map(d=>{const tgt=S.draft.athletes.find(x=>x.slug===d.athlete);const have=tgt?.drops?.find(x=>x.id===d.id);
      return h('div',{class:'row between'},h('span',{class:'small'},(d.image?'🖼 ':'')+d.title+' · '+(CHAINS[d.chain]?.name||d.chain)+' · '+Number(d.price).toLocaleString()+' ATHX × '+d.supply+' · drops '+new Date(d.dropAt).toLocaleString()),
        tgt?h('button',{class:'btn sm',type:'button',disabled:!!have,onclick:e=>{tgt.drops=tgt.drops||[];tgt.drops.push({...d,status:'approved',sold:0});e.currentTarget.disabled=true;e.currentTarget.textContent='Approved · Publish'}},have?'On Page':'Approve & List'):null)}));
}
function nftOrdersReview(r){
  const save=async()=>{try{await S.db.doc('requests/'+r.id).update({nftOrders:r.nftOrders})}catch(e){toast('Could not save.')}};
  return h('div',{class:'card',style:'border-color:#f5b700'},h('b',null,'NFT Orders · '+r.nftOrders.length),
    ...r.nftOrders.slice(-15).reverse().map(o=>h('div',{style:'display:grid;gap:4px;padding:8px 0;border-top:1px solid var(--line)'},
      h('span',{class:'small'},o.title+' × '+o.qty+' · '+(CHAINS[o.chain]?.name||o.chain)+(o.early?' · EARLY':'')+' · '+(BigInt(o.price||0)*BigInt(o.qty||1)).toLocaleString()+' ATHX'),
      h('span',{class:'addr small'},'Send to: '+o.receive),
      o.tx?h('a',{class:'txlink',href:'https://etherscan.io/tx/'+o.tx,target:'_blank',rel:'noopener'},'Payment ↗ '+o.tx.slice(0,14)+'…'):h('span',{class:'small',style:'color:#f0b537'},'Not paid yet (reserved)'),
      h('div',{class:'row'},h('input',{placeholder:'Mint / transfer tx',value:o.mintTx||'',style:'max-width:220px',oninput:e=>{o.mintTx=e.target.value.trim()}}),
        h('button',{class:'btn sm',type:'button',disabled:!!o.sent,onclick:async e=>{o.sent=true;e.currentTarget.disabled=true;e.currentTarget.textContent='Sent';
          const tgt=S.draft.athletes.find(x=>x.slug===o.athlete);const dd=tgt?.drops?.find(x=>x.id===o.drop);if(dd)dd.sold=(+dd.sold||0)+(+o.qty||1);await save()}},o.sent?'NFT Sent':'Mark NFT Sent')))));
}

/* ---------- app dock, sponsor strip, 7v7 team, future classes ---------- */
function teamBadge(a){
  const t=a.team7v7||{};const hd=cleanHandle(t.handle||'');if(!hd&&!t.name)return null;
  const inner=[h('span',{class:'tl'},t.logo?h('img',{src:t.logo,alt:''}):initials(t.name||hd)),h('span',null,h('small',null,'7v7 Team'),h('b',null,t.name||'@'+hd),hd&&t.name?h('small',{style:'text-transform:none'},'@'+hd):null)];
  return hd?h('a',{class:'team7',href:'https://instagram.com/'+hd,target:'_blank',rel:'noopener'},inner):h('span',{class:'team7'},inner);
}
function sponsorStrip(a){
  const g=STATE.globalSponsors||[];const own=a&&isUnlocked(a)?activeSponsors(a):[];const free=a&&isUnlocked(a)?openSpots(a):[];
  const chip=(x,hid)=>{const u=safeUrl(x.url);const inner=[h('span',{class:'sl'},x.logo?h('img',{src:x.logo,alt:''}):initials(x.name)),x.name,x.spot?h('span',{class:'spot-n'},'#'+x.spot):null];return u?h('a',{class:'schip',href:u,target:'_blank',rel:'noopener sponsored',tabindex:hid?'-1':null,'aria-hidden':hid?'true':null},inner):h('span',{class:'schip','aria-hidden':hid?'true':null},inner)};
  const open=(n,hid)=>h('button',{class:'schip open',type:'button',tabindex:hid?'-1':null,'aria-hidden':hid?'true':null,onclick:()=>a?openSponsorInquiry(a,n):pickAthleteToSponsor()},h('span',{class:'sl',style:'background:none;border:1px dashed var(--line);color:var(--muted)'},'+'),a?'Spot '+n+' Open':'Sponsor An Athlete',h('small',null,'$'+(STATE.pay?.sponsorPrice||'10')+'/mo'));
  const set=hid=>[...g.map(x=>chip(x,hid)),...own.map(x=>chip(x,hid)),...(a?free.map(n=>open(n,hid)):[open(0,hid)])];
  const count=g.length+own.length+(a?free.length:1);const reps=Math.max(2,Math.ceil(8/Math.max(1,count)));const items=[];for(let i=0;i<reps*2;i++)items.push(...set(i>0));
  return h('div',{class:'sstrip','aria-label':a?first(a.name)+"'s sponsors":'Sponsors'},h('div',{class:'wrap',style:'padding:0'},h('div',{class:'sstrip-track',style:'--dur:'+Math.max(20,count*reps*4)+'s'},items)));
}
const spotCount=()=>Math.max(1,parseInt(STATE.org?.sponsorSpots||'6',10)||6);
function activeSponsors(a){const today=new Date().toISOString().slice(0,10);return (a?.sponsors||[]).filter(x=>x.name&&(!x.until||x.until>=today))}
function openSpots(a){const used=new Set(activeSponsors(a).map((x,i)=>+x.spot||i+1));const out=[];for(let n=1;n<=spotCount();n++)if(!used.has(n))out.push(n);return out}
function pickAthleteToSponsor(){
  const list=athletes().filter(isUnlocked);
  openDlg('Sponsor An Athlete',h('div',{class:'dlg-body'},h('p',{class:'muted'},'Every athlete has their own sponsor spots at $'+(STATE.pay?.sponsorPrice||'10')+' a month each. Pick an athlete:'),
    h('div',{class:'plist',style:'margin-top:0'},list.map(a=>h('button',{class:'sbtn',type:'button',onclick:()=>{$('dlg').close();location.hash=a.slug;setTimeout(()=>openSponsorInquiry(a),350)}},h('span',{class:'ico',style:'background:var(--red)'},initials(a.name)),h('span',null,a.name,h('small',null,openSpots(a).length+' of '+spotCount()+' spots open')))))));
}
let DOCK_OPEN=false;
function dock(a,onSearch,onHome,cur){
  const lead=athletes()[0];const pg=(a||lead);
  const items=[
    ['#home',I.home,'Home',onHome],
    ['#'+(pg?.slug||''),I.user,pg?first(pg.name):'Athlete',!(onSearch||onHome||cur)],
    ['#prospects',I.search,'Prospects',onSearch],
    ['#connect',I.qr,'Connect',cur==='connect'],
    ['#passport',I.band,'Passport',cur==='passport'],
    ['#wallet',I.wallet,'Wallet',cur==='wallet'],
    ['#share',I.share,'Share & Earn',cur==='share'],
    (S.isOwner||isMember())?['#chat',I.chat,'Chat',cur==='chat']:null].filter(Boolean);
  const el=h('nav',{class:'dock'+(DOCK_OPEN?' open':''),'aria-label':'App menu'},
    h('button',{class:'dock-btn',type:'button','aria-label':'Menu','aria-expanded':DOCK_OPEN?'true':'false',html:I.grid,onclick:e=>{DOCK_OPEN=!DOCK_OPEN;el.classList.toggle('open',DOCK_OPEN);e.currentTarget.setAttribute('aria-expanded',DOCK_OPEN?'true':'false')}}),
    h('div',{class:'dock-items'},items.map(([href,icon,label,on])=>h('a',{class:'ditem',href,'aria-current':on?'page':null,onclick:()=>{DOCK_OPEN=false}},h('span',{html:icon,style:'display:grid'}),label))));
  const old=document.querySelector('body > .dock');if(old)old.remove();document.body.append(el);
  return null;
}
function futureClass(y){
  const ours=athletes().filter(x=>x.cls===y);
  return h('div',{class:'dash',style:'margin-top:14px'},
    h('div',{class:'panel',style:'padding:18px;display:grid;gap:8px'},h('p',{class:'eyebrow'},'Class Of '+y),h('h3',{style:'font-size:1.5rem'},'Rankings Coming Soon'),
      h('p',{class:'muted'},'Rivals has not released '+y+' football rankings yet. Future All American athletes in the '+y+' class are listed here.')),
    ours.length?h('div',{class:'plist',style:'margin-top:0'},ours.map(prow)):h('p',{class:'muted'},'No Future All American athletes in the '+y+' class yet.'),
    h('a',{class:'btn',href:'#signin',style:'justify-self:start'},'Join The Class Of '+y));
}

/* ---------- Share & Earn: Instagram marketing posts for AthleteCoin ---------- */
const dayKey=(d=new Date())=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};
function weekStart(d=new Date()){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function myToks(){const out=[];const a=athletes().find(x=>x.uid&&x.uid===S.uid);if(a)out.push(a.slug);const c=S.myReq?.claim;if(c?.tok)out.push(c.tok);return [...new Set(out)]}
function loadImg(src){return new Promise(r=>{if(!src)return r(null);const i=new Image();i.crossOrigin='anonymous';i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function drawPost(p){
  const W=1080,c=document.createElement('canvas');c.width=W;c.height=W;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,W,W);g.addColorStop(0,'#08101c');g.addColorStop(1,'#2a0a12');x.fillStyle=g;x.fillRect(0,0,W,W);
  x.fillStyle='#ef3b45';x.fillRect(0,0,W,14);x.fillRect(0,W-14,W,14);
  const img=await loadImg(p.photo);
  x.save();x.beginPath();x.arc(270,330,190,0,Math.PI*2);x.closePath();x.fillStyle='#16243a';x.fill();x.clip();
  if(img){const s=Math.max(380/img.width,380/img.height);x.drawImage(img,270-img.width*s/2,330-img.height*s/2.6,img.width*s,img.height*s)}
  else{x.fillStyle='#ffffff55';x.font='900 150px Impact,Arial Narrow,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(initials(p.name),270,335)}
  x.restore();x.lineWidth=10;x.strokeStyle='#ef3b45';x.beginPath();x.arc(270,330,195,0,Math.PI*2);x.stroke();
  if(isVerified(p.tok)||p.ours){x.fillStyle='#1d9bf0';x.beginPath();x.arc(410,470,36,0,Math.PI*2);x.fill();x.strokeStyle='#fff';x.lineWidth=9;x.beginPath();x.moveTo(392,470);x.lineTo(405,484);x.lineTo(430,456);x.stroke()}
  x.textAlign='left';x.textBaseline='alphabetic';
  x.fillStyle='#ef3b45';x.font='700 30px monospace';x.fillText('FUTURE ALL AMERICAN',510,200);
  x.fillStyle='#fff';x.font='italic 900 92px Impact,Arial Narrow,sans-serif';
  const parts=p.name.toUpperCase().split(' ');x.fillText(parts[0],505,300);x.fillStyle='#ef3b45';x.fillText(parts.slice(1).join(' ').slice(0,14),505,395);
  x.fillStyle='#c9d3e1';x.font='600 34px Arial,sans-serif';const sub=(p.sub||'').split(' · ');x.fillText(sub.slice(0,3).join(' · ').slice(0,30),510,460);if(sub.length>3)x.fillText(sub.slice(3).join(' · ').slice(0,30),510,505);
  // QR
  const q=QRLib.make(linkFor(p.tok),'M');const n=q.getModuleCount();const size=300,cell=Math.floor(size/(n+4)),qx=W-80-cell*(n+4),qy=W-110-cell*(n+4);
  x.fillStyle='#fff';x.fillRect(qx,qy,cell*(n+4),cell*(n+4));x.fillStyle='#08101c';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))x.fillRect(qx+(k+2)*cell,qy+(r+2)*cell,cell,cell);
  x.fillStyle='#fff';x.font='700 26px monospace';x.textAlign='center';x.fillText('SCAN MY PROFILE',qx+cell*(n+4)/2,qy-18);
  x.textAlign='left';
  x.fillStyle='#f5b700';x.beginPath();x.roundRect?x.roundRect(80,700,560,96,48):x.rect(80,700,560,96);x.fill();
  x.fillStyle='#1a1300';x.font='900 46px Impact,Arial Narrow,sans-serif';x.fillText('POWERED BY $ATHX',120,765);
  x.fillStyle='#ffffffcc';x.font='600 34px Arial,sans-serif';x.fillText('AthleteCoin · FAA Recruit',80,880);
  x.fillStyle='#ffffff88';x.font='500 26px Arial,sans-serif';x.fillText('#AthleteCoin #FutureAllAmerican #NIL',80,935);
  return c;
}
function captionFor(p){
  const tag=cleanHandle(STATE.org?.athxInstagram||'');
  return p.name+' | '+(p.sub||'')+'\n\nCheck out my Future All American recruiting profile: ratings, offers, highlights and more.\n\n🔗 '+linkFor(p.tok)+' (link in bio)\n\nPowered by '+(tag?'@'+tag+' ':'')+'AthleteCoin $ATHX\n#AthleteCoin #ATHX #FutureAllAmerican #NIL #Recruiting #Football';
}
function sharePage(tok){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  const reward=Number(STATE.org?.postReward||100).toLocaleString();
  sec.append(h('div',{class:'home-hero',style:'padding-block:10px 0'},h('p',{class:'eyebrow'},'AthleteCoin Marketing'),h('h1',null,'Share',h('span',null,'& Earn')),
    h('p',{class:'lede'},'Post your profile on Instagram for AthleteCoin. Earn '+reward+' ATHX per post, once a day. Post at least once a week to stay active.')));
  if(!(S.db&&S.uid)){sec.append(h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px'},h('p',null,'Sign in and claim your profile to earn ATHX for your posts.'),h('a',{class:'btn',href:'#signin',style:'justify-self:start'},'Sign In')));}
  const body=h('div',{class:'dash'});sec.append(body);
  (async()=>{
    if(S.db&&S.uid)await loadMyReq();
    const mine=myToks();if(!tok)tok=mine[0]||'';
    const p=tok?who(tok):null;
    if(!p){body.replaceChildren(h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px'},h('p',null,'Pick your profile first. Open your profile, tap Connect · QR & NFC, then Post On Instagram. To earn ATHX, claim your profile.'),h('a',{class:'btn ghost',href:'#prospects',style:'justify-self:start'},'Find My Profile')));return}
    const eligible=mine.includes(tok);
    const posts=(S.myReq?.posts||[]);const today=dayKey();const postedToday=posts.some(x=>x.date===today);
    const ws=weekStart();const days=[...Array(7)].map((_,i)=>{const d=new Date(ws);d.setDate(d.getDate()+i);return d});
    const weekCount=posts.filter(x=>x.date>=dayKey(ws)).length;
    const imgEl=h('img',{class:'postimg',alt:'Instagram post for '+p.name});
    const cap=captionFor(p);
    drawPost(p).then(c=>{try{imgEl.src=c.toDataURL('image/jpeg',.9);imgEl._canvas=c}catch(e){}});
    const shareImg=async()=>{const c=imgEl._canvas;if(!c){toast('Image is still loading.');return}
      try{await copy(cap)}catch(e){}
      const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));const file=new File([blob],'faa-'+tok+'.jpg',{type:'image/jpeg'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:cap});return}catch(e){if(e?.name==='AbortError')return}}
      toast('Caption copied. Press and hold the image to save it, then post it in Instagram.')};
    const urlIn=h('input',{id:'po_url',type:'url',placeholder:'https://www.instagram.com/p/…',maxlength:300});
    const submit=()=>{const u=safeUrl(urlIn.value.trim());
      if(!u||!/^https:\/\/(www\.)?instagram\.com\//i.test(u)){toast('Paste the link to your Instagram post.');return}
      if(posts.some(x=>x.url===u)){toast('That post was already submitted.');return}
      if(postedToday){toast('You already earned today. Come back tomorrow.');return}
      saveRequest({post:{date:today,url:u,tok,ts:Date.now(),reward:eligible?Number(STATE.org?.postReward||100):0}},eligible?'Post submitted. '+reward+' ATHX is sent after Future All American checks it.':'Post submitted. Claim your profile to earn ATHX for posts.');
      setTimeout(()=>{if(S.slug.startsWith('share'))render()},900)};
    body.replaceChildren(
      h('div',{class:'panel',style:'padding:18px;display:grid;gap:12px;border-color:#d62976'},
        h('p',{class:'eyebrow'},'Step 1 · Your Post'),imgEl,
        h('div',{class:'row',style:'justify-content:center'},h('button',{class:'btn',style:'background:linear-gradient(45deg,#fa7e1e,#d62976,#962fbf);color:#fff',onclick:shareImg},'Share To Instagram'),
          h('button',{class:'btn ghost',onclick:()=>savePostImage(imgEl,p,tok)},'Save Photo'),h('a',{class:'btn ghost',href:'https://www.instagram.com/',target:'_blank',rel:'noopener'},'Open Instagram ↗')),
        h('p',{class:'small muted',style:'text-align:center'},'Save Photo puts the image in your photos or downloads so you can post it from Instagram. On a phone you can also press and hold the image to save it.')),
      h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px'},h('p',{class:'eyebrow'},'Step 2 · Caption & Link'),
        h('div',{class:'caption'},cap),
        h('div',{class:'row'},h('button',{class:'btn',onclick:e=>copy(cap,e.currentTarget)},'Copy Caption'),h('button',{class:'btn ghost',onclick:e=>copy(linkFor(tok),e.currentTarget)},'Copy Profile Link')),
        h('p',{class:'linkline'},linkFor(tok)),
        h('p',{class:'small muted'},'Instagram captions do not make links clickable, so add your profile link to your bio or a story link sticker too.')),
      h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px;border-color:#f5b700'},h('p',{class:'eyebrow'},'Step 3 · Claim '+reward+' ATHX'),
        eligible?null:h('p',{class:'note'},'This is not your claimed profile, so this post will not earn ATHX. Claim your profile to earn.'),
        h('label',{for:'po_url'},'Paste Your Instagram Post Link',urlIn),
        h('button',{class:'btn',style:'justify-self:start;background:#f5b700;color:#1a1300',disabled:!(S.db&&S.uid)||postedToday,onclick:submit},postedToday?'Earned Today · Come Back Tomorrow':'Submit Post For '+reward+' ATHX'),
        h('p',{class:'small muted'},'One reward a day. Future All American checks each post, then sends ATHX to your connected wallet. Keep the post up for at least 7 days.'),
        h('a',{class:'btn ghost sm',href:'#wallet',style:'justify-self:start'},'Connect Wallet')),
      h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px'},
        h('div',{class:'row between'},h('p',{class:'eyebrow'},'This Week'),h('span',{class:'chip '+(weekCount?'ok':'')},weekCount?'Weekly Post Done':'1 Post Due This Week')),
        h('div',{class:'week'},days.map(d=>{const k=dayKey(d);const done=posts.some(x=>x.date===k);return h('div',{class:(done?'done ':'')+(k===today?'today':'')},['M','T','W','T','F','S','S'][(d.getDay()+6)%7],done?'✓':'·')})),
        h('p',{class:'small muted'},posts.length+' total post'+(posts.length===1?'':'s')+' · '+(posts.filter(x=>x.paid).reduce((t,x)=>t+(x.reward||0),0)).toLocaleString()+' ATHX sent')));
  })();
  return w;
}

async function savePostImage(imgEl,p,tok){
  const c=imgEl._canvas;if(!c){toast('Image is still loading.');return}
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));const name='faa-'+slugify(p.name)+'-instagram.jpg';
  const dl=await claude.use('downloads').catch(()=>null);
  if(dl){try{await dl.save({filename:name,data:blob});toast('Photo saved. Post it from Instagram.');return}catch(e){if(e?.code==='declined')return}}
  try{const u=URL.createObjectURL(blob);const a=h('a',{href:u,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast('Saving photo… If nothing downloads, press and hold the image to save it.')}
  catch(e){toast('Press and hold the image to save it.')}
}
function postsReview(r){
  const posts=r.posts||[];const owed=posts.filter(x=>!x.paid&&x.reward).reduce((t,x)=>t+x.reward,0);
  const save=async()=>{try{await S.db.doc('requests/'+r.id).update({posts})}catch(e){toast('Could not save.')}};
  return h('div',{class:'card',style:'border-color:#d62976'},
    h('div',{class:'row between'},h('b',null,'Instagram Posts · '+posts.length),owed?h('span',{class:'athx'},owed.toLocaleString()+' ATHX Owed'):null),
    ...posts.slice(-10).reverse().map(x=>h('div',{class:'row between'},h('span',{class:'small'},x.date+' · ',h('a',{href:x.url,target:'_blank',rel:'noopener'},'View Post ↗'),' · '+(x.reward?x.reward+' ATHX':'No reward (not claimed)')),
      x.reward?h('button',{class:'btn sm',type:'button',disabled:!!x.paid,onclick:async e=>{x.paid=true;e.currentTarget.disabled=true;e.currentTarget.textContent='Marked Sent';await save()}},x.paid?'Sent':'Mark Sent'):null)),
    owed&&r.wallet?.address?h('button',{class:'btn sm',type:'button',style:'background:#f5b700;color:#1a1300;justify-self:start',onclick:()=>{$('dlg').close();location.hash='wallet';setTimeout(()=>openSend(r.wallet.address,String(owed)),300)}},'Send '+owed.toLocaleString()+' ATHX'):null);
}

/* ---------- unlock rules, brand picker ---------- */
function isUnlocked(a){return !!a&&(a.unlocked===true||a.membership?.status==='Active')}
function lockedCard(a){
  return h('section',null,h('div',{class:'panel lockcard'},
    h('p',{class:'eyebrow'},'Locked'),h('h3',null,'Donations, Sponsors & Gear'),
    h('p',{class:'muted'},first(a.name)+"'s page unlocks donations, paid sponsor spots and a gear carousel from Nike, adidas, Under Armour and Puma once the profile is claimed or the membership is active."),
    h('div',{class:'row'},h('a',{class:'btn',href:'#me'},'Activate Membership'),h('a',{class:'btn ghost',href:'#signin'},'Sign In'))));
}
function officialLink(tok){
  const a=athletes().find(x=>x.claimTok===tok);
  return a?h('a',{class:'panel',href:'#'+a.slug,style:'padding:16px;display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:var(--fg);border-color:#1d9bf0'},h('span',null,h('p',{class:'eyebrow',style:'color:#1d9bf0'},'Claimed'),h('b',{style:'font:900 1.4rem/1 var(--display);text-transform:uppercase'},'Donate, Sponsor & Gear Up '+first(a.name))),h('span',{html:I.right,style:'display:grid'})):null;
}
const BRANDS=[
  {k:'nike',name:'Nike',bg:'#111',q:'https://www.nike.com/w?q='},
  {k:'adidas',name:'adidas',bg:'#1d1d1b',q:'https://www.adidas.com/us/search?q='},
  {k:'ua',name:'Under Armour',bg:'#1d1d1d;border-color:#c8102e',q:'https://www.underarmour.com/en-us/search/?q='},
  {k:'puma',name:'Puma',bg:'#ba2025',q:'https://us.puma.com/us/en/search?q='}];
function openBrandPicker(a){
  const phone=STATE.org?.phone||'(520) 440-0341';
  if(!(S.db&&S.uid)){openDlg('Pick Gear For '+first(a.name),h('div',{class:'dlg-body'},h('p',null,'Sign in to pick Nike, adidas, Under Armour or Puma products for this carousel.'),h('a',{class:'btn',href:'#signin',onclick:()=>$('dlg').close(),style:'justify-self:start'},'Sign In'),h('p',{class:'small muted'},'Or text ',h('b',null,phone),' with the product links.')));return}
  let brand=BRANDS[0];const cats=['American football gloves','American football cleats','Football training shoes','Football compression','Hoodies','Bags'];
  const body=h('div',{class:'dlg-body'});
  const draw=()=>{
    const f=h('form',{class:'card'},
      h('b',null,'2. Paste The '+brand.name+' Product'),
      h('label',{for:'bp_link'},'Product Link',h('input',{id:'bp_link',type:'url',required:true,placeholder:'https://',maxlength:400})),
      h('label',{for:'bp_name'},'Product Name',h('input',{id:'bp_name',required:true,maxlength:80,placeholder:brand.name+' American football receiver gloves'})),
      h('div',{class:'g3'},h('label',{for:'bp_size'},'Size',h('input',{id:'bp_size',maxlength:20})),h('label',{for:'bp_color'},'Color',h('input',{id:'bp_color',maxlength:30})),h('label',{for:'bp_price'},'Price ($)',h('input',{id:'bp_price',inputmode:'decimal',maxlength:8}))),
      h('button',{class:'btn',type:'submit'},'Add To '+first(a.name)+"'s Carousel"));
    f.onsubmit=e=>{e.preventDefault();const v=id=>f.querySelector('#'+id).value.trim();const link=safeUrl(v('bp_link'));if(!link){toast('Use the full https:// product link.');return}
      saveRequest({athlete:a.slug,item:{id:rid(),brand:brand.name,name:v('bp_name'),link,size:v('bp_size'),color:v('bp_color'),price:v('bp_price').replace(/^\$/,'')}},'Sent. It shows in the carousel after Future All American reviews it.')};
    body.replaceChildren(
      h('p',{class:'small muted'},'Choose a brand, find the product on their site, then paste the link here. Future All American reviews each pick before it goes in the carousel.'),
      h('b',null,'1. Choose A Brand'),
      h('div',{class:'brands'},BRANDS.map(b=>h('button',{type:'button',class:'brandtile',style:'background:'+b.bg,'aria-pressed':b===brand?'true':'false',onclick:()=>{brand=b;draw()}},h('b',null,b.name),h('small',null,b===brand?'Selected':'Tap to choose')))),
      h('div',{class:'qcats'},cats.map(c=>h('a',{class:'btn ghost sm',href:affLink(brand.q+encodeURIComponent(c)),target:'_blank',rel:'noopener'},'Shop '+brand.name+' '+c+' ↗'))),
      f);
  };
  draw();openDlg('Pick Gear For '+first(a.name),body);
}

/* ---------- AthleteX Passport (standalone wristband) ---------- */
function passportCard(){
  const p=STATE.pay||{};const price=String(p.passportPrice||'').replace(/^\$/,'');const phone=STATE.org?.phone||'(520) 440-0341';
  return h('div',{class:'panel member-card',style:'border-color:var(--red)'},
    STATE.org?.bandPhoto?h('img',{class:'band',src:STATE.org.bandPhoto,alt:'AthleteX Passport NFC wristband'}):null,
    h('div',{class:'row between'},h('div',null,h('p',{class:'eyebrow'},'Sold Separately'),h('h3',{style:'font-size:2rem'},'AthleteX Passport')),
      h('p',{class:'price-big'},price?'$'+price:'',price?null:h('small',null,'Price Coming Soon'))),
    h('p',{class:'muted'},'An NFC wristband connected to your athlete page. Tap it to any phone and your page opens, with your ratings, offers, highlights and connect code.'),
    h('ul',{class:'perks'},h('li',null,'Programmed with your athlete page link'),h('li',null,'Works with Apple and Android phones, no app needed'),h('li',null,'Adjustable strap')),
    h('button',{class:'btn',style:'justify-self:start',onclick:()=>openPassport()},price?'Order AthleteX Passport':'Reserve AthleteX Passport'),
    h('p',{class:'small muted'},'Questions? Call or text ',h('b',null,phone),'.'));
}
async function openPassport(){
  const p=STATE.pay||{};const price=String(p.passportPrice||'').replace(/^\$/,'');const phone=STATE.org?.phone||'(520) 440-0341';
  const W=STATE.watch||{};
  const opts=[...athletes().map(a=>[a.slug,a.name]),...Object.keys(W.classes||{}).sort().flatMap(y=>W.classes[y].rows.map(r=>['w'+y+'-'+r[0],r[1]+' · '+y])),...((W.flag||{}).rows||[]).map(r=>['g-'+r[0],r[1]+' · Flag'])];
  if(!S.db||!S.uid){openDlg('AthleteX Passport',h('div',{class:'dlg-body'},h('p',null,'Sign in to order, or text Future All American at ',h('b',null,phone),' with the athlete name and wristband size.'),h('a',{class:'btn',href:'#signin',onclick:()=>$('dlg').close(),style:'justify-self:start'},'Sign In')));return}
  const f=h('form',{class:'dlg-body'},
    h('label',{for:'pp_tok'},'Connect To This Athlete Page',h('select',{id:'pp_tok'},opts.map(([v,t])=>h('option',{value:v,selected:current()?.slug===v||S.slug===v},t)))),
    h('div',{class:'g2'},h('label',{for:'pp_size'},'Wristband Size',h('select',{id:'pp_size'},['Youth','Adult S/M','Adult L/XL'].map(o=>h('option',null,o)))),
      h('label',{for:'pp_ct'},'Phone Or Email',h('input',{id:'pp_ct',required:true,maxlength:80}))),
    price?h('div',{class:'row'},
      p.venmo?h('a',{class:'btn sm',style:'background:#008cff;color:#fff',href:'https://venmo.com/u/'+encodeURIComponent(p.venmo),target:'_blank',rel:'noopener'},'Venmo $'+price):null,
      p.cashapp?h('a',{class:'btn sm',style:'background:#00b244;color:#fff',href:'https://cash.app/$'+encodeURIComponent(p.cashapp)+'/'+price,target:'_blank',rel:'noopener'},'Cash App $'+price):null,
      p.zelle?h('button',{class:'btn sm',type:'button',style:'background:#6d1ed4;color:#fff',onclick:e=>copy(p.zelle,e.currentTarget)},'Zelle '+fmtPhone(p.zelle)):null):h('p',{class:'note'},'Reserve now. Future All American will contact you with the price before anything is charged.'),
    price?h('label',null,'Payment Sent With',h('select',{id:'pp_paid'},['','Venmo','Cash App','Zelle','Paying later'].map(o=>h('option',{value:o},o||'Choose one')))):null,
    h('p',{class:'small muted'},'Put "AthleteX Passport – athlete name" in the payment note. Future All American programs the wristband with the athlete page and ships it.'),
    h('button',{class:'btn',type:'submit'},price?'Place Order':'Reserve'));
  f.onsubmit=e=>{e.preventDefault();const v=id=>f.querySelector('#'+id)?.value.trim()||'';const tok=v('pp_tok');const who_=who(tok);
    saveRequest({passport:{tok,name:who_?.name||tok,size:v('pp_size'),contact:v('pp_ct'),paid:v('pp_paid'),price,ts:Date.now()}},'AthleteX Passport order sent.')};
  openDlg('Order AthleteX Passport',f);
}

/* ---------- ATHX wallet: MetaMask, Trust Wallet, Phantom (Ethereum) ---------- */
const ATHX={address:'0x6965D89A308562a29Fa73941994C2fAD149671cb',symbol:'ATHX',chainId:'0x1'};
const WAL={providers:{},prov:null,kind:'',account:'',decimals:null,balance:null,tx:''};
window.addEventListener('eip6963:announceProvider',e=>{const d=e.detail||{};const r=(d.info?.rdns||'').toLowerCase();const k=r.includes('metamask')?'metamask':r.includes('trust')?'trust':r.includes('phantom')?'phantom':'';if(k&&d.provider)WAL.providers[k]=d.provider});
try{window.dispatchEvent(new Event('eip6963:requestProvider'))}catch(e){}
function findProvider(k){
  if(WAL.providers[k])return WAL.providers[k];
  const eth=window.ethereum;const list=eth?.providers||(eth?[eth]:[]);
  if(k==='phantom')return window.phantom?.ethereum||list.find(p=>p.isPhantom)||null;
  if(k==='trust')return window.trustwallet?.ethereum||window.trustwallet||list.find(p=>p.isTrust||p.isTrustWallet)||null;
  if(k==='metamask')return list.find(p=>p.isMetaMask&&!p.isPhantom&&!p.isTrust&&!p.isTrustWallet)||null;
  return null;
}
const pad32=hx=>hx.replace(/^0x/,'').toLowerCase().padStart(64,'0');
const isAddr=a=>/^0x[0-9a-fA-F]{40}$/.test(a||'');
function fmtUnits(v,dec){const b=BigInt(v);const base=10n**BigInt(dec);const whole=b/base;let frac=(b%base).toString().padStart(dec,'0').slice(0,4).replace(/0+$/,'');return whole.toLocaleString('en-US')+(frac?'.'+frac:'')}
function toUnits(str,dec){str=String(str).trim().replace(/,/g,'');if(!/^\d+(\.\d+)?$/.test(str))throw new Error('Enter a valid amount.');const [w,f='']=str.split('.');if(f.length>dec)throw new Error('Too many decimal places.');return BigInt(w)*10n**BigInt(dec)+BigInt((f+'0'.repeat(dec)).slice(0,dec)||'0')}
async function ethCall(data){return WAL.prov.request({method:'eth_call',params:[{to:ATHX.address,data},'latest']})}
async function refreshBalance(){
  if(!WAL.prov||!WAL.account)return;
  try{if(WAL.decimals==null){const d=await ethCall('0x313ce567');WAL.decimals=Number(BigInt(d||'0x12'))}
    const b=await ethCall('0x70a08231'+pad32(WAL.account));WAL.balance=BigInt(b&&b!=='0x'?b:'0x0')}
  catch(e){WAL.balance=null;toast('Could not read the ATHX balance.')}
  if(S.slug==='wallet')render();
}
async function connectWallet(k){
  const p=findProvider(k);const names={metamask:'MetaMask',trust:'Trust Wallet',phantom:'Phantom'};
  if(!p){openDeepLink(k,names[k]);return}
  try{const acc=await p.request({method:'eth_requestAccounts'});WAL.prov=p;WAL.kind=names[k];WAL.account=acc[0]||'';WAL.tried=true;
    const cid=await p.request({method:'eth_chainId'});
    if(cid!==ATHX.chainId){try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:ATHX.chainId}]})}catch(e){toast('Switch your wallet to Ethereum Mainnet to see ATHX.')}}
    p.on?.('accountsChanged',a=>{WAL.account=a[0]||'';WAL.balance=null;refreshBalance()});
    p.on?.('chainChanged',()=>{WAL.balance=null;refreshBalance()});
    if(S.db&&S.uid&&WAL.account)saveRequest({wallet:{address:WAL.account,kind:WAL.kind,ts:Date.now()}},names[k]+' connected.',$('dlg').open);
    await refreshBalance();
  }catch(e){toast(e?.code===4001?'Connection cancelled.':'Could not connect '+names[k]+'.')}
}
function openDeepLink(k,name){
  const url=siteBase()+'#wallet';const bare=url.replace(/^https?:\/\//,'');
  const links={metamask:'https://metamask.app.link/dapp/'+bare,trust:'https://link.trustwallet.com/open_url?coin_id=60&url='+encodeURIComponent(url),phantom:'https://phantom.app/ul/browse/'+encodeURIComponent(url)+'?ref='+encodeURIComponent(url)};
  openDlg('Open In '+name,h('div',{class:'dlg-body'},
    h('p',null,name+' was not found in this browser. On your phone, open this page inside the '+name+' app to connect.'),
    h('a',{class:'btn',href:links[k],target:'_blank',rel:'noopener',style:'justify-self:start'},'Open In '+name+' App'),
    h('p',{class:'small muted'},'On a computer, install the '+name+' browser extension, then reload this page. You can also paste your wallet address below to receive your ATHX reward.'),
    manualWallet()));
}
function manualWallet(){
  const i=h('input',{placeholder:'0x… Ethereum address',maxlength:42,class:'addr'});
  return h('div',{class:'row'},i,h('button',{class:'btn ghost sm',type:'button',onclick:()=>{const a=i.value.trim();if(!isAddr(a)){toast('Enter a valid Ethereum address (0x…).');return}
    if(!S.db||!S.uid){toast('Sign in first so we can match the wallet to your account.');return}
    saveRequest({wallet:{address:a,kind:'Manual',ts:Date.now()}},'Wallet saved. Your ATHX reward goes here.')}},'Save Wallet'));
}
function openReceive(){
  if(!WAL.account){toast('Connect a wallet first.');return}
  openDlg('Receive ATHX',h('div',{class:'dlg-body conn'},
    h('div',{class:'qrcard'},h('div',{style:'width:100%',html:qrSvg(WAL.account)}),h('b',null,'ATHX · Ethereum'),h('small',null,'SEND ONLY ATHX OR ETHEREUM TOKENS')),
    h('p',{class:'addr'},WAL.account),
    h('button',{class:'btn',onclick:e=>copy(WAL.account,e.currentTarget)},'Copy Address'),
    h('p',{class:'small muted'},'Share this address to receive ATHX. Only send tokens on Ethereum Mainnet to it.')));
}
function openSend(to,amt){
  if(!WAL.account){toast('Connect a wallet first.');return}
  const toI=h('input',{id:'sd_to',class:'addr',placeholder:'0x… recipient address',maxlength:42,value:to||''});
  const amI=h('input',{id:'sd_amt',inputmode:'decimal',placeholder:'Amount',value:amt||''});
  const msg=h('p',{class:'small muted',role:'status'});
  const f=h('form',{class:'dlg-body'},
    h('label',{for:'sd_to'},'Send To',toI),h('label',{for:'sd_amt'},'Amount (ATHX)',amI),
    WAL.balance!=null&&WAL.decimals!=null?h('p',{class:'small muted'},'Balance: '+fmtUnits(WAL.balance,WAL.decimals)+' ATHX'):null,
    h('p',{class:'small muted'},'Your wallet will ask you to confirm. Sending needs a little ETH for the network fee. Transfers cannot be reversed.'),
    msg,h('button',{class:'btn',type:'submit'},'Review In Wallet'));
  f.onsubmit=async e=>{e.preventDefault();const t=toI.value.trim();
    if(!isAddr(t)){toast('Enter a valid Ethereum address.');return}
    try{const dec=WAL.decimals??18;const units=toUnits(amI.value,dec);if(units<=0n)throw new Error('Enter an amount above 0.');
      if(WAL.balance!=null&&units>WAL.balance)throw new Error('That is more than your balance.');
      msg.textContent='Confirm the transfer in '+WAL.kind+'…';
      const hash=await WAL.prov.request({method:'eth_sendTransaction',params:[{from:WAL.account,to:ATHX.address,data:'0xa9059cbb'+pad32(t)+pad32(units.toString(16))}]});
      WAL.tx=hash;$('dlg').close();toast('Transfer sent.');setTimeout(refreshBalance,8000);render()}
    catch(err){msg.textContent=err?.code===4001?'Transfer cancelled.':(err?.message||'Transfer failed.')}};
  openDlg('Send ATHX',f);
}
async function watchAsset(){try{await WAL.prov.request({method:'wallet_watchAsset',params:{type:'ERC20',options:{address:ATHX.address,symbol:'ATHX',decimals:WAL.decimals??18}}});toast('ATHX added to your wallet.')}catch(e){toast('Could not add ATHX.')}}
function walletPage(){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  const reward=Number(STATE.org?.athxReward||10000).toLocaleString();
  const wbtn=(k,name,bg,icon)=>h('button',{class:'sbtn',type:'button',onclick:()=>connectWallet(k)},h('span',{class:'ico',style:'background:'+bg},icon),h('span',null,'Connect '+name,h('small',null,findProvider(k)?'Detected in this browser':'Opens the '+name+' app')));
  sec.append(h('div',{class:'home-hero',style:'padding-block:10px 0'},h('p',{class:'eyebrow'},'AthleteCoin'),h('h1',null,'ATHX',h('span',null,'Wallet')),
    h('p',{class:'lede'},'Connect MetaMask, Trust Wallet or Phantom to see your ATHX balance, receive and send tokens.')));
  if(!WAL.account){
    sec.append(h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px'},
      h('div',{class:'wallets'},wbtn('metamask','MetaMask','#f6851b','M'),wbtn('trust','Trust Wallet','#0500ff','T'),wbtn('phantom','Phantom','#ab9ff2','P')),
      h('p',{class:'small muted'},'ATHX runs on Ethereum Mainnet. Future All American never sees your keys; every transfer is confirmed in your wallet.')));
  }else{
    sec.append(h('div',{class:'panel',style:'padding:18px;display:grid;gap:12px'},
      h('div',{class:'row between'},h('span',{class:'chip ok'},WAL.kind+' connected'),h('button',{class:'btn ghost sm',onclick:()=>{WAL.prov=null;WAL.account='';WAL.balance=null;render()}},'Disconnect')),
      h('div',{class:'wbal'},h('small',null,'ATHX BALANCE'),h('b',null,WAL.balance==null||WAL.decimals==null?'…':fmtUnits(WAL.balance,WAL.decimals)),h('span',{class:'addr',style:'color:#ffde59aa'},WAL.account)),
      h('div',{class:'wtabs'},h('button',{class:'btn',onclick:()=>openSend()},'Send'),h('button',{class:'btn ghost',onclick:openReceive},'Receive')),
      h('div',{class:'row'},h('button',{class:'btn ghost sm',onclick:refreshBalance},'Refresh Balance'),h('button',{class:'btn ghost sm',onclick:watchAsset},'Add ATHX To Wallet'),
        h('a',{class:'btn ghost sm',href:'https://etherscan.io/token/'+ATHX.address+'?a='+WAL.account,target:'_blank',rel:'noopener'},'History ↗')),
      WAL.tx?h('p',{class:'small'},'Last transfer: ',h('a',{class:'txlink',href:'https://etherscan.io/tx/'+WAL.tx,target:'_blank',rel:'noopener'},WAL.tx.slice(0,18)+'…')):null));
  }
  sec.append(
    h('div',{class:'panel',style:'padding:18px;display:grid;gap:10px;border-color:#f5b700'},h('span',{class:'athx'},'Free Reward'),h('h3',{style:'font-size:1.6rem'},reward+' ATHX With Your Membership'),
      h('p',{class:'muted'},'Sign up for the $'+mp()+' Future All American membership and get '+reward+' ATHX free. Connect your wallet here, and Future All American sends the tokens after your payment is confirmed. Athletes under 18 should use a parent or guardian\'s wallet.'),
      h('div',{class:'row'},h('a',{class:'btn',href:'#me'},'Get The Membership'))),
    h('div',{class:'panel',style:'padding:16px;display:grid;gap:8px'},h('h3',{style:'font-size:1.2rem'},'No Wallet Here? Save Your Address'),h('p',{class:'small muted'},'Paste your Ethereum address to receive your reward without connecting.'),manualWallet()),
    h('p',{class:'small muted'},'Token contract: ',h('a',{class:'addr',href:'https://etherscan.io/token/'+ATHX.address,target:'_blank',rel:'noopener'},ATHX.address),'. ATHX is a digital token; its value can change and transfers cannot be reversed.'));
  if(WAL.account&&WAL.balance==null&&!WAL.tried){WAL.tried=true;refreshBalance()}
  return w;
}

/* ---------- external profile links + sign in ---------- */
function extLinks(tok,r){
  const slug=slugOf(tok);let mp='';
  if(tok[0]==='g'){const row=(STATE.watch?.flag?.rows||[]).find(x=>'g-'+x[0]===tok);mp=row&&row[5]?'https://www.maxpreps.com/'+row[5]:''}
  if(!mp)mp='https://www.maxpreps.com/search/?q='+encodeURIComponent(r.name);
  return h('div',{class:'extlinks'},
    slug?h('a',{class:'ext rivals',href:'https://www.on3.com/rivals/'+slug+'/',target:'_blank',rel:'noopener'},'Rivals ↗'):null,
    h('a',{class:'ext maxpreps',href:mp,target:'_blank',rel:'noopener'},'MaxPreps ↗'));
}
function signInPage(){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  const login='';
  const opt=(href,bg,icon,label,sub,click)=>h(href?'a':'button',{class:'sbtn',href:href||null,target:href?'_blank':null,rel:href?'noopener':null,type:href?null:'button',onclick:click||null},h('span',{class:'ico',style:'background:'+bg,html:icon}),h('span',null,label,h('small',null,sub)));
  const G='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" opacity=".8"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" opacity=".6"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" opacity=".9"/></svg>';
  const M='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
  const signedIn=!!(S.db&&S.uid);
  sec.append(h('div',{class:'panel',style:'padding:20px;display:grid;gap:14px'},
    h('p',{class:'eyebrow'},'FAA Recruit'),h('h2',{style:'font-size:2.4rem'},signedIn?'You Are Signed In':'Sign In'),
    signedIn?h('div',{class:'row'},h('a',{class:'btn',href:'#me'},'Go To My Account'),h('button',{class:'btn ghost',onclick:()=>FAA_AUTH.signOut()},'Sign Out')):
    h('div',{class:'signin'},
      opt('','#ea4335',G,'Continue With Gmail','Sign in with your Google account',()=>FAA_AUTH.google()),
      opt('','#475569',M,'Continue With Email','Get a sign-in link by email',()=>FAA_AUTH.emailPrompt()),
      opt('','#000',I.x,'Continue With X','Sign in with your X account',()=>FAA_AUTH.x()),
      h('p',{class:'small muted'},'Sign-in is secure. You come right back here after signing in.')),
    h('div',{style:'display:grid;gap:10px'},h('h3',{style:'font-size:1.3rem'},'Connect Your Socials'),
      opt('','linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)',I.instagram,'Connect Instagram','Verify your account to claim or manage your profile',()=>connectSocial('instagram')),
      opt('','#000',I.x,'Connect X','Verify your account to claim or manage your profile',()=>connectSocial('x')))));
  return w;
}
async function connectSocial(kind){
  const label=kind==='x'?'X':'Instagram';
  if(!S.db||!S.uid){openDlg('Connect '+label,h('div',{class:'dlg-body'},h('p',null,'Sign in with Gmail or email first, then connect your '+label+'.'),h('a',{class:'btn',href:'#signin',onclick:()=>$('dlg').close(),style:'justify-self:start'},'Sign In')));return}
  await loadMyReq();const code=claimCode('social-'+kind);
  const f=h('form',{class:'dlg-body'},
    h('label',{for:'cs_h'},label+' @handle',h('input',{id:'cs_h',maxlength:40,placeholder:'@handle',required:true,value:S.myReq?.socials?.[kind]||''})),
    h('p',{class:'small muted'},'Add this code to your '+label+' bio so Future All American can confirm the account is yours. You can remove it after you are verified.'),
    h('span',{class:'code'},code),
    h('button',{class:'btn',type:'submit'},'Connect '+label));
  f.onsubmit=e=>{e.preventDefault();const hd=cleanHandle(f.querySelector('#cs_h').value);if(!hd){toast('Add your handle.');return}
    saveRequest({socials:{...(S.myReq?.socials||{}),[kind]:hd,[kind+'Code']:code}},label+' sent for verification.')};
  openDlg('Connect '+label,f);
}

/* ---------- claim your profile ---------- */
function claimCode(tok){const base=(S.uid||'guest')+'|'+tok;let x=2166136261;for(const c of base){x^=c.charCodeAt(0);x=Math.imul(x,16777619)>>>0}return 'FAA-'+x.toString(36).toUpperCase().slice(0,5).padStart(5,'7')}
function claimSocials(tok){const c=wClaim(tok);if(!c||c.status!=='verified')return null;
  const links=[c.ig&&['instagram','Instagram','https://instagram.com/'+c.ig],c.x&&['x','X','https://x.com/'+c.x]].filter(Boolean);
  return links.length?h('div',{class:'socials'},links.map(([k,l,u])=>h('a',{class:'soc',href:u,target:'_blank',rel:'noopener','aria-label':l,title:l+' @'+u.split('/').pop(),html:I[k]}))):null}
function nilCard(tok,r){
  const slug=slugOf(tok);const v=((STATE.watch||{}).nil||{})[slug||tok];
  return h('div',{class:'panel jr'},h('div',{class:'nilcard'},h('div',{style:'display:grid;gap:4px'},h('small',{class:'eyebrow'},'On3 NIL Valuation'),h('p',{class:'small muted'},v?'Estimated Annual Value From On3':'Not Listed By On3 Yet')),h('b',null,v||'—')));
}
const CLAIM_PERKS=['Donations And Paid Sponsor Spots On Your Page','Gear Carousel From Nike, adidas, Under Armour And Puma','Blue Verified Check On Your Avatar','Update Your Photo, Bio And Socials','Add Highlight Videos','Verified Combine Numbers From FAA','Your Own QR Connect Code And NFC Wristband','NIL And Sponsor Inquiries Sent To You'];
function claimRank(tok){const m=/^(?:w20\d\d|g)-(\d+)$/.exec(tok);return m?+m[1]:999}
const isFreeClaim=tok=>claimRank(tok)<=10;
function claimBtn(tok,name){
  const c=wClaim(tok);if(c&&c.status==='verified')return null;
  const mine=S.myReq?.claim?.tok===tok;
  return h('button',{class:'btn sm',onclick:()=>openClaim(tok,name)},mine?'Claim Pending Review':'Claim Your Profile');
}
function claimPanel(tok,name){
  const c=wClaim(tok);if(c&&c.status==='verified')return null;
  return h('div',{class:'panel claimpanel'},
    h('p',{class:'eyebrow',style:'color:#1d9bf0'},'Is This You?'),
    h('h3',null,'Claim '+name+"'s Profile"),
    isFreeClaim(tok)?h('span',{class:'freechip'},'Top 10 · Free Access'):null,
    h('p',{class:'muted'},'Athletes and parents can claim this profile to take control of it on Future All American.'),
    h('ul',{class:'benefits'},CLAIM_PERKS.map(p=>h('li',null,h('span',{html:I.check}),p))),
    h('button',{class:'btn',style:'justify-self:start;background:#1d9bf0',onclick:()=>openClaim(tok,name)},S.myReq?.claim?.tok===tok?'Claim Pending Review':'Claim Your Profile'));
}
async function openClaim(tok,name){
  const phone=STATE.org?.phone||'(520) 440-0341';const free=isFreeClaim(tok);
  if(!S.db||!S.uid){openDlg('Claim '+name+"'s Profile",h('div',{class:'dlg-body'},
    free?h('span',{class:'freechip'},'Top 10 · Free Access'):null,
    h('p',null,'To claim this profile, sign in with your Google (Gmail) account or email, then open this page again and tap Claim Your Profile.'),
    h('p',{class:'small muted'},'Or text Future All American at ',h('b',null,phone),' with your name, this profile and your Instagram or X handle.')));return}
  await loadMyReq();const prev=S.myReq?.claim?.tok===tok?S.myReq.claim:null;const code=claimCode(tok);
  const D={payoutVenmo:prev?.payoutVenmo||'',payoutCashapp:prev?.payoutCashapp||'',role:prev?.role||'',name:prev?.name||'',contact:prev?.contact||'',ig:prev?.ig||'',x:prev?.x||'',paid:prev?.paid||''};let step=0;
  const ROLES=[['The athlete','I am '+name],['Parent or guardian','I am '+first(name)+"'s parent or guardian"]];
  const inp=(id,label,key,attrs)=>{const el=h('input',{id,maxlength:60,...attrs,value:D[key]});el.oninput=()=>{D[key]=el.value};return h('label',{for:id},label,el)};
  const body=h('div',{class:'dlg-body'});
  const draw=()=>{
    const bar=h('div',{class:'stepper','aria-label':'Step '+(step+1)+' of 4'},[0,1,2,3].map(i=>h('i',{class:i<=step?'on':''})));
    const back=step?h('button',{class:'btn ghost',type:'button',onclick:()=>{step--;draw()}},'Back'):null;
    const next=(label,ok)=>h('button',{class:'btn',type:'button',onclick:()=>{const e=ok();if(e){toast(e);return}step++;draw()}},label);
    let content;
    if(step===0)content=[h('h3',{style:'font-size:1.4rem'},'Who Are You?'),
      h('div',{class:'choice'},ROLES.map(([v,t])=>h('button',{type:'button','aria-pressed':D.role===v?'true':'false',onclick:()=>{D.role=v;draw()}},h('span',null,t,h('small',null,v==='The athlete'?'Under 18? A parent or guardian should finish the claim.':'You will manage the profile for your athlete.')),D.role===v?h('span',{class:'vb',style:'position:static',html:I.check}):null))),
      h('div',{class:'row'},next('Continue',()=>D.role?'':'Choose who you are.'))];
    else if(step===1)content=[h('h3',{style:'font-size:1.4rem'},'Your Information'),
      inp('cl_name','Your Full Name','name',{required:true}),
      inp('cl_ct','Phone Or Email','contact',{maxlength:80}),
      h('p',{class:'small muted'},'Where should we send donation and sponsor money? (Parent or guardian account for athletes under 18. Only Future All American sees this.)'),
      h('div',{class:'g2'},inp('cl_pv','Venmo @handle','payoutVenmo',{maxlength:40,placeholder:'@handle'}),inp('cl_pc','Cash App $cashtag','payoutCashapp',{maxlength:40,placeholder:'$cashtag'})),
      h('div',{class:'row'},back,next('Continue',()=>!D.name.trim()?'Add your name.':!D.contact.trim()?'Add a phone number or email so we can reach you.':''))];
    else if(step===2)content=[h('h3',{style:'font-size:1.4rem'},'Verify With Instagram Or X'),
      h('p',{class:'small muted'},'Connect the account that belongs to '+name+'. Add this code to the account bio. Future All American checks for it, then verifies the profile. You can remove it after you are verified.'),
      h('span',{class:'code'},code),
      h('div',{class:'g2'},inp('cl_ig','Instagram @handle','ig',{maxlength:40,placeholder:'@handle'}),inp('cl_x','X (Twitter) @handle','x',{maxlength:40,placeholder:'@handle'})),
      h('div',{class:'row'},back,next('Continue',()=>(cleanHandle(D.ig)||cleanHandle(D.x))?'':'Add your Instagram or X handle.'))];
    else{
      const pay=STATE.pay||{};
      content=[h('h3',{style:'font-size:1.4rem'},'Review & Claim'),
        free?h('div',{class:'plan'},h('span',{class:'freechip'},'Top 10 · Free Access'),h('b',null,'$0'),h('p',{class:'small muted'},'Top 10 players in every class get a full verified profile free. No payment needed.')):
          h('div',{class:'plan'},h('p',{class:'eyebrow'},'Verified Profile'),h('b',null,'$'+mp(),h('small',{class:'muted',style:'font-size:1rem'},' / Year')),h('p',{class:'small muted'},'Includes an NFC wristband. Pay with Venmo @'+(pay.venmo||'futureallamerican')+', Cash App $'+(pay.cashapp||'futureallamerican')+' or Zelle '+(pay.zelle||'')+'. Put "FAA Claim – '+name+'" in the note. Your profile is verified after payment and review.'),
            h('label',null,'Payment Sent With',h('select',{onchange:e=>{D.paid=e.target.value}},['','Venmo','Cash App','Zelle','Paying later'].map(o=>h('option',{value:o,selected:D.paid===o},o||'Choose one'))))),
        h('ul',{class:'benefits'},CLAIM_PERKS.map(p=>h('li',null,h('span',{html:I.check}),p))),
        h('div',{class:'card small',style:'text-transform:none'},h('p',{style:'text-transform:none'},D.role+' · '+D.name+' · '+D.contact),h('p',{style:'text-transform:none'},[cleanHandle(D.ig)&&'Instagram @'+cleanHandle(D.ig),cleanHandle(D.x)&&'X @'+cleanHandle(D.x)].filter(Boolean).join(' · ')+' · Code '+code)),
        h('p',{class:'small muted'},'Future All American reviews every claim. Nothing on the profile changes until your account is verified.'),
        h('div',{class:'row'},back,h('button',{class:'btn',type:'button',style:'background:#1d9bf0',onclick:()=>{
          saveRequest({claim:{tok,player:name,name:D.name.trim(),role:D.role,ig:cleanHandle(D.ig),x:cleanHandle(D.x),contact:D.contact.trim(),payoutName:D.name.trim(),payoutVenmo:cleanHandle(D.payoutVenmo),payoutCashapp:D.payoutCashapp.replace(/^[\s$]+/,'').trim(),code,plan:free?'Free (Top 10)':'$'+mp()+'/yr',paid:free?'':D.paid,ts:Date.now()}},'Claim sent. Future All American will verify your account.');
          setTimeout(()=>{if(S.slug===tok)render()},800)}},prev?'Update Claim':'Submit Claim'))];
    }
    body.replaceChildren(prev&&step===0?h('p',{class:'note'},'Your claim was sent '+new Date(prev.ts).toLocaleDateString()+' and is under review. You can update it.'):'',bar,...content);
  };
  draw();openDlg('Claim '+name+"'s Profile",body);
}
function claimReview(r){
  const c=r.claim;const W=S.draft.watch=S.draft.watch||{};W.claims=W.claims||{};const cur=W.claims[c.tok];
  const lk=(u,t)=>h('a',{href:u,target:'_blank',rel:'noopener'},t+' ↗');
  return h('div',{class:'card',style:'border-color:#1d9bf0'},
    h('b',null,'Profile Claim · '+c.player+' (#'+c.tok+')'),
    h('p',{class:'small'},c.name+' · '+c.role+(c.contact?' · '+c.contact:'')),
    payoutLine(c),
    h('p',{class:'small'},'Plan: '+(c.plan||'—')+(c.paid?' · Paid with '+c.paid:'')),
    h('div',{class:'row'},c.ig?lk('https://instagram.com/'+c.ig,'Instagram @'+c.ig):null,c.x?lk('https://x.com/'+c.x,'X @'+c.x):null),
    h('p',{class:'small muted'},'Check that the bio shows code ',h('code',null,c.code),' and that the account belongs to the athlete.'),
    h('div',{class:'row'},
      h('a',{class:'btn ghost sm',href:'#'+c.tok,onclick:()=>$('dlg').close()},'View Profile'),
      h('button',{class:'btn sm',type:'button',style:'background:#1d9bf0',onclick:e=>{W.claims[c.tok]={status:'verified',ig:c.ig||'',x:c.x||'',by:r.id,ts:Date.now()};e.currentTarget.disabled=true;e.currentTarget.textContent='Verified · Publish To Save'}},cur?.status==='verified'?'Verified':'Approve & Verify'),
      h('button',{class:'btn ghost sm',type:'button',onclick:e=>{delete W.claims[c.tok];e.currentTarget.textContent='Not Verified'}},'Reject'),
      h('button',{class:'btn ghost sm',type:'button',onclick:e=>{const p=who(c.tok);if(!p)return;const sl=slugify(p.name);if(S.draft.athletes.some(x=>x.slug===sl)){toast('That athlete page already exists.');return}
        const m=/^w(20\d\d)-(\d+)$/.exec(c.tok);const row=m?(((S.draft.watch.classes||{})[m[1]]||{}).rows||[]).find(x=>x[0]===m[2]):null;const [ht,wt]=(row?.[5]||'').split('/');
        S.draft.athletes.push({slug:sl,name:p.name,photo:p.photo||'',number:'',pos:row?.[2]||'',cls:m?m[1]:'',grade:'',height:ht||'',weight:wt||'',team:row?.[3]||'',school:row?.[3]||'',bio:'',socials:{instagram:c.ig||'',x:c.x||'',tiktok:'',snapchat:''},stats:{},wishlist:[],sponsors:[],highlights:[],ratings:{},offers:[],sport:c.tok[0]==='g'?'Girls flag football':'Football',uid:r.id,claimTok:c.tok,unlocked:true,membership:{status:c.plan&&c.plan.startsWith('Free')?'Active':'None'}});
        e.currentTarget.disabled=true;e.currentTarget.textContent='Page Added · Publish To Save'}},'Create Athlete Page')));
}

/* ---------- connect: QR, share, NFC ---------- */
function siteBase(){return (safeUrl(window.FAA_CONFIG?.siteUrl)||safeUrl(STATE.org?.siteUrl)||location.href).replace(/#.*$/,'')}
function linkFor(tok){return siteBase()+'#'+tok}
function who(tok){
  const a=athletes().find(x=>x.slug===tok);
  if(a)return {tok,name:a.name,photo:a.photo,sub:[a.pos,a.cls&&'Class of '+a.cls,a.team].filter(Boolean).join(' · '),ours:true};
  const W=STATE.watch||{};let m=/^w(20\d\d)-(\d+)$/.exec(tok);
  if(m){const row=(((W.classes||{})[m[1]]||{}).rows||[]).find(x=>x[0]===m[2]);if(row)return {tok,name:row[1],photo:wPhoto(tok),sub:['#'+row[0],row[2],'Class of '+m[1],row[3]].filter(Boolean).join(' · ')}}
  m=/^g-(\d+)$/.exec(tok);
  if(m&&W.flag){const row=W.flag.rows.find(x=>x[0]===m[1]);if(row)return {tok,name:row[1],photo:wPhoto(tok),sub:['#'+row[0],'Flag football','Class of '+row[2],row[3]].filter(Boolean).join(' · ')}}
  return null;
}
function qrSvg(text){
  const q=QRLib.make(text,'M');const n=q.getModuleCount();let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+='M'+(c+4)+' '+(r+4)+'h1v1h-1z';
  return '<svg viewBox="0 0 '+(n+8)+' '+(n+8)+'" role="img" aria-label="QR code" shape-rendering="crispEdges"><rect width="'+(n+8)+'" height="'+(n+8)+'" fill="#fff"/><path d="'+d+'" fill="#08101c"/></svg>';
}
function qrCard(p,big){return h('div',{class:'qrcard'},h('div',{style:'width:100%',html:qrSvg(linkFor(p.tok))}),h('b',null,p.name),h('small',null,'SCAN TO OPEN · FAA RECRUIT'))}
function connectBtn(tok){return h('button',{class:'btn ghost sm cbtn',style:'justify-self:start',onclick:()=>openConnect(tok)},h('span',{html:I.qr,style:'display:grid'}),'Connect · QR & NFC')}
async function copyLink(url){try{await navigator.clipboard.writeText(url);toast('Link copied')}catch(e){toast('Press and hold the link to copy it')}}
async function shareLink(p){const url=linkFor(p.tok);
  if(navigator.share){try{await navigator.share({title:p.name+' | FAA Recruit',text:p.name+(p.sub?' · '+p.sub:''),url});return}catch(e){if(e&&e.name==='AbortError')return}}
  copyLink(url)}
async function writeNfc(p,msg){
  const url=linkFor(p.tok);msg.className='nfcmsg';
  if(!('NDEFReader' in window)){msg.textContent="This phone can't write NFC from a web page (Apple phones and most in-app browsers can't). Use a free NFC writer app such as NFC Tools: choose Write, add a URL record, paste the copied link, and hold the wristband to the phone.";copyLink(url);return}
  try{const nd=new NDEFReader();msg.textContent='Hold the wristband or NFC tag to the back of your phone…';
    await nd.write({records:[{recordType:'url',data:url}]});msg.className='nfcmsg ok';msg.textContent='Done. Any phone that taps this wristband now opens '+first(p.name)+"'s page."}
  catch(e){msg.textContent=(e&&e.name==='NotAllowedError'?'NFC is blocked here. Open this page in Chrome on Android and allow NFC, or':'Could not write the tag ('+(e&&e.message||'unknown error')+'). Try again, or')+' use an NFC writer app with the copied link.';copyLink(url)}
}
function connectBody(p){
  const msg=h('p',{class:'nfcmsg',role:'status'});const url=linkFor(p.tok);
  return h('div',{class:'conn'},
    qrCard(p),
    h('p',{class:'small muted'},p.sub||''),
    h('div',{class:'conn-actions'},
      h('button',{class:'btn',onclick:()=>shareLink(p)},h('span',{html:I.share,style:'display:grid'}),'Share'),
      h('button',{class:'btn ghost',onclick:()=>writeNfc(p,msg)},h('span',{html:I.nfc,style:'display:grid'}),'Write NFC'),
      h('button',{class:'btn ghost',onclick:()=>copyLink(url)},h('span',{html:I.copy,style:'display:grid'}),'Copy link')),
    msg,
    h('p',{class:'linkline'},url),
    h('details',{class:'drop how'},h('summary',null,'How tap & scan work',h('span',{class:'chev',html:I.left?I.left.replace('M15 18l-6-6 6-6','M9 18l6-6-6-6'):'›'})),
      h('div',{class:'drop-body small muted'},
        h('p',null,h('b',null,'Scan: '),'point any phone camera at the code. It opens this page, no app needed.'),
        h('p',null,h('b',null,'Tap: '),'write the link to an NFC wristband or sticker once. After that, tapping it to the top of an Apple phone or the back of an Android phone opens this page.'),
        h('p',null,h('b',null,'Phone to phone: '),"phones can't beam a page to each other over NFC from a website, so show this code or use Share instead."))),
    h('div',{class:'row',style:'justify-content:center'},h('a',{class:'btn ghost sm',href:'#code-'+p.tok,onclick:()=>$('dlg').close()},'Full-screen code'),h('a',{class:'btn sm',style:'background:linear-gradient(45deg,#fa7e1e,#d62976,#962fbf);color:#fff',href:'#share-'+p.tok,onclick:()=>$('dlg').close()},'Post On Instagram')));
}
function openConnect(tok){const p=who(tok);if(!p){toast('Player not found');return}openDlg('Connect with '+first(p.name),h('div',{class:'dlg-body'},connectBody(p)))}
function codePage(tok){
  const p=who(tok);const w=h('div',{class:'wrap'});
  if(!p){w.append(h('section',null,h('div',{class:'panel',style:'padding:20px'},h('h2',{style:'font-size:2rem'},'Player not found'),h('a',{class:'btn ghost sm',href:'#connect',style:'margin-top:10px'},'Back'))));return w}
  document.title=p.name+' code | FAA Recruit';
  w.append(h('section',{class:'codepage'},h('div',{class:'conn'},
    h('div',{class:'wp-av',style:'width:84px;height:84px'},p.photo?h('img',{src:p.photo,alt:''}):h('span',{style:'font-size:1.8rem'},initials(p.name)),(p.ours?p.photo:isVerified(p.tok))?vb():null),
    connectBody(p),
    h('a',{class:'btn ghost sm',href:'#'+p.tok},'Open '+first(p.name)+"'s page"))));
  return w;
}
function appPage(){
  const w=h('div',{class:'wrap'});const sec=h('section',{class:'dash'});w.append(sec);
  const mine=S.uid&&athletes().find(x=>x.uid===S.uid);const lead=athletes()[0];
  const W=STATE.watch||{};
  const opts=[...athletes().map(a=>[a.slug,a.name+' · FAA']),...Object.keys(W.classes||{}).sort().flatMap(y=>W.classes[y].rows.map(r=>['w'+y+'-'+r[0],r[1]+' · '+y+' #'+r[0]])),...((W.flag||{}).rows||[]).map(r=>['g-'+r[0],r[1]+' · Flag #'+r[0]])];
  const pick=h('select',{id:'app_pick','aria-label':'Choose a player'},opts.map(([v,t])=>h('option',{value:v},t)));
  const q=h('input',{type:'search',placeholder:'Type a name',oninput:e=>{const t=e.target.value.toLowerCase();const hit=opts.find(o=>o[1].toLowerCase().includes(t));if(hit)pick.value=hit[0]}});
  sec.append(
    h('div',{class:'home-hero',style:'padding-block:10px 0'},h('p',{class:'eyebrow'},'FAA Recruit Connect'),h('h1',null,'Tap.',h('span',null,'Scan. Connect.')),
      h('p',{class:'lede'},'Every player has a connect code. Scan it with any phone camera, tap their NFC wristband, or share the link. It always opens their latest page.')),
    mine||S.isOwner?h('div',{class:'panel',style:'padding:18px;display:grid;gap:12px;justify-items:center'},h('p',{class:'eyebrow'},mine?'Your connect code':'Featured athlete'),connectBody(who((mine||lead).slug))):'',
    h('div',{class:'panel',style:'padding:16px;display:grid;gap:10px'},h('h3',{style:'font-size:1.4rem'},'Find any player\'s code'),
      h('p',{class:'small muted'},opts.length+' players: Future All American athletes, the Rivals 2027–2029 top 100s and the MaxPreps girls flag football top 100.'),
      h('label',null,'Search',q),h('label',{for:'app_pick'},'Player',pick),
      h('div',{class:'row'},h('button',{class:'btn',onclick:()=>openConnect(pick.value)},'Show code'),h('button',{class:'btn ghost',onclick:()=>{location.hash='code-'+pick.value}},'Full screen'))),
    h('div',{class:'panel',style:'padding:16px;display:grid;gap:12px'},h('h3',{style:'font-size:1.4rem'},'Put FAA Recruit on your home screen'),
      h('div',{class:'app-steps'},
        h('div',{class:'card'},h('b',null,'Apple Phone (Safari)'),h('ol',{class:'perks'},h('li',null,'Open this page in Safari.'),h('li',null,'Tap the Share button.'),h('li',null,'Tap Add to Home Screen, then Add.'))),
        h('div',{class:'card'},h('b',null,'Android (Chrome)'),h('ol',{class:'perks'},h('li',null,'Open this page in Chrome.'),h('li',null,'Tap the ⋮ menu.'),h('li',null,'Tap Add to Home screen, then Add.')))),
      h('p',{class:'small muted'},'The icon opens FAA Recruit like an app. Pages update on their own when Future All American publishes new rankings, offers or commitments.')),
    h('div',{class:'panel',style:'padding:16px;display:grid;gap:8px'},h('h3',{style:'font-size:1.4rem'},'NFC wristbands'),
      h('p',{class:'muted'},'Members get a wristband programmed with their page. Tap it to any phone and the page opens. On Android with Chrome you can write a wristband right from a player\'s Connect screen; on Apple phones use a free NFC writer app with the copied link.')),
    passportCard(),
    membershipCard(null,null,false));
  return w;
}

/* ---------- boot ---------- */
function route(){const dg=$('dlg');if(dg&&dg.open)dg.close();S.slug=decodeURIComponent((location.hash||'').slice(1))||null;render();window.scrollTo({top:0})}
window.addEventListener('hashchange',route);
route();
(async()=>{
  const [user,db]=await Promise.all([claude.use('user'),claude.use('db')]);
  S.user=user;S.db=db;
  if(user){try{const me=await user.me();S.uid=me.id;S.isOwner=!!me.isOwner}catch(e){}}
  if(S.isOwner){const [art,assets]=await Promise.all([claude.use('artifact'),claude.use('assets')]);S.artifact=art;S.assets=assets;S.assetsUp=assets;if(db){loadRequests();loadProfiles()}}
  else if(S.uid){S.assetsUp=await claude.use('assets')}
  render();
})();
})();
