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
}
function createElement(x1: number, y1: number, x2: number, y2: number) {
  const roughElement = generator.line(x1, y1, x2, y2);
  return { x1, y1, x2, y2, roughElement };
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [elements, setElements] = useState<ElementType[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number);

    const roughCanvas = rough.canvas(canvas as HTMLCanvasElement);

    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement))
  }, [elements]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { clientX, clientY } = event;
    const element = createElement(clientX, clientY, clientX, clientY);
    setElements((prevState) => [...prevState, element]);
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if(!drawing) return;
    const { clientX, clientY } = event;
    const index = elements.length - 1
    const { x1, y1 } = elements[index];

    const updatedElement = createElement(x1, y1, clientX, clientY);
    const elementsCopy = [...elements];
    elementsCopy[index] = updatedElement;
    setElements(elementsCopy);
    console.log(clientX, clientY);
  }
  const handleMouseUp = () => {
    setDrawing(false);
  }

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}

export default App;
