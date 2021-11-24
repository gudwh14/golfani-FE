import style from 'src/components/board/main/item/boardListHead.module.css';
import {ITypeProps} from "../BoardMain";
import {useEffect, useState} from "react";
import {EType} from "../../../../domain/board";

const BoardListHead = ({boardType} : ITypeProps) => {
    const [type, setType] = useState('')

    useEffect(()=>{
        if(boardType === EType.FREE)
        {
            setType('자유게시판')
        }
        else if(boardType === EType.TIP) {
            setType('TIP 게시판')
        }
        else if(boardType === EType.TRADE){
            setType('거래게시판')
        }
        else{
            setType('익명게시판')
        }
    },[boardType])

    return (
        <div className={style.container}>
            <span className={style.head_text}>{type}</span>
        </div>
    )
}


export default BoardListHead;