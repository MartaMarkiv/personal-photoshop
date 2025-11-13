import { useEffect, useRef, useState, type ChangeEvent } from "react";
import "./App.css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendEditReplicateRequest } from "./api/requests";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (selectedImage && imgRef.current && canvasRef.current) {
      const img = imgRef.current;
      const canvas = canvasRef.current;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      canvas.style.width = `${img.width}px`;
      canvas.style.height = `${img.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctxRef.current = ctx;
    }
  }, [selectedImage]);

  const handleMouseDown = () => setDrawing(true);

  const handleMouseUp = () => setDrawing(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current!.getBoundingClientRect();

    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleEdit = async () => {

    if (!selectedImage || !canvasRef.current || !imageFile) return;
    if(processing) {
      setResult(null);
      setSelectedImage(null);
      return;
    }

    setProcessing(true);

    try {

      const maskBase64 = canvasRef.current.toDataURL("image/png");

      // const response = await sendEditRequest(selectedImage, maskBase64);

      // if (!response.ok) {
      //   console.log(response);
      //   return;
      // }

      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // setResult(url);

      const response = await sendEditReplicateRequest(selectedImage, maskBase64);
      const data = await response.json();
      setResult(data.output?.[0] || "");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(fileList[0]);
      setImageFile(fileList[0]);
      setResult(null);
    } else {
      setSelectedImage(null);
      setImageFile(null);
    }
  };

  return (
    <>
      <h1>Personal photoshop</h1>
      <div className="instructions-container">
      <h3>Follow instructions below:</h3>
      <ul>
        <li>Choose a picture you want to edit.</li>
        <li>Add a mask layer over the area you want to remove from the uploaded picture.</li>
        <li>Press the 'Edit' button to see the result.</li>
      </ul>
      </div>
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
      <div className="edit-btn-wrapper">
        <button onClick={handleEdit} disabled={!selectedImage || processing} className="edit-button">
          Edit
        </button>
      </div>
      {result && (
        <div className="result-container">
          <h3>Result:</h3>
          <img
            src={result}
            alt="result"
            style={{ maxWidth: "100%", borderRadius: "8px" }}
          />
        </div>
      )}
    </>
  );
}

export default App;
