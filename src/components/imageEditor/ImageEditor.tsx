import "./style.scss";

type ImageEditorProps = {
  imageUrl: string;
  imageRef: React.RefObject<HTMLImageElement | null>;
  maskRef: React.RefObject<HTMLCanvasElement | null>;
  mouseUp: () => void;
  mouseDown: () => void;
  mouseMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
};

function ImageEditor({
  imageUrl,
  imageRef,
  maskRef,
  mouseDown,
  mouseMove,
  mouseUp,
}: ImageEditorProps) {
  return (
    <div className="image-edit-container">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Selected image"
        className="selected-image"
      />
      <canvas
        ref={maskRef}
        className="masked-image"
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onMouseMove={mouseMove}
      />
    </div>
  );
}

export default ImageEditor;
