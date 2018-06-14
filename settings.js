Canvas = {
  canvas: document.getElementById("canvas"),
  ctx: canvas.getContext("2d"),
};
canvasInfo = {
  fullWidth: parseInt(Canvas.canvas.getAttribute("width")),
  fullHeight: parseInt(Canvas.canvas.getAttribute("height")),
};
anim_position = {
  filter_Symbol: {
    height: 150,
    width: 150
  }
};
anim_size = {
  columnWidth: 60,
  maxTableWidth: canvasInfo.fullWidth / 2 - 100,
};
clauses = ["select", "from", "where", "grouping", "ordering"];
colorSet = ["#FF8888", "#FDFF88", "#88FF88", "#88C1FF", "#A388FF", "#FB88FF"];
chosenColorSet = ["#38A08C", "#9538A0", "#3856A0", "#A04E38", "#A03838"];
