/*******************************************************************************
 ********* This file contains all helper functions and default drawing *********
 ********* parameters for drawing.                                     *********
 ********* All the functions are included in one Object DrawUtil().    *********
 ******************************************************************************/
/**
 * Draw tools.
 * @constructor DrawUtil
 */
function DrawUtil() {};
DrawUtil.prototype = {
  ctx: Canvas.ctx,
  maxTableLength: table_info.maxTableLength,
  tupleHeight: table_info.tupleHeight,
  tupleMargin: table_info.tupleMargin,
  colorSet: colorSet,
  isChosenColorSet: chosenColorSet,
  fullWidth: canvasInfo.fullWidth,
  fullHeight: canvasInfo.fullHeight,
  tableMargin: table_info.tableMargin,
  result: resultField,
  compare: compareField,
  infoField: infoField,
  leftInfoField: leftInfoField,
  animField: animField,
  maxDraw: table_info.maxDraw,
  info_lines: table_info.info_lines,
  maxTableWidth: table_info.maxTableWidth,
  columnWidth: anim_size.columnWidth,
  filter_Symbol_pos: anim_position.filter_Symbol,
};
/**
 * Draw tuple.
 * @param {Number} x Position x.
 * @param {Number} y Position y.
 * @param {Number} width The width of row.
 * @param {String} color The background color of row.
 * @param {String} colorText The color of text.
 * @param {array} text Text that will be written in row. Text could be
 * column name, value.
 */
DrawUtil.prototype.tuple = function(x, y, width, color, colorText, text) {
  let _this = this;
  let ctx = _this.ctx;
  if (width >= _this.maxTableWidth) {
    width = _this.maxTableWidth;
    if (text.length > table_info.maxAttribute) {
      let tmpText = [];
      while (text.length > 0) {
        if (tmpText.length > Math.floor(table_info.maxAttribute / 2)) {
          if (text.length > Math.floor(table_info.maxAttribute / 2)) {
            text.shift();
          } else {
            tmpText.push(text.shift());
          }
        }
        if (tmpText.length < Math.floor(table_info.maxAttribute / 2)) {
          tmpText.push(text.shift());
        }
        if (tmpText.length == Math.floor(table_info.maxAttribute / 2)) {
          tmpText.push("...");
        }
      }
      text = tmpText;
    }
  }
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, this.tupleHeight);
  ctx.fillStyle = colorText;
  ctx.font = "10px Arial";
  let columnWidth = width / text.length;
  if (columnWidth > table_info.maxAttrWidth) {
    columnWidth = table_info.maxAttrWidth;
  }
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x + 2 + i * columnWidth, y + 15);
  }
  ctx.restore();
};
/**
 * Draw color bars.
 */
DrawUtil.prototype.colors = function() {
  let _this = this;
  let ctx = _this.ctx;
  ctx.save();
  _this.write_text("table color", 5, 20, "black", "10");
  for (let i = 0; i < _this.colorSet.length; i++) {
    ctx.fillStyle = _this.colorSet[i];
    ctx.fillRect(10 * (i + 1), 30, 10, 10);
  }
  ctx.fillStyle = "black";
  _this.write_text("chosen color", 5, 60, "black", "10");
  for (let i = 0; i < _this.isChosenColorSet.length; i++) {
    ctx.fillStyle = _this.isChosenColorSet[i];
    ctx.fillRect(10 * (i + 1), 70, 10, 10);
  }
  ctx.restore();
};
/**
 * Draw table.
 * @param {tupleset_basic} table The table that will be drew.
 * @param {Number} x The axis x of table.
 * @param {Number} y The axis y of table.
 * @param {Number} width The width of table.
 * @param {String} color The color of table.
 * @param {String} colorText The color of text.
 * @param {Boolean} contain_columns_name Draw the columns' names or not.
 * @param {Boolean} contain_name_info Draw the names and tupleset's information
 * or not.
 */
