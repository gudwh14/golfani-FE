import style from './messageSendModal.module.css';
import {getProfileImage, IMember} from "src/apis/Member";
import {ChangeEvent, useRef, useState} from "react";
import {getCookie} from "src/utils/cookieUtil";
import {createChatRoom, getChatRoomIdByUser, sendChatBySocket} from "src/apis/Chat";
import {useRouter} from "next/router";
import {subChatChannel} from "src/socket/socket";
import {useQueryClient} from "react-query";

interface IMessageSendProps {
    member: IMember
    setModalOpen: (state: boolean) => void
}

const MessageSendModal = ({member, setModalOpen}: IMessageSendProps): JSX.Element => {
    const userId = getCookie('userId');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [chatText, setChatText] = useState("");
    const router = useRouter();
    const queryClient = useQueryClient();

    const onModalClose = () => {
        setModalOpen(false);
    }

    const handleResizeHeight = () => {
        if (window.innerWidth > 480) {
            if (textAreaRef.current) {
                textAreaRef.current.style.height = '200px';
                textAreaRef.current.style.height = textAreaRef.current?.scrollHeight + "px";
            }
        }
    }

    const handleChangeTextArea = (event: ChangeEvent) => {
        const input = event.target as HTMLTextAreaElement;
        setChatText(input.value);
        handleResizeHeight();
    }

    const getChatRoomId = async () => {
        try {
            const roomId = await getChatRoomIdByUser(member.userId);
            return roomId;
        } catch (e) {
            if (e.response.status === 404) {
                const roomId = await createChatRoom(member.userId);
                return roomId;
            }
        }
    }


    const sendMessage = async () => {
        try {
            const roomId = await getChatRoomId();
            await router.push(`/message/${roomId}`);
            const callback = async () => {
                await queryClient.invalidateQueries(['chatMessage', roomId]);
            }
            await subChatChannel(roomId, callback);
            await sendChatBySocket(roomId, member.userId, chatText);
            await onModalClose();
        } catch (e) {
            console.log(e);
        }
    }

    const handleClickSendButton = async () => {
        if (chatText.replace(/\s/g, '').length) {
            await sendMessage();
        }
    }


    return (
        <div className={style.modal}>
            <div className={style.container}>
                <div className={style.title_box}>
                    <span className={style.title_btn} onClick={onModalClose}>취소</span>
                    <span className={style.title_txt}>메세지</span>
                    <span className={style.title_btn} onClick={handleClickSendButton}>전송</span>
                </div>
                <div className={style.main_box}>
                    <div className={style.user_box}>
                        <img className={style.img} src={getProfileImage(userId, 'MID')} width={30} height={30}/>
                        <span className={style.user_txt}>{userId}</span>
                    </div>
                    <textarea className={style.msg_input}
                              ref={textAreaRef}
                              value={chatText}
                              onChange={handleChangeTextArea}
                              placeholder={"메세지를 입력하세요"}
                              autoFocus={true}
                    />
                    <div className={style.send_box}>
                        <img className={style.img} src={getProfileImage(member.userId, 'MID')} width={30} height={30}/>
                        <span className={style.receiver_user}>{`${member.userId}`}</span>
                    </div>
                </div>
                <div className={style.button_box}>
                    <button className={style.button} onClick={onModalClose}>취소</button>
                    <button className={style.button} onClick={handleClickSendButton}>전송</button>
                </div>
            </div>
        </div>
    );
};

export default MessageSendModal;
