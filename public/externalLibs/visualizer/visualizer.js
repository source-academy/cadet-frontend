; (function (exports) {
  /**
   * Setup Stage
   */
  const container = document.createElement('div');
  container.id = 'list-visualizer-container';
  container.hidden = true;
  document.body.appendChild(container);

  /**
   *  Converts a list, or a pair, to a tree object. Wrapper function.
   */
  function list_to_tree(lst) {
    // actual function in the wrapper
    function construct_tree(lst) {
      const node = new PairTreeNode();

      // memoise the current sublist
      perms[counter] = lst;
      // assigns an ID to the current node
      node.id = counter;
      counter++;

      const head_node = head(lst);
      const tail_node = tail(lst);

      if (perms.indexOf(head_node) > -1) {
        // tree already built
        node.left = perms.indexOf(head_node);
      } else {
        node.left = is_pair(head_node) ? construct_tree(head_node) :
          is_function(head_node) ? construct_function(head_node) :
            construct_data_node(head_node);
      }

      if (perms.indexOf(tail_node) > -1) {
        // tree already built
        node.right = perms.indexOf(tail_node);
      } else {
        node.right = is_pair(tail_node) ? construct_tree(tail_node) :
          is_function(tail_node) ? construct_function(tail_node) :
            construct_data_node(tail_node);
      }

      return node;
    }

    /** 
     * Returns a new TreeNode that represents a function object instead of a sublist
     */
    function construct_function(fn) {
      const node = new FunctionTreeNode();

      // memoise current function
      perms[counter] = fn;
      node.id = counter;
      counter++;

      return node;
    }

    function construct_data_node(data) {
      const node = new DataTreeNode(data);

      return node;
    }

    // keeps track of all sublists in order to detect cycles
    var perms = [];
    var tree = new Tree();
    var counter = 0;
    tree.rootNode = construct_tree(lst);
    return tree;
  }

  var tcon = {
    strokeWidth: 2,
    stroke: 'white',
    distanceX: 50,
    distanceY: 60,

    boxWidth: 90,
    boxHeight: 30,
    vertBarPos: 0.5,
    boxSpacingX: 50,
    boxSpacingY: 60,

    circleRadius: 12,

    arrowSpace: 5,
    arrowSpaceH: 13, // horizontal
    arrowLength: 8,
    arrowAngle: 0.5236, //25 - 0.4363,//20 - 0.3491,// 30 - 0.5236

    padding: 5,
    canvasWidth: 1000
  };

  function displaySpecialContent(nodeLabel, value) {
    if (typeof display === 'function') {
      display('*' + nodeLabel + ': ' + value);
    } else {
      console.log('*' + nodeLabel + ': ' + value);
    }
  }
  /**
   *  A tree object built based on a list or pair.
   */
  class Tree {
    constructor() {
      this.rootNode = new PairTreeNode();
    }
    /**
     *  Gets the drawer function of a tree
     */
    getDrawer() {
      return new TreeDrawer(this);
    }
  }
  class TreeNode {
    constructor() {
      this.left = null;
      this.right = null;
    }
  }

  class DrawableTreeNode extends TreeNode {
    constructor() {
      super();
    }
  }

  /**
      A node in a binary tree.
      left : pointer to the left subtree
      right: pointer to the right subtree
  */
  class PairTreeNode extends DrawableTreeNode {
    constructor() {
      super();
    }
  }

  class FunctionTreeNode extends DrawableTreeNode {
    constructor() {
      super();
    }
  }

  class DataTreeNode extends TreeNode {
    constructor(data) {
      super();
      this.data = data;
    }
  }

  /**
   *  Drawer function of a tree
   */
  class TreeDrawer {
    constructor(tree) {
      this.tree = tree;
    }
    /**
       *  Draws a tree at x,y on a give layer.
       *  It actually calls drawNode and draws the root at x,y
       */
    draw(x, y, layer) {
      this.drawRoot(this.tree.rootNode, x, y, layer);
    }
    /**
       *  Draws a root node at x, y on a given layer.
       *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
       *  If so, it checks the position of the children and draws an arrow pointing to the children.
       *  Otherwise, recursively draws the children, or a slash in case of empty lists.
       */
    drawRoot(node, x, y, layer) {
      this.drawNode(node, x, y, x, y, layer);
    }

    drawNode(node, x, y, parentX, parentY, layer) {
      if (!(node instanceof DrawableTreeNode)) return;

      // draws the content
      if (node instanceof FunctionTreeNode) {
        realDrawFunctionNode(node.id, x, y, parentX, parentY, layer);
      } else {
        realDrawPairNode(node.left instanceof DataTreeNode ? node.left : null, node.right instanceof DataTreeNode ? node.right : null, node.id, x, y, parentX, parentY, layer);
      }

      // if it has a left new child, draw it
      if (node.left != null) {
        if (node.left instanceof TreeNode) {
          this.drawLeft(node.left, x, y, layer);
        } else {
          // if its left child is part of a cycle and it's been drawn, link back to that node instead
          backwardLeftEdge(x, y, nodelist[node.left].getX(), nodelist[node.left].getY(), layer);
        }
      } else {
        var nullbox = new NodeEmptyHead_list(x, y);
        nullbox.put(layer);
      }

      if (node.right != null) {
        if (node.right instanceof TreeNode) {
          this.drawRight(node.right, x, y, layer);
        } else {
          backwardRightEdge(x, y, nodelist[node.right].getX(), nodelist[node.right].getY(), layer);
        }
      }
    }
    /**
       *  Draws a node at x, y on a given layer, making necessary left shift depending how far the structure of subtree
       *  extends to the right.
       *
       *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
       *  If so, it checks the position of the children and draws an arrow pointing to the children.
       *  Otherwise, recursively draws the children, or a slash in case of empty lists.
       */
    drawLeft(node, parentX, parentY, layer) {
      var count, x, y;
      // checks if it has a right child, how far it extends to the right direction
      if (node.right instanceof DrawableTreeNode) {
        count = 1 + this.shiftScaleCount(node.right);
      } else {
        count = 0;
      }
      // shifts left accordingly
      x = parentX - tcon.distanceX - count * tcon.distanceX;
      y = parentY + tcon.distanceY;

      this.drawNode(node, x, y, parentX, parentY, layer);
    }
    /**
       *  Draws a node at x, y on a given layer, making necessary right shift depending how far the structure of subtree
       *  extends to the left.
       *
       *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
       *  If so, it checks the position of the children and draws an arrow pointing to the children.
       *  Otherwise, recursively draws the children, or a slash in case of empty lists.
       */
    drawRight(node, parentX, parentY, layer) {
      var count, x, y;
      if (node.left instanceof DrawableTreeNode) {
        count = 1 + this.shiftScaleCount(node.left);
      } else {
        count = 0;
      }
      x = parentX + tcon.distanceX + count * tcon.distanceX;
      y = parentY + tcon.distanceY;

      this.drawNode(node, x, y, parentX, parentY, layer);
    }
    /**
       * Returns the distance necessary for the shift of each node, calculated recursively.
       */
    shiftScaleCount(node) {
      var count = 0;
      // if there is something on the left, it needs to be shifted to the right for 1 + how far that right child shifts
      if (node.left instanceof DrawableTreeNode) {
        count = count + 1 + this.shiftScaleCount(node.left);
      }
      // if there is something on the right, it needs to be shifted to the left for 1 + how far that left child shifts
      if (node.right instanceof DrawableTreeNode) {
        count = count + 1 + this.shiftScaleCount(node.right);
      }
      return count;
    }
  }

  // a list of nodes drawn for a tree. Used to check if a node has appeared before.
  var nodelist = [];
  // keeps track the extreme left end of the tree. In units of pixels.
  var minLeft = 500;

  /**
   *  Internal function that puts two data at x1, y1 on a given layer. Connects it to it's parent which is at x2, y2
   */
  function realDrawPairNode(data, data2, id, x1, y1, x2, y2, layer) {
    var box = new NodeBox(data, data2);
    var node = new Kinetic.Group();

    box.put(node);

    // no pointer is drawn to root
    if (x2 !== x1) {
      box.connectTo(x2 - x1, y2 - y1);
    }

    node.setX(x1);
    node.setY(y1);
    layer.add(node);

    // add node to the known list
    nodelist[id] = node;
    // update left extreme of the tree
    minLeft = Math.min(minLeft, x1);
  }

  function realDrawFunctionNode(id, x1, y1, x2, y2, layer) {
    var circle = new NodeCircles();
    var node = new Kinetic.Group();

    circle.put(node);

    if (x2 !== x1) {
      circle.connectTo(x2 - x1, y2 - y1);
    }

    node.setX(x1);
    node.setY(y1);
    layer.add(node);

    // add node to the known list
    nodelist[id] = node;
    // update left extreme of the tree
    minLeft = Math.min(minLeft, x1);
  }

  /**
   *   Draws a tree object on the canvas at x,y on a given layer
   */
  function drawTree(tree, x, y, layer) {
    var drawer = tree.getDrawer();
    drawer.draw(x, y, layer);

    layer.draw();
  }

  /**
   *  Try to fit any data into the box. If not possible, assign a number and log it in the console.
   */
  function toText(data, full) {
    if (full) {
      return '' + data;
    } else {
      var type = typeof data;
      if (type === 'function' || type === 'object') {
        return false;
      } else if (type === "string") {
        var str = '' + data;
        if (str.length > 5) {
          return false;
        } else {
          return '"' + str + '"';
        }
      } else {
        return '' + data;
      }
    }
  }

  /**
   *  Creates a Kinetic.Group that is used to represent a node in a tree. It takes up to two data items.
   *  The data items are simply converted with toString()
   */
  class NodeBox {
    constructor(leftNode, rightNode) {
      // this.image is the inner content
      this.image = new Kinetic.Group();

      // outer rectangle
      const rect = new Kinetic.Rect({
        width: tcon.boxWidth,
        height: tcon.boxHeight,
        strokeWidth: tcon.strokeWidth,
        stroke: 'white',
        fill: '#17181A',
      });

      // vertical bar seen in the box
      const line = new Kinetic.Line({
        points: [tcon.boxWidth * tcon.vertBarPos, 0, tcon.boxWidth * tcon.vertBarPos, tcon.boxHeight],
        strokeWidth: tcon.strokeWidth,
        stroke: 'white',
      });

      this.image.add(rect);
      this.image.add(line);

      if (leftNode instanceof DataTreeNode) {
        const leftValue = leftNode.data;
        if (!is_list(leftValue)) {
          const txtValue = toText(leftValue);
          const label = false;
          if (txtValue === false) {
            label = true;
            nodeLabel++;
            displaySpecialContent(nodeLabel, leftValue);
          }
          var txt = new Kinetic.Text({
            text: label ? '*' + nodeLabel : txtValue,
            align: 'center',
            width: tcon.vertBarPos * tcon.boxWidth,
            y: Math.floor((tcon.boxHeight - 1.2 * 12) / 2),
            fontStyle: label ? 'italic' : 'normal',
            fill: 'white'
          });
          this.image.add(txt);
        } else if (is_null(leftValue)) {
          var empty = new NodeEmpty_list(-tcon.boxWidth * tcon.vertBarPos, 0);
          var emptyBox = empty.getRaw();
          this.image.add(emptyBox);
        }
      }

      if (rightNode instanceof DataTreeNode) {
        const rightValue = rightNode.data;
        if (!is_list(rightValue)) {
          const txtValue = toText(rightValue);
          const label = false;
          if (txtValue === false) {
            label = true;
            nodeLabel++;
            displaySpecialContent(nodeLabel, rightValue);
          }
          var txt2 = new Kinetic.Text({
            text: label ? '*' + nodeLabel : txtValue,
            align: 'center',
            width: tcon.vertBarPos * tcon.boxWidth,
            x: tcon.vertBarPos * tcon.boxWidth,
            y: Math.floor((tcon.boxHeight - 1.2 * 12) / 2),
            fontStyle: label ? 'italic' : 'normal',
            fill: 'white'
          });
          this.image.add(txt2);
        } else if (is_null(rightValue)) {
          const emptyBox = new NodeEmpty_list(0, 0).getRaw();
          this.image.add(emptyBox);
        }
      }

    }
    /**
       *  Connects a NodeBox to its parent at x,y by using line segments with arrow head
       */
    connectTo(x, y) {
      // starting point
      var start = { x: tcon.boxWidth / 4, y: -tcon.arrowSpace };

      // end point
      if (x > 0) {
        var end = { x: x + tcon.boxWidth / 4, y: y + tcon.boxHeight / 2 };
      } else {
        var end = { x: x + tcon.boxWidth * 3 / 4, y: y + tcon.boxHeight / 2 };
      }

      var pointer = new Kinetic.Line({
        points: [start, end],
        strokeWidth: tcon.strokeWidth,
        stroke: 'white'
      });
      // the angle of the incoming arrow
      var angle = Math.atan((end.y - start.y) / (end.x - start.x));

      // left and right part of an arrow head, rotated to the calculated angle
      if (x > 0) {
        var left = {
          x: start.x + Math.cos(angle + tcon.arrowAngle) * tcon.arrowLength,
          y: start.y + Math.sin(angle + tcon.arrowAngle) * tcon.arrowLength
        };
        var right = {
          x: start.x + Math.cos(angle - tcon.arrowAngle) * tcon.arrowLength,
          y: start.y + Math.sin(angle - tcon.arrowAngle) * tcon.arrowLength
        };
      } else {
        var left = {
          x: start.x - Math.cos(angle + tcon.arrowAngle) * tcon.arrowLength,
          y: start.y - Math.sin(angle + tcon.arrowAngle) * tcon.arrowLength
        };
        var right = {
          x: start.x - Math.cos(angle - tcon.arrowAngle) * tcon.arrowLength,
          y: start.y - Math.sin(angle - tcon.arrowAngle) * tcon.arrowLength
        };
      }

      var arrow = new Kinetic.Line({
        points: [left, start, right],
        strokeWidth: tcon.strokeWidth,
        stroke: 'white'
      });

      this.image.getParent().add(pointer);
      this.image.getParent().add(arrow);
    }
    /**
       *  equivalent to container.add(this.image)
       */
    put(container) {
      container.add(this.image);
    }
  }

  /**
  *  Creates a Kinetic.Group used to represent a function object. Similar to NodeBox().
  */
  class NodeCircles {
    constructor() {
      this.image = new Kinetic.Group();

      var leftCircle = new Kinetic.Circle({
        radius: 15,
        strokeWidth: tcon.strokeWidth,
        stroke: 'white',
        x: tcon.boxWidth / 2 - 20,
        y: tcon.boxHeight / 2
      });

      var rightCircle = new Kinetic.Circle({
        radius: 15,
        strokeWidth: tcon.strokeWidth,
        stroke: 'white',
        x: tcon.boxWidth / 2 + 10,
        y: tcon.boxHeight / 2
      });

      var leftDot = new Kinetic.Circle({
        radius: 4,
        strokeWidth: tcon.strokeWidth,
        stroke: 'white',
        fill: 'white',
        x: tcon.boxWidth / 2 - 20,
        y: tcon.boxHeight / 2
      });

      var rightDot = new Kinetic.Circle({
        radius: 4,
        strokeWidth: tcon.strokeWidth,
        stroke: 'white',
        fill: 'white',
        x: tcon.boxWidth / 2 + 10,
        y: tcon.boxHeight / 2
      });

      this.image.add(leftCircle);
      this.image.add(rightCircle);
      this.image.add(leftDot);
      this.image.add(rightDot);
    }
    connectTo(x, y) {
      // starting point
      var start = { x: tcon.boxWidth / 4, y: -tcon.arrowSpace };

      // end point
      if (x > 0) {
        var end = { x: x + tcon.boxWidth / 4, y: y + tcon.boxHeight / 2 };
      } else {
        var end = { x: x + tcon.boxWidth * 3 / 4, y: y + tcon.boxHeight / 2 };
      }

      var pointer = new Kinetic.Line({
        points: [start, end],
        strokeWidth: tcon.strokeWidth,
        stroke: 'white'
      });
      // the angle of the incoming arrow
      var angle = Math.atan((end.y - start.y) / (end.x - start.x));

      // left and right part of an arrow head, rotated to the calculated angle
      if (x > 0) {
        var left = {
          x: start.x + Math.cos(angle + tcon.arrowAngle) * tcon.arrowLength,
          y: start.y + Math.sin(angle + tcon.arrowAngle) * tcon.arrowLength
        };
        var right = {
          x: start.x + Math.cos(angle - tcon.arrowAngle) * tcon.arrowLength,
          y: start.y + Math.sin(angle - tcon.arrowAngle) * tcon.arrowLength
        };
      } else {
        var left = {
          x: start.x - Math.cos(angle + tcon.arrowAngle) * tcon.arrowLength,
          y: start.y - Math.sin(angle + tcon.arrowAngle) * tcon.arrowLength
        };
        var right = {
          x: start.x - Math.cos(angle - tcon.arrowAngle) * tcon.arrowLength,
          y: start.y - Math.sin(angle - tcon.arrowAngle) * tcon.arrowLength
        };
      }

      var arrow = new Kinetic.Line({
        points: [left, start, right],
        strokeWidth: tcon.strokeWidth,
        stroke: 'white'
      });

      this.image.getParent().add(pointer);
      this.image.getParent().add(arrow);
    }
    put(container) {
      container.add(this.image);
    }
  }

  /**
   *  Connects a box to a previously known box, the arrow path is more complicated.
   *  After coming out of the starting box, it moves to the left or the right for a short distance,
   *  Then goes to the correct y-value and turns to reach the top of the end box.
   *  It then directly points to the end box. All turnings are 90 degress.
   */
  function backwardLeftEdge(x1, y1, x2, y2, layer) {
    // coordinates of all the turning points, execpt the first segment in the path
    if (x1 > x2 && y1 >= (y2 - tcon.boxHeight - 1)) {
      // lower right to upper left
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 - tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 - tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    } else if (x1 <= x2 && y1 >= (y2 - tcon.boxHeight - 1)) {
      // lower left to upper right
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 - tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 - tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    } else if (x1 > x2) {
      // upper right to lower left
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    } else {
      // upper left to lower right
      var path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    }
    var endX = path[path.length - 2];
    var endY = path[path.length - 1];
    var arrowPath = [
      endX - Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endX,
      endY,
      endX + Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength
    ];
    // pointy arrow
    var arrow = new Kinetic.Line({
      points: arrowPath,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    });

    // first segment of the path
    var pointerHead = new Kinetic.Line({
      points: [
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxHeight / 2,
        x1 + tcon.boxWidth / 4,
        y1 + tcon.boxSpacingY * 3 / 4
      ],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    });

    // following segments of the path
    var pointer = new Kinetic.Line({
      points: path,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    });
    layer.add(pointerHead);
    layer.add(pointer);
    layer.add(arrow);
    // since arrow path is complicated, move to bottom in case it covers some other box
    pointer.moveToBottom();
  }

  /**
   *  Same as backwardLeftEdge
   */
  function backwardRightEdge(x1, y1, x2, y2, layer) {
    if (x1 > x2 && y1 > (y2 - tcon.boxHeight - 1)) {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    } else if (x1 <= x2 && y1 > (y2 - tcon.boxHeight - 1)) {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x2 + tcon.boxWidth + tcon.boxSpacingX / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    } else if (x1 > x2) {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth * 3 / 4,
        y2 - tcon.boxSpacingY * 3 / 8 + 7,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8 + 7,
        x2 + tcon.boxWidth / 4 + tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    } else {
      var path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4,
        x1 + tcon.boxWidth * 3 / 4,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.boxSpacingY * 3 / 8,
        x2 + tcon.boxWidth / 4 - tcon.arrowSpaceH,
        y2 - tcon.arrowSpace
      ];
    }
    var endX = path[path.length - 2];
    var endY = path[path.length - 1];
    var arrowPath = [
      endX - Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endX,
      endY,
      endX + Math.cos(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength,
      endY - Math.sin(Math.PI / 2 - tcon.arrowAngle) * tcon.arrowLength
    ];
    var arrow = new Kinetic.Line({
      points: arrowPath,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    });
    var pointerHead = new Kinetic.Line({
      points: [
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxHeight / 2,
        x1 + tcon.boxWidth * 3 / 4,
        y1 + tcon.boxSpacingY * 3 / 4
      ],
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    });
    var pointer = new Kinetic.Line({
      points: path,
      strokeWidth: tcon.strokeWidth,
      stroke: 'white'
    });
    layer.add(pointerHead);
    layer.add(pointer);
    layer.add(arrow);
    pointer.moveToBottom();
  }

  /**
   *  Complements a NodeBox when the tail is an empty box.
   */
  class NodeEmpty_list {
    constructor(x, y) {
      var null_box = new Kinetic.Line({
        x: x,
        y: y,
        points: [
          tcon.boxWidth * tcon.vertBarPos,
          tcon.boxHeight,
          tcon.boxWidth * tcon.vertBarPos,
          0,
          tcon.boxWidth,
          0,
          tcon.boxWidth * tcon.vertBarPos,
          tcon.boxHeight,
          tcon.boxWidth,
          tcon.boxHeight,
          tcon.boxWidth,
          0
        ],
        strokeWidth: tcon.strokeWidth - 1,
        stroke: 'white'
      });
      this.image = null_box;
    }
    /**
       *  Adds it to a container
       */
    put(container) {
      container.add(this.image);
    }
    getRaw() {
      return this.image;
    }
  }

  /**
   *  Complements a NodeBox when the head is an empty box.
   */
  class NodeEmptyHead_list {
    constructor(x, y) {
      var null_box = new Kinetic.Line({
        x: x - tcon.boxWidth / 2,
        y: y,
        points: [
          tcon.boxWidth * tcon.vertBarPos,
          tcon.boxHeight,
          tcon.boxWidth * tcon.vertBarPos,
          0,
          tcon.boxWidth,
          0,
          tcon.boxWidth * tcon.vertBarPos,
          tcon.boxHeight,
          tcon.boxWidth,
          tcon.boxHeight,
          tcon.boxWidth,
          0
        ],
        strokeWidth: tcon.strokeWidth - 1,
        stroke: 'white'
      });
      this.image = null_box;
    }
    /**
       *  Adds it to a container
       */
    put(container) {
      container.add(this.image);
    }
    getRaw() {
      return this.image;
    }
  }

  // A list of layers drawn, used for history
  var layerList = [];
  // ID of the current layer shown. Avoid changing this value externally as layer is not updated.
  var currentListVisualizer = -1;
  // label numbers when the data cannot be fit into the box
  var nodeLabel = 0;
  /**
   *  For student use. Draws a list by converting it into a tree object, attempts to draw on the canvas,
   *  Then shift it to the left end.
   */
  function draw(xs) {
    // Hides the default text
    (document.getElementById('data-visualizer-default-text')).hidden = true;

    // Blink icon
    const icon = document.getElementById('data_visualiser-icon');

    if (icon) {
      icon.classList.add('side-content-tab-alert');
    }

    /**
     * Create kinetic stage according to calculated width and height of drawing.
     * Theoretically, as each box is 90px wide and successive boxes overlap by half,
     * the width of the drawing should be roughly (width * 45), with a similar calculation
     * for height.
     * In practice, likely due to browser auto-scaling, for large drawings this results in
     * some of the drawing being cut off. Hence the width and height formulas used are approximations.
     */
    let stage = new Kinetic.Stage({
      width: findListWidth(xs) * 60 + 60,
      height: findListHeight(xs) * 60 + 100,
      container: 'list-visualizer-container'
    });
    minLeft = 500;
    nodelist = [];
    fnNodeList = [];
    nodeLabel = 0;
    // hides all other layers
    for (var i = 0; i < layerList.length; i++) {
      layerList[i].hide();
    }
    // creates a new layer and add to the stage
    var layer = new Kinetic.Layer();
    stage.add(layer);
    layerList.push(layer);

    if (!is_pair(xs) && !is_function(xs)) {
      if (is_null(xs)) {
        var display = "null";
      } else {
        var display = toText(xs, true);
      }
      var txt = new Kinetic.Text({
        text: display,
        align: 'center',
        x: 500,
        y: 50,
        fontStyle: 'normal',
        fontSize: 20,
        fill: 'white'
      });
      layer.add(txt);
    } else if (is_function(xs)) {
      // Draw a single function object
      realDrawFunctionNode(0, 50, 50, 50, 50, layer);
    } else {
      // attempts to draw the tree
      drawTree(list_to_tree(xs), 500, 50, layer);
    }

    // adjust the position
    layer.setOffset(minLeft - 20, 0);
    layer.draw();

    // update current ID
    currentListVisualizer = layerList.length - 1;
  }
  exports.draw = draw;

  /**
   *  Shows the layer with a given ID while hiding the others.
   */
  function showListVisualizer(id) {
    for (var i = 0; i < layerList.length; i++) {
      layerList[i].hide();
    }
    if (layerList[id]) {
      layerList[id].show();
      currentListVisualizer = id;
    }
  }

  function clearListVisualizer() {
    currentListVisualizer = -1;
    for (var i = 0; i < layerList.length; i++) {
      layerList[i].hide();
    }
    layerList = [];
  }

  function is_function(data) {
    return typeof (data) == "function";
  }

  /**
   * Find the height of a drawing (in number of "rows" of pairs)
   */
  function findListHeight(xs) {
    // Store pairs/arrays that were traversed previously so as to not double-count their height.
    const existing = [];

    function helper(xs) {
      if ((!is_pair(xs) && !is_function(xs)) || is_null(xs)) {
        return 0;
      } else {
        let leftHeight;
        let rightHeight;
        if (existing.includes(xs[0])
          || (!is_pair(xs[0]) && !is_function(xs[0]))) {
          leftHeight = 0;
        } else {
          existing.push(xs[0]);
          leftHeight = helper(xs[0]);
        }
        if (existing.includes(xs[1])
          || (!is_pair(xs[1]) && !is_function(xs[1]))) {
          rightHeight = 0;
        } else {
          existing.push(xs[1]);
          rightHeight = helper(xs[1]);
        }
        return leftHeight > rightHeight
          ? 1 + leftHeight
          : 1 + rightHeight;
      }
    }

    return helper(xs);
  }

  /**
   * Find the width of a drawing (in number of "columns" of pairs)
   */
  function findListWidth(xs) {
    const existing = [];

    function helper(xs) {
      if ((!is_pair(xs) && !is_function(xs)) || is_null(xs)) {
        return 0;
      } else {
        let leftWidth;
        let rightWidth;
        if (existing.includes(xs[0])
          || (!is_pair(xs[0]) && !is_function(xs[0]))) {
          leftWidth = 0;
        } else {
          existing.push(xs[0]);
          leftWidth = helper(xs[0]);
        }
        if (existing.includes(xs[1])
          || (!is_pair(xs[1]) && !is_function(xs[1]))) {
          rightWidth = 0;
        } else {
          existing.push(xs[1]);
          rightWidth = helper(xs[1]);
        }
        return leftWidth + rightWidth + 1;
      }
    }

    return helper(xs);
  }

  exports.ListVisualizer = {
    draw: draw,
    clear: clearListVisualizer,
    init: function (parent) {
      container.hidden = false;
      parent.appendChild(container);
    },
    next: function () {
      if (currentListVisualizer > 0) {
        currentListVisualizer--;
      }
      showListVisualizer(currentListVisualizer);
    },
    previous: function () {
      if (currentListVisualizer > 0) {
        currentListVisualizer--;
      }
      showListVisualizer(currentListVisualizer);
    }
  };

  setTimeout(() => { }, 1000);
})(window);