DrawUtil.prototype.table = function(table, x, y, width, color, colorText,
  contain_columns_name = true, contain_name_info = true) {
  let _this = this;
  let ctx = _this.ctx;
  ctx.save();
  ctx.font = "10px Arial";
  ctx.fillStyle = "black";
  //Draw infos of relation.
  if (contain_name_info) {
    ctx.clearRect(x, y - _this.info_lines * _this.tupleHeight, width,
      _this.info_lines * _this.tupleHeight);
    let relsName = [];
    //Get name of relation.
    for (let i = 0; i < table.name.length; i++) {
      relsName = relsName.concat(table.name[i]);
    }
    _this.write_text("Relation " + relsName, x, y - _this.tupleHeight);
    _this.write_text("Numbers of tuples : " + table.value.length, x, y - 5);
  }
  if (contain_columns_name) {
    ctx.clearRect(x, y, width, _this.tupleHeight);
    let tmpcolumns = [];
    //Get the columns names.
    for (let i = 0; i < table.columns.length; i++) {
      tmpcolumns = tmpcolumns.concat(table.columns[i].columns);
    }
    //Draw columns name.
    this.tuple(x, y, width, '#CCCCDD', colorText, tmpcolumns);
  } else {
    y = y - _this.tupleHeight - _this.tupleMargin;
  }
  ctx.clearRect(x, y + (_this.info_lines + 1) * (_this.tupleHeight +
      _this.tupleMargin),
    width, _this.tupleHeight);
  //Draw tuples values.
  let imgPos = 0;
  let realPos = 0;
  this.drawTupleset(imgPos, realPos, table, x, y, width, color, colorText);
  ctx.restore();
};
/**
 * Draw tupleset. Draw the tuple of tupleset one by one,
 * and add the position information to the tuples.
 * @param {Number} imgPos where should this tuple be drew.
 * @param {Number} realPos The position of current tuple in tupleset.
 * @param {tupleset_basic} table The table that will be drew.
 * @param {Number} x The axis x of table.
 * @param {Number} y The axis y of table.
 * @param {Number} width The width of table.
 * @param {String} color The color of table.
 * @param {String} colorText The color of text.
 */
DrawUtil.prototype.drawTupleset = function(imgPos, realPos, table, x, y, width,
  color, colorText) {
  let _this = this;
  let pausePoint = table.value.length - 1;
  let maxLength = this.maxTableLength;
  let restartPoint = 0;
  if (table.value.length > maxLength) {
    restartPoint = table.value.length - maxLength / 2;
    pausePoint = maxLength / 2;
  }

  if (realPos <= pausePoint || realPos >= restartPoint) {
    let text = [];
    if (realPos == pausePoint && table.value.length > maxLength) {
      text = [
        ['...'],
        ['...'],
        ['...']
      ];
    } else {
      if (table.value[realPos].tupleValue[0] instanceof Array) {
        for (let i = 0; i < table.value[realPos].tupleValue.length; i++) {
          text = text.concat(table.value[realPos].tupleValue[i]);
        }
      } else {
        let text = table.value[realPos].tupleValue;
      }
      table.value[realPos].show = true;
    }
    table.value[realPos].position = {
      "row": imgPos,
      "x": x,
      "y": y + (imgPos + 1) * (_this.tupleHeight + _this.tupleMargin)
    };
    this.tuple(table.value[realPos].position.x,
      table.value[realPos].position.y,
      width, color, colorText, text);
    if (realPos != pausePoint) {
      imgPos++;
    }
  } else {
    table.value[realPos].position = {
      "row": imgPos,
      "x": x,
      "y": y + (imgPos + 1) * (_this.tupleHeight + _this.tupleMargin)
    };
    if (realPos == restartPoint - 1) {
      imgPos++;
    }
  }
  realPos++;
  if (realPos < table.value.length) {
    this.drawTupleset(imgPos, realPos, table, x, y, width, color, colorText);
  }
};
/**
 * One tuple.
 * @typedef {object} tuple_basic
 * @property {object} source
 * @property {array} tupleValue
 */
/**
 * Get the width of tuple or table.
 * @param {tupleset_basic|tuple_basic} tupleset
 */
DrawUtil.prototype.getWidth = function(tupleset) {
  let _this = this;
  let width = 0;
  let elem = {};
  if (tupleset.columns) {
    elem = tupleset.columns;
    for (let j in elem) {
      width += elem[j].columns.length * _this.columnWidth;
    }
  } else {
    elem = tupleset.tupleValue;
    for (let j in elem) {
      width += elem[j].length * _this.columnWidth;
    }
  }
  if (width > _this.maxTableWidth) {
    width = _this.maxTableWidth;
  }
  return width;
};
/**
 * Get the height of table.
 * @param {tupleset_basic|tuple_basic} tupleset
 */
