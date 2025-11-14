import { useEffect, useRef, useState, type ChangeEvent } from "react";
import "./App.scss";
import { sendEditStabilityRequest } from "./api/requests";
import ImageEditor from "./components/imageEditor/ImageEditor";
import { Button, Flex } from "antd";
import Loader from "./components/spinner/Loader";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (selectedImage && imgRef.current && canvasRef.current) {
      console.log("In use effect");
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

    if (processing) {
      setResult(null);
      setSelectedImage(null);
      return;
    }

    setProcessing(true);

    try {
      const maskBlob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((blob) => resolve(blob!), "image/png"),
      );

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("mask", maskBlob, "mask.png");
      formData.append(
        "prompt",
        "Remove unwanted object and fill background naturally",
      );

      const response = await sendEditStabilityRequest(formData);

      if (response.status !== 200) {
        console.error(await response.text());
        alert("Error from Stability API");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    console.log(fileList);
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

  const handleClearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setImageFile(null);
    if(inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <>
      <h1>Personal photoshop</h1>
      <div className="instructions-container">
        <h3>Follow instructions below:</h3>
        <ul>
          <li>Choose a picture you want to edit.</li>
          <li>
            Add a mask layer over the area you want to remove from the uploaded
            picture.
          </li>
          <li>Press the 'Edit' button to see the result.</li>
        </ul>
      </div>
      <div className="image-input-container">
      <input type="file" title="Upload an image"
          onChange={uploadImage}
          ref={inputRef}
          className="image-input"
          id="imageInput"
          accept="image/*" />
          <label htmlFor="imageInput" className="image-input-label">+ Select image</label>
      </div>
      {selectedImage && (
        <ImageEditor
          imageRef={imgRef}
          imageUrl={selectedImage}
          maskRef={canvasRef}
          mouseDown={handleMouseDown}
          mouseMove={handleMouseMove}
          mouseUp={handleMouseUp}
        />
      )}
      <Flex className="edit-btn-wrapper" align="center" justify="start">
        <Button
          onClick={handleClearImage}
          disabled={!selectedImage || processing}
          className="edit-button clear-button"
        >
          Clear image
        </Button>
        <Button
          onClick={handleEdit}
          disabled={!selectedImage || processing}
          className="edit-button"
        >
          Edit
        </Button>
        {
          processing && <Loader />
        }
      </Flex>
      {result && (
        <div className="result-container">
          <h3>Result:</h3>
          <img src={result} alt="Updated image" />
        </div>
      )}
    </>
  );
}

export default App;
