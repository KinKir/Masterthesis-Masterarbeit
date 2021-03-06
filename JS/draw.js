/******************************************************************************
 ********* This is the interface that connects html and JS functions.  ********
 ********* This file contains all global variables initionlization.    ********
 ********* All the functions of calling drawing are included in a      ********
 ********* one case Object draw().                                     ********
 *****************************************************************************/
/** Initialize drawUtil, set it be a global variable.*/
window.drawUtil = new DrawUtil();
/** Create a object to save current button */
window.curBtn = {};
/**
 * Set the style of given button.
 * @param {String} btn The Id of button.
 */
window.setBtnStyle = function(btn) {
  window.curBtn.style = "";
  window.curBtn = btn;
  window.curBtn.style = "background: #008CBA;color: white;";
}
/** Draw the color bars.*/
drawUtil.colors();
/** Initialize the control flags and informations.*/
window.control = {};
window.control.pause = false;
window.control.finish = false;
window.control.laststep = "";
window.control.nextstep = "";
window.control.intervalIDs = [];
window.control.speed = 60;
/** Reset the status of control flags.*/
var resetCtb = function() {
  resetIntervalIDs();
  window.control.pause = false;
  window.control.finish = false;
  window.control.laststep = "";
  window.control.nextstep = "";
};
window.zoom = false;
/** Clear all the intervals.*/
var resetIntervalIDs = function() {
  for (let i in window.control.intervalIDs) {
    clearInterval(window.control.intervalIDs[i]);
  }
};
/**
 * Call the animations.
 * @namespace draw
 */
draw = {
  canvasWidth: canvasInfo.fullWidth,
  canvasHeight: canvasInfo.fullHeight,
  /** Draw information.*/
  drawInfo: function() {
    return new DrawInfo();
  },
};
/** Initialize the buttons of the animation control panel,
 *and Initialize informations.
 */