DrawUtil.prototype.getHeight = function(tupleset, info = true) {
  let _this = this;
  let info_height = 0;
  if (info) {
    info_height =
      table_info.info_lines * (table_info.tupleHeight +
        table_info.tupleMargin);
  }
  let height = 0;
  if (tupleset.value.length < table_info.maxTableLength) {
    height =
      tupleset.value.length *
      (table_info.tupleHeight + table_info.tupleMargin) +
      info_height;
  } else {
    height = table_info.maxTableLength *
      (table_info.tupleHeight + table_info.tupleMargin) +
      info_height;
  }
  return height;
};
/**
 * disappear a rectangular area.
 * @param {Number} x The axis x of rect.
 * @param {Number} y The axis y of rect.
 * @param {Number} width The width of rect.
 * @param {Number} height The height of rect.
 * @param {function} nextAnimation After disappear, what should do.
 * @param {array} imgData The picture of early status of where should be
 * disappear.
 */
DrawUtil.prototype.disappear = function(x, y, width, height, nextAnimation,
  imgData) {
  let _this = this;
  let ctx = _this.ctx;
  let n = 0;
  let inc = 1;
  let tmpImgData = _this.setWhite();
  ctx.putImageData(tmpImgData, 0, 0);
  tmpImgData = ctx.getImageData(x, y, width, height);
  anim(loop, nextAnimation);

  function loop() {
    if (n < 255) {
      inc++;
      n += inc;
      ctx.save();
      ctx.fillStyle = "white";
      ctx.globalAlpha = n;
      for (let i = 0, len = tmpImgData.data.length; i < len; i += 4) {
        tmpImgData.data[i + 3] = 255 - n;
      }
      ctx.putImageData(imgData, x, y);
      ctx.putImageData(tmpImgData, x, y);

      ctx.restore();
    } else {
      ctx.putImageData(imgData, x, y);
      return true;
    }
  };
};
/**
 * Get a white picture with fullWidth and fullHeight.
 * @returns {array} imgData
 */
DrawUtil.prototype.setWhite = function() {
  let _this = this;
  let ctx = _this.ctx;
  ctx.save();
  let imgData = ctx.getImageData(0, 0, _this.fullWidth, _this.fullHeight);
  for (var i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i + 3] == 0) {
      imgData.data[i] = 255;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 255;
      imgData.data[i + 3] = 255;
    }
  }
  ctx.restore();
  return imgData;
};
/**
 * This is for generate new tables, when the condition's attribute is number.
 * @param {String|Number} tupleValue The condition's attribute, which is Number
 * or String.
 * @param {String} color Color of this new table.
 * @param {String} chosencolor Chosen color of this new table.
 * @param {Number} x The axis x of this new table.
 * @param {Number} y The axis y of this new table.
 * @returns {tupleset_basic} new table.
 */
DrawUtil.prototype.generateNewTable = function(
  tupleValue, color = this.colorSet[1],
  chosencolor = this.isChosenColorSet[1],
  x = this.fullWidth - 100, y = this.animField.y + 30) {
  let table = algebraUtil.initRelation();
  table.chosencolor = chosencolor;
  table.color = color;
  table.name.push("null");
  table.columns.push({
    columns: ["number"],
    src: ["null"]
  });
  table.value = [algebraUtil.initValue()];
  table.value[0].tupleValue = [
    [tupleValue]
  ];
  console.log(table);
  table.value[0].position = {
    row: 0,
    x: x,
    y: y
  };
  table.value[0].show = true;
  table.value[0].source = {
    rels: [],
    ids: []
  };
  table.value[0].width = 100;
  return table;
};
/**
 * Translates the arrays of tupleValue to one array.
 * @param {tuple_basic} tuple The tuple that need to be translated.
 * @returns {array} tuple value.
 */
DrawUtil.prototype.getText = function(tuple) {
  let text = [];
  for (let i in tuple.tupleValue) {
    text = text.concat(tuple.tupleValue[i]);
  }
  return text;
};
/**
 * Draw ellipse.
 * @param {Number} x The axis x of ellipse.
 * @param {Number} y The axis y of ellipse.
 * @param {Number} r The radius of ellipse.
 * @param {Number} startAngle The startAngle of ellipse.
 * @param {Number} endAngle The endAngle of ellipse.
 * @param {Boolean} antiClockWise AntiClockWise or not.
 */
DrawUtil.prototype.ellipse = function(x, y, r, startAngle, endAngle,
  antiClockWise) {
  let _this = this;
  let ctx = _this.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, endAngle, antiClockWise);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};
