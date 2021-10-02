import style from './myMenu.module.css';
import {useRouter} from "next/router";
import useNotice from "src/store/modules/notice/noticeHook";
import useLogin from "../../store/modules/login/loginHook";

interface IMyMenuProps {
    open : boolean
}

const MyMenu = (props : IMyMenuProps) : JSX.Element => {
    const login = useLogin();
    const router = useRouter();
    const notice = useNotice();

    const handleClickProfile = () => {
        router.push(`/profile/${login.user?.userId}`);
    }

    const handleClickMessage = () => {
        router.push('/message');
    }

    return (
        <div className={props.open ? style.modal_open : style.modal_close}>
            <button className={style.menu_btn} onClick={handleClickProfile}>PROFILE</button>
            <div className={style.menu_btn} onClick={handleClickMessage}>
                <span >MESSAGE</span>
                <span className={style.message_count}>{notice.countNewMessage()}</span>
            </div>
            <button className={style.menu_btn}>로그아웃</button>
        </div>
    );
};

export default MyMenu;
