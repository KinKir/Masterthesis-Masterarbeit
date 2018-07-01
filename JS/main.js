algebra_fun = {
  sqlReader: function(i) {
    return queries.selection[i]
  },
  resFrom: function(tableArr) {
    return from(tableArr);
  },
  resWhere: function(resFrom, sqlReader_where) {
    if(sqlReader_where==null){
      let output={};
      output.result = resFrom[0];
      for(let i=1;i<resFrom.length;i++){
        output.result = join.crossJoin(output.result,resFrom[i]);
      }
      return output;
    }
    return where(resFrom, sqlReader_where);
  },
  resGrouping: function(resWhere_result, sqlReader_groupby) {
    return grouping(resWhere_result, sqlReader_groupby);
  },
  resOrdering: function(resGroupBy_result, sqlReader_orderby) {
    return ordering(resGroupBy_result, sqlReader_orderby);
  },
  resSelection: function(resOrdering, sqlReader_select) {
    return selection(resOrdering,sqlReader_select);
  }
};

algebra_main = function(run,sqlQuery) {
  let resAlgebra = {};
  let sqlReader = algebra_fun.sqlReader(sqlQuery);
  resAlgebra.query = sqlReader;
  resAlgebra.resFrom = algebra_fun.resFrom(sqlReader.from);
  resAlgebra.resWhere = algebra_fun.resWhere(resAlgebra.resFrom, sqlReader.where);
  resAlgebra.resGrouping = algebra_fun.resGrouping(resAlgebra.resWhere.result, sqlReader.grouping);
  resAlgebra.resOrdering = algebra_fun.resOrdering(resAlgebra.resGrouping.result, sqlReader.ordering);
  resAlgebra.resSelection = algebra_fun.resSelection(resAlgebra.resOrdering, sqlReader.select);
  return resAlgebra;
};