/**
 * Draw line.
 * @param {Number} x1 The axis x of start point.
 * @param {Number} y1 The axis y of start point.
 * @param {Number} x2 The axis x of end point.
 * @param {Number} y2 The axis y of end point.
 */
DrawUtil.prototype.line = function(x1, y1, x2, y2) {
  let _this = this;
  let ctx = _this.ctx;
  ctx.save()
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};
/**
 * Draw Database symbol.
 * @param {Number} x The axis x of center point of DB symbol.
 * @param {Number} y The axis y of center point of DB symbol.
 * @param {Number} width The width of DB symbol.
 * @param {Number} height The height of DB symbol.
 */
DrawUtil.prototype.drawDB = function(x, y, width, height) {
  let _this = this;
  let ctx = _this.ctx;
  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.lineWidth = 2;
  _this.ellipse(x, y + height / 2,
    width / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);
  _this.line(x, y, x + width, y);
  _this.line(x, y + height, x + width, y + height);
  _this.ellipse(x + width, y + height / 2,
    width / 2, 1.5 * Math.PI, 0.5 * Math.PI, false);
  ctx.fillText("Database", x, y + height / 2);
  ctx.restore();
};
/**
 * Draw Database symbol.
 * @param {Number} x The axis x of center point of filter symbol.
 * @param {Number} y The axis y of center point of filter symbol.
 * @param {Number} width The width of filter symbol.
 * @param {Number} height The height of filter symbol.
 */
DrawUtil.prototype.filterSymbol = function(x, y, width, height) {
  let _this = this;
  let ctx = _this.ctx;
  let bowl_top_left = x - 2 * width / 3;
  let bowl_top_right = x + 2 * width / 3;
  let bowl_top = y - height / 2;
  let bowl_bottom = y;
  let bowl_bot_left = x - width / 2;
  let bowl_bot_right = x + width / 2;
  let pipe_left = x - 10;
  let pipe_right = x + 10;
  let pipe_top = bowl_bottom;
  let pipe_bot_left = y + height / 2;
  let pipe_bot_right = y + height / 2 - 5;
  ctx.save();
  _this.line(bowl_top_left, bowl_top, bowl_top_right, bowl_top);
  _this.line(bowl_bot_left, bowl_bottom, bowl_bot_right, bowl_bottom);
  _this.line(bowl_top_left, bowl_top, bowl_bot_left, bowl_bottom);
  _this.line(bowl_top_right, bowl_top, bowl_bot_right, bowl_bottom);
  _this.line(pipe_left, pipe_top, pipe_left, pipe_bot_left);
  _this.line(pipe_right, pipe_top, pipe_right, pipe_bot_right);
  _this.line(pipe_left, pipe_bot_left, pipe_right, pipe_bot_right);
  ctx.restore();
  return true;
};
/**
 * The symbol of operations.
 */
DrawUtil.prototype._opImg = {
  "equal": "=",
  "less": "<",
  "lessEqual": "<=",
  "greater": ">",
  "greaterEqual": ">="
};
/**
 * @typedef {object} size
 * @property {Number} tupleWidth The width of tuple.
 * @property {Number} tupleHeight The height of tuple.
 */
/**
 * @typedef {object} coordinate
 * @property {Number} x
 * @property {Number} y
 */
/**
 * @typedef {object} nextPosition
 * @property {Number} x
 * @property {Number} y
 * @property {Number} tupleWidth
 * @property {Number} tupleHeight
 */
/**
 * Get the next position of a tuple or table.
 * @param {tuple_basic|tupleset_basic} input The tuple or tupleset that need
 * to move.
 * @param {size} size The size of this input.
 * @param {coordinate} src The source coordinate of this input.
 * @param {coordinate} des The destination coordinate of this input.
 * @param {Boolean} transform Transform the shape or not.
 * @returns {nextPosition}
 */
