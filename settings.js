Canvas = {
  canvas: document.getElementById("canvas"),
  ctx: canvas.getContext("2d"),
};
canvasInfo = {
  fullWidth: parseInt(Canvas.canvas.getAttribute("width")),
  fullHeight: parseInt(Canvas.canvas.getAttribute("height")),
};
animField = {
  x: 100,
  y: 0,
  width: canvasInfo.fullWidth,
  height: canvasInfo.fullHeight,
};
resultField = {
  x: 100,
  y: canvasInfo.fullHeight / 2 + 10,
  width: canvasInfo.fullWidth - 100,
  height: canvasInfo.fullHeight - canvasInfo.fullHeight / 2 - 10,
};
compareField = {
  x: 100,
  y: 200,
};
infoField = {
  x: 100,
  y: canvasInfo.fullHeight / 2 - 50,
  width: canvasInfo.fullWidth,
  height: 50,
};
leftInfoField = {
  x: 0,
  y: canvasInfo.fullHeight / 2 - 50,
  width: 100,
  height: 50,
};
table_info = {
  maxTableLength: 12,
  tupleHeight: 20,
  tupleMargin: 2,
  tableMargin: 20,
  maxDraw: 20,
  info_lines: 2,
  maxTableWidth: 300,
  maxAttribute:5,
  maxAttrWidth:60,
};
anim_size = {
  columnWidth: 60,
};
anim_position = {
  filter_Symbol: {
    height: 150,
    width: 150
  },
  left_table: {
    x: animField.x,
    y: animField.y +
    table_info.info_lines * (table_info.tupleHeight + table_info.tupleMargin),
  },
  right_table: {
    x: animField.width - table_info.maxTableWidth - 100,
    y: animField.y +
    table_info.info_lines * (table_info.tupleHeight + table_info.tupleMargin),
  },
};

clauses = ["select", "from", "where", "grouping"];
colorSet = ["#FF8888", "#FDFF88", "#88FF88", "#88C1FF", "#A388FF", "#FB88FF"];
chosenColorSet = ["#38A08C", "#9538A0", "#3856A0", "#A04E38", "#A03838"];
group_key_color = ["#88C1FF", "#A388FF", "#FB88FF"];