(draw.init = function() {
  let cBtn = document.getElementsByName('controlDraw');
  for (let i = 0; i < cBtn.length; i++) {
    cBtn[i].onclick = function() {
      if (this.getAttribute('id') == "pause") {
        window.control.pause = true;
      }
      if (this.getAttribute('id') == "continue") {
        window.control.pause = false;
      }
      if (this.getAttribute('id') == "terminate") {
        window.control.finish = true;
      }
      if (this.getAttribute('id') == "clear") {
        Canvas.ctx.clearRect(0, 0, canvasInfo.fullWidth, canvasInfo.fullHeight);
      }
    };
  }
  document.getElementById("queryTip").innerHTML =
    "Please type a number in Input-Box. (Range: " + "[0," +
    (queries.SQL_query.length - 1) + "])";

})();
/** Set speed of animation.*/
draw.setSpeed = function() {
  let new_speed = parseInt(document.getElementById("speed").value);
  if (new_speed > 0 && new_speed < 1000) {
    window.control.speed = new_speed;
  } else {
    return false;
  }
  window.control.pause = true;
  setTimeout(() => {
    window.control.pause = false;
  }, 200);
};
/** Draw the animation of SQL query.*/
draw.sqlProcess = function() {
  resetIntervalIDs();
  let _this = this;
  let queryBtn = document.getElementById('sqlQuery');
  let sqlQuery = queryBtn.value;
  /**
   * Judge if the input satisfies the rule.
   */
  sqlQuery = sqlQuery.replace(/\s+/g, "");
  let queryLen = queries.SQL_query.length;
  if ((sqlQuery - 0) < 0 || (sqlQuery - 0) > (queryLen - 1) ||
    sqlQuery.length === 0) {
    _this.drawInfo().write("Please type a Number in Range [0," +
      (queryLen - 1) + "]!  ^_^");
    return false;
  }
  /**
   * Hidden the buttons of the SQL query panel.
   */
  for (let i = 0; i < clauses.length; i++) {
    let cap_clause = clauses[i].charAt(0).toUpperCase() +
      clauses[i].substring(1);
    document.getElementById(clauses[i]).style.display = "none";
  }
  let where_sub = ["compareSets", "core", "intermediateResult"];
  for (let i = 0; i < where_sub.length; i++) {
    document.getElementById("div" + where_sub[i]).style.display = "none";
  }
  /**
   * Get the calculated result of SQL query.
   */
  let res_SQL = SQL_process(sqlQuery);
  /**
   * Display the buttons contained in the SQL query.
   */
  document.getElementById("wholeProcess").style.display = "";
  for (let i = 0; i < clauses.length; i++) {
    let cap_clause = clauses[i].charAt(0).toUpperCase() +
      clauses[i].substring(1);
    if (res_SQL["res" + cap_clause]) {
      document.getElementById(clauses[i]).style.display = "";
    }
  }
  if (res_SQL.resWhere && res_SQL.resWhere.compareSets.length > 0) {
    document.getElementById("subWhere").style.display = "";
    for (let i = 0; i < where_sub.length; i++) {
      if (res_SQL.resWhere[where_sub[i]].length > 0) {
        document.getElementById("div" + where_sub[i]).style.display = "";
      }
    }
  }

  /**
   * Show the hint for the next step.
   */
  if (sqlQuery != "") {
    _this.drawInfo().write("Get the query!");
    let tipBox = document.getElementById("queryBtnTip");
    tipBox.innerHTML =
      "Click a Button below to watch the animation.";
    let bgcolor = tipBox.style.backgroundColor;
    let bgcolor_counter = 45;
    let bgcolor_denominator = 20;
    let bgcolor_factor = 0;
    let bgcolorID = setInterval(() => {
      if (bgcolor_counter === 0) {
        tipBox.style.backgroundColor = bgcolor;
        clearInterval(bgcolorID);
        return true;
      }
      if (bgcolor_counter > bgcolor_denominator) {
        bgcolor_factor++;
      } else {
        bgcolor_factor--;
      }
      tipBox.style.backgroundColor = "rgba(243,255,0," +
        (bgcolor_factor / bgcolor_denominator) + ")";
      bgcolor_counter--;
    }, 1000 / 45);

  } else {
    _this.drawInfo().write("Failed to get the query!");
    return false;
  }
  /**
   * Set the color of each table.
   */
  for (let i = 0; i < res_SQL.resFrom.length; i++) {
    res_SQL.resFrom[i].color = drawUtil.colorSet[i % drawUtil.colorSet.length];
    res_SQL.resFrom[i].chosencolor =
      drawUtil.isChosenColorSet[i % drawUtil.isChosenColorSet.length];
  }
  console.log(res_SQL);
  /**
   * Bind the functions of SQL query to each button.
   */
  draw.sqlProcess.bindBtn(res_SQL);
};
/**
 * The result of calculation of the SQL query.
 * @typedef {object} res_SQL
 * @property {query} query
 * @property {tupleset_basic_array} resFrom
 * @property {output_of_where} resWhere
 * @property {output_of_grouping} resGrouping
 * @property {output_of_ordering} resOrdering
 * @property {tupleset_with_group} resSelect
 */
/** Bind functions to the buttons of sql query.
 * @param {res_SQL} res_SQL The result of the calculation of the SQL query.
 */
draw.sqlProcess.bindBtn = function(res_SQL) {
  let dp = new DrawSQLQuery(res_SQL);
  let dBtn = document.getElementsByName('drawSQLQuery');
  for (let i = 0; i < dBtn.length; i++) {
    dBtn[i].onclick = function() {
      resetIntervalIDs();
      window.setBtnStyle(this);
      drawUtil.ctx.clearRect(animField.x, animField.y,
        canvasInfo.fullWidth, canvasInfo.fullHeight);
      if (this.getAttribute('id') == "wholeProcess") {
        /*
         * If the button means all steps, set all steps be false.
         */
        resetCtb();
        dp.done.setDefault();
        for (let i = 0; i < clauses.length; i++) {
          if (!res_SQL["res" + clauses[i].charAt(0).toUpperCase() +
              clauses[i].substring(1)]) {
            dp.done[clauses[i]] = null;
          }
        }
        dp.begin();
      } else if (this.getAttribute('id') == "compare" ||
        this.getAttribute('id') == "core" ||
        this.getAttribute('id') == "intersection_union") {
        //If the button means one step of where.
        if (this.getAttribute('id') == "compare") {
          resetCtb();
          dp.done.setFinish();
          dp.done.setStatus("where", false);
          dp.where.compare();
        }
        if (this.getAttribute('id') == "core") {
          resetCtb();
          dp.done.setFinish();
          dp.done.setStatus("where", false);
          dp.where.crossJoin();
        }
        if (this.getAttribute('id') == "intersection_union") {
          resetCtb();
          dp.done.setFinish();
          dp.done.setStatus("where", false);
          dp.where.intersection_union();
        }
      } else {
        /*
         * If the button means only one step. Set all steps' status be true,
         * and only this step is false.
         */
        resetCtb();
        dp.done.setFinish();
        dp.done.setStatus(this.getAttribute('id'), false);
        dp.begin();
      }
    };
  }
};
/**
 * Draw animation of algebra.
 * @param {String} query_algebra The statement of relational algebra.
 * @returns {Boolean} After this function is processed, it will return true.
 */
