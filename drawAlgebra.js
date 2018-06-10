/*******************************************************************************
 ********* This file contains all functions of algebra animation.      *********
 ********* All the functions are included in one Object DrawAlgebra(). *********
 ******************************************************************************/
/**
 * Draw animations of algebra.
 * @constructor DrawAlgebra
 */
function DrawAlgebra() {
  this.waitTime = 1000 / window.control.speed;
  this.counter = this.waitTime;
  this.nth_result = 0;
  this.imgDataResult = drawUtil.ctx.getImageData(drawUtil.result.x, drawUtil.result.y,
    drawUtil.fullWidth - drawUtil.result.x, drawUtil.fullHeight - drawUtil.result.y);

  this.x1 = drawUtil.animField.x;
  this.y1 = drawUtil.animField.y;
  this.y2 = drawUtil.animField.y;
  this.nth_tuple1 = 0;
  this.nth_tuple2 = 0;
  this.table_info_height = (drawUtil.info_lines - 1) * (drawUtil.tupleHeight +
    drawUtil.tupleMargin);
  this.column_height = drawUtil.tupleHeight + drawUtil.tupleMargin;
  this.tabY = drawUtil.animField.y + this.table_info_height;
  let _this = this;
  // Initialize the attributes of input tuplesets.
  this.init = function(res, input1, input2, nth_tuple1, nth_tuple2, attr1, attr2, op) {
    _this.res = JSON.parse(JSON.stringify(res));
    _this.tuplesInput1 = JSON.parse(JSON.stringify(input1));
    _this.tuplesInput2 = JSON.parse(JSON.stringify(input2));
    _this.width1 = drawUtil.getWidth(input1);
    _this.width2 = drawUtil.getWidth(input2);
    _this.rel1 = _this.tuplesInput1.name;
    _this.rel2 = _this.tuplesInput2.name;
    _this.attr1 = attr1;
    _this.attr2 = attr2;
    _this.op = op;
    _this.x2 = drawUtil.fullWidth - drawUtil.getWidth(input2);
    _this.imgDataBlank1 = getBlank(input1);
    _this.imgDataBlank2 = getBlank(input2);
    _this.nth_tuple1 = nth_tuple1;
    _this.nth_tuple2 = nth_tuple2;
    _this.src_or_val = "val";
    if (input1.name.toString() == input2.name.toString()) {
      _this.src_or_val = "src";
    }
  };
  /** Generate a blank image.*/
  let getBlank = function(tuple) {
    let imgDataBlank = drawUtil.ctx.getImageData(this.x1, this.y1,
      drawUtil.getWidth(tuple), drawUtil.tupleHeight + drawUtil.tupleMargin);
    for (let i = 0; i < imgDataBlank.data.length; i += 4) {
      imgDataBlank.data[i] = 255;
      imgDataBlank.data[i + 1] = 255;
      imgDataBlank.data[i + 2] = 255;
    }
    return imgDataBlank;
  };
};
/*******************************************************************************
 **************************** animation of crossJoin ***************************
 ******************************************************************************/
/**
 * Draws the animation of crossJoin.
 * @param {tupleset_basic} res result of crossJoin.
 * @param {tupleset_basic} input1 left table.
 * @param {tupleset_basic} input2 right table.
 * @param {function} nextAnimation What should do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to crossJoin.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to crossJoin.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 */
DrawAlgebra.prototype.animCrossJoin = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20) {
  let _this = this;
  _this.result_num = 0;
  DrawAlgebra.call(this);
  _this.init(res, input1, input2, nth_tuple1, nth_tuple2);
  _this.draw_tables(_this, color1, color2);
  loop();

  function loop() {
    //If this process finished.
    if (_this.nth_tuple1 >= input1.value.length || _this.result_num >= maxDraw) {
      _this.draw_tables(_this, color1, color2);
      nextAnimation();
      return true;
    }
    _this.imgDataResult = drawUtil.ctx.getImageData(drawUtil.result.x, drawUtil.result.y,
      drawUtil.fullWidth - drawUtil.result.x, drawUtil.fullHeight - drawUtil.result.y);
    if (_this.res.value.length <= 0 || _this.result_num >= maxDraw) {
      _this.draw_tables(_this, color1, color2);
      return true;
    }
    _this.counter = _this.waitTime;
    if (_this.draw_choose_tuple(_this, color1, color2,
        chosenColor1, chosenColor2, false, false)) {
      if (_this.compare_tuples(_this)) {
        let tuple1 = JSON.parse(JSON.stringify(_this.tuplesInput1.value[_this.nth_tuple1]));
        let tuple2 = JSON.parse(JSON.stringify(_this.tuplesInput2.value[_this.nth_tuple2]));
        if (_this.isContains(_this.res.value, tuple1, tuple2) == -1) {
          nextAnimation();
          return true;
        }
        let imgDataChosen = drawUtil.ctx.getImageData(drawUtil.animField.x, drawUtil.animField.y,
          drawUtil.fullWidth, drawUtil.fullHeight);
        _this.move_to_result(_this, imgDataChosen, color1, color2, loop,
          tuple1.position, tuple2.position);
        return true;
      }
      loop();
    }
  };
};
/*******************************************************************************
 ************************* animation of left join ******************************
 ******************************************************************************/
/**
 * Draws the animation of leftJoin.
 * @param {tupleset_basic} res result of leftJoin.
 * @param {tupleset_basic} input1 left table.
 * @param {tupleset_basic} input2 right table.
 * @param {function} nextAnimation What should do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin leftJoin.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin leftJoin.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 * @param {String} attr1 Join on which attribute of input1.
 * @param {String} attr2 Join on which attribute of input2.
 * @param {String} op Operation of join.
 */
