/**
 * Utilisation for algebra.
 *
 */
/**
 * The columns of table. The structure of all columns everywhere is same.
 * @typedef {array} columns
 * @property {array} columns - Indicates whether the Courage component is present.
 * @property {array} src - Indicates whether the Power component is present.
 */
/**
 * The value of table.
 * @typedef {array} value_basic
 * @property {object} source
 * @property {array} tupleValue
 */
/**
 * The source of tupleValue.
 * @typedef {object} source
 * @property {array} ids
 * @property {array} rels
 */
/**
 * The basical tupleset.
 * @typedef {object} tupleset_basic
 * @property {columns} columns
 * @property {array} name
 * @property {value_basic} value
 */
/**
 * The array of tuplesets.
 * @typedef {array} tupleset_basic_array
 * @property {tupleset_basic} tupleset
 */
/**
 * Utilisation for algebra.
 * @namespace algebraUtil
 */
function algebraUtil() {};
/**
 * Generate a new tuple with the value of value1 and value2.
 * @param value1 one tuple.
 * @param len1 the length of value1.
 * @param value2 the other tuple.
 * @param len2 the length of value2.
 * @returns {value_basic} The joined value of value1 and value2.
 **/
algebraUtil.generateNewValue = function(tuple1, len1, tuple2, len2) {
  var newTuple = this.initValue();
  var tuple = [tuple1, tuple2];
  var len = [len1, len2];
  /** If at least one tuple is empty, generate a new tuple with len[1|2].*/
  for (var i in tuple) {
    if (tuple[i] == null) {
      tuple[i] = this.initValue();
      tuple[i].source.rels = [null];
      tuple[i].source.ids = [null];
      var tmpTupleValue = [];
      tmpTupleValue[0] = [];
      for (var j = 0; j < len[i]; j++) {
        tmpTupleValue[0].push(null);
      }
      tuple[i].tupleValue = tmpTupleValue;
    }
  }
  newTuple.source.rels = tuple[0].source.rels.concat(tuple[1].source.rels);
  newTuple.source.ids = tuple[0].source.ids.concat(tuple[1].source.ids);
  newTuple.tupleValue = tuple[0].tupleValue.concat(tuple[1].tupleValue);
  return newTuple;
};
/**
 * Generate a new relation with empty value.
 * @returns {tupleset_basic}
 **/
algebraUtil.initRelation = function() {
  var tuplesOutput = {};
  tuplesOutput.name = [];
  tuplesOutput.columns = [];
  tuplesOutput.value = [];

  return tuplesOutput;
};
/**
 * Generate a new tuple with empty value.
 * @returns {value_basic}
 **/
algebraUtil.initValue = function() {
  var value = {};
  value.tupleValue = [];
  value.source = {};
  value.source.rels = [];
  value.source.ids = [];
  return value;
};
/**
 * The tupleset with step information.
 * @typedef {array} tupleset_with_step
 * @property {columns} columns
 * @property {array} name
 * @property {value_basic} value
 * @property {step} step
 */
/**
 * Compare two relations by the attributes of condition.
 * @param tuplesInput tuplesets array.
 * @param condition current condition.
 * @param stepNum now is the n-th condition in "where" clause.
 * @returns {tupleset_with_step}
 **/
