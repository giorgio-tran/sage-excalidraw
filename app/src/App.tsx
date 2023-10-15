import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { Drawable } from "roughjs/bin/core";

const generator = rough.generator();

type ElementType = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: Drawable;
  shape: "line" | "rectangle";
};

function createElement(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  shape: "line" | "rectangle"
) {
  if (shape === "line") {
    const roughElement = generator.line(x1, y1, x2, y2);
    return { x1, y1, x2, y2, roughElement, shape };
  }
  if (shape === "rectangle") {
    const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { x1, y1, x2, y2, roughElement, shape };
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [elements, setElements] = useState<ElementType[]>([]);
  const [elementType, setElementType] = useState<"line" | "rectangle" | null>(
    null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number);

    const roughCanvas = rough.canvas(canvas as HTMLCanvasElement);

    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
  }, [elements]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!elementType) return;
    setDrawing(true);
    const { clientX, clientY } = event;
    const element = createElement(
      clientX,
      clientY,
      clientX,
      clientY,
      elementType as "line" | "rectangle"
    );
    setElements((prevState) => [...prevState, element] as ElementType[]);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const { clientX, clientY } = event;
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];

    const updatedElement = createElement(
      x1,
      y1,
      clientX,
      clientY,
      elementType as "line" | "rectangle"
    );
    const elementsCopy = [...elements];
    elementsCopy[index] = updatedElement as ElementType;
    setElements(elementsCopy);
    console.log(clientX, clientY);
  };
  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
    <div>
      <div style={{ position: "fixed", padding: "20px" }}>
        <button
          style={{
            backgroundColor: `${elementType === "rectangle" ? "red" : ""}`,
          }}
          onClick={() => {
            setElementType("rectangle");
          }}
        >
          Rectangle
        </button>
        <button
          style={{ backgroundColor: `${elementType === "line" ? "red" : ""}` }}
          onClick={() => {
            setElementType("line");
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
