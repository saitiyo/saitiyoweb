import {useEffect} from "react";
import {ToastContainer, toast} from "react-toastify";

type Props = {
    message: string;
    show: boolean;
    isError?: boolean;
    isSuccess?: boolean;
};

const CustomToast = ({message, show = false, isError= false, isSuccess= false}: Props) => {
    useEffect(() => {
        if (show && message) {
            if (isSuccess && !isError) {
                toast.success(message, { autoClose: 3000 });
            } else if (isError && !isSuccess) {
                toast.error(message, { autoClose: 3000 });
            } else {
                toast(message, { autoClose: 3000 });
            }
        }
    }, [message, show, isError, isSuccess]);

    return (
        <ToastContainer
    position="top-center"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    toastStyle={{
        background:
            isError && !isSuccess
                ? "red"
                : isSuccess && !isError
                ? "green"
                : "white",
        color: "white",
    }}
/>
    );
};

export default CustomToast;