DrawAlgebra.prototype.animLeftJoin = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20, attr1, attr2, op) {
  let _this = this;
  _this.result_num = 0;
  _this.add_null_value(input2);
  _this.animInnerJoin(res, input1, input2, () => {}, nth_tuple1, nth_tuple2,
    color1, color2, chosenColor1,
    chosenColor2, maxDraw, attr1, attr2, op);
};
/*******************************************************************************
 ************************ animation of right join ******************************
 ******************************************************************************/
/**
 * Draws the animation of rightJoin.
 * @param {tupleset_basic} res result of rightJoin.
 * @param {tupleset_basic} input1 left table.
 * @param {tupleset_basic} input2 right table.
 * @param {function} nextAnimation What should do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin rightJoin.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin rightJoin.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 * @param {String} attr1 Join on which attribute of input1.
 * @param {String} attr2 Join on which attribute of input2.
 * @param {String} op Operation of join.
 */
DrawAlgebra.prototype.animRightJoin = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20, attr1, attr2, op) {
  let _this = this;
  _this.result_num = 0;
  _this.add_null_value(input1);
  _this.animInnerJoin(res, input1, input2, () => {}, nth_tuple1, nth_tuple2,
    color1, color2, chosenColor1,
    chosenColor2, maxDraw, attr1, attr2, op, "left");
};

/*******************************************************************************
 ************************ animation of outer join ******************************
 ******************************************************************************/
/**
 * Draws the animation of outerJoin.
 * @param {tupleset_basic} res result of outerJoin.
 * @param {tupleset_basic} input1 left table.
 * @param {tupleset_basic} input2 right table.
 * @param {function} nextAnimation What should do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin outerJoin.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin outerJoin.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 * @param {String} attr1 Join on which attribute of input1.
 * @param {String} attr2 Join on which attribute of input2.
 * @param {String} op Operation of join.
 */
DrawAlgebra.prototype.animOuterJoin = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20, attr1, attr2, op) {
  let _this = this;
  _this.result_num = 0;
  _this.add_null_value(input1);
  _this.add_null_value(input2);
  _this.animInnerJoin(res, input1, input2, () => {}, nth_tuple1, nth_tuple2,
    color1, color2, chosenColor1,
    chosenColor2, maxDraw, attr1, attr2, op);
};

/*******************************************************************************
 **************************** animation of inner join **************************
 ******************************************************************************/
/**
 * Draws the animation of innerJoin.
 * @param {tupleset_basic} res result of innerJoin.
 * @param {tupleset_basic} input1 left table.
 * @param {tupleset_basic} input2 right table.
 * @param {function} nextAnimation What should do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin innerJoin.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin innerJoin.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 * @param {String} attr1 Join on which attribute of input1.
 * @param {String} attr2 Join on which attribute of input2.
 * @param {String} op Operation of join.
 * @param {String} which_side_first Which table will be walked first.
 */
DrawAlgebra.prototype.animInnerJoin = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20, attr1, attr2, op,
  which_side_first = "right") {
  let _this = this;
  _this.which_side_first = which_side_first;
  _this.result_num = 0;
  DrawAlgebra.call(this);
  _this.init(res, input1, input2, nth_tuple1, nth_tuple2, attr1, attr2, op);
  _this.text = "Find the tuples that satisfy the condition.";
  _this.draw_tables(_this, color1, color2);
  _this.draw_filter_text(_this);
  loop();

  function loop() {
    //If this process finished.
    _this.imgDataResult = drawUtil.ctx.getImageData(drawUtil.result.x, drawUtil.result.y,
      drawUtil.fullWidth - drawUtil.result.x, drawUtil.fullHeight - drawUtil.result.y);
    if ((_this.nth_tuple1 >= input1.value.length && which_side_first == "right") ||
      (_this.nth_tuple2 >= input2.value.length && which_side_first == "left") ||
      _this.result_num >= maxDraw) {
      _this.draw_tables(_this, color1, color2);
      nextAnimation();
      return true;
    }
    _this.counter = _this.waitTime;
    if (_this.draw_choose_tuple(_this, color1, color2,
        chosenColor1, chosenColor2, true, true)) {
      _this.move_to_compare(_this, color1, color2, chosenColor1, chosenColor2, () => {
        let tuple1 = JSON.parse(JSON.stringify(_this.tuplesInput1.value[_this.nth_tuple1]));
        let tuple2 = JSON.parse(JSON.stringify(_this.tuplesInput2.value[_this.nth_tuple2]));
        let src1 = {
          x: _this.des1.x,
          y: _this.des1.y
        };
        let src2 = {
          x: _this.des1.x + drawUtil.getWidth(tuple1),
          y: _this.des1.y
        };
        if (_this.compare_tuples(_this)) {
          if (_this.isContains(_this.res.value, tuple1, tuple2) == -1) {
            nextAnimation();
            return true;
          }
          _this.animJoinTuple(_this.imgDataChosen, tuple1, tuple2, true, true, src1, src2, {
            x: _this.des1.x,
            y: _this.des1.y + drawUtil.filter_Symbol_pos.height
          }, color1, color2, () => {
            _this.move_to_result(_this, _this.imgDataChosen, color1, color2, loop, src1, src2);
            return true;
          });

        } else {
          drawUtil.disappear(_this.des1.x, _this.des1.y - drawUtil.tupleMargin,
            _this.width1 + _this.width2, drawUtil.tupleHeight + drawUtil.tupleMargin,
            loop, _this.imgDisappear);
        }
      });
    }
  };
};
/*******************************************************************************
 **************************Tools for animation of joins**************************
 *******************************************************************************/
