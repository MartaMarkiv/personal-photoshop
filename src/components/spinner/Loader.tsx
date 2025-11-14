import { Flex, Spin } from "antd";
import "./style.scss";

function Loader() {
  return (
    <Flex justify="start" align="center" className="loader-container">
      <Spin size="large" />
      <span>Please, wait a moment</span>
    </Flex>
  );
}

export default Loader;
