import style from './alarm.module.css';
import AlarmItem from "./AlarmItem";
import {useInfiniteQuery, useMutation, useQueryClient} from "react-query";
import {getAlarm, setAllAlarmRead} from "src/apis/Alarm";
import {IAlarm} from "src/domain/Alarm";
import {IPages} from "src/domain/Page";
import {useEffect, useRef, useState} from "react";
import {isTodayAlarm} from "src/utils/dateUtil";
import ArrowBackIosNewIcon from '@material-ui/icons/ArrowBackIosNew';
import {bodyScrollActionForModal} from "src/utils/scrollUtil";

interface IAlarmProps {
    setModalOpen : (state : boolean) => void
}

const Alarm = ({setModalOpen} : IAlarmProps) : JSX.Element => {
    const queryClient = useQueryClient();
    const alarmQuery = useInfiniteQuery<IPages<IAlarm>>('alarm',({pageParam = ''})=>getAlarm(pageParam),{
        getNextPageParam : (lastPage) => {
            const currentPage = lastPage.pageable.pageNumber;
            if(currentPage+1 > lastPage.totalPages) {
                return undefined;
            }
            return currentPage+1;
        },
        staleTime : 0,
    });
    const allAlarmMutate = useMutation(()=>setAllAlarmRead());
    const observeRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver>();
    let isShowPrevAlarm = false;
    const [isClose, setIsClose] = useState(false);

    useEffect(()=> {
        observer.current = new IntersectionObserver(intersectionObserver);
        observeRef.current && observer.current?.observe(observeRef.current);
    },[])

    const intersectionObserver = (entries : IntersectionObserverEntry[], io : IntersectionObserver) => {
        entries.forEach(async (entry) => {
            if(entry.isIntersecting) {
                await alarmQuery.fetchNextPage();
            }
        })
    }

    const onCloseModal = () => {
        setIsClose(true);
        setTimeout(()=> {
            setModalOpen(false);
        },500);
    }

    const handleClickAllReadAlarm = async () => {
        try {
            const response = await allAlarmMutate.mutateAsync();
        }
        catch (e) {

        }
        finally {
            await queryClient.invalidateQueries('alarm');
            await queryClient.invalidateQueries('unReadAlarm');
        }
    }

    bodyScrollActionForModal();

    return (
        <div className={isClose ? style.container_close : style.container}>
            <div className={style.title_box}>
                <div className={style.back_icon}>
                    <ArrowBackIosNewIcon onClick={onCloseModal}/>
                </div>
                <span className={style.title_txt}>알림</span>
                <button className={style.allRead_btn} onClick={handleClickAllReadAlarm}>모두읽기</button>
            </div>
            <div className={style.item_box}>
            {alarmQuery.data?.pages.map((page,pageIndex)=> (
                page.content.map((alarm, index)=> {
                    if(!isTodayAlarm(alarm.createdAt) && !isShowPrevAlarm) {
                        isShowPrevAlarm = true;
                        return <span key={'prev'} className={style.activity_txt}>이전활동</span>
                    }
                    return (
                        <div key={alarm.id}>
                            {
                                pageIndex === 0 && index === 0 && isTodayAlarm(alarm.createdAt) &&
                                <span className={style.activity_txt}>오늘</span>
                            }
                            <AlarmItem alarm={alarm}/>
                        </div>
                    )
                })
            ))}
            </div>
            <div ref={observeRef}></div>
        </div>
    );
};

export default Alarm;
