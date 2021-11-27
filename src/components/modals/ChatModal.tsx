import style from './chatModal.module.css';
import Chat from "../message/Chat";
import {bodyScrollActionForModal} from "src/utils/scrollUtil";
import {useState} from "react";
import {handleModalSwipeEvent} from "src/utils/clickUtil";

interface IChatModalProps {
    closeModal : () => void
}

const ChatModal = (props : IChatModalProps) : JSX.Element => {
    const [isMobileClose, setIsMobileClose] = useState(false);
    const [slideDiff, setSlideDiff] = useState<number>();

    const onCloseModalByMobile = () => {
        setIsMobileClose(true);
        setTimeout(()=> {
            props.closeModal();
        }, 100)
    }

    bodyScrollActionForModal();
    handleModalSwipeEvent(onCloseModalByMobile,setSlideDiff);

    return (
        <div className={isMobileClose ? style.modal_close : style.modal} style={{left : slideDiff}}>
            <Chat closeModal={onCloseModalByMobile}/>
        </div>
    );
};

export default ChatModal;
