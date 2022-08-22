(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["QRCodeStyling"] = factory();
	else
		root["QRCodeStyling"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/qrcode-generator/qrcode.js":
/*!*************************************************!*\
  !*** ./node_modules/qrcode-generator/qrcode.js ***!
  \*************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
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
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

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
      [11, 36, 12, 7, 37, 13],

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

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (true) {
      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(function () {
    return qrcode;
}));


/***/ }),

/***/ "./src/constants/cornerDotTypes.ts":
/*!*****************************************!*\
  !*** ./src/constants/cornerDotTypes.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square"
});


/***/ }),

/***/ "./src/constants/cornerSquareTypes.ts":
/*!********************************************!*\
  !*** ./src/constants/cornerSquareTypes.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/dotTypes.ts":
/*!***********************************!*\
  !*** ./src/constants/dotTypes.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dots: "dots",
    rounded: "rounded",
    classy: "classy",
    classyRounded: "classy-rounded",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/drawTypes.ts":
/*!************************************!*\
  !*** ./src/constants/drawTypes.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    canvas: "canvas",
    svg: "svg"
});


/***/ }),

/***/ "./src/constants/errorCorrectionLevels.ts":
/*!************************************************!*\
  !*** ./src/constants/errorCorrectionLevels.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: "L",
    M: "M",
    Q: "Q",
    H: "H"
});


/***/ }),

/***/ "./src/constants/errorCorrectionPercents.ts":
/*!**************************************************!*\
  !*** ./src/constants/errorCorrectionPercents.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: 0.07,
    M: 0.15,
    Q: 0.25,
    H: 0.3
});


/***/ }),

/***/ "./src/constants/gradientTypes.ts":
/*!****************************************!*\
  !*** ./src/constants/gradientTypes.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    radial: "radial",
    linear: "linear"
});


/***/ }),

/***/ "./src/constants/modes.ts":
/*!********************************!*\
  !*** ./src/constants/modes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    numeric: "Numeric",
    alphanumeric: "Alphanumeric",
    byte: "Byte",
    kanji: "Kanji"
});


/***/ }),

/***/ "./src/constants/qrTypes.ts":
/*!**********************************!*\
  !*** ./src/constants/qrTypes.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var qrTypes = {};
for (var type = 0; type <= 40; type++) {
    qrTypes[type] = type;
}
// 0 types is autodetect
// types = {
//     0: 0,
//     1: 1,
//     ...
//     40: 40
// }
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (qrTypes);


/***/ }),

/***/ "./src/core/QRCanvas.ts":
/*!******************************!*\
  !*** ./src/core/QRCanvas.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/calculateImageSize */ "./src/tools/calculateImageSize.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../figures/dot/canvas/QRDot */ "./src/figures/dot/canvas/QRDot.ts");
/* harmony import */ var _figures_cornerSquare_canvas_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../figures/cornerSquare/canvas/QRCornerSquare */ "./src/figures/cornerSquare/canvas/QRCornerSquare.ts");
/* harmony import */ var _figures_cornerDot_canvas_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../figures/cornerDot/canvas/QRCornerDot */ "./src/figures/cornerDot/canvas/QRCornerDot.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/gradientTypes */ "./src/constants/gradientTypes.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
var dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
var QRCanvas = /** @class */ (function () {
    //TODO don't pass all options to this class
    function QRCanvas(options) {
        this._canvas = document.createElement("canvas");
        this._canvas.width = options.width;
        this._canvas.height = options.height;
        this._options = options;
    }
    Object.defineProperty(QRCanvas.prototype, "context", {
        get: function () {
            return this._canvas.getContext("2d");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRCanvas.prototype, "width", {
        get: function () {
            return this._canvas.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRCanvas.prototype, "height", {
        get: function () {
            return this._canvas.height;
        },
        enumerable: false,
        configurable: true
    });
    QRCanvas.prototype.getCanvas = function () {
        return this._canvas;
    };
    QRCanvas.prototype.clear = function () {
        var canvasContext = this.context;
        if (canvasContext) {
            canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    QRCanvas.prototype.drawQR = function (qr) {
        return __awaiter(this, void 0, void 0, function () {
            var count, minSize, dotSize, drawImageSize, _a, imageOptions, qrOptions, coverLevel, maxHiddenDots;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        count = qr.getModuleCount();
                        minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
                        dotSize = Math.floor(minSize / count);
                        drawImageSize = {
                            hideXDots: 0,
                            hideYDots: 0,
                            width: 0,
                            height: 0
                        };
                        this._qr = qr;
                        if (!this._options.image) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadImage()];
                    case 1:
                        _b.sent();
                        if (!this._image)
                            return [2 /*return*/];
                        _a = this._options, imageOptions = _a.imageOptions, qrOptions = _a.qrOptions;
                        coverLevel = imageOptions.imageSize * _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__["default"][qrOptions.errorCorrectionLevel];
                        maxHiddenDots = Math.floor(coverLevel * count * count);
                        drawImageSize = (0,_tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__["default"])({
                            originalWidth: this._image.width,
                            originalHeight: this._image.height,
                            maxHiddenDots: maxHiddenDots,
                            maxHiddenAxisDots: count - 14,
                            dotSize: dotSize
                        });
                        _b.label = 2;
                    case 2:
                        this.clear();
                        this.drawBackground();
                        this.drawDots(function (i, j) {
                            var _a, _b, _c, _d, _e, _f;
                            if (_this._options.imageOptions.hideBackgroundDots) {
                                if (i >= (count - drawImageSize.hideXDots) / 2 &&
                                    i < (count + drawImageSize.hideXDots) / 2 &&
                                    j >= (count - drawImageSize.hideYDots) / 2 &&
                                    j < (count + drawImageSize.hideYDots) / 2) {
                                    return false;
                                }
                            }
                            if (((_a = squareMask[i]) === null || _a === void 0 ? void 0 : _a[j]) || ((_b = squareMask[i - count + 7]) === null || _b === void 0 ? void 0 : _b[j]) || ((_c = squareMask[i]) === null || _c === void 0 ? void 0 : _c[j - count + 7])) {
                                return false;
                            }
                            if (((_d = dotMask[i]) === null || _d === void 0 ? void 0 : _d[j]) || ((_e = dotMask[i - count + 7]) === null || _e === void 0 ? void 0 : _e[j]) || ((_f = dotMask[i]) === null || _f === void 0 ? void 0 : _f[j - count + 7])) {
                                return false;
                            }
                            return true;
                        });
                        this.drawCorners();
                        if (this._options.image) {
                            this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count: count, dotSize: dotSize });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRCanvas.prototype.drawBackground = function () {
        var canvasContext = this.context;
        var options = this._options;
        if (canvasContext) {
            if (options.backgroundOptions.gradient) {
                var gradientOptions = options.backgroundOptions.gradient;
                var gradient_1 = this._createGradient({
                    context: canvasContext,
                    options: gradientOptions,
                    additionalRotation: 0,
                    x: 0,
                    y: 0,
                    size: this._canvas.width > this._canvas.height ? this._canvas.width : this._canvas.height
                });
                gradientOptions.colorStops.forEach(function (_a) {
                    var offset = _a.offset, color = _a.color;
                    gradient_1.addColorStop(offset, color);
                });
                canvasContext.fillStyle = gradient_1;
            }
            else if (options.backgroundOptions.color) {
                canvasContext.fillStyle = options.backgroundOptions.color;
            }
            canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    QRCanvas.prototype.drawDots = function (filter) {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var canvasContext = this.context;
        if (!canvasContext) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        if (count > options.width || count > options.height) {
            throw "The canvas is too small.";
        }
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = Math.floor(minSize / count);
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dot = new _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ context: canvasContext, type: options.dotsOptions.type });
        canvasContext.beginPath();
        var _loop_1 = function (i) {
            var _loop_2 = function (j) {
                if (filter && !filter(i, j)) {
                    return "continue";
                }
                if (!this_1._qr.isDark(i, j)) {
                    return "continue";
                }
                dot.draw(xBeginning + i * dotSize, yBeginning + j * dotSize, dotSize, function (xOffset, yOffset) {
                    if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count)
                        return false;
                    if (filter && !filter(i + xOffset, j + yOffset))
                        return false;
                    return !!_this._qr && _this._qr.isDark(i + xOffset, j + yOffset);
                });
            };
            for (var j = 0; j < count; j++) {
                _loop_2(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
        if (options.dotsOptions.gradient) {
            var gradientOptions = options.dotsOptions.gradient;
            var gradient_2 = this._createGradient({
                context: canvasContext,
                options: gradientOptions,
                additionalRotation: 0,
                x: xBeginning,
                y: yBeginning,
                size: count * dotSize
            });
            gradientOptions.colorStops.forEach(function (_a) {
                var offset = _a.offset, color = _a.color;
                gradient_2.addColorStop(offset, color);
            });
            canvasContext.fillStyle = canvasContext.strokeStyle = gradient_2;
        }
        else if (options.dotsOptions.color) {
            canvasContext.fillStyle = canvasContext.strokeStyle = options.dotsOptions.color;
        }
        canvasContext.fill("evenodd");
    };
    QRCanvas.prototype.drawCorners = function (filter) {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var canvasContext = this.context;
        if (!canvasContext) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = Math.floor(minSize / count);
        var cornersSquareSize = dotSize * 7;
        var cornersDotSize = dotSize * 3;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var column = _a[0], row = _a[1], rotation = _a[2];
            if (filter && !filter(column, row)) {
                return;
            }
            var x = xBeginning + column * dotSize * (count - 7);
            var y = yBeginning + row * dotSize * (count - 7);
            if ((_b = options.cornersSquareOptions) === null || _b === void 0 ? void 0 : _b.type) {
                var cornersSquare = new _figures_cornerSquare_canvas_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__["default"]({ context: canvasContext, type: (_c = options.cornersSquareOptions) === null || _c === void 0 ? void 0 : _c.type });
                canvasContext.beginPath();
                cornersSquare.draw(x, y, cornersSquareSize, rotation);
            }
            else {
                var dot = new _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ context: canvasContext, type: options.dotsOptions.type });
                canvasContext.beginPath();
                var _loop_3 = function (i) {
                    var _loop_5 = function (j) {
                        if (!((_d = squareMask[i]) === null || _d === void 0 ? void 0 : _d[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = squareMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                    };
                    for (var j = 0; j < squareMask[i].length; j++) {
                        _loop_5(j);
                    }
                };
                for (var i = 0; i < squareMask.length; i++) {
                    _loop_3(i);
                }
            }
            if ((_e = options.cornersSquareOptions) === null || _e === void 0 ? void 0 : _e.gradient) {
                var gradientOptions = options.cornersSquareOptions.gradient;
                var gradient_3 = _this._createGradient({
                    context: canvasContext,
                    options: gradientOptions,
                    additionalRotation: rotation,
                    x: x,
                    y: y,
                    size: cornersSquareSize
                });
                gradientOptions.colorStops.forEach(function (_a) {
                    var offset = _a.offset, color = _a.color;
                    gradient_3.addColorStop(offset, color);
                });
                canvasContext.fillStyle = canvasContext.strokeStyle = gradient_3;
            }
            else if ((_f = options.cornersSquareOptions) === null || _f === void 0 ? void 0 : _f.color) {
                canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersSquareOptions.color;
            }
            canvasContext.fill("evenodd");
            if ((_g = options.cornersDotOptions) === null || _g === void 0 ? void 0 : _g.type) {
                var cornersDot = new _figures_cornerDot_canvas_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__["default"]({ context: canvasContext, type: (_h = options.cornersDotOptions) === null || _h === void 0 ? void 0 : _h.type });
                canvasContext.beginPath();
                cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
            }
            else {
                var dot = new _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ context: canvasContext, type: options.dotsOptions.type });
                canvasContext.beginPath();
                var _loop_4 = function (i) {
                    var _loop_6 = function (j) {
                        if (!((_j = dotMask[i]) === null || _j === void 0 ? void 0 : _j[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = dotMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                    };
                    for (var j = 0; j < dotMask[i].length; j++) {
                        _loop_6(j);
                    }
                };
                for (var i = 0; i < dotMask.length; i++) {
                    _loop_4(i);
                }
            }
            if ((_k = options.cornersDotOptions) === null || _k === void 0 ? void 0 : _k.gradient) {
                var gradientOptions = options.cornersDotOptions.gradient;
                var gradient_4 = _this._createGradient({
                    context: canvasContext,
                    options: gradientOptions,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    size: cornersDotSize
                });
                gradientOptions.colorStops.forEach(function (_a) {
                    var offset = _a.offset, color = _a.color;
                    gradient_4.addColorStop(offset, color);
                });
                canvasContext.fillStyle = canvasContext.strokeStyle = gradient_4;
            }
            else if ((_l = options.cornersDotOptions) === null || _l === void 0 ? void 0 : _l.color) {
                canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersDotOptions.color;
            }
            canvasContext.fill("evenodd");
        });
    };
    QRCanvas.prototype.loadImage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = _this._options;
            var image = new Image();
            if (!options.image) {
                return reject("Image is not defined");
            }
            if (typeof options.imageOptions.crossOrigin === "string") {
                image.crossOrigin = options.imageOptions.crossOrigin;
            }
            _this._image = image;
            image.onload = function () {
                resolve();
            };
            image.src = options.image;
        });
    };
    QRCanvas.prototype.drawImage = function (_a) {
        var width = _a.width, height = _a.height, count = _a.count, dotSize = _a.dotSize;
        var canvasContext = this.context;
        if (!canvasContext) {
            throw "canvasContext is not defined";
        }
        if (!this._image) {
            throw "image is not defined";
        }
        var options = this._options;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
        var dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
        var dw = width - options.imageOptions.margin * 2;
        var dh = height - options.imageOptions.margin * 2;
        canvasContext.drawImage(this._image, dx, dy, dw < 0 ? 0 : dw, dh < 0 ? 0 : dh);
    };
    QRCanvas.prototype._createGradient = function (_a) {
        var context = _a.context, options = _a.options, additionalRotation = _a.additionalRotation, x = _a.x, y = _a.y, size = _a.size;
        var gradient;
        if (options.type === _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__["default"].radial) {
            gradient = context.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size / 2);
        }
        else {
            var rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
            var positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
            var x0 = x + size / 2;
            var y0 = y + size / 2;
            var x1 = x + size / 2;
            var y1 = y + size / 2;
            if ((positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)) {
                x0 = x0 - size / 2;
                y0 = y0 - (size / 2) * Math.tan(rotation);
                x1 = x1 + size / 2;
                y1 = y1 + (size / 2) * Math.tan(rotation);
            }
            else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                y0 = y0 - size / 2;
                x0 = x0 - size / 2 / Math.tan(rotation);
                y1 = y1 + size / 2;
                x1 = x1 + size / 2 / Math.tan(rotation);
            }
            else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                x0 = x0 + size / 2;
                y0 = y0 + (size / 2) * Math.tan(rotation);
                x1 = x1 - size / 2;
                y1 = y1 - (size / 2) * Math.tan(rotation);
            }
            else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                y0 = y0 + size / 2;
                x0 = x0 + size / 2 / Math.tan(rotation);
                y1 = y1 - size / 2;
                x1 = x1 - size / 2 / Math.tan(rotation);
            }
            gradient = context.createLinearGradient(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1));
        }
        return gradient;
    };
    return QRCanvas;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCanvas);


/***/ }),

/***/ "./src/core/QRCodeStyling.ts":
/*!***********************************!*\
  !*** ./src/core/QRCodeStyling.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_getMode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/getMode */ "./src/tools/getMode.ts");
/* harmony import */ var _tools_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/merge */ "./src/tools/merge.ts");
/* harmony import */ var _tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tools/downloadURI */ "./src/tools/downloadURI.ts");
/* harmony import */ var _QRCanvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QRCanvas */ "./src/core/QRCanvas.ts");
/* harmony import */ var _QRSVG__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./QRSVG */ "./src/core/QRSVG.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _QROptions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./QROptions */ "./src/core/QROptions.ts");
/* harmony import */ var _tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../tools/sanitizeOptions */ "./src/tools/sanitizeOptions.ts");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! qrcode-generator */ "./node_modules/qrcode-generator/qrcode.js");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(qrcode_generator__WEBPACK_IMPORTED_MODULE_8__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};









var QRCodeStyling = /** @class */ (function () {
    function QRCodeStyling(options) {
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(_QROptions__WEBPACK_IMPORTED_MODULE_6__["default"], options)) : _QROptions__WEBPACK_IMPORTED_MODULE_6__["default"];
        this.update();
    }
    QRCodeStyling._clearContainer = function (container) {
        if (container) {
            container.innerHTML = "";
        }
    };
    QRCodeStyling.prototype._getQRStylingElement = function (extension) {
        if (extension === void 0) { extension = "png"; }
        return __awaiter(this, void 0, void 0, function () {
            var promise, svg, promise, canvas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        if (!(extension.toLowerCase() === "svg")) return [3 /*break*/, 2];
                        promise = void 0, svg = void 0;
                        if (this._svg && this._svgDrawingPromise) {
                            svg = this._svg;
                            promise = this._svgDrawingPromise;
                        }
                        else {
                            svg = new _QRSVG__WEBPACK_IMPORTED_MODULE_4__["default"](this._options);
                            promise = svg.drawQR(this._qr);
                        }
                        return [4 /*yield*/, promise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, svg];
                    case 2:
                        promise = void 0, canvas = void 0;
                        if (this._canvas && this._canvasDrawingPromise) {
                            canvas = this._canvas;
                            promise = this._canvasDrawingPromise;
                        }
                        else {
                            canvas = new _QRCanvas__WEBPACK_IMPORTED_MODULE_3__["default"](this._options);
                            promise = canvas.drawQR(this._qr);
                        }
                        return [4 /*yield*/, promise];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, canvas];
                }
            });
        });
    };
    QRCodeStyling.prototype.update = function (options) {
        QRCodeStyling._clearContainer(this._container);
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(this._options, options)) : this._options;
        if (!this._options.data) {
            return;
        }
        this._qr = qrcode_generator__WEBPACK_IMPORTED_MODULE_8___default()(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
        this._qr.addData(this._options.data, this._options.qrOptions.mode || (0,_tools_getMode__WEBPACK_IMPORTED_MODULE_0__["default"])(this._options.data));
        this._qr.make();
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_5__["default"].canvas) {
            this._canvas = new _QRCanvas__WEBPACK_IMPORTED_MODULE_3__["default"](this._options);
            this._canvasDrawingPromise = this._canvas.drawQR(this._qr);
            this._svgDrawingPromise = undefined;
            this._svg = undefined;
        }
        else {
            this._svg = new _QRSVG__WEBPACK_IMPORTED_MODULE_4__["default"](this._options);
            this._svgDrawingPromise = this._svg.drawQR(this._qr);
            this._canvasDrawingPromise = undefined;
            this._canvas = undefined;
        }
        this.append(this._container);
    };
    QRCodeStyling.prototype.append = function (container) {
        if (!container) {
            return;
        }
        if (typeof container.appendChild !== "function") {
            throw "Container should be a single DOM node";
        }
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_5__["default"].canvas) {
            if (this._canvas) {
                container.appendChild(this._canvas.getCanvas());
            }
        }
        else {
            if (this._svg) {
                container.appendChild(this._svg.getElement());
            }
        }
        this._container = container;
    };
    QRCodeStyling.prototype.getRawData = function (extension) {
        if (extension === void 0) { extension = "png"; }
        return __awaiter(this, void 0, void 0, function () {
            var element, serializer, source;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        return [4 /*yield*/, this._getQRStylingElement(extension)];
                    case 1:
                        element = _a.sent();
                        if (extension.toLowerCase() === "svg") {
                            serializer = new XMLSerializer();
                            source = serializer.serializeToString(element.getElement());
                            return [2 /*return*/, new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + source], { type: "image/svg+xml" })];
                        }
                        else {
                            return [2 /*return*/, new Promise(function (resolve) {
                                    return element.getCanvas().toBlob(resolve, "image/".concat(extension), 1);
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRCodeStyling.prototype.download = function (downloadOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var extension, name, element, serializer, source, url, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        extension = "png";
                        name = "qr";
                        //TODO remove deprecated code in the v2
                        if (typeof downloadOptions === "string") {
                            extension = downloadOptions;
                            console.warn("Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument");
                        }
                        else if (typeof downloadOptions === "object" && downloadOptions !== null) {
                            if (downloadOptions.name) {
                                name = downloadOptions.name;
                            }
                            if (downloadOptions.extension) {
                                extension = downloadOptions.extension;
                            }
                        }
                        return [4 /*yield*/, this._getQRStylingElement(extension)];
                    case 1:
                        element = _a.sent();
                        if (extension.toLowerCase() === "svg") {
                            serializer = new XMLSerializer();
                            source = serializer.serializeToString(element.getElement());
                            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                            url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, "".concat(name, ".svg"));
                        }
                        else {
                            url = element.getCanvas().toDataURL("image/".concat(extension));
                            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, "".concat(name, ".").concat(extension));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return QRCodeStyling;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCodeStyling);


/***/ }),

/***/ "./src/core/QROptions.ts":
/*!*******************************!*\
  !*** ./src/core/QROptions.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");



var defaultOptions = {
    type: _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__["default"].canvas,
    width: 300,
    height: 300,
    data: "",
    margin: 0,
    qrOptions: {
        typeNumber: _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__["default"][0],
        mode: undefined,
        errorCorrectionLevel: _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_2__["default"].Q
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        crossOrigin: undefined,
        margin: 0
    },
    dotsOptions: {
        type: "square",
        color: "#000"
    },
    backgroundOptions: {
        color: "#fff"
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (defaultOptions);


/***/ }),

/***/ "./src/core/QRSVG.ts":
/*!***************************!*\
  !*** ./src/core/QRSVG.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/calculateImageSize */ "./src/tools/calculateImageSize.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../figures/dot/svg/QRDot */ "./src/figures/dot/svg/QRDot.ts");
/* harmony import */ var _figures_cornerSquare_svg_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../figures/cornerSquare/svg/QRCornerSquare */ "./src/figures/cornerSquare/svg/QRCornerSquare.ts");
/* harmony import */ var _figures_cornerDot_svg_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../figures/cornerDot/svg/QRCornerDot */ "./src/figures/cornerDot/svg/QRCornerDot.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/gradientTypes */ "./src/constants/gradientTypes.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
var dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
var QRSVG = /** @class */ (function () {
    //TODO don't pass all options to this class
    function QRSVG(options) {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._element.setAttribute("width", String(options.width));
        this._element.setAttribute("height", String(options.height));
        this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this._element.appendChild(this._defs);
        this._options = options;
    }
    Object.defineProperty(QRSVG.prototype, "width", {
        get: function () {
            return this._options.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRSVG.prototype, "height", {
        get: function () {
            return this._options.height;
        },
        enumerable: false,
        configurable: true
    });
    QRSVG.prototype.getElement = function () {
        return this._element;
    };
    QRSVG.prototype.clear = function () {
        var _a;
        var oldElement = this._element;
        this._element = oldElement.cloneNode(false);
        (_a = oldElement === null || oldElement === void 0 ? void 0 : oldElement.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(this._element, oldElement);
        this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this._element.appendChild(this._defs);
    };
    QRSVG.prototype.drawQR = function (qr) {
        return __awaiter(this, void 0, void 0, function () {
            var count, minSize, dotSize, drawImageSize, _a, imageOptions, qrOptions, coverLevel, maxHiddenDots;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        count = qr.getModuleCount();
                        minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
                        dotSize = minSize / count;
                        drawImageSize = {
                            hideXDots: 0,
                            hideYDots: 0,
                            width: 0,
                            height: 0
                        };
                        this._qr = qr;
                        if (!this._options.image) return [3 /*break*/, 2];
                        //We need it to get image size
                        return [4 /*yield*/, this.loadImage()];
                    case 1:
                        //We need it to get image size
                        _b.sent();
                        if (!this._image)
                            return [2 /*return*/];
                        _a = this._options, imageOptions = _a.imageOptions, qrOptions = _a.qrOptions;
                        coverLevel = imageOptions.imageSize * _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__["default"][qrOptions.errorCorrectionLevel];
                        maxHiddenDots = Math.floor(coverLevel * count * count);
                        drawImageSize = (0,_tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__["default"])({
                            originalWidth: this._image.width,
                            originalHeight: this._image.height,
                            maxHiddenDots: maxHiddenDots,
                            maxHiddenAxisDots: count - 14,
                            dotSize: dotSize
                        });
                        _b.label = 2;
                    case 2:
                        this.clear();
                        this.drawBackground();
                        this.drawDots(function (i, j) {
                            var _a, _b, _c, _d, _e, _f;
                            if (_this._options.imageOptions.hideBackgroundDots) {
                                if (i >= (count - drawImageSize.hideXDots) / 2 &&
                                    i < (count + drawImageSize.hideXDots) / 2 &&
                                    j >= (count - drawImageSize.hideYDots) / 2 &&
                                    j < (count + drawImageSize.hideYDots) / 2) {
                                    return false;
                                }
                            }
                            if (((_a = squareMask[i]) === null || _a === void 0 ? void 0 : _a[j]) || ((_b = squareMask[i - count + 7]) === null || _b === void 0 ? void 0 : _b[j]) || ((_c = squareMask[i]) === null || _c === void 0 ? void 0 : _c[j - count + 7])) {
                                return false;
                            }
                            if (((_d = dotMask[i]) === null || _d === void 0 ? void 0 : _d[j]) || ((_e = dotMask[i - count + 7]) === null || _e === void 0 ? void 0 : _e[j]) || ((_f = dotMask[i]) === null || _f === void 0 ? void 0 : _f[j - count + 7])) {
                                return false;
                            }
                            return true;
                        });
                        this.drawCorners();
                        if (this._options.image) {
                            this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count: count, dotSize: dotSize });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRSVG.prototype.drawBackground = function () {
        var _a, _b;
        var element = this._element;
        var options = this._options;
        if (element) {
            var gradientOptions = (_a = options.backgroundOptions) === null || _a === void 0 ? void 0 : _a.gradient;
            var color = (_b = options.backgroundOptions) === null || _b === void 0 ? void 0 : _b.color;
            if (gradientOptions || color) {
                this._createColor({
                    options: gradientOptions,
                    color: color,
                    additionalRotation: 0,
                    x: 0,
                    y: 0,
                    height: options.height,
                    width: options.width,
                    name: "background-color"
                });
            }
        }
    };
    QRSVG.prototype.drawDots = function (filter) {
        var _this = this;
        var _a, _b;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        if (count > options.width || count > options.height) {
            throw "The canvas is too small.";
        }
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = minSize / count;
        var xBeginning = (options.width - count * dotSize) / 2;
        var yBeginning = (options.height - count * dotSize) / 2;
        var dot = new _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ svg: this._element, type: options.dotsOptions.type });
        this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        this._dotsClipPath.setAttribute("id", "clip-path-dot-color");
        this._defs.appendChild(this._dotsClipPath);
        this._createColor({
            options: (_a = options.dotsOptions) === null || _a === void 0 ? void 0 : _a.gradient,
            color: options.dotsOptions.color,
            additionalRotation: 0,
            x: xBeginning,
            y: yBeginning,
            height: count * dotSize,
            width: count * dotSize,
            name: "dot-color"
        });
        var _loop_1 = function (i) {
            var _loop_2 = function (j) {
                if (filter && !filter(i, j)) {
                    return "continue";
                }
                if (!((_b = this_1._qr) === null || _b === void 0 ? void 0 : _b.isDark(i, j))) {
                    return "continue";
                }
                dot.draw(xBeginning + i * dotSize, yBeginning + j * dotSize, dotSize, function (xOffset, yOffset) {
                    if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count)
                        return false;
                    if (filter && !filter(i + xOffset, j + yOffset))
                        return false;
                    return !!_this._qr && _this._qr.isDark(i + xOffset, j + yOffset);
                });
                if (dot._element && this_1._dotsClipPath) {
                    this_1._dotsClipPath.appendChild(dot._element);
                }
            };
            for (var j = 0; j < count; j++) {
                _loop_2(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
    };
    QRSVG.prototype.drawCorners = function () {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var element = this._element;
        var options = this._options;
        if (!element) {
            throw "Element code is not defined";
        }
        var count = this._qr.getModuleCount();
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = minSize / count;
        var cornersSquareSize = dotSize * 7;
        var cornersDotSize = dotSize * 3;
        var xBeginning = (options.width - count * dotSize) / 2;
        var yBeginning = (options.height - count * dotSize) / 2;
        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            var column = _a[0], row = _a[1], rotation = _a[2];
            var x = xBeginning + column * dotSize * (count - 7);
            var y = yBeginning + row * dotSize * (count - 7);
            var cornersSquareClipPath = _this._dotsClipPath;
            var cornersDotClipPath = _this._dotsClipPath;
            if (((_b = options.cornersSquareOptions) === null || _b === void 0 ? void 0 : _b.gradient) || ((_c = options.cornersSquareOptions) === null || _c === void 0 ? void 0 : _c.color)) {
                cornersSquareClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                cornersSquareClipPath.setAttribute("id", "clip-path-corners-square-color-".concat(column, "-").concat(row));
                _this._defs.appendChild(cornersSquareClipPath);
                _this._cornersSquareClipPath = _this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;
                _this._createColor({
                    options: (_d = options.cornersSquareOptions) === null || _d === void 0 ? void 0 : _d.gradient,
                    color: (_e = options.cornersSquareOptions) === null || _e === void 0 ? void 0 : _e.color,
                    additionalRotation: rotation,
                    x: x,
                    y: y,
                    height: cornersSquareSize,
                    width: cornersSquareSize,
                    name: "corners-square-color-".concat(column, "-").concat(row)
                });
            }
            if ((_f = options.cornersSquareOptions) === null || _f === void 0 ? void 0 : _f.type) {
                var cornersSquare = new _figures_cornerSquare_svg_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: _this._element, type: options.cornersSquareOptions.type });
                cornersSquare.draw(x, y, cornersSquareSize, rotation);
                if (cornersSquare._element && cornersSquareClipPath) {
                    cornersSquareClipPath.appendChild(cornersSquare._element);
                }
            }
            else {
                var dot = new _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ svg: _this._element, type: options.dotsOptions.type });
                var _loop_3 = function (i) {
                    var _loop_5 = function (j) {
                        if (!((_g = squareMask[i]) === null || _g === void 0 ? void 0 : _g[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = squareMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                        if (dot._element && cornersSquareClipPath) {
                            cornersSquareClipPath.appendChild(dot._element);
                        }
                    };
                    for (var j = 0; j < squareMask[i].length; j++) {
                        _loop_5(j);
                    }
                };
                for (var i = 0; i < squareMask.length; i++) {
                    _loop_3(i);
                }
            }
            if (((_h = options.cornersDotOptions) === null || _h === void 0 ? void 0 : _h.gradient) || ((_j = options.cornersDotOptions) === null || _j === void 0 ? void 0 : _j.color)) {
                cornersDotClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                cornersDotClipPath.setAttribute("id", "clip-path-corners-dot-color-".concat(column, "-").concat(row));
                _this._defs.appendChild(cornersDotClipPath);
                _this._cornersDotClipPath = cornersDotClipPath;
                _this._createColor({
                    options: (_k = options.cornersDotOptions) === null || _k === void 0 ? void 0 : _k.gradient,
                    color: (_l = options.cornersDotOptions) === null || _l === void 0 ? void 0 : _l.color,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    height: cornersDotSize,
                    width: cornersDotSize,
                    name: "corners-dot-color-".concat(column, "-").concat(row)
                });
            }
            if ((_m = options.cornersDotOptions) === null || _m === void 0 ? void 0 : _m.type) {
                var cornersDot = new _figures_cornerDot_svg_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__["default"]({ svg: _this._element, type: options.cornersDotOptions.type });
                cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
                if (cornersDot._element && cornersDotClipPath) {
                    cornersDotClipPath.appendChild(cornersDot._element);
                }
            }
            else {
                var dot = new _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ svg: _this._element, type: options.dotsOptions.type });
                var _loop_4 = function (i) {
                    var _loop_6 = function (j) {
                        if (!((_o = dotMask[i]) === null || _o === void 0 ? void 0 : _o[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = dotMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                        if (dot._element && cornersDotClipPath) {
                            cornersDotClipPath.appendChild(dot._element);
                        }
                    };
                    for (var j = 0; j < dotMask[i].length; j++) {
                        _loop_6(j);
                    }
                };
                for (var i = 0; i < dotMask.length; i++) {
                    _loop_4(i);
                }
            }
        });
    };
    QRSVG.prototype.loadImage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = _this._options;
            var image = new Image();
            if (!options.image) {
                return reject("Image is not defined");
            }
            if (typeof options.imageOptions.crossOrigin === "string") {
                image.crossOrigin = options.imageOptions.crossOrigin;
            }
            _this._image = image;
            image.onload = function () {
                resolve();
            };
            image.src = options.image;
        });
    };
    QRSVG.prototype.drawImage = function (_a) {
        var width = _a.width, height = _a.height, count = _a.count, dotSize = _a.dotSize;
        var options = this._options;
        var xBeginning = (options.width - count * dotSize) / 2;
        var yBeginning = (options.height - count * dotSize) / 2;
        var dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
        var dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
        var dw = width - options.imageOptions.margin * 2;
        var dh = height - options.imageOptions.margin * 2;
        var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("href", options.image || "");
        image.setAttribute("x", String(dx));
        image.setAttribute("y", String(dy));
        image.setAttribute("width", "".concat(dw, "px"));
        image.setAttribute("height", "".concat(dh, "px"));
        this._element.appendChild(image);
    };
    QRSVG.prototype._createColor = function (_a) {
        var options = _a.options, color = _a.color, additionalRotation = _a.additionalRotation, x = _a.x, y = _a.y, height = _a.height, width = _a.width, name = _a.name;
        var size = width > height ? width : height;
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("height", String(height));
        rect.setAttribute("width", String(width));
        rect.setAttribute("clip-path", "url('#clip-path-".concat(name, "')"));
        if (options) {
            var gradient_1;
            if (options.type === _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__["default"].radial) {
                gradient_1 = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
                gradient_1.setAttribute("id", name);
                gradient_1.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient_1.setAttribute("fx", String(x + width / 2));
                gradient_1.setAttribute("fy", String(y + height / 2));
                gradient_1.setAttribute("cx", String(x + width / 2));
                gradient_1.setAttribute("cy", String(y + height / 2));
                gradient_1.setAttribute("r", String(size / 2));
            }
            else {
                var rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
                var positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
                var x0 = x + width / 2;
                var y0 = y + height / 2;
                var x1 = x + width / 2;
                var y1 = y + height / 2;
                if ((positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                    (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)) {
                    x0 = x0 - width / 2;
                    y0 = y0 - (height / 2) * Math.tan(rotation);
                    x1 = x1 + width / 2;
                    y1 = y1 + (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                    y0 = y0 - height / 2;
                    x0 = x0 - width / 2 / Math.tan(rotation);
                    y1 = y1 + height / 2;
                    x1 = x1 + width / 2 / Math.tan(rotation);
                }
                else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                    x0 = x0 + width / 2;
                    y0 = y0 + (height / 2) * Math.tan(rotation);
                    x1 = x1 - width / 2;
                    y1 = y1 - (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                    y0 = y0 + height / 2;
                    x0 = x0 + width / 2 / Math.tan(rotation);
                    y1 = y1 - height / 2;
                    x1 = x1 - width / 2 / Math.tan(rotation);
                }
                gradient_1 = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                gradient_1.setAttribute("id", name);
                gradient_1.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient_1.setAttribute("x1", String(Math.round(x0)));
                gradient_1.setAttribute("y1", String(Math.round(y0)));
                gradient_1.setAttribute("x2", String(Math.round(x1)));
                gradient_1.setAttribute("y2", String(Math.round(y1)));
            }
            options.colorStops.forEach(function (_a) {
                var offset = _a.offset, color = _a.color;
                var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                stop.setAttribute("offset", "".concat(100 * offset, "%"));
                stop.setAttribute("stop-color", color);
                gradient_1.appendChild(stop);
            });
            rect.setAttribute("fill", "url('#".concat(name, "')"));
            this._defs.appendChild(gradient_1);
        }
        else if (color) {
            rect.setAttribute("fill", color);
        }
        this._element.appendChild(rect);
    };
    return QRSVG;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRSVG);


/***/ }),

/***/ "./src/figures/cornerDot/canvas/QRCornerDot.ts":
/*!*****************************************************!*\
  !*** ./src/figures/cornerDot/canvas/QRCornerDot.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerDot = /** @class */ (function () {
    function QRCornerDot(_a) {
        var context = _a.context, type = _a.type;
        this._context = context;
        this._type = type;
    }
    QRCornerDot.prototype.draw = function (x, y, size, rotation) {
        var context = this._context;
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerDot.prototype._rotateFigure = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        context.translate(cx, cy);
        rotation && context.rotate(rotation);
        draw();
        context.closePath();
        rotation && context.rotate(-rotation);
        context.translate(-cx, -cy);
    };
    QRCornerDot.prototype._basicDot = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, 0, Math.PI * 2);
            } }));
    };
    QRCornerDot.prototype._basicSquare = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.rect(-size / 2, -size / 2, size, size);
            } }));
    };
    QRCornerDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    return QRCornerDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerDot);