draw.algebra = function(query_algebra) {
  if (query_algebra != "") {
    this.drawInfo().write("Initialization Data succeed!");
  } else {
    this.drawInfo().write("Failed to Initialize!");
  }
  return true;
};
/**
 * Initialize the information for drawing the animation of relational algebra
 * that just has one statement. Bind the functions with corresponding buttons.
 * @param {Boolean} single If single is true,
 * means now to draw the animation of one statement.
 */
draw.algebra.single_algebra = function(single = true) {
  let ts1;
  let ts2;
  let attr1;
  let attr2;
  let op;
  let query_algebra = queries.algebra.single;
  draw.algebra(query_algebra);
  if (single) {
    ts1 = JSON.parse(JSON.stringify(
      from(query_algebra.rel1.tuple_set)[0]));
    ts2 = JSON.parse(JSON.stringify(
      from(query_algebra.rel2.tuple_set)[0]));
    attr1 = query_algebra.attr1;
    attr2 = query_algebra.attr2;
    op = query_algebra.op;
  } else {
    ts1 = this.ts1;
    ts2 = this.ts2;
    attr1 = this.attr1;
    attr2 = this.attr2;
    op = this.op;
  }
  let color1;
  let color2;
  let chosenColor1;
  let chosenColor2;
  this.bindBtn(ts1, ts2, color1, color2,
    chosenColor1, chosenColor2, attr1, attr2, op);
};
/**
 * results is used to save the intermediate results of relational algebra.
 */
