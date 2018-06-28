/**
 * algebra functions.
 *
 */
/**
 * project the table's attributes with the name's array of attributes.
 * @param tuplesInput the relation that will be queried.
 * @param select the query statement of select of SQL query.
 * @returns {tupleset_with_group} the selected columns' set.
 **/
var projection = function(tuplesInput, select) {
  var tuplesOutput = algebraUtil.initRelation();
  var input = JSON.parse(JSON.stringify(tuplesInput));
  for (var i = 0; i < select.length; i++) {
    tuplesOutput.columns.push({
      src: [],
      columns: []
    });
  }
  var i = 0;
  while (i < select.length) {
    tuplesOutput.columns[i].src.push(select[i].rel);
    var j = 0;
    while (j < select[i].attr.length) {
      /** get every colums position. */
      var position = algebraUtil.getThePosition(input, select[i].rel, select[i].attr[j]);
      /** If the relation has not been added to output, add the relation's name. */
      if (tuplesOutput.name.indexOf(select[i].rel) === -1) {
        tuplesOutput.name.push(select[i].rel);
      }
      /** Add the column's name into output. */
      if (tuplesOutput.columns[position.relPos].columns.indexOf(select[i].attr[j]) === -1) {
        tuplesOutput.columns[position.relPos].columns.push(select[i].attr[j]);
      }
      /** Add this column into output. */
      var valueLen;
      if (position.arrayPos) {
        valueLen = input[position.arrayPos].value.length;
      } else {
        valueLen = input.value.length;
      }
      var k = 0;
      while (k < valueLen) {
        if (tuplesOutput.value[k] == undefined) {
          tuplesOutput.value[k] = Object.assign({}, input.value[k]);
          for (var tvLen in tuplesOutput.value[k].tupleValue) {
            tuplesOutput.value[k].tupleValue[tvLen] = [];
          }
        }
        tuplesOutput.value[k].tupleValue[position.relPos].push(
          tuplesInput.value[k].tupleValue[position.relPos][position.columnPos]);
        k++;
      }
      j++;
    }
    i++;
  }
  return tuplesOutput;
};

/**
 * @namespace join
 */
var join = {
  /**
   * Does the basical compare.
   * @return Boolean.
   */
  "ops": {
    "equal": function(val1, val2) {
      return val1 == val2;
    },
    "less": function(val1, val2) {
      return val1 < val2;
    },
    "lessEqual": function(val1, val2) {
      return val1 <= val2;
    },
    "greater": function(val1, val2) {
      return val1 > val2;
    },
    "greaterEqual": function(val1, val2) {
      return val1 >= val2;
    }
  }
};
/**
 * Does the left join and right join.
 * @param input1 the left relation.
 * @param input2 the right relation.
 * @param attr1 the attribute of left relation.
 * @param attr2 the attribute of right relation.
 * @param L_or_R is short for "left or right join".
 * @returns {tupleset_basic}
 **/
join.semiJoin = function(input1, input2, attr1, attr2, op, L_or_R) {
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  var tuplesOutput;
  var symbol_LR = {
    "left": 0,
    "right": 1
  };
  tuplesOutput = join.outerJoin(tuplesInput1, tuplesInput2, attr1, attr2, op);
  for (var i = 0; i < tuplesOutput.value.length; i++) {
    if (tuplesOutput.value[i].source.rels[symbol_LR[L_or_R]] == null) {
      tuplesOutput.value.splice(i, 1);
      i--;
    }
  }
  return tuplesOutput;
};
/**
 * Does the outer join.
 * @param input1 the left relation.
 * @param input2 the right relation.
 * @param attr1 the attribute of left relation.
 * @param attr2 the attribute of right relation.
 * @param op operation between attribute of input1 and attribute of input2.
 * @returns {tupleset_basic}
 **/
