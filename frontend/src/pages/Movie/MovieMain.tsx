import Navigation from "../mainpage/Navigation";
import { useAppMessages } from "../../hooks/useAppMessages";

const MovieMain = () => {
  const t = useAppMessages().moviePage;

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold">{t.title}</h1>
      </div>
    </>
  );
};

export default MovieMain;