draw.algebra.results = [];
/** Draw animations of relational algebra that has more than one statements.*/
draw.algebra.multi_algebra = function() {
  let _this = this;
  let query_algebra = JSON.parse(JSON.stringify(queries.algebra.multi));
  draw.algebra(query_algebra);
  /**
   * Iterative operate the statement, if the statement has deeper level.
   * @param {Object} query The statement of relational algebra. The structure of
   * the query is builded as an AST.
   * @param {Object} done If done.val is false, means the statement has deeper
   * statements. If done.val is true, means the statement has not deeper statements.
   */
  let loop = function(query, done = {
    val: false
  }) {
    /**
     * If the left relation includes deeper statement, operate the deeper
     * statement of the left relation.
     */
    if (!query.rel1.tuple_set) {
      let done = {
        val: false
      };
      query.rel1.tuple_set = loop(query.rel1, done);
      let id = setInterval(() => {
        if (done.val) {
          clearInterval(id);
          loop(query);
        }
      }, 1000);
      return true;
    }
    /**
     * If the right relation includes deeper statement, operate the deeper
     * statement of the left relation.
     */
    if (!query.rel2.tuple_set) {
      let done = {
        val: false
      };
      query.rel2.tuple_set = loop(query.rel2, done);
      let id = setInterval(() => {
        if (done.val) {
          clearInterval(id);
          loop(query);
        }
      }, 1000);
      return true;
    }
    /**
     * If the statement has not deeper statement, do the followings.
     * Get the relations by using FROM clause.
     */
    _this.ts1 = JSON.parse(JSON.stringify(
      from(query.rel1.tuple_set)[0]));
    _this.ts2 = JSON.parse(JSON.stringify(
      from(query.rel2.tuple_set)[0]));
    /**
     * Get the statement information.
     */
    _this.attr1 = query_algebra.attr1;
    _this.attr2 = query_algebra.attr2;
    _this.op = query_algebra.op;
    /**
     * Get the button of relational algebra panel, which is corresponding to
     * current step.
     */
    let aBtn = document.getElementsByName('algebra');
    let btn;
    for (let i in aBtn) {
      if (aBtn[i].id == query.type) {
        btn = aBtn[i];
      }
    }
    /**
     * Bind the function of this statement to the button btn. And simulate the
     * click on btn.
     */
    _this.single_algebra(false);
    btn.click();
    let id = setInterval(() => {
      if (draw.algebra.finish) {
        draw.algebra.finish = false;
        clearInterval(id);
        done.val = true;
      }
    }, 1000);
    /**
     * Save the result table of current operation into Database. And return the
     * name of new table.
     */
    let res = draw.algebra.results.pop();
    res.name = [_this.ts1.name.concat(_this.ts2.name).toString()];
    let newRes = {};
    newRes.name = [];
    newRes.columns = [];
    newRes.value = [];
    newRes.name = res.name;
    for (let i in res.columns) {
      newRes.columns = newRes.columns.concat(res.columns[i].columns);
    }
    for (let i in res.value) {
      let tmpTupleValue = [];
      for (let j in res.value[i].tupleValue) {
        tmpTupleValue = tmpTupleValue.concat(res.value[i].tupleValue[j]);
      }
      newRes.value.push({
        "tupleValue": tmpTupleValue
      });
    }
    data.tables.push(newRes);
    return res.name;
  };
  loop(query_algebra);
};
/** Get the result of relational algebra.*/
draw.algebra.getRes = {
  leftJoin: (t1, t2, attr1, attr2, op) => {
    return join.semiJoin(t1, t2, attr1, attr2, op, "left");
  },
  rightJoin: (t1, t2, attr1, attr2, op) => {
    return join.semiJoin(t1, t2, attr1, attr2, op, "right");
  },
  innerJoin: (t1, t2, attr1, attr2, op) => {
    return join.innerJoin(t1, t2, attr1, attr2, op);
  },
  outerJoin: (t1, t2, attr1, attr2, op) => {
    return join.outerJoin(t1, t2, attr1, attr2, op);
  },
  crossJoin: (t1, t2) => {
    return join.crossJoin(t1, t2);
  },
  union: (t1, t2) => {
    return union(t1, t2, false);
  },
  unionAll: (t1, t2) => {
    return union(t1, t2, true);
  },
  intersection: (t1, t2) => {
    return intersection(t1, t2);
  },
  without: (t1, t2) => {
    return without(t1, t2);
  },
};
/**
 * The basical tupleset.
 * @typedef {object} tupleset_basic
 * @property {columns} columns
 * @property {array} name
 * @property {value_basic} value
 */
/**
 * Bind functions of relational algebra to buttons of relational algebra panel.
 * @param {tupleset_basic} ts1 The left relation.
 * @param {tupleset_basic} ts2 The right relation.
 * @param {String} color1 The color of the left relation.
 * @param {String} color2 The color of the right relation.
 * @param {String} chosenColor1 The color of the chosen tuples in the left relation.
 * @param {String} chosenColor2 The color of the chosen tuples in the right relation.
 * @param {String} attr1 The compared attribute of the left relation.
 * @param {String} attr2 The compared attribute of the right relation.
 * @param {String} op The name of the operation.
 */
draw.algebra.bindBtn = function(ts1, ts2, color1, color2,
  chosenColor1, chosenColor2, attr1, attr2, op) {
  let _this = this;
  let aBtn = document.getElementsByName('algebra');
  for (let i = 0; i < aBtn.length; i++) {
    aBtn[i].onclick = function() {
      resetIntervalIDs();
      window.setBtnStyle(this);
      let da = new DrawAlgebra();
      drawUtil.ctx.clearRect(100, 0, draw.canvasWidth, draw.canvasHeight);
      resetCtb();
      let btnID = this.getAttribute('id');
      let cap_btnID = btnID.charAt(0).toUpperCase() + btnID.substring(1);
      let resAlgebra = _this.getRes[btnID](JSON.parse(JSON.stringify(ts1)),
        JSON.parse(JSON.stringify(ts2)), attr1, attr2, op);
      draw.algebra.results.push(JSON.parse(JSON.stringify(resAlgebra)));
      da["anim" + cap_btnID](resAlgebra, JSON.parse(JSON.stringify(ts1)),
        JSON.parse(JSON.stringify(ts2)), () => {
          draw.algebra.finish = true;
          return true;
        }, 0, 0, color1,
        color2, chosenColor1, chosenColor2, 20, attr1, attr2, op);
    };
  }
};
