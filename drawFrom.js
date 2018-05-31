drawFrom=function(tables) {
  /**y must be bigger than 20, else the infos of tables will be drawed out of the board of canvas.**/
  /**1. Draw a DB icon, show the tables are pull out from a DB.**/
  var draw = new Draw();
  var ctx = draw.ctx;
  /**2. Draw the tables.**/
  var i = 0,
    x = 100,
    y = 30,
    width = 300,
    color = colorSet[i],
    colorText = "black",
    flag = true;
  var loop = function(tables,ctx) {
    if (i < tables.length) {
      draw.table(tables[i], x + i * 320, y, width, color, colorText,ctx);
        i++;

        setTimeout(function(){
          loop(tables,ctx);
        },500);


    }
  }

  loop(tables,ctx);
}
