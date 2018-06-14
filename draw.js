/******************************************************************************
 ********* This is the interface that connects html and JS functions.  ********
 ********* This file contains all global variables initionlization.    ********
 ********* All the functions of calling drawing are included in a      ********
 ********* one case Object draw().                                     ********
 *****************************************************************************/
/** Initialize drawUtil, set it be a global variable.*/
window.drawUtil = new DrawUtil();
/** Set a set to save current button */
window.curBtn = {};
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
resetCtb = function() {
  resetIntervalIDs();
  window.control.pause = false;
  window.control.finish = false;
  window.control.laststep = "";
  window.control.nextstep = "";
};
/** Clear all the intervals.*/
resetIntervalIDs = function() {
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
/** Initialize the buttons of control, and Initialize informations.*/
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
    };
  }
  document.getElementById("queryTip").innerHTML =
    "Please type a number in Input-Box. (Range: " + "[0," +
    (queries.SQL_query.length - 1) + "])";

})();
/** Set speed of animation.*/
draw.setSpeed = function() {
  window.control.speed = parseInt(document.getElementById("speed").value);
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
  sqlQuery = sqlQuery.replace(/\s+/g, "");
  let queryLen = queries.SQL_query.length;
  if ((sqlQuery - 0) < 0 || (sqlQuery - 0) > (queryLen - 1) ||
    sqlQuery.length === 0) {
    _this.drawInfo().write("Please type a Number in Range [0," +
      (queryLen - 1) + "]!  ^_^");
    return false;
  }
  for (let i = 0; i < clauses.length; i++) {
    let cap_clause = clauses[i].charAt(0).toUpperCase() +
      clauses[i].substring(1);
    document.getElementById(clauses[i]).style.display = "none";
  }
  document.getElementById("a_subWhere").style.display = "none";
  let where_sub = ["compareSets", "core", "intermediateResult"];
  for (let i = 0; i < where_sub.length; i++) {
    document.getElementById("div" + where_sub[i]).style.display = "none";
  }
  let res_SQL = SQL_process(sqlQuery);

  document.getElementById("wholeProcess").style.display = "";
  for (let i = 0; i < clauses.length; i++) {
    let cap_clause = clauses[i].charAt(0).toUpperCase() +
      clauses[i].substring(1);
    if (res_SQL["res" + cap_clause]) {
      document.getElementById(clauses[i]).style.display = "";
    }
  }
  if (res_SQL.resWhere.compareSets.length > 0) {
    document.getElementById("a_subWhere").style.display = "";
  }
  for (let i = 0; i < where_sub.length; i++) {
    if (res_SQL.resWhere[where_sub[i]].length > 0) {
      document.getElementById("div" + where_sub[i]).style.display = "";
    }
  }

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
  for (let i = 0; i < res_SQL.resFrom.length; i++) {
    res_SQL.resFrom[i].color = drawUtil.colorSet[i % drawUtil.colorSet.length];
    res_SQL.resFrom[i].chosencolor =
      drawUtil.isChosenColorSet[i % drawUtil.isChosenColorSet.length];
  }
  console.log(res_SQL);
  draw.sqlProcess.bindBtn(_this, res_SQL);
};
/** Bind functions to buttons of sql query. */
draw.sqlProcess.bindBtn = function(_this, res_SQL) {
  let dp = new DrawProcess(res_SQL);
  let dBtn = document.getElementsByName('drawProcess');
  for (let i = 0; i < dBtn.length; i++) {
    dBtn[i].onclick = function() {
      window.setBtnStyle(this);
      drawUtil.ctx.clearRect(100, 0, _this.canvasWidth, _this.canvasHeight);
      if (this.getAttribute('id') == "wholeProcess") {
        //If the button means all steps, set all steps be false.
        resetCtb();
        dp.done.setDefault();
        for(let i = 0;i<clauses.length;i++){
          if(!res_SQL["res" + clauses[i].charAt(0).toUpperCase() +
            clauses[i].substring(1)]){
            dp.done[clauses[i]] = null;
          }
        }
        dp.begin();
      } else if (this.getAttribute('id') == "compare" ||
        this.getAttribute('id') == "crossJoin" ||
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
        //If the button means only one step. Set all steps' status be true,
        //and only this step is false.
        resetCtb();
        dp.done.setFinish();
        dp.done.setStatus(this.getAttribute('id'), false);
        dp.begin();
      }
    };
  }
};
/** Draw animation of algebra.*/
draw.algebra = function(query_algebra) {
  resetIntervalIDs();
  if (query_algebra != "") {
    this.drawInfo().write("Initialization Data succeed!");
  } else {
    this.drawInfo().write("Failed to Initialize!");
  }
  return true;
};
/** Draw animation of algebra that just has one level in query.*/
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
      projection(query_algebra.rel1.tuple_set)[0]));
    ts2 = JSON.parse(JSON.stringify(
      projection(query_algebra.rel2.tuple_set)[0]));
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
draw.algebra.results = [];
/** Draw animation of algebra that just has more than one level in query.*/
draw.algebra.multi_algebra = function() {
  let _this = this;
  let query_algebra = queries.algebra.multi;
  draw.algebra(query_algebra);
  /** Iterate does the query. When the query has deeper level.*/
  let loop = function(query, done = {
    val: false
  }) {
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
    _this.ts1 = JSON.parse(JSON.stringify(
      projection(query.rel1.tuple_set)[0]));
    _this.ts2 = JSON.parse(JSON.stringify(
      projection(query.rel2.tuple_set)[0]));
    _this.attr1 = query_algebra.attr1;
    _this.attr2 = query_algebra.attr2;
    _this.op = query_algebra.op;
    let aBtn = document.getElementsByName('algebra');
    let btn;
    for (let i in aBtn) {
      if (aBtn[i].id == query.type) {
        btn = aBtn[i];
      }
    }
    _this.single_algebra(false);
    btn.click();
    let id = setInterval(() => {
      if (draw.algebra.finish) {
        draw.algebra.finish = false;
        clearInterval(id);
        done.val = true;
      }
    }, 1000);
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
/** Get the result of algebra.*/
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
/** Bind functions to button.*/
draw.algebra.bindBtn = function(ts1, ts2, color1, color2,
  chosenColor1, chosenColor2, attr1, attr2, op) {
  let _this = this;
  let aBtn = document.getElementsByName('algebra');
  for (let i = 0; i < aBtn.length; i++) {
    aBtn[i].onclick = function() {
      window.setBtnStyle(this);
      let da = new DrawAlgebra();
      drawUtil.ctx.clearRect(100, 0, draw.canvasWidth, draw.canvasHeight);
      resetCtb();
      let btnID = this.getAttribute('id');
      console.log("click ", btnID);
      let cap_btnID = btnID.charAt(0).toUpperCase() + btnID.substring(1);
      let resAlgebra = _this.getRes[btnID](JSON.parse(JSON.stringify(ts1)),
        JSON.parse(JSON.stringify(ts2)), attr1, attr2, op);
      draw.algebra.results.push(JSON.parse(JSON.stringify(resAlgebra)));
      console.log("res of ", btnID, ":", resAlgebra);
      da["anim" + cap_btnID](resAlgebra, JSON.parse(JSON.stringify(ts1)),
        JSON.parse(JSON.stringify(ts2)), () => {
          draw.algebra.finish = true;
          console.log("over!!!");
          return true;
        }, 0, 0, color1,
        color2, chosenColor1, chosenColor2, 20, attr1, attr2, op);
    };
  }
};