join.outerJoin = function(input1, input2, attr1, attr2, op) {
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  var tuplesOutput = {};
  var attrPos1 = algebraUtil.getThePosition([tuplesInput1, tuplesInput2], tuplesInput1.name, attr1);
  var attrPos2 = algebraUtil.getThePosition([tuplesInput1, tuplesInput2], tuplesInput2.name, attr2);
  tuplesOutput.name = tuplesInput1.name.concat(tuplesInput2.name);
  tuplesOutput.columns = tuplesInput1.columns.concat(tuplesInput2.columns);
  tuplesOutput.value = [];
  var tmpValue = algebraUtil.initValue();
  var tv1 = 0;
  for (var k in tuplesInput1.value[0].tupleValue) {
    tv1 += tuplesInput1.value[0].tupleValue[k].length;
  }
  var tv2 = 0;
  for (var k in tuplesInput2.value[0].tupleValue) {
    tv2 += tuplesInput2.value[0].tupleValue[k].length;
  }
  for (var i in tuplesInput2.value) {
    tuplesInput2.value[i].compare = false;
  }
  for (var i in tuplesInput1.value) {
    tuplesInput1.value[i].compare = false;
    for (var j in tuplesInput2.value) {
      if (join.ops[op](tuplesInput1.value[i].tupleValue[attrPos1.relPos][attrPos1.columnPos],
          tuplesInput2.value[j].tupleValue[attrPos2.relPos][attrPos2.columnPos])) {
        tmpValue = algebraUtil.generateNewValue(tuplesInput1.value[i], tv1, tuplesInput2.value[j], tv2);
        tuplesOutput.value.push(tmpValue);
        tuplesInput1.value[i].compare = true;
        tuplesInput2.value[j].compare = true;
      }
    }
    if (tuplesInput1.value[i].compare == false) {
      tmpValue = algebraUtil.generateNewValue(tuplesInput1.value[i], tv1, null, tv2);
      tuplesOutput.value.push(tmpValue);
    }
  }
  for (var i in tuplesInput2.value) {
    if (tuplesInput2.value[i].compare == false) {
      tmpValue = algebraUtil.generateNewValue(null, tv1, tuplesInput2.value[i], tv2);
      tuplesOutput.value.push(tmpValue);
    }
  }
  return tuplesOutput;
};
/**
 * Does the inner join.
 * @param input1 the left relation.
 * @param input2 the right relation.
 * @param attr1 the attribute of left relation.
 * @param attr2 the attribute of right relation.
 * @param op operation between attribute of input1 and attribute of input2.
 * @returns {tupleset_basic}
 **/
join.innerJoin = function(input1, input2, attr1, attr2, op) {
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  var tuplesOutput = join.outerJoin(tuplesInput1, tuplesInput2, attr1, attr2, op);
  for (var i = 0; i < tuplesOutput.value.length; i++) {
    if (tuplesOutput.value[i].source.rels[0] == null || tuplesOutput.value[i].source.rels[1] == null) {
      tuplesOutput.value.splice(i, 1);
      i--;
    }
  }

  return tuplesOutput;
};
/**
 * Does the cross join.
 * @param input1 the left relation.
 * @param input2 the right relation.
 * @returns {tupleset_basic}
 **/
join.crossJoin = function(input1, input2) {
  var tuplesOutput = algebraUtil.initRelation();
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  tuplesOutput.columns = tuplesOutput.columns.concat(tuplesInput1.columns, tuplesInput2.columns);
  tuplesOutput.name = tuplesOutput.name.concat(tuplesInput1.name, tuplesInput2.name);
  for (var i = 0; i < tuplesInput1.value.length; i++) {
    for (var j = 0; j < tuplesInput2.value.length; j++) {
      var tmpValue = algebraUtil.generateNewValue(tuplesInput1.value[i],
        tuplesInput1.value[i].tupleValue.length, tuplesInput2.value[j],
        tuplesInput2.value[j].tupleValue.length);
      tuplesOutput.value.push(tmpValue);
    }
  }
  return tuplesOutput;
};

/**
 * Does union and union all.
 * @param input1 the left relation.
 * @param input2 the right relation.
 * @param unionAll if it is true, it does union all. Else, it does union.
 * @returns {tupleset_basic}
 **/