/**
 * Draws tables. If tables have been drawn, returns true.
 * @param {object} _this The object that call this function.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @returns {Boolean}
 */
DrawAlgebra.prototype.draw_tables = function(_this, color1, color2) {
  drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.fullWidth, drawUtil.fullHeight);
  drawUtil.table(_this.tuplesInput1, _this.x1, _this.tabY,
    drawUtil.getWidth(_this.tuplesInput1), color1, "black");
  drawUtil.table(_this.tuplesInput2, _this.x2, _this.tabY,
    drawUtil.getWidth(_this.tuplesInput2), color2, "black");
  if (_this.imgDataResult) {
    drawUtil.ctx.putImageData(_this.imgDataResult, drawUtil.result.x, drawUtil.result.y);
  }
  _this.imgData = drawUtil.ctx.getImageData(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.fullWidth, drawUtil.fullHeight);
  return true;
};
/**
 * Draws filter and text in filter.
 * @param {object} _this The object that call this function.
 */
DrawAlgebra.prototype.draw_filter_text = function(_this) {
  let tuple1 = JSON.parse(JSON.stringify(_this.tuplesInput1.value[_this.nth_tuple1]));
  let tuple2 = JSON.parse(JSON.stringify(_this.tuplesInput2.value[_this.nth_tuple2]));
  _this.des1 = {
    x: (tuple1.position.x + tuple2.position.x) / 3,
    y: drawUtil.compare.y
  };
  let filterSymbolX = _this.des1.x + drawUtil.getWidth(tuple1);
  let filterSymbolY = _this.des1.y + 4 * (drawUtil.tupleHeight + drawUtil.tupleMargin);
  drawUtil.filterSymbol(filterSymbolX, filterSymbolY,
    drawUtil.filter_Symbol_pos.width, drawUtil.filter_Symbol_pos.height);
  let conditionText = _this.rel1.toString() + "." + _this.attr1 + " " +
    drawUtil._opImg[_this.op] + " " + _this.rel2.toString() + "." + _this.attr2;
  drawUtil.write_text(conditionText, filterSymbolX - drawUtil.filter_Symbol_pos.width / 2,
    filterSymbolY - drawUtil.filter_Symbol_pos.height / 2 + 20, "black", 15);
  drawUtil.write_text("?", filterSymbolX,
    filterSymbolY - drawUtil.filter_Symbol_pos.height / 2 + 50, "black", 20);
};
// The information of relations and tuples are all included in _this.
/**
 * Draws chosen tuples in tables. If tuples have been drawn, returns true.
 * @param {object} _this The object that call this function.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuples in table1.
 * @param {String} chosenColor2 Color of chosen tuples in table2.
 * @param {Boolean} draw_rect Draw rect over attribute.
 * @param {Boolean} draw_filter Draw filter.
 * @returns {Boolean}
 */
DrawAlgebra.prototype.draw_choose_tuple = function(_this, color1, color2, chosenColor1,
  chosenColor2, draw_rect, draw_filter) {
  let tuple1 = _this.tuplesInput1.value[_this.nth_tuple1];
  let tuple2 = _this.tuplesInput2.value[_this.nth_tuple2];
  let tuple1x = tuple1.position.x;
  let tuple2x = tuple2.position.x;
  let tuple1y = tuple1.position.y;
  let tuple2y = tuple2.position.y;

  _this.draw_tables(_this, color1, color2);
  if (draw_filter) {
    _this.draw_filter_text(_this);
  }
  if (this.text) {
    drawUtil.write_text(_this.text, drawUtil.infoField.x, drawUtil.infoField.y + 20, "black", 20);
  }
  _this.draw_choose_rect(tuple1, tuple1x, tuple1y, _this.attr1,
    _this.tuplesInput1.columns, chosenColor1, draw_rect);
  _this.draw_choose_rect(tuple2, tuple2x, tuple2y, _this.attr2,
    _this.tuplesInput2.columns, chosenColor2, draw_rect);
  _this.imgDataChosen = drawUtil.ctx.getImageData(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.animField.width, drawUtil.animField.height);
  return true;
};
/**
 * Compare tuples between two relations.
 * If join of tuples is included in result of Algebra, return true. Else, return false.
 * @param {object} _this The object that call this function.
 * @returns {Boolean}
 */
DrawAlgebra.prototype.compare_tuples = function(_this) {
  let tuple1 = _this.tuplesInput1.value[_this.nth_tuple1];
  let tuple2 = _this.tuplesInput2.value[_this.nth_tuple2];
  let i = _this.isContains(_this.res.value, tuple1, tuple2);
  if (i != -1) {
    return true;
  } else {
    if (_this.which_side_first == "left") {
      if (_this.nth_tuple1 < _this.tuplesInput1.value.length - 1) {
        _this.nth_tuple1++;
        _this.counter = _this.waitTime;
      } else {
        _this.nth_tuple2++;
        _this.nth_tuple1 = 0;
      }
    } else {
      if (_this.nth_tuple2 < _this.tuplesInput2.value.length - 1) {
        _this.nth_tuple2++;
        _this.counter = _this.waitTime;
      } else {
        _this.nth_tuple1++;
        _this.nth_tuple2 = 0;
      }
    }
  }
  return false;
};
/**
 * Draws the chosen tuple, and draw rect over the attribute.
 * @param {object} _this The object that call this function.
 * @param {Number} tuplex The axis x of tuple.
 * @param {Number} tupley The axis y of tuple.
 * @param {String} attr Which attribute should be covered with rectangle.
 * @param {columns} columns The columns of the table.
 * @param {String} color Color of tuple.
 * @param {Boolean} draw_rect Draw rectangle or not.
 */
