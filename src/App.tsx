import { useEffect, useRef, useState, type ChangeEvent } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (selectedImage && imgRef.current && canvasRef.current) {
      const img = imgRef.current;
      const canvas = canvasRef.current;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      canvas.style.width = `${img.width}px`;
      canvas.style.height = `${img.height}px`;

      ctxRef.current = canvas.getContext("2d");
    }
  }, [selectedImage]);

  const handleMouseDown = () => setDrawing(true);

  const handleMouseUp = () => setDrawing(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleEdit = async () => {
    if (!selectedImage || !canvasRef.current) return;
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(fileList[0]);
    } else {
      setSelectedImage(null);
    }
  };

  return (
    <>
      <h1>Personal photoshop</h1>
      <p>Choose a picture to edit</p>
      <div>
        <input
          type="file"
          title="Browse image"
          placeholder="Upload image"
          onChange={uploadImage}
          accept="image/*"
        />
      </div>
      {selectedImage && (
        <div className="image-edit-container">
          <img
            ref={imgRef}
            src={selectedImage}
            alt="Selected image"
            className="selected-image"
          />
          <canvas
            ref={canvasRef}
            className="masked-image"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
        </div>
      )}
      <div>
        <button onClick={handleEdit} disabled={!selectedImage}>
          Edit
        </button>
      </div>
    </>
  );
}

export default App;
