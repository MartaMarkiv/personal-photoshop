import { Flex, Image } from "antd";
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
    <Flex className="image-edit-container" align="start">
      <Flex className="original-image-wrapper" vertical={true}>
        <p>Original image:</p>
        <Image src={imageUrl} className="original-image" />
      </Flex>
      <div className="edit-image-wrapper">
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
    </Flex>
  );
}

export default ImageEditor;