DrawAlgebra.prototype.draw_choose_rect = function(tuple, tuplex, tupley, attr,
  columns, color, draw_rect) {
  let tupleWidth = drawUtil.getWidth(tuple);
  drawUtil.tuple(tuplex, tupley, tupleWidth, color, "white", drawUtil.getText(tuple));
  if (!draw_rect) {
    return true;
  }
  drawUtil.ctx.save();
  drawUtil.ctx.beginPath();
  drawUtil.ctx.strokeStyle = "#FF0000";
  let attrPos = get_Attr_Pos_in_column(columns, tuplex, tupley, attr, tupleWidth);
  drawUtil.ctx.rect(attrPos.x + 1, attrPos.y - 2, attrPos.width, drawUtil.tupleHeight + 4);
  drawUtil.ctx.stroke();
  drawUtil.ctx.closePath();
  drawUtil.ctx.restore();
};
/**
 * Judges if the join of tuple1_value and tuple2_value is included in res_value.
 * If they are in res_value, return the number of joined tuple in res_value.
 * Else, return -1.
 * @param {value_basic} res_value The value of the two relations after join.
 * @param {tuple_basic} tuple1_value a tupleValue of relation1.
 * @param {tuple_basic} tuple1_value a tupleValue of relation2.
 * @return {Number}
 */
DrawAlgebra.prototype.isContains = function(res_value, tuple1_value, tuple2_value) {
  for (let i = 0; i < res_value.length; i++) {
    let tmp = this.columns_ordering(res_value[i], tuple1_value, tuple2_value);
    let strID = tmp.strID;
    let strRel = tmp.strRel;
    if (res_value[i].source.rels.toString() == strRel &&
      res_value[i].source.ids.toString() == strID) {
      return i;
    }
  }
  return -1;
};
/**
 * Sort the order of tuple1_value and tuple2_value, return the sorted joined tuple.
 * @param {value_basic} res_value The value of the two relations after join.
 * @param {tuple_basic} tuple1_value the tupleValue of relation1.
 * @param {tuple_basic} tuple1_value the tupleValue of relation2.
 * @return {tuple_basic}
 */
DrawAlgebra.prototype.columns_ordering = function(res_value, tuple1_value, tuple2_value) {
  let output = {};
  output.strID = [];
  output.strRel = [];
  for (let i in res_value.source.rels) {
    for (let j in tuple1_value.source.rels) {
      if (tuple1_value.source.rels[j] == res_value.source.rels[i]) {
        output.strID.push(tuple1_value.source.ids[j]);
        output.strRel.push(tuple1_value.source.rels[j]);
        break;
      }
    }
    for (let j in tuple2_value.source.rels) {
      if (tuple2_value.source.rels[j] == res_value.source.rels[i]) {
        output.strID.push(tuple2_value.source.ids[j]);
        output.strRel.push(tuple2_value.source.rels[j]);
        break;
      }
    }
  }
  return output;
};
/**
 * Move tuple to compare area.
 * @param {object} _this The object that calls this function.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuples in table1.
 * @param {String} chosenColor2 Color of chosen tuples in table2.
 * @param {function} nextAnimation What will do, after this animation has been done.
 */
DrawAlgebra.prototype.move_to_compare = function(_this, color1, color2,
  chosenColor1, chosenColor2, nextAnimation = () => {}) {
  let tuple1 = JSON.parse(JSON.stringify(_this.tuplesInput1.value[_this.nth_tuple1]));
  let tuple2 = JSON.parse(JSON.stringify(_this.tuplesInput2.value[_this.nth_tuple2]));

  _this.imgDisappear = drawUtil.ctx.getImageData(_this.des1.x,
    _this.des1.y - drawUtil.tupleMargin, drawUtil.getWidth(tuple1) + drawUtil.getWidth(tuple2),
    drawUtil.tupleHeight + drawUtil.tupleMargin);
  let imgData = drawUtil.ctx.getImageData(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.fullWidth, drawUtil.fullHeight);
  _this.animJoinTuple(imgData, tuple1, tuple2, true, true, tuple1.position,
    tuple2.position, _this.des1, color1, color2, () => {
      nextAnimation();
      return true;
    });
};
/**
 * Move tuple to result area.
 * @param {object} _this The object that calls this function.
 * @param {array} imgData The image before moved.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {coordinate} src1 Source coordinate of relation1.
 * @param {coordinate} src2 Source coordinate of relation2.
 */
DrawAlgebra.prototype.move_to_result = function(_this, imgData, color1, color2,
  nextAnimation, src1, src2) {
  let tuple1 = JSON.parse(JSON.stringify(_this.tuplesInput1.value[_this.nth_tuple1]));
  let tuple2 = JSON.parse(JSON.stringify(_this.tuplesInput2.value[_this.nth_tuple2]));
  let i = _this.isContains(_this.res.value, tuple1, tuple2);
  if (i != -1) {
    _this.res.value.splice(i, 1);
    let des2 = {
      x: drawUtil.result.x,
      y: drawUtil.result.y + _this.result_num * (drawUtil.tupleMargin + drawUtil.tupleHeight)
    };
    _this.result_num++;

    _this.animJoinTuple(imgData, tuple1, tuple2, true, true, src1, src2, des2,
      color1, color2, () => {
        if (_this.which_side_first == "left") {
          _this.nth_tuple1++;
          if (_this.nth_tuple1 >= _this.tuplesInput1.value.length) {
            _this.nth_tuple1 = 0;
            _this.nth_tuple2++;
          }
          nextAnimation();
        } else {
          _this.nth_tuple2++;
          if (_this.nth_tuple2 >= _this.tuplesInput2.value.length) {
            _this.nth_tuple2 = 0;
            _this.nth_tuple1++;
          }
          nextAnimation();
        }
        return true;
      });
  }
};
/**
 * Add null tuple to input.
 * @param {tupleset_basic} input The tupleset that need to add a null tuple.
 */
