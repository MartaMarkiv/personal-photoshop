import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "./App.scss";
import { sendEditStabilityRequest } from "./api/requests";
import ImageEditor from "./components/imageEditor/ImageEditor";
import { Button, Flex, notification } from "antd";
import Loader from "./components/spinner/Loader";
import useWidth from "./hooks/useWidth";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [resultIsReady, setResultIsReady] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const resultImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const windowWidth = useWidth();
  const [api, contextHolder] = notification.useNotification();

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

  const checkImageSize = useCallback(() => {
    if (selectedImage && imgRef.current && canvasRef.current) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      canvas.style.width = `${img.width}px`;
      canvas.style.height = `${img.height}px`;
    }
  }, [selectedImage]);

  useEffect(() => {
    checkImageSize();
  }, [windowWidth, checkImageSize]);

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
    if (!selectedImage || !canvasRef.current || !imageFile || processing)
      return;

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
        const errorData = await response.json();
        openNotification(
          errorData.errors[0] ||
            "An unexpected error occurred. Please try again.",
        );
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultIsReady(true);
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    } catch (err) {
      console.error(err);
      openNotification("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const openNotification = (massage: string) => {
    api.open({
      message: "Notification",
      description: massage,
      showProgress: true,
      pauseOnHover: true,
    });
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(fileList[0]);
      setImageFile(fileList[0]);
      setResult(null);
      setResultIsReady(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setImageFile(null);
    setResultIsReady(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <>
      {contextHolder}
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
          <li>
            If you are not satisfied with the result, you can Re-generate it
            again.
          </li>
        </ul>
        <p className="notice-text">
          {" "}
          &#x26A0; Notice: You can send up to 5 edit requests.
        </p>
      </div>
      <div className="image-input-container">
        <input
          type="file"
          title="Upload an image"
          onChange={uploadImage}
          ref={inputRef}
          className="image-input"
          id="imageInput"
          accept="image/*"
        />
        <label htmlFor="imageInput" className="image-input-label">
          + Select image
        </label>
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
        >
          Clear image
        </Button>
        <Button
          onClick={handleEdit}
          disabled={!selectedImage || processing}
          className="edit-button"
        >
          {resultIsReady ? "Regenerate" : "Edit"}
        </Button>
        {processing && <Loader />}
      </Flex>
      {result && (
        <>
          <div className="result-container">
            <h3>Result:</h3>
            <img src={result} ref={resultImgRef} alt="Updated image" />
          </div>
        </>
      )}
    </>
  );
}

export default App;
