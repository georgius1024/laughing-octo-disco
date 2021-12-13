export default function ReingoldTilford(nodes, rootId) {
  const step = 2;

  const map = nodes.reduce((map, item) => {
    return { ...map, [item.id]: { ...item } };
  }, {});
  const root = map[rootId];
  const getNode = (id) => {
    return map[id];
  };
  const traverse = (node, callback) => {
    callback(node);
    if (node.left) {
      traverse(getNode(node.left), callback);
    }
    if (node.right) {
      traverse(getNode(node.right), callback);
    }
  };
  const prepareData = (node, level, prevSibling) => {
    node.y = level;
    node.x = 0;
    node.final = 0;
    node.modifier = 0;
    node.prevSibling = prevSibling;
    if (node.left) {
      prepareData(getNode(node.left), level + 1, null);
    }
    if (node.right) {
      prepareData(getNode(node.right), level + 1, node.left || null);
    }
  };

  const firstPass = (node) => {
    if (node.left) {
      firstPass(getNode(node.left));
    }
    if (node.right) {
      firstPass(getNode(node.right));
    }
    if (node.prevSibling) {
      node.x = node.x + getNode(node.prevSibling).x + step;
    } else {
      node.x = 0;
    }
    if (node.left && node.right) {
      node.modifier =
        node.x - (getNode(node.right).x + getNode(node.left).x) / 2;
    } else if (node.left || node.right) {
      node.modifier = node.x;
    }
  };
  const secondPass = (node, modSum) => {
    node.final = node.x + modSum;
    if (node.left) {
      secondPass(getNode(node.left), node.modifier + modSum);
    }
    if (node.right) {
      secondPass(getNode(node.right), node.modifier + modSum);
    }
  };
  const hasConflicts = (node) => {
    const places = {};
    let conflicts = 0;
    traverse(node, (node) => {
      if (!places[node.y]) {
        places[node.y] = {};
      }
      if (places[node.y][node.final]) {
        conflicts++;
      }
      places[node.y][node.final] = 1;
    });
    return conflicts;
  };
  const fixNodeConflicts = (node) => {
    if (node.left) {
      fixNodeConflicts(getNode(node.left));
    }
    if (node.right) {
      fixNodeConflicts(getNode(node.right));
    }

    let leftContour = -Infinity;
    if (node.left) {
      traverse(getNode(node.left), (node) => {
        leftContour = Math.max(leftContour, +node.final);
      });
    }

    let rightContour = +Infinity;
    if (node.right) {
      traverse(getNode(node.right), (node) => {
        rightContour = Math.min(rightContour, +node.final);
      });
    }
    if (leftContour >= rightContour) {
      traverse(
        getNode(node.right),
        (node) => (node.final += leftContour - rightContour + step)
      );
    }
  };
  const fixFinalX = (node) => {
    let leftCorrection = Infinity;
    traverse(
      node,
      (node) => (leftCorrection = Math.min(+node.final, leftCorrection))
    );
    if (leftCorrection < 0) {
      traverse(node, (node) => (node.final -= leftCorrection));
    }
  };
  const placeX = (node) => {
    traverse(node, (node) => (node.x = node.final));
  };
  const centerFinalX = (node) => {
    traverse(node, (node) => {
      if (node.left && node.right) {
        const leftX = map[node.left].final;
        const rightX = map[node.right].final;
        node.final = (leftX + rightX) / 2;
      }
    });
  };

  prepareData(root, 0, null);
  firstPass(root);
  secondPass(root, 0);
  fixFinalX(root);
  if (hasConflicts(root)) {
    fixNodeConflicts(root);
    centerFinalX(root);
  }
  placeX(root);
  return map;
}
