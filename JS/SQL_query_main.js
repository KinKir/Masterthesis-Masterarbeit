/**
 * Calls the functions of SQL process.
 *
 */
/**
 * The structure of SQL query.
 * @typedef {object} query
 * @property {array} from
 * @property {where} where
 * @property {grouping} grouping
 * @property {ordering} ordering
 * @property {select} select
 */
/**
 * The structure of where clause in SQL query.
 * @typedef {array} where
 * @property {String} union the type of this condition, "and" or "or".
 * @property {String} op the operation between two attributes.
 * @property {String} rel1 relation 1.
 * @property {String} rel2 relation 2.
 * @property {String} attr1 attribute of rel1.
 * @property {String} attr2 attribute of rel2.
 */
/**
 * The structure of select clause in SQL query.
 * @typedef {array} select
 * @property {String} rel relation that should be queried.
 * @property {String} attr the attributes that should be selected.
 */
/**
 * The structure of ordering clause in SQL query.
 * @typedef {array} ordering
 * @property {String} rel relation that should be sorted.
 * @property {String} attr the attribute that should be sorted.
 * @property {String} UpDown the ordering should be "DESC" or "ASC".
 */
/**
 * The structure of grouping clause in SQL query.
 * @typedef {array} grouping
 * @property {String} rel relation that should be grouped.
 * @property {String} attr the attribute that should be the group key.
 */
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
 * The namespace that contains all the steps' functions of the SQL process.
 * @namespace SQL_process_fun
 **/
SQL_process_fun = {
  /**
   * @param {Number} i the i-th query in queries.SQL_query.
   * @return {query}
   */
  sqlReader: function(i) {
    return queries.SQL_query[i]
  },
  /**
   * Get the result of from clause.
   * @param {array} tableArr the relations' names that will be queried.
   * @returns {tupleset_basic_array} the selected tables.
   **/
  resFrom: function(tableArr) {
    return from(tableArr);
  },
  /**
   * Get the result of where clause.
   * @param tuplesInput the relation that will be operated.
   * @param sqlReader_where the clause of where in SQL query.
   * @returns {output_of_where}
   **/
  resWhere: function(tuplesInput, sqlReader_where) {
    return where(tuplesInput, sqlReader_where);
  },
  /**
   * Get the result of "group by" clause.
   * @param tuplesInput the relation that will be operated.
   * @param sqlReader_groupby the sentence of "group by" in SQL query.
   * @return {output_of_grouping}
   * It saves the result tuples. In allTuples, it saves the all tuples,
   * because when it execute the functions in select,
   * it needs all the tuples to calculate.
   */
  resGrouping: function(tuplesInput, sqlReader_groupby) {
    return grouping(tuplesInput, sqlReader_groupby);
  },
  /**
   * Get the result of "order by" clause.
   * @param tuplesInput the relation that will be operated.
   * @param sqlReader_orderby the sentence of "order by" in SQL query.
   * @returns {output_of_ordering}
   **/
  resOrdering: function(tuplesInput, sqlReader_orderby) {
    return ordering(tuplesInput, sqlReader_orderby);
  },
  /**
   * Get the result of select clause.
   * @param tuplesInput the relation that will be queried.
   * @param sqlReader_select the query statement of select of SQL query.
   * @returns {tupleset_with_group} the selected columns' set.
   **/
  resSelect: function(tuplesInput, sqlReader_select) {
    return select(tuplesInput, sqlReader_select);
  }
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
/**
 * @param {query} sqlQuery The SQL query.
 * @return {res_SQL}
 */
SQL_process = function(sqlQuery) {
  let res_SQL = {};
  let sqlReader = SQL_process_fun.sqlReader(sqlQuery);
  res_SQL.query = sqlReader;
  let intermediateResult = null;
  if (sqlReader.from) {
    res_SQL.resFrom = SQL_process_fun.resFrom(sqlReader.from);
    intermediateResult = res_SQL.resFrom;
  } else {
    return "Not recognized Query.";
  }
  if (sqlReader.where) {
    res_SQL.resWhere = SQL_process_fun.resWhere(intermediateResult, sqlReader.where);
    intermediateResult = res_SQL.resWhere.result;
  }
  if (sqlReader.grouping) {
    res_SQL.resGrouping = {};
    res_SQL.resGrouping.inputTupleset = null;
    res_SQL.resGrouping.result = null;
    if (intermediateResult instanceof Array) {
      for (let i = 0; i < intermediateResult.length; i++) {
        if (i == 0) {
          res_SQL.resGrouping.inputTupleset =
            JSON.parse(JSON.stringify(intermediateResult[i]));
        } else {
          res_SQL.resGrouping.inputTupleset = join.crossJoin(
            res_SQL.resGrouping.inputTupleset, intermediateResult[i]);
        }
      }
      intermediateResult = res_SQL.resGrouping.inputTupleset;
    }
    res_SQL.resGrouping = SQL_process_fun.resGrouping(intermediateResult, sqlReader.grouping);
    intermediateResult = res_SQL.resGrouping.result;
  }
  if (sqlReader.select) {
    res_SQL.resSelect = {};
    res_SQL.resSelect.inputTupleset = null;
    res_SQL.resSelect.result = null;
    if (intermediateResult instanceof Array) {
      for (let i = 0; i < intermediateResult.length; i++) {
        if (i == 0) {
          res_SQL.resSelect.inputTupleset =
            JSON.parse(JSON.stringify(intermediateResult[i]));
        } else {
          res_SQL.resSelect.inputTupleset = join.crossJoin(
            res_SQL.resSelect.inputTupleset, intermediateResult[i]);
        }
      }
      intermediateResult = res_SQL.resSelect.inputTupleset;
    }
    res_SQL.resSelect.inputTupleset = JSON.parse(JSON.stringify(intermediateResult));
    res_SQL.resSelect.result = SQL_process_fun.resSelect(intermediateResult, sqlReader.select);

    intermediateResult = res_SQL.resSelect.result;
  }
  if (sqlReader.ordering) {
    res_SQL.resOrdering = SQL_process_fun.resOrdering(intermediateResult, sqlReader.ordering);
    intermediateResult = res_SQL.resOrdering;
  }

  return res_SQL;
};