DrawAlgebra.prototype.add_null_value = function(input) {
  let nullValue = algebraUtil.initValue();
  nullValue.source.rels = [null];
  nullValue.source.ids = [null];
  nullValue.tupleValue.push([]);
  let len = 0;
  for (let i = 0; i < input.value[0].tupleValue.length; i++) {
    len += input.value[0].tupleValue[i].length;
  }
  for (let i = 0; i < len; i++) {
    nullValue.tupleValue[0].push(null);
  }
  input.value.push(nullValue);
};
/***************************************************************
 ******************* animation of union all ********************
 ***************************************************************/
/**
 * Animation of union-all.
 * @param {tupleset_basic} res The result of union-all.
 * @param {tupleset_basic} input1 The left tupleset.
 * @param {tupleset_basic} input2 The right tupleset.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin union-all.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin union-all.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 */
DrawAlgebra.prototype.animUnionAll = function(res, input1, input2, nextAnimation,
  nth_tuple1 = 0, nth_tuple2 = 0, color1 = drawUtil.colorSet[0],
  color2 = drawUtil.colorSet[1]) {
  let _this = this;
  DrawAlgebra.call(this);
  _this.init(res, input1, input2, nth_tuple1, nth_tuple2);

  drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.fullWidth, drawUtil.fullHeight);
  drawUtil.table(_this.tuplesInput1, _this.x1, _this.tabY,
    drawUtil.getWidth(_this.tuplesInput1), color1, "black");
  let desY = 0;

  if (_this.tuplesInput1.value.length < drawUtil.maxTableLength) {
    _this.tableHeight1 = (input1.value.length + drawUtil.info_lines) *
      (drawUtil.tupleHeight + drawUtil.tupleMargin);
  } else {
    this.tableHeight1 = (drawUtil.maxTableLength + drawUtil.info_lines) *
      (drawUtil.tupleHeight + drawUtil.tupleMargin);
  }
  desY = _this.y1 + _this.tableHeight1;
  _this.moveTable(_this.tuplesInput2, color2, {
    x: _this.x2,
    y: _this.y2
  }, {
    x: _this.x1,
    y: desY
  }, nextAnimation, false, false, false);

};

/***************************************************************
 ********************* animation of union **********************
 ***************************************************************/
/**
 * Animation of union.
 * @param {tupleset_basic} res The result of union.
 * @param {tupleset_basic} input1 The left tupleset.
 * @param {tupleset_basic} input2 The right tupleset.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin union.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin union.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 */
DrawAlgebra.prototype.animUnion = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20) {
  let _this = this;
  DrawAlgebra.call(this);
  _this.init(res, input1, input2, nth_tuple1, nth_tuple2);

  if (_this.nth_tuple1 <= _this.tuplesInput1.value.length - 1) {
    _this.draw_compare_table(_this, delete_from_ts2, color1, color2, chosenColor1, chosenColor2);
  } else {
    nextAnimation();
  }

  function delete_from_ts2() {
    if (_this.is_Same(_this.src_or_val, _this.tuplesInput1.value[_this.nth_tuple1],
        _this.tuplesInput2.value[_this.nth_tuple2])) {
      drawUtil.disappear(_this.x2, _this.tuplesInput2.value[_this.nth_tuple2].position.y,
        _this.width1, drawUtil.tupleHeight + drawUtil.tupleMargin, nextTuple, _this.imgDataBlank2);

      function nextTuple() {
        _this.tuplesInput2.value.splice(_this.nth_tuple2, 1);
        if (_this.nth_tuple2 >= _this.tuplesInput2.value.length) {
          _this.nth_tuple2 = 0;
        }
        _this.draw_compare_table(_this, delete_from_ts2, color1, color2,
          chosenColor1, chosenColor2);
        return false;
      };
    } else {
      _this.animUnionAll(res, _this.tuplesInput1, _this.tuplesInput2, nextAnimation,
        nth_tuple1, nth_tuple2, color1, color2);
    }
  };
};
/***************************************************************
 ***************** animation of intersection *******************
 ***************************************************************/
/**
 * Animation of intersection.
 * @param {tupleset_basic} res The result of intersection.
 * @param {tupleset_basic} input1 The left tupleset.
 * @param {tupleset_basic} input2 The right tupleset.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin intersection.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin intersection.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 */
