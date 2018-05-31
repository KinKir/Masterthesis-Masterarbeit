/*******************************************************************************
 ********* This file contains all functions for animation of whole SQL *********
 ********* process.                                                    *********
 ********* All the functions are included in one Object DrawProcess(). *********
 ******************************************************************************/
/**
 * Draw process of SQL query.
 * @constructor DrawProcess
 * @param res_SQL the result of SQL query.
 */
function DrawProcess(res_SQL) {
  // result of SQL query.
  this.res = {
    select: res_SQL.resSelection,
    from: res_SQL.resFrom,
    where: res_SQL.resWhere,
    grouping: res_SQL.resGrouping,
    ordering: res_SQL.resOrdering,
    query: res_SQL.query
  };
  // the axis x of table.
  this.tabX = drawUtil.animField.x;
  // the axis y of table.
  this.tabY = drawUtil.animField.y + (drawUtil.info_lines - 1) * (drawUtil.tupleHeight + drawUtil.tupleMargin);
  let _this = this;
  // Draw animation about algebra.
  _this.drawAlgebra = new DrawAlgebra();
  // Draw information.
  _this.drawInfo = new DrawInfo();
  /***************************************************************
   ********************** wholeProcess begin *********************
   ***************************************************************/
  /** DrawProcess#begin Draw the whole process of SQL query.*/
  _this.begin = function() {
    /**
     * Below is animation of "from".
     * If (from.length is not 0, from has not been drawn).
     * After animation, set _this.done.from = true.
     */
    if (_this.res.from.length > 0 && (!_this.done.from)) {
      drawUtil.ctx.fillText(text = "Now is doing 'from' clause: from " + _this.res.query.from.toString(), 100, 450);
      _this.from(_this.res.from);
    }
    /**
     * Below is animation of "where".
     * If (result of where is not null, where has not been drawn, from has been done).
     * After animation, set _this.done.where = true.
     */
    if (_this.res.where && (!_this.done.where) && (_this.done.from)) {
      if (_this.res.query.where.length === 0) {
        drawUtil.table(_this.res.where.result, drawUtil.result.x, drawUtil.result.y, drawUtil.getWidth(_this.res.where.result), drawUtil.colorSet[0], "black");
        _this.done.where = true;
      } else {
        _this.where(_this.res.query, _this.res.where, "whole");
      }
    }
    // if (res.grouping && (!_this.done.grouping) && (_this.done.where)) {
    //   _this.grouping();
    // };
    // if (res.ordering && (!_this.done.ordering) && (_this.done.grouping)) {
    //   _this.ordering();
    // };
    /**
     * Below is animation of "select".
     * If (result of select is not null, select has not been drawn, where has been done).
     * After animation, set _this.done.select = true.
     */
    if (_this.res.select && (!_this.done.select) && (_this.done.where)) {
      _this.selection(_this.res.select);
    }
  };
  /***************************************************************
   **************** sub steps functions of where *****************
   ***************************************************************/
  /**
   * Does the compare step in "where".
   */
  _this.where.compare = function() {
    _this.where(_this.res.query, _this.res.where, "compare", _this.selection);
  };
  /**
   * Does the crossJoin step in "where".
   */
  _this.where.crossJoin = function() {
    _this.where(_this.res.query, _this.res.where, "crossJoin", _this.selection);
  };
  /**
   * Does the "and"(intersection) or "or"(union) step in "where".
   */
  _this.where.intersection_union = function() {
    _this.where(_this.res.query, _this.res.where, "intersection_union", _this.selection);
  };
}
DrawProcess.prototype = {
  /**
   * The flags for which step of SQL query have been done.
   */
  done: {
    select: false,
    from: false,
    where: false,
    grouping: false,
    ordering: false,
    having: false,
    setDefault: function() {
      this.select = false;
      this.from = false;
      this.where = false;
      this.grouping = false;
      this.ordering = false;
      this.having = false;
    },
    setFinish: function() {
      this.select = true;
      this.from = true;
      this.where = true;
      this.grouping = true;
      this.ordering = true;
      this.having = true;
    },
    setStatus: function(name, value) {
      this[name] = value;
    }
  },
  imgData: null,
  colorText: "black"
};

