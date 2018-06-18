/**
 * SQL functions.
 *
 */
/**
 * The value of table. In selection and ordering and grouping,
 * it has more attribute named "group".
 * @typedef {array} value_with_group
 * @property {object} source
 * @property {array} tupleValue
 * @property {array} group
 */
/**
 * The value in tupleset with attribute of group key.
 * @typedef {object} tupleset_with_group
 * @property {columns} columns
 * @property {array} name
 * @property {value_with_group} value
 */
/**
 * Does the select clause in SQL query.
 * @param tuplesInput the relation that will be queried.
 * @param select the query statement of select of SQL query.
 * @returns {tupleset_with_group} the selected columns' set.
 **/
selection = function(tuplesInput, select) {
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
 * Does the from clause in SQL query.
 * @param {array} tables the relations' names that will be queried.
 * @returns {tupleset_basic_array} the selected tables.
 **/
from = function(tables) {
  var tuplesOutput;
  tuplesOutput = projection(tables);
  return tuplesOutput;
};
/**
 * The output of where.
 * @typedef {object} output_of_where
 * @property {tupleset_with_step_array} compareSets
 * @property {tupleset_basic_array} core
 * @property {tupleset_basic_array} intermediateResult
 * @property {tupleset_basic} result
 */
/**
 * The tupleset array with the tupleset that contains step information.
 * @typedef {array} tupleset_with_step_array
 * @property {tupleset_with_step} tupleset_with_step
 */
/**
 * The tupleset with step information.
 * @typedef {array} tupleset_with_step
 * @property {columns} columns
 * @property {array} name
 * @property {value_basic} value
 * @property {step} step
 */
/**
 * The step information.
 * @typedef {object} step
 * @property {condition} condition
 * @property {String} resultFrom
 * @property {Number} stepNumber
 */
/**
 * The condition.
 * @typedef {object} condition
 * @property {String} attr1
 * @property {String} attr2
 * @property {String} op
 * @property {String} rel1
 * @property {String} rel2
 * @property {String} union
 */
/**
 * Does the where clause in SQL query.
 * @param tuplesInput the relation that will be operated.
 * @param conditions the clause of where in SQL query.
 * @returns {output_of_where} result of where clause.
 **/
where = function(tuplesInput, conditions) {
  let tuplesOutput = {};
  /** if where clause is null, just crossJoin all tuples of every relation. */
  if (conditions == "null") {
    let i = 1;
    tuplesOutput = tuplesInput[0];
    while (i < tuplesInput.length) {
      tuplesOutput = join.crossJoin(tuplesOutput, tuplesInput[i]);
      i++;
    }
    return tuplesOutput;
  } else {
    /** initionlize variables.
     * @param tuplesOutput.intermediateResult intermediateResult.
     * @param tuplesOutput.result final result.
     * @param tuplesOutput.core result of every step after cross join with other relations.
     * @param tuplesOutput.compareSets result of every step,
     * just the result of both sides' relation or attribute.
     */
    tuplesOutput.intermediateResult = [];
    tuplesOutput.result = null;
    tuplesOutput.core = [];
    tuplesOutput.compareSets = [];
    let tuplesOrdering = [];
    /** get the ordering of the relations in From clause. */
    for (let i = 0; i < tuplesInput.length; i++) {
      tuplesOrdering = tuplesOrdering.concat(tuplesInput[i].name);
    }
    // begin to execute the conditions.
    let i = 0;
    while (i < conditions.length) {
      /** both sides are not relations.*/
      if (conditions[i].rel1 == "null" && conditions[i].rel2 == "null") {
        if (conditions[i].union == "or") {
          /** do nothing, it doesn't enfluent the result. */
        } else {
          if (where.ops[conditions[i].op](conditions[i].attr1, conditions[i].attr2)) {
            /** if the condition is true, do nothing. */
          } else {
            /** if the condition is false, return a blank tupleset
            which has only the name of columns and relations. */
            tuplesOutput.result.value = algebraUtil.initValue();
            return tuplesOutput;
          }
        }
      } else {
        // at least one of both sides is relation.
        var andOr = {
          "and": function(result, newTuples) {
            if (result == null) {
              return newTuples;
            }
            return intersection(result, newTuples);
          },
          "or": function(result, newTuples) {
            if (result == null) {
              return newTuples;
            }
            return union(result, newTuples, false);
          }
        };
        /**
         * push the result of this condition into tuplesOutput.core.
         * where.compareSets save the result of two relations,
         * where.get_unusedInputs_crossJoin() crossJoin the result with the other relations,
         * where.ordering() orders the relations in the given ordering.
         */
        tuplesOutput.compareSets.push(
          algebraUtil.unitCompare(tuplesInput, conditions[i], i + 1));
        let unusedInputs = algebraUtil.get_unusedInputs(tuplesInput,
          tuplesOutput.compareSets[tuplesOutput.compareSets.length - 1]);
        let tmpCore = {};
        if (!unusedInputs) {
          tmpCore = where.ordering(
            JSON.parse(JSON.stringify(
              tuplesOutput.compareSets[tuplesOutput.compareSets.length - 1])),
            tuplesOrdering);
        } else {
          tuplesOutput.core.push(where.ordering(
            where.get_unusedInputs_crossJoin(tuplesInput,
              JSON.parse(JSON.stringify(
                tuplesOutput.compareSets[tuplesOutput.compareSets.length - 1]))),
            tuplesOrdering));
            tmpCore = tuplesOutput.core[tuplesOutput.core.length - 1];
        }
        /** merge the result of this condition with the before result. */
        tuplesOutput.result = andOr[conditions[i].union](tuplesOutput.result,
          tmpCore);
        /** push now result into tuplesOutput.intermediateResult. */
        tuplesOutput.intermediateResult.push(
          JSON.parse(JSON.stringify(tuplesOutput.result)));
      }
      i++;
    }
    /** end of execute of the conditions. */
  }
  if(tuplesOutput.intermediateResult.length < 2){
    tuplesOutput.intermediateResult = [];
  }
  return tuplesOutput;
};
/**
 * Does the basical compare.
 * @returns {Boolean}.
 */
where.ops = {
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
};
/**
 * Get the tuples that are not in joinedTuples, then crossJoin them with joinedTuples.
 * @param tuplesInput the all relations that would be queried.
 * @param joinedTuples the tuples' set that have been joined.
 * @returns {tupleset_basic} tuples set.
 **/
where.get_unusedInputs_crossJoin = function(tuplesInput, joinedTuples) {
  var tmp = joinedTuples;
  var notUsedInputs = algebraUtil.get_unusedInputs(tuplesInput, joinedTuples);
  var result = tmp;
  for (var i = 0; i < notUsedInputs.length; i++) {
    result = join.crossJoin(result, notUsedInputs[i]);
  }
  return result;
};
/**
 * Order the columns' sequence with tuplesOrdering,
 * make the tuplesInput's columns' order be the same as tuplesOrdering.
 * @param tuplesInput the relation whose columns need to be ordered.
 * @param tuplesOrdering the sequence of columns.
 * @returns {tupleset_basic} tuples set.
 **/
where.ordering = function(tuplesInput, tuplesOrdering) {
  for (var i = 0; i < tuplesInput.name.length; i++) {
    for (var j = 0; j < tuplesOrdering.length; j++) {
      if (tuplesInput.name[i] == tuplesOrdering[j] && i != j) {
        var tmpName = tuplesInput.name[j];
        tuplesInput.name[j] = tuplesInput.name[i];
        tuplesInput.name[i] = tmpName;

        var tmpcolumns = tuplesInput.columns[j];
        tuplesInput.columns[j] = tuplesInput.columns[i];
        tuplesInput.columns[i] = tmpcolumns;

        for (var k = 0; k < tuplesInput.value.length; k++) {
          var tmpIds = tuplesInput.value[k].source.ids[j];
          tuplesInput.value[k].source.ids[j] = tuplesInput.value[k].source.ids[i];
          tuplesInput.value[k].source.ids[i] = tmpIds;

          var tmpRels = tuplesInput.value[k].source.rels[j];
          tuplesInput.value[k].source.rels[j] = tuplesInput.value[k].source.rels[i];
          tuplesInput.value[k].source.rels[i] = tmpRels;

          var tmpTupleValue = tuplesInput.value[k].tupleValue[j];
          tuplesInput.value[k].tupleValue[j] = tuplesInput.value[k].tupleValue[i];
          tuplesInput.value[k].tupleValue[i] = tmpTupleValue;
        }
      }
    }
  }
  return tuplesInput;
};
/**
 * The output of grouping.
 * @typedef {object} output_of_grouping
 * @property {tupleset_with_group} allTuples
 * @property {grouping_result} result
 */
/**
 * The structure of result of grouping.
 * @typedef {object} grouping_result
 * @property {columns} columns
 * @property {array} name
 * @property {value_with_group} value
 * @property {grouping_info} groupBy
 */
/**
 * The structure of result of grouping.
 * @typedef {array} grouping_info
 * @property {String} rel
 * @property {String} attr
 */
/**
 * Does the "group by" clause in SQL query.
 * @param tuplesInput the relation that will be operated.
 * @param groupby the sentence of "group by" in SQL query.
 * @returns {output_of_grouping} It saves the result tuples.
 * In allTuples, it saves the all tuples,
 * because when it execute the functions in select,
 * it needs all the tuples to calculate.
 **/
grouping = function(tuplesInput, groupby) {
  var groupby = groupby.slice();
  var tuplesInputs = JSON.parse(JSON.stringify(tuplesInput));
  var tuplesOutput = {};
  tuplesOutput.result = algebraUtil.initRelation();
  tuplesOutput.allTuples = algebraUtil.initRelation();
  tuplesOutput.result.columns = tuplesInput.columns.concat();
  tuplesOutput.allTuples.columns = tuplesInput.columns.concat();
  tuplesOutput.result.name = tuplesInput.name.concat();
  tuplesOutput.allTuples.name = tuplesInput.name.concat();
  tuplesOutput.result.groupBy = groupby.slice();
  let group_key_name = [];
  for(let i in groupby){
    group_key_name.push(groupby[i].rel + "." + groupby[i].attr);
  }
  tuplesOutput.result.group_key_name = group_key_name;
  var rel = [];
  var attr = [];
  while (groupby.length > 0) {
    var groupBy = groupby.shift();
    rel = rel.concat(groupBy.rel);
    attr = attr.concat(groupBy.attr);
  }
  var relPos = [];
  var attrPos = [];
  for (var i = 0; i < rel.length; i++) {
    var position = algebraUtil.getThePosition(tuplesInputs, rel[i], attr[i]);
    relPos.push(position.relPos);
    attrPos.push(position.columnPos);
  }

  var hasTuple = function(tuples, tuple, relPos, attrPos) {
    var len = tuples.value.length;
    var counter = 0;
    while (len > 0) {
      for (var i = 0; i < relPos.length; i++) {
        if (tuples.value[len - 1].group[i] ==
          tuple.tupleValue[relPos[i]][attrPos[i]]) {
          counter++;
        }
      }
      if (counter == relPos.length) {
        return tuples.value[len - 1].group;
      }
      counter = 0;
      len--;
    }
    return false;
  };
  var i = tuplesInputs.value.length;
  var groupKey = [];
  while (i > 0) {
    var tuple = tuplesInputs.value.pop();
    let groupKey = hasTuple(tuplesOutput.result, tuple, relPos, attrPos);
    if (!groupKey) {
      groupKey = [];
      for (var j = 0; j < relPos.length; j++) {
        groupKey = groupKey.concat(tuple.tupleValue[relPos[j]][attrPos[j]]);
      }
      tuplesOutput.result.value.push(tuple);
      tuplesOutput.result.value[tuplesOutput.result.value.length - 1].group = groupKey;
    }
    tuplesOutput.allTuples.value.push(tuple);
    tuplesOutput.allTuples.value[tuplesOutput.allTuples.value.length - 1].group = groupKey;
    groupKey = [];
    i--;
  }
  return tuplesOutput;
};
/**
 * The output of ordering.
 * @typedef {object} output_of_ordering
 * @property {columns} columns
 * @property {array} name
 * @property {value_with_group} value
 * @property {ordering_compare} compare
 */
/**
 * The compare result in ordering.
 * @typedef {array} ordering_compare
 * @property {value_with_group} bigger
 * @property {order} order
 * @property {value_with_group} smaller
 */
/**
 * The order string.
 * @typedef {object} order
 * @property {String} UpDown
 * @property {String} attr
 * @property {String} rel
 */
/**
 * Does the "order by" clause in SQL query.
 * @param tuplesInput the relation that will be operated.
 * @param order the sentence of "order by" in SQL query.
 * @returns {output_of_ordering}
 **/
ordering = function(tuplesInput, order) {
  var order = order.slice();
  var tuplesOutput = algebraUtil.initRelation();
  tuplesOutput.name = tuplesInput.name.concat();
  tuplesOutput.columns = tuplesInput.columns.concat();
  var sortingRes = ordering.sorting(tuplesInput, order);
  tuplesOutput.compare = sortingRes.compare;
  tuplesOutput.value = sortingRes.value;
  return tuplesOutput;
};
/**
 * The order string.
 * @typedef {object} result_of_sorting
 * @property {ordering_compare} compare
 * @property {value_with_group} value
 */
/**
 * Sort the tuples.
 * There are maybe more than one sub-sentence in "order by" clause,
 * sorts the tuples set with the sentences of "order by" one by one.
 * @param tuplesInput the relation that will be operated.
 * @param order the sentence of "order by" in SQL query.
 * @returns {result_of_sorting} The relation of result of sorted.
 **/
ordering.sorting = function(tuplesInput, order) {
  var nowOrder = order.shift();
  var positions = algebraUtil.getThePosition(tuplesInput, nowOrder.rel, nowOrder.attr);
  var relPos = positions.relPos;
  var columnPos = positions.columnPos;
  var output = {};
  output.compare = [];
  /** If the length of order command is more than 0, call this.
  It will order from last clause to first clause. */
  if (order.length > 0) {
    var tmpResult = ordering.sorting(tuplesInput, order);
    tuplesInput.value = tmpResult.value;
    output.compare = tmpResult.compare;
  }
  /**
   * When the length of order command is zero, this is the last one command,
   * begin to call the quicksort.
   * And return the quicksort result. Then the last last one call the quicksort.
   * Until the order command is the first command.
   */
  var quickRes = ordering.quicksort(tuplesInput.value, relPos, columnPos, nowOrder);
  output.value = quickRes.value;
  output.compare = quickRes.compare.concat(output.compare);
  return output;
};
/**
 * quicksort, sorts the tuples set with one column's value.
 * @param values the values of tuples set.
 * @param relPos the position of relation.
 * @param columnPos the position of column that need to be sorted.
 * @param order the sub-sentence of "order by" in SQL query.
 * @returns {result_of_sorting} The relation of result of quick-sorted.
 **/
ordering.quicksort = function(values, relPos, columnPos, order) {
  var output = {};
  output.value = [];
  var left = [];
  var right = [];
  var mid = [values[0]];
  output.compare = [];
  /** @param output.compare is used to record the intermediateResult in every
  compare happens. */
  /** compare is used to identify the command is ASC or DESC. */
  var compare = {
    "ASC": function(val1, val2) {
      return val1 < val2;
    },
    "DESC": function(val1, val2) {
      return val1 > val2;
    }
  }
  /** If it contains only one or zero value in values. Just return it. No more
  compare. */
  if (values.length <= 1) {
    if (values.length == 0) {
      output.value = [];
      return output;
    }
    output.value = [values[0]];
    return output;
  }
  /** The smaller put in left, bigger put in right. The equal, put in right. */
  for (var i = 1; i < values.length; i++) {
    if (compare[order.UpDown](values[i].tupleValue[relPos][columnPos],
        mid[0].tupleValue[relPos][columnPos])) {
      left.push(values[i]);
      output.compare.push({
        "smaller": values[i],
        "bigger": mid[0],
        "order": order
      });
    } else {
      right.push(values[i]);
      output.compare.push({
        "bigger": values[i],
        "smaller": mid[0],
        "order": order
      });
    }
  }
  /** left and right, doing the quicksort recursive.
  Get the result of quicksort of left and right. */
  var leftSort = ordering.quicksort(left, relPos, columnPos, order);
  var rightSort = ordering.quicksort(right, relPos, columnPos, order);
  /** Concatenate the result of left, mid and right. */
  output.compare = output.compare.concat(leftSort.compare.concat(rightSort.compare));
  output.value = (leftSort.value).concat(mid.concat(rightSort.value));
  return output;
};
