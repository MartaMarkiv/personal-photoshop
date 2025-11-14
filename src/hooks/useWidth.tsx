import { useEffect, useState } from "react"

function useWidth() {
  const [size, setSize] = useState<number>(0);
  useEffect(() => {
    function updateSize() {
      setSize(window.innerWidth);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

export default useWidth;