/***************************************************************
 ********************** select begin ***************************
 ***************************************************************/
/**
 * Does the animation of select.
 * @param res_select result of select in SQL query.
 */
DrawProcess.prototype.selection = function(res_select) {
  let _this = this;
  drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y, drawUtil.fullWidth, drawUtil.fullHeight);
  let tupleset = _this.res.where.result;
  let resSelect = res_select;
  let querySelect = _this.res.query.select;
  let queryText = "select ";
  for (let i = 0; i < querySelect.length; i++) {
    for (let j = 0; j < querySelect[i].attr.length; j++) {
      if (i == 0 && j == 0) {
        queryText += querySelect[i].rel + "." + querySelect[i].attr[j];
      } else {
        queryText += "," + querySelect[i].rel + "." + querySelect[i].attr[j];
      }
    }
  }
  _this.drawInfo.write(queryText);
  //draw information of tuplesets
  let relNames = tupleset.name.slice();
  let relNamesPos = {
    x: drawUtil.animField.x,
    y: drawUtil.animField.y + (drawUtil.info_lines - 1) * (drawUtil.tupleHeight + drawUtil.tupleMargin) - 15
  };
  // seprate tupleset to columns
  tupleset = drawUtil.sep_ts_col(tupleset);
  //draw tupleset in top of animField
  let tabName = tupleset[0].name[0];
  drawUtil.write_text("Relation " + tabName, relNamesPos.x, relNamesPos.y);
  let colorNum = 0;
  let color = drawUtil.colorSet[0];
  for (let i = 0; i < tupleset.length; i++) {
    let x = drawUtil.animField.x + i * (drawUtil.columnWidth + drawUtil.tupleMargin);
    let y = drawUtil.animField.y + (drawUtil.info_lines - 1) * (drawUtil.tupleHeight + drawUtil.tupleMargin);
    if (tupleset[i].name[0] != tabName) {
      colorNum++;
      tabName = tupleset[i].name[0];
      color = drawUtil.colorSet[parseInt(colorNum % drawUtil.colorSet.length)];
      drawUtil.write_text("Relation " + relNames[colorNum], x, y - 15);
    }
    tupleset[i].color = color;
    drawUtil.table(tupleset[i], x, y, drawUtil.columnWidth, color, "black", true, false);
  }
  //move selected columns to result area.
  resSelect = drawUtil.sep_ts_col(resSelect);
  let column = {};
  let resNum = -1;
  let loop = function() {
    column = resSelect.shift();
    resNum++;
    if (column) {
      for (let i in tupleset) {
        if (column.name[0] == tupleset[i].name[0] && column.columns[0].columns[0] == tupleset[i].columns[0].columns[0]) {
          column = tupleset[i];
        };
      };
      _this.drawAlgebra.moveTable(column, column.color, {
        x: column.value[0].position.x,
        y: column.value[0].position.y,
        tupleWidth: drawUtil.columnWidth
      }, {
        x: drawUtil.result.x + resNum * (drawUtil.columnWidth + drawUtil.tupleMargin),
        y: drawUtil.result.y
      }, loop, false, true, false);
    } else {
      _this.done.select = true;
      return true;
    }
  };
  loop();
};
/**************************************************************
 ********************** from begin ****************************
 **************************************************************/
/**
 * Does the animation of from.
 * @param tables result of from in SQL query.
 */
