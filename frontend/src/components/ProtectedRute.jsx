import { useEffect } from "react";
import { useSelector } from "react-redux";
import {useNavigate} from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRute = ({children}) => {
    const {user} = useSelector((store) => store.auth);
    const navigate = useNavigate();

    useEffect(()=> {
        if(!user) navigate("/login");
    });
  return <>{children}</>
}

export default ProtectedRute