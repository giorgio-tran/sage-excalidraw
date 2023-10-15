import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { Drawable } from "roughjs/bin/core";

const generator = rough.generator();

type ToolType = "line" | "rectangle" | "selection";
type ElementType = {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement?: Drawable;
  offset?: { x: number; y: number };
  shape: ToolType;
};

function createElement(
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  shape: ToolType
) {
  if (shape === "line") {
    const roughElement = generator.line(x1, y1, x2, y2);
    return { id, x1, y1, x2, y2, roughElement, shape };
  }
  if (shape === "rectangle") {
    const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { id, x1, y1, x2, y2, roughElement, shape };
  }
}

const getElementAtPosition = (x: number, y: number, elements: ElementType[]) => {
  return elements.find(element => isWithinElement(x, y, element));

}

/**
 * Gets the existing mouse position, and checks if it is within the drawn element
 * @param x 
 * @param y 
 * @param element 
 * @returns 
 */
const isWithinElement = (x: number, y: number, element: ElementType) => {
  const { x1, x2, y1, y2, shape } = element;
  if (shape === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x < maxX && y >= minY && y < maxY;
  }
  if (shape === "line") {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < 1;
  }
}

/**
 * Distance formula
 * @param a 
 * @param b 
 * @returns 
 */
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => { 
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [action, setAction] = useState("none");
  const [elements, setElements] = useState<ElementType[]>([]);
  const [tool, setToolType] = useState<ToolType | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number);

    const roughCanvas = rough.canvas(canvas as HTMLCanvasElement);

    elements.forEach(({ roughElement }) =>
      roughCanvas.draw(roughElement as Drawable)
    );
  }, [elements]);

  const updateElement = ({id, x1, y1, x2, y2, shape}: ElementType) => {
    console.log(id, x1, y1, x2, y2, shape);
    const updatedElement = createElement(
      id,
      x1,
      y1,
      x2,
      y2,
      shape as ToolType
    );
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement as ElementType;
    setElements(elementsCopy);
    console.log(x2, y2);
  }
  // MOUSE EVENTS
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tool) return;
    const { clientX, clientY } = event;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        // calculate the offset to that drawn elements 0,0 position doesn't jump to mouse
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({...element, offset: { x: offsetX, y: offsetY }});
        setAction("moving");
      }

    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool as ToolType
      );
      setElements((prevState) => [...prevState, element] as ElementType[]);
      setAction("drawing");
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;
    if (action === "none") return;

    if (action === "drawing") {
      // same as id since we only draw one at a time
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];

      updateElement({
        id: index,
        x1: x1,
        y1: y1,
        x2: clientX,
        y2: clientY,
        shape: tool as ToolType
      });
    }

    if (action === "moving") {
      const {id, x1, y1, x2, y2, shape, offset} = selectedElement as ElementType;
      const width = x2 - x1;
      const height = y2 - y1;
      const offsetX = offset?.x ?? 0;
      const offsetY = offset?.y ?? 0;
      const mousePositionX = clientX - offsetX;
      const mousePositionY = clientY - offsetY;
      updateElement({
        id: id,
        x1: mousePositionX,
        y1: mousePositionY,
        x2: mousePositionX + width,
        y2: mousePositionY + height,
        shape: shape as ToolType
      });
    }
  };

  const handleMouseUp = () => {
    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div>
      <div style={{ position: "fixed", padding: "20px" }}>
        <button
          style={{
            backgroundColor: `${tool === "selection" ? "red" : ""}`,
          }}
          onClick={() => setToolType("selection")}
        >
          Selection
        </button>
        <button
          style={{
            backgroundColor: `${tool === "rectangle" ? "red" : ""}`,
          }}
          onClick={() => {
            setToolType("rectangle");
          }}
        >
          Rectangle
        </button>
        <button
          style={{ backgroundColor: `${tool === "line" ? "red" : ""}` }}
          onClick={() => {
            setToolType("line");
          }}
        >
          Line
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}

export default App;