DrawProcess.prototype.from = function(tables) {
  let _this = this;
  let des = [];
  let src = [];
  let width = [];
  let height = [];
  console.log("here is from!");
  drawUtil.ctx.clearRect(100, 0, drawUtil.fullWidth, drawUtil.fullHeight);
  let queryFrom = _this.res.query.from;
  let queryText = "from " + queryFrom.toString();
  _this.drawInfo.write(queryText);
  // Draw Database symbol.
  drawUtil.drawDB(DBx = 540, DBy = 800, DBwidth = 80, DBheight = 80);
  _this.imgData = drawUtil.ctx.getImageData(0, 0, drawUtil.fullWidth, drawUtil.fullHeight);
  /**
   * Save image of initionlization and Database symbol.
   *Then set the source position, destination position, widths and heights of tables.
   */
  let vorwidth = 0;
  for (let i in tables) {
    des.push({
      "x": _this.tabX + parseInt(vorwidth + i * 20),
      "y": _this.tabY
    });
    src.push({
      "x": drawUtil.fullWidth / 2,
      "y": drawUtil.fullHeight - 200
    });
    width.push(drawUtil.getWidth(tables[i]));
    if (tables[i].value.length > drawUtil.maxTableLength) {
      height.push((drawUtil.maxTableLength + 2) * (drawUtil.tupleHeight + drawUtil.tupleMargin) + drawUtil.info_lines * (drawUtil.tupleHeight + drawUtil.tupleMargin));
    } else {
      height.push(tables[i].value.length * (drawUtil.tupleHeight + drawUtil.tupleMargin));
    }
    vorwidth += width[i];
  }
  /**
   * Draw the tables one by one. i means the idx of table in tables array.
   */
  let i = 0;

  function loop() {
    if (i < tables.length) {
      _this.drawAlgebra.moveTable(tables[i], drawUtil.colorSet[i % drawUtil.colorSet.length], src[i], des[i], loop, true, true);
      i++;
    } else {
      _this.done.from = true;
      _this.begin();
    }
  };
  loop();
};

/***************************************************************
 ********************** where begin ****************************
 ***************************************************************/
/**
 * Does the animation of where.
 * @param {query} query the SQL query.
 * @param {output_of_where} res_where result of where in SQL query.
 * @param {String} step Show the whole sub-steps of where, or exactly one sub-step in where.
 */
