import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/utils";
import { setAuthUser } from "@/redux/authSlice";
import { Instagram, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/login", input);

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect( ()=>{
    if(user) navigate("/");
  }, []);

  return (
    <div>
      <div className="w-screen h-screen flex justify-center items-center">
        <form
          onSubmit={loginHandler}
          className="shadow-lg flex flex-col gap-5 p-8"
        >
          <div className="my-4 text-center">
          <Instagram className="mx-auto mb-3 w-12 h-12" />   

            <p className="text-sm">
              Login to see photos & videos from your friends
            </p>
          </div>
          <div>
            <span className="font-bold">Email</span>
            <Input
              type="email"
              className="focus-visible:ring-transparent my-2"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>
          <div>
            <span className="font-bold">Password</span>
            <Input
              type="password"
              className="focus-visible:ring-transparent my-2"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
            />
          </div>
          {
            loading ? (
              <Button>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </Button>
            ) : (
              <Button disabled={loading}>Login</Button>
            )
          }
          <span className="text-center">
            Doesnt have an account?{" "}
            <Link className="text-blue-600" to="/signup">
              Signup
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
