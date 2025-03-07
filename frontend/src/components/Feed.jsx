import Posts from "./Posts"

const Feed = () => {
  return (
    <div className="flex flex-col items-center flex-1 my-8 lg:pl-[25%] md:pl-[5%]">
      <Posts />
    </div>
  );
}

export default Feed