DrawProcess.prototype.where = function(query, res_where, step = "whole") {
  let _this = this;
  let compareSets = res_where.compareSets;
  drawUtil.ctx.clearRect(100, 0, drawUtil.fullWidth, drawUtil.fullHeight);
  let querySelect = _this.res.query.select;
  _this.i = 0;
  _this.j = 0;
  let result = {
    x: drawUtil.result.x,
    y: drawUtil.result.y
  };
  //get the compare result of i-th condition.
  var compareSet;
  //get condition information of i-th condition.
  var condition;
  var table1 = {};
  var table2 = {};
  var color1;
  var color2;
  var chosenColor1;
  var chosenColor2;
  var nth_tuple1 = 0; //current tuple in left table.
  var nth_tuple2 = 0; //current tuple in right table.
  var tuple1 = {};
  var tuple2 = {};
  var src1 = {};
  var src2 = {};
  var des1 = {};
  var des2 = result;
  let draw1 = true;
  let draw2 = true;
  let steps = {
    whole: function() {
      _this.i = 0;
      _this.j = 0;
      initTable();
      _this.imgData = drawUtil.ctx.getImageData(0, 0, drawUtil.animField.width, drawUtil.animField.height);
      callAnimCompare();
      return;
    },
    compare: function() {
      _this.i = 0;
      _this.j = 0;

      callAnimCompare();
      return;
    },
    crossJoin: function() {
      _this.i = 0;
      _this.j = 0;
      callAnimCrossJoin();
      return;
    },
    intersection_union: function() {
      _this.i = 0;
      _this.j = 0;
      anim_intersection_union();
      return;
    }
  };
  steps[step]();

  function callAnimCompare() {
    if (_this.i >= res_where.compareSets.length) {
      if (step == "whole") {
        _this.i = 0;
        _this.j = 0;
        callAnimCrossJoin();
        return true;
      } else {
        drawUtil.write_text("Compared.", drawUtil.animField.fullWidth / 2 - 100, drawUtil.animField.fullHeight / 2, "black", 20);
        return true;
      }
    }
    initTable();
    _this.imgData = drawUtil.ctx.getImageData(0, 0, drawUtil.animField.width, drawUtil.animField.height);
    drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y, drawUtil.animField.width, drawUtil.animField.height)
    _this.drawAlgebra.animInnerJoin(res_where.compareSets[_this.i], table1, table2, () => {
      _this.i++;
      callAnimCompare();
      return true;
    }, 0, 0, color1, color2, chosenColor1, chosenColor2, drawUtil.maxDraw, condition.attr1, condition.attr2, condition.op);
    return true;
  };

  function initTable() {
    //get the position of relations in resfrom.
    let pos = [];
    //get the compare result of i-th condition.
    compareSet = compareSets[_this.i];
    //get condition information of i-th condition.
    condition = compareSet.step.condition;
    //get the position of relations in resfrom.
    pos = [];
    pos = get_pos_in_fromlist(compareSet.name, _this.res.from);
    if (pos.length == 1) {
      table1 = _this.res.from[pos[0]];
      let attr = "";
      if (condition.rel1 == null) {
        attr = condition.attr1;
      } else {
        attr = condition.attr2;
      };
      table2 = drawUtil.generateNewTable(attr);
      draw2 = false;
    }
    if (pos.length == 0) {
      table1 = drawUtil.generateNewTable(condition.attr1);
      table2 = drawUtil.generateNewTable(condition.attr2);
      draw1 = false;
      draw2 = false;
    }
    if (pos.length > 1) {
      table1 = _this.res.from[pos[0]];
      table2 = _this.res.from[pos[1]];
    }
    color1 = drawUtil.colorSet[pos[0] % drawUtil.colorSet.length];
    color2 = drawUtil.colorSet[pos[1] % drawUtil.colorSet.length];
    chosenColor1 = drawUtil.isChosenColorSet[pos[0] % drawUtil.isChosenColorSet.length];
    chosenColor2 = drawUtil.isChosenColorSet[pos[1] % drawUtil.isChosenColorSet.length];
  };
  //cross join with other relations' tuples. just show the join result in where.core.
  function callAnimCrossJoin() {
    if (_this.i >= res_where.compareSets.length) {
      if (step == "whole") {
        _this.i = 0;
        _this.j = 0;
        anim_intersection_union();
        return true;
      } else {
        drawUtil.write_text("It doesn't need cross join any more.", drawUtil.animField.fullWidth / 2 - 100, drawUtil.animField.fullHeight / 2, "black", 20);
        return true;
      }
    }
    if (res_where.core[_this.i].name.length == res_where.compareSets[_this.i].name.length) {
      _this.i++;
      callAnimCrossJoin();
      return true;
    }
    drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y, drawUtil.fullWidth, drawUtil.fullHeight);
    _this.drawInfo.write("cross join");
    let compareSets = res_where.compareSets;
    let leftTable = compareSets[_this.i];
    let rightTables = algebraUtil.get_unusedInputs(_this.res.from, leftTable);
    let rightTable = rightTables[_this.j];
    if (_this.i < compareSets.length && _this.j < rightTables.length) {
      if (_this.j > 0) {
        for (let k = 0; k < _this.j; k++)
          leftTable = join.crossJoin(leftTable, rightTables[k]);
      };
      _this.drawAlgebra.animCrossJoin(res_where.core[_this.i], leftTable, rightTable, () => {
        callback(_this);
      });
    }

    function callback(_this) {
      if (_this.j < rightTables.length - 1) {
        _this.j++;
      } else {
        _this.i++;
        _this.j = 0;
      }
      if (_this.i >= compareSets.length) {
        _this.i = 0;
        _this.j = 0;
        anim_intersection_union();
        return true;
      }
      callAnimCrossJoin();
    };
  };

  function anim_intersection_union() {
    drawUtil.ctx.clearRect(drawUtil.animField.x, drawUtil.animField.y, drawUtil.fullWidth, drawUtil.fullHeight);
    loop();

    function loop() {
      _this.i++;
      if (res_where.intermediateResult.length < 2 || _this.i >= res_where.intermediateResult.length) {
        _this.drawInfo.writeLeft("");
        _this.done.where = true;
        _this.begin();
        return true;
      }
      let compareSet = compareSets[_this.i];
      let condition = compareSet.step.condition;
      let oldSet = res_where.intermediateResult[_this.i - 1];
      let newSet = res_where.core[_this.i];
      if (_this.i > 1) {
        drawUtil.ctx.clearRect(drawUtil.result.x, drawUtil.result.y, drawUtil.result.width, drawUtil.result.height);
        let srcRes = {
          x: drawUtil.result.x,
          y: drawUtil.result.y
        };
        let desRes = {
          x: drawUtil.animField.x,
          y: drawUtil.animField.y + (drawUtil.info_lines - 1) * (drawUtil.tupleHeight + drawUtil.tupleMargin)
        };
        if (compareSets[_this.i - 1].step.condition.union == "and") {
          _this.drawAlgebra.moveTable(oldSet, drawUtil.colorSet[0], srcRes, desRes, drawAnim, true, true);
        } else {
          drawAnim();
        }
      } else {
        drawAnim();
      }

      function drawAnim() {
        if (condition.union == "and") {
          console.log("this is and");
          _this.drawInfo.writeLeft("intersection");
          _this.drawAlgebra.animIntersection(res_where.intermediateResult[_this.i], oldSet, newSet, loop);
        }
        if (condition.union == "or") {
          console.log("this is or");
          _this.drawInfo.writeLeft("union");
          _this.drawAlgebra.animUnion(res_where.intermediateResult[_this.i], oldSet, newSet, loop);
        }
      };
    };
  };
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
get_Attr_Pos_in_column = function(columns, x, y, attr, width) {
  let pos = 0;
  let counter = 0;
  let find = false;
  let tmpcolumns = [];
  for(let i in columns){
    tmpcolumns = tmpcolumns.concat(columns[i].columns);
  }
  for (let i in tmpcolumns) {
    if (tmpcolumns[i] === attr) {
      pos = counter;
      find = true;
      break;
    }
    counter++;
  }
  let res = {};
  res.width = width / tmpcolumns.length;
  res.x = x + (pos) * res.width;
  res.y = y;
  return res;
};
/**
 * Get the positions of relations with their names in tuplesets_array.
 * @param {String} names which relations' positions we need to get.
 * @param {tupleset_basic_array} tuplesets_array an array of relations.
 * @return {array} Positions of the relations in array.
 */
