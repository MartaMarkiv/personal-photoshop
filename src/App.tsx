import { useState, type ChangeEvent } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const uploadImeg = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setSelectedImage(fileList[0]);
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
          onChange={uploadImeg}
          accept="image/*"
        />
      </div>
      <div>
        {selectedImage && (
          <img src={URL.createObjectURL(selectedImage)} alt="Image" />
        )}
      </div>
    </>
  );
}

export default App;