algebraUtil.unitCompare = function(tuplesInput, condition, stepNum) {
  var tuplesOutput = {};
  var position1 = this.getThePosition(tuplesInput, condition.rel1, condition.attr1);
  var position2 = this.getThePosition(tuplesInput, condition.rel2, condition.attr2);

  if (condition.rel1 != "null" && condition.rel2 != "null") {
    /** both sides are relations. */
    tuplesOutput = join.innerJoin(tuplesInput[position1.arrayPos],
      tuplesInput[position2.arrayPos], condition.attr1, condition.attr2, condition.op);
  } else if ((condition.rel1 == "null" && condition.rel2 != "null") ||
    (condition.rel1 != "null" && condition.rel2 == "null")) {
    /** one is relation, the other is number or word. */
    var relation = null;
    var attr = null;
    /**
     * @param other the other side except the relation.
     * @param rel the flag for relation.
     */
    var other = null;
    var rel = null;

    if (condition.rel1 != "null") {
      relation = condition.rel1;
      attr = condition.attr1;
      other = condition.attr2;
      rel = "rel1";
    }
    if (condition.rel2 != "null") {
      relation = condition.rel2;
      attr = condition.attr2;
      other = condition.attr1;
      rel = "rel2";
    }
    var compare = {
      "rel1": function(rel, other) {
        return where.ops[condition.op](rel, other);
      },
      "rel2": function(rel, other) {
        return where.ops[condition.op](other, rel);
      }
    }
    var position = this.getThePosition(tuplesInput, relation, attr);
    tuplesOutput = this.initRelation();
    tuplesOutput.name = tuplesInput[position.arrayPos].name.slice();
    tuplesOutput.columns = tuplesInput[position.arrayPos].columns.slice();
    for (var i = 0; i < tuplesInput[position.arrayPos].value.length; i++) {
      if (compare[rel](tuplesInput[position.arrayPos].value[i].tupleValue[position.relPos][position.columnPos], other)) {
        tuplesOutput.value.push(tuplesInput[position.arrayPos].value[i]);
      }
    }

  }
  /** add step info into result of every condition. */
  var stepToString = function(condition, i) {
    return {
      "resultFrom": "" + condition.union,
      "stepNumber": i,
      "condition": condition
    }
  };
  tuplesOutput.step = stepToString(condition, stepNum);
  return tuplesOutput;
};

/**
 * The positions.
 * @typedef {object} positions
 * @property {String} arrayPos the position of a tupleset in in a tuplesets array.
 * @property {String} relPos the position of a tupleset in a joined tupleset.
 * @property {String} columnPos position of attribute in a tupleset.
 */
/**
 * Get the position of a tupleset in in a tuplesets array.
 * Get the position of a tupleset in a joined tupleset.
 * Get the position of attribute in a tupleset.
 * @param tuplesInput tuplesets array.
 * @param tableName the name of a relation.
 * @param columnName the name of its attribute.
 * @returns {positions} An object of the positions.
 **/
algebraUtil.getThePosition = function(tuplesInput, tableName, columnName) {
  var output = {};
  if (tuplesInput instanceof(Array)) {
    for (var i = 0; i < tuplesInput.length; i++) {
      for (var j = 0; j < tuplesInput[i].name.length; j++) {
        /**
         * @param i the position in tuplesInput.
         * @param k the order of table.
         * According to i,k, we can find the position of relation.
         * If the tuplesInput has only one table,i.e. one relation.
         * Then the position i of table is 0.the order k of this table is 0.
         */
        if (tuplesInput[i].name[j] == tableName) {
          output.arrayPos = i;
          output.relPos = j;
          for (var k = 0; k < tuplesInput[i].columns[j].columns.length; k++) {
            if (tuplesInput[i].columns[j].columns[k] == columnName) {
              output.columnPos = k;
            }
          }
        }
      }
    }
  } else {
    for (var j = 0; j < tuplesInput.name.length; j++) {
      /**
       * @param i the position in tuplesInput.
       * @param k the order of table.
       * According to i,k, we can find the position of relation.
       * If the tuplesInput has only one table,i.e. one relation.
       * Then the position i of table is 0.the order k of this table is 0.
       */
      if (tuplesInput.name[j] == tableName) {
        output.relPos = j;
        for (var k = 0; k < tuplesInput.columns[j].columns.length; k++) {
          if (tuplesInput.columns[j].columns[k] == columnName) {
            output.columnPos = k;
          }
        }
      }
    }
  }
  return output;
};
/**
 * Get the tuplesets that are contained in tuplesInput, but not contained in usedTuples.
 * @param {tupleset_basic_array} tuplesInput tuplesets array.
 * @param {tupleset_basic_array} usedTuples tuplesets array.
 * @returns {tupleset_basic_array}
 **/
algebraUtil.get_unusedInputs = function(tuplesInput, usedTuples) {
  var notUsedInputs = [];
  var account = 0;
  for (var i = 0; i < tuplesInput.length; i++) {
    for (var j = 0; j < usedTuples.name.length; j++) {
      if (tuplesInput[i].name[0] == usedTuples.name[j]) {
        break;
      } else {
        account++;
      }
    }
    if (account == usedTuples.name.length) {
      notUsedInputs = notUsedInputs.concat(tuplesInput[i]);
    }
    account = 0;
  }
  return notUsedInputs;
};