get_pos_in_fromlist = function(names, tuplesets_array) {
  let pos = [];
  for (let j in names) {
    for (let k in tuplesets_array) {
      if (names[j] === tuplesets_array[k].name[0]) {
        pos.push(k);
      }
    }
  }
  return pos;
};
/**
 * Module for animation.
 * @module anim
 * @param {function} animation The animation that should do.
 * @param {function} nextAnimation What should do after animation has been done.
 * @param {function} reset Clear the things that has been drew.
 * @return {Boolean}
 */
anim = function(animation, nextAnimation = () => {}, reset = () => {
  drawUtil.ctx.clearRect(0, 0, drawUtil.fullWidth, drawUtil.fullHeight);
  drawUtil.colors();
  return true;
}) {
  let out = false;

  function loop() {
    if (animation()) {
      out = true;
      clearInterval(window.control.intervalIDs.pop());
      setTimeout(() => {
        return nextAnimation()
      }, 200);
      return true;
    }
    if (window.control.pause) {
      clearInterval(window.control.intervalIDs.pop());
      window.control.intervalIDs.push(setInterval(wait, 1000 / window.control.speed));
    }
    if (window.control.finish) {
      clearInterval(window.control.intervalIDs.pop());
      out = true;
      reset();
      return true;
    }

    function wait() {
      if (!window.control.pause) {
        clearInterval(window.control.intervalIDs.pop());
        out = true;
        anim(animation, nextAnimation);
      }
      if (window.control.finish) {
        clearInterval(window.control.intervalIDs.pop());
        out = true;
        reset();
        return true;
      }
    };
  };
  if (!out) {
    window.control.intervalIDs.push(setInterval(loop, 1000 / window.control.speed));
  }
};