DrawAlgebra.prototype.animIntersection = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20) {
  let _this = this;
  DrawAlgebra.call(this);
  _this.init(res, input1, input2, nth_tuple1, nth_tuple2);

  if (_this.nth_tuple1 < _this.tuplesInput1.value.length &&
    _this.nth_tuple2 < _this.tuplesInput2.value.length) {
    _this.draw_compare_table(_this, move_and_delete, color1, color2,
      chosenColor1, chosenColor2);
  } else {
    nextAnimation();
  }

  function move_and_delete() {
    if (_this.is_Same(_this.src_or_val, _this.tuplesInput1.value[_this.nth_tuple1],
        _this.tuplesInput2.value[_this.nth_tuple2])) {
      let srcTuple = {
        x: _this.tuplesInput1.value[_this.nth_tuple1].position.x,
        y: _this.tuplesInput1.value[_this.nth_tuple1].position.y
      };
      let desTuple = {
        x: drawUtil.result.x,
        y: drawUtil.result.y + _this.nth_result * (drawUtil.tupleHeight + drawUtil.tupleMargin)
      };
      let imgData = drawUtil.ctx.getImageData(drawUtil.animField.x, drawUtil.animField.y,
        drawUtil.fullWidth, drawUtil.fullHeight);
      anim(() => {
        return _this.tupleMoving(imgData, _this.tuplesInput1.value[_this.nth_tuple1],
          srcTuple, desTuple, color1);
      }, deleteTuple);

      function deleteTuple() {
        drawUtil.disappear(_this.x2, _this.tuplesInput2.value[_this.nth_tuple2].position.y,
          _this.width1, drawUtil.tupleHeight + drawUtil.tupleMargin,
          () => {
            drawUtil.disappear(_this.x1, _this.tuplesInput1.value[_this.nth_tuple1].position.y,
              _this.width1, drawUtil.tupleHeight + drawUtil.tupleMargin, nextTuple,
              _this.imgDataBlank1);
          }, _this.imgDataBlank2);
      };

      function nextTuple() {
        _this.imgDataResult = drawUtil.ctx.getImageData(drawUtil.result.x, drawUtil.result.y,
          drawUtil.fullWidth - drawUtil.result.x, drawUtil.fullHeight - drawUtil.result.y);
        _this.nth_result++;
        _this.tuplesInput1.value.splice(_this.nth_tuple1, 1);
        _this.tuplesInput2.value.splice(_this.nth_tuple2, 1);
        _this.nth_tuple2 = 0;

        if (_this.nth_tuple1 < _this.tuplesInput1.value.length) {
          _this.draw_compare_table(_this, move_and_delete, color1, color2,
            chosenColor1, chosenColor2);
        } else {
          drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y,
            drawUtil.fullWidth, drawUtil.fullHeight - drawUtil.result.y);
          nextAnimation();
        }
      };
    } else {
      drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y,
        drawUtil.fullWidth, drawUtil.fullHeight - drawUtil.result.y);
      nextAnimation();
    }
  };
};

/**************************************************************
 ******************** animation of without ***********************
 ***************************************************************/
/**
 * Animation of without.
 * @param {tupleset_basic} res The result of without.
 * @param {tupleset_basic} input1 The left tupleset.
 * @param {tupleset_basic} input2 The right tupleset.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {Number} nth_tuple1 N-th tuple in input1, from this tuple to begin without.
 * @param {Number} nth_tuple2 N-th tuple in input2, from this tuple to begin without.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 * @param {Number} maxDraw How many tuples should be drawn.
 */
DrawAlgebra.prototype.animWithout = function(res, input1, input2,
  nextAnimation = () => {}, nth_tuple1 = 0, nth_tuple2 = 0,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1], maxDraw = 20) {
  console.log(input1, input2);
  let _this = this;
  DrawAlgebra.call(this);
  _this.init(res, input1, input2, nth_tuple1, nth_tuple2);

  if (_this.nth_tuple1 <= _this.tuplesInput1.value.length - 1) {
    _this.draw_compare_table(_this, delete_from_ts1, color1, color2,
      chosenColor1, chosenColor2);
  } else {
    nextAnimation();
  }

  function delete_from_ts1() {
    if (_this.is_Same(_this.src_or_val, _this.tuplesInput1.value[_this.nth_tuple1],
        _this.tuplesInput2.value[_this.nth_tuple2])) {
      drawUtil.disappear(_this.x1, _this.tuplesInput1.value[_this.nth_tuple1].position.y,
        _this.width1, drawUtil.tupleHeight + drawUtil.tupleMargin,
        () => {
          nextTuple();
        }, _this.imgDataBlank1);

      function nextTuple() {
        _this.imgDataResult = drawUtil.ctx.getImageData(drawUtil.result.x, drawUtil.result.y,
          drawUtil.fullWidth - drawUtil.result.x, drawUtil.fullHeight - drawUtil.result.y);
        _this.nth_result++;
        _this.tuplesInput1.value.splice(_this.nth_tuple1, 1);
        _this.nth_tuple2 = 0;
        if (_this.nth_tuple1 < _this.tuplesInput1.value.length) {
          _this.draw_compare_table(_this, delete_from_ts1, color1, color2,
            chosenColor1, chosenColor2);
        } else {
          drawUtil.ctx.clearRect(drawUtil.animField.x + drawUtil.fullWidth / 2,
            drawUtil.animField.y, drawUtil.fullWidth / 2, drawUtil.fullHeight - drawUtil.result.y);
          drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.infoField.y,
            drawUtil.fullWidth, drawUtil.fullHeight);
          drawUtil.table(_this.tuplesInput1, _this.x1, _this.tabY,
            drawUtil.getWidth(_this.tuplesInput1), color1, "black");
          nextAnimation();
        }
      };
    } else {
      drawUtil.ctx.clearRect(drawUtil.animField.x + drawUtil.fullWidth / 2, drawUtil.animField.y,
        drawUtil.fullWidth / 2, drawUtil.fullHeight - drawUtil.result.y);
      drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.infoField.y,
        drawUtil.fullWidth, drawUtil.fullHeight);
      drawUtil.table(_this.tuplesInput1, _this.x1, _this.tabY,
        drawUtil.getWidth(_this.tuplesInput1), color1, "black");
      nextAnimation();
    }
  };
};
/**************************************************************
 ********** Helper functions for animation of Algebra **********
 ***************************************************************/
