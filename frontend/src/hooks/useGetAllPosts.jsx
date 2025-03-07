import { axiosInstance } from "@/lib/utils";
import { setPosts } from "@/redux/postSlice.js";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";


const useGetAllPosts = () => {
    const dispatch = useDispatch();

    useEffect(()=> {
        const fetchAllPosts = async () => {
            try {
                const res = await axiosInstance("/post/all")
                if(res.data.success){
                    dispatch(setPosts(res.data.data));
                }
            } catch (error) {
                console.error("Error fetching posts:", error); 
                toast.error(error);
            }
        }
        fetchAllPosts();
    }, [dispatch]);
}

export default useGetAllPosts