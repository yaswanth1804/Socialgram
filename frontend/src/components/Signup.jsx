import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/utils";
import { Instagram, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/register", input);

      console.log("res", res);
      if (res.data.success) {
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
        });
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      //toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, []);

  return (
    <div>
      <div className="w-screen h-screen flex justify-center items-center">
        <form
          onSubmit={signupHandler}
          className="shadow-lg flex flex-col gap-5 p-8"
        >
          <div className="my-4 text-center">
            <Instagram className="mx-auto mb-3 w-12 h-12" />

            <p className="text-sm">
              Signup to see photos & videos from your friends
            </p>
          </div>
          <div>
            <span className="font-bold">Username</span>
            <Input
              type="text"
              className="focus-visible:ring-transparent my-2"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
            />
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
          {loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </Button>
          ) : (
            <Button disabled={loading}>Signup</Button>
          )}
          <span className="text-center">
            Already have an account?{" "}
            <Link className="text-blue-600" to="/login">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