/***/ }),

/***/ "./src/figures/cornerDot/svg/QRCornerDot.ts":
/*!**************************************************!*\
  !*** ./src/figures/cornerDot/svg/QRCornerDot.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerDot = /** @class */ (function () {
    function QRCornerDot(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRCornerDot.prototype.draw = function (x, y, size, rotation) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRCornerDot.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                _this._element.setAttribute("cx", String(x + size / 2));
                _this._element.setAttribute("cy", String(y + size / 2));
                _this._element.setAttribute("r", String(size / 2));
            } }));
    };
    QRCornerDot.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                _this._element.setAttribute("x", String(x));
                _this._element.setAttribute("y", String(y));
                _this._element.setAttribute("width", String(size));
                _this._element.setAttribute("height", String(size));
            } }));
    };
    QRCornerDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, rotation: rotation });
    };
    return QRCornerDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerDot);


/***/ }),

/***/ "./src/figures/cornerSquare/canvas/QRCornerSquare.ts":
/*!***********************************************************!*\
  !*** ./src/figures/cornerSquare/canvas/QRCornerSquare.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerSquare = /** @class */ (function () {
    function QRCornerSquare(_a) {
        var context = _a.context, type = _a.type;
        this._context = context;
        this._type = type;
    }
    QRCornerSquare.prototype.draw = function (x, y, size, rotation) {
        var context = this._context;
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerSquare.prototype._rotateFigure = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        context.translate(cx, cy);
        rotation && context.rotate(rotation);
        draw();
        context.closePath();
        rotation && context.rotate(-rotation);
        context.translate(-cx, -cy);
    };
    QRCornerSquare.prototype._basicDot = function (args) {
        var size = args.size, context = args.context;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, 0, Math.PI * 2);
                context.arc(0, 0, size / 2 - dotSize, 0, Math.PI * 2);
            } }));
    };
    QRCornerSquare.prototype._basicSquare = function (args) {
        var size = args.size, context = args.context;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.rect(-size / 2, -size / 2, size, size);
                context.rect(-size / 2 + dotSize, -size / 2 + dotSize, size - 2 * dotSize, size - 2 * dotSize);
            } }));
    };
    QRCornerSquare.prototype._basicExtraRounded = function (args) {
        var size = args.size, context = args.context;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(-dotSize, -dotSize, 2.5 * dotSize, Math.PI, -Math.PI / 2);
                context.lineTo(dotSize, -3.5 * dotSize);
                context.arc(dotSize, -dotSize, 2.5 * dotSize, -Math.PI / 2, 0);
                context.lineTo(3.5 * dotSize, -dotSize);
                context.arc(dotSize, dotSize, 2.5 * dotSize, 0, Math.PI / 2);
                context.lineTo(-dotSize, 3.5 * dotSize);
                context.arc(-dotSize, dotSize, 2.5 * dotSize, Math.PI / 2, Math.PI);
                context.lineTo(-3.5 * dotSize, -dotSize);
                context.arc(-dotSize, -dotSize, 1.5 * dotSize, Math.PI, -Math.PI / 2);
                context.lineTo(dotSize, -2.5 * dotSize);
                context.arc(dotSize, -dotSize, 1.5 * dotSize, -Math.PI / 2, 0);
                context.lineTo(2.5 * dotSize, -dotSize);
                context.arc(dotSize, dotSize, 1.5 * dotSize, 0, Math.PI / 2);
                context.lineTo(-dotSize, 2.5 * dotSize);
                context.arc(-dotSize, dotSize, 1.5 * dotSize, Math.PI / 2, Math.PI);
                context.lineTo(-2.5 * dotSize, -dotSize);
            } }));
    };
    QRCornerSquare.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerSquare.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerSquare.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicExtraRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    return QRCornerSquare;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerSquare);


/***/ }),

/***/ "./src/figures/cornerSquare/svg/QRCornerSquare.ts":
/*!********************************************************!*\
  !*** ./src/figures/cornerSquare/svg/QRCornerSquare.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerSquare = /** @class */ (function () {
    function QRCornerSquare(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRCornerSquare.prototype.draw = function (x, y, size, rotation) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRCornerSquare.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x + size / 2, " ").concat(y) + // M cx, y //  Move to top of ring
                    "a ".concat(size / 2, " ").concat(size / 2, " 0 1 0 0.1 0") + // a outerRadius, outerRadius, 0, 1, 0, 1, 0 // Draw outer arc, but don't close it
                    "z" + // Z // Close the outer shape
                    "m 0 ".concat(dotSize) + // m -1 outerRadius-innerRadius // Move to top point of inner radius
                    "a ".concat(size / 2 - dotSize, " ").concat(size / 2 - dotSize, " 0 1 1 -0.1 0") + // a innerRadius, innerRadius, 0, 1, 1, -1, 0 // Draw inner arc, but don't close it
                    "Z" // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
                );
            } }));
    };
    QRCornerSquare.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) +
                    "v ".concat(size) +
                    "h ".concat(size) +
                    "v ".concat(-size) +
                    "z" +
                    "M ".concat(x + dotSize, " ").concat(y + dotSize) +
                    "h ".concat(size - 2 * dotSize) +
                    "v ".concat(size - 2 * dotSize) +
                    "h ".concat(-size + 2 * dotSize) +
                    "z");
            } }));
    };
    QRCornerSquare.prototype._basicExtraRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y + 2.5 * dotSize) +
                    "v ".concat(2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(dotSize * 2.5, " ").concat(dotSize * 2.5) +
                    "h ".concat(2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(dotSize * 2.5, " ").concat(-dotSize * 2.5) +
                    "v ".concat(-2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(-dotSize * 2.5, " ").concat(-dotSize * 2.5) +
                    "h ".concat(-2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(-dotSize * 2.5, " ").concat(dotSize * 2.5) +
                    "M ".concat(x + 2.5 * dotSize, " ").concat(y + dotSize) +
                    "h ".concat(2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(dotSize * 1.5, " ").concat(dotSize * 1.5) +
                    "v ".concat(2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(-dotSize * 1.5, " ").concat(dotSize * 1.5) +
                    "h ".concat(-2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(-dotSize * 1.5, " ").concat(-dotSize * 1.5) +
                    "v ".concat(-2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(dotSize * 1.5, " ").concat(-dotSize * 1.5));
            } }));
    };
    QRCornerSquare.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicExtraRounded({ x: x, y: y, size: size, rotation: rotation });
    };
    return QRCornerSquare;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerSquare);


/***/ }),

/***/ "./src/figures/dot/canvas/QRDot.ts":
/*!*****************************************!*\
  !*** ./src/figures/dot/canvas/QRDot.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/dotTypes */ "./src/constants/dotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRDot = /** @class */ (function () {
    function QRDot(_a) {
        var context = _a.context, type = _a.type;
        this._context = context;
        this._type = type;
    }
    QRDot.prototype.draw = function (x, y, size, getNeighbor) {
        var context = this._context;
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dots:
                drawFunction = this._drawDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classy:
                drawFunction = this._drawClassy;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classyRounded:
                drawFunction = this._drawClassyRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].rounded:
                drawFunction = this._drawRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
            default:
                drawFunction = this._drawSquare;
        }
        drawFunction.call(this, { x: x, y: y, size: size, context: context, getNeighbor: getNeighbor });
    };
    QRDot.prototype._rotateFigure = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        context.translate(cx, cy);
        rotation && context.rotate(rotation);
        draw();
        context.closePath();
        rotation && context.rotate(-rotation);
        context.translate(-cx, -cy);
    };
    QRDot.prototype._basicDot = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, 0, Math.PI * 2);
            } }));
    };
    QRDot.prototype._basicSquare = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.rect(-size / 2, -size / 2, size, size);
            } }));
    };
    //if rotation === 0 - right side is rounded
    QRDot.prototype._basicSideRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, -Math.PI / 2, Math.PI / 2);
                context.lineTo(-size / 2, size / 2);
                context.lineTo(-size / 2, -size / 2);
                context.lineTo(0, -size / 2);
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, -Math.PI / 2, 0);
                context.lineTo(size / 2, size / 2);
                context.lineTo(-size / 2, size / 2);
                context.lineTo(-size / 2, -size / 2);
                context.lineTo(0, -size / 2);
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerExtraRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
                context.lineTo(-size / 2, size / 2);
                context.lineTo(-size / 2, -size / 2);
            } }));
    };
    QRDot.prototype._basicCornersRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, -Math.PI / 2, 0);
                context.lineTo(size / 2, size / 2);
                context.lineTo(0, size / 2);
                context.arc(0, 0, size / 2, Math.PI / 2, Math.PI);
                context.lineTo(-size / 2, -size / 2);
                context.lineTo(0, -size / 2);
            } }));
    };
    QRDot.prototype._basicCornersExtraRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
                context.arc(size / 2, -size / 2, size, Math.PI / 2, Math.PI);
            } }));
    };
    QRDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context;
        this._basicDot({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    QRDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context;
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    QRDot.prototype._drawRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerExtraRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawClassy = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, context: context, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    QRDot.prototype._drawClassyRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, context: context, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    return QRDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRDot);


/***/ }),

/***/ "./src/figures/dot/svg/QRDot.ts":
/*!**************************************!*\
  !*** ./src/figures/dot/svg/QRDot.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/dotTypes */ "./src/constants/dotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRDot = /** @class */ (function () {
    function QRDot(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRDot.prototype.draw = function (x, y, size, getNeighbor) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dots:
                drawFunction = this._drawDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classy:
                drawFunction = this._drawClassy;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classyRounded:
                drawFunction = this._drawClassyRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].rounded:
                drawFunction = this._drawRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
            default:
                drawFunction = this._drawSquare;
        }
        drawFunction.call(this, { x: x, y: y, size: size, getNeighbor: getNeighbor });
    };
    QRDot.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRDot.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                _this._element.setAttribute("cx", String(x + size / 2));
                _this._element.setAttribute("cy", String(y + size / 2));
                _this._element.setAttribute("r", String(size / 2));
            } }));
    };
    QRDot.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                _this._element.setAttribute("x", String(x));
                _this._element.setAttribute("y", String(y));
                _this._element.setAttribute("width", String(size));
                _this._element.setAttribute("height", String(size));
            } }));
    };
    //if rotation === 0 - right side is rounded
    QRDot.prototype._basicSideRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size / 2) + //draw line to left bottom corner + half of size right
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, 0 ").concat(-size) // draw rounded corner
                );
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size) + //draw line to right bottom corner
                    "v ".concat(-size / 2) + //draw line to right bottom corner + half of size top
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(-size / 2, " ").concat(-size / 2) // draw rounded corner
                );
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerExtraRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size) + //draw line to right bottom corner
                    "a ".concat(size, " ").concat(size, ", 0, 0, 0, ").concat(-size, " ").concat(-size) // draw rounded top right corner
                );
            } }));
    };
    //if rotation === 0 - left bottom and right top corners are rounded
    QRDot.prototype._basicCornersRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to left top position
                    "v ".concat(size / 2) + //draw line to left top corner + half of size bottom
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(size / 2, " ").concat(size / 2) + // draw rounded left bottom corner
                    "h ".concat(size / 2) + //draw line to right bottom corner
                    "v ".concat(-size / 2) + //draw line to right bottom corner + half of size top
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(-size / 2, " ").concat(-size / 2) // draw rounded right top corner
                );
            } }));
    };
    QRDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        this._basicDot({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawClassy = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawClassyRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    return QRDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRDot);


/***/ }),

/***/ "./src/tools/calculateImageSize.ts":
/*!*****************************************!*\
  !*** ./src/tools/calculateImageSize.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ calculateImageSize)
/* harmony export */ });
function calculateImageSize(_a) {
    var originalHeight = _a.originalHeight, originalWidth = _a.originalWidth, maxHiddenDots = _a.maxHiddenDots, maxHiddenAxisDots = _a.maxHiddenAxisDots, dotSize = _a.dotSize;
    var hideDots = { x: 0, y: 0 };
    var imageSize = { x: 0, y: 0 };
    if (originalHeight <= 0 || originalWidth <= 0 || maxHiddenDots <= 0 || dotSize <= 0) {
        return {
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        };
    }
    var k = originalHeight / originalWidth;
    //Getting the maximum possible axis hidden dots
    hideDots.x = Math.floor(Math.sqrt(maxHiddenDots / k));
    //The count of hidden dot's can't be less than 1
    if (hideDots.x <= 0)
        hideDots.x = 1;
    //Check the limit of the maximum allowed axis hidden dots
    if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.x)
        hideDots.x = maxHiddenAxisDots;
    //The count of dots should be odd
    if (hideDots.x % 2 === 0)
        hideDots.x--;
    imageSize.x = hideDots.x * dotSize;
    //Calculate opposite axis hidden dots based on axis value.
    //The value will be odd.
    //We use ceil to prevent dots covering by the image.
    hideDots.y = 1 + 2 * Math.ceil((hideDots.x * k - 1) / 2);
    imageSize.y = Math.round(imageSize.x * k);
    //If the result dots count is bigger than max - then decrease size and calculate again
    if (hideDots.y * hideDots.x > maxHiddenDots || (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y)) {
        if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y) {
            hideDots.y = maxHiddenAxisDots;
            if (hideDots.y % 2 === 0)
                hideDots.x--;
        }
        else {
            hideDots.y -= 2;
        }
        imageSize.y = hideDots.y * dotSize;
        hideDots.x = 1 + 2 * Math.ceil((hideDots.y / k - 1) / 2);
        imageSize.x = Math.round(imageSize.y / k);
    }
    return {
        height: imageSize.y,
        width: imageSize.x,
        hideYDots: hideDots.y,
        hideXDots: hideDots.x
    };
}


/***/ }),

/***/ "./src/tools/downloadURI.ts":
/*!**********************************!*\
  !*** ./src/tools/downloadURI.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ downloadURI)
/* harmony export */ });
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/***/ }),

/***/ "./src/tools/getMode.ts":
/*!******************************!*\
  !*** ./src/tools/getMode.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getMode)
/* harmony export */ });
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/modes */ "./src/constants/modes.ts");

function getMode(data) {
    switch (true) {
        case /^[0-9]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].numeric;
        case /^[0-9A-Z $%*+\-./:]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].alphanumeric;
        default:
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].byte;
    }
}


/***/ }),

/***/ "./src/tools/merge.ts":
/*!****************************!*\
  !*** ./src/tools/merge.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mergeDeep)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var isObject = function (obj) { return !!obj && typeof obj === "object" && !Array.isArray(obj); };
function mergeDeep(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (!sources.length)
        return target;
    var source = sources.shift();
    if (source === undefined || !isObject(target) || !isObject(source))
        return target;
    target = __assign({}, target);
    Object.keys(source).forEach(function (key) {
        var targetValue = target[key];
        var sourceValue = source[key];
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        }
        else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
        }
        else {
            target[key] = sourceValue;
        }
    });
    return mergeDeep.apply(void 0, __spreadArray([target], sources, false));
}


/***/ }),

/***/ "./src/tools/sanitizeOptions.ts":
/*!**************************************!*\
  !*** ./src/tools/sanitizeOptions.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sanitizeOptions)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function sanitizeGradient(gradient) {
    var newGradient = __assign({}, gradient);
    if (!newGradient.colorStops || !newGradient.colorStops.length) {
        throw "Field 'colorStops' is required in gradient";
    }
    if (newGradient.rotation) {
        newGradient.rotation = Number(newGradient.rotation);
    }
    else {
        newGradient.rotation = 0;
    }
    newGradient.colorStops = newGradient.colorStops.map(function (colorStop) { return (__assign(__assign({}, colorStop), { offset: Number(colorStop.offset) })); });
    return newGradient;
}
function sanitizeOptions(options) {
    var newOptions = __assign({}, options);
    newOptions.width = Number(newOptions.width);
    newOptions.height = Number(newOptions.height);
    newOptions.margin = Number(newOptions.margin);
    newOptions.imageOptions = __assign(__assign({}, newOptions.imageOptions), { hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots), imageSize: Number(newOptions.imageOptions.imageSize), margin: Number(newOptions.imageOptions.margin) });
    if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
        newOptions.margin = Math.min(newOptions.width, newOptions.height);
    }
    newOptions.dotsOptions = __assign({}, newOptions.dotsOptions);
    if (newOptions.dotsOptions.gradient) {
        newOptions.dotsOptions.gradient = sanitizeGradient(newOptions.dotsOptions.gradient);
    }
    if (newOptions.cornersSquareOptions) {
        newOptions.cornersSquareOptions = __assign({}, newOptions.cornersSquareOptions);
        if (newOptions.cornersSquareOptions.gradient) {
            newOptions.cornersSquareOptions.gradient = sanitizeGradient(newOptions.cornersSquareOptions.gradient);
        }
    }
    if (newOptions.cornersDotOptions) {
        newOptions.cornersDotOptions = __assign({}, newOptions.cornersDotOptions);
        if (newOptions.cornersDotOptions.gradient) {
            newOptions.cornersDotOptions.gradient = sanitizeGradient(newOptions.cornersDotOptions.gradient);
        }
    }
    if (newOptions.backgroundOptions) {
        newOptions.backgroundOptions = __assign({}, newOptions.backgroundOptions);
        if (newOptions.backgroundOptions.gradient) {
            newOptions.backgroundOptions.gradient = sanitizeGradient(newOptions.backgroundOptions.gradient);
        }
    }
    return newOptions;
}


/***/ }),

/***/ "./src/types/index.ts":
/*!****************************!*\
  !*** ./src/types/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cornerDotTypes": () => (/* reexport safe */ _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   "cornerSquareTypes": () => (/* reexport safe */ _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "dotTypes": () => (/* reexport safe */ _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "drawTypes": () => (/* reexport safe */ _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   "errorCorrectionLevels": () => (/* reexport safe */ _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "errorCorrectionPercents": () => (/* reexport safe */ _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   "modes": () => (/* reexport safe */ _constants_modes__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   "qrTypes": () => (/* reexport safe */ _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__["default"])
/* harmony export */ });
/* harmony import */ var _core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/QRCodeStyling */ "./src/core/QRCodeStyling.ts");
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants/dotTypes */ "./src/constants/dotTypes.ts");
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants/modes */ "./src/constants/modes.ts");
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types */ "./src/types/index.ts");











