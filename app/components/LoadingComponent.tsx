import React from "react";
import {Spin} from "antd";

interface Props {
    size?: "small" | "large"
}
const LoadingComponent = ({size = "small"}:Props) => {
    return (
        <div className="w-full h-screen min-w-full min-h-full bg-white flex justify-center items-center">
            <Spin size={size} className="text-gray-900" />
        </div>
    );
};

export default LoadingComponent;
