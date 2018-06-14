/*******************************************************************************
 ********* This file contains all functions for writing information    *********
 ********* All the functions are included in one Object DrawInfo().    *********
 ******************************************************************************/
/**
* @constructor DrawInfo
*/
function DrawInfo() {};
DrawInfo.prototype = {
  ctx: canvasInfo.ctx,
  /**
  * Write the text in infoField.
  * @param {String} text The text that should be write.
  */
  write:function(text){
    drawUtil.ctx.clearRect(drawUtil.infoField.x, drawUtil.infoField.y,drawUtil.infoField.width, drawUtil.infoField.height);
    drawUtil.write_text(text, drawUtil.infoField.x, drawUtil.infoField.y + 20, "black", 20);
  },
  /**
  * Write the text in leftInfoField.
  * @param {String} text The text that should be write.
  */
  writeLeft:function(text){
    drawUtil.ctx.clearRect(drawUtil.leftInfoField.x, drawUtil.leftInfoField.y,drawUtil.leftInfoField.width, drawUtil.leftInfoField.height);
    drawUtil.write_text(text, drawUtil.leftInfoField.x, drawUtil.leftInfoField.y + 20, "black", 15);
  },
  /** Clear the information board*/
  clearLeftInfo :function(){
    drawUtil.ctx.clearRect(drawUtil.leftInfoField.x, drawUtil.leftInfoField.y, drawUtil.leftInfoField.width,drawUtil.leftInfoField.height);
  }
};