/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__["default"]);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQix3QkFBd0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFROztBQUVSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUTs7QUFFUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsd0JBQXdCLG1CQUFtQjtBQUMzQywwQkFBMEIsbUJBQW1COztBQUU3QztBQUNBOztBQUVBLDJCQUEyQixRQUFROztBQUVuQztBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLFFBQVE7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHdCQUF3Qix1QkFBdUI7QUFDL0MsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQixtQkFBbUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseUJBQXlCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsdUJBQXVCO0FBQzdDLHdCQUF3QixtQkFBbUI7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esc0JBQXNCLHVCQUF1QjtBQUM3QztBQUNBOztBQUVBLHNCQUFzQixtQkFBbUI7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsWUFBWTs7QUFFbEM7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixXQUFXO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsWUFBWTtBQUNsQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixTQUFTO0FBQy9CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsWUFBWTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDJCQUEyQjtBQUMzQjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdCQUF3QjtBQUN4Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLGVBQWU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxVQUFVOztBQUVWOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFv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RUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RCLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBRztJQUNkLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JC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LENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdEIsQ0FBQztBQUVGLElBQU0sT0FBTyxHQUFHO0lBQ2QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdEIsQ0FBQztBQUVGO0lBVUUsMkNBQTJDO0lBQzNDLGVBQVksT0FBd0I7UUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENB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UUFBUSxHQUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNqRztLQUNGO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUU1RUQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05pRDtBQUNMO0FBQ1k7QUFDTTtBQUNRO0FBQ0k7QUFDcEM7QUFDSTtBQUNJO0FBRXRCO0FBV3RCO0FBRUYsaUVBQWUsMkRBQWEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9ub2RlX21vZHVsZXMvcXJjb2RlLWdlbmVyYXRvci9xcmNvZGUuanMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvY29ybmVyRG90VHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZG90VHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZHJhd1R5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvbkxldmVscy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50cy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9ncmFkaWVudFR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL21vZGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL3FyVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb3JlL1FSQ2FudmFzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29yZS9RUkNvZGVTdHlsaW5nLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29yZS9RUk9wdGlvbnMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb3JlL1FSU1ZHLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJEb3QvY2FudmFzL1FSQ29ybmVyRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJEb3Qvc3ZnL1FSQ29ybmVyRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJTcXVhcmUvY2FudmFzL1FSQ29ybmVyU3F1YXJlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJTcXVhcmUvc3ZnL1FSQ29ybmVyU3F1YXJlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9kb3QvY2FudmFzL1FSRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9kb3Qvc3ZnL1FSRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvY2FsY3VsYXRlSW1hZ2VTaXplLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvZG93bmxvYWRVUkkudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9nZXRNb2RlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvbWVyZ2UudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9zYW5pdGl6ZU9wdGlvbnMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90eXBlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIlFSQ29kZVN0eWxpbmdcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiUVJDb2RlU3R5bGluZ1wiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsICgpID0+IHtcbnJldHVybiAiLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIFFSIENvZGUgR2VuZXJhdG9yIGZvciBKYXZhU2NyaXB0XG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDA5IEthenVoaWtvIEFyYXNlXG4vL1xuLy8gVVJMOiBodHRwOi8vd3d3LmQtcHJvamVjdC5jb20vXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuLy8gIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4vL1xuLy8gVGhlIHdvcmQgJ1FSIENvZGUnIGlzIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mXG4vLyBERU5TTyBXQVZFIElOQ09SUE9SQVRFRFxuLy8gIGh0dHA6Ly93d3cuZGVuc28td2F2ZS5jb20vcXJjb2RlL2ZhcXBhdGVudC1lLmh0bWxcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcXJjb2RlID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJjb2RlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIHFyY29kZVxuICAgKiBAcGFyYW0gdHlwZU51bWJlciAxIHRvIDQwXG4gICAqIEBwYXJhbSBlcnJvckNvcnJlY3Rpb25MZXZlbCAnTCcsJ00nLCdRJywnSCdcbiAgICovXG4gIHZhciBxcmNvZGUgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuXG4gICAgdmFyIFBBRDAgPSAweEVDO1xuICAgIHZhciBQQUQxID0gMHgxMTtcblxuICAgIHZhciBfdHlwZU51bWJlciA9IHR5cGVOdW1iZXI7XG4gICAgdmFyIF9lcnJvckNvcnJlY3Rpb25MZXZlbCA9IFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWxbZXJyb3JDb3JyZWN0aW9uTGV2ZWxdO1xuICAgIHZhciBfbW9kdWxlcyA9IG51bGw7XG4gICAgdmFyIF9tb2R1bGVDb3VudCA9IDA7XG4gICAgdmFyIF9kYXRhQ2FjaGUgPSBudWxsO1xuICAgIHZhciBfZGF0YUxpc3QgPSBbXTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIG1ha2VJbXBsID0gZnVuY3Rpb24odGVzdCwgbWFza1BhdHRlcm4pIHtcblxuICAgICAgX21vZHVsZUNvdW50ID0gX3R5cGVOdW1iZXIgKiA0ICsgMTc7XG4gICAgICBfbW9kdWxlcyA9IGZ1bmN0aW9uKG1vZHVsZUNvdW50KSB7XG4gICAgICAgIHZhciBtb2R1bGVzID0gbmV3IEFycmF5KG1vZHVsZUNvdW50KTtcbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdyArPSAxKSB7XG4gICAgICAgICAgbW9kdWxlc1tyb3ddID0gbmV3IEFycmF5KG1vZHVsZUNvdW50KTtcbiAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIG1vZHVsZXNbcm93XVtjb2xdID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZHVsZXM7XG4gICAgICB9KF9tb2R1bGVDb3VudCk7XG5cbiAgICAgIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCwgMCk7XG4gICAgICBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKF9tb2R1bGVDb3VudCAtIDcsIDApO1xuICAgICAgc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLCBfbW9kdWxlQ291bnQgLSA3KTtcbiAgICAgIHNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuKCk7XG4gICAgICBzZXR1cFRpbWluZ1BhdHRlcm4oKTtcbiAgICAgIHNldHVwVHlwZUluZm8odGVzdCwgbWFza1BhdHRlcm4pO1xuXG4gICAgICBpZiAoX3R5cGVOdW1iZXIgPj0gNykge1xuICAgICAgICBzZXR1cFR5cGVOdW1iZXIodGVzdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChfZGF0YUNhY2hlID09IG51bGwpIHtcbiAgICAgICAgX2RhdGFDYWNoZSA9IGNyZWF0ZURhdGEoX3R5cGVOdW1iZXIsIF9lcnJvckNvcnJlY3Rpb25MZXZlbCwgX2RhdGFMaXN0KTtcbiAgICAgIH1cblxuICAgICAgbWFwRGF0YShfZGF0YUNhY2hlLCBtYXNrUGF0dGVybik7XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcblxuICAgICAgZm9yICh2YXIgciA9IC0xOyByIDw9IDc7IHIgKz0gMSkge1xuXG4gICAgICAgIGlmIChyb3cgKyByIDw9IC0xIHx8IF9tb2R1bGVDb3VudCA8PSByb3cgKyByKSBjb250aW51ZTtcblxuICAgICAgICBmb3IgKHZhciBjID0gLTE7IGMgPD0gNzsgYyArPSAxKSB7XG5cbiAgICAgICAgICBpZiAoY29sICsgYyA8PSAtMSB8fCBfbW9kdWxlQ291bnQgPD0gY29sICsgYykgY29udGludWU7XG5cbiAgICAgICAgICBpZiAoICgwIDw9IHIgJiYgciA8PSA2ICYmIChjID09IDAgfHwgYyA9PSA2KSApXG4gICAgICAgICAgICAgIHx8ICgwIDw9IGMgJiYgYyA8PSA2ICYmIChyID09IDAgfHwgciA9PSA2KSApXG4gICAgICAgICAgICAgIHx8ICgyIDw9IHIgJiYgciA8PSA0ICYmIDIgPD0gYyAmJiBjIDw9IDQpICkge1xuICAgICAgICAgICAgX21vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0QmVzdE1hc2tQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBtaW5Mb3N0UG9pbnQgPSAwO1xuICAgICAgdmFyIHBhdHRlcm4gPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkgKz0gMSkge1xuXG4gICAgICAgIG1ha2VJbXBsKHRydWUsIGkpO1xuXG4gICAgICAgIHZhciBsb3N0UG9pbnQgPSBRUlV0aWwuZ2V0TG9zdFBvaW50KF90aGlzKTtcblxuICAgICAgICBpZiAoaSA9PSAwIHx8IG1pbkxvc3RQb2ludCA+IGxvc3RQb2ludCkge1xuICAgICAgICAgIG1pbkxvc3RQb2ludCA9IGxvc3RQb2ludDtcbiAgICAgICAgICBwYXR0ZXJuID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGF0dGVybjtcbiAgICB9O1xuXG4gICAgdmFyIHNldHVwVGltaW5nUGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICBmb3IgKHZhciByID0gODsgciA8IF9tb2R1bGVDb3VudCAtIDg7IHIgKz0gMSkge1xuICAgICAgICBpZiAoX21vZHVsZXNbcl1bNl0gIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIF9tb2R1bGVzW3JdWzZdID0gKHIgJSAyID09IDApO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBjID0gODsgYyA8IF9tb2R1bGVDb3VudCAtIDg7IGMgKz0gMSkge1xuICAgICAgICBpZiAoX21vZHVsZXNbNl1bY10gIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIF9tb2R1bGVzWzZdW2NdID0gKGMgJSAyID09IDApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHBvcyA9IFFSVXRpbC5nZXRQYXR0ZXJuUG9zaXRpb24oX3R5cGVOdW1iZXIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkgKz0gMSkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9zLmxlbmd0aDsgaiArPSAxKSB7XG5cbiAgICAgICAgICB2YXIgcm93ID0gcG9zW2ldO1xuICAgICAgICAgIHZhciBjb2wgPSBwb3Nbal07XG5cbiAgICAgICAgICBpZiAoX21vZHVsZXNbcm93XVtjb2xdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAodmFyIHIgPSAtMjsgciA8PSAyOyByICs9IDEpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgYyA9IC0yOyBjIDw9IDI7IGMgKz0gMSkge1xuXG4gICAgICAgICAgICAgIGlmIChyID09IC0yIHx8IHIgPT0gMiB8fCBjID09IC0yIHx8IGMgPT0gMlxuICAgICAgICAgICAgICAgICAgfHwgKHIgPT0gMCAmJiBjID09IDApICkge1xuICAgICAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFR5cGVOdW1iZXIgPSBmdW5jdGlvbih0ZXN0KSB7XG5cbiAgICAgIHZhciBiaXRzID0gUVJVdGlsLmdldEJDSFR5cGVOdW1iZXIoX3R5cGVOdW1iZXIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpICs9IDEpIHtcbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG4gICAgICAgIF9tb2R1bGVzW01hdGguZmxvb3IoaSAvIDMpXVtpICUgMyArIF9tb2R1bGVDb3VudCAtIDggLSAzXSA9IG1vZDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxODsgaSArPSAxKSB7XG4gICAgICAgIHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuICAgICAgICBfbW9kdWxlc1tpICUgMyArIF9tb2R1bGVDb3VudCAtIDggLSAzXVtNYXRoLmZsb29yKGkgLyAzKV0gPSBtb2Q7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFR5cGVJbmZvID0gZnVuY3Rpb24odGVzdCwgbWFza1BhdHRlcm4pIHtcblxuICAgICAgdmFyIGRhdGEgPSAoX2Vycm9yQ29ycmVjdGlvbkxldmVsIDw8IDMpIHwgbWFza1BhdHRlcm47XG4gICAgICB2YXIgYml0cyA9IFFSVXRpbC5nZXRCQ0hUeXBlSW5mbyhkYXRhKTtcblxuICAgICAgLy8gdmVydGljYWxcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkgKz0gMSkge1xuXG4gICAgICAgIHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXG4gICAgICAgIGlmIChpIDwgNikge1xuICAgICAgICAgIF9tb2R1bGVzW2ldWzhdID0gbW9kO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA4KSB7XG4gICAgICAgICAgX21vZHVsZXNbaSArIDFdWzhdID0gbW9kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9tb2R1bGVzW19tb2R1bGVDb3VudCAtIDE1ICsgaV1bOF0gPSBtb2Q7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaG9yaXpvbnRhbFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSArPSAxKSB7XG5cbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cbiAgICAgICAgaWYgKGkgPCA4KSB7XG4gICAgICAgICAgX21vZHVsZXNbOF1bX21vZHVsZUNvdW50IC0gaSAtIDFdID0gbW9kO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA5KSB7XG4gICAgICAgICAgX21vZHVsZXNbOF1bMTUgLSBpIC0gMSArIDFdID0gbW9kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9tb2R1bGVzWzhdWzE1IC0gaSAtIDFdID0gbW9kO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpeGVkIG1vZHVsZVxuICAgICAgX21vZHVsZXNbX21vZHVsZUNvdW50IC0gOF1bOF0gPSAoIXRlc3QpO1xuICAgIH07XG5cbiAgICB2YXIgbWFwRGF0YSA9IGZ1bmN0aW9uKGRhdGEsIG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIHZhciBpbmMgPSAtMTtcbiAgICAgIHZhciByb3cgPSBfbW9kdWxlQ291bnQgLSAxO1xuICAgICAgdmFyIGJpdEluZGV4ID0gNztcbiAgICAgIHZhciBieXRlSW5kZXggPSAwO1xuICAgICAgdmFyIG1hc2tGdW5jID0gUVJVdGlsLmdldE1hc2tGdW5jdGlvbihtYXNrUGF0dGVybik7XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IF9tb2R1bGVDb3VudCAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XG5cbiAgICAgICAgaWYgKGNvbCA9PSA2KSBjb2wgLT0gMTtcblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuXG4gICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCAyOyBjICs9IDEpIHtcblxuICAgICAgICAgICAgaWYgKF9tb2R1bGVzW3Jvd11bY29sIC0gY10gPT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgIHZhciBkYXJrID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgaWYgKGJ5dGVJbmRleCA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZGFyayA9ICggKCAoZGF0YVtieXRlSW5kZXhdID4+PiBiaXRJbmRleCkgJiAxKSA9PSAxKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHZhciBtYXNrID0gbWFza0Z1bmMocm93LCBjb2wgLSBjKTtcblxuICAgICAgICAgICAgICBpZiAobWFzaykge1xuICAgICAgICAgICAgICAgIGRhcmsgPSAhZGFyaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIF9tb2R1bGVzW3Jvd11bY29sIC0gY10gPSBkYXJrO1xuICAgICAgICAgICAgICBiaXRJbmRleCAtPSAxO1xuXG4gICAgICAgICAgICAgIGlmIChiaXRJbmRleCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIGJ5dGVJbmRleCArPSAxO1xuICAgICAgICAgICAgICAgIGJpdEluZGV4ID0gNztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJvdyArPSBpbmM7XG5cbiAgICAgICAgICBpZiAocm93IDwgMCB8fCBfbW9kdWxlQ291bnQgPD0gcm93KSB7XG4gICAgICAgICAgICByb3cgLT0gaW5jO1xuICAgICAgICAgICAgaW5jID0gLWluYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlQnl0ZXMgPSBmdW5jdGlvbihidWZmZXIsIHJzQmxvY2tzKSB7XG5cbiAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICB2YXIgbWF4RGNDb3VudCA9IDA7XG4gICAgICB2YXIgbWF4RWNDb3VudCA9IDA7XG5cbiAgICAgIHZhciBkY2RhdGEgPSBuZXcgQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtcbiAgICAgIHZhciBlY2RhdGEgPSBuZXcgQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIgKz0gMSkge1xuXG4gICAgICAgIHZhciBkY0NvdW50ID0gcnNCbG9ja3Nbcl0uZGF0YUNvdW50O1xuICAgICAgICB2YXIgZWNDb3VudCA9IHJzQmxvY2tzW3JdLnRvdGFsQ291bnQgLSBkY0NvdW50O1xuXG4gICAgICAgIG1heERjQ291bnQgPSBNYXRoLm1heChtYXhEY0NvdW50LCBkY0NvdW50KTtcbiAgICAgICAgbWF4RWNDb3VudCA9IE1hdGgubWF4KG1heEVjQ291bnQsIGVjQ291bnQpO1xuXG4gICAgICAgIGRjZGF0YVtyXSA9IG5ldyBBcnJheShkY0NvdW50KTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRjZGF0YVtyXS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGRjZGF0YVtyXVtpXSA9IDB4ZmYgJiBidWZmZXIuZ2V0QnVmZmVyKClbaSArIG9mZnNldF07XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGRjQ291bnQ7XG5cbiAgICAgICAgdmFyIHJzUG9seSA9IFFSVXRpbC5nZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsKGVjQ291bnQpO1xuICAgICAgICB2YXIgcmF3UG9seSA9IHFyUG9seW5vbWlhbChkY2RhdGFbcl0sIHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuXG4gICAgICAgIHZhciBtb2RQb2x5ID0gcmF3UG9seS5tb2QocnNQb2x5KTtcbiAgICAgICAgZWNkYXRhW3JdID0gbmV3IEFycmF5KHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVjZGF0YVtyXS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIHZhciBtb2RJbmRleCA9IGkgKyBtb2RQb2x5LmdldExlbmd0aCgpIC0gZWNkYXRhW3JdLmxlbmd0aDtcbiAgICAgICAgICBlY2RhdGFbcl1baV0gPSAobW9kSW5kZXggPj0gMCk/IG1vZFBvbHkuZ2V0QXQobW9kSW5kZXgpIDogMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgdG90YWxDb2RlQ291bnQgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0b3RhbENvZGVDb3VudCArPSByc0Jsb2Nrc1tpXS50b3RhbENvdW50O1xuICAgICAgfVxuXG4gICAgICB2YXIgZGF0YSA9IG5ldyBBcnJheSh0b3RhbENvZGVDb3VudCk7XG4gICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heERjQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgciArPSAxKSB7XG4gICAgICAgICAgaWYgKGkgPCBkY2RhdGFbcl0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXRhW2luZGV4XSA9IGRjZGF0YVtyXVtpXTtcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RWNDb3VudDsgaSArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByICs9IDEpIHtcbiAgICAgICAgICBpZiAoaSA8IGVjZGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGFbaW5kZXhdID0gZWNkYXRhW3JdW2ldO1xuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVEYXRhID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIGRhdGFMaXN0KSB7XG5cbiAgICAgIHZhciByc0Jsb2NrcyA9IFFSUlNCbG9jay5nZXRSU0Jsb2Nrcyh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCk7XG5cbiAgICAgIHZhciBidWZmZXIgPSBxckJpdEJ1ZmZlcigpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XG4gICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRNb2RlKCksIDQpO1xuICAgICAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIFFSVXRpbC5nZXRMZW5ndGhJbkJpdHMoZGF0YS5nZXRNb2RlKCksIHR5cGVOdW1iZXIpICk7XG4gICAgICAgIGRhdGEud3JpdGUoYnVmZmVyKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FsYyBudW0gbWF4IGRhdGEuXG4gICAgICB2YXIgdG90YWxEYXRhQ291bnQgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0b3RhbERhdGFDb3VudCArPSByc0Jsb2Nrc1tpXS5kYXRhQ291bnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPiB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgdGhyb3cgJ2NvZGUgbGVuZ3RoIG92ZXJmbG93LiAoJ1xuICAgICAgICAgICsgYnVmZmVyLmdldExlbmd0aEluQml0cygpXG4gICAgICAgICAgKyAnPidcbiAgICAgICAgICArIHRvdGFsRGF0YUNvdW50ICogOFxuICAgICAgICAgICsgJyknO1xuICAgICAgfVxuXG4gICAgICAvLyBlbmQgY29kZVxuICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoMCwgNCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhZGRpbmdcbiAgICAgIHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9IDApIHtcbiAgICAgICAgYnVmZmVyLnB1dEJpdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhZGRpbmdcbiAgICAgIHdoaWxlICh0cnVlKSB7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBidWZmZXIucHV0KFBBRDAsIDgpO1xuXG4gICAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPj0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnVmZmVyLnB1dChQQUQxLCA4KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUJ5dGVzKGJ1ZmZlciwgcnNCbG9ja3MpO1xuICAgIH07XG5cbiAgICBfdGhpcy5hZGREYXRhID0gZnVuY3Rpb24oZGF0YSwgbW9kZSkge1xuXG4gICAgICBtb2RlID0gbW9kZSB8fCAnQnl0ZSc7XG5cbiAgICAgIHZhciBuZXdEYXRhID0gbnVsbDtcblxuICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgIGNhc2UgJ051bWVyaWMnIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyTnVtYmVyKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0FscGhhbnVtZXJpYycgOlxuICAgICAgICBuZXdEYXRhID0gcXJBbHBoYU51bShkYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdCeXRlJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxcjhCaXRCeXRlKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0thbmppJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxckthbmppKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgIH1cblxuICAgICAgX2RhdGFMaXN0LnB1c2gobmV3RGF0YSk7XG4gICAgICBfZGF0YUNhY2hlID0gbnVsbDtcbiAgICB9O1xuXG4gICAgX3RoaXMuaXNEYXJrID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgICAgIGlmIChyb3cgPCAwIHx8IF9tb2R1bGVDb3VudCA8PSByb3cgfHwgY29sIDwgMCB8fCBfbW9kdWxlQ291bnQgPD0gY29sKSB7XG4gICAgICAgIHRocm93IHJvdyArICcsJyArIGNvbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfbW9kdWxlc1tyb3ddW2NvbF07XG4gICAgfTtcblxuICAgIF90aGlzLmdldE1vZHVsZUNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZHVsZUNvdW50O1xuICAgIH07XG5cbiAgICBfdGhpcy5tYWtlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoX3R5cGVOdW1iZXIgPCAxKSB7XG4gICAgICAgIHZhciB0eXBlTnVtYmVyID0gMTtcblxuICAgICAgICBmb3IgKDsgdHlwZU51bWJlciA8IDQwOyB0eXBlTnVtYmVyKyspIHtcbiAgICAgICAgICB2YXIgcnNCbG9ja3MgPSBRUlJTQmxvY2suZ2V0UlNCbG9ja3ModHlwZU51bWJlciwgX2Vycm9yQ29ycmVjdGlvbkxldmVsKTtcbiAgICAgICAgICB2YXIgYnVmZmVyID0gcXJCaXRCdWZmZXIoKTtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2RhdGFMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IF9kYXRhTGlzdFtpXTtcbiAgICAgICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRNb2RlKCksIDQpO1xuICAgICAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBRUlV0aWwuZ2V0TGVuZ3RoSW5CaXRzKGRhdGEuZ2V0TW9kZSgpLCB0eXBlTnVtYmVyKSApO1xuICAgICAgICAgICAgZGF0YS53cml0ZShidWZmZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciB0b3RhbERhdGFDb3VudCA9IDA7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG90YWxEYXRhQ291bnQgKz0gcnNCbG9ja3NbaV0uZGF0YUNvdW50O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPD0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfdHlwZU51bWJlciA9IHR5cGVOdW1iZXI7XG4gICAgICB9XG5cbiAgICAgIG1ha2VJbXBsKGZhbHNlLCBnZXRCZXN0TWFza1BhdHRlcm4oKSApO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVUYWJsZVRhZyA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4pIHtcblxuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDQgOiBtYXJnaW47XG5cbiAgICAgIHZhciBxckh0bWwgPSAnJztcblxuICAgICAgcXJIdG1sICs9ICc8dGFibGUgc3R5bGU9XCInO1xuICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLXdpZHRoOiAwcHg7IGJvcmRlci1zdHlsZTogbm9uZTsnO1xuICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsnO1xuICAgICAgcXJIdG1sICs9ICcgcGFkZGluZzogMHB4OyBtYXJnaW46ICcgKyBtYXJnaW4gKyAncHg7JztcbiAgICAgIHFySHRtbCArPSAnXCI+JztcbiAgICAgIHFySHRtbCArPSAnPHRib2R5Pic7XG5cbiAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgciArPSAxKSB7XG5cbiAgICAgICAgcXJIdG1sICs9ICc8dHI+JztcblxuICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IF90aGlzLmdldE1vZHVsZUNvdW50KCk7IGMgKz0gMSkge1xuICAgICAgICAgIHFySHRtbCArPSAnPHRkIHN0eWxlPVwiJztcbiAgICAgICAgICBxckh0bWwgKz0gJyBib3JkZXItd2lkdGg6IDBweDsgYm9yZGVyLXN0eWxlOiBub25lOyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIHBhZGRpbmc6IDBweDsgbWFyZ2luOiAwcHg7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyB3aWR0aDogJyArIGNlbGxTaXplICsgJ3B4Oyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgaGVpZ2h0OiAnICsgY2VsbFNpemUgKyAncHg7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBiYWNrZ3JvdW5kLWNvbG9yOiAnO1xuICAgICAgICAgIHFySHRtbCArPSBfdGhpcy5pc0RhcmsociwgYyk/ICcjMDAwMDAwJyA6ICcjZmZmZmZmJztcbiAgICAgICAgICBxckh0bWwgKz0gJzsnO1xuICAgICAgICAgIHFySHRtbCArPSAnXCIvPic7XG4gICAgICAgIH1cblxuICAgICAgICBxckh0bWwgKz0gJzwvdHI+JztcbiAgICAgIH1cblxuICAgICAgcXJIdG1sICs9ICc8L3Rib2R5Pic7XG4gICAgICBxckh0bWwgKz0gJzwvdGFibGU+JztcblxuICAgICAgcmV0dXJuIHFySHRtbDtcbiAgICB9O1xuXG4gICAgX3RoaXMuY3JlYXRlU3ZnVGFnID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbiwgYWx0LCB0aXRsZSkge1xuXG4gICAgICB2YXIgb3B0cyA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gQ2FsbGVkIGJ5IG9wdGlvbnMuXG4gICAgICAgIG9wdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIC8vIG92ZXJ3cml0ZSBjZWxsU2l6ZSBhbmQgbWFyZ2luLlxuICAgICAgICBjZWxsU2l6ZSA9IG9wdHMuY2VsbFNpemU7XG4gICAgICAgIG1hcmdpbiA9IG9wdHMubWFyZ2luO1xuICAgICAgICBhbHQgPSBvcHRzLmFsdDtcbiAgICAgICAgdGl0bGUgPSBvcHRzLnRpdGxlO1xuICAgICAgfVxuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgLy8gQ29tcG9zZSBhbHQgcHJvcGVydHkgc3Vycm9nYXRlXG4gICAgICBhbHQgPSAodHlwZW9mIGFsdCA9PT0gJ3N0cmluZycpID8ge3RleHQ6IGFsdH0gOiBhbHQgfHwge307XG4gICAgICBhbHQudGV4dCA9IGFsdC50ZXh0IHx8IG51bGw7XG4gICAgICBhbHQuaWQgPSAoYWx0LnRleHQpID8gYWx0LmlkIHx8ICdxcmNvZGUtZGVzY3JpcHRpb24nIDogbnVsbDtcblxuICAgICAgLy8gQ29tcG9zZSB0aXRsZSBwcm9wZXJ0eSBzdXJyb2dhdGVcbiAgICAgIHRpdGxlID0gKHR5cGVvZiB0aXRsZSA9PT0gJ3N0cmluZycpID8ge3RleHQ6IHRpdGxlfSA6IHRpdGxlIHx8IHt9O1xuICAgICAgdGl0bGUudGV4dCA9IHRpdGxlLnRleHQgfHwgbnVsbDtcbiAgICAgIHRpdGxlLmlkID0gKHRpdGxlLnRleHQpID8gdGl0bGUuaWQgfHwgJ3FyY29kZS10aXRsZScgOiBudWxsO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG4gICAgICB2YXIgYywgbWMsIHIsIG1yLCBxclN2Zz0nJywgcmVjdDtcblxuICAgICAgcmVjdCA9ICdsJyArIGNlbGxTaXplICsgJywwIDAsJyArIGNlbGxTaXplICtcbiAgICAgICAgJyAtJyArIGNlbGxTaXplICsgJywwIDAsLScgKyBjZWxsU2l6ZSArICd6ICc7XG5cbiAgICAgIHFyU3ZnICs9ICc8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCInO1xuICAgICAgcXJTdmcgKz0gIW9wdHMuc2NhbGFibGUgPyAnIHdpZHRoPVwiJyArIHNpemUgKyAncHhcIiBoZWlnaHQ9XCInICsgc2l6ZSArICdweFwiJyA6ICcnO1xuICAgICAgcXJTdmcgKz0gJyB2aWV3Qm94PVwiMCAwICcgKyBzaXplICsgJyAnICsgc2l6ZSArICdcIiAnO1xuICAgICAgcXJTdmcgKz0gJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pbllNaW4gbWVldFwiJztcbiAgICAgIHFyU3ZnICs9ICh0aXRsZS50ZXh0IHx8IGFsdC50ZXh0KSA/ICcgcm9sZT1cImltZ1wiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgICAgICAgIGVzY2FwZVhtbChbdGl0bGUuaWQsIGFsdC5pZF0uam9pbignICcpLnRyaW0oKSApICsgJ1wiJyA6ICcnO1xuICAgICAgcXJTdmcgKz0gJz4nO1xuICAgICAgcXJTdmcgKz0gKHRpdGxlLnRleHQpID8gJzx0aXRsZSBpZD1cIicgKyBlc2NhcGVYbWwodGl0bGUuaWQpICsgJ1wiPicgK1xuICAgICAgICAgIGVzY2FwZVhtbCh0aXRsZS50ZXh0KSArICc8L3RpdGxlPicgOiAnJztcbiAgICAgIHFyU3ZnICs9IChhbHQudGV4dCkgPyAnPGRlc2NyaXB0aW9uIGlkPVwiJyArIGVzY2FwZVhtbChhbHQuaWQpICsgJ1wiPicgK1xuICAgICAgICAgIGVzY2FwZVhtbChhbHQudGV4dCkgKyAnPC9kZXNjcmlwdGlvbj4nIDogJyc7XG4gICAgICBxclN2ZyArPSAnPHJlY3Qgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIGZpbGw9XCJ3aGl0ZVwiIGN4PVwiMFwiIGN5PVwiMFwiLz4nO1xuICAgICAgcXJTdmcgKz0gJzxwYXRoIGQ9XCInO1xuXG4gICAgICBmb3IgKHIgPSAwOyByIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgciArPSAxKSB7XG4gICAgICAgIG1yID0gciAqIGNlbGxTaXplICsgbWFyZ2luO1xuICAgICAgICBmb3IgKGMgPSAwOyBjIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgYyArPSAxKSB7XG4gICAgICAgICAgaWYgKF90aGlzLmlzRGFyayhyLCBjKSApIHtcbiAgICAgICAgICAgIG1jID0gYypjZWxsU2l6ZSttYXJnaW47XG4gICAgICAgICAgICBxclN2ZyArPSAnTScgKyBtYyArICcsJyArIG1yICsgcmVjdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcXJTdmcgKz0gJ1wiIHN0cm9rZT1cInRyYW5zcGFyZW50XCIgZmlsbD1cImJsYWNrXCIvPic7XG4gICAgICBxclN2ZyArPSAnPC9zdmc+JztcblxuICAgICAgcmV0dXJuIHFyU3ZnO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVEYXRhVVJMID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbikge1xuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIG1pbiA9IG1hcmdpbjtcbiAgICAgIHZhciBtYXggPSBzaXplIC0gbWFyZ2luO1xuXG4gICAgICByZXR1cm4gY3JlYXRlRGF0YVVSTChzaXplLCBzaXplLCBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5ICYmIHkgPCBtYXgpIHtcbiAgICAgICAgICB2YXIgYyA9IE1hdGguZmxvb3IoICh4IC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgICB2YXIgciA9IE1hdGguZmxvb3IoICh5IC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuaXNEYXJrKHIsIGMpPyAwIDogMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVJbWdUYWcgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luLCBhbHQpIHtcblxuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDQgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcblxuICAgICAgdmFyIGltZyA9ICcnO1xuICAgICAgaW1nICs9ICc8aW1nJztcbiAgICAgIGltZyArPSAnXFx1MDAyMHNyYz1cIic7XG4gICAgICBpbWcgKz0gX3RoaXMuY3JlYXRlRGF0YVVSTChjZWxsU2l6ZSwgbWFyZ2luKTtcbiAgICAgIGltZyArPSAnXCInO1xuICAgICAgaW1nICs9ICdcXHUwMDIwd2lkdGg9XCInO1xuICAgICAgaW1nICs9IHNpemU7XG4gICAgICBpbWcgKz0gJ1wiJztcbiAgICAgIGltZyArPSAnXFx1MDAyMGhlaWdodD1cIic7XG4gICAgICBpbWcgKz0gc2l6ZTtcbiAgICAgIGltZyArPSAnXCInO1xuICAgICAgaWYgKGFsdCkge1xuICAgICAgICBpbWcgKz0gJ1xcdTAwMjBhbHQ9XCInO1xuICAgICAgICBpbWcgKz0gZXNjYXBlWG1sKGFsdCk7XG4gICAgICAgIGltZyArPSAnXCInO1xuICAgICAgfVxuICAgICAgaW1nICs9ICcvPic7XG5cbiAgICAgIHJldHVybiBpbWc7XG4gICAgfTtcblxuICAgIHZhciBlc2NhcGVYbWwgPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgZXNjYXBlZCA9ICcnO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBjID0gcy5jaGFyQXQoaSk7XG4gICAgICAgIHN3aXRjaChjKSB7XG4gICAgICAgIGNhc2UgJzwnOiBlc2NhcGVkICs9ICcmbHQ7JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJz4nOiBlc2NhcGVkICs9ICcmZ3Q7JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJyYnOiBlc2NhcGVkICs9ICcmYW1wOyc7IGJyZWFrO1xuICAgICAgICBjYXNlICdcIic6IGVzY2FwZWQgKz0gJyZxdW90Oyc7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0IDogZXNjYXBlZCArPSBjOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVzY2FwZWQ7XG4gICAgfTtcblxuICAgIHZhciBfY3JlYXRlSGFsZkFTQ0lJID0gZnVuY3Rpb24obWFyZ2luKSB7XG4gICAgICB2YXIgY2VsbFNpemUgPSAxO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDIgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBtaW4gPSBtYXJnaW47XG4gICAgICB2YXIgbWF4ID0gc2l6ZSAtIG1hcmdpbjtcblxuICAgICAgdmFyIHksIHgsIHIxLCByMiwgcDtcblxuICAgICAgdmFyIGJsb2NrcyA9IHtcbiAgICAgICAgJ+KWiOKWiCc6ICfilognLFxuICAgICAgICAn4paIICc6ICfiloAnLFxuICAgICAgICAnIOKWiCc6ICfiloQnLFxuICAgICAgICAnICAnOiAnICdcbiAgICAgIH07XG5cbiAgICAgIHZhciBibG9ja3NMYXN0TGluZU5vTWFyZ2luID0ge1xuICAgICAgICAn4paI4paIJzogJ+KWgCcsXG4gICAgICAgICfiloggJzogJ+KWgCcsXG4gICAgICAgICcg4paIJzogJyAnLFxuICAgICAgICAnICAnOiAnICdcbiAgICAgIH07XG5cbiAgICAgIHZhciBhc2NpaSA9ICcnO1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHNpemU7IHkgKz0gMikge1xuICAgICAgICByMSA9IE1hdGguZmxvb3IoKHkgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICByMiA9IE1hdGguZmxvb3IoKHkgKyAxIC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHNpemU7IHggKz0gMSkge1xuICAgICAgICAgIHAgPSAn4paIJztcblxuICAgICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5ICYmIHkgPCBtYXggJiYgX3RoaXMuaXNEYXJrKHIxLCBNYXRoLmZsb29yKCh4IC0gbWluKSAvIGNlbGxTaXplKSkpIHtcbiAgICAgICAgICAgIHAgPSAnICc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkrMSAmJiB5KzEgPCBtYXggJiYgX3RoaXMuaXNEYXJrKHIyLCBNYXRoLmZsb29yKCh4IC0gbWluKSAvIGNlbGxTaXplKSkpIHtcbiAgICAgICAgICAgIHAgKz0gJyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHAgKz0gJ+KWiCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gT3V0cHV0IDIgY2hhcmFjdGVycyBwZXIgcGl4ZWwsIHRvIGNyZWF0ZSBmdWxsIHNxdWFyZS4gMSBjaGFyYWN0ZXIgcGVyIHBpeGVscyBnaXZlcyBvbmx5IGhhbGYgd2lkdGggb2Ygc3F1YXJlLlxuICAgICAgICAgIGFzY2lpICs9IChtYXJnaW4gPCAxICYmIHkrMSA+PSBtYXgpID8gYmxvY2tzTGFzdExpbmVOb01hcmdpbltwXSA6IGJsb2Nrc1twXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzY2lpICs9ICdcXG4nO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2l6ZSAlIDIgJiYgbWFyZ2luID4gMCkge1xuICAgICAgICByZXR1cm4gYXNjaWkuc3Vic3RyaW5nKDAsIGFzY2lpLmxlbmd0aCAtIHNpemUgLSAxKSArIEFycmF5KHNpemUrMSkuam9pbign4paAJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhc2NpaS5zdWJzdHJpbmcoMCwgYXNjaWkubGVuZ3RoLTEpO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVBU0NJSSA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4pIHtcbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMTtcblxuICAgICAgaWYgKGNlbGxTaXplIDwgMikge1xuICAgICAgICByZXR1cm4gX2NyZWF0ZUhhbGZBU0NJSShtYXJnaW4pO1xuICAgICAgfVxuXG4gICAgICBjZWxsU2l6ZSAtPSAxO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDIgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBtaW4gPSBtYXJnaW47XG4gICAgICB2YXIgbWF4ID0gc2l6ZSAtIG1hcmdpbjtcblxuICAgICAgdmFyIHksIHgsIHIsIHA7XG5cbiAgICAgIHZhciB3aGl0ZSA9IEFycmF5KGNlbGxTaXplKzEpLmpvaW4oJ+KWiOKWiCcpO1xuICAgICAgdmFyIGJsYWNrID0gQXJyYXkoY2VsbFNpemUrMSkuam9pbignICAnKTtcblxuICAgICAgdmFyIGFzY2lpID0gJyc7XG4gICAgICB2YXIgbGluZSA9ICcnO1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHNpemU7IHkgKz0gMSkge1xuICAgICAgICByID0gTWF0aC5mbG9vciggKHkgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICBsaW5lID0gJyc7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCBzaXplOyB4ICs9IDEpIHtcbiAgICAgICAgICBwID0gMTtcblxuICAgICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5ICYmIHkgPCBtYXggJiYgX3RoaXMuaXNEYXJrKHIsIE1hdGguZmxvb3IoKHggLSBtaW4pIC8gY2VsbFNpemUpKSkge1xuICAgICAgICAgICAgcCA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gT3V0cHV0IDIgY2hhcmFjdGVycyBwZXIgcGl4ZWwsIHRvIGNyZWF0ZSBmdWxsIHNxdWFyZS4gMSBjaGFyYWN0ZXIgcGVyIHBpeGVscyBnaXZlcyBvbmx5IGhhbGYgd2lkdGggb2Ygc3F1YXJlLlxuICAgICAgICAgIGxpbmUgKz0gcCA/IHdoaXRlIDogYmxhY2s7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHIgPSAwOyByIDwgY2VsbFNpemU7IHIgKz0gMSkge1xuICAgICAgICAgIGFzY2lpICs9IGxpbmUgKyAnXFxuJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXNjaWkuc3Vic3RyaW5nKDAsIGFzY2lpLmxlbmd0aC0xKTtcbiAgICB9O1xuXG4gICAgX3RoaXMucmVuZGVyVG8yZENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0LCBjZWxsU2l6ZSkge1xuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgdmFyIGxlbmd0aCA9IF90aGlzLmdldE1vZHVsZUNvdW50KCk7XG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBsZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IF90aGlzLmlzRGFyayhyb3csIGNvbCkgPyAnYmxhY2snIDogJ3doaXRlJztcbiAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KHJvdyAqIGNlbGxTaXplLCBjb2wgKiBjZWxsU2l6ZSwgY2VsbFNpemUsIGNlbGxTaXplKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcmNvZGUuc3RyaW5nVG9CeXRlc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3MgPSB7XG4gICAgJ2RlZmF1bHQnIDogZnVuY3Rpb24ocykge1xuICAgICAgdmFyIGJ5dGVzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGMgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGJ5dGVzLnB1c2goYyAmIDB4ZmYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgfTtcblxuICBxcmNvZGUuc3RyaW5nVG9CeXRlcyA9IHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3NbJ2RlZmF1bHQnXTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcmNvZGUuY3JlYXRlU3RyaW5nVG9CeXRlc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdW5pY29kZURhdGEgYmFzZTY0IHN0cmluZyBvZiBieXRlIGFycmF5LlxuICAgKiBbMTZiaXQgVW5pY29kZV0sWzE2Yml0IEJ5dGVzXSwgLi4uXG4gICAqIEBwYXJhbSBudW1DaGFyc1xuICAgKi9cbiAgcXJjb2RlLmNyZWF0ZVN0cmluZ1RvQnl0ZXMgPSBmdW5jdGlvbih1bmljb2RlRGF0YSwgbnVtQ2hhcnMpIHtcblxuICAgIC8vIGNyZWF0ZSBjb252ZXJzaW9uIG1hcC5cblxuICAgIHZhciB1bmljb2RlTWFwID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBiaW4gPSBiYXNlNjREZWNvZGVJbnB1dFN0cmVhbSh1bmljb2RlRGF0YSk7XG4gICAgICB2YXIgcmVhZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYiA9IGJpbi5yZWFkKCk7XG4gICAgICAgIGlmIChiID09IC0xKSB0aHJvdyAnZW9mJztcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgICB9O1xuXG4gICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgdmFyIHVuaWNvZGVNYXAgPSB7fTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBiMCA9IGJpbi5yZWFkKCk7XG4gICAgICAgIGlmIChiMCA9PSAtMSkgYnJlYWs7XG4gICAgICAgIHZhciBiMSA9IHJlYWQoKTtcbiAgICAgICAgdmFyIGIyID0gcmVhZCgpO1xuICAgICAgICB2YXIgYjMgPSByZWFkKCk7XG4gICAgICAgIHZhciBrID0gU3RyaW5nLmZyb21DaGFyQ29kZSggKGIwIDw8IDgpIHwgYjEpO1xuICAgICAgICB2YXIgdiA9IChiMiA8PCA4KSB8IGIzO1xuICAgICAgICB1bmljb2RlTWFwW2tdID0gdjtcbiAgICAgICAgY291bnQgKz0gMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb3VudCAhPSBudW1DaGFycykge1xuICAgICAgICB0aHJvdyBjb3VudCArICcgIT0gJyArIG51bUNoYXJzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5pY29kZU1hcDtcbiAgICB9KCk7XG5cbiAgICB2YXIgdW5rbm93bkNoYXIgPSAnPycuY2hhckNvZGVBdCgwKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgYyA9IHMuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPCAxMjgpIHtcbiAgICAgICAgICBieXRlcy5wdXNoKGMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBiID0gdW5pY29kZU1hcFtzLmNoYXJBdChpKV07XG4gICAgICAgICAgaWYgKHR5cGVvZiBiID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAoIChiICYgMHhmZikgPT0gYikge1xuICAgICAgICAgICAgICAvLyAxYnl0ZVxuICAgICAgICAgICAgICBieXRlcy5wdXNoKGIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gMmJ5dGVzXG4gICAgICAgICAgICAgIGJ5dGVzLnB1c2goYiA+Pj4gOCk7XG4gICAgICAgICAgICAgIGJ5dGVzLnB1c2goYiAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBieXRlcy5wdXNoKHVua25vd25DaGFyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9O1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSTW9kZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUk1vZGUgPSB7XG4gICAgTU9ERV9OVU1CRVIgOiAgICAxIDw8IDAsXG4gICAgTU9ERV9BTFBIQV9OVU0gOiAxIDw8IDEsXG4gICAgTU9ERV84QklUX0JZVEUgOiAxIDw8IDIsXG4gICAgTU9ERV9LQU5KSSA6ICAgICAxIDw8IDNcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUkVycm9yQ29ycmVjdGlvbkxldmVsXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSB7XG4gICAgTCA6IDEsXG4gICAgTSA6IDAsXG4gICAgUSA6IDMsXG4gICAgSCA6IDJcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUk1hc2tQYXR0ZXJuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSTWFza1BhdHRlcm4gPSB7XG4gICAgUEFUVEVSTjAwMCA6IDAsXG4gICAgUEFUVEVSTjAwMSA6IDEsXG4gICAgUEFUVEVSTjAxMCA6IDIsXG4gICAgUEFUVEVSTjAxMSA6IDMsXG4gICAgUEFUVEVSTjEwMCA6IDQsXG4gICAgUEFUVEVSTjEwMSA6IDUsXG4gICAgUEFUVEVSTjExMCA6IDYsXG4gICAgUEFUVEVSTjExMSA6IDdcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUlV0aWxcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJVdGlsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgUEFUVEVSTl9QT1NJVElPTl9UQUJMRSA9IFtcbiAgICAgIFtdLFxuICAgICAgWzYsIDE4XSxcbiAgICAgIFs2LCAyMl0sXG4gICAgICBbNiwgMjZdLFxuICAgICAgWzYsIDMwXSxcbiAgICAgIFs2LCAzNF0sXG4gICAgICBbNiwgMjIsIDM4XSxcbiAgICAgIFs2LCAyNCwgNDJdLFxuICAgICAgWzYsIDI2LCA0Nl0sXG4gICAgICBbNiwgMjgsIDUwXSxcbiAgICAgIFs2LCAzMCwgNTRdLFxuICAgICAgWzYsIDMyLCA1OF0sXG4gICAgICBbNiwgMzQsIDYyXSxcbiAgICAgIFs2LCAyNiwgNDYsIDY2XSxcbiAgICAgIFs2LCAyNiwgNDgsIDcwXSxcbiAgICAgIFs2LCAyNiwgNTAsIDc0XSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4XSxcbiAgICAgIFs2LCAzMCwgNTYsIDgyXSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2XSxcbiAgICAgIFs2LCAzNCwgNjIsIDkwXSxcbiAgICAgIFs2LCAyOCwgNTAsIDcyLCA5NF0sXG4gICAgICBbNiwgMjYsIDUwLCA3NCwgOThdLFxuICAgICAgWzYsIDMwLCA1NCwgNzgsIDEwMl0sXG4gICAgICBbNiwgMjgsIDU0LCA4MCwgMTA2XSxcbiAgICAgIFs2LCAzMiwgNTgsIDg0LCAxMTBdLFxuICAgICAgWzYsIDMwLCA1OCwgODYsIDExNF0sXG4gICAgICBbNiwgMzQsIDYyLCA5MCwgMTE4XSxcbiAgICAgIFs2LCAyNiwgNTAsIDc0LCA5OCwgMTIyXSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNl0sXG4gICAgICBbNiwgMjYsIDUyLCA3OCwgMTA0LCAxMzBdLFxuICAgICAgWzYsIDMwLCA1NiwgODIsIDEwOCwgMTM0XSxcbiAgICAgIFs2LCAzNCwgNjAsIDg2LCAxMTIsIDEzOF0sXG4gICAgICBbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDJdLFxuICAgICAgWzYsIDM0LCA2MiwgOTAsIDExOCwgMTQ2XSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNiwgMTUwXSxcbiAgICAgIFs2LCAyNCwgNTAsIDc2LCAxMDIsIDEyOCwgMTU0XSxcbiAgICAgIFs2LCAyOCwgNTQsIDgwLCAxMDYsIDEzMiwgMTU4XSxcbiAgICAgIFs2LCAzMiwgNTgsIDg0LCAxMTAsIDEzNiwgMTYyXSxcbiAgICAgIFs2LCAyNiwgNTQsIDgyLCAxMTAsIDEzOCwgMTY2XSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2LCAxMTQsIDE0MiwgMTcwXVxuICAgIF07XG4gICAgdmFyIEcxNSA9ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKTtcbiAgICB2YXIgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKTtcbiAgICB2YXIgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgZ2V0QkNIRGlnaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgZGlnaXQgPSAwO1xuICAgICAgd2hpbGUgKGRhdGEgIT0gMCkge1xuICAgICAgICBkaWdpdCArPSAxO1xuICAgICAgICBkYXRhID4+Pj0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaWdpdDtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0QkNIVHlwZUluZm8gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgZCA9IGRhdGEgPDwgMTA7XG4gICAgICB3aGlsZSAoZ2V0QkNIRGlnaXQoZCkgLSBnZXRCQ0hEaWdpdChHMTUpID49IDApIHtcbiAgICAgICAgZCBePSAoRzE1IDw8IChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxNSkgKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuICggKGRhdGEgPDwgMTApIHwgZCkgXiBHMTVfTUFTSztcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0QkNIVHlwZU51bWJlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBkID0gZGF0YSA8PCAxMjtcbiAgICAgIHdoaWxlIChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxOCkgPj0gMCkge1xuICAgICAgICBkIF49IChHMTggPDwgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE4KSApICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGRhdGEgPDwgMTIpIHwgZDtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0UGF0dGVyblBvc2l0aW9uID0gZnVuY3Rpb24odHlwZU51bWJlcikge1xuICAgICAgcmV0dXJuIFBBVFRFUk5fUE9TSVRJT05fVEFCTEVbdHlwZU51bWJlciAtIDFdO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRNYXNrRnVuY3Rpb24gPSBmdW5jdGlvbihtYXNrUGF0dGVybikge1xuXG4gICAgICBzd2l0Y2ggKG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAwIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChpICsgaikgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMSA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiBpICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gaiAlIDMgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDExIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChpICsgaikgJSAzID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSApICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMyA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKCAoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTExIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuICggKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09IDA7IH07XG5cbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICB0aHJvdyAnYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbCA9IGZ1bmN0aW9uKGVycm9yQ29ycmVjdExlbmd0aCkge1xuICAgICAgdmFyIGEgPSBxclBvbHlub21pYWwoWzFdLCAwKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JDb3JyZWN0TGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYSA9IGEubXVsdGlwbHkocXJQb2x5bm9taWFsKFsxLCBRUk1hdGguZ2V4cChpKV0sIDApICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoSW5CaXRzID0gZnVuY3Rpb24obW9kZSwgdHlwZSkge1xuXG4gICAgICBpZiAoMSA8PSB0eXBlICYmIHR5cGUgPCAxMCkge1xuXG4gICAgICAgIC8vIDEgLSA5XG5cbiAgICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgICAgOiByZXR1cm4gMTA7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIDogcmV0dXJuIDk7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFIDogcmV0dXJuIDg7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgICAgIDogcmV0dXJuIDg7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA8IDI3KSB7XG5cbiAgICAgICAgLy8gMTAgLSAyNlxuXG4gICAgICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSICAgIDogcmV0dXJuIDEyO1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSA6IHJldHVybiAxMTtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEUgOiByZXR1cm4gMTY7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgICAgIDogcmV0dXJuIDEwO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPCA0MSkge1xuXG4gICAgICAgIC8vIDI3IC0gNDBcblxuICAgICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiAgICA6IHJldHVybiAxNDtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gOiByZXR1cm4gMTM7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFIDogcmV0dXJuIDE2O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICAgICA6IHJldHVybiAxMjtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ21vZGU6JyArIG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ3R5cGU6JyArIHR5cGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldExvc3RQb2ludCA9IGZ1bmN0aW9uKHFyY29kZSkge1xuXG4gICAgICB2YXIgbW9kdWxlQ291bnQgPSBxcmNvZGUuZ2V0TW9kdWxlQ291bnQoKTtcblxuICAgICAgdmFyIGxvc3RQb2ludCA9IDA7XG5cbiAgICAgIC8vIExFVkVMMVxuXG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG5cbiAgICAgICAgICB2YXIgc2FtZUNvdW50ID0gMDtcbiAgICAgICAgICB2YXIgZGFyayA9IHFyY29kZS5pc0Rhcmsocm93LCBjb2wpO1xuXG4gICAgICAgICAgZm9yICh2YXIgciA9IC0xOyByIDw9IDE7IHIgKz0gMSkge1xuXG4gICAgICAgICAgICBpZiAocm93ICsgciA8IDAgfHwgbW9kdWxlQ291bnQgPD0gcm93ICsgcikge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgYyA9IC0xOyBjIDw9IDE7IGMgKz0gMSkge1xuXG4gICAgICAgICAgICAgIGlmIChjb2wgKyBjIDwgMCB8fCBtb2R1bGVDb3VudCA8PSBjb2wgKyBjKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAociA9PSAwICYmIGMgPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGRhcmsgPT0gcXJjb2RlLmlzRGFyayhyb3cgKyByLCBjb2wgKyBjKSApIHtcbiAgICAgICAgICAgICAgICBzYW1lQ291bnQgKz0gMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzYW1lQ291bnQgPiA1KSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gKDMgKyBzYW1lQ291bnQgLSA1KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIExFVkVMMlxuXG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudCAtIDE7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50IC0gMTsgY29sICs9IDEpIHtcbiAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93ICsgMSwgY29sKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAxKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93ICsgMSwgY29sICsgMSkgKSBjb3VudCArPSAxO1xuICAgICAgICAgIGlmIChjb3VudCA9PSAwIHx8IGNvdW50ID09IDQpIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSAzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBMRVZFTDNcblxuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50IC0gNjsgY29sICs9IDEpIHtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAxKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDIpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgMylcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyA0KVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDUpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgNikgKSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudCAtIDY7IHJvdyArPSAxKSB7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wpXG4gICAgICAgICAgICAgICYmICFxcmNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbClcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93ICsgMiwgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyAzLCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDQsIGNvbClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93ICsgNSwgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyA2LCBjb2wpICkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9IDQwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBMRVZFTDRcblxuICAgICAgdmFyIGRhcmtDb3VudCA9IDA7XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbCkgKSB7XG4gICAgICAgICAgICBkYXJrQ291bnQgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHJhdGlvID0gTWF0aC5hYnMoMTAwICogZGFya0NvdW50IC8gbW9kdWxlQ291bnQgLyBtb2R1bGVDb3VudCAtIDUwKSAvIDU7XG4gICAgICBsb3N0UG9pbnQgKz0gcmF0aW8gKiAxMDtcblxuICAgICAgcmV0dXJuIGxvc3RQb2ludDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9KCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJNYXRoXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSTWF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIEVYUF9UQUJMRSA9IG5ldyBBcnJheSgyNTYpO1xuICAgIHZhciBMT0dfVEFCTEUgPSBuZXcgQXJyYXkoMjU2KTtcblxuICAgIC8vIGluaXRpYWxpemUgdGFibGVzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpICs9IDEpIHtcbiAgICAgIEVYUF9UQUJMRVtpXSA9IDEgPDwgaTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDg7IGkgPCAyNTY7IGkgKz0gMSkge1xuICAgICAgRVhQX1RBQkxFW2ldID0gRVhQX1RBQkxFW2kgLSA0XVxuICAgICAgICBeIEVYUF9UQUJMRVtpIC0gNV1cbiAgICAgICAgXiBFWFBfVEFCTEVbaSAtIDZdXG4gICAgICAgIF4gRVhQX1RBQkxFW2kgLSA4XTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTU7IGkgKz0gMSkge1xuICAgICAgTE9HX1RBQkxFW0VYUF9UQUJMRVtpXSBdID0gaTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdsb2cgPSBmdW5jdGlvbihuKSB7XG5cbiAgICAgIGlmIChuIDwgMSkge1xuICAgICAgICB0aHJvdyAnZ2xvZygnICsgbiArICcpJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIExPR19UQUJMRVtuXTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V4cCA9IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgd2hpbGUgKG4gPCAwKSB7XG4gICAgICAgIG4gKz0gMjU1O1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAobiA+PSAyNTYpIHtcbiAgICAgICAgbiAtPSAyNTU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBFWFBfVEFCTEVbbl07XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfSgpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyUG9seW5vbWlhbFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGZ1bmN0aW9uIHFyUG9seW5vbWlhbChudW0sIHNoaWZ0KSB7XG5cbiAgICBpZiAodHlwZW9mIG51bS5sZW5ndGggPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG51bS5sZW5ndGggKyAnLycgKyBzaGlmdDtcbiAgICB9XG5cbiAgICB2YXIgX251bSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICB3aGlsZSAob2Zmc2V0IDwgbnVtLmxlbmd0aCAmJiBudW1bb2Zmc2V0XSA9PSAwKSB7XG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgfVxuICAgICAgdmFyIF9udW0gPSBuZXcgQXJyYXkobnVtLmxlbmd0aCAtIG9mZnNldCArIHNoaWZ0KTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aCAtIG9mZnNldDsgaSArPSAxKSB7XG4gICAgICAgIF9udW1baV0gPSBudW1baSArIG9mZnNldF07XG4gICAgICB9XG4gICAgICByZXR1cm4gX251bTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldEF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBfbnVtW2luZGV4XTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX251bS5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLm11bHRpcGx5ID0gZnVuY3Rpb24oZSkge1xuXG4gICAgICB2YXIgbnVtID0gbmV3IEFycmF5KF90aGlzLmdldExlbmd0aCgpICsgZS5nZXRMZW5ndGgoKSAtIDEpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90aGlzLmdldExlbmd0aCgpOyBpICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlLmdldExlbmd0aCgpOyBqICs9IDEpIHtcbiAgICAgICAgICBudW1baSArIGpdIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKF90aGlzLmdldEF0KGkpICkgKyBRUk1hdGguZ2xvZyhlLmdldEF0KGopICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcXJQb2x5bm9taWFsKG51bSwgMCk7XG4gICAgfTtcblxuICAgIF90aGlzLm1vZCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgaWYgKF90aGlzLmdldExlbmd0aCgpIC0gZS5nZXRMZW5ndGgoKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmF0aW8gPSBRUk1hdGguZ2xvZyhfdGhpcy5nZXRBdCgwKSApIC0gUVJNYXRoLmdsb2coZS5nZXRBdCgwKSApO1xuXG4gICAgICB2YXIgbnVtID0gbmV3IEFycmF5KF90aGlzLmdldExlbmd0aCgpICk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90aGlzLmdldExlbmd0aCgpOyBpICs9IDEpIHtcbiAgICAgICAgbnVtW2ldID0gX3RoaXMuZ2V0QXQoaSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZS5nZXRMZW5ndGgoKTsgaSArPSAxKSB7XG4gICAgICAgIG51bVtpXSBePSBRUk1hdGguZ2V4cChRUk1hdGguZ2xvZyhlLmdldEF0KGkpICkgKyByYXRpbyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlY3Vyc2l2ZSBjYWxsXG4gICAgICByZXR1cm4gcXJQb2x5bm9taWFsKG51bSwgMCkubW9kKGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJSU0Jsb2NrXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSUlNCbG9jayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIFJTX0JMT0NLX1RBQkxFID0gW1xuXG4gICAgICAvLyBMXG4gICAgICAvLyBNXG4gICAgICAvLyBRXG4gICAgICAvLyBIXG5cbiAgICAgIC8vIDFcbiAgICAgIFsxLCAyNiwgMTldLFxuICAgICAgWzEsIDI2LCAxNl0sXG4gICAgICBbMSwgMjYsIDEzXSxcbiAgICAgIFsxLCAyNiwgOV0sXG5cbiAgICAgIC8vIDJcbiAgICAgIFsxLCA0NCwgMzRdLFxuICAgICAgWzEsIDQ0LCAyOF0sXG4gICAgICBbMSwgNDQsIDIyXSxcbiAgICAgIFsxLCA0NCwgMTZdLFxuXG4gICAgICAvLyAzXG4gICAgICBbMSwgNzAsIDU1XSxcbiAgICAgIFsxLCA3MCwgNDRdLFxuICAgICAgWzIsIDM1LCAxN10sXG4gICAgICBbMiwgMzUsIDEzXSxcblxuICAgICAgLy8gNFxuICAgICAgWzEsIDEwMCwgODBdLFxuICAgICAgWzIsIDUwLCAzMl0sXG4gICAgICBbMiwgNTAsIDI0XSxcbiAgICAgIFs0LCAyNSwgOV0sXG5cbiAgICAgIC8vIDVcbiAgICAgIFsxLCAxMzQsIDEwOF0sXG4gICAgICBbMiwgNjcsIDQzXSxcbiAgICAgIFsyLCAzMywgMTUsIDIsIDM0LCAxNl0sXG4gICAgICBbMiwgMzMsIDExLCAyLCAzNCwgMTJdLFxuXG4gICAgICAvLyA2XG4gICAgICBbMiwgODYsIDY4XSxcbiAgICAgIFs0LCA0MywgMjddLFxuICAgICAgWzQsIDQzLCAxOV0sXG4gICAgICBbNCwgNDMsIDE1XSxcblxuICAgICAgLy8gN1xuICAgICAgWzIsIDk4LCA3OF0sXG4gICAgICBbNCwgNDksIDMxXSxcbiAgICAgIFsyLCAzMiwgMTQsIDQsIDMzLCAxNV0sXG4gICAgICBbNCwgMzksIDEzLCAxLCA0MCwgMTRdLFxuXG4gICAgICAvLyA4XG4gICAgICBbMiwgMTIxLCA5N10sXG4gICAgICBbMiwgNjAsIDM4LCAyLCA2MSwgMzldLFxuICAgICAgWzQsIDQwLCAxOCwgMiwgNDEsIDE5XSxcbiAgICAgIFs0LCA0MCwgMTQsIDIsIDQxLCAxNV0sXG5cbiAgICAgIC8vIDlcbiAgICAgIFsyLCAxNDYsIDExNl0sXG4gICAgICBbMywgNTgsIDM2LCAyLCA1OSwgMzddLFxuICAgICAgWzQsIDM2LCAxNiwgNCwgMzcsIDE3XSxcbiAgICAgIFs0LCAzNiwgMTIsIDQsIDM3LCAxM10sXG5cbiAgICAgIC8vIDEwXG4gICAgICBbMiwgODYsIDY4LCAyLCA4NywgNjldLFxuICAgICAgWzQsIDY5LCA0MywgMSwgNzAsIDQ0XSxcbiAgICAgIFs2LCA0MywgMTksIDIsIDQ0LCAyMF0sXG4gICAgICBbNiwgNDMsIDE1LCAyLCA0NCwgMTZdLFxuXG4gICAgICAvLyAxMVxuICAgICAgWzQsIDEwMSwgODFdLFxuICAgICAgWzEsIDgwLCA1MCwgNCwgODEsIDUxXSxcbiAgICAgIFs0LCA1MCwgMjIsIDQsIDUxLCAyM10sXG4gICAgICBbMywgMzYsIDEyLCA4LCAzNywgMTNdLFxuXG4gICAgICAvLyAxMlxuICAgICAgWzIsIDExNiwgOTIsIDIsIDExNywgOTNdLFxuICAgICAgWzYsIDU4LCAzNiwgMiwgNTksIDM3XSxcbiAgICAgIFs0LCA0NiwgMjAsIDYsIDQ3LCAyMV0sXG4gICAgICBbNywgNDIsIDE0LCA0LCA0MywgMTVdLFxuXG4gICAgICAvLyAxM1xuICAgICAgWzQsIDEzMywgMTA3XSxcbiAgICAgIFs4LCA1OSwgMzcsIDEsIDYwLCAzOF0sXG4gICAgICBbOCwgNDQsIDIwLCA0LCA0NSwgMjFdLFxuICAgICAgWzEyLCAzMywgMTEsIDQsIDM0LCAxMl0sXG5cbiAgICAgIC8vIDE0XG4gICAgICBbMywgMTQ1LCAxMTUsIDEsIDE0NiwgMTE2XSxcbiAgICAgIFs0LCA2NCwgNDAsIDUsIDY1LCA0MV0sXG4gICAgICBbMTEsIDM2LCAxNiwgNSwgMzcsIDE3XSxcbiAgICAgIFsxMSwgMzYsIDEyLCA1LCAzNywgMTNdLFxuXG4gICAgICAvLyAxNVxuICAgICAgWzUsIDEwOSwgODcsIDEsIDExMCwgODhdLFxuICAgICAgWzUsIDY1LCA0MSwgNSwgNjYsIDQyXSxcbiAgICAgIFs1LCA1NCwgMjQsIDcsIDU1LCAyNV0sXG4gICAgICBbMTEsIDM2LCAxMiwgNywgMzcsIDEzXSxcblxuICAgICAgLy8gMTZcbiAgICAgIFs1LCAxMjIsIDk4LCAxLCAxMjMsIDk5XSxcbiAgICAgIFs3LCA3MywgNDUsIDMsIDc0LCA0Nl0sXG4gICAgICBbMTUsIDQzLCAxOSwgMiwgNDQsIDIwXSxcbiAgICAgIFszLCA0NSwgMTUsIDEzLCA0NiwgMTZdLFxuXG4gICAgICAvLyAxN1xuICAgICAgWzEsIDEzNSwgMTA3LCA1LCAxMzYsIDEwOF0sXG4gICAgICBbMTAsIDc0LCA0NiwgMSwgNzUsIDQ3XSxcbiAgICAgIFsxLCA1MCwgMjIsIDE1LCA1MSwgMjNdLFxuICAgICAgWzIsIDQyLCAxNCwgMTcsIDQzLCAxNV0sXG5cbiAgICAgIC8vIDE4XG4gICAgICBbNSwgMTUwLCAxMjAsIDEsIDE1MSwgMTIxXSxcbiAgICAgIFs5LCA2OSwgNDMsIDQsIDcwLCA0NF0sXG4gICAgICBbMTcsIDUwLCAyMiwgMSwgNTEsIDIzXSxcbiAgICAgIFsyLCA0MiwgMTQsIDE5LCA0MywgMTVdLFxuXG4gICAgICAvLyAxOVxuICAgICAgWzMsIDE0MSwgMTEzLCA0LCAxNDIsIDExNF0sXG4gICAgICBbMywgNzAsIDQ0LCAxMSwgNzEsIDQ1XSxcbiAgICAgIFsxNywgNDcsIDIxLCA0LCA0OCwgMjJdLFxuICAgICAgWzksIDM5LCAxMywgMTYsIDQwLCAxNF0sXG5cbiAgICAgIC8vIDIwXG4gICAgICBbMywgMTM1LCAxMDcsIDUsIDEzNiwgMTA4XSxcbiAgICAgIFszLCA2NywgNDEsIDEzLCA2OCwgNDJdLFxuICAgICAgWzE1LCA1NCwgMjQsIDUsIDU1LCAyNV0sXG4gICAgICBbMTUsIDQzLCAxNSwgMTAsIDQ0LCAxNl0sXG5cbiAgICAgIC8vIDIxXG4gICAgICBbNCwgMTQ0LCAxMTYsIDQsIDE0NSwgMTE3XSxcbiAgICAgIFsxNywgNjgsIDQyXSxcbiAgICAgIFsxNywgNTAsIDIyLCA2LCA1MSwgMjNdLFxuICAgICAgWzE5LCA0NiwgMTYsIDYsIDQ3LCAxN10sXG5cbiAgICAgIC8vIDIyXG4gICAgICBbMiwgMTM5LCAxMTEsIDcsIDE0MCwgMTEyXSxcbiAgICAgIFsxNywgNzQsIDQ2XSxcbiAgICAgIFs3LCA1NCwgMjQsIDE2LCA1NSwgMjVdLFxuICAgICAgWzM0LCAzNywgMTNdLFxuXG4gICAgICAvLyAyM1xuICAgICAgWzQsIDE1MSwgMTIxLCA1LCAxNTIsIDEyMl0sXG4gICAgICBbNCwgNzUsIDQ3LCAxNCwgNzYsIDQ4XSxcbiAgICAgIFsxMSwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcbiAgICAgIFsxNiwgNDUsIDE1LCAxNCwgNDYsIDE2XSxcblxuICAgICAgLy8gMjRcbiAgICAgIFs2LCAxNDcsIDExNywgNCwgMTQ4LCAxMThdLFxuICAgICAgWzYsIDczLCA0NSwgMTQsIDc0LCA0Nl0sXG4gICAgICBbMTEsIDU0LCAyNCwgMTYsIDU1LCAyNV0sXG4gICAgICBbMzAsIDQ2LCAxNiwgMiwgNDcsIDE3XSxcblxuICAgICAgLy8gMjVcbiAgICAgIFs4LCAxMzIsIDEwNiwgNCwgMTMzLCAxMDddLFxuICAgICAgWzgsIDc1LCA0NywgMTMsIDc2LCA0OF0sXG4gICAgICBbNywgNTQsIDI0LCAyMiwgNTUsIDI1XSxcbiAgICAgIFsyMiwgNDUsIDE1LCAxMywgNDYsIDE2XSxcblxuICAgICAgLy8gMjZcbiAgICAgIFsxMCwgMTQyLCAxMTQsIDIsIDE0MywgMTE1XSxcbiAgICAgIFsxOSwgNzQsIDQ2LCA0LCA3NSwgNDddLFxuICAgICAgWzI4LCA1MCwgMjIsIDYsIDUxLCAyM10sXG4gICAgICBbMzMsIDQ2LCAxNiwgNCwgNDcsIDE3XSxcblxuICAgICAgLy8gMjdcbiAgICAgIFs4LCAxNTIsIDEyMiwgNCwgMTUzLCAxMjNdLFxuICAgICAgWzIyLCA3MywgNDUsIDMsIDc0LCA0Nl0sXG4gICAgICBbOCwgNTMsIDIzLCAyNiwgNTQsIDI0XSxcbiAgICAgIFsxMiwgNDUsIDE1LCAyOCwgNDYsIDE2XSxcblxuICAgICAgLy8gMjhcbiAgICAgIFszLCAxNDcsIDExNywgMTAsIDE0OCwgMTE4XSxcbiAgICAgIFszLCA3MywgNDUsIDIzLCA3NCwgNDZdLFxuICAgICAgWzQsIDU0LCAyNCwgMzEsIDU1LCAyNV0sXG4gICAgICBbMTEsIDQ1LCAxNSwgMzEsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDI5XG4gICAgICBbNywgMTQ2LCAxMTYsIDcsIDE0NywgMTE3XSxcbiAgICAgIFsyMSwgNzMsIDQ1LCA3LCA3NCwgNDZdLFxuICAgICAgWzEsIDUzLCAyMywgMzcsIDU0LCAyNF0sXG4gICAgICBbMTksIDQ1LCAxNSwgMjYsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMwXG4gICAgICBbNSwgMTQ1LCAxMTUsIDEwLCAxNDYsIDExNl0sXG4gICAgICBbMTksIDc1LCA0NywgMTAsIDc2LCA0OF0sXG4gICAgICBbMTUsIDU0LCAyNCwgMjUsIDU1LCAyNV0sXG4gICAgICBbMjMsIDQ1LCAxNSwgMjUsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMxXG4gICAgICBbMTMsIDE0NSwgMTE1LCAzLCAxNDYsIDExNl0sXG4gICAgICBbMiwgNzQsIDQ2LCAyOSwgNzUsIDQ3XSxcbiAgICAgIFs0MiwgNTQsIDI0LCAxLCA1NSwgMjVdLFxuICAgICAgWzIzLCA0NSwgMTUsIDI4LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzMlxuICAgICAgWzE3LCAxNDUsIDExNV0sXG4gICAgICBbMTAsIDc0LCA0NiwgMjMsIDc1LCA0N10sXG4gICAgICBbMTAsIDU0LCAyNCwgMzUsIDU1LCAyNV0sXG4gICAgICBbMTksIDQ1LCAxNSwgMzUsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMzXG4gICAgICBbMTcsIDE0NSwgMTE1LCAxLCAxNDYsIDExNl0sXG4gICAgICBbMTQsIDc0LCA0NiwgMjEsIDc1LCA0N10sXG4gICAgICBbMjksIDU0LCAyNCwgMTksIDU1LCAyNV0sXG4gICAgICBbMTEsIDQ1LCAxNSwgNDYsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM0XG4gICAgICBbMTMsIDE0NSwgMTE1LCA2LCAxNDYsIDExNl0sXG4gICAgICBbMTQsIDc0LCA0NiwgMjMsIDc1LCA0N10sXG4gICAgICBbNDQsIDU0LCAyNCwgNywgNTUsIDI1XSxcbiAgICAgIFs1OSwgNDYsIDE2LCAxLCA0NywgMTddLFxuXG4gICAgICAvLyAzNVxuICAgICAgWzEyLCAxNTEsIDEyMSwgNywgMTUyLCAxMjJdLFxuICAgICAgWzEyLCA3NSwgNDcsIDI2LCA3NiwgNDhdLFxuICAgICAgWzM5LCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuICAgICAgWzIyLCA0NSwgMTUsIDQxLCA0NiwgMTZdLFxuXG4gICAgICAvLyAzNlxuICAgICAgWzYsIDE1MSwgMTIxLCAxNCwgMTUyLCAxMjJdLFxuICAgICAgWzYsIDc1LCA0NywgMzQsIDc2LCA0OF0sXG4gICAgICBbNDYsIDU0LCAyNCwgMTAsIDU1LCAyNV0sXG4gICAgICBbMiwgNDUsIDE1LCA2NCwgNDYsIDE2XSxcblxuICAgICAgLy8gMzdcbiAgICAgIFsxNywgMTUyLCAxMjIsIDQsIDE1MywgMTIzXSxcbiAgICAgIFsyOSwgNzQsIDQ2LCAxNCwgNzUsIDQ3XSxcbiAgICAgIFs0OSwgNTQsIDI0LCAxMCwgNTUsIDI1XSxcbiAgICAgIFsyNCwgNDUsIDE1LCA0NiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzhcbiAgICAgIFs0LCAxNTIsIDEyMiwgMTgsIDE1MywgMTIzXSxcbiAgICAgIFsxMywgNzQsIDQ2LCAzMiwgNzUsIDQ3XSxcbiAgICAgIFs0OCwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcbiAgICAgIFs0MiwgNDUsIDE1LCAzMiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzlcbiAgICAgIFsyMCwgMTQ3LCAxMTcsIDQsIDE0OCwgMTE4XSxcbiAgICAgIFs0MCwgNzUsIDQ3LCA3LCA3NiwgNDhdLFxuICAgICAgWzQzLCA1NCwgMjQsIDIyLCA1NSwgMjVdLFxuICAgICAgWzEwLCA0NSwgMTUsIDY3LCA0NiwgMTZdLFxuXG4gICAgICAvLyA0MFxuICAgICAgWzE5LCAxNDgsIDExOCwgNiwgMTQ5LCAxMTldLFxuICAgICAgWzE4LCA3NSwgNDcsIDMxLCA3NiwgNDhdLFxuICAgICAgWzM0LCA1NCwgMjQsIDM0LCA1NSwgMjVdLFxuICAgICAgWzIwLCA0NSwgMTUsIDYxLCA0NiwgMTZdXG4gICAgXTtcblxuICAgIHZhciBxclJTQmxvY2sgPSBmdW5jdGlvbih0b3RhbENvdW50LCBkYXRhQ291bnQpIHtcbiAgICAgIHZhciBfdGhpcyA9IHt9O1xuICAgICAgX3RoaXMudG90YWxDb3VudCA9IHRvdGFsQ291bnQ7XG4gICAgICBfdGhpcy5kYXRhQ291bnQgPSBkYXRhQ291bnQ7XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIGdldFJzQmxvY2tUYWJsZSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG5cbiAgICAgIHN3aXRjaChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLkwgOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAwXTtcbiAgICAgIGNhc2UgUVJFcnJvckNvcnJlY3Rpb25MZXZlbC5NIDpcbiAgICAgICAgcmV0dXJuIFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMV07XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuUSA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDJdO1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLkggOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAzXTtcbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRSU0Jsb2NrcyA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG5cbiAgICAgIHZhciByc0Jsb2NrID0gZ2V0UnNCbG9ja1RhYmxlKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKTtcblxuICAgICAgaWYgKHR5cGVvZiByc0Jsb2NrID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93ICdiYWQgcnMgYmxvY2sgQCB0eXBlTnVtYmVyOicgKyB0eXBlTnVtYmVyICtcbiAgICAgICAgICAgICcvZXJyb3JDb3JyZWN0aW9uTGV2ZWw6JyArIGVycm9yQ29ycmVjdGlvbkxldmVsO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gcnNCbG9jay5sZW5ndGggLyAzO1xuXG4gICAgICB2YXIgbGlzdCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICAgICAgdmFyIGNvdW50ID0gcnNCbG9ja1tpICogMyArIDBdO1xuICAgICAgICB2YXIgdG90YWxDb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAxXTtcbiAgICAgICAgdmFyIGRhdGFDb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAyXTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvdW50OyBqICs9IDEpIHtcbiAgICAgICAgICBsaXN0LnB1c2gocXJSU0Jsb2NrKHRvdGFsQ291bnQsIGRhdGFDb3VudCkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9KCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJCaXRCdWZmZXJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJCaXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfYnVmZmVyID0gW107XG4gICAgdmFyIF9sZW5ndGggPSAwO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfYnVmZmVyO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRBdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOCk7XG4gICAgICByZXR1cm4gKCAoX2J1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSApICYgMSkgPT0gMTtcbiAgICB9O1xuXG4gICAgX3RoaXMucHV0ID0gZnVuY3Rpb24obnVtLCBsZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgX3RoaXMucHV0Qml0KCAoIChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkgKSAmIDEpID09IDEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGhJbkJpdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy5wdXRCaXQgPSBmdW5jdGlvbihiaXQpIHtcblxuICAgICAgdmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihfbGVuZ3RoIC8gOCk7XG4gICAgICBpZiAoX2J1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcbiAgICAgICAgX2J1ZmZlci5wdXNoKDApO1xuICAgICAgfVxuXG4gICAgICBpZiAoYml0KSB7XG4gICAgICAgIF9idWZmZXJbYnVmSW5kZXhdIHw9ICgweDgwID4+PiAoX2xlbmd0aCAlIDgpICk7XG4gICAgICB9XG5cbiAgICAgIF9sZW5ndGggKz0gMTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyTnVtYmVyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyTnVtYmVyID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfTlVNQkVSO1xuICAgIHZhciBfZGF0YSA9IGRhdGE7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kZTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICByZXR1cm4gX2RhdGEubGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuXG4gICAgICB2YXIgZGF0YSA9IF9kYXRhO1xuXG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIHdoaWxlIChpICsgMiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoc3RyVG9OdW0oZGF0YS5zdWJzdHJpbmcoaSwgaSArIDMpICksIDEwKTtcbiAgICAgICAgaSArPSAzO1xuICAgICAgfVxuXG4gICAgICBpZiAoaSA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAtIGkgPT0gMSkge1xuICAgICAgICAgIGJ1ZmZlci5wdXQoc3RyVG9OdW0oZGF0YS5zdWJzdHJpbmcoaSwgaSArIDEpICksIDQpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEubGVuZ3RoIC0gaSA9PSAyKSB7XG4gICAgICAgICAgYnVmZmVyLnB1dChzdHJUb051bShkYXRhLnN1YnN0cmluZyhpLCBpICsgMikgKSwgNyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHN0clRvTnVtID0gZnVuY3Rpb24ocykge1xuICAgICAgdmFyIG51bSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgbnVtID0gbnVtICogMTAgKyBjaGF0VG9OdW0ocy5jaGFyQXQoaSkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudW07XG4gICAgfTtcblxuICAgIHZhciBjaGF0VG9OdW0gPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAoJzAnIDw9IGMgJiYgYyA8PSAnOScpIHtcbiAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAtICcwJy5jaGFyQ29kZUF0KDApO1xuICAgICAgfVxuICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciA6JyArIGM7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxckFscGhhTnVtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyQWxwaGFOdW0gPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV9BTFBIQV9OVU07XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiBfZGF0YS5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG5cbiAgICAgIHZhciBzID0gX2RhdGE7XG5cbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKGkgKyAxIDwgcy5sZW5ndGgpIHtcbiAgICAgICAgYnVmZmVyLnB1dChcbiAgICAgICAgICBnZXRDb2RlKHMuY2hhckF0KGkpICkgKiA0NSArXG4gICAgICAgICAgZ2V0Q29kZShzLmNoYXJBdChpICsgMSkgKSwgMTEpO1xuICAgICAgICBpICs9IDI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgcy5sZW5ndGgpIHtcbiAgICAgICAgYnVmZmVyLnB1dChnZXRDb2RlKHMuY2hhckF0KGkpICksIDYpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0Q29kZSA9IGZ1bmN0aW9uKGMpIHtcblxuICAgICAgaWYgKCcwJyA8PSBjICYmIGMgPD0gJzknKSB7XG4gICAgICAgIHJldHVybiBjLmNoYXJDb2RlQXQoMCkgLSAnMCcuY2hhckNvZGVBdCgwKTtcbiAgICAgIH0gZWxzZSBpZiAoJ0EnIDw9IGMgJiYgYyA8PSAnWicpIHtcbiAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAtICdBJy5jaGFyQ29kZUF0KDApICsgMTA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgY2FzZSAnICcgOiByZXR1cm4gMzY7XG4gICAgICAgIGNhc2UgJyQnIDogcmV0dXJuIDM3O1xuICAgICAgICBjYXNlICclJyA6IHJldHVybiAzODtcbiAgICAgICAgY2FzZSAnKicgOiByZXR1cm4gMzk7XG4gICAgICAgIGNhc2UgJysnIDogcmV0dXJuIDQwO1xuICAgICAgICBjYXNlICctJyA6IHJldHVybiA0MTtcbiAgICAgICAgY2FzZSAnLicgOiByZXR1cm4gNDI7XG4gICAgICAgIGNhc2UgJy8nIDogcmV0dXJuIDQzO1xuICAgICAgICBjYXNlICc6JyA6IHJldHVybiA0NDtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciA6JyArIGM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyOEJpdEJ5dGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXI4Qml0Qnl0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBfbW9kZSA9IFFSTW9kZS5NT0RFXzhCSVRfQllURTtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuICAgIHZhciBfYnl0ZXMgPSBxcmNvZGUuc3RyaW5nVG9CeXRlcyhkYXRhKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiBfYnl0ZXMubGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfYnl0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYnVmZmVyLnB1dChfYnl0ZXNbaV0sIDgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJLYW5qaVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxckthbmppID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfS0FOSkk7XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcblxuICAgIHZhciBzdHJpbmdUb0J5dGVzID0gcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jc1snU0pJUyddO1xuICAgIGlmICghc3RyaW5nVG9CeXRlcykge1xuICAgICAgdGhyb3cgJ3NqaXMgbm90IHN1cHBvcnRlZC4nO1xuICAgIH1cbiAgICAhZnVuY3Rpb24oYywgY29kZSkge1xuICAgICAgLy8gc2VsZiB0ZXN0IGZvciBzamlzIHN1cHBvcnQuXG4gICAgICB2YXIgdGVzdCA9IHN0cmluZ1RvQnl0ZXMoYyk7XG4gICAgICBpZiAodGVzdC5sZW5ndGggIT0gMiB8fCAoICh0ZXN0WzBdIDw8IDgpIHwgdGVzdFsxXSkgIT0gY29kZSkge1xuICAgICAgICB0aHJvdyAnc2ppcyBub3Qgc3VwcG9ydGVkLic7XG4gICAgICB9XG4gICAgfSgnXFx1NTNjYicsIDB4OTc0Nik7XG5cbiAgICB2YXIgX2J5dGVzID0gc3RyaW5nVG9CeXRlcyhkYXRhKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiB+fihfYnl0ZXMubGVuZ3RoIC8gMik7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG5cbiAgICAgIHZhciBkYXRhID0gX2J5dGVzO1xuXG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIHdoaWxlIChpICsgMSA8IGRhdGEubGVuZ3RoKSB7XG5cbiAgICAgICAgdmFyIGMgPSAoICgweGZmICYgZGF0YVtpXSkgPDwgOCkgfCAoMHhmZiAmIGRhdGFbaSArIDFdKTtcblxuICAgICAgICBpZiAoMHg4MTQwIDw9IGMgJiYgYyA8PSAweDlGRkMpIHtcbiAgICAgICAgICBjIC09IDB4ODE0MDtcbiAgICAgICAgfSBlbHNlIGlmICgweEUwNDAgPD0gYyAmJiBjIDw9IDB4RUJCRikge1xuICAgICAgICAgIGMgLT0gMHhDMTQwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93ICdpbGxlZ2FsIGNoYXIgYXQgJyArIChpICsgMSkgKyAnLycgKyBjO1xuICAgICAgICB9XG5cbiAgICAgICAgYyA9ICggKGMgPj4+IDgpICYgMHhmZikgKiAweEMwICsgKGMgJiAweGZmKTtcblxuICAgICAgICBidWZmZXIucHV0KGMsIDEzKTtcblxuICAgICAgICBpICs9IDI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciBhdCAnICsgKGkgKyAxKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEdJRiBTdXBwb3J0IGV0Yy5cbiAgLy9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBieXRlQXJyYXlPdXRwdXRTdHJlYW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgYnl0ZUFycmF5T3V0cHV0U3RyZWFtID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgX2J5dGVzID0gW107XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLndyaXRlQnl0ZSA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgIF9ieXRlcy5wdXNoKGIgJiAweGZmKTtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGVTaG9ydCA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgIF90aGlzLndyaXRlQnl0ZShpKTtcbiAgICAgIF90aGlzLndyaXRlQnl0ZShpID4+PiA4KTtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGVCeXRlcyA9IGZ1bmN0aW9uKGIsIG9mZiwgbGVuKSB7XG4gICAgICBvZmYgPSBvZmYgfHwgMDtcbiAgICAgIGxlbiA9IGxlbiB8fCBiLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgX3RoaXMud3JpdGVCeXRlKGJbaSArIG9mZl0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZVN0cmluZyA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBfdGhpcy53cml0ZUJ5dGUocy5jaGFyQ29kZUF0KGkpICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLnRvQnl0ZUFycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2J5dGVzO1xuICAgIH07XG5cbiAgICBfdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHMgPSAnJztcbiAgICAgIHMgKz0gJ1snO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfYnl0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgcyArPSAnLCc7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSBfYnl0ZXNbaV07XG4gICAgICB9XG4gICAgICBzICs9ICddJztcbiAgICAgIHJldHVybiBzO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gYmFzZTY0RW5jb2RlT3V0cHV0U3RyZWFtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGJhc2U2NEVuY29kZU91dHB1dFN0cmVhbSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIF9idWZmZXIgPSAwO1xuICAgIHZhciBfYnVmbGVuID0gMDtcbiAgICB2YXIgX2xlbmd0aCA9IDA7XG4gICAgdmFyIF9iYXNlNjQgPSAnJztcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIHdyaXRlRW5jb2RlZCA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgIF9iYXNlNjQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShlbmNvZGUoYiAmIDB4M2YpICk7XG4gICAgfTtcblxuICAgIHZhciBlbmNvZGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICBpZiAobiA8IDApIHtcbiAgICAgICAgLy8gZXJyb3IuXG4gICAgICB9IGVsc2UgaWYgKG4gPCAyNikge1xuICAgICAgICByZXR1cm4gMHg0MSArIG47XG4gICAgICB9IGVsc2UgaWYgKG4gPCA1Mikge1xuICAgICAgICByZXR1cm4gMHg2MSArIChuIC0gMjYpO1xuICAgICAgfSBlbHNlIGlmIChuIDwgNjIpIHtcbiAgICAgICAgcmV0dXJuIDB4MzAgKyAobiAtIDUyKTtcbiAgICAgIH0gZWxzZSBpZiAobiA9PSA2Mikge1xuICAgICAgICByZXR1cm4gMHgyYjtcbiAgICAgIH0gZWxzZSBpZiAobiA9PSA2Mykge1xuICAgICAgICByZXR1cm4gMHgyZjtcbiAgICAgIH1cbiAgICAgIHRocm93ICduOicgKyBuO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZUJ5dGUgPSBmdW5jdGlvbihuKSB7XG5cbiAgICAgIF9idWZmZXIgPSAoX2J1ZmZlciA8PCA4KSB8IChuICYgMHhmZik7XG4gICAgICBfYnVmbGVuICs9IDg7XG4gICAgICBfbGVuZ3RoICs9IDE7XG5cbiAgICAgIHdoaWxlIChfYnVmbGVuID49IDYpIHtcbiAgICAgICAgd3JpdGVFbmNvZGVkKF9idWZmZXIgPj4+IChfYnVmbGVuIC0gNikgKTtcbiAgICAgICAgX2J1ZmxlbiAtPSA2O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5mbHVzaCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICBpZiAoX2J1ZmxlbiA+IDApIHtcbiAgICAgICAgd3JpdGVFbmNvZGVkKF9idWZmZXIgPDwgKDYgLSBfYnVmbGVuKSApO1xuICAgICAgICBfYnVmZmVyID0gMDtcbiAgICAgICAgX2J1ZmxlbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChfbGVuZ3RoICUgMyAhPSAwKSB7XG4gICAgICAgIC8vIHBhZGRpbmdcbiAgICAgICAgdmFyIHBhZGxlbiA9IDMgLSBfbGVuZ3RoICUgMztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWRsZW47IGkgKz0gMSkge1xuICAgICAgICAgIF9iYXNlNjQgKz0gJz0nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2Jhc2U2NDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGJhc2U2NERlY29kZUlucHV0U3RyZWFtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGJhc2U2NERlY29kZUlucHV0U3RyZWFtID0gZnVuY3Rpb24oc3RyKSB7XG5cbiAgICB2YXIgX3N0ciA9IHN0cjtcbiAgICB2YXIgX3BvcyA9IDA7XG4gICAgdmFyIF9idWZmZXIgPSAwO1xuICAgIHZhciBfYnVmbGVuID0gMDtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMucmVhZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB3aGlsZSAoX2J1ZmxlbiA8IDgpIHtcblxuICAgICAgICBpZiAoX3BvcyA+PSBfc3RyLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChfYnVmbGVuID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgJ3VuZXhwZWN0ZWQgZW5kIG9mIGZpbGUuLycgKyBfYnVmbGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGMgPSBfc3RyLmNoYXJBdChfcG9zKTtcbiAgICAgICAgX3BvcyArPSAxO1xuXG4gICAgICAgIGlmIChjID09ICc9Jykge1xuICAgICAgICAgIF9idWZsZW4gPSAwO1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChjLm1hdGNoKC9eXFxzJC8pICkge1xuICAgICAgICAgIC8vIGlnbm9yZSBpZiB3aGl0ZXNwYWNlLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgX2J1ZmZlciA9IChfYnVmZmVyIDw8IDYpIHwgZGVjb2RlKGMuY2hhckNvZGVBdCgwKSApO1xuICAgICAgICBfYnVmbGVuICs9IDY7XG4gICAgICB9XG5cbiAgICAgIHZhciBuID0gKF9idWZmZXIgPj4+IChfYnVmbGVuIC0gOCkgKSAmIDB4ZmY7XG4gICAgICBfYnVmbGVuIC09IDg7XG4gICAgICByZXR1cm4gbjtcbiAgICB9O1xuXG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICgweDQxIDw9IGMgJiYgYyA8PSAweDVhKSB7XG4gICAgICAgIHJldHVybiBjIC0gMHg0MTtcbiAgICAgIH0gZWxzZSBpZiAoMHg2MSA8PSBjICYmIGMgPD0gMHg3YSkge1xuICAgICAgICByZXR1cm4gYyAtIDB4NjEgKyAyNjtcbiAgICAgIH0gZWxzZSBpZiAoMHgzMCA8PSBjICYmIGMgPD0gMHgzOSkge1xuICAgICAgICByZXR1cm4gYyAtIDB4MzAgKyA1MjtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PSAweDJiKSB7XG4gICAgICAgIHJldHVybiA2MjtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PSAweDJmKSB7XG4gICAgICAgIHJldHVybiA2MztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdjOicgKyBjO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gZ2lmSW1hZ2UgKEIvVylcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgZ2lmSW1hZ2UgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICB2YXIgX3dpZHRoID0gd2lkdGg7XG4gICAgdmFyIF9oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIF9kYXRhID0gbmV3IEFycmF5KHdpZHRoICogaGVpZ2h0KTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuc2V0UGl4ZWwgPSBmdW5jdGlvbih4LCB5LCBwaXhlbCkge1xuICAgICAgX2RhdGFbeSAqIF93aWR0aCArIHhdID0gcGl4ZWw7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24ob3V0KSB7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBHSUYgU2lnbmF0dXJlXG5cbiAgICAgIG91dC53cml0ZVN0cmluZygnR0lGODdhJyk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBTY3JlZW4gRGVzY3JpcHRvclxuXG4gICAgICBvdXQud3JpdGVTaG9ydChfd2lkdGgpO1xuICAgICAgb3V0LndyaXRlU2hvcnQoX2hlaWdodCk7XG5cbiAgICAgIG91dC53cml0ZUJ5dGUoMHg4MCk7IC8vIDJiaXRcbiAgICAgIG91dC53cml0ZUJ5dGUoMCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDApO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gR2xvYmFsIENvbG9yIE1hcFxuXG4gICAgICAvLyBibGFja1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4MDApO1xuXG4gICAgICAvLyB3aGl0ZVxuICAgICAgb3V0LndyaXRlQnl0ZSgweGZmKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHhmZik7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4ZmYpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gSW1hZ2UgRGVzY3JpcHRvclxuXG4gICAgICBvdXQud3JpdGVTdHJpbmcoJywnKTtcbiAgICAgIG91dC53cml0ZVNob3J0KDApO1xuICAgICAgb3V0LndyaXRlU2hvcnQoMCk7XG4gICAgICBvdXQud3JpdGVTaG9ydChfd2lkdGgpO1xuICAgICAgb3V0LndyaXRlU2hvcnQoX2hlaWdodCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDApO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gTG9jYWwgQ29sb3IgTWFwXG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBSYXN0ZXIgRGF0YVxuXG4gICAgICB2YXIgbHp3TWluQ29kZVNpemUgPSAyO1xuICAgICAgdmFyIHJhc3RlciA9IGdldExaV1Jhc3RlcihsendNaW5Db2RlU2l6ZSk7XG5cbiAgICAgIG91dC53cml0ZUJ5dGUobHp3TWluQ29kZVNpemUpO1xuXG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgICAgd2hpbGUgKHJhc3Rlci5sZW5ndGggLSBvZmZzZXQgPiAyNTUpIHtcbiAgICAgICAgb3V0LndyaXRlQnl0ZSgyNTUpO1xuICAgICAgICBvdXQud3JpdGVCeXRlcyhyYXN0ZXIsIG9mZnNldCwgMjU1KTtcbiAgICAgICAgb2Zmc2V0ICs9IDI1NTtcbiAgICAgIH1cblxuICAgICAgb3V0LndyaXRlQnl0ZShyYXN0ZXIubGVuZ3RoIC0gb2Zmc2V0KTtcbiAgICAgIG91dC53cml0ZUJ5dGVzKHJhc3Rlciwgb2Zmc2V0LCByYXN0ZXIubGVuZ3RoIC0gb2Zmc2V0KTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBHSUYgVGVybWluYXRvclxuICAgICAgb3V0LndyaXRlU3RyaW5nKCc7Jyk7XG4gICAgfTtcblxuICAgIHZhciBiaXRPdXRwdXRTdHJlYW0gPSBmdW5jdGlvbihvdXQpIHtcblxuICAgICAgdmFyIF9vdXQgPSBvdXQ7XG4gICAgICB2YXIgX2JpdExlbmd0aCA9IDA7XG4gICAgICB2YXIgX2JpdEJ1ZmZlciA9IDA7XG5cbiAgICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGRhdGEsIGxlbmd0aCkge1xuXG4gICAgICAgIGlmICggKGRhdGEgPj4+IGxlbmd0aCkgIT0gMCkge1xuICAgICAgICAgIHRocm93ICdsZW5ndGggb3Zlcic7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoX2JpdExlbmd0aCArIGxlbmd0aCA+PSA4KSB7XG4gICAgICAgICAgX291dC53cml0ZUJ5dGUoMHhmZiAmICggKGRhdGEgPDwgX2JpdExlbmd0aCkgfCBfYml0QnVmZmVyKSApO1xuICAgICAgICAgIGxlbmd0aCAtPSAoOCAtIF9iaXRMZW5ndGgpO1xuICAgICAgICAgIGRhdGEgPj4+PSAoOCAtIF9iaXRMZW5ndGgpO1xuICAgICAgICAgIF9iaXRCdWZmZXIgPSAwO1xuICAgICAgICAgIF9iaXRMZW5ndGggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgX2JpdEJ1ZmZlciA9IChkYXRhIDw8IF9iaXRMZW5ndGgpIHwgX2JpdEJ1ZmZlcjtcbiAgICAgICAgX2JpdExlbmd0aCA9IF9iaXRMZW5ndGggKyBsZW5ndGg7XG4gICAgICB9O1xuXG4gICAgICBfdGhpcy5mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2JpdExlbmd0aCA+IDApIHtcbiAgICAgICAgICBfb3V0LndyaXRlQnl0ZShfYml0QnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TFpXUmFzdGVyID0gZnVuY3Rpb24obHp3TWluQ29kZVNpemUpIHtcblxuICAgICAgdmFyIGNsZWFyQ29kZSA9IDEgPDwgbHp3TWluQ29kZVNpemU7XG4gICAgICB2YXIgZW5kQ29kZSA9ICgxIDw8IGx6d01pbkNvZGVTaXplKSArIDE7XG4gICAgICB2YXIgYml0TGVuZ3RoID0gbHp3TWluQ29kZVNpemUgKyAxO1xuXG4gICAgICAvLyBTZXR1cCBMWldUYWJsZVxuICAgICAgdmFyIHRhYmxlID0gbHp3VGFibGUoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGVhckNvZGU7IGkgKz0gMSkge1xuICAgICAgICB0YWJsZS5hZGQoU3RyaW5nLmZyb21DaGFyQ29kZShpKSApO1xuICAgICAgfVxuICAgICAgdGFibGUuYWRkKFN0cmluZy5mcm9tQ2hhckNvZGUoY2xlYXJDb2RlKSApO1xuICAgICAgdGFibGUuYWRkKFN0cmluZy5mcm9tQ2hhckNvZGUoZW5kQ29kZSkgKTtcblxuICAgICAgdmFyIGJ5dGVPdXQgPSBieXRlQXJyYXlPdXRwdXRTdHJlYW0oKTtcbiAgICAgIHZhciBiaXRPdXQgPSBiaXRPdXRwdXRTdHJlYW0oYnl0ZU91dCk7XG5cbiAgICAgIC8vIGNsZWFyIGNvZGVcbiAgICAgIGJpdE91dC53cml0ZShjbGVhckNvZGUsIGJpdExlbmd0aCk7XG5cbiAgICAgIHZhciBkYXRhSW5kZXggPSAwO1xuXG4gICAgICB2YXIgcyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoX2RhdGFbZGF0YUluZGV4XSk7XG4gICAgICBkYXRhSW5kZXggKz0gMTtcblxuICAgICAgd2hpbGUgKGRhdGFJbmRleCA8IF9kYXRhLmxlbmd0aCkge1xuXG4gICAgICAgIHZhciBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShfZGF0YVtkYXRhSW5kZXhdKTtcbiAgICAgICAgZGF0YUluZGV4ICs9IDE7XG5cbiAgICAgICAgaWYgKHRhYmxlLmNvbnRhaW5zKHMgKyBjKSApIHtcblxuICAgICAgICAgIHMgPSBzICsgYztcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgYml0T3V0LndyaXRlKHRhYmxlLmluZGV4T2YocyksIGJpdExlbmd0aCk7XG5cbiAgICAgICAgICBpZiAodGFibGUuc2l6ZSgpIDwgMHhmZmYpIHtcblxuICAgICAgICAgICAgaWYgKHRhYmxlLnNpemUoKSA9PSAoMSA8PCBiaXRMZW5ndGgpICkge1xuICAgICAgICAgICAgICBiaXRMZW5ndGggKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFibGUuYWRkKHMgKyBjKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzID0gYztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBiaXRPdXQud3JpdGUodGFibGUuaW5kZXhPZihzKSwgYml0TGVuZ3RoKTtcblxuICAgICAgLy8gZW5kIGNvZGVcbiAgICAgIGJpdE91dC53cml0ZShlbmRDb2RlLCBiaXRMZW5ndGgpO1xuXG4gICAgICBiaXRPdXQuZmx1c2goKTtcblxuICAgICAgcmV0dXJuIGJ5dGVPdXQudG9CeXRlQXJyYXkoKTtcbiAgICB9O1xuXG4gICAgdmFyIGx6d1RhYmxlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBfbWFwID0ge307XG4gICAgICB2YXIgX3NpemUgPSAwO1xuXG4gICAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgICAgX3RoaXMuYWRkID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChfdGhpcy5jb250YWlucyhrZXkpICkge1xuICAgICAgICAgIHRocm93ICdkdXAga2V5OicgKyBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgX21hcFtrZXldID0gX3NpemU7XG4gICAgICAgIF9zaXplICs9IDE7XG4gICAgICB9O1xuXG4gICAgICBfdGhpcy5zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfc2l6ZTtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLmluZGV4T2YgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9tYXBba2V5XTtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLmNvbnRhaW5zID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgX21hcFtrZXldICE9ICd1bmRlZmluZWQnO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZURhdGFVUkwgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBnZXRQaXhlbCkge1xuICAgIHZhciBnaWYgPSBnaWZJbWFnZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSArPSAxKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4ICs9IDEpIHtcbiAgICAgICAgZ2lmLnNldFBpeGVsKHgsIHksIGdldFBpeGVsKHgsIHkpICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGIgPSBieXRlQXJyYXlPdXRwdXRTdHJlYW0oKTtcbiAgICBnaWYud3JpdGUoYik7XG5cbiAgICB2YXIgYmFzZTY0ID0gYmFzZTY0RW5jb2RlT3V0cHV0U3RyZWFtKCk7XG4gICAgdmFyIGJ5dGVzID0gYi50b0J5dGVBcnJheSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGJhc2U2NC53cml0ZUJ5dGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICBiYXNlNjQuZmx1c2goKTtcblxuICAgIHJldHVybiAnZGF0YTppbWFnZS9naWY7YmFzZTY0LCcgKyBiYXNlNjQ7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcmV0dXJucyBxcmNvZGUgZnVuY3Rpb24uXG5cbiAgcmV0dXJuIHFyY29kZTtcbn0oKTtcblxuLy8gbXVsdGlieXRlIHN1cHBvcnRcbiFmdW5jdGlvbigpIHtcblxuICBxcmNvZGUuc3RyaW5nVG9CeXRlc0Z1bmNzWydVVEYtOCddID0gZnVuY3Rpb24ocykge1xuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg3Mjk0MDUvaG93LXRvLWNvbnZlcnQtdXRmOC1zdHJpbmctdG8tYnl0ZS1hcnJheVxuICAgIGZ1bmN0aW9uIHRvVVRGOEFycmF5KHN0cikge1xuICAgICAgdmFyIHV0ZjggPSBbXTtcbiAgICAgIGZvciAodmFyIGk9MDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hhcmNvZGUgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGNoYXJjb2RlIDwgMHg4MCkgdXRmOC5wdXNoKGNoYXJjb2RlKTtcbiAgICAgICAgZWxzZSBpZiAoY2hhcmNvZGUgPCAweDgwMCkge1xuICAgICAgICAgIHV0ZjgucHVzaCgweGMwIHwgKGNoYXJjb2RlID4+IDYpLFxuICAgICAgICAgICAgICAweDgwIHwgKGNoYXJjb2RlICYgMHgzZikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoYXJjb2RlIDwgMHhkODAwIHx8IGNoYXJjb2RlID49IDB4ZTAwMCkge1xuICAgICAgICAgIHV0ZjgucHVzaCgweGUwIHwgKGNoYXJjb2RlID4+IDEyKSxcbiAgICAgICAgICAgICAgMHg4MCB8ICgoY2hhcmNvZGU+PjYpICYgMHgzZiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoY2hhcmNvZGUgJiAweDNmKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3Vycm9nYXRlIHBhaXJcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIC8vIFVURi0xNiBlbmNvZGVzIDB4MTAwMDAtMHgxMEZGRkYgYnlcbiAgICAgICAgICAvLyBzdWJ0cmFjdGluZyAweDEwMDAwIGFuZCBzcGxpdHRpbmcgdGhlXG4gICAgICAgICAgLy8gMjAgYml0cyBvZiAweDAtMHhGRkZGRiBpbnRvIHR3byBoYWx2ZXNcbiAgICAgICAgICBjaGFyY29kZSA9IDB4MTAwMDAgKyAoKChjaGFyY29kZSAmIDB4M2ZmKTw8MTApXG4gICAgICAgICAgICB8IChzdHIuY2hhckNvZGVBdChpKSAmIDB4M2ZmKSk7XG4gICAgICAgICAgdXRmOC5wdXNoKDB4ZjAgfCAoY2hhcmNvZGUgPj4xOCksXG4gICAgICAgICAgICAgIDB4ODAgfCAoKGNoYXJjb2RlPj4xMikgJiAweDNmKSxcbiAgICAgICAgICAgICAgMHg4MCB8ICgoY2hhcmNvZGU+PjYpICYgMHgzZiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoY2hhcmNvZGUgJiAweDNmKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB1dGY4O1xuICAgIH1cbiAgICByZXR1cm4gdG9VVEY4QXJyYXkocyk7XG4gIH07XG5cbn0oKTtcblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfVxufShmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHFyY29kZTtcbn0pKTtcbiIsImltcG9ydCB7IENvcm5lckRvdFR5cGVzIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZG90OiBcImRvdFwiLFxuICBzcXVhcmU6IFwic3F1YXJlXCJcbn0gYXMgQ29ybmVyRG90VHlwZXM7XG4iLCJpbXBvcnQgeyBDb3JuZXJTcXVhcmVUeXBlcyB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRvdDogXCJkb3RcIixcbiAgc3F1YXJlOiBcInNxdWFyZVwiLFxuICBleHRyYVJvdW5kZWQ6IFwiZXh0cmEtcm91bmRlZFwiXG59IGFzIENvcm5lclNxdWFyZVR5cGVzO1xuIiwiaW1wb3J0IHsgRG90VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkb3RzOiBcImRvdHNcIixcbiAgcm91bmRlZDogXCJyb3VuZGVkXCIsXG4gIGNsYXNzeTogXCJjbGFzc3lcIixcbiAgY2xhc3N5Um91bmRlZDogXCJjbGFzc3ktcm91bmRlZFwiLFxuICBzcXVhcmU6IFwic3F1YXJlXCIsXG4gIGV4dHJhUm91bmRlZDogXCJleHRyYS1yb3VuZGVkXCJcbn0gYXMgRG90VHlwZXM7XG4iLCJpbXBvcnQgeyBEcmF3VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjYW52YXM6IFwiY2FudmFzXCIsXG4gIHN2ZzogXCJzdmdcIlxufSBhcyBEcmF3VHlwZXM7XG4iLCJpbXBvcnQgeyBFcnJvckNvcnJlY3Rpb25MZXZlbCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgRXJyb3JDb3JyZWN0aW9uTGV2ZWxzIHtcbiAgW2tleTogc3RyaW5nXTogRXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgTDogXCJMXCIsXG4gIE06IFwiTVwiLFxuICBROiBcIlFcIixcbiAgSDogXCJIXCJcbn0gYXMgRXJyb3JDb3JyZWN0aW9uTGV2ZWxzO1xuIiwiaW50ZXJmYWNlIEVycm9yQ29ycmVjdGlvblBlcmNlbnRzIHtcbiAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIEw6IDAuMDcsXG4gIE06IDAuMTUsXG4gIFE6IDAuMjUsXG4gIEg6IDAuM1xufSBhcyBFcnJvckNvcnJlY3Rpb25QZXJjZW50cztcbiIsImltcG9ydCB7IEdyYWRpZW50VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICByYWRpYWw6IFwicmFkaWFsXCIsXG4gIGxpbmVhcjogXCJsaW5lYXJcIlxufSBhcyBHcmFkaWVudFR5cGVzO1xuIiwiaW1wb3J0IHsgTW9kZSB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgTW9kZXMge1xuICBba2V5OiBzdHJpbmddOiBNb2RlO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG51bWVyaWM6IFwiTnVtZXJpY1wiLFxuICBhbHBoYW51bWVyaWM6IFwiQWxwaGFudW1lcmljXCIsXG4gIGJ5dGU6IFwiQnl0ZVwiLFxuICBrYW5qaTogXCJLYW5qaVwiXG59IGFzIE1vZGVzO1xuIiwiaW1wb3J0IHsgVHlwZU51bWJlciB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgVHlwZXNNYXAge1xuICBba2V5OiBudW1iZXJdOiBUeXBlTnVtYmVyO1xufVxuXG5jb25zdCBxclR5cGVzOiBUeXBlc01hcCA9IHt9O1xuXG5mb3IgKGxldCB0eXBlID0gMDsgdHlwZSA8PSA0MDsgdHlwZSsrKSB7XG4gIHFyVHlwZXNbdHlwZV0gPSB0eXBlIGFzIFR5cGVOdW1iZXI7XG59XG5cbi8vIDAgdHlwZXMgaXMgYXV0b2RldGVjdFxuXG4vLyB0eXBlcyA9IHtcbi8vICAgICAwOiAwLFxuLy8gICAgIDE6IDEsXG4vLyAgICAgLi4uXG4vLyAgICAgNDA6IDQwXG4vLyB9XG5cbmV4cG9ydCBkZWZhdWx0IHFyVHlwZXM7XG4iLCJpbXBvcnQgY2FsY3VsYXRlSW1hZ2VTaXplIGZyb20gXCIuLi90b29scy9jYWxjdWxhdGVJbWFnZVNpemVcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25QZXJjZW50cyBmcm9tIFwiLi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvblBlcmNlbnRzXCI7XG5pbXBvcnQgUVJEb3QgZnJvbSBcIi4uL2ZpZ3VyZXMvZG90L2NhbnZhcy9RUkRvdFwiO1xuaW1wb3J0IFFSQ29ybmVyU3F1YXJlIGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lclNxdWFyZS9jYW52YXMvUVJDb3JuZXJTcXVhcmVcIjtcbmltcG9ydCBRUkNvcm5lckRvdCBmcm9tIFwiLi4vZmlndXJlcy9jb3JuZXJEb3QvY2FudmFzL1FSQ29ybmVyRG90XCI7XG5pbXBvcnQgeyBSZXF1aXJlZE9wdGlvbnMgfSBmcm9tIFwiLi9RUk9wdGlvbnNcIjtcbmltcG9ydCBncmFkaWVudFR5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvZ3JhZGllbnRUeXBlc1wiO1xuaW1wb3J0IHsgUVJDb2RlLCBHcmFkaWVudCwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuY29uc3Qgc3F1YXJlTWFzayA9IFtcbiAgWzEsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDEsIDEsIDEsIDEsIDEsIDFdXG5dO1xuXG5jb25zdCBkb3RNYXNrID0gW1xuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgWzAsIDAsIDEsIDEsIDEsIDAsIDBdLFxuICBbMCwgMCwgMSwgMSwgMSwgMCwgMF0sXG4gIFswLCAwLCAxLCAxLCAxLCAwLCAwXSxcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ2FudmFzIHtcbiAgX2NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIF9vcHRpb25zOiBSZXF1aXJlZE9wdGlvbnM7XG4gIF9xcj86IFFSQ29kZTtcbiAgX2ltYWdlPzogSFRNTEltYWdlRWxlbWVudDtcblxuICAvL1RPRE8gZG9uJ3QgcGFzcyBhbGwgb3B0aW9ucyB0byB0aGlzIGNsYXNzXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucykge1xuICAgIHRoaXMuX2NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICBnZXQgY29udGV4dCgpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXMud2lkdGg7XG4gIH1cblxuICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhcy5oZWlnaHQ7XG4gIH1cblxuICBnZXRDYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICBjb25zdCBjYW52YXNDb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgaWYgKGNhbnZhc0NvbnRleHQpIHtcbiAgICAgIGNhbnZhc0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuX2NhbnZhcy53aWR0aCwgdGhpcy5fY2FudmFzLmhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZHJhd1FSKHFyOiBRUkNvZGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb3VudCA9IHFyLmdldE1vZHVsZUNvdW50KCk7XG4gICAgY29uc3QgbWluU2l6ZSA9IE1hdGgubWluKHRoaXMuX29wdGlvbnMud2lkdGgsIHRoaXMuX29wdGlvbnMuaGVpZ2h0KSAtIHRoaXMuX29wdGlvbnMubWFyZ2luICogMjtcbiAgICBjb25zdCBkb3RTaXplID0gTWF0aC5mbG9vcihtaW5TaXplIC8gY291bnQpO1xuICAgIGxldCBkcmF3SW1hZ2VTaXplID0ge1xuICAgICAgaGlkZVhEb3RzOiAwLFxuICAgICAgaGlkZVlEb3RzOiAwLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5fcXIgPSBxcjtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmltYWdlKSB7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRJbWFnZSgpO1xuICAgICAgaWYgKCF0aGlzLl9pbWFnZSkgcmV0dXJuO1xuICAgICAgY29uc3QgeyBpbWFnZU9wdGlvbnMsIHFyT3B0aW9ucyB9ID0gdGhpcy5fb3B0aW9ucztcbiAgICAgIGNvbnN0IGNvdmVyTGV2ZWwgPSBpbWFnZU9wdGlvbnMuaW1hZ2VTaXplICogZXJyb3JDb3JyZWN0aW9uUGVyY2VudHNbcXJPcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsXTtcbiAgICAgIGNvbnN0IG1heEhpZGRlbkRvdHMgPSBNYXRoLmZsb29yKGNvdmVyTGV2ZWwgKiBjb3VudCAqIGNvdW50KTtcblxuICAgICAgZHJhd0ltYWdlU2l6ZSA9IGNhbGN1bGF0ZUltYWdlU2l6ZSh7XG4gICAgICAgIG9yaWdpbmFsV2lkdGg6IHRoaXMuX2ltYWdlLndpZHRoLFxuICAgICAgICBvcmlnaW5hbEhlaWdodDogdGhpcy5faW1hZ2UuaGVpZ2h0LFxuICAgICAgICBtYXhIaWRkZW5Eb3RzLFxuICAgICAgICBtYXhIaWRkZW5BeGlzRG90czogY291bnQgLSAxNCxcbiAgICAgICAgZG90U2l6ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZHJhd0JhY2tncm91bmQoKTtcbiAgICB0aGlzLmRyYXdEb3RzKChpOiBudW1iZXIsIGo6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2VPcHRpb25zLmhpZGVCYWNrZ3JvdW5kRG90cykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaSA+PSAoY291bnQgLSBkcmF3SW1hZ2VTaXplLmhpZGVYRG90cykgLyAyICYmXG4gICAgICAgICAgaSA8IChjb3VudCArIGRyYXdJbWFnZVNpemUuaGlkZVhEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqID49IChjb3VudCAtIGRyYXdJbWFnZVNpemUuaGlkZVlEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqIDwgKGNvdW50ICsgZHJhd0ltYWdlU2l6ZS5oaWRlWURvdHMpIC8gMlxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNxdWFyZU1hc2tbaV0/LltqXSB8fCBzcXVhcmVNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgc3F1YXJlTWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvdE1hc2tbaV0/LltqXSB8fCBkb3RNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgZG90TWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5kcmF3Q29ybmVycygpO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2UpIHtcbiAgICAgIHRoaXMuZHJhd0ltYWdlKHsgd2lkdGg6IGRyYXdJbWFnZVNpemUud2lkdGgsIGhlaWdodDogZHJhd0ltYWdlU2l6ZS5oZWlnaHQsIGNvdW50LCBkb3RTaXplIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRyYXdCYWNrZ3JvdW5kKCk6IHZvaWQge1xuICAgIGNvbnN0IGNhbnZhc0NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBpZiAoY2FudmFzQ29udGV4dCkge1xuICAgICAgaWYgKG9wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgICAgY29uc3QgZ3JhZGllbnRPcHRpb25zID0gb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5ncmFkaWVudDtcbiAgICAgICAgY29uc3QgZ3JhZGllbnQgPSB0aGlzLl9jcmVhdGVHcmFkaWVudCh7XG4gICAgICAgICAgY29udGV4dDogY2FudmFzQ29udGV4dCxcbiAgICAgICAgICBvcHRpb25zOiBncmFkaWVudE9wdGlvbnMsXG4gICAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiAwLFxuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBzaXplOiB0aGlzLl9jYW52YXMud2lkdGggPiB0aGlzLl9jYW52YXMuaGVpZ2h0ID8gdGhpcy5fY2FudmFzLndpZHRoIDogdGhpcy5fY2FudmFzLmhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICBncmFkaWVudE9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKG9mZnNldCwgY29sb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmNvbG9yKSB7XG4gICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5jb2xvcjtcbiAgICAgIH1cbiAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5fY2FudmFzLndpZHRoLCB0aGlzLl9jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICBkcmF3RG90cyhmaWx0ZXI/OiBGaWx0ZXJGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbnZhc0NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBpZiAoIWNhbnZhc0NvbnRleHQpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fcXIuZ2V0TW9kdWxlQ291bnQoKTtcblxuICAgIGlmIChjb3VudCA+IG9wdGlvbnMud2lkdGggfHwgY291bnQgPiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgdGhyb3cgXCJUaGUgY2FudmFzIGlzIHRvbyBzbWFsbC5cIjtcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpIC0gb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKG1pblNpemUgLyBjb3VudCk7XG4gICAgY29uc3QgeEJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgeUJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuICAgIGNvbnN0IGRvdCA9IG5ldyBRUkRvdCh7IGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgIGNhbnZhc0NvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY291bnQ7IGorKykge1xuICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoaSwgaikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3FyLmlzRGFyayhpLCBqKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGRvdC5kcmF3KFxuICAgICAgICAgIHhCZWdpbm5pbmcgKyBpICogZG90U2l6ZSxcbiAgICAgICAgICB5QmVnaW5uaW5nICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGlmIChpICsgeE9mZnNldCA8IDAgfHwgaiArIHlPZmZzZXQgPCAwIHx8IGkgKyB4T2Zmc2V0ID49IGNvdW50IHx8IGogKyB5T2Zmc2V0ID49IGNvdW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoaSArIHhPZmZzZXQsIGogKyB5T2Zmc2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5fcXIgJiYgdGhpcy5fcXIuaXNEYXJrKGkgKyB4T2Zmc2V0LCBqICsgeU9mZnNldCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgICBjb25zdCBncmFkaWVudE9wdGlvbnMgPSBvcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50O1xuICAgICAgY29uc3QgZ3JhZGllbnQgPSB0aGlzLl9jcmVhdGVHcmFkaWVudCh7XG4gICAgICAgIGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsXG4gICAgICAgIG9wdGlvbnM6IGdyYWRpZW50T3B0aW9ucyxcbiAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiAwLFxuICAgICAgICB4OiB4QmVnaW5uaW5nLFxuICAgICAgICB5OiB5QmVnaW5uaW5nLFxuICAgICAgICBzaXplOiBjb3VudCAqIGRvdFNpemVcbiAgICAgIH0pO1xuXG4gICAgICBncmFkaWVudE9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcChvZmZzZXQsIGNvbG9yKTtcbiAgICAgIH0pO1xuXG4gICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBncmFkaWVudDtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZG90c09wdGlvbnMuY29sb3IpIHtcbiAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9IG9wdGlvbnMuZG90c09wdGlvbnMuY29sb3I7XG4gICAgfVxuXG4gICAgY2FudmFzQ29udGV4dC5maWxsKFwiZXZlbm9kZFwiKTtcbiAgfVxuXG4gIGRyYXdDb3JuZXJzKGZpbHRlcj86IEZpbHRlckZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9xcikge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3QgY2FudmFzQ29udGV4dCA9IHRoaXMuY29udGV4dDtcblxuICAgIGlmICghY2FudmFzQ29udGV4dCkge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX3FyLmdldE1vZHVsZUNvdW50KCk7XG4gICAgY29uc3QgbWluU2l6ZSA9IE1hdGgubWluKG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0KSAtIG9wdGlvbnMubWFyZ2luICogMjtcbiAgICBjb25zdCBkb3RTaXplID0gTWF0aC5mbG9vcihtaW5TaXplIC8gY291bnQpO1xuICAgIGNvbnN0IGNvcm5lcnNTcXVhcmVTaXplID0gZG90U2l6ZSAqIDc7XG4gICAgY29uc3QgY29ybmVyc0RvdFNpemUgPSBkb3RTaXplICogMztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG5cbiAgICBbXG4gICAgICBbMCwgMCwgMF0sXG4gICAgICBbMSwgMCwgTWF0aC5QSSAvIDJdLFxuICAgICAgWzAsIDEsIC1NYXRoLlBJIC8gMl1cbiAgICBdLmZvckVhY2goKFtjb2x1bW4sIHJvdywgcm90YXRpb25dKSA9PiB7XG4gICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoY29sdW1uLCByb3cpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeCA9IHhCZWdpbm5pbmcgKyBjb2x1bW4gKiBkb3RTaXplICogKGNvdW50IC0gNyk7XG4gICAgICBjb25zdCB5ID0geUJlZ2lubmluZyArIHJvdyAqIGRvdFNpemUgKiAoY291bnQgLSA3KTtcblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LnR5cGUpIHtcbiAgICAgICAgY29uc3QgY29ybmVyc1NxdWFyZSA9IG5ldyBRUkNvcm5lclNxdWFyZSh7IGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsIHR5cGU6IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LnR5cGUgfSk7XG5cbiAgICAgICAgY2FudmFzQ29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29ybmVyc1NxdWFyZS5kcmF3KHgsIHksIGNvcm5lcnNTcXVhcmVTaXplLCByb3RhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBjb250ZXh0OiBjYW52YXNDb250ZXh0LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgY2FudmFzQ29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNxdWFyZU1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNxdWFyZU1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghc3F1YXJlTWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFzcXVhcmVNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LmdyYWRpZW50KSB7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50T3B0aW9ucyA9IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMuZ3JhZGllbnQ7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50ID0gdGhpcy5fY3JlYXRlR3JhZGllbnQoe1xuICAgICAgICAgIGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsXG4gICAgICAgICAgb3B0aW9uczogZ3JhZGllbnRPcHRpb25zLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIHNpemU6IGNvcm5lcnNTcXVhcmVTaXplXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdyYWRpZW50T3B0aW9ucy5jb2xvclN0b3BzLmZvckVhY2goKHsgb2Zmc2V0LCBjb2xvciB9OiB7IG9mZnNldDogbnVtYmVyOyBjb2xvcjogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3Aob2Zmc2V0LCBjb2xvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zPy5jb2xvcikge1xuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLmNvbG9yO1xuICAgICAgfVxuXG4gICAgICBjYW52YXNDb250ZXh0LmZpbGwoXCJldmVub2RkXCIpO1xuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8udHlwZSkge1xuICAgICAgICBjb25zdCBjb3JuZXJzRG90ID0gbmV3IFFSQ29ybmVyRG90KHsgY29udGV4dDogY2FudmFzQ29udGV4dCwgdHlwZTogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8udHlwZSB9KTtcblxuICAgICAgICBjYW52YXNDb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb3JuZXJzRG90LmRyYXcoeCArIGRvdFNpemUgKiAyLCB5ICsgZG90U2l6ZSAqIDIsIGNvcm5lcnNEb3RTaXplLCByb3RhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBjb250ZXh0OiBjYW52YXNDb250ZXh0LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgY2FudmFzQ29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvdE1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRvdE1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghZG90TWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFkb3RNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnM/LmdyYWRpZW50KSB7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50T3B0aW9ucyA9IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQ7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50ID0gdGhpcy5fY3JlYXRlR3JhZGllbnQoe1xuICAgICAgICAgIGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsXG4gICAgICAgICAgb3B0aW9uczogZ3JhZGllbnRPcHRpb25zLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeDogeCArIGRvdFNpemUgKiAyLFxuICAgICAgICAgIHk6IHkgKyBkb3RTaXplICogMixcbiAgICAgICAgICBzaXplOiBjb3JuZXJzRG90U2l6ZVxuICAgICAgICB9KTtcblxuICAgICAgICBncmFkaWVudE9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKG9mZnNldCwgY29sb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBncmFkaWVudDtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uY29sb3IpIHtcbiAgICAgICAgY2FudmFzQ29udGV4dC5maWxsU3R5bGUgPSBjYW52YXNDb250ZXh0LnN0cm9rZVN0eWxlID0gb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucy5jb2xvcjtcbiAgICAgIH1cblxuICAgICAgY2FudmFzQ29udGV4dC5maWxsKFwiZXZlbm9kZFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRJbWFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICBpZiAoIW9wdGlvbnMuaW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChcIkltYWdlIGlzIG5vdCBkZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuaW1hZ2VPcHRpb25zLmNyb3NzT3JpZ2luID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGltYWdlLmNyb3NzT3JpZ2luID0gb3B0aW9ucy5pbWFnZU9wdGlvbnMuY3Jvc3NPcmlnaW47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ltYWdlID0gaW1hZ2U7XG4gICAgICBpbWFnZS5vbmxvYWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgICBpbWFnZS5zcmMgPSBvcHRpb25zLmltYWdlO1xuICAgIH0pO1xuICB9XG5cbiAgZHJhd0ltYWdlKHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgY291bnQsXG4gICAgZG90U2l6ZVxuICB9OiB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIGRvdFNpemU6IG51bWJlcjtcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IGNhbnZhc0NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBpZiAoIWNhbnZhc0NvbnRleHQpIHtcbiAgICAgIHRocm93IFwiY2FudmFzQ29udGV4dCBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5faW1hZ2UpIHtcbiAgICAgIHRocm93IFwiaW1hZ2UgaXMgbm90IGRlZmluZWRcIjtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgZHggPSB4QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIHdpZHRoKSAvIDI7XG4gICAgY29uc3QgZHkgPSB5QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIGhlaWdodCkgLyAyO1xuICAgIGNvbnN0IGR3ID0gd2lkdGggLSBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRoID0gaGVpZ2h0IC0gb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICogMjtcblxuICAgIGNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2ltYWdlLCBkeCwgZHksIGR3IDwgMCA/IDAgOiBkdywgZGggPCAwID8gMCA6IGRoKTtcbiAgfVxuXG4gIF9jcmVhdGVHcmFkaWVudCh7XG4gICAgY29udGV4dCxcbiAgICBvcHRpb25zLFxuICAgIGFkZGl0aW9uYWxSb3RhdGlvbixcbiAgICB4LFxuICAgIHksXG4gICAgc2l6ZVxuICB9OiB7XG4gICAgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIG9wdGlvbnM6IEdyYWRpZW50O1xuICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogbnVtYmVyO1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgc2l6ZTogbnVtYmVyO1xuICB9KTogQ2FudmFzR3JhZGllbnQge1xuICAgIGxldCBncmFkaWVudDtcblxuICAgIGlmIChvcHRpb25zLnR5cGUgPT09IGdyYWRpZW50VHlwZXMucmFkaWFsKSB7XG4gICAgICBncmFkaWVudCA9IGNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQoeCArIHNpemUgLyAyLCB5ICsgc2l6ZSAvIDIsIDAsIHggKyBzaXplIC8gMiwgeSArIHNpemUgLyAyLCBzaXplIC8gMik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJvdGF0aW9uID0gKChvcHRpb25zLnJvdGF0aW9uIHx8IDApICsgYWRkaXRpb25hbFJvdGF0aW9uKSAlICgyICogTWF0aC5QSSk7XG4gICAgICBjb25zdCBwb3NpdGl2ZVJvdGF0aW9uID0gKHJvdGF0aW9uICsgMiAqIE1hdGguUEkpICUgKDIgKiBNYXRoLlBJKTtcbiAgICAgIGxldCB4MCA9IHggKyBzaXplIC8gMjtcbiAgICAgIGxldCB5MCA9IHkgKyBzaXplIC8gMjtcbiAgICAgIGxldCB4MSA9IHggKyBzaXplIC8gMjtcbiAgICAgIGxldCB5MSA9IHkgKyBzaXplIC8gMjtcblxuICAgICAgaWYgKFxuICAgICAgICAocG9zaXRpdmVSb3RhdGlvbiA+PSAwICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMC4yNSAqIE1hdGguUEkpIHx8XG4gICAgICAgIChwb3NpdGl2ZVJvdGF0aW9uID4gMS43NSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAyICogTWF0aC5QSSlcbiAgICAgICkge1xuICAgICAgICB4MCA9IHgwIC0gc2l6ZSAvIDI7XG4gICAgICAgIHkwID0geTAgLSAoc2l6ZSAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB4MSA9IHgxICsgc2l6ZSAvIDI7XG4gICAgICAgIHkxID0geTEgKyAoc2l6ZSAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGl2ZVJvdGF0aW9uID4gMC4yNSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAwLjc1ICogTWF0aC5QSSkge1xuICAgICAgICB5MCA9IHkwIC0gc2l6ZSAvIDI7XG4gICAgICAgIHgwID0geDAgLSBzaXplIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgeTEgPSB5MSArIHNpemUgLyAyO1xuICAgICAgICB4MSA9IHgxICsgc2l6ZSAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAwLjc1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuMjUgKiBNYXRoLlBJKSB7XG4gICAgICAgIHgwID0geDAgKyBzaXplIC8gMjtcbiAgICAgICAgeTAgPSB5MCArIChzaXplIC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIHgxID0geDEgLSBzaXplIC8gMjtcbiAgICAgICAgeTEgPSB5MSAtIChzaXplIC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAxLjI1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuNzUgKiBNYXRoLlBJKSB7XG4gICAgICAgIHkwID0geTAgKyBzaXplIC8gMjtcbiAgICAgICAgeDAgPSB4MCArIHNpemUgLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB5MSA9IHkxIC0gc2l6ZSAvIDI7XG4gICAgICAgIHgxID0geDEgLSBzaXplIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgZ3JhZGllbnQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KE1hdGgucm91bmQoeDApLCBNYXRoLnJvdW5kKHkwKSwgTWF0aC5yb3VuZCh4MSksIE1hdGgucm91bmQoeTEpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhZGllbnQ7XG4gIH1cbn1cbiIsImltcG9ydCBnZXRNb2RlIGZyb20gXCIuLi90b29scy9nZXRNb2RlXCI7XG5pbXBvcnQgbWVyZ2VEZWVwIGZyb20gXCIuLi90b29scy9tZXJnZVwiO1xuaW1wb3J0IGRvd25sb2FkVVJJIGZyb20gXCIuLi90b29scy9kb3dubG9hZFVSSVwiO1xuaW1wb3J0IFFSQ2FudmFzIGZyb20gXCIuL1FSQ2FudmFzXCI7XG5pbXBvcnQgUVJTVkcgZnJvbSBcIi4vUVJTVkdcIjtcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9kcmF3VHlwZXNcIjtcblxuaW1wb3J0IGRlZmF1bHRPcHRpb25zLCB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCIuL1FST3B0aW9uc1wiO1xuaW1wb3J0IHNhbml0aXplT3B0aW9ucyBmcm9tIFwiLi4vdG9vbHMvc2FuaXRpemVPcHRpb25zXCI7XG5pbXBvcnQgeyBFeHRlbnNpb24sIFFSQ29kZSwgT3B0aW9ucywgRG93bmxvYWRPcHRpb25zIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5pbXBvcnQgcXJjb2RlIGZyb20gXCJxcmNvZGUtZ2VuZXJhdG9yXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29kZVN0eWxpbmcge1xuICBfb3B0aW9uczogUmVxdWlyZWRPcHRpb25zO1xuICBfY29udGFpbmVyPzogSFRNTEVsZW1lbnQ7XG4gIF9jYW52YXM/OiBRUkNhbnZhcztcbiAgX3N2Zz86IFFSU1ZHO1xuICBfcXI/OiBRUkNvZGU7XG4gIF9jYW52YXNEcmF3aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD47XG4gIF9zdmdEcmF3aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8T3B0aW9ucz4pIHtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucyA/IHNhbml0aXplT3B0aW9ucyhtZXJnZURlZXAoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpIGFzIFJlcXVpcmVkT3B0aW9ucykgOiBkZWZhdWx0T3B0aW9ucztcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgc3RhdGljIF9jbGVhckNvbnRhaW5lcihjb250YWluZXI/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9nZXRRUlN0eWxpbmdFbGVtZW50KGV4dGVuc2lvbjogRXh0ZW5zaW9uID0gXCJwbmdcIik6IFByb21pc2U8UVJDYW52YXMgfCBRUlNWRz4ge1xuICAgIGlmICghdGhpcy5fcXIpIHRocm93IFwiUVIgY29kZSBpcyBlbXB0eVwiO1xuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBsZXQgcHJvbWlzZSwgc3ZnOiBRUlNWRztcblxuICAgICAgaWYgKHRoaXMuX3N2ZyAmJiB0aGlzLl9zdmdEcmF3aW5nUHJvbWlzZSkge1xuICAgICAgICBzdmcgPSB0aGlzLl9zdmc7XG4gICAgICAgIHByb21pc2UgPSB0aGlzLl9zdmdEcmF3aW5nUHJvbWlzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN2ZyA9IG5ldyBRUlNWRyh0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgcHJvbWlzZSA9IHN2Zy5kcmF3UVIodGhpcy5fcXIpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcm9taXNlO1xuXG4gICAgICByZXR1cm4gc3ZnO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcHJvbWlzZSwgY2FudmFzOiBRUkNhbnZhcztcblxuICAgICAgaWYgKHRoaXMuX2NhbnZhcyAmJiB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSkge1xuICAgICAgICBjYW52YXMgPSB0aGlzLl9jYW52YXM7XG4gICAgICAgIHByb21pc2UgPSB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbnZhcyA9IG5ldyBRUkNhbnZhcyh0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgcHJvbWlzZSA9IGNhbnZhcy5kcmF3UVIodGhpcy5fcXIpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcm9taXNlO1xuXG4gICAgICByZXR1cm4gY2FudmFzO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZShvcHRpb25zPzogUGFydGlhbDxPcHRpb25zPik6IHZvaWQge1xuICAgIFFSQ29kZVN0eWxpbmcuX2NsZWFyQ29udGFpbmVyKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnMgPyBzYW5pdGl6ZU9wdGlvbnMobWVyZ2VEZWVwKHRoaXMuX29wdGlvbnMsIG9wdGlvbnMpIGFzIFJlcXVpcmVkT3B0aW9ucykgOiB0aGlzLl9vcHRpb25zO1xuXG4gICAgaWYgKCF0aGlzLl9vcHRpb25zLmRhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9xciA9IHFyY29kZSh0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy50eXBlTnVtYmVyLCB0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCk7XG4gICAgdGhpcy5fcXIuYWRkRGF0YSh0aGlzLl9vcHRpb25zLmRhdGEsIHRoaXMuX29wdGlvbnMucXJPcHRpb25zLm1vZGUgfHwgZ2V0TW9kZSh0aGlzLl9vcHRpb25zLmRhdGEpKTtcbiAgICB0aGlzLl9xci5tYWtlKCk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50eXBlID09PSBkcmF3VHlwZXMuY2FudmFzKSB7XG4gICAgICB0aGlzLl9jYW52YXMgPSBuZXcgUVJDYW52YXModGhpcy5fb3B0aW9ucyk7XG4gICAgICB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSA9IHRoaXMuX2NhbnZhcy5kcmF3UVIodGhpcy5fcXIpO1xuICAgICAgdGhpcy5fc3ZnRHJhd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdmcgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N2ZyA9IG5ldyBRUlNWRyh0aGlzLl9vcHRpb25zKTtcbiAgICAgIHRoaXMuX3N2Z0RyYXdpbmdQcm9taXNlID0gdGhpcy5fc3ZnLmRyYXdRUih0aGlzLl9xcik7XG4gICAgICB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2NhbnZhcyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLmFwcGVuZCh0aGlzLl9jb250YWluZXIpO1xuICB9XG5cbiAgYXBwZW5kKGNvbnRhaW5lcj86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBcIkNvbnRhaW5lciBzaG91bGQgYmUgYSBzaW5nbGUgRE9NIG5vZGVcIjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50eXBlID09PSBkcmF3VHlwZXMuY2FudmFzKSB7XG4gICAgICBpZiAodGhpcy5fY2FudmFzKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMuZ2V0Q2FudmFzKCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fc3ZnKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcuZ2V0RWxlbWVudCgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG4gIH1cblxuICBhc3luYyBnZXRSYXdEYXRhKGV4dGVuc2lvbjogRXh0ZW5zaW9uID0gXCJwbmdcIik6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICBpZiAoIXRoaXMuX3FyKSB0aHJvdyBcIlFSIGNvZGUgaXMgZW1wdHlcIjtcbiAgICBjb25zdCBlbGVtZW50ID0gYXdhaXQgdGhpcy5fZ2V0UVJTdHlsaW5nRWxlbWVudChleHRlbnNpb24pO1xuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoKChlbGVtZW50IGFzIHVua25vd24pIGFzIFFSU1ZHKS5nZXRFbGVtZW50KCkpO1xuXG4gICAgICByZXR1cm4gbmV3IEJsb2IoWyc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgc3RhbmRhbG9uZT1cIm5vXCI/PlxcclxcbicgKyBzb3VyY2VdLCB7IHR5cGU6IFwiaW1hZ2Uvc3ZnK3htbFwiIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+XG4gICAgICAgICgoZWxlbWVudCBhcyB1bmtub3duKSBhcyBRUkNhbnZhcykuZ2V0Q2FudmFzKCkudG9CbG9iKHJlc29sdmUsIGBpbWFnZS8ke2V4dGVuc2lvbn1gLCAxKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBkb3dubG9hZChkb3dubG9hZE9wdGlvbnM/OiBQYXJ0aWFsPERvd25sb2FkT3B0aW9ucz4gfCBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX3FyKSB0aHJvdyBcIlFSIGNvZGUgaXMgZW1wdHlcIjtcbiAgICBsZXQgZXh0ZW5zaW9uID0gXCJwbmdcIiBhcyBFeHRlbnNpb247XG4gICAgbGV0IG5hbWUgPSBcInFyXCI7XG5cbiAgICAvL1RPRE8gcmVtb3ZlIGRlcHJlY2F0ZWQgY29kZSBpbiB0aGUgdjJcbiAgICBpZiAodHlwZW9mIGRvd25sb2FkT3B0aW9ucyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZXh0ZW5zaW9uID0gZG93bmxvYWRPcHRpb25zIGFzIEV4dGVuc2lvbjtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJFeHRlbnNpb24gaXMgZGVwcmVjYXRlZCBhcyBhcmd1bWVudCBmb3IgJ2Rvd25sb2FkJyBtZXRob2QsIHBsZWFzZSBwYXNzIG9iamVjdCB7IG5hbWU6ICcuLi4nLCBleHRlbnNpb246ICcuLi4nIH0gYXMgYXJndW1lbnRcIlxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb3dubG9hZE9wdGlvbnMgPT09IFwib2JqZWN0XCIgJiYgZG93bmxvYWRPcHRpb25zICE9PSBudWxsKSB7XG4gICAgICBpZiAoZG93bmxvYWRPcHRpb25zLm5hbWUpIHtcbiAgICAgICAgbmFtZSA9IGRvd25sb2FkT3B0aW9ucy5uYW1lO1xuICAgICAgfVxuICAgICAgaWYgKGRvd25sb2FkT3B0aW9ucy5leHRlbnNpb24pIHtcbiAgICAgICAgZXh0ZW5zaW9uID0gZG93bmxvYWRPcHRpb25zLmV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gYXdhaXQgdGhpcy5fZ2V0UVJTdHlsaW5nRWxlbWVudChleHRlbnNpb24pO1xuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcbiAgICAgIGxldCBzb3VyY2UgPSBzZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKCgoZWxlbWVudCBhcyB1bmtub3duKSBhcyBRUlNWRykuZ2V0RWxlbWVudCgpKTtcblxuICAgICAgc291cmNlID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBzdGFuZGFsb25lPVwibm9cIj8+XFxyXFxuJyArIHNvdXJjZTtcbiAgICAgIGNvbnN0IHVybCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc291cmNlKTtcbiAgICAgIGRvd25sb2FkVVJJKHVybCwgYCR7bmFtZX0uc3ZnYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHVybCA9ICgoZWxlbWVudCBhcyB1bmtub3duKSBhcyBRUkNhbnZhcykuZ2V0Q2FudmFzKCkudG9EYXRhVVJMKGBpbWFnZS8ke2V4dGVuc2lvbn1gKTtcbiAgICAgIGRvd25sb2FkVVJJKHVybCwgYCR7bmFtZX0uJHtleHRlbnNpb259YCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgcXJUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL3FyVHlwZXNcIjtcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9kcmF3VHlwZXNcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25MZXZlbHMgZnJvbSBcIi4uL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25MZXZlbHNcIjtcbmltcG9ydCB7IERvdFR5cGUsIE9wdGlvbnMsIFR5cGVOdW1iZXIsIEVycm9yQ29ycmVjdGlvbkxldmVsLCBNb2RlLCBEcmF3VHlwZSwgR3JhZGllbnQgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBSZXF1aXJlZE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25zIHtcbiAgdHlwZTogRHJhd1R5cGU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICBtYXJnaW46IG51bWJlcjtcbiAgZGF0YTogc3RyaW5nO1xuICBxck9wdGlvbnM6IHtcbiAgICB0eXBlTnVtYmVyOiBUeXBlTnVtYmVyO1xuICAgIG1vZGU/OiBNb2RlO1xuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBFcnJvckNvcnJlY3Rpb25MZXZlbDtcbiAgfTtcbiAgaW1hZ2VPcHRpb25zOiB7XG4gICAgaGlkZUJhY2tncm91bmREb3RzOiBib29sZWFuO1xuICAgIGltYWdlU2l6ZTogbnVtYmVyO1xuICAgIGNyb3NzT3JpZ2luPzogc3RyaW5nO1xuICAgIG1hcmdpbjogbnVtYmVyO1xuICB9O1xuICBkb3RzT3B0aW9uczoge1xuICAgIHR5cGU6IERvdFR5cGU7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xuICBiYWNrZ3JvdW5kT3B0aW9uczoge1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbn1cblxuY29uc3QgZGVmYXVsdE9wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucyA9IHtcbiAgdHlwZTogZHJhd1R5cGVzLmNhbnZhcyxcbiAgd2lkdGg6IDMwMCxcbiAgaGVpZ2h0OiAzMDAsXG4gIGRhdGE6IFwiXCIsXG4gIG1hcmdpbjogMCxcbiAgcXJPcHRpb25zOiB7XG4gICAgdHlwZU51bWJlcjogcXJUeXBlc1swXSxcbiAgICBtb2RlOiB1bmRlZmluZWQsXG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6IGVycm9yQ29ycmVjdGlvbkxldmVscy5RXG4gIH0sXG4gIGltYWdlT3B0aW9uczoge1xuICAgIGhpZGVCYWNrZ3JvdW5kRG90czogdHJ1ZSxcbiAgICBpbWFnZVNpemU6IDAuNCxcbiAgICBjcm9zc09yaWdpbjogdW5kZWZpbmVkLFxuICAgIG1hcmdpbjogMFxuICB9LFxuICBkb3RzT3B0aW9uczoge1xuICAgIHR5cGU6IFwic3F1YXJlXCIsXG4gICAgY29sb3I6IFwiIzAwMFwiXG4gIH0sXG4gIGJhY2tncm91bmRPcHRpb25zOiB7XG4gICAgY29sb3I6IFwiI2ZmZlwiXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRPcHRpb25zO1xuIiwiaW1wb3J0IGNhbGN1bGF0ZUltYWdlU2l6ZSBmcm9tIFwiLi4vdG9vbHMvY2FsY3VsYXRlSW1hZ2VTaXplXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMgZnJvbSBcIi4uL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50c1wiO1xuaW1wb3J0IFFSRG90IGZyb20gXCIuLi9maWd1cmVzL2RvdC9zdmcvUVJEb3RcIjtcbmltcG9ydCBRUkNvcm5lclNxdWFyZSBmcm9tIFwiLi4vZmlndXJlcy9jb3JuZXJTcXVhcmUvc3ZnL1FSQ29ybmVyU3F1YXJlXCI7XG5pbXBvcnQgUVJDb3JuZXJEb3QgZnJvbSBcIi4uL2ZpZ3VyZXMvY29ybmVyRG90L3N2Zy9RUkNvcm5lckRvdFwiO1xuaW1wb3J0IHsgUmVxdWlyZWRPcHRpb25zIH0gZnJvbSBcIi4vUVJPcHRpb25zXCI7XG5pbXBvcnQgZ3JhZGllbnRUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL2dyYWRpZW50VHlwZXNcIjtcbmltcG9ydCB7IFFSQ29kZSwgRmlsdGVyRnVuY3Rpb24sIEdyYWRpZW50IH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmNvbnN0IHNxdWFyZU1hc2sgPSBbXG4gIFsxLCAxLCAxLCAxLCAxLCAxLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAxLCAxLCAxLCAxLCAxLCAxXVxuXTtcblxuY29uc3QgZG90TWFzayA9IFtcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gIFswLCAwLCAxLCAxLCAxLCAwLCAwXSxcbiAgWzAsIDAsIDEsIDEsIDEsIDAsIDBdLFxuICBbMCwgMCwgMSwgMSwgMSwgMCwgMF0sXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUlNWRyB7XG4gIF9lbGVtZW50OiBTVkdFbGVtZW50O1xuICBfZGVmczogU1ZHRWxlbWVudDtcbiAgX2RvdHNDbGlwUGF0aD86IFNWR0VsZW1lbnQ7XG4gIF9jb3JuZXJzU3F1YXJlQ2xpcFBhdGg/OiBTVkdFbGVtZW50O1xuICBfY29ybmVyc0RvdENsaXBQYXRoPzogU1ZHRWxlbWVudDtcbiAgX29wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucztcbiAgX3FyPzogUVJDb2RlO1xuICBfaW1hZ2U/OiBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIC8vVE9ETyBkb24ndCBwYXNzIGFsbCBvcHRpb25zIHRvIHRoaXMgY2xhc3NcbiAgY29uc3RydWN0b3Iob3B0aW9uczogUmVxdWlyZWRPcHRpb25zKSB7XG4gICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKG9wdGlvbnMud2lkdGgpKTtcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcob3B0aW9ucy5oZWlnaHQpKTtcbiAgICB0aGlzLl9kZWZzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJkZWZzXCIpO1xuICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZGVmcyk7XG5cbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLndpZHRoO1xuICB9XG5cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLmhlaWdodDtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKTogU1ZHRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRFbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcbiAgICB0aGlzLl9lbGVtZW50ID0gb2xkRWxlbWVudC5jbG9uZU5vZGUoZmFsc2UpIGFzIFNWR0VsZW1lbnQ7XG4gICAgb2xkRWxlbWVudD8ucGFyZW50Tm9kZT8ucmVwbGFjZUNoaWxkKHRoaXMuX2VsZW1lbnQsIG9sZEVsZW1lbnQpO1xuICAgIHRoaXMuX2RlZnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImRlZnNcIik7XG4gICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9kZWZzKTtcbiAgfVxuXG4gIGFzeW5jIGRyYXdRUihxcjogUVJDb2RlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY291bnQgPSBxci5nZXRNb2R1bGVDb3VudCgpO1xuICAgIGNvbnN0IG1pblNpemUgPSBNYXRoLm1pbih0aGlzLl9vcHRpb25zLndpZHRoLCB0aGlzLl9vcHRpb25zLmhlaWdodCkgLSB0aGlzLl9vcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgY29uc3QgZG90U2l6ZSA9IG1pblNpemUgLyBjb3VudDtcbiAgICBsZXQgZHJhd0ltYWdlU2l6ZSA9IHtcbiAgICAgIGhpZGVYRG90czogMCxcbiAgICAgIGhpZGVZRG90czogMCxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfTtcblxuICAgIHRoaXMuX3FyID0gcXI7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5pbWFnZSkge1xuICAgICAgLy9XZSBuZWVkIGl0IHRvIGdldCBpbWFnZSBzaXplXG4gICAgICBhd2FpdCB0aGlzLmxvYWRJbWFnZSgpO1xuICAgICAgaWYgKCF0aGlzLl9pbWFnZSkgcmV0dXJuO1xuICAgICAgY29uc3QgeyBpbWFnZU9wdGlvbnMsIHFyT3B0aW9ucyB9ID0gdGhpcy5fb3B0aW9ucztcbiAgICAgIGNvbnN0IGNvdmVyTGV2ZWwgPSBpbWFnZU9wdGlvbnMuaW1hZ2VTaXplICogZXJyb3JDb3JyZWN0aW9uUGVyY2VudHNbcXJPcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsXTtcbiAgICAgIGNvbnN0IG1heEhpZGRlbkRvdHMgPSBNYXRoLmZsb29yKGNvdmVyTGV2ZWwgKiBjb3VudCAqIGNvdW50KTtcblxuICAgICAgZHJhd0ltYWdlU2l6ZSA9IGNhbGN1bGF0ZUltYWdlU2l6ZSh7XG4gICAgICAgIG9yaWdpbmFsV2lkdGg6IHRoaXMuX2ltYWdlLndpZHRoLFxuICAgICAgICBvcmlnaW5hbEhlaWdodDogdGhpcy5faW1hZ2UuaGVpZ2h0LFxuICAgICAgICBtYXhIaWRkZW5Eb3RzLFxuICAgICAgICBtYXhIaWRkZW5BeGlzRG90czogY291bnQgLSAxNCxcbiAgICAgICAgZG90U2l6ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZHJhd0JhY2tncm91bmQoKTtcbiAgICB0aGlzLmRyYXdEb3RzKChpOiBudW1iZXIsIGo6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2VPcHRpb25zLmhpZGVCYWNrZ3JvdW5kRG90cykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaSA+PSAoY291bnQgLSBkcmF3SW1hZ2VTaXplLmhpZGVYRG90cykgLyAyICYmXG4gICAgICAgICAgaSA8IChjb3VudCArIGRyYXdJbWFnZVNpemUuaGlkZVhEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqID49IChjb3VudCAtIGRyYXdJbWFnZVNpemUuaGlkZVlEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqIDwgKGNvdW50ICsgZHJhd0ltYWdlU2l6ZS5oaWRlWURvdHMpIC8gMlxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNxdWFyZU1hc2tbaV0/LltqXSB8fCBzcXVhcmVNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgc3F1YXJlTWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvdE1hc2tbaV0/LltqXSB8fCBkb3RNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgZG90TWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5kcmF3Q29ybmVycygpO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2UpIHtcbiAgICAgIHRoaXMuZHJhd0ltYWdlKHsgd2lkdGg6IGRyYXdJbWFnZVNpemUud2lkdGgsIGhlaWdodDogZHJhd0ltYWdlU2l6ZS5oZWlnaHQsIGNvdW50LCBkb3RTaXplIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRyYXdCYWNrZ3JvdW5kKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50O1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGdyYWRpZW50T3B0aW9ucyA9IG9wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnM/LmdyYWRpZW50O1xuICAgICAgY29uc3QgY29sb3IgPSBvcHRpb25zLmJhY2tncm91bmRPcHRpb25zPy5jb2xvcjtcblxuICAgICAgaWYgKGdyYWRpZW50T3B0aW9ucyB8fCBjb2xvcikge1xuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogZ3JhZGllbnRPcHRpb25zLFxuICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICBhZGRpdGlvbmFsUm90YXRpb246IDAsXG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgICAgd2lkdGg6IG9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgbmFtZTogXCJiYWNrZ3JvdW5kLWNvbG9yXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd0RvdHMoZmlsdGVyPzogRmlsdGVyRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3FyKSB7XG4gICAgICB0aHJvdyBcIlFSIGNvZGUgaXMgbm90IGRlZmluZWRcIjtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX3FyLmdldE1vZHVsZUNvdW50KCk7XG5cbiAgICBpZiAoY291bnQgPiBvcHRpb25zLndpZHRoIHx8IGNvdW50ID4gb3B0aW9ucy5oZWlnaHQpIHtcbiAgICAgIHRocm93IFwiVGhlIGNhbnZhcyBpcyB0b28gc21hbGwuXCI7XG4gICAgfVxuXG4gICAgY29uc3QgbWluU2l6ZSA9IE1hdGgubWluKG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0KSAtIG9wdGlvbnMubWFyZ2luICogMjtcbiAgICBjb25zdCBkb3RTaXplID0gbWluU2l6ZSAvIGNvdW50O1xuICAgIGNvbnN0IHhCZWdpbm5pbmcgPSAob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyO1xuICAgIGNvbnN0IHlCZWdpbm5pbmcgPSAob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMjtcbiAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgIHRoaXMuX2RvdHNDbGlwUGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiY2xpcFBhdGhcIik7XG4gICAgdGhpcy5fZG90c0NsaXBQYXRoLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY2xpcC1wYXRoLWRvdC1jb2xvclwiKTtcbiAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKHRoaXMuX2RvdHNDbGlwUGF0aCk7XG5cbiAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICBvcHRpb25zOiBvcHRpb25zLmRvdHNPcHRpb25zPy5ncmFkaWVudCxcbiAgICAgIGNvbG9yOiBvcHRpb25zLmRvdHNPcHRpb25zLmNvbG9yLFxuICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiAwLFxuICAgICAgeDogeEJlZ2lubmluZyxcbiAgICAgIHk6IHlCZWdpbm5pbmcsXG4gICAgICBoZWlnaHQ6IGNvdW50ICogZG90U2l6ZSxcbiAgICAgIHdpZHRoOiBjb3VudCAqIGRvdFNpemUsXG4gICAgICBuYW1lOiBcImRvdC1jb2xvclwiXG4gICAgfSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY291bnQ7IGorKykge1xuICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoaSwgaikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3FyPy5pc0RhcmsoaSwgaikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvdC5kcmF3KFxuICAgICAgICAgIHhCZWdpbm5pbmcgKyBpICogZG90U2l6ZSxcbiAgICAgICAgICB5QmVnaW5uaW5nICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGlmIChpICsgeE9mZnNldCA8IDAgfHwgaiArIHlPZmZzZXQgPCAwIHx8IGkgKyB4T2Zmc2V0ID49IGNvdW50IHx8IGogKyB5T2Zmc2V0ID49IGNvdW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoaSArIHhPZmZzZXQsIGogKyB5T2Zmc2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5fcXIgJiYgdGhpcy5fcXIuaXNEYXJrKGkgKyB4T2Zmc2V0LCBqICsgeU9mZnNldCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChkb3QuX2VsZW1lbnQgJiYgdGhpcy5fZG90c0NsaXBQYXRoKSB7XG4gICAgICAgICAgdGhpcy5fZG90c0NsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkcmF3Q29ybmVycygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3FyKSB7XG4gICAgICB0aHJvdyBcIlFSIGNvZGUgaXMgbm90IGRlZmluZWRcIjtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgdGhyb3cgXCJFbGVtZW50IGNvZGUgaXMgbm90IGRlZmluZWRcIjtcbiAgICB9XG5cbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX3FyLmdldE1vZHVsZUNvdW50KCk7XG4gICAgY29uc3QgbWluU2l6ZSA9IE1hdGgubWluKG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0KSAtIG9wdGlvbnMubWFyZ2luICogMjtcbiAgICBjb25zdCBkb3RTaXplID0gbWluU2l6ZSAvIGNvdW50O1xuICAgIGNvbnN0IGNvcm5lcnNTcXVhcmVTaXplID0gZG90U2l6ZSAqIDc7XG4gICAgY29uc3QgY29ybmVyc0RvdFNpemUgPSBkb3RTaXplICogMztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMjtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDI7XG5cbiAgICBbXG4gICAgICBbMCwgMCwgMF0sXG4gICAgICBbMSwgMCwgTWF0aC5QSSAvIDJdLFxuICAgICAgWzAsIDEsIC1NYXRoLlBJIC8gMl1cbiAgICBdLmZvckVhY2goKFtjb2x1bW4sIHJvdywgcm90YXRpb25dKSA9PiB7XG4gICAgICBjb25zdCB4ID0geEJlZ2lubmluZyArIGNvbHVtbiAqIGRvdFNpemUgKiAoY291bnQgLSA3KTtcbiAgICAgIGNvbnN0IHkgPSB5QmVnaW5uaW5nICsgcm93ICogZG90U2l6ZSAqIChjb3VudCAtIDcpO1xuICAgICAgbGV0IGNvcm5lcnNTcXVhcmVDbGlwUGF0aCA9IHRoaXMuX2RvdHNDbGlwUGF0aDtcbiAgICAgIGxldCBjb3JuZXJzRG90Q2xpcFBhdGggPSB0aGlzLl9kb3RzQ2xpcFBhdGg7XG5cbiAgICAgIGlmIChvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zPy5ncmFkaWVudCB8fCBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zPy5jb2xvcikge1xuICAgICAgICBjb3JuZXJzU3F1YXJlQ2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgICAgICBjb3JuZXJzU3F1YXJlQ2xpcFBhdGguc2V0QXR0cmlidXRlKFwiaWRcIiwgYGNsaXAtcGF0aC1jb3JuZXJzLXNxdWFyZS1jb2xvci0ke2NvbHVtbn0tJHtyb3d9YCk7XG4gICAgICAgIHRoaXMuX2RlZnMuYXBwZW5kQ2hpbGQoY29ybmVyc1NxdWFyZUNsaXBQYXRoKTtcbiAgICAgICAgdGhpcy5fY29ybmVyc1NxdWFyZUNsaXBQYXRoID0gdGhpcy5fY29ybmVyc0RvdENsaXBQYXRoID0gY29ybmVyc0RvdENsaXBQYXRoID0gY29ybmVyc1NxdWFyZUNsaXBQYXRoO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNvbG9yKHtcbiAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zPy5ncmFkaWVudCxcbiAgICAgICAgICBjb2xvcjogb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uY29sb3IsXG4gICAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiByb3RhdGlvbixcbiAgICAgICAgICB4LFxuICAgICAgICAgIHksXG4gICAgICAgICAgaGVpZ2h0OiBjb3JuZXJzU3F1YXJlU2l6ZSxcbiAgICAgICAgICB3aWR0aDogY29ybmVyc1NxdWFyZVNpemUsXG4gICAgICAgICAgbmFtZTogYGNvcm5lcnMtc3F1YXJlLWNvbG9yLSR7Y29sdW1ufS0ke3Jvd31gXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8udHlwZSkge1xuICAgICAgICBjb25zdCBjb3JuZXJzU3F1YXJlID0gbmV3IFFSQ29ybmVyU3F1YXJlKHsgc3ZnOiB0aGlzLl9lbGVtZW50LCB0eXBlOiBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgY29ybmVyc1NxdWFyZS5kcmF3KHgsIHksIGNvcm5lcnNTcXVhcmVTaXplLCByb3RhdGlvbik7XG5cbiAgICAgICAgaWYgKGNvcm5lcnNTcXVhcmUuX2VsZW1lbnQgJiYgY29ybmVyc1NxdWFyZUNsaXBQYXRoKSB7XG4gICAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoLmFwcGVuZENoaWxkKGNvcm5lcnNTcXVhcmUuX2VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNxdWFyZU1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNxdWFyZU1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghc3F1YXJlTWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFzcXVhcmVNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiBjb3JuZXJzU3F1YXJlQ2xpcFBhdGgpIHtcbiAgICAgICAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy5ncmFkaWVudCB8fCBvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy5jb2xvcikge1xuICAgICAgICBjb3JuZXJzRG90Q2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgICAgICBjb3JuZXJzRG90Q2xpcFBhdGguc2V0QXR0cmlidXRlKFwiaWRcIiwgYGNsaXAtcGF0aC1jb3JuZXJzLWRvdC1jb2xvci0ke2NvbHVtbn0tJHtyb3d9YCk7XG4gICAgICAgIHRoaXMuX2RlZnMuYXBwZW5kQ2hpbGQoY29ybmVyc0RvdENsaXBQYXRoKTtcbiAgICAgICAgdGhpcy5fY29ybmVyc0RvdENsaXBQYXRoID0gY29ybmVyc0RvdENsaXBQYXRoO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNvbG9yKHtcbiAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy5ncmFkaWVudCxcbiAgICAgICAgICBjb2xvcjogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uY29sb3IsXG4gICAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiByb3RhdGlvbixcbiAgICAgICAgICB4OiB4ICsgZG90U2l6ZSAqIDIsXG4gICAgICAgICAgeTogeSArIGRvdFNpemUgKiAyLFxuICAgICAgICAgIGhlaWdodDogY29ybmVyc0RvdFNpemUsXG4gICAgICAgICAgd2lkdGg6IGNvcm5lcnNEb3RTaXplLFxuICAgICAgICAgIG5hbWU6IGBjb3JuZXJzLWRvdC1jb2xvci0ke2NvbHVtbn0tJHtyb3d9YFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnM/LnR5cGUpIHtcbiAgICAgICAgY29uc3QgY29ybmVyc0RvdCA9IG5ldyBRUkNvcm5lckRvdCh7IHN2ZzogdGhpcy5fZWxlbWVudCwgdHlwZTogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucy50eXBlIH0pO1xuXG4gICAgICAgIGNvcm5lcnNEb3QuZHJhdyh4ICsgZG90U2l6ZSAqIDIsIHkgKyBkb3RTaXplICogMiwgY29ybmVyc0RvdFNpemUsIHJvdGF0aW9uKTtcblxuICAgICAgICBpZiAoY29ybmVyc0RvdC5fZWxlbWVudCAmJiBjb3JuZXJzRG90Q2xpcFBhdGgpIHtcbiAgICAgICAgICBjb3JuZXJzRG90Q2xpcFBhdGguYXBwZW5kQ2hpbGQoY29ybmVyc0RvdC5fZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGRvdCA9IG5ldyBRUkRvdCh7IHN2ZzogdGhpcy5fZWxlbWVudCwgdHlwZTogb3B0aW9ucy5kb3RzT3B0aW9ucy50eXBlIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG90TWFzay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZG90TWFza1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKCFkb3RNYXNrW2ldPy5bal0pIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvdC5kcmF3KFxuICAgICAgICAgICAgICB4ICsgaSAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIHkgKyBqICogZG90U2l6ZSxcbiAgICAgICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAgICAgKHhPZmZzZXQ6IG51bWJlciwgeU9mZnNldDogbnVtYmVyKTogYm9vbGVhbiA9PiAhIWRvdE1hc2tbaSArIHhPZmZzZXRdPy5baiArIHlPZmZzZXRdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoZG90Ll9lbGVtZW50ICYmIGNvcm5lcnNEb3RDbGlwUGF0aCkge1xuICAgICAgICAgICAgICBjb3JuZXJzRG90Q2xpcFBhdGguYXBwZW5kQ2hpbGQoZG90Ll9lbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRJbWFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICBpZiAoIW9wdGlvbnMuaW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChcIkltYWdlIGlzIG5vdCBkZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuaW1hZ2VPcHRpb25zLmNyb3NzT3JpZ2luID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGltYWdlLmNyb3NzT3JpZ2luID0gb3B0aW9ucy5pbWFnZU9wdGlvbnMuY3Jvc3NPcmlnaW47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ltYWdlID0gaW1hZ2U7XG4gICAgICBpbWFnZS5vbmxvYWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgICBpbWFnZS5zcmMgPSBvcHRpb25zLmltYWdlO1xuICAgIH0pO1xuICB9XG5cbiAgZHJhd0ltYWdlKHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgY291bnQsXG4gICAgZG90U2l6ZVxuICB9OiB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIGRvdFNpemU6IG51bWJlcjtcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IHhCZWdpbm5pbmcgPSAob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyO1xuICAgIGNvbnN0IHlCZWdpbm5pbmcgPSAob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMjtcbiAgICBjb25zdCBkeCA9IHhCZWdpbm5pbmcgKyBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKyAoY291bnQgKiBkb3RTaXplIC0gd2lkdGgpIC8gMjtcbiAgICBjb25zdCBkeSA9IHlCZWdpbm5pbmcgKyBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKyAoY291bnQgKiBkb3RTaXplIC0gaGVpZ2h0KSAvIDI7XG4gICAgY29uc3QgZHcgPSB3aWR0aCAtIG9wdGlvbnMuaW1hZ2VPcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgY29uc3QgZGggPSBoZWlnaHQgLSBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKiAyO1xuXG4gICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImltYWdlXCIpO1xuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgb3B0aW9ucy5pbWFnZSB8fCBcIlwiKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyhkeCkpO1xuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcInlcIiwgU3RyaW5nKGR5KSk7XG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgYCR7ZHd9cHhgKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgYCR7ZGh9cHhgKTtcblxuICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNvbG9yKHtcbiAgICBvcHRpb25zLFxuICAgIGNvbG9yLFxuICAgIGFkZGl0aW9uYWxSb3RhdGlvbixcbiAgICB4LFxuICAgIHksXG4gICAgaGVpZ2h0LFxuICAgIHdpZHRoLFxuICAgIG5hbWVcbiAgfToge1xuICAgIG9wdGlvbnM/OiBHcmFkaWVudDtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBhZGRpdGlvbmFsUm90YXRpb246IG51bWJlcjtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICB9KTogdm9pZCB7XG4gICAgY29uc3Qgc2l6ZSA9IHdpZHRoID4gaGVpZ2h0ID8gd2lkdGggOiBoZWlnaHQ7XG4gICAgY29uc3QgcmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicmVjdFwiKTtcbiAgICByZWN0LnNldEF0dHJpYnV0ZShcInhcIiwgU3RyaW5nKHgpKTtcbiAgICByZWN0LnNldEF0dHJpYnV0ZShcInlcIiwgU3RyaW5nKHkpKTtcbiAgICByZWN0LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcoaGVpZ2h0KSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBTdHJpbmcod2lkdGgpKTtcbiAgICByZWN0LnNldEF0dHJpYnV0ZShcImNsaXAtcGF0aFwiLCBgdXJsKCcjY2xpcC1wYXRoLSR7bmFtZX0nKWApO1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGxldCBncmFkaWVudDogU1ZHRWxlbWVudDtcbiAgICAgIGlmIChvcHRpb25zLnR5cGUgPT09IGdyYWRpZW50VHlwZXMucmFkaWFsKSB7XG4gICAgICAgIGdyYWRpZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyYWRpYWxHcmFkaWVudFwiKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgbmFtZSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImdyYWRpZW50VW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiZnhcIiwgU3RyaW5nKHggKyB3aWR0aCAvIDIpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiZnlcIiwgU3RyaW5nKHkgKyBoZWlnaHQgLyAyKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImN4XCIsIFN0cmluZyh4ICsgd2lkdGggLyAyKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImN5XCIsIFN0cmluZyh5ICsgaGVpZ2h0IC8gMikpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJyXCIsIFN0cmluZyhzaXplIC8gMikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgcm90YXRpb24gPSAoKG9wdGlvbnMucm90YXRpb24gfHwgMCkgKyBhZGRpdGlvbmFsUm90YXRpb24pICUgKDIgKiBNYXRoLlBJKTtcbiAgICAgICAgY29uc3QgcG9zaXRpdmVSb3RhdGlvbiA9IChyb3RhdGlvbiArIDIgKiBNYXRoLlBJKSAlICgyICogTWF0aC5QSSk7XG4gICAgICAgIGxldCB4MCA9IHggKyB3aWR0aCAvIDI7XG4gICAgICAgIGxldCB5MCA9IHkgKyBoZWlnaHQgLyAyO1xuICAgICAgICBsZXQgeDEgPSB4ICsgd2lkdGggLyAyO1xuICAgICAgICBsZXQgeTEgPSB5ICsgaGVpZ2h0IC8gMjtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgKHBvc2l0aXZlUm90YXRpb24gPj0gMCAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDAuMjUgKiBNYXRoLlBJKSB8fFxuICAgICAgICAgIChwb3NpdGl2ZVJvdGF0aW9uID4gMS43NSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAyICogTWF0aC5QSSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgeDAgPSB4MCAtIHdpZHRoIC8gMjtcbiAgICAgICAgICB5MCA9IHkwIC0gKGhlaWdodCAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICAgIHgxID0geDEgKyB3aWR0aCAvIDI7XG4gICAgICAgICAgeTEgPSB5MSArIChoZWlnaHQgLyAyKSAqIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGl2ZVJvdGF0aW9uID4gMC4yNSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAwLjc1ICogTWF0aC5QSSkge1xuICAgICAgICAgIHkwID0geTAgLSBoZWlnaHQgLyAyO1xuICAgICAgICAgIHgwID0geDAgLSB3aWR0aCAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgICAgeTEgPSB5MSArIGhlaWdodCAvIDI7XG4gICAgICAgICAgeDEgPSB4MSArIHdpZHRoIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGl2ZVJvdGF0aW9uID4gMC43NSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAxLjI1ICogTWF0aC5QSSkge1xuICAgICAgICAgIHgwID0geDAgKyB3aWR0aCAvIDI7XG4gICAgICAgICAgeTAgPSB5MCArIChoZWlnaHQgLyAyKSAqIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgICB4MSA9IHgxIC0gd2lkdGggLyAyO1xuICAgICAgICAgIHkxID0geTEgLSAoaGVpZ2h0IC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpdmVSb3RhdGlvbiA+IDEuMjUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMS43NSAqIE1hdGguUEkpIHtcbiAgICAgICAgICB5MCA9IHkwICsgaGVpZ2h0IC8gMjtcbiAgICAgICAgICB4MCA9IHgwICsgd2lkdGggLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICAgIHkxID0geTEgLSBoZWlnaHQgLyAyO1xuICAgICAgICAgIHgxID0geDEgLSB3aWR0aCAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBncmFkaWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwibGluZWFyR3JhZGllbnRcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIG5hbWUpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJncmFkaWVudFVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcIngxXCIsIFN0cmluZyhNYXRoLnJvdW5kKHgwKSkpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJ5MVwiLCBTdHJpbmcoTWF0aC5yb3VuZCh5MCkpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwieDJcIiwgU3RyaW5nKE1hdGgucm91bmQoeDEpKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcInkyXCIsIFN0cmluZyhNYXRoLnJvdW5kKHkxKSkpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zLmNvbG9yU3RvcHMuZm9yRWFjaCgoeyBvZmZzZXQsIGNvbG9yIH06IHsgb2Zmc2V0OiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfSkgPT4ge1xuICAgICAgICBjb25zdCBzdG9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdG9wXCIpO1xuICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcIm9mZnNldFwiLCBgJHsxMDAgKiBvZmZzZXR9JWApO1xuICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcInN0b3AtY29sb3JcIiwgY29sb3IpO1xuICAgICAgICBncmFkaWVudC5hcHBlbmRDaGlsZChzdG9wKTtcbiAgICAgIH0pO1xuXG4gICAgICByZWN0LnNldEF0dHJpYnV0ZShcImZpbGxcIiwgYHVybCgnIyR7bmFtZX0nKWApO1xuICAgICAgdGhpcy5fZGVmcy5hcHBlbmRDaGlsZChncmFkaWVudCk7XG4gICAgfSBlbHNlIGlmIChjb2xvcikge1xuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIGNvbG9yKTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHJlY3QpO1xuICB9XG59XG4iLCJpbXBvcnQgY29ybmVyRG90VHlwZXMgZnJvbSBcIi4uLy4uLy4uL2NvbnN0YW50cy9jb3JuZXJEb3RUeXBlc1wiO1xuaW1wb3J0IHsgQ29ybmVyRG90VHlwZSwgUm90YXRlRmlndXJlQXJnc0NhbnZhcywgQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcywgRHJhd0FyZ3NDYW52YXMgfSBmcm9tIFwiLi4vLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJDb3JuZXJEb3Qge1xuICBfY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICBfdHlwZTogQ29ybmVyRG90VHlwZTtcblxuICBjb25zdHJ1Y3Rvcih7IGNvbnRleHQsIHR5cGUgfTogeyBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7IHR5cGU6IENvcm5lckRvdFR5cGUgfSkge1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2NvbnRleHQ7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuX3R5cGU7XG4gICAgbGV0IGRyYXdGdW5jdGlvbjtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5zcXVhcmU6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdTcXVhcmU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5kb3Q6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RG90O1xuICAgIH1cblxuICAgIGRyYXdGdW5jdGlvbi5jYWxsKHRoaXMsIHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfcm90YXRlRmlndXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gPSAwLCBkcmF3IH06IFJvdGF0ZUZpZ3VyZUFyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCBjeCA9IHggKyBzaXplIC8gMjtcbiAgICBjb25zdCBjeSA9IHkgKyBzaXplIC8gMjtcblxuICAgIGNvbnRleHQudHJhbnNsYXRlKGN4LCBjeSk7XG4gICAgcm90YXRpb24gJiYgY29udGV4dC5yb3RhdGUocm90YXRpb24pO1xuICAgIGRyYXcoKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHJvdGF0aW9uICYmIGNvbnRleHQucm90YXRlKC1yb3RhdGlvbik7XG4gICAgY29udGV4dC50cmFuc2xhdGUoLWN4LCAtY3kpO1xuICB9XG5cbiAgX2Jhc2ljRG90KGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIGNvbnRleHQgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgc2l6ZSAvIDIsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY1NxdWFyZShhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQucmVjdCgtc2l6ZSAvIDIsIC1zaXplIC8gMiwgc2l6ZSwgc2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfZHJhd0RvdCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3U3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfTogRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgY29ybmVyRG90VHlwZXMgZnJvbSBcIi4uLy4uLy4uL2NvbnN0YW50cy9jb3JuZXJEb3RUeXBlc1wiO1xuaW1wb3J0IHsgQ29ybmVyRG90VHlwZSwgUm90YXRlRmlndXJlQXJncywgQmFzaWNGaWd1cmVEcmF3QXJncywgRHJhd0FyZ3MgfSBmcm9tIFwiLi4vLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJDb3JuZXJEb3Qge1xuICBfZWxlbWVudD86IFNWR0VsZW1lbnQ7XG4gIF9zdmc6IFNWR0VsZW1lbnQ7XG4gIF90eXBlOiBDb3JuZXJEb3RUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHsgc3ZnLCB0eXBlIH06IHsgc3ZnOiBTVkdFbGVtZW50OyB0eXBlOiBDb3JuZXJEb3RUeXBlIH0pIHtcbiAgICB0aGlzLl9zdmcgPSBzdmc7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gIH1cblxuICBkcmF3KHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICBsZXQgZHJhd0Z1bmN0aW9uO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIGNvcm5lckRvdFR5cGVzLnNxdWFyZTpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1NxdWFyZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGNvcm5lckRvdFR5cGVzLmRvdDpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdEb3Q7XG4gICAgfVxuXG4gICAgZHJhd0Z1bmN0aW9uLmNhbGwodGhpcywgeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9yb3RhdGVGaWd1cmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiA9IDAsIGRyYXcgfTogUm90YXRlRmlndXJlQXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGN4ID0geCArIHNpemUgLyAyO1xuICAgIGNvbnN0IGN5ID0geSArIHNpemUgLyAyO1xuXG4gICAgZHJhdygpO1xuICAgIHRoaXMuX2VsZW1lbnQ/LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBgcm90YXRlKCR7KDE4MCAqIHJvdGF0aW9uKSAvIE1hdGguUEl9LCR7Y3h9LCR7Y3l9KWApO1xuICB9XG5cbiAgX2Jhc2ljRG90KGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiY2lyY2xlXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImN4XCIsIFN0cmluZyh4ICsgc2l6ZSAvIDIpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjeVwiLCBTdHJpbmcoeSArIHNpemUgLyAyKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiclwiLCBTdHJpbmcoc2l6ZSAvIDIpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY1NxdWFyZShhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInJlY3RcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwieFwiLCBTdHJpbmcoeCkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInlcIiwgU3RyaW5nKHkpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvcm5lclNxdWFyZVR5cGVzIGZyb20gXCIuLi8uLi8uLi9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXNcIjtcbmltcG9ydCB7IENvcm5lclNxdWFyZVR5cGUsIFJvdGF0ZUZpZ3VyZUFyZ3NDYW52YXMsIEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMsIERyYXdBcmdzQ2FudmFzIH0gZnJvbSBcIi4uLy4uLy4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29ybmVyU3F1YXJlIHtcbiAgX2NvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgX3R5cGU6IENvcm5lclNxdWFyZVR5cGU7XG5cbiAgY29uc3RydWN0b3IoeyBjb250ZXh0LCB0eXBlIH06IHsgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEOyB0eXBlOiBDb3JuZXJTcXVhcmVUeXBlIH0pIHtcbiAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGRyYXcoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgcm90YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9jb250ZXh0O1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuc3F1YXJlOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZG90OlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBjb250ZXh0LnRyYW5zbGF0ZShjeCwgY3kpO1xuICAgIHJvdGF0aW9uICYmIGNvbnRleHQucm90YXRlKHJvdGF0aW9uKTtcbiAgICBkcmF3KCk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICByb3RhdGlvbiAmJiBjb250ZXh0LnJvdGF0ZSgtcm90YXRpb24pO1xuICAgIGNvbnRleHQudHJhbnNsYXRlKC1jeCwgLWN5KTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRvdFNpemUgPSBzaXplIC8gNztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmFyYygwLCAwLCBzaXplIC8gMiwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICBjb250ZXh0LmFyYygwLCAwLCBzaXplIC8gMiAtIGRvdFNpemUsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY1NxdWFyZShhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRvdFNpemUgPSBzaXplIC8gNztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LnJlY3QoLXNpemUgLyAyLCAtc2l6ZSAvIDIsIHNpemUsIHNpemUpO1xuICAgICAgICBjb250ZXh0LnJlY3QoLXNpemUgLyAyICsgZG90U2l6ZSwgLXNpemUgLyAyICsgZG90U2l6ZSwgc2l6ZSAtIDIgKiBkb3RTaXplLCBzaXplIC0gMiAqIGRvdFNpemUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljRXh0cmFSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIGNvbnRleHQgfSA9IGFyZ3M7XG4gICAgY29uc3QgZG90U2l6ZSA9IHNpemUgLyA3O1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKC1kb3RTaXplLCAtZG90U2l6ZSwgMi41ICogZG90U2l6ZSwgTWF0aC5QSSwgLU1hdGguUEkgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oZG90U2l6ZSwgLTMuNSAqIGRvdFNpemUpO1xuICAgICAgICBjb250ZXh0LmFyYyhkb3RTaXplLCAtZG90U2l6ZSwgMi41ICogZG90U2l6ZSwgLU1hdGguUEkgLyAyLCAwKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oMy41ICogZG90U2l6ZSwgLWRvdFNpemUpO1xuICAgICAgICBjb250ZXh0LmFyYyhkb3RTaXplLCBkb3RTaXplLCAyLjUgKiBkb3RTaXplLCAwLCBNYXRoLlBJIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC1kb3RTaXplLCAzLjUgKiBkb3RTaXplKTtcbiAgICAgICAgY29udGV4dC5hcmMoLWRvdFNpemUsIGRvdFNpemUsIDIuNSAqIGRvdFNpemUsIE1hdGguUEkgLyAyLCBNYXRoLlBJKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oLTMuNSAqIGRvdFNpemUsIC1kb3RTaXplKTtcblxuICAgICAgICBjb250ZXh0LmFyYygtZG90U2l6ZSwgLWRvdFNpemUsIDEuNSAqIGRvdFNpemUsIE1hdGguUEksIC1NYXRoLlBJIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGRvdFNpemUsIC0yLjUgKiBkb3RTaXplKTtcbiAgICAgICAgY29udGV4dC5hcmMoZG90U2l6ZSwgLWRvdFNpemUsIDEuNSAqIGRvdFNpemUsIC1NYXRoLlBJIC8gMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKDIuNSAqIGRvdFNpemUsIC1kb3RTaXplKTtcbiAgICAgICAgY29udGV4dC5hcmMoZG90U2l6ZSwgZG90U2l6ZSwgMS41ICogZG90U2l6ZSwgMCwgTWF0aC5QSSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtZG90U2l6ZSwgMi41ICogZG90U2l6ZSk7XG4gICAgICAgIGNvbnRleHQuYXJjKC1kb3RTaXplLCBkb3RTaXplLCAxLjUgKiBkb3RTaXplLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC0yLjUgKiBkb3RTaXplLCAtZG90U2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfZHJhd0RvdCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3U3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfTogRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX2RyYXdFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfSk7XG4gIH1cbn1cbiIsImltcG9ydCBjb3JuZXJTcXVhcmVUeXBlcyBmcm9tIFwiLi4vLi4vLi4vY29uc3RhbnRzL2Nvcm5lclNxdWFyZVR5cGVzXCI7XG5pbXBvcnQgeyBDb3JuZXJTcXVhcmVUeXBlLCBEcmF3QXJncywgQmFzaWNGaWd1cmVEcmF3QXJncywgUm90YXRlRmlndXJlQXJncyB9IGZyb20gXCIuLi8uLi8uLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkNvcm5lclNxdWFyZSB7XG4gIF9lbGVtZW50PzogU1ZHRWxlbWVudDtcbiAgX3N2ZzogU1ZHRWxlbWVudDtcbiAgX3R5cGU6IENvcm5lclNxdWFyZVR5cGU7XG5cbiAgY29uc3RydWN0b3IoeyBzdmcsIHR5cGUgfTogeyBzdmc6IFNWR0VsZW1lbnQ7IHR5cGU6IENvcm5lclNxdWFyZVR5cGUgfSkge1xuICAgIHRoaXMuX3N2ZyA9IHN2ZztcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGRyYXcoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgcm90YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuc3F1YXJlOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZG90OlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBkcmF3KCk7XG4gICAgdGhpcy5fZWxlbWVudD8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoJHsoMTgwICogcm90YXRpb24pIC8gTWF0aC5QSX0sJHtjeH0sJHtjeX0pYCk7XG4gIH1cblxuICBfYmFzaWNEb3QoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjbGlwLXJ1bGVcIiwgXCJldmVub2RkXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3ggKyBzaXplIC8gMn0gJHt5fWAgKyAvLyBNIGN4LCB5IC8vICBNb3ZlIHRvIHRvcCBvZiByaW5nXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSAwIDEgMCAwLjEgMGAgKyAvLyBhIG91dGVyUmFkaXVzLCBvdXRlclJhZGl1cywgMCwgMSwgMCwgMSwgMCAvLyBEcmF3IG91dGVyIGFyYywgYnV0IGRvbid0IGNsb3NlIGl0XG4gICAgICAgICAgICBgemAgKyAvLyBaIC8vIENsb3NlIHRoZSBvdXRlciBzaGFwZVxuICAgICAgICAgICAgYG0gMCAke2RvdFNpemV9YCArIC8vIG0gLTEgb3V0ZXJSYWRpdXMtaW5uZXJSYWRpdXMgLy8gTW92ZSB0byB0b3AgcG9pbnQgb2YgaW5uZXIgcmFkaXVzXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyIC0gZG90U2l6ZX0gJHtzaXplIC8gMiAtIGRvdFNpemV9IDAgMSAxIC0wLjEgMGAgKyAvLyBhIGlubmVyUmFkaXVzLCBpbm5lclJhZGl1cywgMCwgMSwgMSwgLTEsIDAgLy8gRHJhdyBpbm5lciBhcmMsIGJ1dCBkb24ndCBjbG9zZSBpdFxuICAgICAgICAgICAgYFpgIC8vIFogLy8gQ2xvc2UgdGhlIGlubmVyIHJpbmcuIEFjdHVhbGx5IHdpbGwgc3RpbGwgd29yayB3aXRob3V0LCBidXQgaW5uZXIgcmluZyB3aWxsIGhhdmUgb25lIHVuaXQgbWlzc2luZyBpbiBzdHJva2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY1NxdWFyZShhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRvdFNpemUgPSBzaXplIC8gNztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImNsaXAtcnVsZVwiLCBcImV2ZW5vZGRcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgK1xuICAgICAgICAgICAgYHYgJHtzaXplfWAgK1xuICAgICAgICAgICAgYGggJHtzaXplfWAgK1xuICAgICAgICAgICAgYHYgJHstc2l6ZX1gICtcbiAgICAgICAgICAgIGB6YCArXG4gICAgICAgICAgICBgTSAke3ggKyBkb3RTaXplfSAke3kgKyBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGggJHtzaXplIC0gMiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgdiAke3NpemUgLSAyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBoICR7LXNpemUgKyAyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGB6YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljRXh0cmFSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG4gICAgY29uc3QgZG90U2l6ZSA9IHNpemUgLyA3O1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3kgKyAyLjUgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYHYgJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHtkb3RTaXplICogMi41fSAke2RvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgaCAkezIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsyLjUgKiBkb3RTaXplfSAkezIuNSAqIGRvdFNpemV9LCAwLCAwLCAwLCAke2RvdFNpemUgKiAyLjV9ICR7LWRvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgdiAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHstZG90U2l6ZSAqIDIuNX0gJHstZG90U2l6ZSAqIDIuNX1gICtcbiAgICAgICAgICAgIGBoICR7LTIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsyLjUgKiBkb3RTaXplfSAkezIuNSAqIGRvdFNpemV9LCAwLCAwLCAwLCAkey1kb3RTaXplICogMi41fSAke2RvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgTSAke3ggKyAyLjUgKiBkb3RTaXplfSAke3kgKyBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGggJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHtkb3RTaXplICogMS41fSAke2RvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgdiAkezIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsxLjUgKiBkb3RTaXplfSAkezEuNSAqIGRvdFNpemV9LCAwLCAwLCAxLCAkey1kb3RTaXplICogMS41fSAke2RvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgaCAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHstZG90U2l6ZSAqIDEuNX0gJHstZG90U2l6ZSAqIDEuNX1gICtcbiAgICAgICAgICAgIGB2ICR7LTIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsxLjUgKiBkb3RTaXplfSAkezEuNSAqIGRvdFNpemV9LCAwLCAwLCAxLCAke2RvdFNpemUgKiAxLjV9ICR7LWRvdFNpemUgKiAxLjV9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3RXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgZG90VHlwZXMgZnJvbSBcIi4uLy4uLy4uL2NvbnN0YW50cy9kb3RUeXBlc1wiO1xuaW1wb3J0IHtcbiAgRG90VHlwZSxcbiAgR2V0TmVpZ2hib3IsXG4gIFJvdGF0ZUZpZ3VyZUFyZ3NDYW52YXMsXG4gIEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMsXG4gIERyYXdBcmdzQ2FudmFzXG59IGZyb20gXCIuLi8uLi8uLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkRvdCB7XG4gIF9jb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gIF90eXBlOiBEb3RUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHsgY29udGV4dCwgdHlwZSB9OiB7IGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDsgdHlwZTogRG90VHlwZSB9KSB7XG4gICAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gIH1cblxuICBkcmF3KHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIGdldE5laWdoYm9yOiBHZXROZWlnaGJvcik6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9jb250ZXh0O1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgZG90VHlwZXMuZG90czpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLmNsYXNzeTpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0NsYXNzeTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLmNsYXNzeVJvdW5kZWQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdDbGFzc3lSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMucm91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1JvdW5kZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5leHRyYVJvdW5kZWQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdFeHRyYVJvdW5kZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5zcXVhcmU6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgIH1cblxuICAgIGRyYXdGdW5jdGlvbi5jYWxsKHRoaXMsIHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgZ2V0TmVpZ2hib3IgfSk7XG4gIH1cblxuICBfcm90YXRlRmlndXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gPSAwLCBkcmF3IH06IFJvdGF0ZUZpZ3VyZUFyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCBjeCA9IHggKyBzaXplIC8gMjtcbiAgICBjb25zdCBjeSA9IHkgKyBzaXplIC8gMjtcblxuICAgIGNvbnRleHQudHJhbnNsYXRlKGN4LCBjeSk7XG4gICAgcm90YXRpb24gJiYgY29udGV4dC5yb3RhdGUocm90YXRpb24pO1xuICAgIGRyYXcoKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHJvdGF0aW9uICYmIGNvbnRleHQucm90YXRlKC1yb3RhdGlvbik7XG4gICAgY29udGV4dC50cmFuc2xhdGUoLWN4LCAtY3kpO1xuICB9XG5cbiAgX2Jhc2ljRG90KGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIGNvbnRleHQgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgc2l6ZSAvIDIsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY1NxdWFyZShhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQucmVjdCgtc2l6ZSAvIDIsIC1zaXplIC8gMiwgc2l6ZSwgc2l6ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gcmlnaHQgc2lkZSBpcyByb3VuZGVkXG4gIF9iYXNpY1NpZGVSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIGNvbnRleHQgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgc2l6ZSAvIDIsIC1NYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtc2l6ZSAvIDIsIHNpemUgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oLXNpemUgLyAyLCAtc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygwLCAtc2l6ZSAvIDIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIHRvcCByaWdodCBjb3JuZXIgaXMgcm91bmRlZFxuICBfYmFzaWNDb3JuZXJSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIGNvbnRleHQgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgc2l6ZSAvIDIsIC1NYXRoLlBJIC8gMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHNpemUgLyAyLCBzaXplIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC1zaXplIC8gMiwgc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtc2l6ZSAvIDIsIC1zaXplIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKDAsIC1zaXplIC8gMik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gdG9wIHJpZ2h0IGNvcm5lciBpcyByb3VuZGVkXG4gIF9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKC1zaXplIC8gMiwgc2l6ZSAvIDIsIHNpemUsIC1NYXRoLlBJIC8gMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC1zaXplIC8gMiwgc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtc2l6ZSAvIDIsIC1zaXplIC8gMik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNDb3JuZXJzUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHNpemUgLyAyLCAtTWF0aC5QSSAvIDIsIDApO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhzaXplIC8gMiwgc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygwLCBzaXplIC8gMik7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHNpemUgLyAyLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC1zaXplIC8gMiwgLXNpemUgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oMCwgLXNpemUgLyAyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY0Nvcm5lcnNFeHRyYVJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmFyYygtc2l6ZSAvIDIsIHNpemUgLyAyLCBzaXplLCAtTWF0aC5QSSAvIDIsIDApO1xuICAgICAgICBjb250ZXh0LmFyYyhzaXplIC8gMiwgLXNpemUgLyAyLCBzaXplLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfZHJhd0RvdCh7IHgsIHksIHNpemUsIGNvbnRleHQgfTogRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdTcXVhcmUoeyB4LCB5LCBzaXplLCBjb250ZXh0IH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbjogMCB9KTtcbiAgfVxuXG4gIF9kcmF3Um91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIGdldE5laWdoYm9yIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID4gMiB8fCAobGVmdE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHx8ICh0b3BOZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikpIHtcbiAgICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAyKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAobGVmdE5laWdoYm9yICYmIHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHRvcE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDEpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZHJhd0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIGdldE5laWdoYm9yIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID4gMiB8fCAobGVmdE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHx8ICh0b3BOZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikpIHtcbiAgICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAyKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAobGVmdE5laWdoYm9yICYmIHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHRvcE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMSkge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNTaWRlUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIF9kcmF3Q2xhc3N5KHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJzUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWxlZnROZWlnaGJvciAmJiAhdG9wTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyaWdodE5laWdoYm9yICYmICFib3R0b21OZWlnaGJvcikge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gIH1cblxuICBfZHJhd0NsYXNzeVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCBnZXROZWlnaGJvciB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lcnNSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbGVmdE5laWdoYm9yICYmICF0b3BOZWlnaGJvcikge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbjogLU1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcmlnaHROZWlnaGJvciAmJiAhYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBkb3RUeXBlcyBmcm9tIFwiLi4vLi4vLi4vY29uc3RhbnRzL2RvdFR5cGVzXCI7XG5pbXBvcnQgeyBEb3RUeXBlLCBHZXROZWlnaGJvciwgRHJhd0FyZ3MsIEJhc2ljRmlndXJlRHJhd0FyZ3MsIFJvdGF0ZUZpZ3VyZUFyZ3MgfSBmcm9tIFwiLi4vLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJEb3Qge1xuICBfZWxlbWVudD86IFNWR0VsZW1lbnQ7XG4gIF9zdmc6IFNWR0VsZW1lbnQ7XG4gIF90eXBlOiBEb3RUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHsgc3ZnLCB0eXBlIH06IHsgc3ZnOiBTVkdFbGVtZW50OyB0eXBlOiBEb3RUeXBlIH0pIHtcbiAgICB0aGlzLl9zdmcgPSBzdmc7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gIH1cblxuICBkcmF3KHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIGdldE5laWdoYm9yOiBHZXROZWlnaGJvcik6IHZvaWQge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgZG90VHlwZXMuZG90czpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLmNsYXNzeTpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0NsYXNzeTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLmNsYXNzeVJvdW5kZWQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdDbGFzc3lSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMucm91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1JvdW5kZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5leHRyYVJvdW5kZWQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdFeHRyYVJvdW5kZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5zcXVhcmU6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgIH1cblxuICAgIGRyYXdGdW5jdGlvbi5jYWxsKHRoaXMsIHsgeCwgeSwgc2l6ZSwgZ2V0TmVpZ2hib3IgfSk7XG4gIH1cblxuICBfcm90YXRlRmlndXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gPSAwLCBkcmF3IH06IFJvdGF0ZUZpZ3VyZUFyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBjeCA9IHggKyBzaXplIC8gMjtcbiAgICBjb25zdCBjeSA9IHkgKyBzaXplIC8gMjtcblxuICAgIGRyYXcoKTtcbiAgICB0aGlzLl9lbGVtZW50Py5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSgkeygxODAgKiByb3RhdGlvbikgLyBNYXRoLlBJfSwke2N4fSwke2N5fSlgKTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNpcmNsZVwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoeCArIHNpemUgLyAyKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3lcIiwgU3RyaW5nKHkgKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInJcIiwgU3RyaW5nKHNpemUgLyAyKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInhcIiwgU3RyaW5nKHgpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZyh5KSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vaWYgcm90YXRpb24gPT09IDAgLSByaWdodCBzaWRlIGlzIHJvdW5kZWRcbiAgX2Jhc2ljU2lkZVJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byB0b3AgbGVmdCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIGxlZnQgYm90dG9tIGNvcm5lciArIGhhbGYgb2Ygc2l6ZSByaWdodFxuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0sIDAsIDAsIDAsIDAgJHstc2l6ZX1gIC8vIGRyYXcgcm91bmRlZCBjb3JuZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vaWYgcm90YXRpb24gPT09IDAgLSB0b3AgcmlnaHQgY29ybmVyIGlzIHJvdW5kZWRcbiAgX2Jhc2ljQ29ybmVyUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgKyAvL2dvIHRvIHRvcCBsZWZ0IHBvc2l0aW9uXG4gICAgICAgICAgICBgdiAke3NpemV9YCArIC8vZHJhdyBsaW5lIHRvIGxlZnQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGggJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byByaWdodCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgdiAkey1zaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lciArIGhhbGYgb2Ygc2l6ZSB0b3BcbiAgICAgICAgICAgIGBhICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9LCAwLCAwLCAwLCAkey1zaXplIC8gMn0gJHstc2l6ZSAvIDJ9YCAvLyBkcmF3IHJvdW5kZWQgY29ybmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gdG9wIHJpZ2h0IGNvcm5lciBpcyByb3VuZGVkXG4gIF9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgKyAvL2dvIHRvIHRvcCBsZWZ0IHBvc2l0aW9uXG4gICAgICAgICAgICBgdiAke3NpemV9YCArIC8vZHJhdyBsaW5lIHRvIGxlZnQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGggJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byByaWdodCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgYSAke3NpemV9ICR7c2l6ZX0sIDAsIDAsIDAsICR7LXNpemV9ICR7LXNpemV9YCAvLyBkcmF3IHJvdW5kZWQgdG9wIHJpZ2h0IGNvcm5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIGxlZnQgYm90dG9tIGFuZCByaWdodCB0b3AgY29ybmVycyBhcmUgcm91bmRlZFxuICBfYmFzaWNDb3JuZXJzUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgKyAvL2dvIHRvIGxlZnQgdG9wIHBvc2l0aW9uXG4gICAgICAgICAgICBgdiAke3NpemUgLyAyfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IHRvcCBjb3JuZXIgKyBoYWxmIG9mIHNpemUgYm90dG9tXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSwgMCwgMCwgMCwgJHtzaXplIC8gMn0gJHtzaXplIC8gMn1gICsgLy8gZHJhdyByb3VuZGVkIGxlZnQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGggJHtzaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYHYgJHstc2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIHJpZ2h0IGJvdHRvbSBjb3JuZXIgKyBoYWxmIG9mIHNpemUgdG9wXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSwgMCwgMCwgMCwgJHstc2l6ZSAvIDJ9ICR7LXNpemUgLyAyfWAgLy8gZHJhdyByb3VuZGVkIHJpZ2h0IHRvcCBjb3JuZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9kcmF3RG90KHsgeCwgeSwgc2l6ZSB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPiAyIHx8IChsZWZ0TmVpZ2hib3IgJiYgcmlnaHROZWlnaGJvcikgfHwgKHRvcE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSkge1xuICAgICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDIpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmIChsZWZ0TmVpZ2hib3IgJiYgdG9wTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICAgIH0gZWxzZSBpZiAodG9wTmVpZ2hib3IgJiYgcmlnaHROZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEk7XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0TmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMSkge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNTaWRlUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIF9kcmF3RXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPiAyIHx8IChsZWZ0TmVpZ2hib3IgJiYgcmlnaHROZWlnaGJvcikgfHwgKHRvcE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSkge1xuICAgICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDIpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmIChsZWZ0TmVpZ2hib3IgJiYgdG9wTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICAgIH0gZWxzZSBpZiAodG9wTmVpZ2hib3IgJiYgcmlnaHROZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEk7XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0TmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAxKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAodG9wTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEk7XG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY1NpZGVSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgX2RyYXdDbGFzc3koeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lcnNSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbGVmdE5laWdoYm9yICYmICF0b3BOZWlnaGJvcikge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IC1NYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJpZ2h0TmVpZ2hib3IgJiYgIWJvdHRvbU5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgfVxuXG4gIF9kcmF3Q2xhc3N5Um91bmRlZCh7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyc1JvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFsZWZ0TmVpZ2hib3IgJiYgIXRvcE5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyaWdodE5laWdoYm9yICYmICFib3R0b21OZWlnaGJvcikge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgfVxufVxuIiwiaW50ZXJmYWNlIEltYWdlU2l6ZU9wdGlvbnMge1xuICBvcmlnaW5hbEhlaWdodDogbnVtYmVyO1xuICBvcmlnaW5hbFdpZHRoOiBudW1iZXI7XG4gIG1heEhpZGRlbkRvdHM6IG51bWJlcjtcbiAgbWF4SGlkZGVuQXhpc0RvdHM/OiBudW1iZXI7XG4gIGRvdFNpemU6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIEltYWdlU2l6ZVJlc3VsdCB7XG4gIGhlaWdodDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoaWRlWURvdHM6IG51bWJlcjtcbiAgaGlkZVhEb3RzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNhbGN1bGF0ZUltYWdlU2l6ZSh7XG4gIG9yaWdpbmFsSGVpZ2h0LFxuICBvcmlnaW5hbFdpZHRoLFxuICBtYXhIaWRkZW5Eb3RzLFxuICBtYXhIaWRkZW5BeGlzRG90cyxcbiAgZG90U2l6ZVxufTogSW1hZ2VTaXplT3B0aW9ucyk6IEltYWdlU2l6ZVJlc3VsdCB7XG4gIGNvbnN0IGhpZGVEb3RzID0geyB4OiAwLCB5OiAwIH07XG4gIGNvbnN0IGltYWdlU2l6ZSA9IHsgeDogMCwgeTogMCB9O1xuXG4gIGlmIChvcmlnaW5hbEhlaWdodCA8PSAwIHx8IG9yaWdpbmFsV2lkdGggPD0gMCB8fCBtYXhIaWRkZW5Eb3RzIDw9IDAgfHwgZG90U2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlaWdodDogMCxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGlkZVlEb3RzOiAwLFxuICAgICAgaGlkZVhEb3RzOiAwXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGsgPSBvcmlnaW5hbEhlaWdodCAvIG9yaWdpbmFsV2lkdGg7XG5cbiAgLy9HZXR0aW5nIHRoZSBtYXhpbXVtIHBvc3NpYmxlIGF4aXMgaGlkZGVuIGRvdHNcbiAgaGlkZURvdHMueCA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KG1heEhpZGRlbkRvdHMgLyBrKSk7XG4gIC8vVGhlIGNvdW50IG9mIGhpZGRlbiBkb3QncyBjYW4ndCBiZSBsZXNzIHRoYW4gMVxuICBpZiAoaGlkZURvdHMueCA8PSAwKSBoaWRlRG90cy54ID0gMTtcbiAgLy9DaGVjayB0aGUgbGltaXQgb2YgdGhlIG1heGltdW0gYWxsb3dlZCBheGlzIGhpZGRlbiBkb3RzXG4gIGlmIChtYXhIaWRkZW5BeGlzRG90cyAmJiBtYXhIaWRkZW5BeGlzRG90cyA8IGhpZGVEb3RzLngpIGhpZGVEb3RzLnggPSBtYXhIaWRkZW5BeGlzRG90cztcbiAgLy9UaGUgY291bnQgb2YgZG90cyBzaG91bGQgYmUgb2RkXG4gIGlmIChoaWRlRG90cy54ICUgMiA9PT0gMCkgaGlkZURvdHMueC0tO1xuICBpbWFnZVNpemUueCA9IGhpZGVEb3RzLnggKiBkb3RTaXplO1xuICAvL0NhbGN1bGF0ZSBvcHBvc2l0ZSBheGlzIGhpZGRlbiBkb3RzIGJhc2VkIG9uIGF4aXMgdmFsdWUuXG4gIC8vVGhlIHZhbHVlIHdpbGwgYmUgb2RkLlxuICAvL1dlIHVzZSBjZWlsIHRvIHByZXZlbnQgZG90cyBjb3ZlcmluZyBieSB0aGUgaW1hZ2UuXG4gIGhpZGVEb3RzLnkgPSAxICsgMiAqIE1hdGguY2VpbCgoaGlkZURvdHMueCAqIGsgLSAxKSAvIDIpO1xuICBpbWFnZVNpemUueSA9IE1hdGgucm91bmQoaW1hZ2VTaXplLnggKiBrKTtcbiAgLy9JZiB0aGUgcmVzdWx0IGRvdHMgY291bnQgaXMgYmlnZ2VyIHRoYW4gbWF4IC0gdGhlbiBkZWNyZWFzZSBzaXplIGFuZCBjYWxjdWxhdGUgYWdhaW5cbiAgaWYgKGhpZGVEb3RzLnkgKiBoaWRlRG90cy54ID4gbWF4SGlkZGVuRG90cyB8fCAobWF4SGlkZGVuQXhpc0RvdHMgJiYgbWF4SGlkZGVuQXhpc0RvdHMgPCBoaWRlRG90cy55KSkge1xuICAgIGlmIChtYXhIaWRkZW5BeGlzRG90cyAmJiBtYXhIaWRkZW5BeGlzRG90cyA8IGhpZGVEb3RzLnkpIHtcbiAgICAgIGhpZGVEb3RzLnkgPSBtYXhIaWRkZW5BeGlzRG90cztcbiAgICAgIGlmIChoaWRlRG90cy55ICUgMiA9PT0gMCkgaGlkZURvdHMueC0tO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWRlRG90cy55IC09IDI7XG4gICAgfVxuICAgIGltYWdlU2l6ZS55ID0gaGlkZURvdHMueSAqIGRvdFNpemU7XG4gICAgaGlkZURvdHMueCA9IDEgKyAyICogTWF0aC5jZWlsKChoaWRlRG90cy55IC8gayAtIDEpIC8gMik7XG4gICAgaW1hZ2VTaXplLnggPSBNYXRoLnJvdW5kKGltYWdlU2l6ZS55IC8gayk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGhlaWdodDogaW1hZ2VTaXplLnksXG4gICAgd2lkdGg6IGltYWdlU2l6ZS54LFxuICAgIGhpZGVZRG90czogaGlkZURvdHMueSxcbiAgICBoaWRlWERvdHM6IGhpZGVEb3RzLnhcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRvd25sb2FkVVJJKHVyaTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICBsaW5rLmRvd25sb2FkID0gbmFtZTtcbiAgbGluay5ocmVmID0gdXJpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICBsaW5rLmNsaWNrKCk7XG4gIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG59XG4iLCJpbXBvcnQgbW9kZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9tb2Rlc1wiO1xuaW1wb3J0IHsgTW9kZSB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRNb2RlKGRhdGE6IHN0cmluZyk6IE1vZGUge1xuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIC9eWzAtOV0qJC8udGVzdChkYXRhKTpcbiAgICAgIHJldHVybiBtb2Rlcy5udW1lcmljO1xuICAgIGNhc2UgL15bMC05QS1aICQlKitcXC0uLzpdKiQvLnRlc3QoZGF0YSk6XG4gICAgICByZXR1cm4gbW9kZXMuYWxwaGFudW1lcmljO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbW9kZXMuYnl0ZTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVW5rbm93bk9iamVjdCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5jb25zdCBpc09iamVjdCA9IChvYmo6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogYm9vbGVhbiA9PiAhIW9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICFBcnJheS5pc0FycmF5KG9iaik7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlRGVlcCh0YXJnZXQ6IFVua25vd25PYmplY3QsIC4uLnNvdXJjZXM6IFVua25vd25PYmplY3RbXSk6IFVua25vd25PYmplY3Qge1xuICBpZiAoIXNvdXJjZXMubGVuZ3RoKSByZXR1cm4gdGFyZ2V0O1xuICBjb25zdCBzb3VyY2UgPSBzb3VyY2VzLnNoaWZ0KCk7XG4gIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCB8fCAhaXNPYmplY3QodGFyZ2V0KSB8fCAhaXNPYmplY3Qoc291cmNlKSkgcmV0dXJuIHRhcmdldDtcbiAgdGFyZ2V0ID0geyAuLi50YXJnZXQgfTtcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKChrZXk6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHRhcmdldFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgY29uc3Qgc291cmNlVmFsdWUgPSBzb3VyY2Vba2V5XTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldFZhbHVlKSAmJiBBcnJheS5pc0FycmF5KHNvdXJjZVZhbHVlKSkge1xuICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2VWYWx1ZTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRhcmdldFZhbHVlKSAmJiBpc09iamVjdChzb3VyY2VWYWx1ZSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gbWVyZ2VEZWVwKE9iamVjdC5hc3NpZ24oe30sIHRhcmdldFZhbHVlKSwgc291cmNlVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG1lcmdlRGVlcCh0YXJnZXQsIC4uLnNvdXJjZXMpO1xufVxuIiwiaW1wb3J0IHsgUmVxdWlyZWRPcHRpb25zIH0gZnJvbSBcIi4uL2NvcmUvUVJPcHRpb25zXCI7XG5pbXBvcnQgeyBHcmFkaWVudCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5mdW5jdGlvbiBzYW5pdGl6ZUdyYWRpZW50KGdyYWRpZW50OiBHcmFkaWVudCk6IEdyYWRpZW50IHtcbiAgY29uc3QgbmV3R3JhZGllbnQgPSB7IC4uLmdyYWRpZW50IH07XG5cbiAgaWYgKCFuZXdHcmFkaWVudC5jb2xvclN0b3BzIHx8ICFuZXdHcmFkaWVudC5jb2xvclN0b3BzLmxlbmd0aCkge1xuICAgIHRocm93IFwiRmllbGQgJ2NvbG9yU3RvcHMnIGlzIHJlcXVpcmVkIGluIGdyYWRpZW50XCI7XG4gIH1cblxuICBpZiAobmV3R3JhZGllbnQucm90YXRpb24pIHtcbiAgICBuZXdHcmFkaWVudC5yb3RhdGlvbiA9IE51bWJlcihuZXdHcmFkaWVudC5yb3RhdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgbmV3R3JhZGllbnQucm90YXRpb24gPSAwO1xuICB9XG5cbiAgbmV3R3JhZGllbnQuY29sb3JTdG9wcyA9IG5ld0dyYWRpZW50LmNvbG9yU3RvcHMubWFwKChjb2xvclN0b3A6IHsgb2Zmc2V0OiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfSkgPT4gKHtcbiAgICAuLi5jb2xvclN0b3AsXG4gICAgb2Zmc2V0OiBOdW1iZXIoY29sb3JTdG9wLm9mZnNldClcbiAgfSkpO1xuXG4gIHJldHVybiBuZXdHcmFkaWVudDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2FuaXRpemVPcHRpb25zKG9wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucyk6IFJlcXVpcmVkT3B0aW9ucyB7XG4gIGNvbnN0IG5ld09wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcblxuICBuZXdPcHRpb25zLndpZHRoID0gTnVtYmVyKG5ld09wdGlvbnMud2lkdGgpO1xuICBuZXdPcHRpb25zLmhlaWdodCA9IE51bWJlcihuZXdPcHRpb25zLmhlaWdodCk7XG4gIG5ld09wdGlvbnMubWFyZ2luID0gTnVtYmVyKG5ld09wdGlvbnMubWFyZ2luKTtcbiAgbmV3T3B0aW9ucy5pbWFnZU9wdGlvbnMgPSB7XG4gICAgLi4ubmV3T3B0aW9ucy5pbWFnZU9wdGlvbnMsXG4gICAgaGlkZUJhY2tncm91bmREb3RzOiBCb29sZWFuKG5ld09wdGlvbnMuaW1hZ2VPcHRpb25zLmhpZGVCYWNrZ3JvdW5kRG90cyksXG4gICAgaW1hZ2VTaXplOiBOdW1iZXIobmV3T3B0aW9ucy5pbWFnZU9wdGlvbnMuaW1hZ2VTaXplKSxcbiAgICBtYXJnaW46IE51bWJlcihuZXdPcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4pXG4gIH07XG5cbiAgaWYgKG5ld09wdGlvbnMubWFyZ2luID4gTWF0aC5taW4obmV3T3B0aW9ucy53aWR0aCwgbmV3T3B0aW9ucy5oZWlnaHQpKSB7XG4gICAgbmV3T3B0aW9ucy5tYXJnaW4gPSBNYXRoLm1pbihuZXdPcHRpb25zLndpZHRoLCBuZXdPcHRpb25zLmhlaWdodCk7XG4gIH1cblxuICBuZXdPcHRpb25zLmRvdHNPcHRpb25zID0ge1xuICAgIC4uLm5ld09wdGlvbnMuZG90c09wdGlvbnNcbiAgfTtcbiAgaWYgKG5ld09wdGlvbnMuZG90c09wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICBuZXdPcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50ID0gc2FuaXRpemVHcmFkaWVudChuZXdPcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50KTtcbiAgfVxuXG4gIGlmIChuZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zKSB7XG4gICAgbmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucyA9IHtcbiAgICAgIC4uLm5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnNcbiAgICB9O1xuICAgIGlmIChuZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgICBuZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLmdyYWRpZW50ID0gc2FuaXRpemVHcmFkaWVudChuZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLmdyYWRpZW50KTtcbiAgICB9XG4gIH1cblxuICBpZiAobmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucykge1xuICAgIG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMgPSB7XG4gICAgICAuLi5uZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zXG4gICAgfTtcbiAgICBpZiAobmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucy5ncmFkaWVudCkge1xuICAgICAgbmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucy5ncmFkaWVudCA9IHNhbml0aXplR3JhZGllbnQobmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucy5ncmFkaWVudCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMpIHtcbiAgICBuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zID0ge1xuICAgICAgLi4ubmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9uc1xuICAgIH07XG4gICAgaWYgKG5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgIG5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMuZ3JhZGllbnQgPSBzYW5pdGl6ZUdyYWRpZW50KG5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMuZ3JhZGllbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdPcHRpb25zO1xufVxuIiwiZXhwb3J0IGludGVyZmFjZSBVbmtub3duT2JqZWN0IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgdHlwZSBEb3RUeXBlID0gXCJkb3RzXCIgfCBcInJvdW5kZWRcIiB8IFwiY2xhc3N5XCIgfCBcImNsYXNzeS1yb3VuZGVkXCIgfCBcInNxdWFyZVwiIHwgXCJleHRyYS1yb3VuZGVkXCI7XG5leHBvcnQgdHlwZSBDb3JuZXJEb3RUeXBlID0gXCJkb3RcIiB8IFwic3F1YXJlXCI7XG5leHBvcnQgdHlwZSBDb3JuZXJTcXVhcmVUeXBlID0gXCJkb3RcIiB8IFwic3F1YXJlXCIgfCBcImV4dHJhLXJvdW5kZWRcIjtcbmV4cG9ydCB0eXBlIEV4dGVuc2lvbiA9IFwic3ZnXCIgfCBcInBuZ1wiIHwgXCJqcGVnXCIgfCBcIndlYnBcIjtcbmV4cG9ydCB0eXBlIEdyYWRpZW50VHlwZSA9IFwicmFkaWFsXCIgfCBcImxpbmVhclwiO1xuZXhwb3J0IHR5cGUgRHJhd1R5cGUgPSBcImNhbnZhc1wiIHwgXCJzdmdcIjtcblxuZXhwb3J0IHR5cGUgR3JhZGllbnQgPSB7XG4gIHR5cGU6IEdyYWRpZW50VHlwZTtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGNvbG9yU3RvcHM6IHtcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICBjb2xvcjogc3RyaW5nO1xuICB9W107XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIERvdFR5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogRG90VHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHcmFkaWVudFR5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogR3JhZGllbnRUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvcm5lckRvdFR5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogQ29ybmVyRG90VHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb3JuZXJTcXVhcmVUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IENvcm5lclNxdWFyZVR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1R5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogRHJhd1R5cGU7XG59XG5cbmV4cG9ydCB0eXBlIFR5cGVOdW1iZXIgPVxuICB8IDBcbiAgfCAxXG4gIHwgMlxuICB8IDNcbiAgfCA0XG4gIHwgNVxuICB8IDZcbiAgfCA3XG4gIHwgOFxuICB8IDlcbiAgfCAxMFxuICB8IDExXG4gIHwgMTJcbiAgfCAxM1xuICB8IDE0XG4gIHwgMTVcbiAgfCAxNlxuICB8IDE3XG4gIHwgMThcbiAgfCAxOVxuICB8IDIwXG4gIHwgMjFcbiAgfCAyMlxuICB8IDIzXG4gIHwgMjRcbiAgfCAyNVxuICB8IDI2XG4gIHwgMjdcbiAgfCAyOFxuICB8IDI5XG4gIHwgMzBcbiAgfCAzMVxuICB8IDMyXG4gIHwgMzNcbiAgfCAzNFxuICB8IDM1XG4gIHwgMzZcbiAgfCAzN1xuICB8IDM4XG4gIHwgMzlcbiAgfCA0MDtcblxuZXhwb3J0IHR5cGUgRXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBcIkxcIiB8IFwiTVwiIHwgXCJRXCIgfCBcIkhcIjtcbmV4cG9ydCB0eXBlIE1vZGUgPSBcIk51bWVyaWNcIiB8IFwiQWxwaGFudW1lcmljXCIgfCBcIkJ5dGVcIiB8IFwiS2FuamlcIjtcbmV4cG9ydCBpbnRlcmZhY2UgUVJDb2RlIHtcbiAgYWRkRGF0YShkYXRhOiBzdHJpbmcsIG1vZGU/OiBNb2RlKTogdm9pZDtcbiAgbWFrZSgpOiB2b2lkO1xuICBnZXRNb2R1bGVDb3VudCgpOiBudW1iZXI7XG4gIGlzRGFyayhyb3c6IG51bWJlciwgY29sOiBudW1iZXIpOiBib29sZWFuO1xuICBjcmVhdGVJbWdUYWcoY2VsbFNpemU/OiBudW1iZXIsIG1hcmdpbj86IG51bWJlcik6IHN0cmluZztcbiAgY3JlYXRlU3ZnVGFnKGNlbGxTaXplPzogbnVtYmVyLCBtYXJnaW4/OiBudW1iZXIpOiBzdHJpbmc7XG4gIGNyZWF0ZVN2Z1RhZyhvcHRzPzogeyBjZWxsU2l6ZT86IG51bWJlcjsgbWFyZ2luPzogbnVtYmVyOyBzY2FsYWJsZT86IGJvb2xlYW4gfSk6IHN0cmluZztcbiAgY3JlYXRlRGF0YVVSTChjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICBjcmVhdGVUYWJsZVRhZyhjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICBjcmVhdGVBU0NJSShjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICByZW5kZXJUbzJkQ29udGV4dChjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNlbGxTaXplPzogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgT3B0aW9ucyA9IHtcbiAgdHlwZT86IERyYXdUeXBlO1xuICB3aWR0aD86IG51bWJlcjtcbiAgaGVpZ2h0PzogbnVtYmVyO1xuICBtYXJnaW4/OiBudW1iZXI7XG4gIGRhdGE/OiBzdHJpbmc7XG4gIGltYWdlPzogc3RyaW5nO1xuICBxck9wdGlvbnM/OiB7XG4gICAgdHlwZU51bWJlcj86IFR5cGVOdW1iZXI7XG4gICAgbW9kZT86IE1vZGU7XG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw/OiBFcnJvckNvcnJlY3Rpb25MZXZlbDtcbiAgfTtcbiAgaW1hZ2VPcHRpb25zPzoge1xuICAgIGhpZGVCYWNrZ3JvdW5kRG90cz86IGJvb2xlYW47XG4gICAgaW1hZ2VTaXplPzogbnVtYmVyO1xuICAgIGNyb3NzT3JpZ2luPzogc3RyaW5nO1xuICAgIG1hcmdpbj86IG51bWJlcjtcbiAgfTtcbiAgZG90c09wdGlvbnM/OiB7XG4gICAgdHlwZT86IERvdFR5cGU7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgY29ybmVyc1NxdWFyZU9wdGlvbnM/OiB7XG4gICAgdHlwZT86IENvcm5lclNxdWFyZVR5cGU7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgY29ybmVyc0RvdE9wdGlvbnM/OiB7XG4gICAgdHlwZT86IENvcm5lckRvdFR5cGU7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgYmFja2dyb3VuZE9wdGlvbnM/OiB7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbn07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uID0gKGk6IG51bWJlciwgajogbnVtYmVyKSA9PiBib29sZWFuO1xuXG5leHBvcnQgdHlwZSBEb3dubG9hZE9wdGlvbnMgPSB7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIGV4dGVuc2lvbj86IEV4dGVuc2lvbjtcbn07XG5cbmV4cG9ydCB0eXBlIERyYXdBcmdzID0ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICByb3RhdGlvbj86IG51bWJlcjtcbiAgZ2V0TmVpZ2hib3I/OiBHZXROZWlnaGJvcjtcbn07XG5cbmV4cG9ydCB0eXBlIEJhc2ljRmlndXJlRHJhd0FyZ3MgPSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIHJvdGF0aW9uPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUm90YXRlRmlndXJlQXJncyA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGRyYXc6ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgdHlwZSBEcmF3QXJnc0NhbnZhcyA9IERyYXdBcmdzICYge1xuICBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG59O1xuXG5leHBvcnQgdHlwZSBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzID0gQmFzaWNGaWd1cmVEcmF3QXJncyAmIHtcbiAgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xufTtcblxuZXhwb3J0IHR5cGUgUm90YXRlRmlndXJlQXJnc0NhbnZhcyA9IFJvdGF0ZUZpZ3VyZUFyZ3MgJiB7XG4gIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbn07XG5cbmV4cG9ydCB0eXBlIEdldE5laWdoYm9yID0gKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiBib29sZWFuO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBRUkNvZGVTdHlsaW5nIGZyb20gXCIuL2NvcmUvUVJDb2RlU3R5bGluZ1wiO1xuaW1wb3J0IGRvdFR5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9kb3RUeXBlc1wiO1xuaW1wb3J0IGNvcm5lckRvdFR5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9jb3JuZXJEb3RUeXBlc1wiO1xuaW1wb3J0IGNvcm5lclNxdWFyZVR5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9jb3JuZXJTcXVhcmVUeXBlc1wiO1xuaW1wb3J0IGVycm9yQ29ycmVjdGlvbkxldmVscyBmcm9tIFwiLi9jb25zdGFudHMvZXJyb3JDb3JyZWN0aW9uTGV2ZWxzXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMgZnJvbSBcIi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvblBlcmNlbnRzXCI7XG5pbXBvcnQgbW9kZXMgZnJvbSBcIi4vY29uc3RhbnRzL21vZGVzXCI7XG5pbXBvcnQgcXJUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvcXJUeXBlc1wiO1xuaW1wb3J0IGRyYXdUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvZHJhd1R5cGVzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCB7XG4gIGRvdFR5cGVzLFxuICBjb3JuZXJEb3RUeXBlcyxcbiAgY29ybmVyU3F1YXJlVHlwZXMsXG4gIGVycm9yQ29ycmVjdGlvbkxldmVscyxcbiAgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMsXG4gIG1vZGVzLFxuICBxclR5cGVzLFxuICBkcmF3VHlwZXNcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFFSQ29kZVN0eWxpbmc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=