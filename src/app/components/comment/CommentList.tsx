/* eslint-disable */
"use client";

import { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import CommentItem from "./CommentItem";
import style from "./CommentList.module.scss";
import { useParams } from "next/navigation";
import axios from "axios";

export type TComment = {
    commentId?: string;
    profileImage?: string;
    nickName?: string;
    content: string;
    likesCount: number;
    isLiked: boolean;
    parentId?: string;
    childrenCount: number;
}

type TCommentList = {
    parentId?: string;
    isCreateRecomment?: boolean;
    setIsCreateRecomment: React.Dispatch<SetStateAction<boolean>>;
}

const CommentList = ({parentId, isCreateRecomment, setIsCreateRecomment}: TCommentList) => {
    const { planId } = useParams<{ planId: string }>();
    const [comments, setComments] = useState<TComment[]>([]);
    // 현재 페이지 번호
    const [page, setPage] = useState(0);
    // 더 불러올 데이터가 있는지 여부
    const [hasMore, setHasMore] = useState(true);
    // 데이터 로딩 중인지 여부
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [createInputText, setCreateInputText] = useState("");

    // 무한 스크롤 감지를 위한 관찰 대상 요소
    const observerTarget = useRef<HTMLDivElement>(null);

    const thumbnailUrl = undefined;

    const onClickCreateBtn = async () => {
        try {
            let response;

            if(parentId) {
                response = await axios.post(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment`,{
                    content: createInputText,
                    parentId,
                    planId : planId
                })
            }else {
                response = await axios.post(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment`,{
                    content: createInputText,
                    parentId : null,
                    planId : planId
                })
            }
            
            const result = response.data.result;

            const newComment:TComment = {
                commentId: result.commentId,
                content: result.content,
                likesCount: 0,
                isLiked: false,
                childrenCount: 0,
            }

            setComments(prevComments => [newComment, ...prevComments]);
        } catch(e) {
            console.log(e);
        }

        setCreateInputText("");

        if(parentId) {
            setIsCreateRecomment(false);
        }
    }

    const fetchComments = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            let response;
            
            if(!parentId) {
                response = await fetch(`/api/comment/${planId}?page=${page}`);
            }else {
                response = await fetch(`/api/comment/${planId}/${parentId}?page=${page}`);
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            setComments(prevComments => [...prevComments, ...data.result.content]);
            setPage(prevPage => prevPage + 1);
            // API 응답에 'hasMore' 속성이 있다고 가정하고 업데이트합니다.
            if(parseInt(data.result.page, 10) >= parseInt(data.result.totalPages,10) )setHasMore(false);
            if(!parentId){
                setTotalElements(data.result.totalElements);
            }
        } catch (error) {
            console.error("댓글 불러오기 실패:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, parentId]); // page, loading, hasMore이 변경될 때마다 함수를 새로 생성합니다.

    // Intersection Observer를 설정하여 무한 스크롤을 구현합니다.
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            // 관찰 대상이 뷰포트에 들어왔고, 더 불러올 데이터가 있으며, 현재 로딩 중이 아닐 때
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchComments(); // 댓글을 불러옵니다.
            }
        }, {
            threshold: 1.0, // 대상이 100% 보일 때 트리거합니다.
        });

        const currentObserverTarget = observerTarget.current;

        if (currentObserverTarget) {
            observer.observe(currentObserverTarget);
        }

        // 컴포넌트 언마운트 시 옵저버 연결을 해제합니다.
        return () => {
            if (currentObserverTarget) {
                observer.unobserve(currentObserverTarget);
            }
        };
    }, [fetchComments]); // fetchComments, hasMore, loading이 변경될 때마다 이펙트를 다시 실행합니다.

    useEffect(() => {
        console.log(parentId);
        console.log(isCreateRecomment);
        console.log(parentId && isCreateRecomment);
    }, [isCreateRecomment]);
    return (
        <div className={style.comment_list}>
            { !parentId &&
                <>
                    <div className={style.count_wrap}>
                        댓글&nbsp;
                        <span className={style.count}>{totalElements}</span>
                    </div>
                    <div className={style.textarea_wrap}>
                        <span className={style.thumb_wrap}>{thumbnailUrl && <img className={style.img} src="" alt="섬네일 이미지" />}</span>
                        <textarea placeholder={"댓글을 입력하세요"} className={style.textarea} value={createInputText} onChange={(e)=> setCreateInputText(e.target.value)}/>
                        <button type="button" className={style.create_confirm_btn} onClick={onClickCreateBtn}>등록</button>
                    </div>
                </>
            }
            {
                isCreateRecomment && <div className={style.textarea_wrap}>
                <textarea placeholder={"답글을 입력하세요"} className={style.textarea} value={createInputText} onChange={(e)=> setCreateInputText(e.target.value)}/>
                <button type="button" className={style.create_confirm_btn} onClick={onClickCreateBtn}>등록</button>
                </div>
            }
            <ul className={style.list}>
                {
                    comments.map((item) => <CommentItem commentId={item.commentId} profileImage={item.profileImage} nickName={item.nickName} content={item.content} likesCount={item.likesCount} isLiked={item.isLiked} parentId={item.commentId} childrenCount={item.childrenCount} />)
                }
            </ul>
            <div ref={observerTarget} style={{ height: "20px" }}>
                {loading && <p>댓글 더 불러오는 중...</p>}
                {!hasMore && comments.length > 0 && <p>모든 댓글을 불러왔습니다.</p>}
                {!hasMore && comments.length === 0 && !loading && <p>아직 댓글이 없습니다.</p>}
            </div>
        </div>
    )
}

export default CommentList;