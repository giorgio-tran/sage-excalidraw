import { useEffect, useRef } from "react"

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');

    (ctx as CanvasRenderingContext2D).fillStyle = "green";
    (ctx as CanvasRenderingContext2D).fillRect(10, 10, 150, 100);
    (ctx as CanvasRenderingContext2D).strokeRect(200, 200, 100, 100);

  }, [])
  return (
    <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>
  )
}

export default App