DrawUtil.prototype.nextPosition = function(input, size, src, des, transform) {
  let maxTupleWidth = this.getWidth(input);
  let maxTupleHeight = this.tupleHeight;
  let diffy = des.y - src.y;
  let diffx = des.x - src.x;
  let res = {};
  if (src.x === des.x || src.y === des.y) {
    if (src.x === des.x) {
      let diffy = des.y - src.y;
      src.x = src.x;
      if (Math.abs(diffy) > 1) {
        if (size.tupleWidth < maxTupleWidth && transform) {
          size.tupleWidth = size.tupleWidth + (maxTupleWidth / 10);
        }
        if (size.tupleHeight < maxTupleHeight && transform) {
          size.tupleHeight += (maxTupleHeight / 10);
        }
        src.y = src.y + diffy / 10;
      } else {
        src.y = des.y;
        size.tupleWidth = maxTupleWidth;
        size.tupleHeight = maxTupleHeight;
      }
    } else if (src.y === des.y) {
      let diffx = des.x - src.x;
      src.y = src.y;
      if (Math.abs(diffx) > 1) {
        if (size.tupleWidth < maxTupleWidth && transform) {
          size.tupleWidth = size.tupleWidth + (maxTupleWidth / 10);
        }
        if (size.tupleHeight < maxTupleHeight && transform) {
          size.tupleHeight += (maxTupleHeight / 10);
        }
        src.x = src.x + diffx / 10;
      } else {
        src.x = des.x;
        size.tupleWidth = maxTupleWidth;
        size.tupleHeight = maxTupleHeight;
      }
    }
    res.x = src.x;
    res.y = src.y;
    res.tupleWidth = size.tupleWidth;
    res.tupleHeight = size.tupleHeight;
    return res;
  }
  let a = diffy / diffx;
  let b = des.y - a * des.x;
  diffy = des.y - src.y;
  diffx = des.x - src.x;
  let interval = 2;
  if (Math.abs(diffx) > 1 || Math.abs(diffy) > 1) {
    if (size.tupleWidth < maxTupleWidth && transform) {
      size.tupleWidth = size.tupleWidth + (maxTupleWidth / 10);
    }
    if (size.tupleHeight < maxTupleHeight && transform) {
      size.tupleHeight += (maxTupleHeight / 10);
    }
    if (diffx > diffy) {
      interval = diffx / 10;
      src.x += interval;
      src.y = a * src.x + b;
    } else {
      interval = diffy / 10;
      src.y += interval;
      src.x = (src.y - b) / a;
    }
  } else {
    src.x = des.x;
    src.y = des.y;
    size.tupleWidth = maxTupleWidth;
    size.tupleHeight = maxTupleHeight;
  }
  res.x = src.x;
  res.y = src.y;
  res.tupleWidth = size.tupleWidth;
  res.tupleHeight = size.tupleHeight;
  return res;
};
/**
 * Separate the relation from a joined tupleset.
 * @param {tupleset_basic} tupleset The tupleset that need to be separated.
 * @returns {tupleset_basic_array} The array of tupleset that are separated
 * from tupleset.
 */
DrawUtil.prototype.sep_ts_col = function(tupleset) {
  let output = [];
  for (let i = 0; i < tupleset.name.length; i++) {
    for (let j = 0; j < tupleset.columns[i].columns.length; j++) {
      let tmpRel = algebraUtil.initRelation();
      tmpRel.name.push(tupleset.name[i]);
      tmpRel.columns.push({
        src: [tupleset.name[i]],
        columns: [tupleset.columns[i].columns[j]]
      });
      for (let k = 0; k < tupleset.value.length; k++) {
        let tmpvalue = algebraUtil.initValue();
        tmpvalue.source.rels.push(tupleset.value[k].source.rels[i]);
        tmpvalue.source.ids.push(tupleset.value[k].source.ids[i]);
        tmpvalue.tupleValue.push([tupleset.value[k].tupleValue[i][j]]);
        if (tupleset.value[k].group) {
          tmpvalue.group = tupleset.value[k].group.slice();
        }
        tmpRel.value.push(tmpvalue);
      }
      output.push(tmpRel);
    }
  }
  return output;
};
/**
 * Write text at the canvas.
 * @param {String} text The text that need to be written.
 * @param {Number} x The axis x where the text will be written.
 * @param {Number} y The axis y where the text will be written.
 * @param {String} color The color of the text.
 * @param {Number} font_size The size of the text.
 */
DrawUtil.prototype.write_text = function(text, x, y, color = "black",
  font_size = 15) {
  this.ctx.save();
  this.ctx.fillStyle = "black";
  this.ctx.font = font_size + "px Arial";
  this.ctx.fillText(text, x, y);
  this.ctx.restore();
};
/**
 * Draw zoom with shape of rectangle.
 * @param {String} text The text that need to be written.
 * @param {Number} x The axis x where the text will be written.
 * @param {Number} y The axis y where the text will be written.
 * @param {String} color The color of the text.
 * @param {Number} font_size The size of the text.
 */