/**
 * Draw tables and compare the tuples between two tables.
 * If they satisfy the condition, do nextAnimation.
 * @param {object} _this The object that calls this function.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {String} chosenColor1 Color of chosen tuple in table1.
 * @param {String} chosenColor2 Color of chosen tuple in table2.
 */
DrawAlgebra.prototype.draw_compare_table = function(_this, nextAnimation, color1, color2,
  chosenColor1, chosenColor2) {
  _this.counter = _this.waitTime;
  drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.fullWidth, drawUtil.fullHeight);
  drawUtil.table(_this.tuplesInput1, _this.x1, _this.tabY,
    drawUtil.getWidth(_this.tuplesInput1), color1, "black");
  drawUtil.table(_this.tuplesInput2, _this.x2, _this.tabY,
    drawUtil.getWidth(_this.tuplesInput2), color2, "black");
  drawUtil.ctx.putImageData(_this.imgDataResult, drawUtil.result.x, drawUtil.result.y);
  anim(() => {
    return _this.get_Same_Tuples(_this.src_or_val, _this, _this.waitTime,
      _this.tuplesInput1, _this.tuplesInput2, color1, color2, chosenColor1, chosenColor2);
  }, nextAnimation);
};
/**
 * Draw animation of join two tuples.
 * @param {array} imgData The image that before animation.
 * @param {tuple_basic} tuple1 Tuple of left relation.
 * @param {tuple_basic} tuple2 Tuple of right relation.
 * @param {Boolean} draw1 if it is true, show this tuple. If not, doesn't show it.
 * @param {Boolean} draw2 if it is true, show this tuple. If not, doesn't show it.
 * @param {coordinate} src1 The source position of tuple1.
 * @param {coordinate} src2 The source position of tuple2.
 * @param {coordinate} des The destination position of tuples.
 * @param {String} color1 Color of table1.
 * @param {String} color2 Color of table2.
 * @param {function} nextAnimation What will do, after this animation has been done.
 */
DrawAlgebra.prototype.animJoinTuple = function(imgData, tuple1, tuple2, draw1, draw2,
  src1, src2, des, color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  nextAnimation = () => {}) {
  let _this = this;

  let size1 = drawUtil.getWidth(tuple1);
  let size2 = drawUtil.getWidth(tuple2);

  anim(loop, () => {
    nextAnimation();
    return false;
  });

  function loop() {
    if (draw1 && draw2) {
      if (src1.x != des.x || src1.y != des.y ||
        src2.x != (des.x + drawUtil.getWidth(tuple1)) || src2.y != des.y) {
        drawUtil.ctx.putImageData(imgData, drawUtil.animField.x, drawUtil.animField.y);
        _this.tupleMoving(imgData, tuple1, src1, des, color1, "black", false);
        _this.tupleMoving(imgData, tuple2, src2, {
          x: des.x + size1,
          y: des.y
        }, color2, "black", false);
      } else {
        return true;
      }
    } else if (!draw2) {
      if (src1.x != des.x || src1.y != des.y) {
        drawUtil.ctx.putImageData(imgData, drawUtil.animField.x, drawUtil.animField.y);
        _this.tupleMoving(imgData, tuple1, src1, des, color1, "black", false);
      } else {
        return true;
      }
    }
  };
};
/**
 * Draw animation of tuple moving. If reached, return true. Else, return false.
 * @param {array} imgData The image that before animation.
 * @param {tuple_basic} tuple Tuple of relation.
 * @param {coordinate} src The source position of tuple.
 * @param {coordinate} des The destination position of tuples.
 * @param {String} tupleColor Color of table.
 * @param {String} textcolor Color of text.
 * @param {Boolean} drawImg During moving, draw imgData or not.
 */
DrawAlgebra.prototype.tupleMoving = function(imgData, tuple, src, des,
  tupleColor = drawUtil.colorSet[0], textcolor = "black", drawImg = true) {
  let _this = this;

  let size = {};
  size.tupleWidth = drawUtil.getWidth(tuple);
  size.tupleHeight = drawUtil.tupleHeight;
  if (drawImg) drawUtil.ctx.putImageData(imgData, drawUtil.animField.x, drawUtil.animField.y);
  drawUtil.ctx.clearRect(src.x, src.y - drawUtil.tupleMargin / 2,
    size.tupleWidth, size.tupleHeight + drawUtil.tupleMargin);
  src = drawUtil.nextPosition(tuple, size, src, des, false);
  drawUtil.tuple(src.x, src.y, size.tupleWidth, tupleColor, textcolor, drawUtil.getText(tuple));
  if (src.x === des.x && src.y === des.y) {
    return true;
  }
  return false;
};
/**
 * Draw animation of table moving. If reached, return true. Else, return false.
 * @param {tupleset_basic} table The table that should be moved.
 * @param {String} color The color of this table.
 * @param {coordinate} src The source position of table.
 * @param {coordinate} des The destination position of table.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @param {Boolean} transform Transform the shape of table or not.
 * @param {Boolean} contain_columns_name Draw the columns or not.
 * @param {Boolean} contain_name_info Draw the name and information of table or not.
 */