var union = function(input1, input2, unionAll) {
  var tuplesOutput = algebraUtil.initRelation();
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  /** judge if the length of columns are same. */
  if (tuplesInput1.columns.length != tuplesInput2.columns.length) {
    return false;
  }
  if (typeof(tuplesInput1.columns.src) == "undefined") {
    if (tuplesInput1.columns.toString() != tuplesInput2.columns.toString()) {
      return false;
    }
  } else {
    for (var i = 0; i < tuplesInput1.columns.length; i++) {
      /** judge if the name of columns are same. */
      if (tuplesInput1.columns[i].columns.toString() != tuplesInput2.columns[i].columns.toString()) {
        return false;
      }
    }
  }
  tuplesOutput.name = tuplesOutput.name.concat(tuplesInput1.name);
  tuplesOutput.columns = tuplesInput1.columns.concat();

  if (unionAll) {
    tuplesOutput.value = tuplesOutput.value.concat(tuplesInput1.value.slice());
    tuplesOutput.value = tuplesOutput.value.concat(tuplesInput2.value.slice());
  } else {
    tuplesOutput.value = union.combineValueWithoutRedundance([], tuplesInput1);
    tuplesOutput.value = union.combineValueWithoutRedundance(tuplesOutput.value, tuplesInput2);
  }
  return tuplesOutput;
};
/**
 * Delete the tuples from srcTuples that have been contained in desTuples.
 * After all the duplicate tuples have been removed,
 * union the left and right relations.
 * @param desTuples the result of unioned tuple set.
 * @param srcTuples the tuple set that will be unioned to desTuples.
 * @returns {value_basic} the result of union.
 **/
union.combineValueWithoutRedundance = function(desTuples, srcTuples) {
  var output = desTuples;
  for (var i = 0; i < srcTuples.value.length; i++) {
    if (output.length == 0) {
      output = [];
      output = output.concat(srcTuples.value[i]);

    }
    var flag = false;
    for (var j = 0; j < output.length; j++) {
      if ((output[j].tupleValue.toString() == srcTuples.value[i].tupleValue.toString()) &&
        (output[j].source.ids.toString() == srcTuples.value[i].source.ids.toString()) &&
        (output[j].source.rels.toString() == srcTuples.value[i].source.rels.toString())) {
        flag = true;
        break;
      }
    }
    if (!flag) {
      output = output.concat(srcTuples.value[i]);
    }
  }
  return output;
};
/**
 * Delete the tuples from left relation, which are same as tuples in right relation.
 * @param input1 left relation.
 * @param input2 right relation.
 * @returns {tupleset_basic} result of without.
 **/
var without = function(input1, input2) {
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  for (var i = 0; i < tuplesInput1.value.length; i++) {
    for (var j in tuplesInput2.value) {
      if (tuplesInput1.value[i].tupleValue.toString() == tuplesInput2.value[j].tupleValue.toString()) {
        tuplesInput1.value.splice(i, 1);
        i--;
      }
    }
  }
  return tuplesInput1;
};
/**
 * Get the same tuples between left relation and right relation.
 * @param input1 left relation.
 * @param input2 right relation.
 * @returns {tupleset_basic} the same tuples' set.
 **/
var intersection = function(input1, input2) {
  let tuplesInput1 = JSON.parse(JSON.stringify(input1));
  let tuplesInput2 = JSON.parse(JSON.stringify(input2));
  var tuplesOutput = algebraUtil.initRelation();
  tuplesOutput.name = tuplesInput1.name.concat();
  tuplesOutput.columns = tuplesInput1.columns.concat();
  for (var i = 0; i < tuplesInput1.value.length; i++) {
    for (var j = 0; j < tuplesInput2.value.length; j++) {
      var tmpValue1 = [];
      var tmpValue2 = [];
      if (tuplesInput1.name.length > 1 || tuplesInput2.name.length > 1) {
        for (var k = 0; k < tuplesInput1.value[i].tupleValue.length; k++) {
          tmpValue1 = tmpValue1.concat(tuplesInput1.value[i].tupleValue[k]);
        }
        for (var k = 0; k < tuplesInput2.value[j].tupleValue.length; k++) {
          tmpValue2 = tmpValue2.concat(tuplesInput2.value[j].tupleValue[k]);
        }
      } else {
        tmpValue1 = tuplesInput1.value[i].tupleValue;
        tmpValue2 = tuplesInput2.value[j].tupleValue;
      }
      if (tmpValue1.toString() == tmpValue2.toString()) {
        var tmp = algebraUtil.initValue();
        tmp.source.ids = tuplesInput1.value[i].source.ids.concat();
        tmp.source.rels = tuplesInput1.value[i].source.rels.concat();
        tmp.tupleValue = tuplesInput1.value[i].tupleValue.concat();
        tuplesOutput.value.push(tmp);
        break;
      }
    }
  }
  return tuplesOutput;
};