DrawUtil.prototype.zoom_rect = function(
  text, x, y, width, height, color = "black", font_size = 20) {
  y = y + height;
  let ctx = this.ctx;
  let rect = {};
  rect.width = width * 1.5;
  rect.height = height * 1.5;
  ctx.save();
  ctx.beginPath();
  let zoomSize = {};
  zoomSize.width = rect.width;
  zoomSize.height = rect.height;
  //Left line.
  ctx.shadowBlur = 1;
  ctx.shadowColor = "black";
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "gray";
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2 - zoomSize.width / 2,
    y + zoomSize.height / 2);
  //rect.
  ctx.lineWidth = 5;
  ctx.rect(x + width / 2 - zoomSize.width / 2,
    y + zoomSize.height / 2, rect.width, rect.height);
  ctx.stroke();
  //Right line.
  ctx.moveTo(x + width / 2 + rect.width / 2,
    y + zoomSize.height / 2 + height / 2);
  ctx.lineTo(x + width / 2 + zoomSize.width / 2,
    y + zoomSize.height / 2);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.rect(x + width / 2 - zoomSize.width / 2,
    y + zoomSize.height / 2, rect.width, rect.height);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
  //Text part.
  ctx.save();
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = font_size + "px Arial";
  ctx.fillText(text, x + width / 2,
    y + height + zoomSize.height / 2);
  ctx.restore();
};
/**
 * Draw zoom with shape of circle.
 * @param {String} text The text that need to be written.
 * @param {Number} x The axis x where the text will be written.
 * @param {Number} y The axis y where the text will be written.
 * @param {String} color The color of the text.
 * @param {Number} font_size The size of the text.
 */
DrawUtil.prototype.zoom_circle = function(
  text, x, y, width, height, color = "black", font_size = 20) {
  y = y + height;
  let ctx = this.ctx;
  let circle = {};
  circle.radius = width;
  ctx.save();
  ctx.beginPath();
  let zoomSize = {};
  zoomSize.width = circle.radius * 2;
  zoomSize.height = circle.radius * 2;
  //Left line.
  ctx.shadowBlur = 1;
  ctx.shadowColor = "black";
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "gray";
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2 - zoomSize.width / 2,
    y + zoomSize.height / 2);
  //Circle.
  ctx.lineWidth = 5;
  ctx.arc(x + width / 2, y + zoomSize.height / 2 + height / 2,
    circle.radius, Math.PI, 3 * Math.PI);
  ctx.stroke();
  //Right line.
  ctx.moveTo(x + width / 2 + circle.radius,
    y + zoomSize.height / 2 + height / 2);
  ctx.lineTo(x + width / 2 + zoomSize.width / 2,
    y + zoomSize.height / 2);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(x + width / 2, y + zoomSize.height / 2 + height / 2,
    circle.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
  //Text part.
  ctx.save();
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = font_size + "px Arial";
  ctx.fillText(text, x + width / 2,
    y + height + zoomSize.height / 2);
  ctx.restore();
};

/**
 * @typedef {object} attr_pos
 * @property {Number} width
 * @property {Number} x
 * @property {Number} y
 */
/**
 * Get the position of attribute in column.
 * @param {columns} columns
 * @param {Number} x axis x of column
 * @param {Number} y axis y of column
 * @param {String} attr
 * @param {Number} width
 * @return {attr_pos} Position and width of attribute
 */
DrawUtil.prototype.get_Attr_Pos_in_column = function(columns, x, y, attr,
  width, rel = null) {
  let posRel = 0;
  let posAttr = 0;
  let counter = 0;
  let tmpcolumns = [];
  for (let i = 0; i < columns.length; i++) {
    if (rel) {
      if (columns[i].src === rel) {
        tmpcolumns = columns[i].columns;
        posRel = i;
      }
    }
    tmpcolumns = tmpcolumns.concat(columns[i].columns);
  }
  for (let i in tmpcolumns) {
    if (tmpcolumns[i] === attr) {
      posAttr = counter;
      break;
    }
    counter++;
  }
  let res = {};
  res.width = width / tmpcolumns.length;
  res.x = x + (posAttr) * res.width;
  res.y = y;
  res.posRel = posRel;
  res.posAttr = posAttr;
  return res;
};