DrawAlgebra.prototype.moveTable = function(table, color, src, des, nextAnimation,
  transform = false, contain_columns_name = true, contain_name_info = true) {
  let _this = this;
  let tabColor = color;
  let size = {};
  if (transform) {
    size.tupleWidth = 0;
    size.tupleHeight = 0;
  } else {
    size.tupleWidth = drawUtil.getWidth(table);
    size.tupleHeight = drawUtil.tupleHeight;
  }
  let height = 0;
  if (table.value.length > drawUtil.maxTableLength) {
    height = (drawUtil.maxTableLength + drawUtil.info_lines) *
      (drawUtil.tupleHeight + drawUtil.tupleMargin);
  } else {
    height = (table.value.length + drawUtil.info_lines) *
      (drawUtil.tupleHeight + drawUtil.tupleMargin);
  }
  _this.imgData = drawUtil.ctx.getImageData(0, 0, drawUtil.fullWidth, drawUtil.fullHeight);

  if (table.color) {
    tabColor = table.color
  }
  anim(loop, () => {
    setTimeout(nextAnimation, 200);
  });

  function loop() {
    if (_this.imgData != null) {
      drawUtil.ctx.putImageData(_this.imgData, 0, 0);
    }
    if (contain_name_info) {
      drawUtil.ctx.clearRect(src.x - 1, src.y - (drawUtil.info_lines - 1) *
        (drawUtil.tupleHeight + drawUtil.tupleMargin),
        drawUtil.getWidth(table) + 1, height);
    }
    drawUtil.ctx.clearRect(src.x - 1, src.y, drawUtil.getWidth(table) + 1, height);
    src = drawUtil.nextPosition(table, size, src, des, transform);
    drawUtil.table(table, src.x, src.y, src.tupleWidth, tabColor, "black",
      contain_columns_name, contain_name_info);
    if (src.x == des.x && src.y == des.y) {
      return true;
    }
    return false;
  };
};
/**
 * If the sources or values of tuples are same, return true.
 * @param {String} src_or_val Compare the source of tuples or the value of tuples.
 * @param {tuple_basic} tuple1 Tuple of a relation.
 * @param {tuple_basic} tuple2 Tuple of the other relation.
 * @param {function} nextAnimation What will do, after this animation has been done.
 * @returns {Boolean}
 */
DrawAlgebra.prototype.is_Same = function(src_or_val = "src", tuple1, tuple2, nextAnimation) {
  let _this = this;
  let judge = {
    src: () => {
      if (tuple1.source.ids.toString() == tuple2.source.ids.toString() &&
        tuple1.source.rels.toString() == tuple2.source.rels.toString()) {
        return true;
      }
      return false;
    },
    val: () => {
      if (tuple1.tupleValue.toString() == tuple2.tupleValue.toString()) {
        return true;
      }
      return false;
    },
  }
  return judge[src_or_val]();
};
/**
 * Find the tuples between two relations that have same source or value.
 * @param {String} src_or_val Compare the source of tuples or the value of tuples.
 * @param {object} _this The object that calls this function.
 * @param {Number} waitTime How long will the animation stop.
 * @param {tupleset_basic} tuplesInput1 One relation.
 * @param {tupleset_basic} tuplesInput2 The other relation.
 * @param {String} color1 Color of tuplesInput1.
 * @param {String} color2 Color of tuplesInput2.
 * @param {String} chosenColor1 Color of chosen tuple in tuplesInput1.
 * @param {String} chosenColor2 Color of chosen tuple in tuplesInput2.
 */
DrawAlgebra.prototype.get_Same_Tuples = function(src_or_val = "src", _this,
  waitTime, tuplesInput1, tuplesInput2,
  color1 = drawUtil.colorSet[0], color2 = drawUtil.colorSet[1],
  chosenColor1 = drawUtil.isChosenColorSet[0],
  chosenColor2 = drawUtil.isChosenColorSet[1]) {
  let tuple1 = tuplesInput1.value[_this.nth_tuple1];
  let tuple2 = tuplesInput2.value[_this.nth_tuple2];
  let tuple1x = tuple1.position.x;
  let tuple2x = tuple2.position.x;
  let tuple1y = tuple1.position.y;
  let tuple2y = tuple2.position.y;

  drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y,
    drawUtil.fullWidth, drawUtil.fullHeight - drawUtil.result.y);
  drawUtil.table(tuplesInput1, drawUtil.animField.x, _this.tabY,
    drawUtil.getWidth(tuplesInput1), color1, "black");
  drawUtil.table(tuplesInput2, drawUtil.fullWidth - drawUtil.getWidth(tuplesInput2), _this.tabY,
    drawUtil.getWidth(tuplesInput2), color2, "black");
  let text = "Find the same tuples between two relations.";
  drawUtil.write_text(text, drawUtil.infoField.x, drawUtil.infoField.y + 20, "black", 20);
  drawUtil.tuple(tuple1x, tuple1y, drawUtil.getWidth(tuple1), chosenColor1,
    "white", drawUtil.getText(tuple1));
  drawUtil.tuple(tuple2x, tuple2y, drawUtil.getWidth(tuple2), chosenColor2,
    "white", drawUtil.getText(tuple2));
  if (_this.counter > 0) {
    _this.counter--;
    return false;
  }
  if (_this.is_Same(_this.src_or_val, tuple1, tuple2)) {
    return true;
  } else {
    if (_this.nth_tuple2 < tuplesInput2.value.length - 1) {
      _this.nth_tuple2++;
      _this.counter = waitTime;
    } else {
      _this.nth_tuple1++;
      _this.nth_tuple2 = 0;
      if (_this.nth_tuple1 >= _this.tuplesInput1.value.length) {
        _this.nth_tuple1--;
        return true;
      }
    }
  }
  return false;
};
