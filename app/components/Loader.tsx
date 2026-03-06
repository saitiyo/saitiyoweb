import React from "react";
import {Spin} from "antd";

interface Props {
    size?: "small" | "large"
}
const Loader = ({size = "small"}:Props) => {
    return (
        <div className="w-full h-full min-w-full min-h-full bg-white flex justify-center items-center">
            <Spin size={size} />
        </div>
    );
};

export default Loader;
